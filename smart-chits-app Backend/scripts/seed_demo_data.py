import sys
from pathlib import Path
from datetime import datetime, timedelta

# Ensure the backend package root is on the Python path when running this script
sys.path.append(str(Path(__file__).resolve().parents[1]))

from sqlalchemy import text
from app.db.database import engine, SessionLocal
from app.db.base import Base
from app.utils.hashing import hash_password
from app.models.user_model import User
from app.models.organization_model import Organization
from app.models.branch_model import Branch
from app.models.chit_model import Chit
from app.models.member_model import Member
from app.models.payment_model import Payment
from app.models.auction_model import Auction
from app.models.auction_bid_model import AuctionBid
from app.models.audit_log_model import AuditLog


def get_or_create(query_fn, create_fn):
    item = query_fn()
    if item:
        return item
    item = create_fn()
    return item


def main():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Remove legacy auction schema columns if they still exist
    with engine.begin() as conn:
        existing_columns = [row[0] for row in conn.execute(text(
            "SELECT column_name FROM information_schema.columns WHERE table_name='auctions'"
        ))]
        for legacy_column in ["bid_amount", "month", "user_id", "is_winner", "winner_id"]:
            if legacy_column in existing_columns:
                conn.execute(text(f"ALTER TABLE auctions DROP COLUMN IF EXISTS {legacy_column}"))

        # Ensure audit_logs schema includes current columns for the model
        audit_columns = [row[0] for row in conn.execute(text(
            "SELECT column_name FROM information_schema.columns WHERE table_name='audit_logs'"
        ))]
        for audit_column, sql_type in [
            ('user_name', 'VARCHAR'),
            ('resource', 'VARCHAR'),
            ('detail', 'VARCHAR'),
            ('success', 'BOOLEAN DEFAULT TRUE')
        ]:
            if audit_column not in audit_columns:
                conn.execute(text(f"ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS {audit_column} {sql_type}"))

    try:
        now = datetime.utcnow()

        # Organizations
        org1 = get_or_create(
            lambda: db.query(Organization).filter(Organization.email == 'demo.org1@smartchits.com').first(),
            lambda: Organization(
                first_name='Priya',
                last_name='Rao',
                email='demo.org1@smartchits.com',
                phone_number='9000000001',
                password='OrgPass#1',
                confirm_password='OrgPass#1',
                organization_name='Green Horizon Finance',
                organization_type='Community Finance',
                registration_number='GHF-2026-001',
                company_email='contact@greenhorizon.finance',
                company_phone_number='9000000001',
                description='A local chit fund organization for community growth.',
                preferences={"language": "English", "timezone": "Asia/Kolkata", "currency": "INR"},
                notifications={"payment_reminders": True, "chit_announcements": True}
            )
        )
        org2 = get_or_create(
            lambda: db.query(Organization).filter(Organization.email == 'demo.org2@smartchits.com').first(),
            lambda: Organization(
                first_name='Arjun',
                last_name='Sen',
                email='demo.org2@smartchits.com',
                phone_number='9000000002',
                password='OrgPass#2',
                confirm_password='OrgPass#2',
                organization_name='Silver Leaf Capital',
                organization_type='Corporate Chit Fund',
                registration_number='SLC-2026-002',
                company_email='info@silverleaf.capital',
                company_phone_number='9000000002',
                description='Corporate chit fund management for professionals.',
                preferences={"language": "English", "timezone": "Asia/Kolkata", "currency": "INR"},
                notifications={"payment_reminders": True, "chit_announcements": True}
            )
        )

        db.add_all([org1, org2])
        db.commit()
        db.refresh(org1)
        db.refresh(org2)

        # Branches
        branch1 = get_or_create(
            lambda: db.query(Branch).filter(Branch.code == 'BR-001').first(),
            lambda: Branch(
                name='Bangalore Central',
                code='BR-001',
                location='Bangalore',
                address='No. 12, MG Road, Bangalore',
                phone='08040001234',
                email='bangalore@smartchits.com',
                manager_name='Mr. Rajiv Singh',
                settings={"timezone": "Asia/Kolkata", "currency": "INR"}
            )
        )
        branch2 = get_or_create(
            lambda: db.query(Branch).filter(Branch.code == 'BR-002').first(),
            lambda: Branch(
                name='Hyderabad East',
                code='BR-002',
                location='Hyderabad',
                address='HITEC City, Hyderabad',
                phone='04040009876',
                email='hyderabad@smartchits.com',
                manager_name='Ms. Anjali Verma',
                settings={"timezone": "Asia/Kolkata", "currency": "INR"}
            )
        )

        db.add_all([branch1, branch2])
        db.commit()
        db.refresh(branch1)
        db.refresh(branch2)

        # Users: super admin, platform admin, admins, members
        users = []
        for email, first, last, role, branch in [
            ('demo.superadmin@smartchits.com', 'Demo', 'SuperAdmin', 'super_admin', None),
            ('demo.platformadmin@smartchits.com', 'Demo', 'PlatformAdmin', 'platform_admin', None),
            ('demo.admin1@smartchits.com', 'Neha', 'Patel', 'admin', branch1),
            ('demo.admin2@smartchits.com', 'Ankit', 'Sharma', 'admin', branch2),
            ('demo.user1@smartchits.com', 'Sahana', 'Kumar', 'user', branch1),
            ('demo.user2@smartchits.com', 'Rahul', 'Das', 'user', branch1),
            ('demo.user3@smartchits.com', 'Meera', 'Iyer', 'user', branch1),
            ('demo.user4@smartchits.com', 'Vikram', 'Reddy', 'user', branch2),
            ('demo.user5@smartchits.com', 'Priyanka', 'Joshi', 'user', branch2),
            ('demo.user6@smartchits.com', 'Karan', 'Singh', 'user', branch2)
        ]:
            existing = db.query(User).filter(User.email == email).first()
            if existing:
                users.append(existing)
                continue
            user = User(
                first_name=first,
                last_name=last,
                name=f"{first} {last}",
                email=email,
                phone_number=f'90000{users.__len__() + 1000}',
                hashed_password=hash_password('SmartChits123!'),
                role=role,
                branch_id=branch.id if branch else None,
                organization_id=org1.id if role == 'admin' and branch == branch1 else (org2.id if role == 'admin' and branch == branch2 else None),
                preferences={"language": "English", "timezone": "Asia/Kolkata", "currency": "INR"},
                notifications={"payment_reminders": True, "chit_announcements": True}
            )
            users.append(user)
            db.add(user)

        db.commit()

        user_map = {user.email: user for user in db.query(User).filter(User.email.in_([
            'demo.superadmin@smartchits.com',
            'demo.platformadmin@smartchits.com',
            'demo.admin1@smartchits.com',
            'demo.admin2@smartchits.com',
            'demo.user1@smartchits.com',
            'demo.user2@smartchits.com',
            'demo.user3@smartchits.com',
            'demo.user4@smartchits.com',
            'demo.user5@smartchits.com',
            'demo.user6@smartchits.com'
        ])).all()}

        # Chit Groups
        chit1 = get_or_create(
            lambda: db.query(Chit).filter(Chit.name == 'Green Horizon Chit').first(),
            lambda: Chit(
                name='Green Horizon Chit',
                total_members=4,
                duration=12,
                monthly_amount=5000.0,
                current_month=4,
                bidding_open=True,
                total_chit_amount=240000.0,
                organization_id=org1.id,
                created_by=user_map['demo.admin1@smartchits.com'].id,
                chit_fund=120000.0,
                description='A community chit group focused on sustainable growth.',
                installment_amount=5000.0,
                installment_frequency=1,
                total_months=12
            )
        )
        chit2 = get_or_create(
            lambda: db.query(Chit).filter(Chit.name == 'Silver Leaf Chit').first(),
            lambda: Chit(
                name='Silver Leaf Chit',
                total_members=5,
                duration=10,
                monthly_amount=8000.0,
                current_month=2,
                bidding_open=False,
                total_chit_amount=400000.0,
                organization_id=org2.id,
                created_by=user_map['demo.admin2@smartchits.com'].id,
                chit_fund=96000.0,
                description='A corporate chit fund group with regular merchant members.',
                installment_amount=8000.0,
                installment_frequency=1,
                total_months=10
            )
        )

        db.add_all([chit1, chit2])
        db.commit()
        db.refresh(chit1)
        db.refresh(chit2)

        # Members
        member_specs = [
            (chit1, 'demo.user1@smartchits.com', False),
            (chit1, 'demo.user2@smartchits.com', False),
            (chit1, 'demo.user3@smartchits.com', True),
            (chit1, 'demo.user4@smartchits.com', False),
            (chit2, 'demo.user5@smartchits.com', False),
            (chit2, 'demo.user6@smartchits.com', False),
            (chit2, 'demo.user1@smartchits.com', False),
            (chit2, 'demo.user2@smartchits.com', False),
            (chit2, 'demo.user3@smartchits.com', False)
        ]

        created_members = []
        for chit, email, won in member_specs:
            current_user = user_map[email]
            existing = db.query(Member).filter(Member.chit_id == chit.id, Member.user_id == current_user.id).first()
            if existing:
                created_members.append(existing)
                continue
            member = Member(
                chit_id=chit.id,
                user_id=current_user.id,
                already_won_auction=won,
                joined_at=now - timedelta(days=30)
            )
            db.add(member)
            created_members.append(member)

        db.commit()

        # Refresh member objects for IDs
        created_members = db.query(Member).filter(Member.user_id.in_([
            user_map[email].id for email, _, _ in [
                ('demo.user1@smartchits.com', '', False),
                ('demo.user2@smartchits.com', '', False),
                ('demo.user3@smartchits.com', '', False),
                ('demo.user4@smartchits.com', '', False),
                ('demo.user5@smartchits.com', '', False),
                ('demo.user6@smartchits.com', '', False)
            ]
        ])).all()
        member_map = {(m.chit_id, m.user_id): m for m in created_members}

        # Payments
        payment_rows = [
            (chit1, 'demo.user1@smartchits.com', 1, 'paid', now - timedelta(days=35)),
            (chit1, 'demo.user1@smartchits.com', 2, 'paid', now - timedelta(days=5)),
            (chit1, 'demo.user2@smartchits.com', 2, 'pending', None),
            (chit1, 'demo.user3@smartchits.com', 3, 'paid', now - timedelta(days=2)),
            (chit1, 'demo.user4@smartchits.com', 2, 'pending', None),
            (chit2, 'demo.user5@smartchits.com', 1, 'paid', now - timedelta(days=40)),
            (chit2, 'demo.user6@smartchits.com', 1, 'paid', now - timedelta(days=40)),
            (chit2, 'demo.user1@smartchits.com', 1, 'paid', now - timedelta(days=42)),
            (chit2, 'demo.user2@smartchits.com', 1, 'pending', None),
            (chit2, 'demo.user3@smartchits.com', 2, 'pending', None)
        ]

        for chit, email, month, status, paid_at in payment_rows:
            user_obj = user_map[email]
            existing = db.query(Payment).filter(Payment.chit_id == chit.id, Payment.user_id == user_obj.id, Payment.month == month).first()
            if existing:
                continue
            payment = Payment(
                chit_id=chit.id,
                user_id=user_obj.id,
                amount=chit.monthly_amount,
                month=month,
                status=status,
                paid_at=paid_at
            )
            db.add(payment)

        db.commit()

        # Auctions
        auction1 = get_or_create(
            lambda: db.query(Auction).filter(Auction.auction_number == 'AUC-DEMO-001').first(),
            lambda: Auction(
                auction_number='AUC-DEMO-001',
                chit_group_id=chit1.id,
                branch_id=branch1.id,
                auction_month=3,
                auction_date=now - timedelta(days=7),
                total_pool_amount=120000.0,
                foreman_commission_percent=5.0,
                foreman_commission_amount=6000.0,
                max_bid_limit=45000.0,
                status='COMPLETED',
                duration_minutes=20,
                created_by=user_map['demo.admin1@smartchits.com'].id,
                started_at=now - timedelta(days=7, hours=1),
                ended_at=now - timedelta(days=7, minutes=20),
                winning_bid_amount=42000.0,
                winner_prize_amount=30000.0,
                dividend_per_member=22500.0
            )
        )
        auction2 = get_or_create(
            lambda: db.query(Auction).filter(Auction.auction_number == 'AUC-DEMO-002').first(),
            lambda: Auction(
                auction_number='AUC-DEMO-002',
                chit_group_id=chit2.id,
                branch_id=branch2.id,
                auction_month=2,
                auction_date=now + timedelta(days=3),
                total_pool_amount=160000.0,
                foreman_commission_percent=4.0,
                foreman_commission_amount=6400.0,
                max_bid_limit=60000.0,
                status='PENDING',
                duration_minutes=30,
                created_by=user_map['demo.admin2@smartchits.com'].id
            )
        )

        db.add_all([auction1, auction2])
        db.commit()
        db.refresh(auction1)
        db.refresh(auction2)

        # Winner member mapping for auction1
        winner_member = db.query(Member).filter(Member.chit_id == chit1.id, Member.user_id == user_map['demo.user3@smartchits.com'].id).first()
        if winner_member:
            auction1.winner_member_id = winner_member.id
            winner_member.already_won_auction = True
            winner_member.winning_auction_id = auction1.id
            db.add(winner_member)
            db.add(auction1)
            db.commit()

        # Auction bids
        bids = [
            (auction1, 'demo.user2@smartchits.com', 38000.0, False),
            (auction1, 'demo.user3@smartchits.com', 42000.0, True),
            (auction2, 'demo.user5@smartchits.com', 31000.0, False)
        ]
        for auction, email, amount, winning in bids:
            bidder = user_map[email]
            member_obj = db.query(Member).filter(Member.chit_id == auction.chit_group_id, Member.user_id == bidder.id).first()
            if not member_obj:
                continue
            existing = db.query(AuctionBid).filter(AuctionBid.auction_id == auction.id, AuctionBid.member_id == member_obj.id, AuctionBid.bid_amount == amount).first()
            if existing:
                continue
            bid = AuctionBid(
                auction_id=auction.id,
                member_id=member_obj.id,
                bid_amount=amount,
                is_winning_bid=winning
            )
            db.add(bid)

        db.commit()

        # Audit logs
        audit_rows = [
            (user_map['demo.superadmin@smartchits.com'], 'Created demo super admin account', 'User', True),
            (user_map['demo.platformadmin@smartchits.com'], 'Created platform statistics dashboard sample', 'Dashboard', True),
            (user_map['demo.admin1@smartchits.com'], 'Created Green Horizon Chit group', 'Chit', True),
            (user_map['demo.admin2@smartchits.com'], 'Created Silver Leaf Chit group', 'Chit', True),
            (user_map['demo.admin1@smartchits.com'], 'Added members to Green Horizon Chit', 'Member', True),
            (user_map['demo.admin2@smartchits.com'], 'Scheduled upcoming auction for Silver Leaf Chit', 'Auction', True)
        ]
        for user_obj, action, resource, success in audit_rows:
            existing = db.query(AuditLog).filter(
                AuditLog.user_id == user_obj.id,
                AuditLog.action == action,
                AuditLog.resource == resource
            ).first()
            if existing:
                continue
            db.add(AuditLog(
                user_id=user_obj.id,
                user_name=user_obj.name,
                action=action,
                resource=resource,
                detail=f"Demo data created for {resource}",
                success=success
            ))

        db.commit()

        print('Demo data seeded successfully.')
    finally:
        db.close()


if __name__ == '__main__':
    main()

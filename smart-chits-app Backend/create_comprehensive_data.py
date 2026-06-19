"""
Create comprehensive sample data for all admin modules
"""
from app.db.database import SessionLocal
from app.models.user_model import User
from app.models.chit_model import Chit
from app.models.member_model import Member
from app.models.payment_model import Payment
from app.models.auction_model import Auction
from datetime import datetime, timedelta
import random

db = SessionLocal()
try:
    print("🔧 Creating comprehensive sample data...")
    print("=" * 60)
    
    # 1. CREATE MORE MEMBERS for branch 9
    print("\n1️⃣ Adding members to branch 9...")
    existing_users = db.query(User).filter(User.branch_id == 9).all()
    if len(existing_users) < 15:
        member_data = [
            ('Rajesh', 'Kumar', 'rajesh.kumar@example.com', '9876543210'),
            ('Priya', 'Singh', 'priya.singh@example.com', '9876543211'),
            ('Amit', 'Patel', 'amit.patel@example.com', '9876543212'),
            ('Neha', 'Sharma', 'neha.sharma@example.com', '9876543213'),
            ('Vikram', 'Gupta', 'vikram.gupta@example.com', '9876543214'),
        ]
        
        for first, last, email, phone in member_data:
            user = db.query(User).filter(User.email == email).first()
            if not user:
                user = User(
                    first_name=first,
                    last_name=last,
                    email=email,
                    phone_number=phone,
                    hashed_password="$2b$12$hashed_password_placeholder",
                    role="user",
                    branch_id=9,
                    is_active=True
                )
                db.add(user)
        db.commit()
        print("   ✅ Added 5 new members")
    
    # 2. GET all members in branch 9
    branch_members = db.query(User).filter(User.branch_id == 9, User.role == 'user').all()
    print(f"   Total members in branch 9: {len(branch_members)}")
    
    # 3. CREATE CHIT GROUPS for branch 9
    print("\n2️⃣ Creating chit groups for branch 9...")
    chits_to_create = [
        {
            'name': 'Gold Investment Plan',
            'description': 'Monthly investment for gold purchasing',
            'total_members': len(branch_members),
            'duration': 12,
            'monthly_amount': 50000,
            'organization_id': 1,
            'created_by': 14  # Ganesh
        },
        {
            'name': 'Emergency Fund Chit',
            'description': 'Emergency savings fund',
            'total_members': len(branch_members),
            'duration': 24,
            'monthly_amount': 25000,
            'organization_id': 1,
            'created_by': 14
        }
    ]
    
    for chit_data in chits_to_create:
        existing = db.query(Chit).filter(
            Chit.name == chit_data['name'],
            Chit.organization_id == chit_data['organization_id']
        ).first()
        if not existing:
            chit = Chit(
                name=chit_data['name'],
                description=chit_data['description'],
                total_members=chit_data['total_members'],
                duration=chit_data['duration'],
                monthly_amount=chit_data['monthly_amount'],
                total_chit_amount=chit_data['total_members'] * chit_data['monthly_amount'] * chit_data['duration'],
                chit_fund=0,
                installment_amount=chit_data['monthly_amount'],
                total_months=chit_data['duration'],
                current_month=1,
                bidding_open=True,
                organization_id=chit_data['organization_id'],
                created_by=chit_data['created_by']
            )
            db.add(chit)
    db.commit()
    print("   ✅ Created chit groups")
    
    # 4. ADD MEMBERS TO CHITS
    print("\n3️⃣ Adding members to chit groups...")
    chits = db.query(Chit).filter(Chit.organization_id == 1).all()
    for chit in chits:
        for member in branch_members[:5]:  # Add first 5 members
            existing_member = db.query(Member).filter(
                Member.user_id == member.id,
                Member.chit_id == chit.id
            ).first()
            if not existing_member:
                chit_member = Member(
                    user_id=member.id,
                    chit_id=chit.id,
                    joined_at=datetime.now(),
                    already_won_auction=False,
                    total_dividend_earned=0.0
                )
                db.add(chit_member)
    db.commit()
    print(f"   ✅ Added members to {len(chits)} chits")
    
    # 5. CREATE PAYMENTS
    print("\n4️⃣ Creating payments...")
    payment_statuses = ['PAID', 'PENDING', 'OVERDUE']
    chit_members = db.query(Member).filter(
        Member.chit_id.in_([c.id for c in chits])
    ).all()
    
    created_count = 0
    for chit_member in chit_members:
        chit = db.query(Chit).filter(Chit.id == chit_member.chit_id).first()
        for month in range(1, min(4, chit.total_months + 1)):
            existing = db.query(Payment).filter(
                Payment.user_id == chit_member.user_id,
                Payment.chit_id == chit.id,
                Payment.month == month
            ).first()
            if not existing:
                status = random.choice(payment_statuses)
                payment = Payment(
                    user_id=chit_member.user_id,
                    chit_id=chit.id,
                    amount=chit.monthly_amount,
                    month=month,
                    status=status,
                    paid_at=datetime.now() if status == 'PAID' else None,
                    created_at=datetime.now() - timedelta(days=random.randint(0, 30)),
                    updated_at=datetime.now() if status == 'PAID' else None
                )
                db.add(payment)
                created_count += 1
    db.commit()
    print(f"   ✅ Created {created_count} payments")
    
    # 6. CREATE MORE AUCTIONS
    print("\n5️⃣ Creating additional auctions for branch 9...")
    new_auctions = [
        {
            'auction_number': 'AUC-GK-004',
            'chit_group_id': chits[0].id if chits else 28,
            'branch_id': 9,
            'auction_month': 8,
            'total_pool_amount': 500000.0,
            'foreman_commission_percent': 3.0,
            'max_bid_limit': 20000.0,
            'created_by': 14
        },
        {
            'auction_number': 'AUC-GK-005',
            'chit_group_id': chits[1].id if len(chits) > 1 else 29,
            'branch_id': 9,
            'auction_month': 9,
            'total_pool_amount': 300000.0,
            'foreman_commission_percent': 2.5,
            'max_bid_limit': 15000.0,
            'created_by': 14
        }
    ]
    
    for auc_data in new_auctions:
        existing = db.query(Auction).filter(
            Auction.auction_number == auc_data['auction_number']
        ).first()
        if not existing:
            auction = Auction(
                auction_number=auc_data['auction_number'],
                chit_group_id=auc_data['chit_group_id'],
                branch_id=auc_data['branch_id'],
                auction_month=auc_data['auction_month'],
                auction_date=None,
                total_pool_amount=auc_data['total_pool_amount'],
                foreman_commission_percent=auc_data['foreman_commission_percent'],
                foreman_commission_amount=auc_data['total_pool_amount'] * auc_data['foreman_commission_percent'] / 100,
                max_bid_limit=auc_data['max_bid_limit'],
                status='PENDING',
                duration_minutes=15,
                created_by=auc_data['created_by'],
                created_at=datetime.now()
            )
            db.add(auction)
    db.commit()
    print("   ✅ Created 2 additional auctions")
    
    # SUMMARY
    print("\n" + "=" * 60)
    print("📊 DATA SUMMARY FOR BRANCH 9 (Ganesh Kondeti)")
    print("=" * 60)
    
    members_count = db.query(User).filter(User.branch_id == 9, User.role == 'user').count()
    chits_count = db.query(Chit).filter(Chit.organization_id == 1).count()
    payments_count = db.query(Payment).count()
    auctions_count = db.query(Auction).filter(Auction.branch_id == 9).count()
    
    print(f"✅ Total Members: {members_count}")
    print(f"✅ Total Chit Groups: {chits_count}")
    print(f"✅ Total Payments: {payments_count}")
    print(f"✅ Total Auctions (Branch 9): {auctions_count}")
    print("=" * 60)
    
except Exception as e:
    print(f"❌ Error: {e}")
    db.rollback()
    import traceback
    traceback.print_exc()
finally:
    db.close()

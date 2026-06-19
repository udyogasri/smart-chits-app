#!/usr/bin/env python3
"""
Clean and recreate sample data
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.db.database import SessionLocal
from app.models.member_model import Member
from app.models.payment_model import Payment
from app.models.auction_model import Auction
from app.models.auction_bid_model import AuctionBid
from app.models.chit_model import Chit
from app.models.user_model import User
from app.utils.hashing import hash_password
from datetime import datetime

def cleanup_and_recreate():
    db = SessionLocal()
    
    print("\n=== Cleaning Up and Recreating Sample Data ===\n")
    
    # Delete in reverse order of dependencies (foreign keys)
    print("Deleting existing data...")
    
    # Delete auction bids first (depends on members and auctions)
    try:
        bids_count = db.query(AuctionBid).delete()
        db.commit()
        print(f"✅ Deleted {bids_count} auction bids")
    except:
        db.rollback()
        print("⚠️  Could not delete auction bids (may not exist)")
    
    # Delete auctions, payments, members
    payments_count = db.query(Payment).delete()
    db.commit()
    print(f"✅ Deleted {payments_count} payments")
    
    auctions_count = db.query(Auction).delete()
    db.commit()
    print(f"✅ Deleted {auctions_count} auctions")
    
    members_count = db.query(Member).delete()
    db.commit()
    print(f"✅ Deleted {members_count} members")
    
    # Delete chits and users
    chits_count = db.query(Chit).delete()
    db.commit()
    print(f"✅ Deleted {chits_count} chits")
    
    users_count = db.query(User).filter(User.role == "user").delete()
    db.commit()
    print(f"✅ Deleted {users_count} users")
    
    # Get admin
    admin = db.query(User).filter(User.email == "kondetiganesh43@gmail.com").first()
    org_id = admin.organization_id
    
    print(f"\nRecreating sample data for organization {org_id}...")
    
    # Create users
    print("\nCreating 10 sample users...")
    sample_users = [
        ("Rajesh", "Kumar", "rajesh@example.com", "9876543210"),
        ("Priya", "Singh", "priya@example.com", "9876543211"),
        ("Amit", "Patel", "amit@example.com", "9876543212"),
        ("Sneha", "Sharma", "sneha@example.com", "9876543213"),
        ("Vikram", "Desai", "vikram@example.com", "9876543214"),
        ("Anjali", "Gupta", "anjali@example.com", "9876543215"),
        ("Rahul", "Verma", "rahul@example.com", "9876543216"),
        ("Divya", "Reddy", "divya@example.com", "9876543217"),
        ("Arjun", "Iyer", "arjun@example.com", "9876543218"),
        ("Neha", "Nair", "neha@example.com", "9876543219"),
    ]
    
    users = []
    for first, last, email, phone in sample_users:
        user = User(
            email=email,
            first_name=first,
            last_name=last,
            name=f"{first} {last}",
            phone_number=phone,
            hashed_password=hash_password("password123"),
            role="user",
            organization_id=org_id,
            is_active=True
        )
        db.add(user)
        users.append(user)
    
    db.commit()
    print(f"✅ Created {len(users)} users")
    
    # Create chits
    print("Creating 3 sample chits...")
    chit1 = Chit(
        name="House Chit - 24 Months",
        total_members=10,
        duration=24,
        monthly_amount=5000,
        total_chit_amount=120000,
        organization_id=org_id,
        created_by=admin.id,
        description="A chit plan for house renovation",
        bidding_open=True,
        installment_amount=5000,
        installment_frequency=1,
        total_months=24
    )
    
    chit2 = Chit(
        name="Education Chit - 12 Months",
        total_members=10,
        duration=12,
        monthly_amount=3000,
        total_chit_amount=45000,
        organization_id=org_id,
        created_by=admin.id,
        description="A chit plan for education expenses",
        bidding_open=False,
        installment_amount=3000,
        installment_frequency=1,
        total_months=12
    )
    
    chit3 = Chit(
        name="Business Startup Chit - 36 Months",
        total_members=10,
        duration=36,
        monthly_amount=8000,
        total_chit_amount=288000,
        organization_id=org_id,
        created_by=admin.id,
        description="A chit plan for starting a business",
        bidding_open=True,
        installment_amount=8000,
        installment_frequency=1,
        total_months=36
    )
    
    db.add(chit1)
    db.add(chit2)
    db.add(chit3)
    db.commit()
    
    chits = [chit1, chit2, chit3]
    print(f"✅ Created {len(chits)} chits")
    
    # Add members to chits
    print("Adding users to chits as members...")
    member_count = 0
    for chit in chits:
        for user in users:
            member = Member(
                user_id=user.id,
                chit_id=chit.id,
                already_won_auction=False,
                joined_at=datetime.now()
            )
            db.add(member)
            member_count += 1
    
    db.commit()
    print(f"✅ Created {member_count} member assignments ({len(users)} users × {len(chits)} chits)")
    
    # Create payments
    print("Creating sample payments...")
    payment_count = 0
    for chit in chits:
        for i, user in enumerate(users):
            status = "paid" if i % 2 == 0 else "pending"
            payment = Payment(
                chit_id=chit.id,
                user_id=user.id,
                amount=chit.monthly_amount,
                status=status,
                month=1
            )
            db.add(payment)
            payment_count += 1
    
    db.commit()
    print(f"✅ Created {payment_count} payments")
    
    # Create auctions
    print("Creating sample auctions...")
    auction_count = 0
    for chit in chits:
        for month in [3, 4]:
            auction_number = f"AUC-{chit.id}-{month}"
            auction = Auction(
                auction_number=auction_number,
                chit_group_id=chit.id,
                auction_month=month,
                total_pool_amount=chit.total_chit_amount,
                status="PENDING"
            )
            db.add(auction)
            auction_count += 1
    
    db.commit()
    print(f"✅ Created {auction_count} auctions")
    
    print(f"\n" + "="*60)
    print(f"✨ Sample data recreated successfully!")
    print(f"="*60)
    print(f"\nReadyto test with:")
    print(f"• {len(users)} members")
    print(f"• {len(chits)} chits")
    print(f"• {member_count} member assignments")
    print(f"• {payment_count} payments")
    print(f"• {auction_count} auctions")
    
    db.close()

if __name__ == "__main__":
    try:
        cleanup_and_recreate()
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()

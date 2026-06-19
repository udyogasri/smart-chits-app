#!/usr/bin/env python3
"""
Script to create sample data for the admin user's organization
"""
import sys
import os
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.db.database import SessionLocal
from app.models.user_model import User
from app.models.chit_model import Chit
from app.models.member_model import Member
from app.models.payment_model import Payment
from app.models.auction_model import Auction

def create_sample_data(db):
    """Create sample data for testing the admin dashboard"""
    
    # Get the admin user
    admin = db.query(User).filter(User.email == "kondetiganesh43@gmail.com").first()
    org_id = admin.organization_id
    
    print(f"\n=== Creating Sample Data for Organization {org_id} ===")
    
    # Check if we already have sample data
    existing_chits = db.query(Chit).filter(Chit.organization_id == org_id).count()
    if existing_chits > 0:
        print(f"Sample data already exists! Found {existing_chits} chits")
        return
    
    # Create sample chits
    print(f"\nCreating sample chits...")
    chit1 = Chit(
        name="House Chit - 24 Months",
        total_members=12,
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
        total_members=15,
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
    
    print(f"✅ Created 3 sample chits")
    
    # Create sample members (reuse existing users or create new ones)
    print(f"\nCreating sample members...")
    users = db.query(User).filter(User.role == "user").limit(5).all()
    
    if len(users) < 3:
        print(f"⚠️  Not enough users in database. Found only {len(users)} users.")
        print(f"   Creating members for chits from available users...")
    
    # Add members to chits
    for i, user in enumerate(users[:3]):
        for chit in [chit1, chit2, chit3]:
            member = Member(
                user_id=user.id,
                chit_id=chit.id,
                already_won_auction=False,
                joined_at=datetime.now()
            )
            db.add(member)
    
    db.commit()
    print(f"✅ Created {3 * len(users[:3])} sample members")
    
    # Create sample payments
    print(f"\nCreating sample payments...")
    payments_created = 0
    for chit in [chit1, chit2, chit3]:
        # Create 3 paid payments and 2 pending payments per chit
        for i in range(3):
            payment = Payment(
                chit_id=chit.id,
                user_id=users[i % len(users[:3])].id if users else admin.id,
                amount=chit.monthly_amount,
                status="paid",
                payment_month=1
            )
            db.add(payment)
            payments_created += 1
        
        for i in range(2):
            payment = Payment(
                chit_id=chit.id,
                user_id=users[(i + 3) % len(users[:3])].id if users else admin.id,
                amount=chit.monthly_amount,
                status="pending",
                payment_month=2
            )
            db.add(payment)
            payments_created += 1
    
    db.commit()
    print(f"✅ Created {payments_created} sample payments")
    
    # Create sample auctions
    print(f"\nCreating sample auctions...")
    auction1 = Auction(
        chit_group_id=chit1.id,
        auction_month=3,
        min_bid=0,
        status="pending"
    )
    
    auction2 = Auction(
        chit_group_id=chit1.id,
        auction_month=4,
        min_bid=0,
        status="pending"
    )
    
    db.add(auction1)
    db.add(auction2)
    db.commit()
    print(f"✅ Created 2 sample auctions")
    
    print(f"\n=== Summary ===")
    print(f"Sample data created successfully!")
    print(f"- Chits: 3")
    print(f"- Members: {3 * len(users[:3])}")
    print(f"- Payments: {payments_created} (includes paid and pending)")
    print(f"- Auctions: 2")
    print(f"\nYou can now login to see the dashboard with populated data!")

if __name__ == "__main__":
    db = SessionLocal()
    try:
        create_sample_data(db)
    finally:
        db.close()

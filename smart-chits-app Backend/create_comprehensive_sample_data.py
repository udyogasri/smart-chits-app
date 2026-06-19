#!/usr/bin/env python3
"""
Script to create comprehensive sample data for testing
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
from app.utils.hashing import hash_password

def create_comprehensive_sample_data(db):
    """Create sample data for testing the admin dashboard"""
    
    # Get the admin user
    admin = db.query(User).filter(User.email == "kondetiganesh43@gmail.com").first()
    org_id = admin.organization_id
    
    print(f"\n=== Creating Comprehensive Sample Data for Organization {org_id} ===")
    
    # Check if we already have sample data
    existing_chits = db.query(Chit).filter(Chit.organization_id == org_id).count()
    existing_members = db.query(Member).count()
    
    if existing_chits > 0 and existing_members > 0:
        print(f"✅ Sample data already exists! Found {existing_chits} chits and {existing_members} members")
        return
    
    # ========== 1. CREATE SAMPLE USERS/MEMBERS ==========
    print(f"\nStep 1: Creating sample users...")
    sample_users_data = [
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
    
    created_users = []
    for first_name, last_name, email, phone in sample_users_data:
        existing = db.query(User).filter(User.email == email).first()
        if not existing:
            user = User(
                email=email,
                first_name=first_name,
                last_name=last_name,
                name=f"{first_name} {last_name}",
                phone_number=phone,
                hashed_password=hash_password("password123"),
                role="user",
                organization_id=org_id,
                is_active=True
            )
            db.add(user)
            created_users.append(user)
        else:
            created_users.append(existing)
    
    if created_users:
        db.commit()
        print(f"✅ Created {len(created_users)} sample users")
    else:
        print(f"⚠️  Sample users already exist")
        # Get existing users
        created_users = db.query(User).filter(
            User.email.in_([d[2] for d in sample_users_data])
        ).all()
    
    # ========== 2. CREATE SAMPLE CHITS ==========
    print(f"\nStep 2: Creating sample chits...")
    chits_created = []
    
    # Check if chits already exist
    existing_chits = db.query(Chit).filter(Chit.organization_id == org_id).all()
    if len(existing_chits) == 0:
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
        
        chits_created = [chit1, chit2, chit3]
        print(f"✅ Created 3 sample chits")
    else:
        chits_created = existing_chits
        print(f"⚠️  Chits already exist: {len(chits_created)}")
    
    # ========== 3. ADD MEMBERS TO CHITS ==========
    print(f"\nStep 3: Adding members to chits...")
    members_created = 0
    
    for chit in chits_created:
        # Add members to each chit
        for user in created_users:
            existing_member = db.query(Member).filter(
                Member.user_id == user.id,
                Member.chit_id == chit.id
            ).first()
            
            if not existing_member:
                member = Member(
                    user_id=user.id,
                    chit_id=chit.id,
                    already_won_auction=False,
                    joined_at=datetime.now()
                )
                db.add(member)
                members_created += 1
    
    db.commit()
    print(f"✅ Created {members_created} member assignments")
    
    # ========== 4. CREATE SAMPLE PAYMENTS ==========
    print(f"\nStep 4: Creating sample payments...")
    payments_created = 0
    
    for chit in chits_created:
        # Create payments for each user in the chit
        for i, user in enumerate(created_users):
            # Some paid, some pending
            if i % 2 == 0:
                payment = Payment(
                    chit_id=chit.id,
                    user_id=user.id,
                    amount=chit.monthly_amount,
                    status="paid",
                    payment_month=1
                )
            else:
                payment = Payment(
                    chit_id=chit.id,
                    user_id=user.id,
                    amount=chit.monthly_amount,
                    status="pending",
                    payment_month=1
                )
            
            db.add(payment)
            payments_created += 1
    
    db.commit()
    print(f"✅ Created {payments_created} sample payments")
    
    # ========== 5. CREATE SAMPLE AUCTIONS ==========
    print(f"\nStep 5: Creating sample auctions...")
    auctions_created = 0
    
    for chit in chits_created:
        # Create 2 auctions per chit
        for month in [3, 4]:
            existing_auction = db.query(Auction).filter(
                Auction.chit_group_id == chit.id,
                Auction.auction_month == month
            ).first()
            
            if not existing_auction:
                auction = Auction(
                    chit_group_id=chit.id,
                    auction_month=month,
                    min_bid=0,
                    status="pending"
                )
                db.add(auction)
                auctions_created += 1
    
    db.commit()
    print(f"✅ Created {auctions_created} sample auctions")
    
    # ========== SUMMARY ==========
    print(f"\n" + "="*60)
    print(f"COMPREHENSIVE SAMPLE DATA CREATED")
    print(f"="*60)
    
    # Verify data
    final_users = db.query(User).filter(User.role == "user").count()
    final_chits = db.query(Chit).filter(Chit.organization_id == org_id).count()
    final_members = db.query(Member).count()
    final_payments = db.query(Payment).count()
    final_auctions = db.query(Auction).count()
    
    print(f"\n📊 Final Data Count:")
    print(f"   • Users (members): {final_users}")
    print(f"   • Chits: {final_chits}")
    print(f"   • Member-Chit Assignments: {final_members}")
    print(f"   • Payments: {final_payments}")
    print(f"   • Auctions: {final_auctions}")
    
    print(f"\n🎯 Ready to Test:")
    print(f"   1. Login: admin@example.com / Kondeti@07")
    print(f"   2. Navigate to /admin/members")
    print(f"   3. See all {final_users} members with their chit memberships")
    print(f"   4. Test add/edit/delete operations")
    print(f"   5. Verify real-time WebSocket updates")
    print()

if __name__ == "__main__":
    db = SessionLocal()
    try:
        create_comprehensive_sample_data(db)
        print("✨ Comprehensive sample data setup complete!")
    except Exception as e:
        print(f"\n❌ Error creating sample data: {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

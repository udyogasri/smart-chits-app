"""
Script to create sample chit group data for testing and demonstration
"""
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.db.database import DATABASE_URL, SessionLocal
from app.models.chit_model import Chit
from app.models.user_model import User
from app.models.member_model import Member
from datetime import datetime
import random

# Create database session
db = SessionLocal()

def get_admin_user():
    """Get or create an admin user"""
    admin = db.query(User).filter(
        User.role.in_(["admin", "super_admin", "system_admin"]),
        User.is_active == True
    ).first()
    
    if not admin:
        print("❌ No active admin user found. Please create an admin first.")
        return None
    
    return admin

def create_sample_chits():
    """Create realistic sample chit groups"""
    
    admin = get_admin_user()
    if not admin:
        return
    
    print(f"✓ Using admin user: {admin.first_name} {admin.last_name} (Org: {admin.organization_id})")
    
    # Sample chit groups
    sample_chits = [
        {
            "name": "Gold Chit Fund 2024",
            "description": "Premium monthly chit fund for exclusive members",
            "total_members": 20,
            "chit_fund": 500000,
            "installment_amount": 25000,
            "total_months": 20,
            "monthly_amount": 25000,
            "duration": 20,
            "total_chit_amount": 10000000,
            "current_month": 3,
            "bidding_open": True,
        },
        {
            "name": "Silver Chit Fund 2024",
            "description": "Standard monthly chit fund for regular members",
            "total_members": 25,
            "chit_fund": 300000,
            "installment_amount": 12000,
            "total_months": 25,
            "monthly_amount": 12000,
            "duration": 25,
            "total_chit_amount": 7500000,
            "current_month": 5,
            "bidding_open": True,
        },
        {
            "name": "Bronze Chit Fund Q2",
            "description": "Starter chit fund for new members",
            "total_members": 30,
            "chit_fund": 150000,
            "installment_amount": 5000,
            "total_months": 30,
            "monthly_amount": 5000,
            "duration": 30,
            "total_chit_amount": 4500000,
            "current_month": 2,
            "bidding_open": False,
        },
        {
            "name": "Platinum Chit Fund 2024",
            "description": "High-value chit fund for senior members",
            "total_members": 15,
            "chit_fund": 1000000,
            "installment_amount": 50000,
            "total_months": 20,
            "monthly_amount": 50000,
            "duration": 20,
            "total_chit_amount": 15000000,
            "current_month": 1,
            "bidding_open": True,
        },
        {
            "name": "Summer Chit Fund",
            "description": "Seasonal chit fund for summer planning",
            "total_members": 18,
            "chit_fund": 400000,
            "installment_amount": 20000,
            "total_months": 20,
            "monthly_amount": 20000,
            "duration": 20,
            "total_chit_amount": 7200000,
            "current_month": 0,
            "bidding_open": True,
        },
    ]
    
    created_count = 0
    
    for chit_data in sample_chits:
        # Check if chit already exists
        existing = db.query(Chit).filter(
            Chit.name == chit_data["name"],
            Chit.organization_id == admin.organization_id
        ).first()
        
        if existing:
            print(f"⊘ Chit '{chit_data['name']}' already exists (ID: {existing.id})")
            continue
        
        # Create new chit
        new_chit = Chit(
            name=chit_data["name"],
            description=chit_data.get("description"),
            total_members=chit_data["total_members"],
            chit_fund=chit_data["chit_fund"],
            installment_amount=chit_data["installment_amount"],
            total_months=chit_data["total_months"],
            monthly_amount=chit_data["monthly_amount"],
            duration=chit_data["duration"],
            total_chit_amount=chit_data["total_chit_amount"],
            current_month=chit_data["current_month"],
            bidding_open=chit_data["bidding_open"],
            organization_id=admin.organization_id,
            created_by=admin.id,
            created_at=datetime.utcnow(),
        )
        
        db.add(new_chit)
        db.commit()
        db.refresh(new_chit)
        created_count += 1
        print(f"✓ Created chit: '{new_chit.name}' (ID: {new_chit.id})")
    
    print(f"\n✓ Successfully created {created_count} sample chit groups!")
    print(f"✓ Organization ID: {admin.organization_id}")

if __name__ == "__main__":
    try:
        create_sample_chits()
        print("\n🎉 Sample data creation completed!")
    except Exception as e:
        print(f"\n❌ Error creating sample data: {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

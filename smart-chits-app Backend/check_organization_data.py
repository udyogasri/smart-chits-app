#!/usr/bin/env python3
"""
Script to verify data in the database for the admin user's organization
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.db.database import SessionLocal
from app.models.user_model import User
from app.models.organization_model import Organization
from app.models.chit_model import Chit
from app.models.member_model import Member
from app.models.payment_model import Payment
from app.models.auction_model import Auction

def check_organization_data(db):
    """Check what data exists for the admin user's organization"""
    
    # Get the admin user
    admin = db.query(User).filter(User.email == "kondetiganesh43@gmail.com").first()
    if not admin:
        print("Admin user not found!")
        return
    
    org_id = admin.organization_id
    print(f"\n=== Organization Data Check ===")
    print(f"Admin User: {admin.email}")
    print(f"Organization ID: {org_id}")
    print(f"Organization: {db.query(Organization).filter(Organization.id == org_id).first().organization_name}")
    
    # Count chits
    chits_count = db.query(Chit).filter(Chit.organization_id == org_id).count()
    print(f"\nChits in organization: {chits_count}")
    if chits_count > 0:
        chits = db.query(Chit).filter(Chit.organization_id == org_id).limit(5).all()
        for chit in chits:
            print(f"  - {chit.name} (ID: {chit.id}, Status: {chit.status})")
    
    # Count members
    members_count = db.query(Member).count()
    print(f"\nTotal members in database: {members_count}")
    
    # Count payments
    payments_count = db.query(Payment).count()
    print(f"Total payments in database: {payments_count}")
    
    # Count auctions
    auctions_count = db.query(Auction).count()
    print(f"Total auctions in database: {auctions_count}")
    
    # Check if there are any chits (can't check status as it doesn't exist in model)
    chit_count = db.query(Chit).filter(Chit.organization_id == org_id).count()
    bidding_chits = db.query(Chit).filter(Chit.organization_id == org_id, Chit.bidding_open == True).count()
    print(f"\nChits with bidding open: {bidding_chits}")
    
    print(f"\n=== To test the dashboard ===")
    print(f"1. Login with credentials:")
    print(f"   Email: kondetiganesh43@gmail.com")
    print(f"   Password: Kondeti@07")
    print(f"\n2. The dashboard should now load and show statistics!")
    print(f"\n3. If you see 0 values, it means there is no data in the database yet.")
    print(f"   You can create sample data through the application or use seed scripts.")

if __name__ == "__main__":
    db = SessionLocal()
    try:
        check_organization_data(db)
    finally:
        db.close()

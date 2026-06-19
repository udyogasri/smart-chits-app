#!/usr/bin/env python3
"""
Simple test for members API endpoint
"""
import sys
import os
from datetime import timedelta

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.database import SessionLocal
from app.models.user_model import User
from app.core.security import create_access_token
from app.core.config import settings

def test_members_api():
    """Test members API endpoint"""
    db = SessionLocal()
    
    # Get admin token
    admin = db.query(User).filter(User.email == "kondetiganesh43@gmail.com").first()
    if not admin:
        print("❌ Admin user not found")
        return False
    
    # Create a token
    access_token = create_access_token(
        data={"sub": admin.email},
        expires_delta=timedelta(hours=24)
    )
    
    print(f"✅ Admin token created: {access_token[:50]}...")
    
    # Get members from DB directly to verify
    from app.models.member_model import Member
    from app.models.chit_model import Chit
    
    org_id = admin.organization_id
    members_in_org = db.query(Member).join(
        Chit, Member.chit_id == Chit.id
    ).filter(Chit.organization_id == org_id).all()
    
    print(f"✅ Found {len(members_in_org)} member-chit assignments in database")
    
    # Get unique users
    unique_users = set([m.user_id for m in members_in_org])
    print(f"✅ Found {len(unique_users)} unique members")
    
    # Show some members
    print(f"\nSample members with their chits:")
    for user_id in list(unique_users)[:5]:
        user = db.query(User).filter(User.id == user_id).first()
        chit_count = db.query(Member).filter(Member.user_id == user_id).count()
        if user:
            print(f"  - {user.first_name} {user.last_name}: {chit_count} chits")
    
    print(f"\n✅ API test data ready!")
    print(f"   Use token: {access_token[:30]}...")
    print(f"   To test: curl -H 'Authorization: Bearer {access_token[:30]}...' http://localhost:8000/admin/members")
    
    db.close()
    return True

if __name__ == "__main__":
    test_members_api()

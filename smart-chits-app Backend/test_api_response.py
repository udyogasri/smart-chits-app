#!/usr/bin/env python3
"""
Test the complete members API endpoint response
"""
import sys
import os
import json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.db.database import SessionLocal
from app.models.user_model import User
from app.models.member_model import Member
from app.models.chit_model import Chit
from sqlalchemy import func, case

def get_organization_members(db, org_id, skip=0, limit=100):
    """Simulate the API endpoint logic"""
    
    # OPTIMIZED: Use subquery with aggregation (single SQL query)
    # Get member stats aggregated by user_id
    member_stats = db.query(
        Member.user_id,
        func.count(Member.id).label("total_chits"),
        func.count(case((Chit.bidding_open == True, 1))).label("active_chits"),
        func.min(Member.joined_at).label("joined_at_earliest")
    ).join(
        Chit, Member.chit_id == Chit.id
    ).filter(
        Chit.organization_id == org_id
    ).group_by(Member.user_id).subquery()
    
    # Now join with User to get member details
    query = db.query(
        User,
        member_stats.c.total_chits,
        member_stats.c.active_chits,
        member_stats.c.joined_at_earliest
    ).join(
        member_stats, User.id == member_stats.c.user_id
    ).offset(skip).limit(limit)
    
    results = query.all()
    
    # Convert to response format
    result = []
    for user, total_chits, active_chits, joined_at_earliest in results:
        member_data = {
            "id": user.id,
            "email": user.email,
            "first_name": user.first_name or "N/A",
            "last_name": user.last_name or "N/A",
            "phone_number": user.phone_number,
            "is_active": user.is_active,
            "created_at": user.created_at.isoformat() if user.created_at else None,
            "total_chits": total_chits or 0,
            "active_chits": active_chits or 0,
            "total_members_in_chits": 0,
            "joined_at_earliest": joined_at_earliest.isoformat() if joined_at_earliest else None
        }
        result.append(member_data)
    
    return result

def test_api_response():
    """Test the full API response"""
    db = SessionLocal()
    
    print("\n=== Testing Members API Response ===\n")
    
    try:
        # Get admin
        admin = db.query(User).filter(User.email == "kondetiganesh43@gmail.com").first()
        if not admin:
            print("❌ Admin not found")
            return False
        
        org_id = admin.organization_id
        print(f"✅ Testing with org_id: {org_id}")
        
        # Get members
        members = get_organization_members(db, org_id)
        print(f"✅ Retrieved {len(members)} members")
        
        # Check response format
        if len(members) > 0:
            first_member = members[0]
            print(f"\n✅ Sample response:")
            print(json.dumps(first_member, indent=2))
            
            # Validate required fields
            required_fields = [
                "id", "email", "first_name", "last_name", 
                "phone_number", "is_active", "total_chits", 
                "active_chits", "joined_at_earliest"
            ]
            
            missing_fields = [f for f in required_fields if f not in first_member]
            if missing_fields:
                print(f"\n❌ Missing fields: {missing_fields}")
                return False
            
            print(f"\n✅ All required fields present")
        
        print(f"\n✅ API Response Test PASSED")
        return True
        
    except Exception as e:
        print(f"\n❌ Test failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        db.close()

if __name__ == "__main__":
    success = test_api_response()
    sys.exit(0 if success else 1)

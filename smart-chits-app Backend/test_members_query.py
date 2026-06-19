#!/usr/bin/env python3
"""
Test members endpoint directly
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.db.database import SessionLocal
from app.models.user_model import User
from app.models.member_model import Member
from app.models.chit_model import Chit
from sqlalchemy import func

def test_members_query():
    """Test the optimized members query"""
    db = SessionLocal()
    
    print("\n=== Testing Members Query ===\n")
    
    try:
        # Simulate admin user
        admin = db.query(User).filter(User.email == "kondetiganesh43@gmail.com").first()
        if not admin:
            print("❌ Admin user not found")
            return False
        
        org_id = admin.organization_id
        print(f"✅ Admin found: {admin.email}, org_id: {org_id}")
        
        # Test the optimized query
        print(f"\nExecuting optimized members query...")
        
        # Get member stats aggregated by user_id
        from sqlalchemy import case
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
        
        print(f"✅ Subquery created")
        
        # Now join with User
        query = db.query(
            User,
            member_stats.c.total_chits,
            member_stats.c.active_chits,
            member_stats.c.joined_at_earliest
        ).join(
            member_stats, User.id == member_stats.c.user_id
        )
        
        results = query.all()
        print(f"✅ Query executed successfully")
        print(f"\n✅ Found {len(results)} members:")
        
        for i, (user, total_chits, active_chits, joined_at) in enumerate(results[:3], 1):
            print(f"  {i}. {user.first_name} {user.last_name}")
            print(f"     - Total chits: {total_chits}")
            print(f"     - Active chits: {active_chits}")
            print(f"     - Joined: {joined_at}")
        
        if len(results) > 3:
            print(f"  ... and {len(results) - 3} more")
        
        print(f"\n✅ Members query test PASSED")
        return True
        
    except Exception as e:
        print(f"\n❌ Query failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        db.close()

if __name__ == "__main__":
    success = test_members_query()
    sys.exit(0 if success else 1)

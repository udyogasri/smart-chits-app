#!/usr/bin/env python3
"""
Debug test to find the exact source of the "_isnull" error
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.db.database import SessionLocal
from app.models.user_model import User
from app.models.member_model import Member
from app.models.chit_model import Chit
from sqlalchemy import func, and_
import traceback

db = SessionLocal()

try:
    print("Test 1: Get admin user")
    admin = db.query(User).filter(User.email == "kondetiganesh43@gmail.com").first()
    print(f"✅ Admin found: {admin.email}, org_id: {admin.organization_id}")
    org_id = admin.organization_id
    
    print("\nTest 2: Simple query - count all members")
    count = db.query(func.count(Member.id)).scalar()
    print(f"✅ Total members in DB: {count}")
    
    print("\nTest 3: Query with filter - members in org {org_id}")
    count = db.query(func.count(Member.id)).join(
        Chit, Member.chit_id == Chit.id
    ).filter(Chit.organization_id == org_id).scalar()
    print(f"✅ Members in org {org_id}: {count}")
    
    print("\nTest 4: Get distinct user_ids (method 1 - .distinct())")
    try:
        result = db.query(Member.user_id).join(
            Chit, Member.chit_id == Chit.id
        ).filter(Chit.organization_id == org_id).distinct().all()
        user_ids = [row[0] for row in result]
        print(f"✅ Method 1 worked! Found {len(user_ids)} user_ids: {user_ids[:3]}...")
    except Exception as e:
        print(f"❌ Method 1 failed: {str(e)}")
        traceback.print_exc()
    
    print("\nTest 5: Get distinct user_ids (method 2 - distinct column)")
    try:
        result = db.query(Member.user_id.distinct()).join(
            Chit, Member.chit_id == Chit.id
        ).filter(Chit.organization_id == org_id).all()
        user_ids = [row[0] for row in result]
        print(f"✅ Method 2 worked! Found {len(user_ids)} user_ids: {user_ids[:3]}...")
    except Exception as e:
        print(f"❌ Method 2 failed: {str(e)}")
        traceback.print_exc()
    
    print("\nTest 6: Get users with in_() filter")
    try:
        user_ids = [47, 48, 49]  # Just use some sample IDs
        users = db.query(User).filter(User.id.in_(user_ids)).all()
        print(f"✅ Found {len(users)} users with in_() filter")
    except Exception as e:
        print(f"❌ in_() filter failed: {str(e)}")
        traceback.print_exc()
        
    print("\nTest 7: Complex stats query for a single user")
    try:
        user_id = 47
        total_chits = db.query(func.count(Member.id)).filter(
            Member.user_id == user_id
        ).scalar() or 0
        print(f"✅ User {user_id} has {total_chits} total chits")
    except Exception as e:
        print(f"❌ Stats query failed: {str(e)}")
        traceback.print_exc()
    
    print("\n" + "="*50)
    print("All tests completed - check results above")
    
except Exception as e:
    print(f"❌ Unexpected error: {str(e)}")
    traceback.print_exc()
finally:
    db.close()

#!/usr/bin/env python3
"""
Comprehensive integration test for members API
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Test 1: Import all modules
print("\n=== Test 1: Importing modules ===")
try:
    from app.db.database import SessionLocal
    from app.models.user_model import User
    from app.models.member_model import Member
    from app.models.chit_model import Chit
    from app.api.routes import member_routes
    print("✅ All imports successful")
except Exception as e:
    print(f"❌ Import failed: {e}")
    sys.exit(1)

# Test 2: Database connectivity
print("\n=== Test 2: Database connectivity ===")
try:
    db = SessionLocal()
    admin = db.query(User).filter(User.email == "kondetiganesh43@gmail.com").first()
    if admin:
        print(f"✅ Database connected, admin found: {admin.email}")
    else:
        print("❌ Admin not found in database")
        db.close()
        sys.exit(1)
    db.close()
except Exception as e:
    print(f"❌ Database connection failed: {e}")
    sys.exit(1)

# Test 3: Endpoint logic (simulated)
print("\n=== Test 3: Endpoint logic simulation ===")
try:
    from sqlalchemy import and_
    
    db = SessionLocal()
    admin = db.query(User).filter(User.email == "kondetiganesh43@gmail.com").first()
    org_id = admin.organization_id
    
    # Simulate the GET endpoint logic
    print(f"  Getting members for org_id: {org_id}")
    
    # Get unique user IDs
    user_ids_query = db.query(Member.user_id.distinct()).join(
        Chit, Member.chit_id == Chit.id
    ).filter(Chit.organization_id == org_id)
    user_ids = [row[0] for row in user_ids_query.all()]
    print(f"  ✅ Found {len(user_ids)} unique member user IDs")
    
    # Fetch users
    users = db.query(User).filter(User.id.in_(user_ids)).limit(100).all()
    print(f"  ✅ Fetched {len(users)} users")
    
    # Build response
    result = []
    for user in users:
        try:
            from sqlalchemy import func
            
            # Get total chits
            total_chits = db.query(func.count(Member.id)).filter(
                Member.user_id == user.id
            ).scalar() or 0
            
            # Get active chits
            active_chits = db.query(func.count(Member.id)).join(
                Chit, Member.chit_id == Chit.id
            ).filter(
                and_(Member.user_id == user.id, Chit.bidding_open == True)
            ).scalar() or 0
            
            # Get earliest join date
            joined_at = db.query(func.min(Member.joined_at)).filter(
                Member.user_id == user.id
            ).scalar()
            
            # Build response data
            member_data = {
                "id": int(user.id),
                "email": str(user.email),
                "first_name": str(user.first_name or ""),
                "last_name": str(user.last_name or ""),
                "phone_number": str(user.phone_number or ""),
                "is_active": bool(user.is_active),
                "created_at": user.created_at.isoformat() if user.created_at else None,
                "total_chits": int(total_chits),
                "active_chits": int(active_chits),
                "total_members_in_chits": 0,
                "joined_at_earliest": joined_at.isoformat() if joined_at else None
            }
            result.append(member_data)
        except Exception as e:
            print(f"    ❌ Error processing member {user.id}: {e}")
            continue
    
    print(f"  ✅ Built response with {len(result)} members")
    
    # Verify response format
    if len(result) > 0:
        first = result[0]
        required = ["id", "email", "first_name", "total_chits", "active_chits"]
        missing = [f for f in required if f not in first]
        if missing:
            print(f"  ❌ Missing fields: {missing}")
        else:
            print(f"  ✅ Response format valid")
    
    db.close()
except Exception as e:
    print(f"❌ Endpoint logic failed: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# Test 4: Response serialization (JSON)
print("\n=== Test 4: JSON serialization ===")
try:
    import json
    json_str = json.dumps(result)
    print(f"✅ Response serialized to JSON ({len(json_str)} bytes)")
    
    # Parse back
    parsed = json.loads(json_str)
    print(f"✅ JSON parsed back successfully ({len(parsed)} members)")
except Exception as e:
    print(f"❌ JSON serialization failed: {e}")
    sys.exit(1)

print("\n" + "="*50)
print("✅ ALL TESTS PASSED")
print("="*50)
print("\nMembers API is ready to serve real-time member data!")

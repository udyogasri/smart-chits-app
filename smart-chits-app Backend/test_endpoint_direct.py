#!/usr/bin/env python3
"""
Test the actual endpoint function to see where the error occurs
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.db.database import SessionLocal
from app.models.user_model import User
from app.api.routes.member_routes import get_organization_members
import traceback

# Simulate the dependencies
db = SessionLocal()

try:
    # Get a real admin user from DB
    admin = db.query(User).filter(User.email == "kondetiganesh43@gmail.com").first()
    if not admin:
        print("❌ Admin not found")
        sys.exit(1)
    
    print(f"✅ Found admin: {admin.email}, role: {admin.role}, org_id: {admin.organization_id}")
    
    # Call the endpoint function directly with the real admin user
    print("\nCalling get_organization_members()...")
    result = get_organization_members(
        skip=0,
        limit=100,
        db=db,
        current_user=admin
    )
    
    print(f"✅ Endpoint returned: {len(result) if isinstance(result, list) else 'non-list'} members")
    if isinstance(result, list) and len(result) > 0:
        print(f"✅ First member: {result[0]}")
    
except Exception as e:
    print(f"❌ Error calling endpoint: {str(e)}")
    traceback.print_exc()
finally:
    db.close()

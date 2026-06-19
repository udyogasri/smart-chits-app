#!/usr/bin/env python3
"""
Script to check and fix admin user credentials
"""
import sys
import os

# Add app directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.db.database import SessionLocal, engine
from app.models.user_model import User
from app.models.organization_model import Organization
from app.utils.hashing import hash_password, verify_password
from sqlalchemy.orm import Session

def check_admin_user(db: Session):
    """Check if admin user exists and has correct role"""
    email = "kondetiganesh43@gmail.com"
    password = "Kondeti@07"
    
    print(f"\n=== Checking Admin User ===")
    print(f"Email: {email}")
    
    # Check in User table
    user = db.query(User).filter(User.email == email).first()
    
    if not user:
        print(f"❌ User not found in User table")
        print(f"\nAttempting to create admin user...")
        
        # Create new admin user
        hashed_pwd = hash_password(password)
        new_admin = User(
            email=email,
            first_name="Admin",
            last_name="User",
            name="Admin User",
            hashed_password=hashed_pwd,
            role="admin",
            is_active=True,
            phone_number="",
        )
        db.add(new_admin)
        db.commit()
        db.refresh(new_admin)
        print(f"✅ Admin user created successfully!")
        print(f"   - ID: {new_admin.id}")
        print(f"   - Email: {new_admin.email}")
        print(f"   - Role: {new_admin.role}")
        print(f"   - Organization ID: {new_admin.organization_id}")
        return new_admin
    
    print(f"✅ User found in database!")
    print(f"   - ID: {user.id}")
    print(f"   - Email: {user.email}")
    print(f"   - Role: {user.role}")
    print(f"   - First Name: {user.first_name}")
    print(f"   - Last Name: {user.last_name}")
    print(f"   - Organization ID: {user.organization_id}")
    print(f"   - Is Active: {user.is_active}")
    
    # Check if role is "admin"
    if user.role != "admin":
        print(f"\n⚠️  Role is '{user.role}', but should be 'admin'")
        print(f"Updating role to 'admin'...")
        user.role = "admin"
        db.commit()
        db.refresh(user)
        print(f"✅ Role updated to 'admin'")
    
    # Verify password
    if user.hashed_password:
        try:
            if verify_password(password, user.hashed_password):
                print(f"✅ Password is correct")
            else:
                print(f"❌ Password is incorrect!")
                print(f"Updating password...")
                user.hashed_password = hash_password(password)
                db.commit()
                db.refresh(user)
                print(f"✅ Password updated")
        except Exception as e:
            print(f"❌ Error verifying password: {e}")
            print(f"Updating password...")
            user.hashed_password = hash_password(password)
            db.commit()
            db.refresh(user)
            print(f"✅ Password updated")
    else:
        print(f"❌ No password hash found!")
        print(f"Setting password...")
        user.hashed_password = hash_password(password)
        db.commit()
        db.refresh(user)
        print(f"✅ Password set")
    
    # Check if organization exists and is assigned
    if user.organization_id:
        org = db.query(Organization).filter(Organization.id == user.organization_id).first()
        if org:
            print(f"✅ Organization found: {org.organization_name} (ID: {org.id})")
        else:
            print(f"⚠️  Organization ID {user.organization_id} not found in database")
    else:
        print(f"⚠️  Organization ID is not set (None)")
        # Try to assign an organization if any exist
        org = db.query(Organization).first()
        if org:
            print(f"   Assigning to organization: {org.organization_name} (ID: {org.id})")
            user.organization_id = org.id
            db.commit()
            db.refresh(user)
            print(f"✅ Organization assigned")
        else:
            print(f"   No organizations found in database")
    
    return user

if __name__ == "__main__":
    db = SessionLocal()
    try:
        user = check_admin_user(db)
        print(f"\n=== Summary ===")
        print(f"Admin user is ready for login!")
        print(f"Email: {user.email}")
        print(f"Role: {user.role}")
    finally:
        db.close()

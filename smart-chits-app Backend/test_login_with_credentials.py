#!/usr/bin/env python3
"""
Test login system with provided credentials
"""
import sys
import requests
import json
from app.db.database import SessionLocal
from app.models.user_model import User
from app.models.organization_model import Organization
from app.utils.hashing import verify_password

# Test credentials
EMAIL = "kondetiganesh43@gmail.com"
PASSWORD = "Kondeti@07"
API_URL = "http://localhost:8000"

def test_database_user():
    """Check if user exists in database"""
    print("\n=== Testing Database ===")
    db = SessionLocal()
    
    try:
        # Check User table
        user = db.query(User).filter(User.email == EMAIL).first()
        if user:
            print(f"✓ User found in User table: {user.email}")
            print(f"  - ID: {user.id}")
            print(f"  - Role: {user.role}")
            print(f"  - First Name: {user.first_name}")
            print(f"  - Last Name: {user.last_name}")
            print(f"  - Hashed Password: {user.hashed_password[:20]}..." if user.hashed_password else "  - Hashed Password: None")
            
            # Test password verification
            if user.hashed_password:
                try:
                    is_valid = verify_password(PASSWORD, user.hashed_password)
                    print(f"  - Password Verification: {'✓ VALID' if is_valid else '✗ INVALID'}")
                except Exception as e:
                    print(f"  - Password Verification Error: {str(e)}")
            return user
        else:
            print(f"✗ User NOT found in User table: {EMAIL}")
        
        # Check Organization table
        org = db.query(Organization).filter(Organization.email == EMAIL).first()
        if org:
            print(f"✓ Organization found: {org.email}")
            print(f"  - Organization Name: {org.organization_name}")
            print(f"  - ID: {org.id}")
            
            if org.password:
                try:
                    is_valid = verify_password(PASSWORD, org.password)
                    print(f"  - Password Verification: {'✓ VALID' if is_valid else '✗ INVALID'}")
                except Exception as e:
                    print(f"  - Password Verification Error: {str(e)}")
            return org
        else:
            print(f"✗ Organization NOT found: {EMAIL}")
            
    finally:
        db.close()

def test_api_login():
    """Test login via API endpoint"""
    print("\n=== Testing API Login ===")
    
    try:
        response = requests.post(
            f"{API_URL}/auth/login",
            json={
                "email": EMAIL,
                "password": PASSWORD
            },
            timeout=10,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"API Response Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✓ Login Successful!")
            print(f"  - Token Type: {data.get('token_type')}")
            print(f"  - User Role: {data.get('role')}")
            print(f"  - User Email: {data.get('user', {}).get('email')}")
            print(f"  - Access Token: {data.get('access_token', 'N/A')[:50]}...")
            return True
        else:
            print(f"✗ Login Failed!")
            print(f"  - Response: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print(f"✗ Connection Error: Cannot reach API at {API_URL}")
        print("  Make sure the backend is running")
        return False
    except Exception as e:
        print(f"✗ Error: {str(e)}")
        return False

if __name__ == "__main__":
    print(f"Testing Login with Email: {EMAIL}")
    print(f"Testing Login with Password: {PASSWORD}")
    
    # Test database
    user = test_database_user()
    
    # Test API
    api_success = test_api_login()
    
    print("\n=== Summary ===")
    if user:
        print("✓ User exists in database")
    else:
        print("✗ User does NOT exist in database - CREATE USER FIRST")
    
    if api_success:
        print("✓ API login working")
    else:
        print("✗ API login NOT working")

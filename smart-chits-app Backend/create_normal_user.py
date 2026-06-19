#!/usr/bin/env python3
"""
Create a normal user for testing
"""
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.user_model import User
from app.utils.hashing import hash_password

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)
db = Session()

try:
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == "normaluser@example.com").first()
    
    if existing_user:
        print(f"User already exists: {existing_user.email}")
    else:
        # Create new normal user
        new_user = User(
            email="normaluser@example.com",
            name="Normal User",
            first_name="Normal",
            last_name="User",
            phone_number="9876543210",
            hashed_password=hash_password("Normal@123"),
            role="user",  # Normal user role
            is_active=True,
            branch_id=None  # No branch restriction
        )
        db.add(new_user)
        db.commit()
        print("✅ Normal user created successfully!")
    
    print("\n" + "="*70)
    print("NORMAL USER CREDENTIALS")
    print("="*70)
    print("Email:    normaluser@example.com")
    print("Password: Normal@123")
    print("Role:     user (Normal Member)")
    print("="*70)
    print("\n💡 This user can:")
    print("   • View their chit groups")
    print("   • Make payments")
    print("   • View auctions")
    print("   • Access member dashboard")
    print("\n❌ This user CANNOT:")
    print("   • Access admin pages")
    print("   • Manage members/payments/auctions")
    print("="*70 + "\n")
    
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
finally:
    db.close()

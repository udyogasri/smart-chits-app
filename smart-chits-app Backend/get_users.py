#!/usr/bin/env python3
"""
Get all users from database
"""
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.user_model import User

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)
db = Session()

try:
    users = db.query(User).limit(20).all()
    print("\n" + "="*110)
    print("AVAILABLE USERS IN DATABASE".center(110))
    print("="*110)
    print(f"{'#':<3} {'Email':<40} {'Role':<15} {'Name':<30}")
    print("-"*110)
    
    for idx, user in enumerate(users, 1):
        email = user.email or "N/A"
        role = user.role or "N/A"
        name = user.name or "N/A"
        print(f"{idx:<3} {email:<40} {role:<15} {name:<30}")
    
    print("="*110)
    print("\n✅ WORKING CREDENTIALS:")
    print("-"*110)
    print("Email:    kondetiganesh43@gmail.com")
    print("Password: Kondeti@07")
    print("Role:     admin (Branch Admin)")
    print("-"*110)
    print("\n💡 TIP:")
    print("   • Passwords are hashed in database - you can't see them")
    print("   • Use the email above to login")
    print("   • This is a branch admin account (can see Branch 9 data)")
    print("="*110 + "\n")
    
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
finally:
    db.close()

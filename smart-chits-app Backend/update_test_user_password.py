#!/usr/bin/env python3
"""Update test user password"""

import sys
sys.path.insert(0, '/d/KMEdTech/smart-chits-app/smart-chits-app Backend')

from app.db.database import SessionLocal
from app.models.user_model import User
from app.utils.hashing import hash_password

db = SessionLocal()

# Update the test user password
user = db.query(User).filter(User.email == "testuser@example.com").first()
if user:
    user.hashed_password = hash_password("password123")
    db.commit()
    print(f"Updated password for {user.email}")
else:
    print("User not found")

db.close()

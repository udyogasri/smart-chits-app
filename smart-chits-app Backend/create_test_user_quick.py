#!/usr/bin/env python3
"""Create a test regular user for frontend testing"""

import sys
sys.path.insert(0, '/d/KMEdTech/smart-chits-app/smart-chits-app Backend')

from app.db.database import SessionLocal
from app.models.user_model import User
from app.utils.hashing import hash_password
from datetime import datetime

db = SessionLocal()

# Check if user already exists
existing = db.query(User).filter(User.email == "testuser@example.com").first()
if existing:
    print(f"User already exists: {existing.email}")
    db.close()
    sys.exit(0)

# Create a test regular user
test_user = User(
    first_name="Test",
    last_name="User",
    email="testuser@example.com",
    phone_number="1234567890",
    hashed_password=hash_password("testpass123"),
    role="user",
    is_active=True,
    created_at=datetime.utcnow()
)

db.add(test_user)
db.commit()
print(f"Created test user: testuser@example.com with password: testpass123")
db.close()

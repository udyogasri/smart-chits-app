import os
import sys
sys.path.insert(0, os.getcwd())

from app.db.database import SessionLocal
from app.models.user_model import User
from app.models.member_model import Member
from app.utils.hashing import hash_password
from datetime import datetime

db = SessionLocal()

try:
    # Create a normal user
    user_email = "testuser@example.com"
    user = db.query(User).filter(User.email == user_email).first()
    
    if not user:
        user = User(
            email=user_email,
            hashed_password=hash_password("Test@1234"),
            name="Test User",
            role="user",
            is_active=True,
            created_at=datetime.utcnow()
        )
        db.add(user)
        db.commit()
        print(f"✓ Created user: {user_email}")
    else:
        print(f"✓ User already exists: {user_email}")
        # Update password
        user.hashed_password = hash_password("Test@1234")
        db.commit()
        print(f"✓ Updated password for: {user_email}")
    
    # Add user to some chits (chit IDs 31, 32, 33)
    for chit_id in [31, 32, 33]:
        member = db.query(Member).filter(
            Member.user_id == user.id,
            Member.chit_id == chit_id
        ).first()
        
        if not member:
            member = Member(
                user_id=user.id,
                chit_id=chit_id,
                joined_at=datetime.utcnow()
            )
            db.add(member)
            print(f"✓ Added user to chit {chit_id}")
    
    db.commit()
    print(f"\n✓ Test user setup complete!")
    print(f"Email: {user_email}")
    print(f"Password: Test@1234")
    
except Exception as e:
    print(f"✗ Error: {e}")
    db.rollback()
finally:
    db.close()

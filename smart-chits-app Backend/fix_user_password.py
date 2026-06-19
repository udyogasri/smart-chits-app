#!/usr/bin/env python3
"""
Update user password and test it
"""
from app.db.database import SessionLocal
from app.models.user_model import User
from app.utils.hashing import hash_password, verify_password

# Test credentials
EMAIL = "kondetiganesh43@gmail.com"
PASSWORD = "Kondeti@07"

def update_user_password():
    """Update user password with fresh hash"""
    db = SessionLocal()
    
    try:
        # Find user
        user = db.query(User).filter(User.email == EMAIL).first()
        if not user:
            print(f"✗ User not found: {EMAIL}")
            return False
        
        print(f"✓ Found user: {user.email}")
        print(f"  Old hash: {user.hashed_password[:30]}...")
        
        # Hash the new password
        new_hash = hash_password(PASSWORD)
        print(f"  New hash: {new_hash[:30]}...")
        
        # Update password
        user.hashed_password = new_hash
        db.commit()
        db.refresh(user)
        
        print(f"✓ Password updated successfully")
        
        # Test verification
        try:
            is_valid = verify_password(PASSWORD, user.hashed_password)
            print(f"✓ Password verification: {'VALID' if is_valid else 'INVALID'}")
            return is_valid
        except Exception as e:
            print(f"✗ Verification error: {e}")
            return False
            
    except Exception as e:
        print(f"✗ Error: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        db.close()

if __name__ == "__main__":
    print(f"Updating password for: {EMAIL}")
    print(f"New password: {PASSWORD}\n")
    
    success = update_user_password()
    
    if success:
        print("\n✓ Ready for login testing")
    else:
        print("\n✗ Password update failed")

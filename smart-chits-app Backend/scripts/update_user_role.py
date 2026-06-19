import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

def update_user_role():
    """Update user role to platform_admin"""
    print(f"Connecting to database: {DATABASE_URL}")
    engine = create_engine(DATABASE_URL)
    
    with engine.begin() as conn:
        # Update user role to platform_admin
        result = conn.execute(text(
            "UPDATE users SET role = 'platform_admin' WHERE email = 'sasidharroyal8@gmail.com'"
        ))
        print(f"Updated {result.rowcount} user(s) to platform_admin")
        
        # Verify the update
        result = conn.execute(text(
            "SELECT email, role FROM users WHERE email = 'sasidharroyal8@gmail.com'"
        ))
        user = result.fetchone()
        if user:
            print(f"User updated: {user[0]}, Role: {user[1]}")
        else:
            print("User not found")
    
    print("✅ User role updated successfully")

if __name__ == "__main__":
    update_user_role()

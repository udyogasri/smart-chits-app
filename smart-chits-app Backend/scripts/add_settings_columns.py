"""
Migration script to add settings fields (avatar, preferences, notifications) to users and organizations tables
"""
import sys
import os

# Add the parent directory to the path to import from app
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from app.db.database import engine

def migrate():
    """Add settings columns to users and organizations tables"""
    with engine.connect() as conn:
        # Add columns to users table
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar TEXT"))
            print("✓ Added avatar column to users table")
        except Exception as e:
            print(f"✗ Error adding avatar to users: {e}")
        
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS preferences JSON"))
            print("✓ Added preferences column to users table")
        except Exception as e:
            print(f"✗ Error adding preferences to users: {e}")
        
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS notifications JSON"))
            print("✓ Added notifications column to users table")
        except Exception as e:
            print(f"✗ Error adding notifications to users: {e}")
        
        # Add columns to organizations table
        try:
            conn.execute(text("ALTER TABLE organizations ADD COLUMN IF NOT EXISTS avatar TEXT"))
            print("✓ Added avatar column to organizations table")
        except Exception as e:
            print(f"✗ Error adding avatar to organizations: {e}")
        
        try:
            conn.execute(text("ALTER TABLE organizations ADD COLUMN IF NOT EXISTS preferences JSON"))
            print("✓ Added preferences column to organizations table")
        except Exception as e:
            print(f"✗ Error adding preferences to organizations: {e}")
        
        try:
            conn.execute(text("ALTER TABLE organizations ADD COLUMN IF NOT EXISTS notifications JSON"))
            print("✓ Added notifications column to organizations table")
        except Exception as e:
            print(f"✗ Error adding notifications to organizations: {e}")
        
        conn.commit()
        print("\n✅ Migration completed successfully!")

if __name__ == "__main__":
    migrate()

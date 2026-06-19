#!/usr/bin/env python3
"""
Add database indexes to optimize member queries
"""
import sys
import os
from sqlalchemy import text

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.db.database import engine

def add_indexes():
    """Create indexes for faster member queries"""
    
    with engine.connect() as conn:
        indexes = [
            # Member table indexes
            "CREATE INDEX IF NOT EXISTS idx_members_user_id ON members(user_id)",
            "CREATE INDEX IF NOT EXISTS idx_members_chit_id ON members(chit_id)",
            "CREATE INDEX IF NOT EXISTS idx_members_user_chit ON members(user_id, chit_id)",
            
            # Chit table indexes
            "CREATE INDEX IF NOT EXISTS idx_chits_organization_id ON chits(organization_id)",
            "CREATE INDEX IF NOT EXISTS idx_chits_bidding_open ON chits(bidding_open)",
            "CREATE INDEX IF NOT EXISTS idx_chits_org_bidding ON chits(organization_id, bidding_open)",
            
            # User table indexes
            "CREATE INDEX IF NOT EXISTS idx_users_organization_id ON users(organization_id)",
            "CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)",
            "CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)",
        ]
        
        for index_sql in indexes:
            try:
                conn.execute(text(index_sql))
                print(f"✅ {index_sql.split('ON')[0].strip()}")
            except Exception as e:
                if "already exists" not in str(e).lower():
                    print(f"⚠️  {index_sql.split('ON')[0].strip()} - {str(e)}")
        
        conn.commit()
    
    print("\n✅ Database indexes optimized!")

if __name__ == "__main__":
    try:
        print("Creating database indexes for faster queries...\n")
        add_indexes()
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()

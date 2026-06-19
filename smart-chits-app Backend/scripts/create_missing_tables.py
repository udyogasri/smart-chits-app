#!/usr/bin/env python3
"""
Script to create missing tables in the database
"""

import psycopg2
from psycopg2.extras import RealDictCursor
import os
from dotenv import load_dotenv

load_dotenv()

def get_db_connection():
    """Get database connection"""
    DATABASE_URL = os.getenv("DATABASE_URL")
    if not DATABASE_URL:
        raise ValueError("DATABASE_URL not found in environment variables")
    
    # Parse DATABASE_URL: postgresql://user:password@host:port/dbname
    import re
    match = re.match(r'postgresql://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)', DATABASE_URL)
    if not match:
        raise ValueError("Invalid DATABASE_URL format")
    
    user, password, host, port, dbname = match.groups()
    
    return psycopg2.connect(
        host=host,
        port=port,
        database=dbname,
        user=user,
        password=password
    )

def create_members_table():
    """Create members table if it doesn't exist"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Check if members table exists
        cursor.execute("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'members'
            );
        """)
        table_exists = cursor.fetchone()[0]
        
        if not table_exists:
            print("Creating members table...")
            cursor.execute("""
                CREATE TABLE members (
                    id SERIAL PRIMARY KEY,
                    chit_id INTEGER NOT NULL REFERENCES chits(id) ON DELETE CASCADE,
                    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
                
                CREATE INDEX idx_members_chit_id ON members(chit_id);
                CREATE INDEX idx_members_user_id ON members(user_id);
            """)
            conn.commit()
            print("Members table created successfully!")
        else:
            print("Members table already exists.")
        
    except Exception as e:
        conn.rollback()
        print(f"Error creating members table: {e}")
        raise
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    create_members_table()

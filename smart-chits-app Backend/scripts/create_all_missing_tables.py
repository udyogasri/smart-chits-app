#!/usr/bin/env python3
"""
Script to create all missing tables in the database
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

def create_missing_tables():
    """Create missing tables if they don't exist"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Check and create payments table
        cursor.execute("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'payments'
            );
        """)
        table_exists = cursor.fetchone()[0]
        
        if not table_exists:
            print("Creating payments table...")
            cursor.execute("""
                CREATE TABLE payments (
                    id SERIAL PRIMARY KEY,
                    chit_id INTEGER NOT NULL REFERENCES chits(id) ON DELETE CASCADE,
                    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    amount FLOAT NOT NULL,
                    month INTEGER DEFAULT 1,
                    paid_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
                
                CREATE INDEX idx_payments_chit_id ON payments(chit_id);
                CREATE INDEX idx_payments_user_id ON payments(user_id);
            """)
            print("Payments table created successfully!")
        else:
            print("Payments table already exists.")
        
        # Check and create auctions table
        cursor.execute("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'auctions'
            );
        """)
        table_exists = cursor.fetchone()[0]
        
        if not table_exists:
            print("Creating auctions table...")
            cursor.execute("""
                CREATE TABLE auctions (
                    id SERIAL PRIMARY KEY,
                    auction_number VARCHAR UNIQUE,
                    chit_group_id INTEGER NOT NULL REFERENCES chits(id) ON DELETE CASCADE,
                    branch_id INTEGER REFERENCES branches(id),
                    auction_month INTEGER DEFAULT 1 NOT NULL,
                    auction_date TIMESTAMP WITH TIME ZONE,
                    total_pool_amount FLOAT NOT NULL DEFAULT 0.0,
                    foreman_commission_percent FLOAT NOT NULL DEFAULT 0.0,
                    foreman_commission_amount FLOAT NOT NULL DEFAULT 0.0,
                    max_bid_limit FLOAT NOT NULL DEFAULT 0.0,
                    status VARCHAR NOT NULL DEFAULT 'PENDING',
                    winner_member_id INTEGER REFERENCES members(id),
                    winning_bid_amount FLOAT,
                    winner_prize_amount FLOAT,
                    dividend_per_member FLOAT,
                    started_at TIMESTAMP WITH TIME ZONE,
                    ended_at TIMESTAMP WITH TIME ZONE,
                    duration_minutes INTEGER NOT NULL DEFAULT 10,
                    created_by INTEGER REFERENCES users(id),
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE
                );

                CREATE INDEX idx_auctions_chit_group_id ON auctions(chit_group_id);
                CREATE INDEX idx_auctions_branch_id ON auctions(branch_id);
                CREATE INDEX idx_auctions_winner_member_id ON auctions(winner_member_id);
                CREATE INDEX idx_auctions_created_by ON auctions(created_by);
            """)
            print("Auctions table created successfully!")
        else:
            print("Auctions table already exists.")
        
        conn.commit()
        print("All missing tables checked/created successfully!")
        
    except Exception as e:
        conn.rollback()
        print(f"Error creating tables: {e}")
        raise
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    create_missing_tables()

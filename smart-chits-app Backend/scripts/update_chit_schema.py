#!/usr/bin/env python3
"""
Script to update the chits table schema to match the new model
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

def update_chits_table():
    """Update chits table with new columns"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Check current columns
        cursor.execute("""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'chits'
            ORDER BY ordinal_position
        """)
        existing_columns = {row[0]: row[1] for row in cursor.fetchall()}
        print("Existing columns:", existing_columns)
        
        # Add missing columns
        columns_to_add = {
            'chit_fund': 'DOUBLE PRECISION',
            'installment_amount': 'DOUBLE PRECISION', 
            'installment_frequency': 'INTEGER',
            'total_months': 'INTEGER',
            'description': 'TEXT',
            'organization_id': 'INTEGER',
            'created_by': 'INTEGER',
            'created_at': 'TIMESTAMP WITH TIME ZONE',
            'updated_at': 'TIMESTAMP WITH TIME ZONE'
        }
        
        for column, data_type in columns_to_add.items():
            if column not in existing_columns:
                print(f"Adding column: {column}")
                if column in ['created_at']:
                    cursor.execute(f"""
                        ALTER TABLE chits 
                        ADD COLUMN {column} {data_type} DEFAULT NOW()
                    """)
                elif column in ['installment_frequency']:
                    cursor.execute(f"""
                        ALTER TABLE chits 
                        ADD COLUMN {column} {data_type} DEFAULT 1
                    """)
                elif column in ['current_month']:
                    cursor.execute(f"""
                        ALTER TABLE chits 
                        ADD COLUMN {column} {data_type} DEFAULT 1
                    """)
                elif column in ['bidding_open']:
                    cursor.execute(f"""
                        ALTER TABLE chits 
                        ADD COLUMN {column} BOOLEAN DEFAULT FALSE
                    """)
                else:
                    cursor.execute(f"""
                        ALTER TABLE chits 
                        ADD COLUMN {column} {data_type}
                    """)
        
        # Drop old columns that are no longer needed
        old_columns = ['total_members', 'monthly_amount', 'duration', 'total_chit_amount']
        for column in old_columns:
            if column in existing_columns:
                print(f"Dropping old column: {column}")
                cursor.execute(f"ALTER TABLE chits DROP COLUMN {column}")
        
        conn.commit()
        print("Database schema updated successfully!")
        
    except Exception as e:
        conn.rollback()
        print(f"Error updating schema: {e}")
        raise
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    update_chits_table()

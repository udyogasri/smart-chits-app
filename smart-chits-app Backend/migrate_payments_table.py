#!/usr/bin/env python3
"""
Direct SQL migration to add missing columns to payments table
"""
import sys
sys.path.insert(0, 'd:\\KMEdTech\\smart-chits-app\\smart-chits-app Backend')

from app.db.database import engine
import psycopg2
from psycopg2 import sql

try:
    # Get connection string from environment or hardcode it
    conn = psycopg2.connect(
        host='localhost',
        port=5433,
        database='smart_chits_db',
        user='postgres',
        password='Gani'
    )
    
    cursor = conn.cursor()
    
    # Define the ALTER TABLE statements
    migrations = [
        """
        ALTER TABLE payments
        ADD COLUMN IF NOT EXISTS due_date TIMESTAMP WITHOUT TIME ZONE;
        """,
        """
        ALTER TABLE payments
        ADD COLUMN IF NOT EXISTS penalty_amount NUMERIC(15, 2) DEFAULT 0.0;
        """,
        """
        ALTER TABLE payments
        ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50);
        """,
        """
        ALTER TABLE payments
        ADD COLUMN IF NOT EXISTS transaction_id VARCHAR(255);
        """
    ]
    
    print("Running database migrations...")
    for i, migration in enumerate(migrations, 1):
        try:
            cursor.execute(migration)
            conn.commit()
            print(f"✓ Migration {i} executed successfully")
        except Exception as e:
            print(f"✗ Migration {i} failed: {e}")
            conn.rollback()
    
    # Verify the columns exist
    cursor.execute("""
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='payments' 
        ORDER BY column_name;
    """)
    
    columns = cursor.fetchall()
    print(f"\n✓ Payments table now has {len(columns)} columns:")
    for col in columns:
        print(f"  - {col[0]}")
    
    cursor.close()
    conn.close()
    print("\n✓ Database migration completed successfully!")

except psycopg2.Error as e:
    print(f"❌ Database error: {e}")
    sys.exit(1)
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

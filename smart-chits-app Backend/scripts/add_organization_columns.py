#!/usr/bin/env python3
"""
Migration script to add new columns to organizations table
Run this script to update database schema for organization registration
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from app.db.session import SessionLocal

def add_organization_columns():
    """Add new columns to organizations table"""
    db = SessionLocal()
    
    try:
        # SQL commands to add new columns
        sql_commands = [
            # Drop existing name column if it exists (to avoid conflicts)
            "ALTER TABLE organizations DROP COLUMN IF EXISTS name;",
            
            # Add admin user details columns
            "ALTER TABLE organizations ADD COLUMN IF NOT EXISTS first_name VARCHAR;",
            "ALTER TABLE organizations ADD COLUMN IF NOT EXISTS last_name VARCHAR;",
            "ALTER TABLE organizations ADD COLUMN IF NOT EXISTS email VARCHAR;",
            "ALTER TABLE organizations ADD COLUMN IF NOT EXISTS phone_number VARCHAR;",
            "ALTER TABLE organizations ADD COLUMN IF NOT EXISTS password VARCHAR;",
            "ALTER TABLE organizations ADD COLUMN IF NOT EXISTS confirm_password VARCHAR;",
            
            # Add organization details columns
            "ALTER TABLE organizations ADD COLUMN IF NOT EXISTS organization_name VARCHAR;",
            "ALTER TABLE organizations ADD COLUMN IF NOT EXISTS organization_type VARCHAR;",
            "ALTER TABLE organizations ADD COLUMN IF NOT EXISTS registration_number VARCHAR;",
            "ALTER TABLE organizations ADD COLUMN IF NOT EXISTS company_email VARCHAR;",
            "ALTER TABLE organizations ADD COLUMN IF NOT EXISTS company_phone_number VARCHAR;",
            
            # Add unique constraints
            "ALTER TABLE organizations ADD CONSTRAINT IF NOT EXISTS unique_organization_email UNIQUE (email);",
            "ALTER TABLE organizations ADD CONSTRAINT IF NOT EXISTS unique_registration_number UNIQUE (registration_number);",
            
            # Create index for email
            "CREATE INDEX IF NOT EXISTS idx_organization_email ON organizations(email);"
        ]
        
        for sql in sql_commands:
            print(f"Executing: {sql}")
            db.execute(text(sql))
        
        db.commit()
        print("✅ Organization table columns added successfully!")
        
    except Exception as e:
        print(f"❌ Error adding organization columns: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    print("🔄 Starting organization table migration...")
    add_organization_columns()
    print("🎉 Migration completed!")

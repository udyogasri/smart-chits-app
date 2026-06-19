import os
import sys
from dotenv import load_dotenv
from sqlalchemy import text, inspect

load_dotenv()

# Add the app directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.db.database import engine

def add_branch_columns():
    """Add missing columns to branches table"""
    with engine.begin() as conn:
        inspector = inspect(conn)
        
        if "branches" in inspector.get_table_names():
            columns = [col["name"] for col in inspector.get_columns("branches")]
            
            print("Current branches table columns:", columns)
            
            # Add phone column if not exists
            if "phone" not in columns:
                print("Adding 'phone' column...")
                conn.execute(text(
                    "ALTER TABLE branches ADD COLUMN phone VARCHAR"
                ))
                print("✓ Added 'phone' column")
            
            # Add manager_name column if not exists
            if "manager_name" not in columns:
                print("Adding 'manager_name' column...")
                conn.execute(text(
                    "ALTER TABLE branches ADD COLUMN manager_name VARCHAR"
                ))
                print("✓ Added 'manager_name' column")
            
            # Add code column if not exists
            if "code" not in columns:
                print("Adding 'code' column...")
                conn.execute(text(
                    "ALTER TABLE branches ADD COLUMN code VARCHAR UNIQUE"
                ))
                print("✓ Added 'code' column")
            
            # Add address column if not exists
            if "address" not in columns:
                print("Adding 'address' column...")
                conn.execute(text(
                    "ALTER TABLE branches ADD COLUMN address TEXT"
                ))
                print("✓ Added 'address' column")
            
            # Add email column if not exists
            if "email" not in columns:
                print("Adding 'email' column...")
                conn.execute(text(
                    "ALTER TABLE branches ADD COLUMN email VARCHAR"
                ))
                print("✓ Added 'email' column")
            
            # Add is_active column if not exists
            if "is_active" not in columns:
                print("Adding 'is_active' column...")
                conn.execute(text(
                    "ALTER TABLE branches ADD COLUMN is_active BOOLEAN DEFAULT TRUE"
                ))
                print("✓ Added 'is_active' column")
            
            # Add created_at column if not exists
            if "created_at" not in columns:
                print("Adding 'created_at' column...")
                conn.execute(text(
                    "ALTER TABLE branches ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP"
                ))
                print("✓ Added 'created_at' column")
            
            # Add updated_at column if not exists
            if "updated_at" not in columns:
                print("Adding 'updated_at' column...")
                conn.execute(text(
                    "ALTER TABLE branches ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE"
                ))
                print("✓ Added 'updated_at' column")
            
            # Add settings column if not exists
            if "settings" not in columns:
                print("Adding 'settings' column...")
                conn.execute(text(
                    "ALTER TABLE branches ADD COLUMN settings JSON"
                ))
                print("✓ Added 'settings' column")
            
            # Populate code for existing branches without codes
            print("\nPopulating codes for existing branches...")
            result = conn.execute(text("SELECT id, name FROM branches WHERE code IS NULL"))
            rows = result.fetchall()
            
            if rows:
                for idx, (branch_id, name) in enumerate(rows, 1):
                    code = f"BR{branch_id:04d}"
                    try:
                        conn.execute(text(
                            f"UPDATE branches SET code = :code WHERE id = :id"
                        ), {"code": code, "id": branch_id})
                        print(f"  ✓ Set code '{code}' for branch ID {branch_id} ({name})")
                    except Exception as e:
                        print(f"  ✗ Error setting code for branch {branch_id}: {e}")
            
            # Make code NOT NULL (if we have codes now)
            print("\nVerifying code column constraints...")
            code_null_check = conn.execute(text("SELECT COUNT(*) FROM branches WHERE code IS NULL"))
            null_count = code_null_check.scalar()
            
            if null_count == 0:
                print("✓ All branches have codes assigned")
                try:
                    # Drop and recreate the constraint
                    conn.execute(text("ALTER TABLE branches ALTER COLUMN code SET NOT NULL"))
                    print("✓ Made code column NOT NULL")
                except Exception as e:
                    print(f"  Note: {e}")
            else:
                print(f"  ⚠ Warning: {null_count} branches still have NULL codes")
            
            print("\n✓ All missing columns added successfully!")
        else:
            print("Branches table does not exist. Creating it...")
            conn.execute(text("""
                CREATE TABLE branches (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR NOT NULL,
                    code VARCHAR UNIQUE NOT NULL,
                    address TEXT,
                    phone VARCHAR,
                    email VARCHAR,
                    manager_name VARCHAR,
                    is_active BOOLEAN DEFAULT TRUE,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP WITH TIME ZONE,
                    settings JSON
                )
            """))
            print("✓ Branches table created successfully!")

if __name__ == "__main__":
    try:
        add_branch_columns()
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()


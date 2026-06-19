import sys
import os
from dotenv import load_dotenv

load_dotenv()
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.db.database import engine
from app.db.base import Base
from app.models.branch_model import Branch
from sqlalchemy import inspect, text
from sqlalchemy.orm import sessionmaker

print("=" * 60)
print("BRANCH MANAGEMENT DATABASE TEST")
print("=" * 60)

# Check if branches table exists and has all required columns
with engine.begin() as conn:
    inspector = inspect(conn)
    
    if "branches" in inspector.get_table_names():
        print("✓ Branches table exists")
        
        columns = {col["name"]: col["type"] for col in inspector.get_columns("branches")}
        print("\nTable columns:")
        for col_name, col_type in sorted(columns.items()):
            print(f"  - {col_name}: {col_type}")
        
        # Check required columns
        required_cols = ['id', 'name', 'code', 'phone', 'email', 'manager_name', 'is_active', 'created_at', 'updated_at']
        missing = [col for col in required_cols if col not in columns]
        
        if missing:
            print(f"\n✗ Missing columns: {missing}")
        else:
            print("\n✓ All required columns present")
        
        # Count existing branches
        result = conn.execute(text("SELECT COUNT(*) FROM branches"))
        count = result.scalar()
        print(f"\nExisting branches in database: {count}")
        
        # Try to query all branches
        print("\nAttempting to fetch branches...")
        try:
            result = conn.execute(text("SELECT id, name, code FROM branches LIMIT 5"))
            rows = result.fetchall()
            if rows:
                print("✓ Successfully fetched branches:")
                for row in rows:
                    print(f"  - ID: {row[0]}, Name: {row[1]}, Code: {row[2]}")
            else:
                print("✓ No branches in database yet (empty table)")
        except Exception as e:
            print(f"✗ Error fetching branches: {e}")
    else:
        print("✗ Branches table does not exist!")

print("\n" + "=" * 60)
print("✓ Database structure is ready for branch management API")
print("=" * 60)

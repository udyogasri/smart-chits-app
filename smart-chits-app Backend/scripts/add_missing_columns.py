import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

def add_missing_columns():
    """Add missing columns to chits table"""
    print(f"Connecting to database: {DATABASE_URL}")
    engine = create_engine(DATABASE_URL)
    
    with engine.begin() as conn:
        # Check if total_months column exists
        result = conn.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'chits' AND column_name = 'total_months'
        """))
        if result.fetchone():
            print("Column 'total_months' already exists")
        else:
            conn.execute(text("ALTER TABLE chits ADD COLUMN total_months INTEGER"))
            print("✅ Added column 'total_months' to chits table")
        
        # Check if current_month column exists
        result = conn.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'chits' AND column_name = 'current_month'
        """))
        if result.fetchone():
            print("Column 'current_month' already exists")
        else:
            conn.execute(text("ALTER TABLE chits ADD COLUMN current_month INTEGER DEFAULT 1"))
            print("✅ Added column 'current_month' to chits table")
        
        # Check if bidding_open column exists
        result = conn.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'chits' AND column_name = 'bidding_open'
        """))
        if result.fetchone():
            print("Column 'bidding_open' already exists")
        else:
            conn.execute(text("ALTER TABLE chits ADD COLUMN bidding_open BOOLEAN DEFAULT FALSE"))
            print("✅ Added column 'bidding_open' to chits table")
        
        # Check if installment_frequency column exists
        result = conn.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'chits' AND column_name = 'installment_frequency'
        """))
        if result.fetchone():
            print("Column 'installment_frequency' already exists")
        else:
            conn.execute(text("ALTER TABLE chits ADD COLUMN installment_frequency INTEGER DEFAULT 1"))
            print("✅ Added column 'installment_frequency' to chits table")
    
    print("✅ Database schema updated successfully")

if __name__ == "__main__":
    add_missing_columns()

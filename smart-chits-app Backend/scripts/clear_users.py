import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

def clear_all_users():
    """Delete all users and related data from the database"""
    print(f"Connecting to database: {DATABASE_URL}")
    engine = create_engine(DATABASE_URL)
    
    with engine.begin() as conn:
        # Delete in order of dependencies (child tables first)
        tables_to_clear = [
            "members",
            "notifications",
            "payments",
            "auctions",
            "chits",
            "users"
        ]
        
        for table in tables_to_clear:
            try:
                count_result = conn.execute(text(f"SELECT COUNT(*) FROM {table}"))
                count = count_result.scalar()
                if count > 0:
                    result = conn.execute(text(f"DELETE FROM {table}"))
                    print(f"Deleted {result.rowcount} records from {table}")
                else:
                    print(f"No records in {table}")
            except Exception as e:
                print(f"Error clearing {table}: {e}")
    
    print("✅ All data cleared successfully")

if __name__ == "__main__":
    clear_all_users()

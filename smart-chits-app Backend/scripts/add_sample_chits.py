from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.database import DATABASE_URL
from app.models.chit_model import Chit
from app.models.user_model import User

def add_sample_chits():
    # Create engine
    engine = create_engine(DATABASE_URL)
    Session = sessionmaker(bind=engine)
    session = Session()
    
    try:
        # Check if chits table is empty
        chit_count = session.query(Chit).count()
        
        if chit_count > 0:
            print(f"Chits table already has {chit_count} records. Skipping sample data insertion.")
            return
        
        # Get first user as creator
        user = session.query(User).first()
        if not user:
            print("No users found. Please create a user first.")
            return
        
        # Sample chit data
        sample_chits = [
            {
                "name": "Gold Savings Plan",
                "description": "Premium gold savings chit fund for long-term wealth creation",
                "chit_fund": 500000,
                "installment_amount": 25000,
                "installment_frequency": 1,
                "total_months": 20,
                "current_month": 1,
                "bidding_open": True,
                "created_by": user.id
            },
            {
                "name": "Silver Investment Plan",
                "description": "Mid-range silver investment plan for moderate returns",
                "chit_fund": 300000,
                "installment_amount": 15000,
                "installment_frequency": 1,
                "total_months": 20,
                "current_month": 1,
                "bidding_open": True,
                "created_by": user.id
            },
            {
                "name": "Bronze Starter Plan",
                "description": "Entry-level chit fund for first-time investors",
                "chit_fund": 100000,
                "installment_amount": 5000,
                "installment_frequency": 1,
                "total_months": 20,
                "current_month": 5,
                "bidding_open": True,
                "created_by": user.id
            },
            {
                "name": "Premium Diamond Plan",
                "description": "High-value chit fund for serious investors seeking maximum returns",
                "chit_fund": 1000000,
                "installment_amount": 50000,
                "installment_frequency": 1,
                "total_months": 20,
                "current_month": 10,
                "bidding_open": False,
                "created_by": user.id
            },
            {
                "name": "Monthly Savings Challenge",
                "description": "Short-term savings challenge for quick returns",
                "chit_fund": 50000,
                "installment_amount": 5000,
                "installment_frequency": 1,
                "total_months": 10,
                "current_month": 10,
                "bidding_open": False,
                "created_by": user.id
            }
        ]
        
        # Insert sample chits
        for chit_data in sample_chits:
            chit = Chit(**chit_data)
            session.add(chit)
        
        session.commit()
        print(f"Successfully added {len(sample_chits)} sample chit records to the database.")
        
        # Verify insertion
        new_count = session.query(Chit).count()
        print(f"Total chits in database: {new_count}")
        
    except Exception as e:
        print(f"Error adding sample chits: {e}")
        session.rollback()
    finally:
        session.close()

if __name__ == "__main__":
    add_sample_chits()

from app.db.database import SessionLocal
from app.models.auction_model import Auction
from datetime import datetime

db = SessionLocal()
try:
    # Create 3 auctions for Ganesh's branch (Branch ID = 9)
    new_auctions = [
        Auction(
            auction_number="AUC-GK-001",
            chit_group_id=28,
            branch_id=9,
            auction_month=5,
            auction_date=None,
            total_pool_amount=150000.0,
            foreman_commission_percent=5.0,
            foreman_commission_amount=7500.0,
            max_bid_limit=10000.0,
            status="PENDING",
            duration_minutes=10,
            created_by=14,
            created_at=datetime.now()
        ),
        Auction(
            auction_number="AUC-GK-002",
            chit_group_id=29,
            branch_id=9,
            auction_month=6,
            auction_date=None,
            total_pool_amount=75000.0,
            foreman_commission_percent=4.0,
            foreman_commission_amount=3000.0,
            max_bid_limit=5000.0,
            status="PENDING",
            duration_minutes=10,
            created_by=14,
            created_at=datetime.now()
        ),
        Auction(
            auction_number="AUC-GK-003",
            chit_group_id=30,
            branch_id=9,
            auction_month=7,
            auction_date=None,
            total_pool_amount=200000.0,
            foreman_commission_percent=6.0,
            foreman_commission_amount=12000.0,
            max_bid_limit=15000.0,
            status="PENDING",
            duration_minutes=10,
            created_by=14,
            created_at=datetime.now()
        ),
    ]
    
    db.add_all(new_auctions)
    db.commit()
    
    print(f"✅ Successfully created 3 auctions for Ganesh's branch (ID: 9)")
    print(f"\nNew auctions created:")
    for auction in new_auctions:
        print(f"  - {auction.auction_number}: ₹{auction.total_pool_amount} (Month {auction.auction_month})")
    
except Exception as e:
    print(f"❌ Error: {e}")
    db.rollback()
finally:
    db.close()

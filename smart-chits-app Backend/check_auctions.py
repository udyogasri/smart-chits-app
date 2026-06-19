from app.db.database import SessionLocal
from app.models.auction_model import Auction
from app.models.user_model import User

db = SessionLocal()
try:
    # Check auctions
    auctions = db.query(Auction).all()
    print(f'Total auctions in DB: {len(auctions)}')
    if auctions:
        for auction in auctions[:5]:
            print(f'  - ID: {auction.id}, Number: {auction.auction_number}, Branch: {auction.branch_id}, Status: {auction.status}')
    
    # Check admin user
    admin_user = db.query(User).filter(User.email == 'testadmin@smartchits.com').first()
    if admin_user:
        print(f'\nAdmin user: {admin_user.email}, Role: {admin_user.role}, Branch ID: {admin_user.branch_id}')
    else:
        print('\nAdmin user not found')
finally:
    db.close()

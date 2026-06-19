from app.db.database import SessionLocal
from app.models.user_model import User
from app.models.auction_model import Auction

db = SessionLocal()
try:
    # Check Ganesh's admin user
    ganesh = db.query(User).filter(User.email == 'kondetiganesh43@gmail.com').first()
    print("=" * 60)
    print("GANESH KONDETI ADMIN ACCOUNT:")
    if ganesh:
        print(f"  Email: {ganesh.email}")
        print(f"  Role: {ganesh.role}")
        print(f"  Branch ID: {ganesh.branch_id}")
        print(f"  User ID: {ganesh.id}")
    else:
        print("  NOT FOUND")
    
    # Check Test Admin
    test_admin = db.query(User).filter(User.email == 'testadmin@smartchits.com').first()
    print("\n" + "=" * 60)
    print("TEST ADMIN ACCOUNT:")
    if test_admin:
        print(f"  Email: {test_admin.email}")
        print(f"  Role: {test_admin.role}")
        print(f"  Branch ID: {test_admin.branch_id}")
        print(f"  User ID: {test_admin.id}")
    else:
        print("  NOT FOUND")
    
    # Check auction query logic
    print("\n" + "=" * 60)
    print("AUCTION DISTRIBUTION:")
    all_auctions = db.query(Auction).all()
    print(f"  Total auctions: {len(all_auctions)}")
    
    # Count by branch
    from sqlalchemy import func
    branch_counts = db.query(Auction.branch_id, func.count(Auction.id)).group_by(Auction.branch_id).all()
    print("\n  By branch:")
    for branch, count in branch_counts:
        print(f"    Branch {branch}: {count} auctions")
    
finally:
    db.close()

#!/usr/bin/env python3
from app.db.database import SessionLocal
from app.models.user_model import User
from app.models.member_model import Member
from app.models.chit_model import Chit
from app.models.payment_model import Payment
from app.models.auction_model import Auction

db = SessionLocal()

users = db.query(User).filter(User.role == 'user').count()
members = db.query(Member).count()
chits = db.query(Chit).count()
payments = db.query(Payment).count()
auctions = db.query(Auction).count()

print(f'Database Status:')
print(f'  Users (role=user): {users}')
print(f'  Members: {members}')
print(f'  Chits: {chits}')
print(f'  Payments: {payments}')
print(f'  Auctions: {auctions}')

print(f'\nSample Members:')
sample_members = db.query(User).filter(User.role == 'user').limit(3).all()
for user in sample_members:
    chit_count = db.query(Member).filter(Member.user_id == user.id).count()
    print(f'  - {user.first_name} {user.last_name} ({chit_count} chits)')

db.close()

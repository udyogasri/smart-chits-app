#!/usr/bin/env python3
"""
Script to create sample payment data for testing the payments page
"""
import sys
sys.path.insert(0, 'd:\\KMEdTech\\smart-chits-app\\smart-chits-app Backend')

from app.db.database import engine, SessionLocal
from app.models.payment_model import Payment
from app.models.user_model import User
from app.models.chit_model import Chit
from datetime import datetime, timedelta
from sqlalchemy import func

db = SessionLocal()

try:
    # Find the user by email
    user = db.query(User).filter(User.email == 'sasiroyal@gmail.com').first()
    
    if not user:
        print("❌ User not found with email: sasiroyal@gmail.com")
        sys.exit(1)
    
    user_display = getattr(user, 'full_name', None) or getattr(user, 'name', 'Unknown')
    print(f"✓ Found user: {user_display} (ID: {user.id})")
    
    # Get user's chits
    chits = db.query(Chit).filter(Chit.id.in_(
        db.query(func.distinct(Payment.chit_id)).filter(Payment.user_id == user.id)
    )).all()
    
    if not chits:
        print("⚠️  No chits found for user. Trying to find any chits...")
        chits = db.query(Chit).limit(2).all()
    
    if not chits:
        print("❌ No chits found in database")
        sys.exit(1)
    
    print(f"✓ Found {len(chits)} chits for user")
    
    # Check for existing payments
    existing = db.query(Payment).filter(Payment.user_id == user.id).count()
    print(f"✓ User has {existing} existing payments")
    
    if existing > 0:
        print("\nExisting payments:")
        payments = db.query(Payment).filter(Payment.user_id == user.id).all()
        for p in payments:
            print(f"  - Chit {p.chit_id}, Month {p.month}, Amount ₹{p.amount}, Status: {p.status}")
    
    # Create sample payment data if needed
    today = datetime.now()
    
    if existing == 0:
        print("\n📝 Creating sample payment data...")
        
        for idx, chit in enumerate(chits):
            # Create 3 sample payments per chit
            for month in range(1, 4):
                due_date = today + timedelta(days=month*30 - 20)
                
                if month == 1:
                    status = "Paid"
                    paid_at = today - timedelta(days=5)
                elif month == 2:
                    status = "Pending"
                    paid_at = None
                else:
                    status = "Upcoming"
                    paid_at = None
                
                payment = Payment(
                    chit_id=chit.id,
                    user_id=user.id,
                    amount=25000.00,
                    month=month,
                    status=status,
                    due_date=due_date,
                    paid_at=paid_at,
                    penalty_amount=0.0,
                    payment_method="UPI",
                    transaction_id=None
                )
                db.add(payment)
        
        db.commit()
        print("✓ Sample payment data created successfully!")
        
        # Show the created payments
        payments = db.query(Payment).filter(Payment.user_id == user.id).all()
        print(f"\n✓ Total payments created: {len(payments)}")
        for p in payments:
            chit = db.query(Chit).filter(Chit.id == p.chit_id).first()
            print(f"  - {chit.name}, Month {p.month}, ₹{p.amount}, Status: {p.status}")
    else:
        print("\n✓ Payment data already exists for this user!")
    
    # Now test the API endpoints
    print("\n" + "="*60)
    print("Testing API endpoints...")
    print("="*60)
    
    import requests
    import json
    
    # Login to get token
    login_response = requests.post('http://localhost:8000/auth/login', json={
        'email': 'sasiroyal@gmail.com',
        'password': 'Sasi@07'
    })
    
    if login_response.status_code == 200:
        token = login_response.json()['access_token']
        print(f"✓ Got auth token")
        
        headers = {'Authorization': f'Bearer {token}'}
        
        # Test summary endpoint
        summary_response = requests.get('http://localhost:8000/payments/summary', headers=headers)
        print(f"\n✓ GET /payments/summary - Status: {summary_response.status_code}")
        if summary_response.status_code == 200:
            print("  Response:")
            print(json.dumps(summary_response.json(), indent=4, default=str))
        else:
            print(f"  Error: {summary_response.text}")
        
        # Test installments endpoint
        installments_response = requests.get('http://localhost:8000/payments/installments', headers=headers)
        print(f"\n✓ GET /payments/installments - Status: {installments_response.status_code}")
        if installments_response.status_code == 200:
            data = installments_response.json()
            print(f"  Found {len(data)} installments:")
            for inst in data[:3]:
                print(f"    - {inst.get('chit_name', 'N/A')}, Month {inst.get('month')}, ₹{inst.get('amount')}, {inst.get('status')}")
        else:
            print(f"  Error: {installments_response.text}")
    else:
        print(f"❌ Login failed: {login_response.status_code}")
        print(f"  Error: {login_response.text}")

except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()

finally:
    db.close()

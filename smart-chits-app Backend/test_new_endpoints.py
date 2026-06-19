#!/usr/bin/env python
import requests
import json

BASE_URL = "http://localhost:8000"

# Test user credentials
TEST_EMAIL = "testuser@example.com"
TEST_PASSWORD = "Test@1234"
CHIT_ID = 31  # Test chit

print("=" * 60)
print("TESTING NEW CHIT ENDPOINTS")
print("=" * 60)

# 1. Login to get token
print("\n1. Logging in...")
try:
    login_response = requests.post(
        f"{BASE_URL}/login",
        json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
    )
    if login_response.status_code == 200:
        token = login_response.json()["access_token"]
        print(f"✓ Login successful. Token: {token[:20]}...")
        headers = {"Authorization": f"Bearer {token}"}
    else:
        print(f"✗ Login failed: {login_response.text}")
        exit(1)
except Exception as e:
    print(f"✗ Login error: {e}")
    exit(1)

# 2. Test GET /chits/{chit_id}/members
print(f"\n2. Testing GET /chits/{CHIT_ID}/members...")
try:
    response = requests.get(
        f"{BASE_URL}/chits/{CHIT_ID}/members",
        headers=headers
    )
    if response.status_code == 200:
        data = response.json()
        print(f"✓ Members endpoint working!")
        print(f"  Total members: {data.get('total')}")
        print(f"  Members fetched: {len(data.get('members', []))}")
        if data.get('members'):
            print(f"  First member: {data['members'][0]['name']}")
    else:
        print(f"✗ Members endpoint failed: {response.status_code} - {response.text}")
except Exception as e:
    print(f"✗ Members endpoint error: {e}")

# 3. Test GET /chits/{chit_id}/auctions
print(f"\n3. Testing GET /chits/{CHIT_ID}/auctions...")
try:
    response = requests.get(
        f"{BASE_URL}/chits/{CHIT_ID}/auctions",
        headers=headers
    )
    if response.status_code == 200:
        data = response.json()
        print(f"✓ Auctions endpoint working!")
        print(f"  Total auctions: {data.get('total')}")
        print(f"  Auctions fetched: {len(data.get('auctions', []))}")
        if data.get('auctions'):
            print(f"  First auction: {data['auctions'][0]['auction_number']}")
    else:
        print(f"✗ Auctions endpoint failed: {response.status_code} - {response.text}")
except Exception as e:
    print(f"✗ Auctions endpoint error: {e}")

# 4. Test GET /chits/{chit_id}/payments
print(f"\n4. Testing GET /chits/{CHIT_ID}/payments...")
try:
    response = requests.get(
        f"{BASE_URL}/chits/{CHIT_ID}/payments",
        headers=headers
    )
    if response.status_code == 200:
        data = response.json()
        print(f"✓ Payments endpoint working!")
        print(f"  Total payments: {len(data)}")
        if data:
            print(f"  First payment: ₹{data[0].get('amount')} - Status: {data[0].get('status')}")
    else:
        print(f"✗ Payments endpoint failed: {response.status_code} - {response.text}")
except Exception as e:
    print(f"✗ Payments endpoint error: {e}")

print("\n" + "=" * 60)
print("ENDPOINT TESTING COMPLETE")
print("=" * 60)

#!/usr/bin/env python3
"""
Test members API directly with auth token
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import requests
import json

# First, get a token by logging in
print("=== Step 1: Getting auth token ===")
response = requests.post(
    "http://localhost:8000/auth/login",
    json={
        "email": "kondetiganesh43@gmail.com",
        "password": "Kondeti@07"
    }
)

print(f"Login response status: {response.status_code}")
if response.status_code != 200:
    print(f"Login failed: {response.text}")
    sys.exit(1)

data = response.json()
token = data.get('access_token')
print(f"✅ Got token: {token[:20]}...")

# Now test the members endpoint
print("\n=== Step 2: Testing /admin/members endpoint ===")
headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}

response = requests.get(
    "http://localhost:8000/admin/members?skip=0&limit=100",
    headers=headers,
    timeout=30
)

print(f"Members API status: {response.status_code}")
print(f"Response headers: {dict(response.headers)}")
print(f"\nResponse body:")
try:
    data = response.json()
    print(json.dumps(data, indent=2))
except Exception as e:
    print(f"Raw response: {response.text}")
    print(f"Error parsing JSON: {e}")

if response.status_code != 200:
    print(f"\n❌ ERROR: Status {response.status_code}")
else:
    print(f"\n✅ Success: Retrieved {len(data) if isinstance(data, list) else 'N/A'} members")

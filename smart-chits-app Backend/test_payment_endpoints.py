#!/usr/bin/env python3
"""Test the payment endpoints"""
import requests
import json

email = 'sasiroyal@gmail.com'
password = 'Sasi@07'

# Get token
print('Getting auth token...')
resp = requests.post('http://localhost:8000/auth/login', json={'email': email, 'password': password})
print(f'Login status: {resp.status_code}')

if resp.status_code == 200:
    token = resp.json().get('access_token')
    print(f'✓ Token obtained')
    
    headers = {'Authorization': f'Bearer {token}'}
    
    # Test summary endpoint
    print('\n--- Testing /payments/summary ---')
    resp = requests.get('http://localhost:8000/payments/summary', headers=headers)
    print(f'Status: {resp.status_code}')
    if resp.status_code == 200:
        data = resp.json()
        print('✓ Summary retrieved:')
        print(json.dumps(data, indent=2, default=str))
    else:
        print(f'✗ Error: {resp.text}')
    
    # Test installments endpoint
    print('\n--- Testing /payments/installments ---')
    resp = requests.get('http://localhost:8000/payments/installments', headers=headers)
    print(f'Status: {resp.status_code}')
    if resp.status_code == 200:
        data = resp.json()
        print(f'✓ Found {len(data)} installments')
        if data:
            print('\nFirst installment:')
            print(json.dumps(data[0], indent=2, default=str))
    else:
        print(f'✗ Error: {resp.text}')
else:
    print(f'✗ Login failed: {resp.text}')

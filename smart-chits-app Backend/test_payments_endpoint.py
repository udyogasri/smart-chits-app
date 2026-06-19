import requests
import json

# Login first to get a valid token
login_response = requests.post('http://localhost:8000/auth/login', json={
    'email': 'kondetiganesh43@gmail.com',
    'password': 'Kondeti@07'
})

if login_response.status_code == 200:
    token = login_response.json()['access_token']
    print(f"✓ Got token: {token[:50]}...")
    
    # Now test the payments endpoint
    headers = {'Authorization': f'Bearer {token}'}
    payments_response = requests.get('http://localhost:8000/chits/31/payments', headers=headers)
    
    print(f"\nPayments Endpoint Response:")
    print(f"Status Code: {payments_response.status_code}")
    print(json.dumps(payments_response.json(), indent=2))
else:
    print(f"Login failed: {login_response.status_code}")
    print(login_response.json())

import requests
import json

# Login
login_data = {'email': 'testadmin@smartchits.com', 'password': 'Test@123456'}
print("Logging in...")
login_resp = requests.post('http://localhost:8000/auth/login', json=login_data)
print(f"Login status: {login_resp.status_code}")
token = login_resp.json()['access_token']

# Get auctions
print("\nFetching auctions...")
headers = {'Authorization': f'Bearer {token}'}
auctions_resp = requests.get('http://localhost:8000/admin/auctions', headers=headers)
print(f'Auctions endpoint status: {auctions_resp.status_code}')
data = auctions_resp.json()
print(f'Response type: {type(data)}')
print(f'Auctions returned: {len(data) if isinstance(data, list) else "not a list"}')
if isinstance(data, list):
    print(f'First 2 auctions:')
    for auction in data[:2]:
        print(f'  ID: {auction.get("id")}, Number: {auction.get("auction_number")}, Status: {auction.get("status")}')
else:
    print(f'Response: {json.dumps(data, indent=2)}')

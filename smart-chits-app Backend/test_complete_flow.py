import requests
import json

# Test complete flow like frontend does
try:
    # 1. Login
    print("1. Testing login...")
    login_resp = requests.post('http://localhost:8000/auth/login', 
        json={'email': 'testadmin@smartchits.com', 'password': 'Test@123456'})
    print(f"   Status: {login_resp.status_code}")
    
    if login_resp.status_code != 200:
        print(f"   ERROR: {login_resp.text}")
        exit(1)
    
    login_data = login_resp.json()
    token = login_data['access_token']
    print(f"   Token: {token[:20]}...")
    
    # 2. Fetch auctions
    print("\n2. Testing /admin/auctions endpoint...")
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    auctions_resp = requests.get('http://localhost:8000/admin/auctions', headers=headers)
    print(f"   Status: {auctions_resp.status_code}")
    
    if auctions_resp.status_code != 200:
        print(f"   ERROR: {auctions_resp.text}")
        exit(1)
    
    auctions = auctions_resp.json()
    print(f"   Response type: {type(auctions)}")
    print(f"   Array? {isinstance(auctions, list)}")
    print(f"   Count: {len(auctions)}")
    
    if len(auctions) > 0:
        print(f"\n3. First auction details:")
        first = auctions[0]
        print(f"   {json.dumps(first, indent=2)}")
    else:
        print(f"\n3. No auctions in response!")
        
except Exception as e:
    print(f"ERROR: {e}")
    import traceback
    traceback.print_exc()

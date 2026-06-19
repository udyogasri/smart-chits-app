import requests

BASE_URL = "http://127.0.0.1:8000"

def get_auth_token(email: str, password: str):
    url = f"{BASE_URL}/auth/login"
    response = requests.post(url, json={"email": email, "password": password})
    if response.status_code == 200:
        return response.json().get("access_token")
    return None

def test_complete_chit_flow():
    print("Testing complete chit system flow...")
    
    # Login as admin
    token = get_auth_token("admin@example.com", "admin123")
    if not token:
        print("❌ Failed to login")
        return
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Create a chit
    chit_data = {
        "name": "Test Chit Fund",
        "chit_fund": 100000,
        "installment_amount": 5000,
        "total_months": 20,
        "organization_id": 1
    }
    
    response = requests.post(f"{BASE_URL}/admin/chits", json=chit_data, headers=headers)
    print(f"Create chit: {response.status_code}")
    
    if response.status_code == 201:
        chit_id = response.json()["id"]
        print(f"✅ Chit created with ID: {chit_id}")
        
        # Get chits
        response = requests.get(f"{BASE_URL}/admin/chits", headers=headers)
        print(f"Get chits: {response.status_code}")
        
        # Delete chit
        response = requests.delete(f"{BASE_URL}/admin/chits/{chit_id}", headers=headers)
        print(f"Delete chit: {response.status_code}")
    else:
        print(f"❌ Failed to create chit: {response.text}")

if __name__ == "__main__":
    test_complete_chit_flow()

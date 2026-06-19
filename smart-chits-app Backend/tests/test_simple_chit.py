import requests

BASE_URL = "http://127.0.0.1:8000"

def get_auth_token(email: str, password: str):
    url = f"{BASE_URL}/auth/login"
    response = requests.post(url, json={"email": email, "password": password})
    if response.status_code == 200:
        return response.json().get("access_token")
    return None

def test_simple_chit_creation():
    print("Testing simple chit creation...")
    
    token = get_auth_token("admin@example.com", "admin123")
    if not token:
        print("❌ Failed to login")
        return
    
    headers = {"Authorization": f"Bearer {token}"}
    
    chit_data = {
        "name": "Simple Chit",
        "chit_fund": 50000,
        "installment_amount": 2500,
        "total_months": 20
    }
    
    response = requests.post(f"{BASE_URL}/chits/", json=chit_data, headers=headers)
    print(f"Create chit: {response.status_code}")
    
    if response.status_code == 201:
        print("✅ Chit created successfully")
    else:
        print(f"❌ Failed: {response.text}")

if __name__ == "__main__":
    test_simple_chit_creation()

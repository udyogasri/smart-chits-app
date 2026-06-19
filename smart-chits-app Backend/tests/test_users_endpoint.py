import requests

BASE_URL = "http://127.0.0.1:8000"

def get_auth_token(email: str, password: str):
    url = f"{BASE_URL}/auth/login"
    response = requests.post(url, json={"email": email, "password": password})
    if response.status_code == 200:
        return response.json().get("access_token")
    return None

def test_get_users():
    print("Testing get users endpoint...")
    
    token = get_auth_token("admin@example.com", "admin123")
    if not token:
        print("❌ Failed to login")
        return
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/users/", headers=headers)
    print(f"Get users: {response.status_code}")
    
    if response.status_code == 200:
        print(f"✅ Users: {response.json()}")
    else:
        print(f"❌ Failed: {response.text}")

if __name__ == "__main__":
    test_get_users()

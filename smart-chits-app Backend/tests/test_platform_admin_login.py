import requests

BASE_URL = "http://127.0.0.1:8000"

def test_platform_admin_login():
    print("Testing platform admin login...")
    
    url = f"{BASE_URL}/auth/login"
    data = {
        "email": "platformadmin@example.com",
        "password": "platform123"
    }
    
    response = requests.post(url, json=data)
    print(f"Login status: {response.status_code}")
    
    if response.status_code == 200:
        token = response.json().get("access_token")
        print(f"✅ Login successful. Token: {token[:50]}...")
    else:
        print(f"❌ Login failed: {response.text}")

if __name__ == "__main__":
    test_platform_admin_login()

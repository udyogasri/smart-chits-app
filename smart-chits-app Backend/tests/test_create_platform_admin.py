import requests

BASE_URL = "http://127.0.0.1:8000"

def get_auth_token(email: str, password: str):
    url = f"{BASE_URL}/auth/login"
    response = requests.post(url, json={"email": email, "password": password})
    if response.status_code == 200:
        return response.json().get("access_token")
    return None

def test_platform_admin_creation():
    print("Testing platform admin creation...")
    
    # Login as super admin
    token = get_auth_token("superadmin@example.com", "superadmin123")
    if not token:
        print("❌ Failed to login as super admin")
        return
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Create platform admin
    user_data = {
        "name": "Platform Admin",
        "email": "platformadmin@example.com",
        "password": "platform123",
        "role": "platform_admin"
    }
    
    response = requests.post(f"{BASE_URL}/users/?organization_id=1", json=user_data, headers=headers)
    print(f"Create platform admin: {response.status_code}")
    
    if response.status_code == 201:
        print("✅ Platform admin created successfully")
    else:
        print(f"❌ Failed: {response.text}")

if __name__ == "__main__":
    test_platform_admin_creation()

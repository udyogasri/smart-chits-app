import requests

BASE_URL = "http://127.0.0.1:8000"

def get_auth_token(email: str, password: str):
    url = f"{BASE_URL}/auth/login"
    response = requests.post(url, json={"email": email, "password": password})
    if response.status_code == 200:
        return response.json().get("access_token")
    return None

def test_platform_admin_statistics():
    print("Testing platform admin statistics...")
    
    token = get_auth_token("platformadmin@example.com", "platform123")
    if not token:
        print("❌ Failed to login as platform admin")
        return
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/platform-admin/statistics", headers=headers)
    print(f"Get statistics: {response.status_code}")
    
    if response.status_code == 200:
        print(f"✅ Statistics: {response.json()}")
    else:
        print(f"❌ Failed: {response.text}")

def test_platform_admin_organizations():
    print("Testing platform admin organizations...")
    
    token = get_auth_token("platformadmin@example.com", "platform123")
    if not token:
        print("❌ Failed to login as platform admin")
        return
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/platform-admin/organizations", headers=headers)
    print(f"Get organizations: {response.status_code}")
    
    if response.status_code == 200:
        print(f"✅ Organizations: {response.json()}")
    else:
        print(f"❌ Failed: {response.text}")

if __name__ == "__main__":
    test_platform_admin_statistics()
    test_platform_admin_organizations()

import requests

BASE_URL = "http://127.0.0.1:8000"

def get_auth_token(email: str, password: str):
    url = f"{BASE_URL}/auth/login"
    response = requests.post(url, json={"email": email, "password": password})
    if response.status_code == 200:
        return response.json().get("access_token")
    return None

def test_admin_access():
    token = get_auth_token("admin@example.com", "admin123")
    if not token:
        print("❌ Failed to get admin token")
        return
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/admin/users", headers=headers)
    print(f"Admin access test: {response.status_code}")

def test_user_access():
    token = get_auth_token("user@example.com", "user123")
    if not token:
        print("❌ Failed to get user token")
        return
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/admin/users", headers=headers)
    print(f"User access test (should fail): {response.status_code}")

if __name__ == "__main__":
    test_admin_access()
    test_user_access()

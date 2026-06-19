import requests

BASE_URL = "http://127.0.0.1:8000"

def create_platform_admin():
    print("Creating platform admin...")
    
    # First, check if we need to bootstrap
    response = requests.get(f"{BASE_URL}/init/status")
    if response.status_code == 200:
        status = response.json()
        if status["bootstrap_allowed"]:
            print("No admins exist. Creating first admin via bootstrap...")
            bootstrap_data = {
                "name": "Super Admin",
                "email": "superadmin@example.com",
                "password": "superadmin123",
                "role": "super_admin"
            }
            response = requests.post(f"{BASE_URL}/init/bootstrap", json=bootstrap_data)
            if response.status_code == 201:
                print("✅ Super admin created via bootstrap")
            else:
                print(f"❌ Bootstrap failed: {response.text}")
                return
    
    # Login as super admin
    login_data = {
        "email": "superadmin@example.com",
        "password": "superadmin123"
    }
    response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
    if response.status_code != 200:
        print(f"❌ Login failed: {response.text}")
        return
    
    token = response.json().get("access_token")
    headers = {"Authorization": f"Bearer {token}"}
    
    # Create platform admin
    user_data = {
        "name": "Platform Admin",
        "email": "platformadmin@example.com",
        "password": "platform123",
        "role": "platform_admin"
    }
    
    response = requests.post(f"{BASE_URL}/users/?organization_id=1", json=user_data, headers=headers)
    if response.status_code == 201:
        print("✅ Platform admin created successfully")
        print(f"Email: platformadmin@example.com")
        print(f"Password: platform123")
    else:
        print(f"❌ Failed to create platform admin: {response.text}")

if __name__ == "__main__":
    create_platform_admin()

import requests

BASE_URL = "http://127.0.0.1:8000"

def get_auth_token(email: str, password: str):
    """Get authentication token using JSON format"""
    url = f"{BASE_URL}/auth/login"
    data = {
        "email": email,
        "password": password
    }
    
    try:
        print(f"Sending login request to: {url}")
        print(f"Request data: {data}")
        response = requests.post(url, json=data)
        print(f"Response status: {response.status_code}")
        print(f"Response body: {response.text}")
        if response.status_code == 200:
            return response.json().get("access_token")
        else:
            print(f"Login failed: {response.text}")
            return None
    except Exception as e:
        print(f"Login error: {e}")
        return None

def test_admin_create_user():
    """Test POST /admin/users endpoint"""
    print("Testing POST /admin/users endpoint...")
    
    token = get_auth_token("sasidharroyal@gmail.com", "sasidhar@12")
    
    if token:
        headers = {"Authorization": f"Bearer {token}"}
        print(f"Token obtained: {token[:50]}...")
        
        user_data = {
            "name": "Test Admin User",
            "email": "testadmin123@gmail.com",
            "password": "admin123"
        }
        
        try:
            response = requests.post(
                f"{BASE_URL}/admin/users?organization_id=1", 
                json=user_data, 
                headers=headers
            )
            print(f"Status Code: {response.status_code}")
            print(f"Response: {response.text}")
            
            if response.status_code == 201:
                print("✅ Success! User created")
            else:
                print(f"❌ Error: {response.status_code}")
        except Exception as e:
            print(f"Request error: {e}")
    else:
        print("❌ Failed to get token")

if __name__ == "__main__":
    test_admin_create_user()

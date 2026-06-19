import requests
import json

print("Testing backend server...")

try:
    # Test if server is running
    response = requests.get('http://localhost:8000/')
    print(f"Server status: {response.status_code}")
    print(f"Server response: {response.text}")
except Exception as e:
    print(f"Server not running: {e}")
    exit(1)

try:
    # Test organization registration endpoint
    test_data = {
        "first_name": "Test",
        "last_name": "User",
        "email": "test@example.com",
        "phone_number": "+919876543210",
        "password": "password123",
        "confirm_password": "password123",
        "organization_name": "Test Org",
        "organization_type": "private_limited",
        "registration_number": "REG-TEST-001",
        "company_email": "contact@test.com",
        "company_phone_number": "+919876543210",
        "description": "Test organization"
    }
    
    response = requests.post('http://localhost:8000/organizations/register', json=test_data)
    print(f"\nOrganization registration status: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Organization registration failed: {e}")

import requests
import json

# Test login endpoint
email = "testadmin@smartchits.com"
password = "Test@123456"

payload = {
    "email": email,
    "password": password
}

try:
    r = requests.post(
        'http://localhost:8000/auth/login',
        json=payload,
        timeout=10
    )
    print(f'Status: {r.status_code}')
    print(f'Response: {r.text}')
except Exception as e:
    print(f'Error: {e}')

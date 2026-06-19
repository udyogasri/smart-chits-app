import requests

# Test the endpoint directly
token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0QHNtYXJ0Y2hpdHMuY29tIiwicm9sZSI6InN1cGVyX2FkbWluIiwieW91cl9jbGFpbSI6InNwZWNpZmljIn0.xxx"  # This won't work, but let's see the response

response = requests.get(
    'http://localhost:8000/platform-admin/members',
    headers={'Authorization': f'Bearer {token}'}
)

print(f"Status: {response.status_code}")
print(f"Headers: {dict(response.headers)}")
print(f"Response: {response.text[:500]}")

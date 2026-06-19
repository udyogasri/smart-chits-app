import requests
try:
    r = requests.get('http://localhost:8000/docs', timeout=5)
    print(f'✅ Backend API responding: {r.status_code}')
except Exception as e:
    print(f'❌ Backend error: {e}')

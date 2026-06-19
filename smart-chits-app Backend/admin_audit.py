#!/usr/bin/env python3
"""
Comprehensive admin functionality audit for Smart Chits App
Tests all admin endpoints and reports issues
"""
import requests
import json
from datetime import datetime

API_URL = "http://localhost:8000"
ADMIN_EMAIL = "kondetiganesh43@gmail.com"
ADMIN_PASSWORD = "Kondeti@07"

class AdminAudit:
    def __init__(self):
        self.token = None
        self.results = {
            'passed': [],
            'failed': [],
            'warnings': []
        }
    
    def login(self):
        """Login and get auth token"""
        try:
            resp = requests.post(f"{API_URL}/auth/login", 
                json={'email': ADMIN_EMAIL, 'password': ADMIN_PASSWORD})
            if resp.status_code == 200:
                self.token = resp.json()['access_token']
                self.results['passed'].append("✅ Login successful")
                return True
            else:
                self.results['failed'].append(f"❌ Login failed: {resp.text}")
                return False
        except Exception as e:
            self.results['failed'].append(f"❌ Login error: {str(e)}")
            return False
    
    def get_headers(self):
        """Get headers with auth token"""
        return {'Authorization': f'Bearer {self.token}'}
    
    def test_endpoint(self, method, endpoint, name, data=None):
        """Test an endpoint"""
        try:
            url = f"{API_URL}{endpoint}"
            if method == 'GET':
                resp = requests.get(url, headers=self.get_headers())
            elif method == 'POST':
                resp = requests.post(url, json=data, headers=self.get_headers())
            elif method == 'PATCH':
                resp = requests.patch(url, json=data, headers=self.get_headers())
            elif method == 'DELETE':
                resp = requests.delete(url, headers=self.get_headers())
            
            if resp.status_code in [200, 201]:
                result = resp.json() if resp.text else {}
                count = len(result) if isinstance(result, list) else 1
                self.results['passed'].append(f"✅ {name} ({method} {endpoint}) - {count} items")
                return resp
            else:
                self.results['failed'].append(f"❌ {name}: {resp.status_code} - {resp.text[:100]}")
                return None
        except Exception as e:
            self.results['failed'].append(f"❌ {name}: {str(e)}")
            return None
    
    def run_audit(self):
        """Run complete audit"""
        print("=" * 70)
        print("SMART CHITS ADMIN FUNCTIONALITY AUDIT")
        print("=" * 70)
        
        if not self.login():
            print("Failed to login. Stopping audit.")
            return
        
        print("\n📋 TESTING ADMIN ENDPOINTS...")
        print("-" * 70)
        
        # Dashboard endpoints
        self.test_endpoint('GET', '/admin/stats', 'Dashboard Stats')
        
        # Members endpoints
        resp = self.test_endpoint('GET', '/admin/members', 'List Members')
        
        # Chit Groups endpoints
        self.test_endpoint('GET', '/admin/chits', 'List Chit Groups')
        
        # Payments endpoints
        self.test_endpoint('GET', '/admin/payments', 'List Payments')
        
        # Auctions endpoints
        resp = self.test_endpoint('GET', '/admin/auctions', 'List Auctions')
        if resp:
            auctions = resp.json()
            if len(auctions) > 0:
                auction_id = auctions[0]['id']
                self.test_endpoint('GET', f'/admin/auctions/{auction_id}', f'Get Auction {auction_id}')
        
        # Print summary
        print("\n" + "=" * 70)
        print("📊 AUDIT SUMMARY")
        print("=" * 70)
        print(f"\n✅ PASSED ({len(self.results['passed'])} tests):")
        for item in self.results['passed']:
            print(f"   {item}")
        
        if self.results['failed']:
            print(f"\n❌ FAILED ({len(self.results['failed'])} tests):")
            for item in self.results['failed']:
                print(f"   {item}")
        
        if self.results['warnings']:
            print(f"\n⚠️  WARNINGS ({len(self.results['warnings'])} items):")
            for item in self.results['warnings']:
                print(f"   {item}")
        
        print("\n" + "=" * 70)
        print(f"TOTAL: {len(self.results['passed'])} passed, {len(self.results['failed'])} failed")
        print("=" * 70)

if __name__ == '__main__':
    audit = AdminAudit()
    audit.run_audit()

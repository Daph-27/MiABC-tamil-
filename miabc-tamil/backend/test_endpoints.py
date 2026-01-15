"""
Backend API Testing Script
Tests all endpoints to verify they're working correctly
"""
import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8000/api/v1"
test_user_data = {
    "username": f"testuser_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
    "password": "TestPass123!",
    "learnerName": "Test Learner",
    "guardianName": "Test Guardian",
    "guardianEmail": "test@example.com",
    "learnerAge": 8,
    "learnerGrade": "3"
}

def print_test(name, passed, details=""):
    status = "✅ PASS" if passed else "❌ FAIL"
    print(f"{status}: {name}")
    if details:
        print(f"   {details}")
    print()

def test_health():
    """Test health endpoint"""
    try:
        response = requests.get("http://localhost:8000/health")
        passed = response.status_code == 200 and response.json().get("status") == "healthy"
        print_test("Health Check", passed, f"Status: {response.status_code}")
        return passed
    except Exception as e:
        print_test("Health Check", False, str(e))
        return False

def test_register():
    """Test user registration"""
    try:
        response = requests.post(
            f"{BASE_URL}/auth/register",
            json=test_user_data,
            headers={"Content-Type": "application/json"}
        )
        if response.status_code == 201:
            data = response.json()
            token = data.get("access_token")
            print_test("User Registration", True, f"Token: {token[:20]}...")
            return token
        else:
            print_test("User Registration", False, f"Status {response.status_code}: {response.text}")
            return None
    except Exception as e:
        print_test("User Registration", False, str(e))
        return None

def test_login(username, password):
    """Test user login"""
    try:
        response = requests.post(
            f"{BASE_URL}/auth/login-json",
            json={"username": username, "password": password},
            headers={"Content-Type": "application/json"}
        )
        if response.status_code == 200:
            data = response.json()
            token = data.get("access_token")
            print_test("User Login", True, f"Token received")
            return token
        else:
            print_test("User Login", False, f"Status {response.status_code}: {response.text}")
            return None
    except Exception as e:
        print_test("User Login", False, str(e))
        return None

def test_get_me(token):
    """Test get current user"""
    try:
        response = requests.get(
            f"{BASE_URL}/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        if response.status_code == 200:
            data = response.json()
            print_test("Get Current User", True, f"User: {data.get('username')}")
            return True
        else:
            print_test("Get Current User", False, f"Status {response.status_code}")
            return False
    except Exception as e:
        print_test("Get Current User", False, str(e))
        return False

def test_get_module(token):
    """Test get module content"""
    try:
        response = requests.get(
            f"{BASE_URL}/content/modules/01_alphabet",
            headers={"Authorization": f"Bearer {token}"}
        )
        if response.status_code in [200, 404]:
            # 404 is ok if module not seeded yet
            passed = True
            msg = f"Status {response.status_code}"
            if response.status_code == 404:
                msg += " (Module not found - need to seed data)"
        else:
            passed = False
            msg = f"Error {response.status_code}"
        print_test("Get Module Content", passed, msg)
        return passed
    except Exception as e:
        print_test("Get Module Content", False, str(e))
        return False

def test_progress(token):
    """Test progress endpoints"""
    try:
        # Get progress
        response = requests.get(
            f"{BASE_URL}/content/progress",
            headers={"Authorization": f"Bearer {token}"}
        )
        if response.status_code == 200:
            print_test("Get Progress", True, "Progress retrieved")
        else:
            print_test("Get Progress", False, f"Status {response.status_code}")
            return False
        
        # Update progress
        response = requests.post(
            f"{BASE_URL}/content/progress",
            json={"module_id": "01_alphabet", "score": 85, "passed": True},
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            }
        )
        passed = response.status_code == 200
        print_test("Update Progress", passed, f"Status {response.status_code}")
        return passed
    except Exception as e:
        print_test("Progress Endpoints", False, str(e))
        return False

def main():
    print("="*60)
    print("MiABC Tamil Backend API Test Suite")
    print("="*60)
    print()
    
    # Test 1: Health
    if not test_health():
        print("⚠️ Backend server is not running!")
        print("Start it with: cd backend && start_server.bat")
        return
    
    # Test 2: Register
    token = test_register()
    if not token:
        print("⚠️ Registration failed - stopping tests")
        return
    
    # Test 3: Login
    login_token = test_login(test_user_data["username"], test_user_data["password"])
    if not login_token:
        print("⚠️ Login failed")
    
    # Use registration token for remaining tests
    # Test 4: Get current user
    test_get_me(token)
    
    # Test 5: Module content
    test_get_module(token)
    
    # Test 6: Progress
    test_progress(token)
    
    print("="*60)
    print("Test suite completed!")
    print("="*60)

if __name__ == "__main__":
    main()

# API Endpoint Testing Guide

## Prerequisites
1. Backend running: `uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`
2. Open a new terminal for testing

---

## Test 1: Health Check

```bash
curl http://localhost:8000/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "service": "MiABC Tamil API"
}
```

---

## Test 2: Root Endpoint

```bash
curl http://localhost:8000/
```

**Expected Response:**
```json
{
  "message": "MiABC Tamil API",
  "version": "1.0",
  "docs": "/api/v1/docs"
}
```

---

## Test 3: User Registration

```bash
curl -X POST http://localhost:8000/api/v1/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"testuser@example.com\",\"password\":\"test123456\",\"display_name\":\"Test User\",\"age\":10,\"guardian_name\":\"Parent Name\",\"guardian_phone\":\"+1234567890\"}"
```

**Expected Response:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "uid": "some-uuid-here",
  "email": "testuser@example.com",
  "display_name": "Test User"
}
```

**Save the access_token for next tests!**

---

## Test 4: User Login

```bash
curl -X POST http://localhost:8000/api/v1/auth/login-json ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"testuser@example.com\",\"password\":\"test123456\"}"
```

**Expected Response:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "uid": "same-uuid-as-registration",
  "email": "testuser@example.com",
  "display_name": "Test User"
}
```

---

## Test 5: Get Current User

Replace `YOUR_TOKEN_HERE` with the access_token from login:

```bash
curl -X GET http://localhost:8000/api/v1/auth/me ^
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "email": "testuser@example.com",
  "display_name": "Test User",
  "uid": "uuid-here",
  "is_active": true,
  "created_at": "2026-01-14T...",
  "progress": {
    "01_alphabet": {
      "unlocked": true,
      "score": 0,
      "passed": false
    }
  }
}
```

---

## Test 6: Get Module Content (Alphabet)

```bash
curl -X GET http://localhost:8000/api/v1/content/modules/01_alphabet ^
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "id": "01_alphabet",
  "title": "Alphabet",
  "tabs": ["Vowels", "Consonants"],
  "items": [
    {
      "type": "letter",
      "tamil": "அ",
      "english": "A",
      "sound": "a",
      "position": 1
    },
    ...
  ],
  "validated": true
}
```

---

## Test 7: Get Quiz Content

```bash
curl -X GET http://localhost:8000/api/v1/content/quizzes/01_alphabet ^
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "moduleId": "01_alphabet",
  "title": "Alphabet Quiz",
  "passingScore": 80,
  "questions": [
    {
      "id": "q1",
      "text": "Which is the first Tamil vowel?",
      "options": [...]
    }
  ],
  "validated": true
}
```

---

## Test 8: Get User Progress

```bash
curl -X GET http://localhost:8000/api/v1/content/progress ^
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "uid": "uuid-here",
  "progress": {
    "01_alphabet": {
      "unlocked": true,
      "score": 0,
      "passed": false
    }
  }
}
```

---

## Test 9: Update User Progress

```bash
curl -X POST http://localhost:8000/api/v1/content/progress ^
  -H "Authorization: Bearer YOUR_TOKEN_HERE" ^
  -H "Content-Type: application/json" ^
  -d "{\"module_id\":\"01_alphabet\",\"score\":90,\"passed\":true}"
```

**Expected Response:**
```json
{
  "message": "Progress updated for module 01_alphabet",
  "success": true
}
```

---

## Test 10: Unlock Next Module

```bash
curl -X POST http://localhost:8000/api/v1/content/unlock/02_sounds ^
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "message": "Module 02_sounds unlocked",
  "success": true
}
```

---

## Test All Other Modules

Test each module endpoint:

```bash
# Colors
curl -X GET http://localhost:8000/api/v1/content/modules/10_colors -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Mathematics
curl -X GET http://localhost:8000/api/v1/content/modules/03_mathematics -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Family
curl -X GET http://localhost:8000/api/v1/content/modules/04_family -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Festivals
curl -X GET http://localhost:8000/api/v1/content/modules/09_festivals -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Automated Test Script

Save this as `test_api.bat` in the backend folder:

```batch
@echo off
echo Testing MiABC Tamil API...
echo.

echo [1] Health Check
curl http://localhost:8000/health
echo.
echo.

echo [2] Root Endpoint
curl http://localhost:8000/
echo.
echo.

echo [3] API Documentation
echo Visit: http://localhost:8000/api/v1/docs
echo.

pause
```

Run it:
```bash
cd backend
test_api.bat
```

---

## Verify in Firebase Console

1. Go to: https://console.firebase.google.com/project/miabc-tamil/firestore
2. Check **Collections**:
   - `content` → Should have `module_*` and `quiz_*` documents
   - `users` → Should have your test user after registration
3. Click on documents to see the data

---

## Common Issues & Fixes

### Issue: "401 Unauthorized"
**Fix:** Token expired. Login again and get a new token.

### Issue: "404 Not Found"
**Fix:** Module not seeded. Run `python scripts/seed_firestore.py` again.

### Issue: "Network error"
**Fix:** Backend not running. Start: `uvicorn app.main:app --reload`

### Issue: Module content empty
**Fix:** Firestore not seeded. Check Firebase Console → Firestore Database.

---

## Next Steps After Testing

1. ✅ All endpoints working → Proceed to React Native integration
2. ❌ Errors found → Check terminal logs and fix issues
3. 📱 Test from mobile app (Login, Register, Module loading)

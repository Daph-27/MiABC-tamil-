@echo off
setlocal enabledelayedexpansion

echo ========================================
echo MiABC Tamil API - Automated Test Suite
echo ========================================
echo.

REM Colors for output (basic Windows CMD)
set "GREEN=[92m"
set "RED=[91m"
set "YELLOW=[93m"
set "NC=[0m"

echo [TEST 1] Health Check
curl -s http://localhost:8000/health
echo.
echo.

echo [TEST 2] Root Endpoint
curl -s http://localhost:8000/
echo.
echo.

echo [TEST 3] Register New User
echo Creating test user: apitest@example.com
curl -s -X POST http://localhost:8000/api/v1/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"apitest@example.com\",\"password\":\"test123456\",\"display_name\":\"API Test User\",\"age\":10}" > response.json

echo Response saved to response.json
type response.json
echo.
echo.

echo [TEST 4] Login
curl -s -X POST http://localhost:8000/api/v1/auth/login-json ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"apitest@example.com\",\"password\":\"test123456\"}" > login.json

echo Response saved to login.json
type login.json
echo.
echo.

echo ========================================
echo Tests Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Check response.json and login.json for tokens
echo 2. Copy the access_token from login.json
echo 3. Use it to test authenticated endpoints
echo 4. Visit http://localhost:8000/api/v1/docs for interactive testing
echo.

pause

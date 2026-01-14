# MiABC Tamil - Complete Setup Guide

## 📋 Overview

This guide will help you set up both the **Backend API** (FastAPI + SQLite + Firebase) and the **Mobile App** (React Native).

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 20
- **Python** >= 3.9
- **React Native** development environment ([Setup Guide](https://reactnative.dev/docs/environment-setup))
- **Firebase** account (optional but recommended)

---

## 📦 Part 1: Backend Setup

### Step 1: Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### Step 2: Configure Environment

```bash
# Copy example environment file
cp .env.example .env
```

Edit `backend/.env`:
```env
SECRET_KEY=your-super-secret-key-change-this-in-production-32-chars-min
FIREBASE_CREDENTIALS_PATH=serviceAccountKey.json
DATABASE_URL=sqlite:///./miabc.db
```

### Step 3: Firebase Setup (Optional)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing
3. Navigate to **Project Settings** → **Service Accounts**
4. Click **"Generate New Private Key"**
5. Save the JSON file as `backend/serviceAccountKey.json`

> **Note:** The backend works without Firebase, but you'll miss cloud sync features.

### Step 4: Initialize Database

```bash
cd backend
python scripts/init_db.py
```

Expected output:
```
🗄️  Initializing SQLite database...
✅ Database tables created successfully!
📁 Database location: C:\...\miabc.db
```

### Step 5: Seed Firestore (Optional)

If you configured Firebase:

```bash
python scripts/seed_firestore.py
```

This populates Firestore with:
- ✅ Alphabet module (12 vowels + 18 consonants)
- ✅ Alphabet quiz (3 questions)
- ✅ Colors module (12 colors)
- ✅ Mathematics module (Numbers 0-10 + shapes)
- ✅ Family module (10 family members)
- ✅ Festivals module (10 items)
- 📄 Placeholders for remaining modules

### Step 6: Start Backend Server

```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Server will be available at:
- **API Docs**: http://localhost:8000/api/v1/docs
- **Health Check**: http://localhost:8000/health

---

## 📱 Part 2: React Native App Setup

### Step 1: Install Dependencies

```bash
# From project root
npm install
```

### Step 2: Install AsyncStorage

```bash
npm install @react-native-async-storage/async-storage
```

For iOS:
```bash
cd ios
bundle exec pod install
cd ..
```

### Step 3: Configure API Endpoint

Edit `src/config/api.ts`:

For **Android Emulator**:
```typescript
const API_BASE_URL = 'http://10.0.2.2:8000/api/v1';
```

For **iOS Simulator**:
```typescript
const API_BASE_URL = 'http://localhost:8000/api/v1';
```

For **Physical Device**:
```typescript
// Use your computer's IP address
const API_BASE_URL = 'http://192.168.1.xxx:8000/api/v1';
```

### Step 4: Run the App

**Android:**
```bash
npm run android
```

**iOS:**
```bash
npm run ios
```

**Web:**
```bash
npm run build:web
# Then serve the dist folder
```

---

## 🧪 Testing the Setup

### Test 1: Backend Health Check

```bash
curl http://localhost:8000/health
```

Expected:
```json
{
  "status": "healthy",
  "service": "MiABC Tamil API"
}
```

### Test 2: Register a User

```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123",
    "display_name": "Test User",
    "age": 10
  }'
```

Expected:
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJh...",
  "token_type": "bearer",
  "uid": "uuid-here",
  "email": "test@example.com",
  "display_name": "Test User"
}
```

### Test 3: Login from Mobile App

1. Open the app
2. Tap **"Register"**
3. Fill in the form:
   - Email: `test@example.com`
   - Password: `test123`
   - Display Name: `Test User`
   - Age: `10`
   - Guardian Name: `Parent Name`
   - Guardian Phone: `+1234567890`
4. Tap **"Register"**
5. Should see success message and navigate to Profile Picture screen

### Test 4: Get Module Content

```bash
# Replace TOKEN with the access_token from registration
TOKEN="your-token-here"

curl -X GET http://localhost:8000/api/v1/content/modules/01_alphabet \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📂 Project Structure

```
miabc-tamil/
├── backend/                    # FastAPI Backend
│   ├── app/
│   │   ├── api/v1/            # API Routes
│   │   │   ├── auth.py        # Authentication endpoints
│   │   │   └── content.py     # Content endpoints
│   │   ├── core/              # Core functionality
│   │   │   ├── config.py      # Settings
│   │   │   ├── database.py    # SQLite setup
│   │   │   ├── firebase.py    # Firebase integration
│   │   │   └── security.py    # JWT & password hashing
│   │   ├── models/            # Database models
│   │   ├── schemas/           # Pydantic schemas
│   │   └── main.py            # FastAPI app
│   ├── scripts/
│   │   ├── init_db.py         # Initialize SQLite
│   │   └── seed_firestore.py  # Seed Firebase
│   └── requirements.txt
│
├── src/                        # React Native App
│   ├── config/
│   │   └── api.ts             # API configuration
│   ├── services/
│   │   └── apiService.ts      # API client
│   ├── screens/               # All screens
│   ├── components/            # Reusable components
│   ├── state/                 # Context/state management
│   └── styles/                # Theme & styles
│
├── content/                    # Content JSON files
│   ├── modules/               # Module definitions
│   └── quizzes/               # Quiz definitions
│
└── package.json
```

---

## 🔧 Troubleshooting

### Backend Issues

**Issue: "Database locked" error**
```bash
rm backend/miabc.db
python backend/scripts/init_db.py
```

**Issue: "Firebase credentials not found"**
- Ensure `serviceAccountKey.json` is in `backend/` directory
- Or the backend will work without Firebase (local-only mode)

**Issue: "Port 8000 already in use"**
```bash
# Use a different port
uvicorn app.main:app --port 8001
```

### Mobile App Issues

**Issue: "Network request failed"**
- Verify backend is running: `curl http://localhost:8000/health`
- Check API_BASE_URL in `src/config/api.ts`
- For Android emulator, use `http://10.0.2.2:8000/api/v1`
- For physical device, use your computer's IP

**Issue: "@react-native-async-storage/async-storage not found"**
```bash
npm install @react-native-async-storage/async-storage
cd ios && bundle exec pod install && cd ..
```

**Issue: "Unable to resolve module"**
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
npm start -- --reset-cache
```

---

## 📊 Available API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login-json` - Login (JSON)
- `POST /api/v1/auth/login` - Login (OAuth2 form)
- `GET /api/v1/auth/me` - Get current user

### Content
- `GET /api/v1/content/modules/{id}` - Get module content
- `GET /api/v1/content/quizzes/{id}` - Get quiz content
- `GET /api/v1/content/progress` - Get user progress
- `POST /api/v1/content/progress` - Update progress
- `POST /api/v1/content/unlock/{id}` - Unlock module

Full API docs: http://localhost:8000/api/v1/docs

---

## 🎯 Next Steps

1. **Add Content**: Populate remaining modules (Sounds, Write, Read, Complete, Words)
2. **Audio Files**: Add pronunciation audio files for all content
3. **Images**: Create visual assets for all modules
4. **Testing**: Write comprehensive tests
5. **Deployment**: Deploy backend to cloud (Railway, Heroku, AWS)
6. **App Store**: Prepare for iOS App Store and Google Play Store

---

## 📝 Development Workflow

### Daily Development

1. **Start Backend:**
   ```bash
   cd backend
   uvicorn app.main:app --reload
   ```

2. **Start React Native:**
   ```bash
   npm start
   ```

3. **Run on Device:**
   ```bash
   # In another terminal
   npm run android  # or npm run ios
   ```

### Testing New Features

1. Test API endpoints with Postman or `curl`
2. Check API docs at http://localhost:8000/api/v1/docs
3. Test mobile app on emulator/simulator
4. Test on physical device before release

---

## 🔐 Security Checklist

Before deploying to production:

- [ ] Change `SECRET_KEY` to a strong random value (32+ characters)
- [ ] Enable HTTPS for backend API
- [ ] Configure CORS to allow only your app's domain
- [ ] Set up Firebase security rules
- [ ] Enable rate limiting on API
- [ ] Add input validation and sanitization
- [ ] Implement refresh token mechanism
- [ ] Set up logging and monitoring
- [ ] Review and test authentication flow
- [ ] Add email verification for registration

---

## 📞 Support

- **Documentation**: Check `backend/README.md` for detailed API docs
- **Issues**: Report bugs via GitHub issues
- **Email**: support@diazapps.com

---

## 📄 License

MIT License - DiazApps & Karunya University

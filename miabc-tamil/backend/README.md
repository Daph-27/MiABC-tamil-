# MiABC Tamil Backend API

FastAPI backend for MiABC Tamil educational application with SQLite (local) and Firebase (cloud) integration.

## Features

- ✅ **Authentication**: JWT-based user registration and login
- ✅ **Dual Database**: SQLite for local caching + Firebase Firestore for cloud sync
- ✅ **Content Management**: Module and quiz content delivery
- ✅ **Progress Tracking**: User learning progress synchronization
- ✅ **CORS Enabled**: Ready for React Native integration

## Setup

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update values:

```bash
cp .env.example .env
```

Edit `.env`:
```env
SECRET_KEY=your-secret-key-here-change-in-production
FIREBASE_CREDENTIALS_PATH=serviceAccountKey.json
```

### 3. Firebase Setup (Optional but Recommended)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing
3. Go to Project Settings → Service Accounts
4. Click "Generate New Private Key"
5. Save the JSON file as `backend/serviceAccountKey.json`

### 4. Initialize Database

```bash
python scripts/init_db.py
```

### 5. Seed Firestore (Optional)

If you have Firebase configured:

```bash
python scripts/seed_firestore.py
```

This will populate Firestore with:
- Alphabet module (Tamil vowels & consonants)
- Alphabet quiz
- Colors module
- Mathematics module (numbers & shapes)
- Family module
- Festivals module
- Placeholder modules for remaining content

## Running the Server

### Development Mode

```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- **API**: http://localhost:8000
- **Docs**: http://localhost:8000/api/v1/docs
- **ReDoc**: http://localhost:8000/api/v1/redoc

### Production Mode

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## API Endpoints

### Authentication

#### Register User
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "display_name": "John Doe",
  "age": 10,
  "guardian_name": "Parent Name",
  "guardian_phone": "+1234567890"
}
```

Response:
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "uid": "uuid-here",
  "email": "user@example.com",
  "display_name": "John Doe"
}
```

#### Login (JSON Format for React Native)
```http
POST /api/v1/auth/login-json
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Login (OAuth2 Format)
```http
POST /api/v1/auth/login
Content-Type: application/x-www-form-urlencoded

username=user@example.com&password=password123
```

#### Get Current User
```http
GET /api/v1/auth/me
Authorization: Bearer <token>
```

### Content Management

#### Get Module Content
```http
GET /api/v1/content/modules/01_alphabet
Authorization: Bearer <token>
```

Response:
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
    }
  ],
  "validated": true
}
```

#### Get Quiz Content
```http
GET /api/v1/content/quizzes/01_alphabet
Authorization: Bearer <token>
```

#### Get User Progress
```http
GET /api/v1/content/progress
Authorization: Bearer <token>
```

Response:
```json
{
  "uid": "user-uuid",
  "progress": {
    "01_alphabet": {
      "unlocked": true,
      "score": 90,
      "passed": true
    },
    "02_sounds": {
      "unlocked": true,
      "score": 0,
      "passed": false
    }
  }
}
```

#### Update Progress
```http
POST /api/v1/content/progress
Authorization: Bearer <token>
Content-Type: application/json

{
  "module_id": "01_alphabet",
  "score": 90,
  "passed": true
}
```

#### Unlock Module
```http
POST /api/v1/content/unlock/02_sounds
Authorization: Bearer <token>
```

## Project Structure

```
backend/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── auth.py          # Authentication endpoints
│   │       └── content.py       # Content management endpoints
│   ├── core/
│   │   ├── config.py           # Settings and configuration
│   │   ├── database.py         # SQLite database setup
│   │   ├── firebase.py         # Firebase integration
│   │   └── security.py         # JWT and password hashing
│   ├── models/
│   │   └── models.py           # SQLAlchemy models
│   ├── schemas/
│   │   └── schemas.py          # Pydantic schemas
│   └── main.py                 # FastAPI application
├── scripts/
│   ├── init_db.py              # Initialize SQLite database
│   └── seed_firestore.py       # Seed Firestore with content
├── requirements.txt             # Python dependencies
├── .env.example                 # Environment variables template
└── README.md                    # This file
```

## Database Schema

### SQLite Tables

**users**
- id (PK)
- uid (unique, Firebase UID)
- email (unique)
- hashed_password
- display_name
- is_active
- progress (JSON)
- created_at
- updated_at

**module_content**
- id (PK)
- module_id (unique)
- title
- tabs (JSON)
- items (JSON)
- validated
- created_at
- updated_at

**quiz_content**
- id (PK)
- module_id
- title
- passing_score
- questions (JSON)
- validated
- created_at
- updated_at

### Firestore Collections

**content/**
- `module_{id}` - Module content documents
- `quiz_{id}` - Quiz content documents

**users/**
- `{uid}` - User profile and progress documents

## Testing

### Test Registration
```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "display_name": "Test User"
  }'
```

### Test Login
```bash
curl -X POST http://localhost:8000/api/v1/auth/login-json \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Test Content Access
```bash
TOKEN="your-jwt-token-here"

curl -X GET http://localhost:8000/api/v1/content/modules/01_alphabet \
  -H "Authorization: Bearer $TOKEN"
```

## Development Notes

### Without Firebase

The backend works without Firebase credentials:
- Authentication uses SQLite only
- Content is cached in SQLite
- Progress is stored locally
- Firestore sync will be skipped

### With Firebase

Full synchronization:
- Users synced to Firestore `users/` collection
- Content fetched from Firestore `content/` collection
- Progress synced bidirectionally
- Real-time updates available

## Security Notes

⚠️ **Important for Production:**

1. Change `SECRET_KEY` in `.env` to a strong random value
2. Use HTTPS for all API communication
3. Set specific `allow_origins` in CORS middleware
4. Use environment variables for sensitive data
5. Enable Firebase security rules
6. Implement rate limiting
7. Add input validation and sanitization
8. Enable logging and monitoring

## Next Steps

1. **Update React Native App** to use these endpoints
2. **Create remaining module content** (Sounds, Write, Read, Complete, Words)
3. **Add audio file support** for pronunciations
4. **Implement file upload** for profile pictures
5. **Add analytics endpoints** for progress tracking
6. **Create admin panel** for content management
7. **Add email notifications** for password reset
8. **Implement refresh tokens** for long-lived sessions

## Troubleshooting

### Database locked error
```bash
rm miabc.db
python scripts/init_db.py
```

### Firebase import errors
```bash
pip install --upgrade firebase-admin
```

### Port already in use
```bash
# Change port in command
uvicorn app.main:app --port 8001
```

## License

MIT License - DiazApps & Karunya University

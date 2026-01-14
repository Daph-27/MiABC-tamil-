# 🔥 Firebase Setup Guide for MiABC Tamil

## Step 1: Get Your Service Account Key

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com/
   - Select your project: `miabc-tamil`

2. **Navigate to Project Settings**
   - Click the ⚙️ gear icon (top-left, next to "Project Overview")
   - Select **"Project settings"**

3. **Go to Service Accounts Tab**
   - Click the **"Service accounts"** tab at the top

4. **Generate New Private Key**
   - Scroll down to the **"Firebase Admin SDK"** section
   - Click **"Generate new private key"**
   - Confirm by clicking **"Generate key"** in the popup

5. **Save the JSON File**
   - A JSON file will download automatically
   - **Rename it to:** `serviceAccountKey.json`
   - **Move it to:** `C:\Users\david\Downloads\miabc-tamil\MiABC-tamil-\miabc-tamil\backend\`

   Final path should be:
   ```
   C:\Users\david\Downloads\miabc-tamil\MiABC-tamil-\miabc-tamil\backend\serviceAccountKey.json
   ```

## Step 2: Create Firestore Database

1. **In Firebase Console**, go to **"Firestore Database"** (left sidebar)

2. **Click "Create database"**

3. **Choose Mode:**
   - Select **"Start in test mode"** (for development)
   - Click **"Next"**

4. **Select Location:**
   - Choose a location close to your users (e.g., `us-central` or `asia-south1`)
   - Click **"Enable"**

5. **Wait for Database Creation** (~1 minute)

## Step 3: Set Up Firestore Security Rules (Later)

For now, test mode is fine. Later, update rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Content collection - authenticated users can read
    match /content/{document=**} {
      allow read: if request.auth != null;
      allow write: if false; // Only backend can write
    }
  }
}
```

## Step 4: Verify Connection

After placing `serviceAccountKey.json`:

1. **Stop your backend** (Ctrl+C)

2. **Restart it:**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

3. **You should see:**
   ```
   ✅ Firebase initialized successfully
   ```

   Instead of:
   ```
   ⚠️  Firebase credentials not found at serviceAccountKey.json
   ```

## Step 5: Seed Initial Data

Once Firebase is connected, run:

```bash
cd C:\Users\david\Downloads\miabc-tamil\MiABC-tamil-\miabc-tamil\backend
python scripts/seed_firestore.py
```

This will populate:
- ✅ Alphabet module (Tamil letters)
- ✅ Alphabet quiz
- ✅ Colors module
- ✅ Mathematics module
- ✅ Family module
- ✅ Festivals module

## Step 6: Verify Data in Firebase Console

1. Go to **Firestore Database** in Firebase Console
2. You should see:
   - Collection: `content`
     - Documents: `module_01_alphabet`, `quiz_01_alphabet`, etc.
   - Collection: `users` (will populate when users register)

## Troubleshooting

### Issue: "Permission denied" error
- Make sure Firestore is in **test mode**
- Check that serviceAccountKey.json is in the correct folder

### Issue: "Project ID mismatch"
- Verify you downloaded the key from the correct Firebase project
- Check the `project_id` field in serviceAccountKey.json matches your Firebase project

### Issue: File not found
```bash
# Check if file exists
dir C:\Users\david\Downloads\miabc-tamil\MiABC-tamil-\miabc-tamil\backend\serviceAccountKey.json
```

## Security Warning ⚠️

**NEVER commit serviceAccountKey.json to Git!**

It's already in `.gitignore`, but double-check:

```bash
# In backend/.gitignore, verify this line exists:
serviceAccountKey.json
```

## Next Steps

Once Firebase is connected:

1. ✅ Test user registration from mobile app
2. ✅ Check Firestore Console to see new user documents
3. ✅ Test module content loading
4. ✅ Test progress syncing

Your data will now sync between:
- **SQLite** (local cache, fast)
- **Firestore** (cloud backup, cross-device sync)

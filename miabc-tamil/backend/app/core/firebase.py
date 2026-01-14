import firebase_admin
from firebase_admin import credentials, firestore, auth
from .config import settings
import os


class FirebaseService:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(FirebaseService, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        if self._initialized:
            return
            
        try:
            # Initialize Firebase Admin SDK
            if not firebase_admin._apps:
                cred_path = settings.FIREBASE_CREDENTIALS_PATH
                if os.path.exists(cred_path):
                    cred = credentials.Certificate(cred_path)
                    firebase_admin.initialize_app(cred)
                    self.db = firestore.client()
                    self._initialized = True
                    print("✅ Firebase initialized successfully")
                else:
                    print(f"⚠️  Firebase credentials not found at {cred_path}")
                    self.db = None
                    self._initialized = False
            else:
                self.db = firestore.client()
                self._initialized = True
        except Exception as e:
            print(f"❌ Firebase initialization error: {e}")
            self.db = None
            self._initialized = False
    
    def get_firestore(self):
        """Get Firestore client."""
        return self.db
    
    def verify_firebase_token(self, token: str):
        """Verify Firebase ID token."""
        try:
            decoded_token = auth.verify_id_token(token)
            return decoded_token
        except Exception as e:
            print(f"Token verification error: {e}")
            return None
    
    def create_user_in_firestore(self, uid: str, email: str, display_name: str = ""):
        """Create user document in Firestore."""
        if not self.db:
            return False
            
        try:
            user_ref = self.db.collection('users').document(uid)
            user_ref.set({
                'uid': uid,
                'email': email,
                'displayName': display_name,
                'createdAt': firestore.SERVER_TIMESTAMP,
                'progress': {
                    '01_alphabet': {
                        'unlocked': True,
                        'score': 0,
                        'passed': False
                    }
                }
            })
            return True
        except Exception as e:
            print(f"Error creating user in Firestore: {e}")
            return False
    
    def get_user_progress(self, uid: str):
        """Get user progress from Firestore."""
        if not self.db:
            return None
            
        try:
            user_ref = self.db.collection('users').document(uid)
            user_doc = user_ref.get()
            if user_doc.exists:
                return user_doc.to_dict().get('progress', {})
            return None
        except Exception as e:
            print(f"Error getting user progress: {e}")
            return None
    
    def update_user_progress(self, uid: str, module_id: str, score: int, passed: bool):
        """Update user progress in Firestore."""
        if not self.db:
            return False
            
        try:
            user_ref = self.db.collection('users').document(uid)
            user_ref.update({
                f'progress.{module_id}': {
                    'unlocked': True,
                    'score': score,
                    'passed': passed,
                    'completedAt': firestore.SERVER_TIMESTAMP
                }
            })
            return True
        except Exception as e:
            print(f"Error updating user progress: {e}")
            return False
    
    def get_module_content(self, module_id: str):
        """Get module content from Firestore."""
        if not self.db:
            return None
            
        try:
            doc_ref = self.db.collection('content').document(f'module_{module_id}')
            doc = doc_ref.get()
            if doc.exists:
                return doc.to_dict()
            return None
        except Exception as e:
            print(f"Error getting module content: {e}")
            return None
    
    def get_quiz_content(self, module_id: str):
        """Get quiz content from Firestore."""
        if not self.db:
            return None
            
        try:
            doc_ref = self.db.collection('content').document(f'quiz_{module_id}')
            doc = doc_ref.get()
            if doc.exists:
                return doc.to_dict()
            return None
        except Exception as e:
            print(f"Error getting quiz content: {e}")
            return None


# Singleton instance
firebase_service = FirebaseService()


def get_firebase():
    """Dependency for FastAPI routes."""
    return firebase_service

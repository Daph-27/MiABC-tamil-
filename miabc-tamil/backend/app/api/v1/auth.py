from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta, datetime
from pydantic import EmailStr
import uuid
import random
import string

from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token, decode_access_token
from app.core.config import settings
from app.core.firebase import get_firebase
from app.models.models import User
from app.schemas.schemas import (
    UserRegister, UserLogin, Token, UserResponse, MessageResponse
)

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_PREFIX}/auth/login")


def generate_access_code() -> str:
    """Generate a unique 6-digit access code."""
    return ''.join(random.choices(string.digits, k=6))


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """Get current authenticated user."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    token_data = decode_access_token(token)
    if token_data is None:
        raise credentials_exception
    
    username = token_data.get("sub")
    if username is None:
        raise credentials_exception
    
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise credentials_exception
    
    return user


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: UserRegister,
    db: Session = Depends(get_db),
    firebase = Depends(get_firebase)
):
    """
    Register a new user.
    Creates user in both SQLite (local) and Firebase (cloud).
    """
    # Check if user already exists in SQLite
    existing_user = db.query(User).filter(User.username == user_data.username).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # Check if email already exists (if provided)
    if user_data.guardianEmail:
        existing_email = db.query(User).filter(User.guardianEmail == user_data.guardianEmail).first()
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email address already registered"
            )
    
    # Generate unique access code
    access_code = generate_access_code()
    while db.query(User).filter(User.accessCode == access_code).first():
        access_code = generate_access_code()
    
    # Hash password
    hashed_password = get_password_hash(user_data.password)
    
    # Create user in SQLite
    db_user = User(
        accessCode=access_code,
        guardianName=user_data.guardianName,
        guardianRelation=user_data.guardianRelation,
        guardianEmail=user_data.guardianEmail,
        guardianPhone=user_data.guardianPhone,
        learnerName=user_data.learnerName,
        learnerAge=user_data.learnerAge,
        learnerGrade=user_data.learnerGrade,
        username=user_data.username,
        password=hashed_password,
        parentalLock=user_data.parentalLock,
        createdAt=datetime.utcnow()
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Create user in Firebase Firestore (async, non-blocking)
    try:
        firebase.create_user_in_firestore(
            uid=str(db_user.userId),
            email=user_data.guardianEmail or "",
            display_name=user_data.learnerName
        )
    except Exception as e:
        print(f"Warning: Failed to create user in Firebase: {e}")
        # Continue anyway - user exists in SQLite
    
    # Generate access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user_data.username, "userId": db_user.userId},
        expires_delta=access_token_expires
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        userId=db_user.userId,
        username=user_data.username,
        accessCode=access_code,
        learnerName=user_data.learnerName
    )


@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    Login with username and password (OAuth2 compatible).
    Returns JWT access token.
    """
    # Find user by username
    user = db.query(User).filter(User.username == form_data.username).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verify password
    if not verify_password(form_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Generate access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username, "userId": user.userId},
        expires_delta=access_token_expires
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        userId=user.userId,
        username=user.username,
        accessCode=user.accessCode,
        learnerName=user.learnerName
    )


@router.post("/login-json", response_model=Token)
async def login_json(
    user_data: UserLogin,
    db: Session = Depends(get_db)
):
    """
    Login with username and password (JSON body).
    Alternative to OAuth2 form for mobile apps.
    """
    # Find user by username
    user = db.query(User).filter(User.username == user_data.username).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    
    # Verify password
    if not verify_password(user_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    
    # Generate access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username, "userId": user.userId},
        expires_delta=access_token_expires
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        userId=user.userId,
        username=user.username,
        accessCode=user.accessCode,
        learnerName=user.learnerName
    )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get current user information."""
    return UserResponse(
        userId=current_user.userId,
        username=current_user.username,
        learnerName=current_user.learnerName,
        guardianName=current_user.guardianName,
        accessCode=current_user.accessCode,
        createdAt=current_user.createdAt
    )


@router.put("/update-profile")
async def update_profile(
    learnerName: str = None,
    guardianName: str = None,
    guardianEmail: str = None,
    guardianPhone: str = None,
    learnerGrade: str = None,
    congratulationPhrase: str = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user profile information."""
    # Update only provided fields
    if learnerName is not None:
        current_user.learnerName = learnerName
    if guardianName is not None:
        current_user.guardianName = guardianName
    if guardianEmail is not None:
        current_user.guardianEmail = guardianEmail
    if guardianPhone is not None:
        current_user.guardianPhone = guardianPhone
    if learnerGrade is not None:
        current_user.learnerGrade = learnerGrade
    # Store congratulation phrase if your model supports it
    # if congratulationPhrase is not None:
    #     current_user.congratulationPhrase = congratulationPhrase
    
    db.commit()
    db.refresh(current_user)
    
    return UserResponse(
        userId=current_user.userId,
        username=current_user.username,
        learnerName=current_user.learnerName,
        guardianName=current_user.guardianName,
        accessCode=current_user.accessCode,
        createdAt=current_user.createdAt
    )


@router.post("/forgot-password", response_model=MessageResponse)
async def forgot_password(
    username: str,
    db: Session = Depends(get_db)
):
    """
    Request password reset (placeholder - send accessCode to guardian email).
    """
    user = db.query(User).filter(User.username == username).first()
    
    if not user:
        # Don't reveal if user exists
        return MessageResponse(message="If the username exists, a recovery code has been sent to the guardian's email")
    
    # In production, send email with accessCode or reset link
    # For now, just return success message
    return MessageResponse(message="If the username exists, a recovery code has been sent to the guardian's email")

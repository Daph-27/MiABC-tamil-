from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Dict, List, Any
from datetime import datetime


# Authentication Schemas
class UserRegister(BaseModel):
    username: str = Field(..., min_length=3)
    password: str = Field(..., min_length=6)
    learnerName: str
    guardianName: str
    learnerAge: Optional[int] = None
    guardianEmail: Optional[str] = None
    guardianPhone: Optional[str] = None
    guardianRelation: Optional[str] = None
    learnerGrade: Optional[str] = None
    parentalLock: Optional[str] = None
    
    class Config:
        from_attributes = True


class UserLogin(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    userId: int
    username: str
    accessCode: str
    learnerName: Optional[str] = None


class TokenData(BaseModel):
    username: Optional[str] = None


# User Schemas
class UserBase(BaseModel):
    username: str
    learnerName: str
    guardianName: str


class UserCreate(UserBase):
    password: str
    learnerAge: Optional[int] = None
    guardianEmail: Optional[str] = None
    guardianPhone: Optional[str] = None


class UserResponse(UserBase):
    userId: int
    accessCode: str
    createdAt: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# Progress Schemas
class ModuleProgress(BaseModel):
    unlocked: bool = False
    score: int = 0
    passed: bool = False
    completedAt: Optional[datetime] = None


class ProgressUpdate(BaseModel):
    module_id: str
    score: int
    passed: bool


class UserProgress(BaseModel):
    uid: str
    progress: Dict[str, ModuleProgress]


# Content Schemas
class ContentItem(BaseModel):
    type: str
    content: Any
    audioUrl: Optional[str] = None


class ModuleContent(BaseModel):
    id: str
    title: str
    tabs: List[str] = []
    items: List[ContentItem] = []
    validated: bool = False


class QuizQuestion(BaseModel):
    id: str
    text: str
    options: List[Dict[str, Any]]


class QuizContent(BaseModel):
    moduleId: str
    title: str
    passingScore: int = 80
    questions: List[QuizQuestion] = []
    validated: bool = False


# Response Schemas
class MessageResponse(BaseModel):
    message: str
    success: bool = True


class ErrorResponse(BaseModel):
    detail: str
    success: bool = False

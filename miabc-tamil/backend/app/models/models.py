from sqlalchemy import Column, String, Integer, Boolean, DateTime, JSON, ForeignKey, Text
from sqlalchemy.sql import func
from app.core.database import Base


class User(Base):
    """SQLite User model matching existing schema."""
    __tablename__ = "users"
    
    userId = Column("userId", Integer, primary_key=True, index=True)
    accessCode = Column("accessCode", String(50), unique=True, index=True, nullable=False)
    guardianName = Column("guardianName", String(100), nullable=False)
    guardianRelation = Column("guardianRelation", String(50), nullable=True)
    guardianEmail = Column("guardianEmail", String(100), nullable=True)
    guardianPhone = Column("guardianPhone", String(20), nullable=True)
    learnerName = Column("learnerName", String(100), nullable=False)
    learnerAge = Column("learnerAge", Integer, nullable=True)
    learnerGrade = Column("learnerGrade", String(20), nullable=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)
    parentalLock = Column("parentalLock", String(10), nullable=True)
    profilePhoto = Column("profilePhoto", Text, nullable=True)
    createdAt = Column("createdAt", DateTime, nullable=True)


class ModuleContent(Base):
    """SQLite cache for module content."""
    __tablename__ = "module_content"
    
    id = Column(Integer, primary_key=True, index=True)
    module_id = Column(String, unique=True, index=True, nullable=False)
    title = Column(String, nullable=False)
    tabs = Column(JSON, nullable=True)  # Array of strings
    items = Column(JSON, nullable=True)  # Array of content items
    validated = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())


class QuizContent(Base):
    """SQLite cache for quiz content."""
    __tablename__ = "quiz_content"
    
    id = Column(Integer, primary_key=True, index=True)
    module_id = Column(String, index=True, nullable=False)
    title = Column(String, nullable=False)
    passing_score = Column(Integer, default=80)
    questions = Column(JSON, nullable=True)  # Array of question objects
    validated = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())


class LearnerProgress(Base):
    """Learner progress tracking."""
    __tablename__ = "learnerProgress"
    
    id = Column(Integer, primary_key=True, index=True)
    userId = Column("userId", Integer, ForeignKey("users.userId"), nullable=False)
    moduleName = Column("moduleName", String(50), index=True, nullable=False)
    moduleType = Column("moduleType", String(50), nullable=True)
    itemId = Column("itemId", Integer, nullable=True)
    score = Column(Integer, nullable=True)
    attempts = Column(Integer, nullable=True)
    completed = Column(Integer, nullable=True)
    timeSpent = Column("timeSpent", Integer, nullable=True)
    language = Column(String(20), nullable=True)
    createdAt = Column("createdAt", DateTime, nullable=True)
    updatedAt = Column("updatedAt", DateTime, nullable=True)


class FamilyMember(Base):
    """Family members associated with a learner."""
    __tablename__ = "familyMembers"
    
    id = Column(Integer, primary_key=True, index=True)
    userId = Column("userId", Integer, ForeignKey("users.userId"), nullable=False)
    name = Column(String(100), nullable=False)
    relation = Column(String(50), nullable=False)
    photoUri = Column("photoUri", Text, nullable=True)
    createdAt = Column("createdAt", DateTime, nullable=True)


class OriginalWord(Base):
    """Original words/vocabulary content."""
    __tablename__ = "originalWords"
    
    id = Column(Integer, primary_key=True, index=True)
    englishName = Column("englishName", String(100), index=True, nullable=False)
    englishSound = Column("englishSound", String(255), nullable=True)
    spanishName = Column("spanishName", String(100), nullable=True)
    spanishSound = Column("spanishSound", String(255), nullable=True)
    tamilWord = Column("tamilWord", String(100), nullable=True)
    tamilPronunciation = Column("tamilPronunciation", String(255), nullable=True)
    tamilSound = Column("tamilSound", String(255), nullable=True)
    imagePath = Column("imagePath", String(255), nullable=True)
    initials = Column(String(10), index=True, nullable=True)
    recordFlag = Column("recordFlag", String(10), nullable=True)
    key = Column("key", String(50), nullable=True)
    type = Column(String(50), nullable=True)
    tema = Column(String(100), nullable=True)
    letra = Column(String(10), nullable=True)
    dateCompleted = Column("dateCompleted", DateTime, nullable=True)
    createdAt = Column("createdAt", DateTime, nullable=True)


class QuizAttempt(Base):
    """Quiz attempt records."""
    __tablename__ = "quizAttempts"
    
    id = Column(Integer, primary_key=True, index=True)
    userId = Column("userId", Integer, ForeignKey("users.userId"), nullable=False)
    quizType = Column("quizType", String(50), nullable=False)
    questionId = Column("questionId", Integer, nullable=True)
    userAnswer = Column("userAnswer", String(255), nullable=True)
    correctAnswer = Column("correctAnswer", String(255), nullable=True)
    isCorrect = Column("isCorrect", Integer, nullable=True)
    responseTime = Column("responseTime", Integer, nullable=True)
    language = Column(String(20), nullable=True)
    createdAt = Column("createdAt", DateTime, nullable=True)


class PronunciationAttempt(Base):
    """Pronunciation practice attempts."""
    __tablename__ = "pronunciationAttempts"
    
    id = Column(Integer, primary_key=True, index=True)
    userId = Column("userId", Integer, ForeignKey("users.userId"), nullable=False)
    wordId = Column("wordId", Integer, ForeignKey("originalWords.id"), nullable=True)
    targetWord = Column("targetWord", String(100), nullable=False)
    userPronunciation = Column("userPronunciation", Text, nullable=True)
    accuracyScore = Column("accuracyScore", Integer, nullable=True)
    language = Column(String(20), nullable=True)
    createdAt = Column("createdAt", DateTime, nullable=True)


class LearningSession(Base):
    """Learning session tracking."""
    __tablename__ = "learningSessions"
    
    id = Column(Integer, primary_key=True, index=True)
    userId = Column("userId", Integer, ForeignKey("users.userId"), nullable=False)
    sessionStart = Column("sessionStart", DateTime, nullable=True)
    sessionEnd = Column("sessionEnd", DateTime, nullable=True)
    modulesAccessed = Column("modulesAccessed", Text, nullable=True)
    totalTimeSpent = Column("totalTimeSpent", Integer, nullable=True)
    itemsCompleted = Column("itemsCompleted", Integer, nullable=True)
    averageScore = Column("averageScore", Integer, nullable=True)
    createdAt = Column("createdAt", DateTime, nullable=True)


class ReadingText(Base):
    """Reading texts for learners."""
    __tablename__ = "readingTexts"
    
    id = Column(Integer, primary_key=True, index=True)
    userId = Column("userId", Integer, ForeignKey("users.userId"), nullable=False)
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    language = Column(String(20), nullable=True)
    level = Column(String(20), nullable=True)
    createdAt = Column("createdAt", DateTime, nullable=True)
    updatedAt = Column("updatedAt", DateTime, nullable=True)

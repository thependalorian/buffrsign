"""
BuffrSign Auth Service - Microservice
Handles authentication, JWT tokens, and RBAC for BuffrSign
"""

import os
import logging
import uuid
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List

import redis.asyncio as redis
from fastapi import FastAPI, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from sqlalchemy import Column, String, Integer, DateTime, Boolean, Text, JSON, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
import jwt
import bcrypt
from passlib.context import CryptContext

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database setup
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/buffrsign_auth")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Redis setup
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
redis_client = None

# Security
security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT Configuration
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key")
JWT_ACCESS_TOKEN_EXPIRE_MINUTES = 30
JWT_REFRESH_TOKEN_EXPIRE_DAYS = 7

app = FastAPI(
    title="BuffrSign Auth Service",
    description="Authentication and authorization microservice for BuffrSign",
    version="1.0.0",
)

# Database Models
class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    role = Column(String, default="user", nullable=False)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    permissions = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class UserSession(Base):
    __tablename__ = "user_sessions"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False, index=True)
    session_token = Column(String, unique=True, nullable=False, index=True)
    refresh_token = Column(String, unique=True, nullable=False, index=True)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)

# Pydantic Models
class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    role: str = "user"

class UserResponse(BaseModel):
    id: str
    email: str
    first_name: str
    last_name: str
    role: str
    is_active: bool
    is_verified: bool
    permissions: List[str]
    created_at: datetime

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int

class AuthService:
    def __init__(self):
        self.redis_client = None
    
    async def get_redis(self):
        if self.redis_client is None:
            self.redis_client = redis.from_url(REDIS_URL)
        return self.redis_client
    
    def hash_password(self, password: str) -> str:
        return pwd_context.hash(password)
    
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        return pwd_context.verify(plain_password, hashed_password)
    
    def create_access_token(self, data: Dict[str, Any]) -> str:
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(minutes=JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode.update({"exp": expire, "type": "access"})
        return jwt.encode(to_encode, JWT_SECRET_KEY, algorithm="HS256")
    
    def create_refresh_token(self, data: Dict[str, Any]) -> str:
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(days=JWT_REFRESH_TOKEN_EXPIRE_DAYS)
        to_encode.update({"exp": expire, "type": "refresh"})
        return jwt.encode(to_encode, JWT_SECRET_KEY, algorithm="HS256")
    
    def verify_token(self, token: str) -> Dict[str, Any]:
        try:
            payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=["HS256"])
            return payload
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Token expired")
        except jwt.JWTError:
            raise HTTPException(status_code=401, detail="Invalid token")
    
    async def store_session(self, user_id: str, session_token: str, refresh_token: str, expires_at: datetime):
        redis_conn = await self.get_redis()
        session_data = {
            "user_id": user_id,
            "session_token": session_token,
            "refresh_token": refresh_token,
            "expires_at": expires_at.isoformat()
        }
        await redis_conn.setex(f"session:{session_token}", JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60, str(session_data))
    
    async def get_session(self, session_token: str) -> Optional[Dict[str, Any]]:
        redis_conn = await self.get_redis()
        session_data = await redis_conn.get(f"session:{session_token}")
        if session_data:
            return eval(session_data)
        return None
    
    async def revoke_session(self, session_token: str):
        redis_conn = await self.get_redis()
        await redis_conn.delete(f"session:{session_token}")

# Initialize auth service
auth_service = AuthService()

# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Authentication dependency
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    token = credentials.credentials
    payload = auth_service.verify_token(token)
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found or inactive")
    
    return user

# API Endpoints
@app.post("/api/auth/login", response_model=TokenResponse)
async def login(user_login: UserLogin, db: Session = Depends(get_db)):
    """Authenticate user and return JWT tokens"""
    user = db.query(User).filter(User.email == user_login.email).first()
    
    if not user or not auth_service.verify_password(user_login.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not user.is_active:
        raise HTTPException(status_code=401, detail="Account is inactive")
    
    # Create tokens
    token_data = {
        "sub": user.id,
        "email": user.email,
        "role": user.role,
        "permissions": user.permissions
    }
    
    access_token = auth_service.create_access_token(token_data)
    refresh_token = auth_service.create_refresh_token(token_data)
    
    # Store session
    expires_at = datetime.utcnow() + timedelta(minutes=JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    await auth_service.store_session(user.id, access_token, refresh_token, expires_at)
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )

@app.post("/api/auth/register", response_model=UserResponse)
async def register(user_register: UserRegister, db: Session = Depends(get_db)):
    """Register a new user"""
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_register.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    hashed_password = auth_service.hash_password(user_register.password)
    user = User(
        email=user_register.email,
        password_hash=hashed_password,
        first_name=user_register.first_name,
        last_name=user_register.last_name,
        role=user_register.role,
        permissions=["read"] if user_register.role == "user" else ["read", "write", "admin"]
    )
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    return UserResponse(
        id=user.id,
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        role=user.role,
        is_active=user.is_active,
        is_verified=user.is_verified,
        permissions=user.permissions,
        created_at=user.created_at
    )

@app.post("/api/auth/refresh", response_model=TokenResponse)
async def refresh_token(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Refresh access token using refresh token"""
    refresh_token = credentials.credentials
    payload = auth_service.verify_token(refresh_token)
    
    if payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid token type")
    
    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found or inactive")
    
    # Create new tokens
    token_data = {
        "sub": user.id,
        "email": user.email,
        "role": user.role,
        "permissions": user.permissions
    }
    
    new_access_token = auth_service.create_access_token(token_data)
    new_refresh_token = auth_service.create_refresh_token(token_data)
    
    # Store new session
    expires_at = datetime.utcnow() + timedelta(minutes=JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    await auth_service.store_session(user.id, new_access_token, new_refresh_token, expires_at)
    
    return TokenResponse(
        access_token=new_access_token,
        refresh_token=new_refresh_token,
        expires_in=JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )

@app.post("/api/auth/logout")
async def logout(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Logout user and revoke session"""
    token = credentials.credentials
    await auth_service.revoke_session(token)
    return {"message": "Successfully logged out"}

@app.get("/api/auth/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        first_name=current_user.first_name,
        last_name=current_user.last_name,
        role=current_user.role,
        is_active=current_user.is_active,
        is_verified=current_user.is_verified,
        permissions=current_user.permissions,
        created_at=current_user.created_at
    )

@app.get("/api/auth/users", response_model=List[UserResponse])
async def get_users(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all users (admin only)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    users = db.query(User).all()
    return [
        UserResponse(
            id=user.id,
            email=user.email,
            first_name=user.first_name,
            last_name=user.last_name,
            role=user.role,
            is_active=user.is_active,
            is_verified=user.is_verified,
            permissions=user.permissions,
            created_at=user.created_at
        )
        for user in users
    ]

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "auth-service",
        "timestamp": datetime.utcnow().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
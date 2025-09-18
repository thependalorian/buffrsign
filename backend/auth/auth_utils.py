"""
Authentication utilities for BuffrSign

Handles JWT token creation, verification, and user authentication
with proper security practices and no hardcoded secrets.
"""

import os
import jwt
import logging
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import create_client, Client

logger = logging.getLogger(__name__)

# Initialize Supabase client
supabase_url = os.getenv("SUPABASE_URL")
supabase_service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(supabase_url, supabase_service_key)

# Security configuration - NO HARDCODED SECRETS
JWT_SECRET = os.getenv("JWT_SECRET_KEY")
JWT_ALGORITHM = "HS256"
JWT_EXPIRY_HOURS = int(os.getenv("JWT_EXPIRY_HOURS", "24"))

# Validate JWT secret is configured
if not JWT_SECRET or len(JWT_SECRET) < 32:
    raise ValueError(
        "JWT_SECRET_KEY environment variable must be set with at least 32 characters. "
        "Generate a secure secret using: python -c 'import secrets; print(secrets.token_urlsafe(32))'"
    )

security = HTTPBearer(auto_error=False)

def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token with proper security"""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(hours=JWT_EXPIRY_HOURS)
    
    to_encode.update({"exp": expire, "iat": datetime.utcnow()})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    
    logger.info(f"JWT token created for user: {data.get('sub', 'unknown')}")
    return encoded_jwt

def verify_token(token: str) -> Dict[str, Any]:
    """Verify JWT token and return payload"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        logger.warning("JWT token expired")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except jwt.InvalidTokenError:
        logger.warning("Invalid JWT token")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict[str, Any]:
    """Get current authenticated user from JWT token"""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials required"
        )
    
    token = credentials.credentials
    payload = verify_token(token)
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )
    
    # Return user data from token payload
    return {
        "id": user_id,
        "email": payload.get("email"),
        "role": payload.get("role", "individual"),
        "plan": payload.get("plan", "free")
    }

async def get_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
    """Get user by ID from Supabase"""
    try:
        response = supabase.auth.admin.get_user_by_id(user_id)
        if response.user:
            return {
                "id": response.user.id,
                "email": response.user.email,
                "name": response.user.user_metadata.get("name", ""),
                "phone": response.user.user_metadata.get("phone", ""),
                "company": response.user.user_metadata.get("company", ""),
                "role": response.user.user_metadata.get("role", "individual"),
                "plan": response.user.user_metadata.get("plan", "free"),
                "created_at": response.user.created_at,
                "last_sign_in_at": response.user.last_sign_in_at
            }
        return None
    except Exception:
        return None

def require_role(required_role: str):
    """Decorator to require specific user role"""
    async def role_checker(current_user: Dict[str, Any] = Depends(get_current_user)):
        if current_user.get("role") != required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role '{required_role}' required"
            )
        return current_user
    return role_checker

def require_plan(required_plan: str):
    """Decorator to require specific user plan"""
    async def plan_checker(current_user: Dict[str, Any] = Depends(get_current_user)):
        user_plan = current_user.get("plan", "free")
        plan_hierarchy = {"free": 0, "pro": 1, "business": 2, "enterprise": 3}
        
        if plan_hierarchy.get(user_plan, 0) < plan_hierarchy.get(required_plan, 0):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Plan '{required_plan}' or higher required"
            )
        return current_user
    return plan_checker

def validate_password_strength(password: str) -> bool:
    """Validate password meets security requirements"""
    if len(password) < 8:
        return False
    
    has_upper = any(c.isupper() for c in password)
    has_lower = any(c.islower() for c in password)
    has_digit = any(c.isdigit() for c in password)
    has_special = any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in password)
    
    return has_upper and has_lower and has_digit and has_special

def generate_secure_token() -> str:
    """Generate a secure random token"""
    import secrets
    return secrets.token_urlsafe(32)

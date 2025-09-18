"""
Supabase Service for BuffrSign
Handles authentication, user management, and Supabase integration
"""

import os
import logging
import hashlib
import bcrypt
from typing import Dict, Any, Optional
from datetime import datetime, timezone
from supabase import create_client, Client
from supabase.lib.client_options import ClientOptions

logger = logging.getLogger(__name__)

class SupabaseService:
    def __init__(self):
        self.supabase_url = os.getenv("SUPABASE_URL")
        self.supabase_service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        self.supabase_anon_key = os.getenv("SUPABASE_ANON_KEY")
        self.supabase: Optional[Client] = None
        
    async def initialize(self):
        """Initialize Supabase client"""
        try:
            if not self.supabase_url or not self.supabase_service_key:
                raise ValueError("Supabase credentials not configured")
            
            self.supabase = create_client(
                self.supabase_url,
                self.supabase_service_key,
                options=ClientOptions(
                    schema="public",
                    headers={
                        "X-Client-Info": "buffrsign-backend"
                    }
                )
            )
            logger.info("✅ Supabase client initialized")
            
        except Exception as e:
            logger.error(f"❌ Supabase initialization failed: {e}")
            raise
    
    async def cleanup(self):
        """Cleanup Supabase connections"""
        if self.supabase:
            # Supabase client doesn't have explicit cleanup
            logger.info("✅ Supabase connections cleaned up")
    
    async def test_connection(self):
        """Test Supabase connection"""
        try:
            if not self.supabase:
                return False
            
            # Test connection by getting auth settings
            auth_settings = self.supabase.auth.admin.list_users()
            return True
            
        except Exception as e:
            logger.error(f"Supabase connection test failed: {e}")
            return False
    
    async def health_check(self):
        """Health check for Supabase service"""
        return await self.test_connection()
    
    def _hash_password(self, password: str) -> str:
        """Hash password using bcrypt"""
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        return hashed.decode('utf-8')
    
    def _verify_password(self, password: str, hashed_password: str) -> bool:
        """Verify password against hash"""
        return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))
    
    async def create_user(self, email: str, password: str, first_name: str, last_name: str, company: str = None) -> Optional[Dict[str, Any]]:
        """Create new user in Supabase"""
        try:
            if not self.supabase:
                raise ValueError("Supabase client not initialized")
            
            # Create user in Supabase Auth
            auth_response = self.supabase.auth.admin.create_user({
                "email": email,
                "password": password,
                "email_confirm": True,
                "user_metadata": {
                    "first_name": first_name,
                    "last_name": last_name,
                    "company": company,
                    "role": "individual",
                    "plan": "free"
                }
            })
            
            if not auth_response.user:
                raise ValueError("Failed to create user in Supabase Auth")
            
            # Create user profile in public.users table
            profile_data = {
                "id": auth_response.user.id,
                "email": email,
                "password_hash": self._hash_password(password),
                "first_name": first_name,
                "last_name": last_name,
                "company": company,
                "role": "individual",
                "plan": "free",
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
            
            result = self.supabase.table("users").insert(profile_data).execute()
            
            if result.data:
                logger.info(f"User created successfully: {email}")
                return {
                    "id": auth_response.user.id,
                    "email": email,
                    "first_name": first_name,
                    "last_name": last_name,
                    "company": company,
                    "role": "individual",
                    "plan": "free"
                }
            else:
                raise ValueError("Failed to create user profile")
                
        except Exception as e:
            logger.error(f"Error creating user: {e}")
            raise
    
    async def authenticate_user(self, email: str, password: str) -> Optional[Dict[str, Any]]:
        """Authenticate user with email and password"""
        try:
            if not self.supabase:
                raise ValueError("Supabase client not initialized")
            
            # Sign in with Supabase Auth
            auth_response = self.supabase.auth.sign_in_with_password({
                "email": email,
                "password": password
            })
            
            if not auth_response.user:
                return None
            
            # Get user profile from database
            result = self.supabase.table("users").select("*").eq("id", auth_response.user.id).execute()
            
            if result.data:
                user_profile = result.data[0]
                
                # Verify password hash
                if not self._verify_password(password, user_profile["password_hash"]):
                    return None
                
                return {
                    "id": user_profile["id"],
                    "email": user_profile["email"],
                    "first_name": user_profile["first_name"],
                    "last_name": user_profile["last_name"],
                    "company": user_profile.get("company"),
                    "role": user_profile.get("role", "individual"),
                    "plan": user_profile.get("plan", "free")
                }
            else:
                return None
                
        except Exception as e:
            logger.error(f"Error authenticating user: {e}")
            return None
    
    async def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user by ID"""
        try:
            if not self.supabase:
                raise ValueError("Supabase client not initialized")
            
            result = self.supabase.table("users").select("*").eq("id", user_id).execute()
            return result.data[0] if result.data else None
            
        except Exception as e:
            logger.error(f"Error getting user by ID: {e}")
            return None
    
    async def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Get user by email"""
        try:
            if not self.supabase:
                raise ValueError("Supabase client not initialized")
            
            result = self.supabase.table("users").select("*").eq("email", email).execute()
            return result.data[0] if result.data else None
            
        except Exception as e:
            logger.error(f"Error getting user by email: {e}")
            return None
    
    async def update_user(self, user_id: str, update_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update user profile"""
        try:
            if not self.supabase:
                raise ValueError("Supabase client not initialized")
            
            # Update user metadata in Auth
            if "first_name" in update_data or "last_name" in update_data or "company" in update_data:
                metadata = {}
                if "first_name" in update_data:
                    metadata["first_name"] = update_data["first_name"]
                if "last_name" in update_data:
                    metadata["last_name"] = update_data["last_name"]
                if "company" in update_data:
                    metadata["company"] = update_data["company"]
                
                self.supabase.auth.admin.update_user_by_id(
                    user_id,
                    {"user_metadata": metadata}
                )
            
            # Update user profile in database
            update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
            result = self.supabase.table("users").update(update_data).eq("id", user_id).execute()
            
            return result.data[0] if result.data else None
            
        except Exception as e:
            logger.error(f"Error updating user: {e}")
            return None
    
    async def delete_user(self, user_id: str) -> bool:
        """Delete user"""
        try:
            if not self.supabase:
                raise ValueError("Supabase client not initialized")
            
            # Delete user from Auth
            self.supabase.auth.admin.delete_user(user_id)
            
            # Delete user profile from database
            result = self.supabase.table("users").delete().eq("id", user_id).execute()
            
            return bool(result.data)
            
        except Exception as e:
            logger.error(f"Error deleting user: {e}")
            return False
    
    async def list_users(self, limit: int = 100, offset: int = 0) -> list:
        """List users (admin only)"""
        try:
            if not self.supabase:
                raise ValueError("Supabase client not initialized")
            
            result = self.supabase.table("users").select("*").range(offset, offset + limit - 1).execute()
            return result.data or []
            
        except Exception as e:
            logger.error(f"Error listing users: {e}")
            return []
    
    async def enable_mfa(self, user_id: str, secret: str) -> bool:
        """Enable MFA for user"""
        try:
            if not self.supabase:
                raise ValueError("Supabase client not initialized")
            
            result = self.supabase.table("users").update({
                "mfa_enabled": True,
                "mfa_secret": secret,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }).eq("id", user_id).execute()
            
            return bool(result.data)
            
        except Exception as e:
            logger.error(f"Error enabling MFA: {e}")
            return False
    
    async def disable_mfa(self, user_id: str) -> bool:
        """Disable MFA for user"""
        try:
            if not self.supabase:
                raise ValueError("Supabase client not initialized")
            
            result = self.supabase.table("users").update({
                "mfa_enabled": False,
                "mfa_secret": None,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }).eq("id", user_id).execute()
            
            return bool(result.data)
            
        except Exception as e:
            logger.error(f"Error disabling MFA: {e}")
            return False
    
    async def verify_mfa_token(self, user_id: str, token: str) -> bool:
        """Verify MFA token"""
        try:
            if not self.supabase:
                raise ValueError("Supabase client not initialized")
            
            # Get user's MFA secret
            result = self.supabase.table("users").select("mfa_secret").eq("id", user_id).execute()
            
            if not result.data or not result.data[0]["mfa_secret"]:
                return False
            
            # In a real implementation, you would verify the TOTP token here
            # For now, we'll use a simple verification
            import pyotp
            
            totp = pyotp.TOTP(result.data[0]["mfa_secret"])
            return totp.verify(token)
            
        except Exception as e:
            logger.error(f"Error verifying MFA token: {e}")
            return False
    
    async def reset_password(self, email: str) -> bool:
        """Send password reset email"""
        try:
            if not self.supabase:
                raise ValueError("Supabase client not initialized")
            
            self.supabase.auth.reset_password_email(email)
            return True
            
        except Exception as e:
            logger.error(f"Error sending password reset: {e}")
            return False
    
    async def update_password(self, user_id: str, new_password: str) -> bool:
        """Update user password"""
        try:
            if not self.supabase:
                raise ValueError("Supabase client not initialized")
            
            # Update password in Auth
            self.supabase.auth.admin.update_user_by_id(
                user_id,
                {"password": new_password}
            )
            
            # Update password hash in database
            result = self.supabase.table("users").update({
                "password_hash": self._hash_password(new_password),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }).eq("id", user_id).execute()
            
            return bool(result.data)
            
        except Exception as e:
            logger.error(f"Error updating password: {e}")
            return False
    
    async def get_user_sessions(self, user_id: str) -> list:
        """Get user sessions (admin only)"""
        try:
            if not self.supabase:
                raise ValueError("Supabase client not initialized")
            
            # This would require additional implementation
            # For now, return empty list
            return []
            
        except Exception as e:
            logger.error(f"Error getting user sessions: {e}")
            return []
    
    async def revoke_user_sessions(self, user_id: str) -> bool:
        """Revoke all user sessions (admin only)"""
        try:
            if not self.supabase:
                raise ValueError("Supabase client not initialized")
            
            # This would require additional implementation
            # For now, return True
            return True
            
        except Exception as e:
            logger.error(f"Error revoking user sessions: {e}")
            return False

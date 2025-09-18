"""
Storage Service for BuffrSign
Handles file upload, storage, and management using Cloudinary
"""

import os
import logging
import cloudinary
import cloudinary.uploader
import cloudinary.api
from typing import Dict, Any, Optional, BinaryIO
from datetime import datetime, timezone
import hashlib
import mimetypes

logger = logging.getLogger(__name__)

class StorageService:
    def __init__(self):
        self.cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME")
        self.api_key = os.getenv("CLOUDINARY_API_KEY")
        self.api_secret = os.getenv("CLOUDINARY_API_SECRET")
        self.initialized = False
        
    async def initialize(self):
        """Initialize Cloudinary configuration"""
        try:
            if not all([self.cloud_name, self.api_key, self.api_secret]):
                raise ValueError("Cloudinary credentials not configured")
            
            cloudinary.config(
                cloud_name=self.cloud_name,
                api_key=self.api_key,
                api_secret=self.api_secret
            )
            
            self.initialized = True
            logger.info("✅ Cloudinary storage service initialized")
            
        except Exception as e:
            logger.error(f"❌ Cloudinary initialization failed: {e}")
            raise
    
    async def cleanup(self):
        """Cleanup storage connections"""
        # Cloudinary doesn't require explicit cleanup
        logger.info("✅ Storage connections cleaned up")
    
    async def test_connection(self):
        """Test Cloudinary connection"""
        try:
            if not self.initialized:
                return False
            
            # Test connection by getting account info
            result = cloudinary.api.ping()
            return result.get("status") == "ok"
            
        except Exception as e:
            logger.error(f"Cloudinary connection test failed: {e}")
            return False
    
    async def health_check(self):
        """Health check for storage service"""
        return await self.test_connection()
    
    def _get_file_hash(self, file_content: bytes) -> str:
        """Generate SHA-256 hash of file content"""
        return hashlib.sha256(file_content).hexdigest()
    
    def _get_file_type(self, filename: str) -> str:
        """Get file type based on extension"""
        mime_type, _ = mimetypes.guess_type(filename)
        if mime_type:
            return mime_type
        return "application/octet-stream"
    
    async def upload_document(self, file_content: bytes, filename: str, user_id: str, 
                            folder: str = "documents") -> Dict[str, Any]:
        """Upload document to Cloudinary"""
        try:
            if not self.initialized:
                raise ValueError("Storage service not initialized")
            
            # Generate unique folder path
            folder_path = f"buffrsign/{folder}/{user_id}"
            
            # Upload to Cloudinary
            upload_result = cloudinary.uploader.upload(
                file_content,
                folder=folder_path,
                resource_type="auto",
                public_id=filename,
                overwrite=True,
                resource_type="raw"  # For documents
            )
            
            # Generate file hash for integrity verification
            file_hash = self._get_file_hash(file_content)
            
            return {
                "file_url": upload_result["secure_url"],
                "public_id": upload_result["public_id"],
                "file_hash": file_hash,
                "file_size": len(file_content),
                "file_type": self._get_file_type(filename),
                "uploaded_at": datetime.now(timezone.utc).isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error uploading document: {e}")
            raise
    
    async def upload_signature(self, signature_data: str, user_id: str) -> Dict[str, Any]:
        """Upload signature image to Cloudinary"""
        try:
            if not self.initialized:
                raise ValueError("Storage service not initialized")
            
            # Generate unique filename
            timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
            filename = f"signature_{user_id}_{timestamp}"
            
            # Upload to Cloudinary
            upload_result = cloudinary.uploader.upload(
                f"data:image/png;base64,{signature_data}",
                folder=f"buffrsign/signatures/{user_id}",
                public_id=filename,
                resource_type="image",
                format="png"
            )
            
            return {
                "signature_url": upload_result["secure_url"],
                "public_id": upload_result["public_id"],
                "uploaded_at": datetime.now(timezone.utc).isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error uploading signature: {e}")
            raise
    
    async def upload_template(self, template_content: str, filename: str, user_id: str) -> Dict[str, Any]:
        """Upload template to Cloudinary"""
        try:
            if not self.initialized:
                raise ValueError("Storage service not initialized")
            
            # Convert template content to bytes
            content_bytes = template_content.encode('utf-8')
            
            # Upload to Cloudinary
            upload_result = cloudinary.uploader.upload(
                content_bytes,
                folder=f"buffrsign/templates/{user_id}",
                public_id=filename,
                resource_type="raw"
            )
            
            return {
                "template_url": upload_result["secure_url"],
                "public_id": upload_result["public_id"],
                "file_size": len(content_bytes),
                "uploaded_at": datetime.now(timezone.utc).isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error uploading template: {e}")
            raise
    
    async def download_file(self, public_id: str) -> Optional[bytes]:
        """Download file from Cloudinary"""
        try:
            if not self.initialized:
                raise ValueError("Storage service not initialized")
            
            # Get file URL
            url = cloudinary.utils.cloudinary_url(public_id)[0]
            
            # Download file content
            import httpx
            async with httpx.AsyncClient() as client:
                response = await client.get(url)
                if response.status_code == 200:
                    return response.content
                else:
                    logger.error(f"Failed to download file: {response.status_code}")
                    return None
                    
        except Exception as e:
            logger.error(f"Error downloading file: {e}")
            return None
    
    async def delete_file(self, public_id: str) -> bool:
        """Delete file from Cloudinary"""
        try:
            if not self.initialized:
                raise ValueError("Storage service not initialized")
            
            result = cloudinary.uploader.destroy(public_id)
            return result.get("result") == "ok"
            
        except Exception as e:
            logger.error(f"Error deleting file: {e}")
            return False
    
    async def get_file_info(self, public_id: str) -> Optional[Dict[str, Any]]:
        """Get file information from Cloudinary"""
        try:
            if not self.initialized:
                raise ValueError("Storage service not initialized")
            
            result = cloudinary.api.resource(public_id)
            
            return {
                "public_id": result["public_id"],
                "url": result["secure_url"],
                "file_size": result.get("bytes"),
                "format": result.get("format"),
                "created_at": result.get("created_at"),
                "width": result.get("width"),
                "height": result.get("height")
            }
            
        except Exception as e:
            logger.error(f"Error getting file info: {e}")
            return None
    
    async def list_user_files(self, user_id: str, folder: str = "documents", 
                            max_results: int = 100) -> list:
        """List files for a user"""
        try:
            if not self.initialized:
                raise ValueError("Storage service not initialized")
            
            folder_path = f"buffrsign/{folder}/{user_id}"
            
            result = cloudinary.api.resources(
                type="upload",
                prefix=folder_path,
                max_results=max_results
            )
            
            files = []
            for resource in result.get("resources", []):
                files.append({
                    "public_id": resource["public_id"],
                    "url": resource["secure_url"],
                    "file_size": resource.get("bytes"),
                    "format": resource.get("format"),
                    "created_at": resource.get("created_at")
                })
            
            return files
            
        except Exception as e:
            logger.error(f"Error listing user files: {e}")
            return []
    
    async def create_signed_url(self, public_id: str, expiration: int = 3600) -> Optional[str]:
        """Create signed URL for secure file access"""
        try:
            if not self.initialized:
                raise ValueError("Storage service not initialized")
            
            # Generate signed URL
            signed_url = cloudinary.utils.cloudinary_url(
                public_id,
                sign_url=True,
                type="upload",
                expires_at=int(datetime.now(timezone.utc).timestamp()) + expiration
            )[0]
            
            return signed_url
            
        except Exception as e:
            logger.error(f"Error creating signed URL: {e}")
            return None
    
    async def verify_file_integrity(self, public_id: str, expected_hash: str) -> bool:
        """Verify file integrity using hash"""
        try:
            if not self.initialized:
                raise ValueError("Storage service not initialized")
            
            # Download file
            file_content = await self.download_file(public_id)
            if not file_content:
                return False
            
            # Calculate hash
            actual_hash = self._get_file_hash(file_content)
            
            return actual_hash == expected_hash
            
        except Exception as e:
            logger.error(f"Error verifying file integrity: {e}")
            return False
    
    async def backup_file(self, public_id: str, backup_folder: str = "backups") -> bool:
        """Create backup of file"""
        try:
            if not self.initialized:
                raise ValueError("Storage service not initialized")
            
            # Get original file info
            file_info = await self.get_file_info(public_id)
            if not file_info:
                return False
            
            # Download original file
            file_content = await self.download_file(public_id)
            if not file_content:
                return False
            
            # Upload to backup folder
            timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
            backup_filename = f"backup_{timestamp}_{public_id.split('/')[-1]}"
            
            backup_result = cloudinary.uploader.upload(
                file_content,
                folder=f"buffrsign/{backup_folder}",
                public_id=backup_filename,
                resource_type="raw"
            )
            
            return backup_result.get("public_id") is not None
            
        except Exception as e:
            logger.error(f"Error backing up file: {e}")
            return False
    
    async def get_storage_usage(self, user_id: str) -> Dict[str, Any]:
        """Get storage usage statistics for user"""
        try:
            if not self.initialized:
                raise ValueError("Storage service not initialized")
            
            # Get all user files
            documents = await self.list_user_files(user_id, "documents")
            signatures = await self.list_user_files(user_id, "signatures")
            templates = await self.list_user_files(user_id, "templates")
            
            # Calculate total size
            total_size = 0
            file_count = 0
            
            for file_list in [documents, signatures, templates]:
                for file_info in file_list:
                    total_size += file_info.get("file_size", 0)
                    file_count += 1
            
            return {
                "total_files": file_count,
                "total_size_bytes": total_size,
                "total_size_mb": round(total_size / (1024 * 1024), 2),
                "documents_count": len(documents),
                "signatures_count": len(signatures),
                "templates_count": len(templates)
            }
            
        except Exception as e:
            logger.error(f"Error getting storage usage: {e}")
            return {
                "total_files": 0,
                "total_size_bytes": 0,
                "total_size_mb": 0,
                "documents_count": 0,
                "signatures_count": 0,
                "templates_count": 0
            }
    
    async def cleanup_expired_files(self, user_id: str, days_old: int = 30) -> int:
        """Clean up expired files"""
        try:
            if not self.initialized:
                raise ValueError("Storage service not initialized")
            
            # Get all user files
            all_files = []
            for folder in ["documents", "signatures", "templates"]:
                files = await self.list_user_files(user_id, folder)
                all_files.extend(files)
            
            # Filter expired files
            cutoff_date = datetime.now(timezone.utc).timestamp() - (days_old * 24 * 3600)
            expired_files = []
            
            for file_info in all_files:
                created_at = file_info.get("created_at")
                if created_at and created_at < cutoff_date:
                    expired_files.append(file_info["public_id"])
            
            # Delete expired files
            deleted_count = 0
            for public_id in expired_files:
                if await self.delete_file(public_id):
                    deleted_count += 1
            
            logger.info(f"Cleaned up {deleted_count} expired files for user {user_id}")
            return deleted_count
            
        except Exception as e:
            logger.error(f"Error cleaning up expired files: {e}")
            return 0

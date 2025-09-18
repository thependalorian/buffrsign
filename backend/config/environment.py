"""
Environment Configuration for BuffrSign Audit Trail System

This module provides comprehensive environment configuration for:
- Database connections
- Domain settings
- AI services
- Audit trail settings
- KYC services
- SME knowledge base settings
"""

from pydantic import BaseSettings, Field
from typing import List, Optional
import os


class DomainConfig(BaseSettings):
    """Domain configuration for BuffrSign"""
    PRIMARY_DOMAIN: str = "buffr.ai"
    SIGNING_DOMAIN: str = "sign.buffr.ai"
    API_DOMAIN: str = "api.sign.buffr.ai"
    
    # Email templates
    SIGNING_INVITATION_TEMPLATE: str = f"https://{SIGNING_DOMAIN}/sign/{{signature_id}}"
    VERIFICATION_LINK_TEMPLATE: str = f"https://{API_DOMAIN}/verify/{{verification_id}}"
    
    # CORS settings
    CORS_ORIGINS: List[str] = [
        f"https://{PRIMARY_DOMAIN}",
        f"https://{SIGNING_DOMAIN}",
        f"https://{API_DOMAIN}",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ]
    
    class Config:
        env_file = ".env"


class DatabaseConfig(BaseSettings):
    """Database configuration"""
    DATABASE_URL: str = Field(..., description="PostgreSQL database URL")
    REDIS_URL: str = Field(default="redis://localhost:6379/0", description="Redis URL")
    
    # Audit trail specific database
    AUDIT_TRAIL_DB_URL: Optional[str] = Field(None, description="Separate audit trail database URL")
    AUDIT_RETENTION_DAYS: int = Field(default=3650, description="Audit trail retention in days")
    
    # Connection pool settings
    DB_POOL_SIZE: int = Field(default=10, description="Database connection pool size")
    DB_MAX_OVERFLOW: int = Field(default=20, description="Database max overflow connections")
    
    class Config:
        env_file = ".env"


class SecurityConfig(BaseSettings):
    """Security configuration"""
    JWT_SECRET: str = Field(..., description="JWT secret key")
    JWT_ALGORITHM: str = Field(default="HS256", description="JWT algorithm")
    JWT_EXPIRE_MINUTES: int = Field(default=1440, description="JWT expiration in minutes")
    
    # Password security
    BCRYPT_ROUNDS: int = Field(default=12, description="BCrypt rounds for password hashing")
    
    # Rate limiting
    RATE_LIMIT_REQUESTS: int = Field(default=100, description="Rate limit requests per minute")
    RATE_LIMIT_WINDOW: int = Field(default=60, description="Rate limit window in seconds")
    
    class Config:
        env_file = ".env"


class AIServicesConfig(BaseSettings):
    """AI services configuration"""
    OPENAI_API_KEY: str = Field(..., description="OpenAI API key")
    OPENAI_MODEL: str = Field(default="gpt-4", description="OpenAI model to use")
    
    # LlamaIndex configuration
    LLAMA_INDEX_CONFIG: dict = Field(default_factory=dict, description="LlamaIndex configuration")
    
    # AI processing settings
    AI_MAX_TOKENS: int = Field(default=4000, description="Maximum AI tokens")
    AI_TEMPERATURE: float = Field(default=0.7, description="AI temperature")
    
    class Config:
        env_file = ".env"


class FileStorageConfig(BaseSettings):
    """File storage configuration"""
    CLOUDINARY_CLOUD_NAME: str = Field(..., description="Cloudinary cloud name")
    CLOUDINARY_API_KEY: str = Field(..., description="Cloudinary API key")
    CLOUDINARY_API_SECRET: str = Field(..., description="Cloudinary API secret")
    
    # Local storage settings
    LOCAL_STORAGE_PATH: str = Field(default="/var/lib/buffrsign/storage", description="Local storage path")
    MAX_FILE_SIZE: int = Field(default=104857600, description="Maximum file size in bytes (100MB)")
    
    class Config:
        env_file = ".env"


class KYCConfig(BaseSettings):
    """KYC services configuration"""
    KYC_API_URL: str = Field(default="https://kyc-service.example.com", description="KYC service URL")
    KYC_API_KEY: str = Field(..., description="KYC service API key")
    
    # KYC verification settings
    KYC_VERIFICATION_TIMEOUT: int = Field(default=300, description="KYC verification timeout in seconds")
    KYC_AUTO_APPROVE: bool = Field(default=False, description="Auto-approve KYC for testing")
    
    # Supported countries and ID types
    SUPPORTED_COUNTRIES: List[str] = Field(default=["NA"], description="Supported country codes")
    SUPPORTED_ID_TYPES: List[str] = Field(
        default=["namibian_id", "passport", "drivers_license"], 
        description="Supported ID types"
    )
    
    class Config:
        env_file = ".env"


class SMEKnowledgeBaseConfig(BaseSettings):
    """SME Knowledge Base configuration"""
    KNOWLEDGE_BASE_STORAGE_PATH: str = Field(
        default="/var/lib/buffrsign/knowledge_bases", 
        description="SME knowledge base storage path"
    )
    MAX_SME_DOCUMENT_SIZE: int = Field(
        default=104857600, 
        description="Maximum SME document size in bytes (100MB)"
    )
    
    # Vector store settings
    VECTOR_STORE_TYPE: str = Field(default="memory", description="Vector store type (memory, pinecone, weaviate)")
    VECTOR_DIMENSION: int = Field(default=1536, description="Vector dimension for embeddings")
    
    # RAG settings
    RAG_MAX_RESULTS: int = Field(default=5, description="Maximum RAG results")
    RAG_SIMILARITY_THRESHOLD: float = Field(default=0.7, description="RAG similarity threshold")
    
    class Config:
        env_file = ".env"


class AppConfig(BaseSettings):
    """Application configuration"""
    ENVIRONMENT: str = Field(default="development", description="Application environment")
    LOG_LEVEL: str = Field(default="INFO", description="Logging level")
    
    # Application settings
    APP_HOST: str = Field(default="0.0.0.0", description="Application host")
    APP_PORT: int = Field(default=8000, description="Application port")
    DEBUG: bool = Field(default=False, description="Debug mode")
    
    # Performance settings
    WORKER_PROCESSES: int = Field(default=4, description="Number of worker processes")
    MAX_CONCURRENT_REQUESTS: int = Field(default=1000, description="Maximum concurrent requests")
    
    class Config:
        env_file = ".env"


class EmailConfig(BaseSettings):
    """Email configuration"""
    SMTP_SERVER: str = Field(default="smtp.gmail.com", description="SMTP server")
    SMTP_PORT: int = Field(default=587, description="SMTP port")
    SMTP_USERNAME: str = Field(..., description="SMTP username")
    SMTP_PASSWORD: str = Field(..., description="SMTP password")
    
    # Email settings
    EMAIL_FROM: str = Field(default="noreply@buffr.ai", description="From email address")
    EMAIL_REPLY_TO: str = Field(default="support@buffr.ai", description="Reply-to email address")
    
    class Config:
        env_file = ".env"


class ComplianceConfig(BaseSettings):
    """Compliance configuration"""
    COMPLIANCE_STANDARD: str = Field(default="ETA_2019", description="Compliance standard")
    DEFAULT_RETENTION_DAYS: int = Field(default=1825, description="Default retention period in days (5 years)")
    
    # Legal settings
    LEGAL_BASIS_DEFAULT: str = Field(default="legitimate_interest", description="Default legal basis")
    CONSENT_REQUIRED: bool = Field(default=True, description="Consent required for processing")
    
    # Audit settings
    AUDIT_LOG_LEVEL: str = Field(default="INFO", description="Audit log level")
    AUDIT_ENCRYPTION_ENABLED: bool = Field(default=True, description="Enable audit trail encryption")
    
    class Config:
        env_file = ".env"


class SupabaseConfig(BaseSettings):
    """Supabase configuration"""
    SUPABASE_URL: str = Field(..., description="Supabase project URL")
    SUPABASE_KEY: str = Field(..., description="Supabase anonymous key")
    SUPABASE_SERVICE_ROLE_KEY: str = Field(..., description="Supabase service role key")
    
    # Supabase settings
    SUPABASE_AUTH_AUTO_REFRESH: bool = Field(default=True, description="Auto refresh auth tokens")
    SUPABASE_AUTH_PERSIST_SESSION: bool = Field(default=True, description="Persist auth sessions")
    
    class Config:
        env_file = ".env"


class BuffrSignConfig(BaseSettings):
    """Main configuration class that combines all configs"""
    
    # Initialize all configuration sections
    domain: DomainConfig = DomainConfig()
    database: DatabaseConfig = DatabaseConfig()
    security: SecurityConfig = SecurityConfig()
    ai_services: AIServicesConfig = AIServicesConfig()
    file_storage: FileStorageConfig = FileStorageConfig()
    kyc: KYCConfig = KYCConfig()
    sme_knowledge_base: SMEKnowledgeBaseConfig = SMEKnowledgeBaseConfig()
    app: AppConfig = AppConfig()
    email: EmailConfig = EmailConfig()
    compliance: ComplianceConfig = ComplianceConfig()
    supabase: SupabaseConfig = SupabaseConfig()
    
    class Config:
        env_file = ".env"
        case_sensitive = False
    
    def get_database_url(self) -> str:
        """Get the appropriate database URL based on environment"""
        if self.app.ENVIRONMENT == "test":
            return self.database.DATABASE_URL.replace("/buffrsign", "/buffrsign_test")
        return self.database.DATABASE_URL
    
    def get_audit_database_url(self) -> str:
        """Get the audit trail database URL"""
        if self.database.AUDIT_TRAIL_DB_URL:
            return self.database.AUDIT_TRAIL_DB_URL
        return self.get_database_url()
    
    def is_production(self) -> bool:
        """Check if running in production"""
        return self.app.ENVIRONMENT.lower() == "production"
    
    def is_development(self) -> bool:
        """Check if running in development"""
        return self.app.ENVIRONMENT.lower() == "development"
    
    def is_testing(self) -> bool:
        """Check if running in testing"""
        return self.app.ENVIRONMENT.lower() == "test"
    
    def get_cors_origins(self) -> List[str]:
        """Get CORS origins based on environment"""
        if self.is_production():
            return [
                f"https://{self.domain.PRIMARY_DOMAIN}",
                f"https://{self.domain.SIGNING_DOMAIN}",
                f"https://{self.domain.API_DOMAIN}"
            ]
        else:
            return self.domain.CORS_ORIGINS
    
    def get_log_level(self) -> str:
        """Get appropriate log level based on environment"""
        if self.is_production():
            return "WARNING"
        elif self.app.DEBUG:
            return "DEBUG"
        else:
            return self.app.LOG_LEVEL


# Global configuration instance
config = BuffrSignConfig()


def get_config() -> BuffrSignConfig:
    """Get the global configuration instance"""
    return config


def validate_config() -> bool:
    """Validate the configuration"""
    try:
        # Check required fields
        required_fields = [
            config.database.DATABASE_URL,
            config.security.JWT_SECRET,
            config.ai_services.OPENAI_API_KEY,
            config.file_storage.CLOUDINARY_CLOUD_NAME,
            config.file_storage.CLOUDINARY_API_KEY,
            config.file_storage.CLOUDINARY_API_SECRET,
            config.kyc.KYC_API_KEY,
            config.email.SMTP_USERNAME,
            config.email.SMTP_PASSWORD,
            config.supabase.SUPABASE_URL,
            config.supabase.SUPABASE_KEY,
            config.supabase.SUPABASE_SERVICE_ROLE_KEY
        ]
        
        for field in required_fields:
            if not field:
                return False
        
        return True
        
    except Exception as e:
        print(f"Configuration validation failed: {e}")
        return False


# Environment-specific settings
def get_environment_settings() -> dict:
    """Get environment-specific settings"""
    if config.is_production():
        return {
            "debug": False,
            "reload": False,
            "workers": config.app.WORKER_PROCESSES,
            "log_level": config.get_log_level(),
            "access_log": True
        }
    elif config.is_development():
        return {
            "debug": True,
            "reload": True,
            "workers": 1,
            "log_level": config.get_log_level(),
            "access_log": True
        }
    else:  # testing
        return {
            "debug": False,
            "reload": False,
            "workers": 1,
            "log_level": "ERROR",
            "access_log": False
        }

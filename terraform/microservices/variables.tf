# BuffrSign Microservices Terraform Variables

variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "region" {
  description = "GCP Region"
  type        = string
  default     = "us-central1"
}

variable "frontend_domain" {
  description = "Frontend domain name"
  type        = string
  default     = "buffrsign.ai"
}

variable "api_domain" {
  description = "API domain name"
  type        = string
  default     = "api.buffrsign.ai"
}

variable "create_databases" {
  description = "Whether to create Cloud SQL databases"
  type        = bool
  default     = true
}

variable "create_redis" {
  description = "Whether to create Redis Memorystore"
  type        = bool
  default     = true
}

variable "db_tier" {
  description = "Cloud SQL instance tier"
  type        = string
  default     = "db-f1-micro"
}

# Database passwords
variable "auth_db_password" {
  description = "Password for auth database user"
  type        = string
  sensitive   = true
}

variable "document_db_password" {
  description = "Password for document database user"
  type        = string
  sensitive   = true
}

variable "signature_db_password" {
  description = "Password for signature database user"
  type        = string
  sensitive   = true
}

variable "email_db_password" {
  description = "Password for email database user"
  type        = string
  sensitive   = true
}

variable "ai_db_password" {
  description = "Password for AI database user"
  type        = string
  sensitive   = true
}

# Environment variables for each service
variable "api_gateway_env" {
  description = "Environment variables for API Gateway"
  type        = map(string)
  default = {
    REDIS_URL = "redis://localhost:6379"
    AUTH_SERVICE_URL = "http://localhost:8001"
    DOCUMENT_SERVICE_URL = "http://localhost:8002"
    SIGNATURE_SERVICE_URL = "http://localhost:8003"
    EMAIL_SERVICE_URL = "http://localhost:8004"
    AI_SERVICE_URL = "http://localhost:8005"
  }
}

variable "auth_service_env" {
  description = "Environment variables for Auth Service"
  type        = map(string)
  default = {
    DATABASE_URL = "postgresql://user:password@localhost/buffrsign_auth"
    REDIS_URL = "redis://localhost:6379"
    JWT_SECRET_KEY = "your-secret-key"
  }
}

variable "document_service_env" {
  description = "Environment variables for Document Service"
  type        = map(string)
  default = {
    DATABASE_URL = "postgresql://user:password@localhost/buffrsign_documents"
    AUTH_SERVICE_URL = "http://localhost:8001"
    UPLOAD_DIR = "/app/uploads"
  }
}

variable "signature_service_env" {
  description = "Environment variables for Signature Service"
  type        = map(string)
  default = {
    DATABASE_URL = "postgresql://user:password@localhost/buffrsign_signatures"
    AUTH_SERVICE_URL = "http://localhost:8001"
    DOCUMENT_SERVICE_URL = "http://localhost:8002"
    EMAIL_SERVICE_URL = "http://localhost:8004"
  }
}

variable "email_service_env" {
  description = "Environment variables for Email Service"
  type        = map(string)
  default = {
    DATABASE_URL = "postgresql://user:password@localhost/buffrsign_emails"
    AUTH_SERVICE_URL = "http://localhost:8001"
    SMTP_HOST = "smtp.gmail.com"
    SMTP_PORT = "587"
    FROM_EMAIL = "noreply@buffrsign.com"
  }
}

variable "ai_service_env" {
  description = "Environment variables for AI Service"
  type        = map(string)
  default = {
    DATABASE_URL = "postgresql://user:password@localhost/buffrsign_ai"
    AUTH_SERVICE_URL = "http://localhost:8001"
    DOCUMENT_SERVICE_URL = "http://localhost:8002"
  }
}

variable "frontend_env" {
  description = "Environment variables for Frontend"
  type        = map(string)
  default = {
    NEXT_PUBLIC_API_URL = "https://api.buffrsign.ai"
    NEXT_PUBLIC_APP_URL = "https://buffrsign.ai"
  }
}

# Common environment variables
variable "common_env" {
  description = "Common environment variables for all services"
  type        = map(string)
  default = {
    ENVIRONMENT = "production"
    LOG_LEVEL = "INFO"
    PROMETHEUS_ENABLED = "true"
  }
}
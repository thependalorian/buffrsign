# BuffrSign Starter Terraform Variables

variable "project_id" {
  description = "Google Cloud Project ID"
  type        = string
}

variable "region" {
  description = "Google Cloud region"
  type        = string
  default     = "us-central1"
}

variable "frontend_domain" {
  description = "Frontend domain name"
  type        = string
  default     = "starter.buffrsign.ai"
}

variable "api_domain" {
  description = "API domain name"
  type        = string
  default     = "api-starter.buffrsign.ai"
}

variable "backend_env" {
  description = "Environment variables for backend service"
  type        = map(string)
  default     = {}
}

variable "create_database" {
  description = "Whether to create Cloud SQL database"
  type        = bool
  default     = true
}

variable "create_redis" {
  description = "Whether to create Redis instance"
  type        = bool
  default     = true
}

variable "create_neo4j" {
  description = "Whether to create Neo4j placeholder (manual setup required)"
  type        = bool
  default     = false
}

variable "create_document_storage" {
  description = "Whether to create document storage bucket"
  type        = bool
  default     = true
}

variable "db_tier" {
  description = "Database instance tier"
  type        = string
  default     = "db-f1-micro"
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}

# Common environment variables
variable "jwt_secret_key" {
  description = "JWT secret key"
  type        = string
  sensitive   = true
}

variable "supabase_url" {
  description = "Supabase project URL"
  type        = string
  default     = ""
}

variable "supabase_anon_key" {
  description = "Supabase anonymous key"
  type        = string
  sensitive   = true
  default     = ""
}

variable "supabase_service_role_key" {
  description = "Supabase service role key"
  type        = string
  sensitive   = true
  default     = ""
}

variable "openai_api_key" {
  description = "OpenAI API key"
  type        = string
  sensitive   = true
  default     = ""
}

variable "groq_api_key" {
  description = "Groq API key"
  type        = string
  sensitive   = true
  default     = ""
}

variable "neo4j_uri" {
  description = "Neo4j AuraDB URI"
  type        = string
  sensitive   = true
  default     = ""
}

variable "neo4j_username" {
  description = "Neo4j username"
  type        = string
  sensitive   = true
  default     = ""
}

variable "neo4j_password" {
  description = "Neo4j password"
  type        = string
  sensitive   = true
  default     = ""
}

variable "twilio_account_sid" {
  description = "Twilio Account SID"
  type        = string
  sensitive   = true
  default     = ""
}

variable "twilio_auth_token" {
  description = "Twilio Auth Token"
  type        = string
  sensitive   = true
  default     = ""
}

variable "sendgrid_api_key" {
  description = "SendGrid API key"
  type        = string
  sensitive   = true
  default     = ""
}
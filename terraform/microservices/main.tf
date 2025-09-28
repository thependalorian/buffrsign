# BuffrSign Microservices Infrastructure on Google Cloud Platform
# Deploys all microservices as Cloud Run services with individual databases

terraform {
  required_version = ">= 1.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

provider "google-beta" {
  project = var.project_id
  region  = var.region
}

# Artifact Registry for Docker images
resource "google_artifact_registry_repository" "docker" {
  location      = var.region
  repository_id = "buffrsign-microservices"
  description   = "Docker repository for BuffrSign microservices"
  format        = "DOCKER"
}

# API Gateway Service
resource "google_cloud_run_v2_service" "api_gateway" {
  name     = "buffrsign-api-gateway"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    containers {
      image = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.docker.repository_id}/api-gateway:latest"
      
      ports {
        container_port = 8000
      }

      dynamic "env" {
        for_each = var.api_gateway_env
        content {
          name  = env.key
          value = env.value
        }
      }

      resources {
        limits = {
          cpu    = "2"
          memory = "4Gi"
        }
      }
    }

    scaling {
      min_instance_count = 1
      max_instance_count = 10
    }
  }

  traffic {
    percent = 100
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
  }
}

# Auth Service
resource "google_cloud_run_v2_service" "auth_service" {
  name     = "buffrsign-auth-service"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_INTERNAL_ONLY"

  template {
    containers {
      image = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.docker.repository_id}/auth-service:latest"
      
      ports {
        container_port = 8001
      }

      dynamic "env" {
        for_each = var.auth_service_env
        content {
          name  = env.key
          value = env.value
        }
      }

      resources {
        limits = {
          cpu    = "1"
          memory = "2Gi"
        }
      }
    }

    scaling {
      min_instance_count = 1
      max_instance_count = 5
    }
  }

  traffic {
    percent = 100
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
  }
}

# Document Service
resource "google_cloud_run_v2_service" "document_service" {
  name     = "buffrsign-document-service"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_INTERNAL_ONLY"

  template {
    containers {
      image = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.docker.repository_id}/document-service:latest"
      
      ports {
        container_port = 8002
      }

      dynamic "env" {
        for_each = var.document_service_env
        content {
          name  = env.key
          value = env.value
        }
      }

      resources {
        limits = {
          cpu    = "2"
          memory = "4Gi"
        }
      }
    }

    scaling {
      min_instance_count = 1
      max_instance_count = 10
    }
  }

  traffic {
    percent = 100
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
  }
}

# Signature Service
resource "google_cloud_run_v2_service" "signature_service" {
  name     = "buffrsign-signature-service"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_INTERNAL_ONLY"

  template {
    containers {
      image = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.docker.repository_id}/signature-service:latest"
      
      ports {
        container_port = 8003
      }

      dynamic "env" {
        for_each = var.signature_service_env
        content {
          name  = env.key
          value = env.value
        }
      }

      resources {
        limits = {
          cpu    = "2"
          memory = "4Gi"
        }
      }
    }

    scaling {
      min_instance_count = 1
      max_instance_count = 8
    }
  }

  traffic {
    percent = 100
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
  }
}

# Email Service
resource "google_cloud_run_v2_service" "email_service" {
  name     = "buffrsign-email-service"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_INTERNAL_ONLY"

  template {
    containers {
      image = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.docker.repository_id}/email-service:latest"
      
      ports {
        container_port = 8004
      }

      dynamic "env" {
        for_each = var.email_service_env
        content {
          name  = env.key
          value = env.value
        }
      }

      resources {
        limits = {
          cpu    = "1"
          memory = "2Gi"
        }
      }
    }

    scaling {
      min_instance_count = 1
      max_instance_count = 5
    }
  }

  traffic {
    percent = 100
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
  }
}

# AI Service
resource "google_cloud_run_v2_service" "ai_service" {
  name     = "buffrsign-ai-service"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_INTERNAL_ONLY"

  template {
    containers {
      image = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.docker.repository_id}/ai-service:latest"
      
      ports {
        container_port = 8005
      }

      dynamic "env" {
        for_each = var.ai_service_env
        content {
          name  = env.key
          value = env.value
        }
      }

      resources {
        limits = {
          cpu    = "4"
          memory = "8Gi"
        }
      }
    }

    scaling {
      min_instance_count = 0
      max_instance_count = 5
    }
  }

  traffic {
    percent = 100
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
  }
}

# Frontend Service
resource "google_cloud_run_v2_service" "frontend" {
  name     = "buffrsign-frontend"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    containers {
      image = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.docker.repository_id}/frontend:latest"
      
      ports {
        container_port = 3000
      }

      dynamic "env" {
        for_each = var.frontend_env
        content {
          name  = env.key
          value = env.value
        }
      }

      resources {
        limits = {
          cpu    = "1"
          memory = "2Gi"
        }
      }
    }

    scaling {
      min_instance_count = 1
      max_instance_count = 10
    }
  }

  traffic {
    percent = 100
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
  }
}

# IAM Policy for public access to API Gateway and Frontend
resource "google_cloud_run_service_iam_policy" "api_gateway_public" {
  location = google_cloud_run_v2_service.api_gateway.location
  service  = google_cloud_run_v2_service.api_gateway.name

  policy {
    bindings {
      role = "roles/run.invoker"
      members = [
        "allUsers",
      ]
    }
  }
}

resource "google_cloud_run_service_iam_policy" "frontend_public" {
  location = google_cloud_run_v2_service.frontend.location
  service  = google_cloud_run_v2_service.frontend.name

  policy {
    bindings {
      role = "roles/run.invoker"
      members = [
        "allUsers",
      ]
    }
  }
}

# Cloud Storage for document storage
resource "google_storage_bucket" "documents" {
  name          = "${var.project_id}-buffrsign-documents"
  location      = var.region
  force_destroy = false

  uniform_bucket_level_access = true

  cors {
    origin          = ["*"]
    method          = ["GET", "HEAD", "PUT", "POST", "DELETE"]
    response_header = ["*"]
    max_age_seconds = 3600
  }
}

# IAM for document storage
resource "google_storage_bucket_iam_member" "documents_public_read" {
  bucket = google_storage_bucket.documents.name
  role   = "roles/storage.objectViewer"
  member = "allUsers"
}

# SSL Certificate
resource "google_compute_managed_ssl_certificate" "buffrsign_ssl" {
  name = "buffrsign-ssl-cert"

  managed {
    domains = [var.frontend_domain, var.api_domain]
  }
}

# Backend bucket for frontend
resource "google_compute_backend_bucket" "frontend_backend" {
  name        = "buffrsign-frontend-backend"
  bucket_name = google_storage_bucket.documents.name
  enable_cdn  = true
}

# URL Map
resource "google_compute_url_map" "buffrsign_url_map" {
  name            = "buffrsign-url-map"
  default_service = google_compute_backend_bucket.frontend_backend.id

  host_rule {
    hosts        = [var.api_domain]
    path_matcher = "api"
  }

  path_matcher {
    name            = "api"
    default_service = google_cloud_run_v2_service.api_gateway.id
  }
}

# Target HTTPS Proxy
resource "google_compute_target_https_proxy" "buffrsign_https_proxy" {
  name             = "buffrsign-https-proxy"
  url_map          = google_compute_url_map.buffrsign_url_map.id
  ssl_certificates = [google_compute_managed_ssl_certificate.buffrsign_ssl.id]
}

# Global Forwarding Rule
resource "google_compute_global_forwarding_rule" "buffrsign_https_forwarding_rule" {
  name       = "buffrsign-https-forwarding-rule"
  target     = google_compute_target_https_proxy.buffrsign_https_proxy.id
  port_range = "443"
  ip_address = google_compute_global_address.buffrsign_ip.address
}

# Global IP Address
resource "google_compute_global_address" "buffrsign_ip" {
  name = "buffrsign-ip"
}

# Domain mapping for API Gateway
resource "google_cloud_run_domain_mapping" "api_domain" {
  location = var.region
  name     = var.api_domain

  metadata {
    namespace = var.project_id
  }

  spec {
    route_name = google_cloud_run_v2_service.api_gateway.name
  }
}

# Domain mapping for Frontend
resource "google_cloud_run_domain_mapping" "frontend_domain" {
  location = var.region
  name     = var.frontend_domain

  metadata {
    namespace = var.project_id
  }

  spec {
    route_name = google_cloud_run_v2_service.frontend.name
  }
}

# Auth Database
resource "google_sql_database_instance" "auth_db" {
  count   = var.create_databases ? 1 : 0
  name    = "buffrsign-auth-db"
  region  = var.region
  database_version = "POSTGRES_15"

  settings {
    tier = var.db_tier
    disk_size = 20
    disk_type = "PD_SSD"
    
    backup_configuration {
      enabled = true
      start_time = "03:00"
    }
    
    ip_configuration {
      ipv4_enabled = true
      authorized_networks {
        name  = "all"
        value = "0.0.0.0/0"
      }
    }
  }

  deletion_protection = false
}

resource "google_sql_database" "auth_database" {
  count   = var.create_databases ? 1 : 0
  name    = "buffrsign_auth"
  instance = google_sql_database_instance.auth_db[0].name
}

resource "google_sql_user" "auth_user" {
  count   = var.create_databases ? 1 : 0
  name     = "buffrsign_auth_user"
  instance = google_sql_database_instance.auth_db[0].name
  password = var.auth_db_password
}

# Document Database
resource "google_sql_database_instance" "document_db" {
  count   = var.create_databases ? 1 : 0
  name    = "buffrsign-document-db"
  region  = var.region
  database_version = "POSTGRES_15"

  settings {
    tier = var.db_tier
    disk_size = 20
    disk_type = "PD_SSD"
    
    backup_configuration {
      enabled = true
      start_time = "03:00"
    }
    
    ip_configuration {
      ipv4_enabled = true
      authorized_networks {
        name  = "all"
        value = "0.0.0.0/0"
      }
    }
  }

  deletion_protection = false
}

resource "google_sql_database" "document_database" {
  count   = var.create_databases ? 1 : 0
  name    = "buffrsign_documents"
  instance = google_sql_database_instance.document_db[0].name
}

resource "google_sql_user" "document_user" {
  count   = var.create_databases ? 1 : 0
  name     = "buffrsign_document_user"
  instance = google_sql_database_instance.document_db[0].name
  password = var.document_db_password
}

# Signature Database
resource "google_sql_database_instance" "signature_db" {
  count   = var.create_databases ? 1 : 0
  name    = "buffrsign-signature-db"
  region  = var.region
  database_version = "POSTGRES_15"

  settings {
    tier = var.db_tier
    disk_size = 20
    disk_type = "PD_SSD"
    
    backup_configuration {
      enabled = true
      start_time = "03:00"
    }
    
    ip_configuration {
      ipv4_enabled = true
      authorized_networks {
        name  = "all"
        value = "0.0.0.0/0"
      }
    }
  }

  deletion_protection = false
}

resource "google_sql_database" "signature_database" {
  count   = var.create_databases ? 1 : 0
  name    = "buffrsign_signatures"
  instance = google_sql_database_instance.signature_db[0].name
}

resource "google_sql_user" "signature_user" {
  count   = var.create_databases ? 1 : 0
  name     = "buffrsign_signature_user"
  instance = google_sql_database_instance.signature_db[0].name
  password = var.signature_db_password
}

# Email Database
resource "google_sql_database_instance" "email_db" {
  count   = var.create_databases ? 1 : 0
  name    = "buffrsign-email-db"
  region  = var.region
  database_version = "POSTGRES_15"

  settings {
    tier = var.db_tier
    disk_size = 20
    disk_type = "PD_SSD"
    
    backup_configuration {
      enabled = true
      start_time = "03:00"
    }
    
    ip_configuration {
      ipv4_enabled = true
      authorized_networks {
        name  = "all"
        value = "0.0.0.0/0"
      }
    }
  }

  deletion_protection = false
}

resource "google_sql_database" "email_database" {
  count   = var.create_databases ? 1 : 0
  name    = "buffrsign_emails"
  instance = google_sql_database_instance.email_db[0].name
}

resource "google_sql_user" "email_user" {
  count   = var.create_databases ? 1 : 0
  name     = "buffrsign_email_user"
  instance = google_sql_database_instance.email_db[0].name
  password = var.email_db_password
}

# AI Database
resource "google_sql_database_instance" "ai_db" {
  count   = var.create_databases ? 1 : 0
  name    = "buffrsign-ai-db"
  region  = var.region
  database_version = "POSTGRES_15"

  settings {
    tier = var.db_tier
    disk_size = 20
    disk_type = "PD_SSD"
    
    backup_configuration {
      enabled = true
      start_time = "03:00"
    }
    
    ip_configuration {
      ipv4_enabled = true
      authorized_networks {
        name  = "all"
        value = "0.0.0.0/0"
      }
    }
  }

  deletion_protection = false
}

resource "google_sql_database" "ai_database" {
  count   = var.create_databases ? 1 : 0
  name    = "buffrsign_ai"
  instance = google_sql_database_instance.ai_db[0].name
}

resource "google_sql_user" "ai_user" {
  count   = var.create_databases ? 1 : 0
  name     = "buffrsign_ai_user"
  instance = google_sql_database_instance.ai_db[0].name
  password = var.ai_db_password
}

# Redis Memorystore for caching and session management
resource "google_redis_instance" "buffrsign_redis" {
  count          = var.create_redis ? 1 : 0
  name           = "buffrsign-redis"
  tier           = "STANDARD_HA"
  memory_size_gb = 1
  region         = var.region

  redis_version     = "REDIS_6_X"
  display_name      = "BuffrSign Redis Cache"
  reserved_ip_range = "10.0.0.0/29"
}

# Pub/Sub topics for event-driven communication
resource "google_pubsub_topic" "document_events" {
  name = "buffrsign-document-events"
}

resource "google_pubsub_topic" "signature_events" {
  name = "buffrsign-signature-events"
}

resource "google_pubsub_topic" "email_events" {
  name = "buffrsign-email-events"
}

resource "google_pubsub_topic" "ai_events" {
  name = "buffrsign-ai-events"
}
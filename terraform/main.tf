# BuffrSign Starter Terraform Infrastructure
# Google Cloud Platform deployment with Cloud Run

terraform {
  required_version = ">= 1.7"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.21"
    }
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 5.21"
    }
  }
}

# Configure the Google Cloud Provider
provider "google" {
  project = var.project_id
  region  = var.region
}

provider "google-beta" {
  project = var.project_id
  region  = var.region
}

################  Artifact Registry  ################
resource "google_artifact_registry_repository" "docker" {
  location      = var.region
  repository_id = "buffrsign-starter-docker"
  format        = "DOCKER"
}

################  Cloud Run Backend Service #####
resource "google_cloud_run_v2_service" "backend" {
  name     = "buffrsign-starter-backend"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    containers {
      image = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.docker.repository_id}/buffrsign-starter-backend:latest"
      ports {
        container_port = 8002
      }
      dynamic "env" {
        for_each = var.backend_env
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
      min_instance_count = 1
      max_instance_count = 20
    }
  }
  traffic {
    percent = 100
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
  }
}

# Make Cloud Run publicly accessible
resource "google_cloud_run_v2_service_iam_policy" "public_access" {
  name     = google_cloud_run_v2_service.backend.name
  location = var.region
  
  policy_data = jsonencode({
    bindings = [
      {
        role = "roles/run.invoker"
        members = ["allUsers"]
      }
    ]
  })
}

################  Static-site bucket + HTTPS LB  ####
resource "google_storage_bucket" "frontend" {
  name                        = var.frontend_domain
  location                    = "US"
  uniform_bucket_level_access = true
  
  public_access_prevention = "inherited"
  
  website {
    main_page_suffix = "index.html"
    not_found_page   = "index.html"
  }
}

# Add public access
resource "google_storage_bucket_iam_member" "public_access" {
  bucket = google_storage_bucket.frontend.name
  role   = "roles/storage.objectViewer"
  member = "allUsers"
}

# Get project data for service account
data "google_project" "project" {}

# Give load balancer service account access to bucket
resource "google_storage_bucket_iam_member" "backend_bucket_access" {
  bucket = google_storage_bucket.frontend.name
  role   = "roles/storage.objectViewer"
  member = "serviceAccount:service-${data.google_project.project.number}@compute-system.iam.gserviceaccount.com"
}

resource "google_storage_bucket_iam_member" "backend_bucket_legacy" {
  bucket = google_storage_bucket.frontend.name
  role   = "roles/storage.legacyBucketReader"
  member = "serviceAccount:service-${data.google_project.project.number}@compute-system.iam.gserviceaccount.com"
}

resource "google_compute_managed_ssl_certificate" "frontend_ssl" {
  name    = "buffrsign-starter-frontend-ssl"
  managed { domains = [var.frontend_domain] }
}

# Backend bucket with CDN
resource "google_compute_backend_bucket" "frontend" {
  name        = "buffrsign-starter-frontend-backend-bucket"
  bucket_name = google_storage_bucket.frontend.name
  enable_cdn  = true
  
  cdn_policy {
    cache_mode        = "CACHE_ALL_STATIC"
    default_ttl       = 3600
    max_ttl           = 86400
    client_ttl        = 3600
    negative_caching  = true
  }
}

# URL map
resource "google_compute_url_map" "frontend" {
  name            = "buffrsign-starter-frontend-lb"
  default_service = google_compute_backend_bucket.frontend.self_link
}

# HTTPS proxy
resource "google_compute_target_https_proxy" "frontend" {
  name             = "buffrsign-starter-frontend-https-proxy"
  url_map          = google_compute_url_map.frontend.self_link
  ssl_certificates = [google_compute_managed_ssl_certificate.frontend_ssl.self_link]
}

# Global forwarding rule
resource "google_compute_global_forwarding_rule" "frontend" {
  name       = "buffrsign-starter-frontend-lb-forwarding-rule"
  target     = google_compute_target_https_proxy.frontend.self_link
  port_range = "443"
}

# HTTP to HTTPS redirect
resource "google_compute_url_map" "https_redirect" {
  name = "buffrsign-starter-frontend-https-redirect"
  default_url_redirect {
    https_redirect = true
    strip_query    = false
  }
}

resource "google_compute_target_http_proxy" "https_redirect" {
  name    = "buffrsign-starter-frontend-http-proxy"
  url_map = google_compute_url_map.https_redirect.self_link
}

resource "google_compute_global_forwarding_rule" "https_redirect" {
  name       = "buffrsign-starter-frontend-http-forwarding-rule"
  target     = google_compute_target_http_proxy.https_redirect.self_link
  port_range = "80"
}

################  Domain mapping (API)  ##############
resource "google_cloud_run_domain_mapping" "api_domain" {
  name     = var.api_domain
  location = var.region
  metadata { namespace = var.project_id }
  spec     { route_name = google_cloud_run_v2_service.backend.name }
}

################  Cloud SQL Database  ##############
resource "google_sql_database_instance" "main" {
  count            = var.create_database ? 1 : 0
  name             = "buffrsign-starter-db"
  database_version = "POSTGRES_15"
  region           = var.region

  settings {
    tier = var.db_tier
    
    backup_configuration {
      enabled                        = true
      start_time                     = "03:00"
      point_in_time_recovery_enabled = true
    }
    
    ip_configuration {
      ipv4_enabled = true
      authorized_networks {
        name  = "all"
        value = "0.0.0.0/0"
      }
    }
  }
}

resource "google_sql_database" "database" {
  count     = var.create_database ? 1 : 0
  name      = "buffrsign_starter"
  instance  = google_sql_database_instance.main[0].name
}

resource "google_sql_user" "users" {
  count    = var.create_database ? 1 : 0
  name     = "buffrsign_user"
  instance = google_sql_database_instance.main[0].name
  password = var.db_password
}

################  Redis Memorystore  ##############
resource "google_redis_instance" "cache" {
  count          = var.create_redis ? 1 : 0
  name           = "buffrsign-starter-redis"
  tier           = "STANDARD_HA"
  memory_size_gb = 2
  region         = var.region
}

################  Neo4j AuraDB  ##############
# Note: Neo4j AuraDB is a managed service that needs to be created manually
# This is a placeholder for documentation
resource "google_compute_instance" "neo4j_placeholder" {
  count        = var.create_neo4j ? 1 : 0
  name         = "neo4j-placeholder"
  machine_type = "e2-medium"
  zone         = "${var.region}-a"

  boot_disk {
    initialize_params {
      image = "ubuntu-os-cloud/ubuntu-2004-lts"
    }
  }

  network_interface {
    network = "default"
    access_config {
      // Ephemeral public IP
    }
  }

  metadata = {
    startup-script = "echo 'Neo4j AuraDB should be created manually in Neo4j Console'"
  }
}

################  Cloud Storage for Documents  ##############
resource "google_storage_bucket" "documents" {
  count         = var.create_document_storage ? 1 : 0
  name          = "${var.project_id}-buffrsign-documents"
  location      = var.region
  force_destroy = false

  uniform_bucket_level_access = true

  lifecycle_rule {
    condition {
      age = 365
    }
    action {
      type = "Delete"
    }
  }

  cors {
    origin          = ["*"]
    method          = ["GET", "HEAD", "PUT", "POST", "DELETE"]
    response_header = ["*"]
    max_age_seconds = 3600
  }
}

################  Outputs  ###########################
output "backend_url" { 
  value = "https://${var.api_domain}" 
}

output "frontend_url" { 
  value = "https://${var.frontend_domain}" 
}

output "database_connection_string" {
  value       = var.create_database ? "postgresql://${google_sql_user.users[0].name}:${var.db_password}@${google_sql_database_instance.main[0].private_ip_address}:5432/${google_sql_database.database[0].name}" : null
  sensitive   = true
}

output "redis_host" {
  value = var.create_redis ? google_redis_instance.cache[0].host : null
}

output "document_storage_bucket" {
  value = var.create_document_storage ? google_storage_bucket.documents[0].name : null
}

output "artifact_registry_url" {
  value = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.docker.repository_id}"
}
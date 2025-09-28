# BuffrSign Microservices Terraform Outputs

output "api_gateway_url" {
  description = "API Gateway service URL"
  value       = google_cloud_run_v2_service.api_gateway.uri
}

output "frontend_url" {
  description = "Frontend service URL"
  value       = google_cloud_run_v2_service.frontend.uri
}

output "auth_service_url" {
  description = "Auth service URL"
  value       = google_cloud_run_v2_service.auth_service.uri
}

output "document_service_url" {
  description = "Document service URL"
  value       = google_cloud_run_v2_service.document_service.uri
}

output "signature_service_url" {
  description = "Signature service URL"
  value       = google_cloud_run_v2_service.signature_service.uri
}

output "email_service_url" {
  description = "Email service URL"
  value       = google_cloud_run_v2_service.email_service.uri
}

output "ai_service_url" {
  description = "AI service URL"
  value       = google_cloud_run_v2_service.ai_service.uri
}

output "artifact_registry_url" {
  description = "Artifact Registry URL"
  value       = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.docker.repository_id}"
}

output "load_balancer_ip" {
  description = "Load balancer IP address"
  value       = google_compute_global_address.buffrsign_ip.address
}

output "ssl_certificate_name" {
  description = "SSL certificate name"
  value       = google_compute_managed_ssl_certificate.buffrsign_ssl.name
}

output "storage_bucket_name" {
  description = "Document storage bucket name"
  value       = google_storage_bucket.documents.name
}

output "redis_host" {
  description = "Redis host"
  value       = var.create_redis ? google_redis_instance.buffrsign_redis[0].host : null
}

output "redis_port" {
  description = "Redis port"
  value       = var.create_redis ? google_redis_instance.buffrsign_redis[0].port : null
}

# Database connection strings
output "auth_database_connection_string" {
  description = "Auth database connection string"
  value       = var.create_databases ? "postgresql://${google_sql_user.auth_user[0].name}:${var.auth_db_password}@${google_sql_database_instance.auth_db[0].private_ip_address}:5432/${google_sql_database.auth_database[0].name}" : null
  sensitive   = true
}

output "document_database_connection_string" {
  description = "Document database connection string"
  value       = var.create_databases ? "postgresql://${google_sql_user.document_user[0].name}:${var.document_db_password}@${google_sql_database_instance.document_db[0].private_ip_address}:5432/${google_sql_database.document_database[0].name}" : null
  sensitive   = true
}

output "signature_database_connection_string" {
  description = "Signature database connection string"
  value       = var.create_databases ? "postgresql://${google_sql_user.signature_user[0].name}:${var.signature_db_password}@${google_sql_database_instance.signature_db[0].private_ip_address}:5432/${google_sql_database.signature_database[0].name}" : null
  sensitive   = true
}

output "email_database_connection_string" {
  description = "Email database connection string"
  value       = var.create_databases ? "postgresql://${google_sql_user.email_user[0].name}:${var.email_db_password}@${google_sql_database_instance.email_db[0].private_ip_address}:5432/${google_sql_database.email_database[0].name}" : null
  sensitive   = true
}

output "ai_database_connection_string" {
  description = "AI database connection string"
  value       = var.create_databases ? "postgresql://${google_sql_user.ai_user[0].name}:${var.ai_db_password}@${google_sql_database_instance.ai_db[0].private_ip_address}:5432/${google_sql_database.ai_database[0].name}" : null
  sensitive   = true
}

# Pub/Sub topics
output "document_events_topic" {
  description = "Document events Pub/Sub topic"
  value       = google_pubsub_topic.document_events.name
}

output "signature_events_topic" {
  description = "Signature events Pub/Sub topic"
  value       = google_pubsub_topic.signature_events.name
}

output "email_events_topic" {
  description = "Email events Pub/Sub topic"
  value       = google_pubsub_topic.email_events.name
}

output "ai_events_topic" {
  description = "AI events Pub/Sub topic"
  value       = google_pubsub_topic.ai_events.name
}

# Service names for reference
output "cloud_run_services" {
  description = "All Cloud Run service names"
  value = {
    api_gateway = google_cloud_run_v2_service.api_gateway.name
    frontend = google_cloud_run_v2_service.frontend.name
    auth_service = google_cloud_run_v2_service.auth_service.name
    document_service = google_cloud_run_v2_service.document_service.name
    signature_service = google_cloud_run_v2_service.signature_service.name
    email_service = google_cloud_run_v2_service.email_service.name
    ai_service = google_cloud_run_v2_service.ai_service.name
  }
}
# BuffrSign Starter Terraform Outputs

output "backend_url" {
  description = "Backend API URL"
  value       = "https://${var.api_domain}"
}

output "frontend_url" {
  description = "Frontend URL"
  value       = "https://${var.frontend_domain}"
}

output "database_connection_string" {
  description = "Database connection string"
  value       = var.create_database ? "postgresql://${google_sql_user.users[0].name}:${var.db_password}@${google_sql_database_instance.main[0].private_ip_address}:5432/${google_sql_database.database[0].name}" : null
  sensitive   = true
}

output "redis_host" {
  description = "Redis host"
  value       = var.create_redis ? google_redis_instance.cache[0].host : null
}

output "redis_port" {
  description = "Redis port"
  value       = var.create_redis ? google_redis_instance.cache[0].port : null
}

output "document_storage_bucket" {
  description = "Document storage bucket name"
  value       = var.create_document_storage ? google_storage_bucket.documents[0].name : null
}

output "artifact_registry_url" {
  description = "Artifact Registry URL for Docker images"
  value       = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.docker.repository_id}"
}

output "cloud_run_service_name" {
  description = "Cloud Run service name"
  value       = google_cloud_run_v2_service.backend.name
}

output "cloud_run_service_url" {
  description = "Cloud Run service URL"
  value       = google_cloud_run_v2_service.backend.uri
}

output "storage_bucket_name" {
  description = "Frontend storage bucket name"
  value       = google_storage_bucket.frontend.name
}

output "ssl_certificate_name" {
  description = "SSL certificate name"
  value       = google_compute_managed_ssl_certificate.frontend_ssl.name
}

output "load_balancer_ip" {
  description = "Load balancer IP address"
  value       = google_compute_global_forwarding_rule.frontend.ip_address
}
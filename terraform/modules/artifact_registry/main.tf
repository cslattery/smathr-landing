resource "google_artifact_registry_repository" "default" {
  project       = var.project_id
  location      = var.region
  repository_id = var.repository_id
  description   = "Docker images for ${var.environment}"
  format        = "DOCKER"

  docker_config {
    immutable_tags = false
  }
}
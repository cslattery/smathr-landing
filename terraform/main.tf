# =============================================================================
# Smathr Landing - Terraform Configuration (dev environment)
# =============================================================================

# Artifact Registry repository for container images
module "artifact_registry" {
  source = "./modules/artifact_registry"

  project_id    = var.project_id
  region        = var.region
  repository_id = var.artifact_registry_repository
  environment   = var.environment
}

# Cloud Run service
module "cloud_run" {
  source = "./modules/cloud_run"

  project_id            = var.project_id
  region                = var.region
  service_name          = var.service_name
  environment           = var.environment
  service_account_email = google_service_account.cloud_run.email

  # Image is passed from CI/CD (via deploy.tfvars). Falls back to :latest for local use.
  image = var.image != "" ? var.image : "${var.region}-docker.pkg.dev/${var.project_id}/${var.artifact_registry_repository}/${var.service_name}:latest"

  depends_on = [module.artifact_registry]
}

# =============================================================================
# Global Application Load Balancer
# =============================================================================
# Currently commented out.
#
# Reason: We moved the Cloud Run service to europe-west1 (which supports
# native custom domain mapping). This avoids the cost of a Global LB.
#
# If we ever need subdomains (e.g. csv-explorer.smathr.com) or want to use
# Cloud CDN / WAF, we can uncomment this module and switch back to using
# a Load Balancer.
#
# module "load_balancer" {
#   source = "./modules/load_balancer"
#
#   project_id   = var.project_id
#   region       = var.region
#   service_name = var.service_name
#   environment  = var.environment
#
#   cloud_run_service_name = module.cloud_run.service_name
#   domain_names           = var.domain_names
#
#   depends_on = [module.cloud_run]
# }
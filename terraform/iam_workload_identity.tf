# =============================================================================
# GitHub Actions OIDC (Workload Identity Federation)
# =============================================================================

# Workload Identity Pool for GitHub Actions
resource "google_iam_workload_identity_pool" "github" {
  workload_identity_pool_id = "github"
  display_name              = "GitHub Actions"
  description               = "Identity pool for GitHub Actions CI/CD"
  project                   = var.project_id
}

# Workload Identity Pool Provider for GitHub
resource "google_iam_workload_identity_pool_provider" "github" {
  workload_identity_pool_id          = google_iam_workload_identity_pool.github.workload_identity_pool_id
  workload_identity_pool_provider_id = "github"
  display_name                       = "GitHub OIDC Provider"
  description                        = "OIDC provider for GitHub Actions"

  project = var.project_id

  attribute_mapping = {
    "google.subject"       = "assertion.sub"
    "attribute.actor"      = "assertion.actor"
    "attribute.repository" = "assertion.repository"
    "attribute.ref"        = "assertion.ref"
  }

  # Restrict to the specific repository on main branch
  attribute_condition = "assertion.repository == \"${var.github_repository}\" && assertion.ref == \"refs/heads/main\""

  oidc {
    issuer_uri = "https://token.actions.githubusercontent.com"
  }
}

# Service Account that GitHub Actions will impersonate
resource "google_service_account" "github_actions" {
  account_id   = "github-actions"
  display_name = "GitHub Actions Deployer"
  description  = "Service account used by GitHub Actions for deployments"
  project      = var.project_id
}

# Allow GitHub OIDC principals from the repo to impersonate the service account
resource "google_service_account_iam_member" "github_workload_identity" {
  service_account_id = google_service_account.github_actions.name
  role               = "roles/iam.workloadIdentityUser"
  member             = "principalSet://iam.googleapis.com/projects/${data.google_project.current.number}/locations/global/workloadIdentityPools/${google_iam_workload_identity_pool.github.workload_identity_pool_id}/attribute.repository/${var.github_repository}"
}

# Grant the service account permissions needed for deployment
resource "google_project_iam_member" "github_actions_permissions" {
  project = var.project_id
  role    = "roles/editor"
  member  = "serviceAccount:${google_service_account.github_actions.email}"
}

# Allow the GitHub Actions service account to push images to Artifact Registry
resource "google_project_iam_member" "github_actions_artifact_registry_writer" {
  project = var.project_id
  role    = "roles/artifactregistry.writer"
  member  = "serviceAccount:${google_service_account.github_actions.email}"
}

data "google_project" "current" {
  project_id = var.project_id
}
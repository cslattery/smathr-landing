variable "project_id" {
  description = "GCP Project ID"
  type        = string
  default     = "smathr-dev"
}

variable "region" {
  description = "GCP region for regional resources"
  type        = string
  default     = "europe-west1" # Belgium - supports custom domain mapping (unlike europe-west2)
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "service_name" {
  description = "Name of the Cloud Run service"
  type        = string
  default     = "smathr-landing"
}

variable "artifact_registry_repository" {
  description = "Name of the Artifact Registry repository"
  type        = string
  default     = "smathr-images"
}

variable "domain_names" {
  description = "List of custom domains to serve"
  type        = list(string)
  default     = ["smathr.com", "www.smathr.com"]
}

variable "github_repository" {
  description = "GitHub repository in owner/repo format (used for OIDC trust)"
  type        = string
  default     = "cslattery/smathr-landing"
}

variable "image" {
  description = "Container image to deploy to Cloud Run (overridden by CI/CD)"
  type        = string
  default     = ""
}

# Optional: You can create a terraform.tfvars file for local convenience
# or pass -var on the command line / via CI.
variable "project_id" {
  type = string
}

variable "region" {
  type = string
}

variable "service_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "cloud_run_service_name" {
  description = "Name of the Cloud Run service to attach"
  type        = string
}

variable "domain_names" {
  description = "List of domains for the SSL certificate"
  type        = list(string)
}
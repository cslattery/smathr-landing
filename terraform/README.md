# Terraform - Smathr Landing Infrastructure

This directory contains the Infrastructure as Code for the Smathr landing page and tools.

## Environment

- **Environment**: dev
- **Project**: smathr-dev
- **Region**: europe-west1 (Belgium)

**Note on Region Choice**: The service was moved from `europe-west2` to `europe-west1` (Belgium) because Cloud Run's native custom domain mapping is not supported in `europe-west2`. 

A Global Application Load Balancer module exists (`modules/load_balancer`) but is currently commented out in `main.tf` to avoid the cost of a Global LB. It can be re-enabled in the future if subdomains (e.g. `csv-explorer.smathr.com`) or advanced features (Cloud CDN, WAF) are needed. See the comment in `main.tf` for context.

## Prerequisites

1. GCS bucket for state: `smathr-dev-terraform-state` (must exist)
2. `gcloud` authenticated with sufficient permissions
3. Terraform >= 1.5

## Usage

```bash
cd terraform

# Initialize (first time or after backend changes)
terraform init

# Plan changes
terraform plan

# Apply changes
terraform apply
```

## What This Manages

- Artifact Registry repository
- Cloud Run service
- Global Application Load Balancer (for custom domains)
- Managed SSL certificates
- Service accounts and IAM

## CI/CD Integration

GitHub Actions will:
- Build and push Docker images on push to `main`
- Run `terraform plan` and `apply` (via OIDC)

## Notes

- The Load Balancer is required because custom domain mapping is not available in `europe-west2`.
- DNS is currently managed in Cloudflare (not in Terraform).
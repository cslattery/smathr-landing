terraform {
  backend "gcs" {
    bucket = "smathr-dev-terraform-state"
    prefix = "env/dev"
  }
}
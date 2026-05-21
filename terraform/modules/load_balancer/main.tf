# Global IP Address
resource "google_compute_global_address" "default" {
  name         = "${var.service_name}-lb-ip"
  project      = var.project_id
  address_type = "EXTERNAL"
}

# Managed SSL Certificate
resource "google_compute_managed_ssl_certificate" "default" {
  provider = google-beta
  name     = "${var.service_name}-ssl-cert"
  project  = var.project_id

  managed {
    domains = var.domain_names
  }
}

# Serverless Network Endpoint Group for Cloud Run
resource "google_compute_region_network_endpoint_group" "cloud_run" {
  name                  = "${var.service_name}-neg"
  project               = var.project_id
  region                = var.region
  network_endpoint_type = "SERVERLESS"

  cloud_run {
    service = var.cloud_run_service_name
  }
}

# Backend Service
resource "google_compute_backend_service" "default" {
  name        = "${var.service_name}-backend"
  project     = var.project_id
  protocol    = "HTTP"
  port_name   = "http"
  timeout_sec = 30
  enable_cdn  = false # Enable later if needed

  backend {
    group = google_compute_region_network_endpoint_group.cloud_run.id
  }

  log_config {
    enable = true
  }
}

# URL Map
resource "google_compute_url_map" "default" {
  name            = "${var.service_name}-url-map"
  project         = var.project_id
  default_service = google_compute_backend_service.default.id

  # Optional: Add host rules for www redirect later
}

# Target HTTPS Proxy
resource "google_compute_target_https_proxy" "default" {
  name             = "${var.service_name}-https-proxy"
  project          = var.project_id
  url_map          = google_compute_url_map.default.id
  ssl_certificates = [google_compute_managed_ssl_certificate.default.id]
}

# Global Forwarding Rule (Load Balancer entry point)
resource "google_compute_global_forwarding_rule" "https" {
  name                  = "${var.service_name}-https-forwarding-rule"
  project               = var.project_id
  target                = google_compute_target_https_proxy.default.id
  port_range            = "443"
  ip_address            = google_compute_global_address.default.address
  load_balancing_scheme = "EXTERNAL_MANAGED"
}

# HTTP to HTTPS redirect
resource "google_compute_url_map" "http_redirect" {
  name    = "${var.service_name}-http-redirect"
  project = var.project_id

  default_url_redirect {
    https_redirect = true
    strip_query    = false
  }
}

resource "google_compute_target_http_proxy" "http_redirect" {
  name    = "${var.service_name}-http-redirect-proxy"
  project = var.project_id
  url_map = google_compute_url_map.http_redirect.id
}

resource "google_compute_global_forwarding_rule" "http" {
  name                  = "${var.service_name}-http-forwarding-rule"
  project               = var.project_id
  target                = google_compute_target_http_proxy.http_redirect.id
  port_range            = "80"
  ip_address            = google_compute_global_address.default.address
  load_balancing_scheme = "EXTERNAL_MANAGED"
}
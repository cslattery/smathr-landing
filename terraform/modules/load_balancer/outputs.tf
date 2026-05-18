output "load_balancer_ip" {
  value = google_compute_global_address.default.address
}

output "ssl_certificate_name" {
  value = google_compute_managed_ssl_certificate.default.name
}
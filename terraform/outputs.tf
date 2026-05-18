output "cloud_run_service_url" {
  description = "URL of the Cloud Run service"
  value       = module.cloud_run.uri
}

# Uncomment once the load_balancer module is active
# output "load_balancer_ip" {
#   description = "Global IP address of the Application Load Balancer"
#   value       = module.load_balancer.load_balancer_ip
# }
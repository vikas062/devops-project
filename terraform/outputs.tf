# ═══════════════════════════════════════════════════════════════
# terraform/outputs.tf — Output Values
# Displays useful info after `terraform apply`
# ═══════════════════════════════════════════════════════════════

output "ec2_public_ip" {
  description = "Public IP of the EC2 instance"
  value       = aws_instance.codecanon_server.public_ip
}

output "ec2_public_dns" {
  description = "Public DNS of the EC2 instance"
  value       = aws_instance.codecanon_server.public_dns
}

output "app_url" {
  description = "CodeCanon Frontend URL"
  value       = "http://${aws_instance.codecanon_server.public_ip}"
}

output "api_url" {
  description = "CodeCanon Backend API URL"
  value       = "http://${aws_instance.codecanon_server.public_ip}:5000"
}

output "grafana_url" {
  description = "Grafana Dashboard URL"
  value       = "http://${aws_instance.codecanon_server.public_ip}:3001"
}

output "prometheus_url" {
  description = "Prometheus URL"
  value       = "http://${aws_instance.codecanon_server.public_ip}:9090"
}

output "ssh_command" {
  description = "SSH command to connect to EC2"
  value       = "ssh -i your-key.pem ubuntu@${aws_instance.codecanon_server.public_ip}"
}

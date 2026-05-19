# ═══════════════════════════════════════════════════════════════
# terraform/main.tf — AWS Infrastructure (CodeCanon)
#
# Provisions:
#   • Security Group (ports: 22 SSH, 80 HTTP, 5000 API, 9090 Prometheus, 3001 Grafana)
#   • EC2 t2.micro instance with Docker pre-installed
# ═══════════════════════════════════════════════════════════════

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# ─────────────────────────────────────────
# AWS Provider
# ─────────────────────────────────────────
provider "aws" {
  region = var.aws_region
}

# ─────────────────────────────────────────
# Security Group — Allow required ports
# ─────────────────────────────────────────
resource "aws_security_group" "codecanon_sg" {
  name        = "codecanon-sg"
  description = "CodeCanon application security group"

  # SSH
  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTP (Frontend)
  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTPS (Frontend)
  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Backend API
  ingress {
    description = "Backend API"
    from_port   = 5000
    to_port     = 5000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Prometheus
  ingress {
    description = "Prometheus"
    from_port   = 9090
    to_port     = 9090
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Grafana
  ingress {
    description = "Grafana"
    from_port   = 3001
    to_port     = 3001
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # All outbound traffic allowed
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name    = "codecanon-sg"
    Project = "CodeCanon"
  }
}

# ─────────────────────────────────────────
# EC2 Instance — t2.micro (Free Tier)
# ─────────────────────────────────────────
resource "aws_instance" "codecanon_server" {
  ami                    = var.ami_id         # Ubuntu 22.04 AMI
  instance_type          = "t2.micro"         # Free tier eligible
  key_name               = var.key_pair_name  # Your AWS key pair
  vpc_security_group_ids = [aws_security_group.codecanon_sg.id]

  # Bootstrap script: install Docker + Docker Compose on first boot
  user_data = <<-EOF
    #!/bin/bash
    apt-get update -y
    apt-get install -y docker.io docker-compose git curl
    systemctl start docker
    systemctl enable docker
    usermod -aG docker ubuntu
    echo "✅ Docker installed successfully"
  EOF

  tags = {
    Name    = "codecanon-server"
    Project = "CodeCanon"
    Env     = "production"
  }
}

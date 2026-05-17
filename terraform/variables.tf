# ═══════════════════════════════════════════════════════════════
# terraform/variables.tf — Input Variables
# ═══════════════════════════════════════════════════════════════

variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "ap-south-1"   # Mumbai — closest to India
}

variable "ami_id" {
  description = "Ubuntu 22.04 LTS AMI ID (ap-south-1)"
  type        = string
  default     = "ami-0f58b397bc5c1f2e8"  # Ubuntu 22.04 - Mumbai
}

variable "key_pair_name" {
  description = "Name of your AWS EC2 Key Pair for SSH access"
  type        = string
  # Set this via: terraform apply -var='key_pair_name=your-key-name'
}

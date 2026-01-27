variable "project_name" {
  type        = string
  description = "Project identifier for tagging"
  default     = "sinaesta"
}

variable "environment" {
  type        = string
  description = "Deployment environment (dev, staging, production)"
  default     = "staging"
}

variable "aws_region" {
  type        = string
  description = "AWS region"
  default     = "us-east-1"
}

variable "vpc_cidr" {
  type        = string
  description = "VPC CIDR block"
  default     = "10.10.0.0/16"
}

variable "public_subnets" {
  type        = list(string)
  description = "Public subnet CIDRs"
  default     = ["10.10.1.0/24", "10.10.2.0/24"]
}

variable "private_subnets" {
  type        = list(string)
  description = "Private subnet CIDRs"
  default     = ["10.10.11.0/24", "10.10.12.0/24"]
}

variable "db_username" {
  type        = string
  description = "Database username"
  default     = "sinaesta"
}

variable "db_password" {
  type        = string
  description = "Database password"
  sensitive   = true
}

variable "db_instance_class" {
  type        = string
  description = "Database instance class"
  default     = "db.t4g.micro"
}

variable "db_allocated_storage" {
  type        = number
  description = "Database storage in GB"
  default     = 20
}

variable "domain_name" {
  type        = string
  description = "Custom domain name for the frontend"
  default     = ""
}

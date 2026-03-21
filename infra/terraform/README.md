# Terraform Infrastructure

This directory provisions core AWS infrastructure for Sinaesta using Terraform.

## Resources provisioned
- VPC with public/private subnets
- RDS PostgreSQL instance
- ElastiCache Redis cluster
- S3 bucket + CloudFront distribution for frontend assets
- ECS cluster (service definitions handled via deployment scripts)
- ECR repositories for backend/frontend images

## Usage
```bash
cd infra/terraform
terraform init
terraform plan -var="db_password=YOUR_PASSWORD" -var="environment=staging"
terraform apply -var="db_password=YOUR_PASSWORD" -var="environment=staging"
```

## Environments
Use `environment` to switch between `dev`, `staging`, and `production`. Override CIDR
blocks and instance sizes via CLI or tfvars.

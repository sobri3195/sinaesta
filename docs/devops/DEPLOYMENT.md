# Sinaesta Deployment & DevOps Guide

## Overview
This guide describes the deployment topology for Sinaesta using AWS, Docker, and GitHub Actions.

## Environments
- **Development**: Docker Compose (`docker-compose.yml`) with Postgres + Redis.
- **Staging**: Automated deployments on merge to `main` via GitHub Actions.
- **Production**: Manual approval workflow via GitHub Actions environment protection.

## Container Images
- **Backend**: `Dockerfile` (multi-stage) builds a production Node.js image.
- **Frontend**: `Dockerfile.frontend` builds the Vite app and serves via Nginx.

## CI/CD Pipeline
- **CI**: Lint, formatting, typecheck, unit tests, build, and security scans on PRs.
- **CD**: Build & push images to GHCR, deploy to staging on merge, manual production deploy.
- **Rollback**: `scripts/deploy/ecs-rollback.sh` can revert the ECS service to the previous task definition.

## Deployment Targets (AWS Recommended)
- **Frontend**: S3 + CloudFront (CDN)
- **Backend**: ECS (Fargate) behind an ALB
- **Database**: RDS Postgres
- **Cache/Queue**: ElastiCache Redis

## Health Checks
- Backend: `GET /health`
- Frontend: Nginx `/health`

## Zero-Downtime Strategy
- Use ECS rolling updates or blue/green deployments with CodeDeploy.
- Ensure database migrations are backward-compatible.
- Use feature flags for gradual rollouts.

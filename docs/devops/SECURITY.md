# Security Hardening Checklist

- Enforce HTTPS with TLS certificates (ACM).
- Use security groups and VPC isolation for databases.
- Enable WAF and DDoS protection (AWS Shield).
- Set security headers in Nginx (HSTS, X-Frame-Options, CSP).
- Rotate secrets with AWS Secrets Manager and short-lived IAM roles.
- Run regular vulnerability scans (npm audit, Snyk) and patch dependencies.

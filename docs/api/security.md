# Security Guide

## Authentication
- Use JWT access tokens in the `Authorization` header.
- Refresh tokens are rotated via `/api/auth/refresh`.

## Authorization Examples
- Students can only access their own results.
- Mentors/admins can access analytics and organization-wide data.

## API Key Management
If you expose server-to-server integrations:
1. Issue API keys per integration partner.
2. Store keys in a secure vault (AWS Secrets Manager, Vault).
3. Rotate keys quarterly.

## Security Best Practices
- Always use HTTPS in production.
- Validate all user-provided input.
- Store tokens securely (HTTP-only cookies or encrypted storage).
- Minimize token scopes to required permissions.

## Common Pitfalls
- Logging tokens in plaintext.
- Allowing overly permissive roles in client apps.
- Not enforcing rate limits on auth endpoints.

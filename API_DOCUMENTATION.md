# Sinaesta API Documentation

This repository ships a full OpenAPI 3.0 specification and developer guides for the Sinaesta API.

## Quick Links
- **OpenAPI spec**: `docs/api/openapi.yaml`
- **Developer guide**: `docs/api/README.md`
- **SDK generation**: `docs/api/sdk.md`
- **Versioning**: `docs/api/versioning.md`
- **Security**: `docs/api/security.md`
- **Deployment**: `docs/api/deployment.md`
- **Support**: `docs/api/support.md`
- **Postman collection**: `docs/api/postman_collection.json`
- **Postman environment**: `docs/api/postman_environment.json`

## Interactive Documentation
Use Swagger UI to explore and test requests locally:

```bash
npx swagger-ui-watcher docs/api/openapi.yaml
```

This provides:
- Interactive "Try it out"
- Request builder interface
- Live response rendering

## Base URL

```
Development: http://localhost:3001/api
```

## Authentication
All protected endpoints require a JWT bearer token:

```
Authorization: Bearer <access-token>
```

## Rate Limits
- General: **100 requests / 15 minutes**
- Login: **5 requests / 15 minutes**
- Uploads: **50 requests / 15 minutes**
- Bulk uploads: **10 requests / hour**
- Presigned URLs: **100 requests / 5 minutes**

See `docs/api/README.md` for detailed endpoint documentation and examples.

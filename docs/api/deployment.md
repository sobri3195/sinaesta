# Documentation Deployment

## Hosting
- Host docs at `https://docs.example.com` (or `docs.sinaesta.example`).
- Serve Swagger UI with the OpenAPI spec at `/openapi.yaml`.

## Swagger UI Setup
1. Host `docs/api/openapi.yaml` on your docs site.
2. Use Swagger UI to render the spec and enable "Try it out".
3. Provide CORS access to the API domain.

## Search
- Use Algolia DocSearch or Elastic App Search.
- Index markdown docs and OpenAPI reference.

## Automation
- Regenerate documentation on every deployment.
- Validate the OpenAPI spec in CI:

```bash
openapi-generator-cli validate -i docs/api/openapi.yaml
```

## Versioned Docs
- Use `/v1/` for current docs.
- Keep previous versions (e.g., `/v0/`) for deprecated APIs.

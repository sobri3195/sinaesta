# Sinaesta API Documentation

## Overview
Sinaesta provides a RESTful API for authentication, user management, exams, OSCE simulations, flashcards, results analytics, file uploads, and email preferences. The API is documented with an OpenAPI 3.0 specification that can be used to generate interactive documentation and SDKs.

**Base URL**

```
https://api.sinaesta.example/api
```

**OpenAPI Specification**

- `docs/api/openapi.yaml`

## Getting Started
1. Obtain credentials (email + password) or an access token from the admin.
2. Authenticate via `POST /api/auth/login` to receive an access token.
3. Send requests with the `Authorization: Bearer <accessToken>` header.

### Quick Start (cURL)
```bash
curl -X POST "https://api.sinaesta.example/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sinaesta.com","password":"admin123"}'
```

```bash
curl "https://api.sinaesta.example/api/exams" \
  -H "Authorization: Bearer <accessToken>"
```

## Authentication Flow
- **Access token**: short-lived JWT used for all protected requests.
- **Refresh token**: issued via cookie (or optional body param) and rotated on refresh.

**Endpoints**
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `POST /api/auth/verify-email`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`

## Pagination, Filtering, and Sorting
Most list endpoints accept `page` and `limit` query parameters. Some endpoints support filters:

- **Users**: `role`, `specialty`, `status`
- **Exams**: `specialty`, `difficulty`, `mode`
- **Results**: `userId`, `examId`
- **Flashcards**: `category`, `mastered`
- **OSCE Attempts**: `stationId`
- **Email Logs**: `limit`, `offset`

Sorting is currently performed server-side by creation or completion time. If you need custom sorting, sort client-side after fetching paginated data.

## Rate Limiting
All `/api` endpoints are protected by a **general rate limit** of `100 requests / 15 minutes` per IP. Specific endpoints apply stricter limits:

| Endpoint | Limit | Window |
| --- | --- | --- |
| `POST /api/auth/login` | 5 | 15 minutes |
| `POST /api/upload` | 50 | 15 minutes |
| `POST /api/upload/batch` | 10 | 1 hour |
| `POST /api/upload/url` | 100 | 5 minutes |

## Error Handling
All responses include a consistent JSON format. Error responses may include validation detail arrays.

```json
{
  "success": false,
  "error": "Error message"
}
```

```json
{
  "success": false,
  "error": [
    { "path": ["field"], "message": "Validation message" }
  ]
}
```

Common status codes:
- **400**: Validation error or missing input
- **401**: Authentication failure
- **403**: Authorization failure
- **404**: Resource not found
- **429**: Rate limit exceeded
- **500**: Internal server error

## Code Examples

### JavaScript (Axios)
```ts
import axios from "axios";

const client = axios.create({
  baseURL: "https://api.sinaesta.example/api",
  headers: { Authorization: `Bearer ${process.env.SINAESTA_TOKEN}` },
});

const response = await client.get("/exams", {
  params: { page: 1, limit: 20, difficulty: "Medium" },
});

console.log(response.data.data);
```

### Python (Requests)
```python
import requests

base_url = "https://api.sinaesta.example/api"
headers = {"Authorization": f"Bearer {token}"}

resp = requests.get(f"{base_url}/users/me", headers=headers)
print(resp.json())
```

### cURL
```bash
curl -X POST "https://api.sinaesta.example/api/exams" \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Mock Exam","description":"Cardiology","durationMinutes":60,"topic":"Cardiology","difficulty":"Medium"}'
```

### React Integration
```tsx
import { useEffect, useState } from "react";

export function ExamsList() {
  const [exams, setExams] = useState([]);

  useEffect(() => {
    fetch("https://api.sinaesta.example/api/exams", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => setExams(data.data));
  }, []);

  return (
    <ul>
      {exams.map((exam) => (
        <li key={exam.id}>{exam.title}</li>
      ))}
    </ul>
  );
}
```

## Common Use Cases

### Create and Take an Exam
1. Mentor creates exam (`POST /api/exams`).
2. Mentor adds questions (`POST /api/exams/{id}/questions`).
3. Student fetches exam (`GET /api/exams/{id}`).
4. Student submits answers (`POST /api/exams/{id}/submit`).
5. Student views results (`GET /api/results/my-results`).

### Import Questions from Excel
1. Download template (`GET /api/templates/questions?type=xlsx`).
2. Populate the template.
3. Upload file (`POST /api/upload` with `fileType=excel`).

### Get User Analytics
1. Retrieve aggregated stats (`GET /api/results/stats/overview`).
2. Filter by `examId` or `specialty` for drilldowns.

### OSCE Simulation Flow
1. Mentor creates stations (`POST /api/osce/stations`).
2. Student lists stations (`GET /api/osce/stations`).
3. Student submits attempt (`POST /api/osce/attempts`).
4. Mentor reviews (`PUT /api/osce/attempts/{id}`).

## Best Practices
- Cache common reference data (exams, specialties) for 5–15 minutes.
- Batch uploads when importing large question sets.
- Use pagination to avoid large payloads.
- Log `requestId` values (if added downstream) for support tracing.

## Testing & QA
- Use Swagger UI or Postman for live API testing.
- Enable Postman tests for status codes and schema keys.
- Seed data from `server/migrations/seed.sql` for reliable tests.

## Interactive Documentation
Use Swagger UI to explore the OpenAPI spec:

```bash
npx swagger-ui-watcher docs/api/openapi.yaml
```

Or serve the static file and point Swagger UI to `docs/api/openapi.yaml`.

## SDK Generation
See [SDK Guide](./sdk.md) for generating TypeScript and Python clients from the OpenAPI spec.

## Postman Collection
- Collection: `docs/api/postman_collection.json`
- Environment: `docs/api/postman_environment.json`

## Versioning
See [Versioning Guide](./versioning.md) for API version strategy, deprecation, and migration guidance.

## Security
See [Security Guide](./security.md) for authorization patterns, API key management, and best practices.

## Deployment & Hosting
See [Deployment Guide](./deployment.md) for hosting documentation at `docs.example.com`, search setup, and automation.

## Support
See [Support Resources](./support.md) for troubleshooting and contact information.

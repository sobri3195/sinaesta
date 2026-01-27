# SDK Generation & Usage

Sinaesta SDKs are generated from the OpenAPI specification (`docs/api/openapi.yaml`).

## Tooling
We recommend **OpenAPI Generator**:

```bash
npm install -g @openapitools/openapi-generator-cli
```

## Generate TypeScript/JavaScript SDK
```bash
openapi-generator-cli generate \
  -i docs/api/openapi.yaml \
  -g typescript-axios \
  -o sdk/typescript
```

### Usage Example
```ts
import { Configuration, ExamsApi } from "./sdk/typescript";

const config = new Configuration({
  basePath: "https://api.sinaesta.example",
  accessToken: "<accessToken>",
});

const examsApi = new ExamsApi(config);
const { data } = await examsApi.apiExamsGet({ page: 1, limit: 20 });
```

## Generate Python SDK
```bash
openapi-generator-cli generate \
  -i docs/api/openapi.yaml \
  -g python \
  -o sdk/python
```

### Usage Example
```python
from sdk.python import ApiClient, Configuration
from sdk.python.api.exams_api import ExamsApi

config = Configuration(host="https://api.sinaesta.example")
config.access_token = "<accessToken>"
client = ApiClient(config)

api = ExamsApi(client)
response = api.api_exams_get(page=1, limit=20)
print(response)
```

## Auto-update SDKs on API changes
1. Add a CI pipeline step that regenerates SDKs on `main` changes.
2. Publish packages to your internal registry (npm/PyPI). 
3. Use semantic versioning and changelog entries from API diffs.

Recommended CI check:
```bash
openapi-generator-cli validate -i docs/api/openapi.yaml
```

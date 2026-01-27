# API Versioning & Changelog

## Versioning Strategy
- Version via the base path: `/api/v1/...` (future-proof).
- Current version: **v1** (implied in the existing routes).

## Deprecation Policy
- Announce deprecations **60 days** ahead of removal.
- Mark deprecated endpoints in the OpenAPI spec with `deprecated: true`.
- Provide a migration guide for any breaking changes.

## Migration Guide Template
1. Identify replaced endpoint.
2. Map old request fields to new fields.
3. Update response handling.
4. Test in staging.

## Changelog
Maintain `CHANGELOG.md` with entries for:
- Added endpoints
- Modified request/response schemas
- Behavior changes
- Deprecations and removals

Example entry:
```
## [1.2.0] - 2025-02-01
### Added
- POST /api/osce/attempts to support OSCE submissions.

### Changed
- GET /api/exams supports `mode` filter.
```

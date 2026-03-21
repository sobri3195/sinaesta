# Support Resources

## FAQ
**Q: Why am I getting 401 errors?**
- Ensure you include `Authorization: Bearer <token>` and your token is not expired.

**Q: Why is my request throttled?**
- Some endpoints have stricter rate limits. Retry after the window resets.

## Troubleshooting
- Confirm your base URL matches the environment.
- Check response `error` fields for validation details.
- Validate your request body against the OpenAPI schema.

## Contact Support
- Email: support@sinaesta.example
- Support hours: Mon–Fri, 09:00–17:00 GMT+7

## Issue Reporting
Include the following:
- Request ID (if available)
- Endpoint and payload
- Timestamp
- Expected vs actual response

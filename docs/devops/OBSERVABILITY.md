# Monitoring, Logging, and Alerts

## Monitoring
- **APM**: Datadog/New Relic (Node.js agent) or AWS CloudWatch Application Signals.
- **Performance**: Lighthouse CI for frontend performance budgets.

## Logging
- **Centralized Logging**: CloudWatch Logs or ELK.
- **Structured Logging**: Configure JSON logs for easier parsing.

## Error Tracking
- **Sentry**: Capture frontend and backend errors with environment tagging.

## Uptime Monitoring
- **UptimeRobot/Pingdom**: Monitor health endpoints and alert on failures.

## Alerts
- Configure alert rules for latency, error rate, memory/CPU, and failed health checks.
- Route alerts to Slack/email based on severity.

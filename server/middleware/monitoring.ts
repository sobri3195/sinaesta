import { Request, Response, NextFunction } from 'express';
import { recordRequestMetric, getMetricsSnapshot } from '../services/metricsService';
import { sendAlert } from '../services/alertService';

const ERROR_RATE_THRESHOLD = Number(process.env.ALERT_ERROR_RATE_THRESHOLD || 0.05);
const SLOW_RESPONSE_THRESHOLD_MS = Number(process.env.ALERT_SLOW_RESPONSE_THRESHOLD_MS || 3000);

export const monitoringMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on('finish', async () => {
    const durationMs = Date.now() - start;
    recordRequestMetric({
      path: req.path,
      method: req.method,
      status: res.statusCode,
      durationMs,
      timestamp: Date.now(),
    });

    const metrics = getMetricsSnapshot();
    if (metrics.requests.errorRate > ERROR_RATE_THRESHOLD) {
      await sendAlert(
        'High error rate detected',
        `Error rate is ${(metrics.requests.errorRate * 100).toFixed(1)}% over the last 15 minutes.`,
        'critical'
      );
    }

    if (durationMs > SLOW_RESPONSE_THRESHOLD_MS) {
      await sendAlert(
        'Slow API response detected',
        `${req.method} ${req.path} took ${durationMs}ms.`,
        'warning'
      );
    }
  });

  next();
};

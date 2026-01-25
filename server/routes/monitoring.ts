import { Router } from 'express';
import { getMetricsSnapshot } from '../services/metricsService';

const router = Router();

router.get('/metrics', (req, res) => {
  res.json({
    success: true,
    data: getMetricsSnapshot(),
  });
});

export default router;

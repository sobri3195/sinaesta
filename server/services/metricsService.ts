import os from 'os';
import { statfsSync } from 'fs';
import type { Pool } from 'pg';

type RequestMetric = {
  path: string;
  method: string;
  status: number;
  durationMs: number;
  timestamp: number;
};

type QueryMetric = {
  durationMs: number;
  timestamp: number;
};

const requestMetrics: RequestMetric[] = [];
const queryMetrics: QueryMetric[] = [];
let dbPool: Pool | null = null;
let queueMetrics = {
  processedJobs: 0,
  failedJobs: 0,
  backlog: 0,
};

const MAX_METRICS = 5000;

const trimMetrics = <T>(metrics: T[]) => {
  if (metrics.length > MAX_METRICS) {
    metrics.splice(0, metrics.length - MAX_METRICS);
  }
};

export const recordRequestMetric = (metric: RequestMetric) => {
  requestMetrics.push(metric);
  trimMetrics(requestMetrics);
};

export const recordQueryMetric = (metric: QueryMetric) => {
  queryMetrics.push(metric);
  trimMetrics(queryMetrics);
};

export const setMetricsDatabasePool = (pool: Pool) => {
  dbPool = pool;
};

export const setQueueMetrics = (metrics: { processedJobs: number; failedJobs: number; backlog: number }) => {
  queueMetrics = metrics;
};

const summarizeRequests = () => {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const windowed = requestMetrics.filter((metric) => now - metric.timestamp <= windowMs);
  const total = windowed.length;
  const errorCount = windowed.filter((metric) => metric.status >= 500).length;
  const avgDuration = total ? windowed.reduce((sum, metric) => sum + metric.durationMs, 0) / total : 0;
  return {
    total,
    errorRate: total ? errorCount / total : 0,
    avgDurationMs: Math.round(avgDuration),
  };
};

const summarizeQueries = () => {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const windowed = queryMetrics.filter((metric) => now - metric.timestamp <= windowMs);
  const total = windowed.length;
  const avgDuration = total ? windowed.reduce((sum, metric) => sum + metric.durationMs, 0) / total : 0;
  return {
    total,
    avgDurationMs: Math.round(avgDuration),
  };
};

const getDiskUsage = () => {
  try {
    const stats = statfsSync('/');
    const total = stats.blocks * stats.bsize;
    const free = stats.bfree * stats.bsize;
    return {
      total,
      free,
      used: total - free,
    };
  } catch (error) {
    return {
      total: 0,
      free: 0,
      used: 0,
    };
  }
};

export const getMetricsSnapshot = () => {
  const memoryUsage = process.memoryUsage();
  const cpuLoad = os.loadavg();
  const disk = getDiskUsage();
  const requests = summarizeRequests();
  const queries = summarizeQueries();

  return {
    uptimeSeconds: Math.round(process.uptime()),
    memory: {
      rss: memoryUsage.rss,
      heapTotal: memoryUsage.heapTotal,
      heapUsed: memoryUsage.heapUsed,
    },
    cpu: {
      load1: cpuLoad[0],
      load5: cpuLoad[1],
      load15: cpuLoad[2],
    },
    disk,
    requests,
    queries,
    queues: queueMetrics,
    database: dbPool
      ? {
          totalConnections: dbPool.totalCount,
          idleConnections: dbPool.idleCount,
          waitingConnections: dbPool.waitingCount,
        }
      : {
          totalConnections: 0,
          idleConnections: 0,
          waitingConnections: 0,
        },
  };
};

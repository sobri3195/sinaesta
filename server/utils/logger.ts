import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  base: {
    service: 'sinaesta-api',
  },
  timestamp: () => `,"time":"${new Date().toISOString()}"`,
});

export default logger;

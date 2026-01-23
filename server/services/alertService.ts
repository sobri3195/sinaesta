import logger from '../utils/logger';

const alertState = new Map<string, number>();

const postWebhook = async (url: string, payload: Record<string, unknown>) => {
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    logger.warn({ error }, 'Failed to send alert webhook');
  }
};

export const sendAlert = async (title: string, message: string, severity: 'critical' | 'warning' | 'info') => {
  const now = Date.now();
  const lastSent = alertState.get(title) || 0;
  if (now - lastSent < 5 * 60 * 1000) {
    return;
  }
  alertState.set(title, now);

  const payload = {
    title,
    text: message,
    severity,
  };

  if (process.env.ALERT_SLACK_WEBHOOK_URL) {
    await postWebhook(process.env.ALERT_SLACK_WEBHOOK_URL, {
      text: `*${title}*\n${message}`,
    });
  }

  if (process.env.ALERT_DISCORD_WEBHOOK_URL) {
    await postWebhook(process.env.ALERT_DISCORD_WEBHOOK_URL, payload);
  }

  logger.warn({ title, severity }, message);
};

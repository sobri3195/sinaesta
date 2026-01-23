import { config } from 'dotenv';

config();

// Email provider configuration
// Supports SendGrid, Mailgun, AWS SES, or any SMTP provider
export const emailConfig = {
  // Provider type: 'smtp', 'sendgrid', 'mailgun', 'ses'
  provider: process.env.EMAIL_PROVIDER || 'smtp',
  
  // SMTP Configuration (works with any provider)
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
  },
  
  // SendGrid Configuration
  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY || '',
  },
  
  // Mailgun Configuration
  mailgun: {
    apiKey: process.env.MAILGUN_API_KEY || '',
    domain: process.env.MAILGUN_DOMAIN || '',
  },
  
  // AWS SES Configuration
  ses: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    region: process.env.AWS_REGION || 'us-east-1',
  },
  
  // From addresses
  from: {
    default: process.env.EMAIL_FROM || 'Sinaesta <noreply@sinaesta.com>',
    support: process.env.EMAIL_FROM_SUPPORT || 'Sinaesta Support <support@sinaesta.com>',
    notifications: process.env.EMAIL_FROM_NOTIFICATIONS || 'Sinaesta Notifications <notifications@sinaesta.com>',
    marketing: process.env.EMAIL_FROM_MARKETING || 'Sinaesta <hello@sinaesta.com>',
  },
  
  // Company information (for CAN-SPAM compliance)
  company: {
    name: 'Sinaesta',
    address: process.env.COMPANY_ADDRESS || 'Jakarta, Indonesia',
    supportEmail: 'support@sinaesta.com',
  },
  
  // Queue settings
  queue: {
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || undefined,
    },
    
    // Rate limiting
    rateLimit: {
      max: parseInt(process.env.EMAIL_RATE_LIMIT || '100'), // emails per minute
      duration: 60 * 1000, // 1 minute
    },
    
    // Retry configuration
    retry: {
      attempts: 3,
      backoff: {
        type: 'exponential' as const,
        delay: 5000, // 5 seconds initial delay
      },
    },
  },
  
  // Feature flags
  features: {
    enabled: process.env.EMAIL_ENABLED !== 'false', // Enable/disable email system
    sandbox: process.env.EMAIL_SANDBOX === 'true', // Sandbox mode (don't actually send)
    tracking: process.env.EMAIL_TRACKING !== 'false', // Track opens/clicks
    analytics: process.env.EMAIL_ANALYTICS !== 'false', // Store analytics
  },
  
  // Template settings
  templates: {
    cacheEnabled: process.env.TEMPLATE_CACHE_ENABLED !== 'false',
    cacheTTL: parseInt(process.env.TEMPLATE_CACHE_TTL || '3600'), // 1 hour
  },
  
  // Unsubscribe settings
  unsubscribe: {
    tokenExpiry: 90 * 24 * 60 * 60 * 1000, // 90 days
    baseUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  },
};

// Validation function
export function validateEmailConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!emailConfig.features.enabled) {
    return { valid: true, errors: [] }; // Skip validation if disabled
  }
  
  // Validate provider-specific config
  switch (emailConfig.provider) {
    case 'smtp':
      if (!emailConfig.smtp.auth.user || !emailConfig.smtp.auth.pass) {
        errors.push('SMTP credentials are required (SMTP_USER and SMTP_PASS)');
      }
      break;
    case 'sendgrid':
      if (!emailConfig.sendgrid.apiKey) {
        errors.push('SendGrid API key is required (SENDGRID_API_KEY)');
      }
      break;
    case 'mailgun':
      if (!emailConfig.mailgun.apiKey || !emailConfig.mailgun.domain) {
        errors.push('Mailgun API key and domain are required');
      }
      break;
    case 'ses':
      if (!emailConfig.ses.accessKeyId || !emailConfig.ses.secretAccessKey) {
        errors.push('AWS SES credentials are required');
      }
      break;
    default:
      errors.push(`Unknown email provider: ${emailConfig.provider}`);
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

export default emailConfig;

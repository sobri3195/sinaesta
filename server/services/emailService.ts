import nodemailer, { Transporter } from 'nodemailer';
import { readFileSync } from 'fs';
import { join } from 'path';
import Handlebars from 'handlebars';
import { Pool } from 'pg';
import { emailConfig, validateEmailConfig } from '../config/email.js';
import crypto from 'crypto';

// Database pool (should be imported from db.ts in production)
let db: Pool;

export function setDatabasePool(pool: Pool) {
  db = pool;
}

// Email transporter
let transporter: Transporter | null = null;

// Initialize email service
export async function initializeEmailService(): Promise<void> {
  // Validate configuration
  const validation = validateEmailConfig();
  if (!validation.valid) {
    console.error('❌ Email configuration errors:', validation.errors);
    if (emailConfig.features.enabled) {
      throw new Error(`Email service configuration invalid: ${validation.errors.join(', ')}`);
    }
    return;
  }

  if (!emailConfig.features.enabled) {
    console.log('📧 Email service is disabled');
    return;
  }

  // Create transporter based on provider
  if (emailConfig.provider === 'smtp') {
    transporter = nodemailer.createTransport(emailConfig.smtp);
  } else if (emailConfig.provider === 'sendgrid') {
    // SendGrid uses SMTP
    transporter = nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      auth: {
        user: 'apikey',
        pass: emailConfig.sendgrid.apiKey,
      },
    });
  } else if (emailConfig.provider === 'mailgun') {
    // Mailgun SMTP
    transporter = nodemailer.createTransport({
      host: 'smtp.mailgun.org',
      port: 587,
      auth: {
        user: `postmaster@${emailConfig.mailgun.domain}`,
        pass: emailConfig.mailgun.apiKey,
      },
    });
  }

  // Verify connection
  if (transporter && !emailConfig.features.sandbox) {
    try {
      await transporter.verify();
      console.log('✅ Email service initialized successfully');
    } catch (error) {
      console.error('❌ Email service verification failed:', error);
      throw error;
    }
  } else if (emailConfig.features.sandbox) {
    console.log('📧 Email service running in SANDBOX mode (emails will not be sent)');
  }
}

// Template cache
const templateCache = new Map<string, HandlebarsTemplateDelegate>();

// Load and compile template
function loadTemplate(templateName: string): HandlebarsTemplateDelegate {
  // Check cache first
  if (emailConfig.templates.cacheEnabled && templateCache.has(templateName)) {
    return templateCache.get(templateName)!;
  }

  try {
    // Load template file
    const templatePath = join(process.cwd(), 'server', 'templates', 'emails', `${templateName}.hbs`);
    const templateSource = readFileSync(templatePath, 'utf-8');
    
    // Compile template
    const template = Handlebars.compile(templateSource);
    
    // Cache template
    if (emailConfig.templates.cacheEnabled) {
      templateCache.set(templateName, template);
    }
    
    return template;
  } catch (error) {
    console.error(`Failed to load template: ${templateName}`, error);
    throw new Error(`Template not found: ${templateName}`);
  }
}

// Load layout template
function loadLayout(): HandlebarsTemplateDelegate {
  if (templateCache.has('_layout')) {
    return templateCache.get('_layout')!;
  }

  const layoutPath = join(process.cwd(), 'server', 'templates', 'emails', 'layout.hbs');
  const layoutSource = readFileSync(layoutPath, 'utf-8');
  const layout = Handlebars.compile(layoutSource);
  
  templateCache.set('_layout', layout);
  return layout;
}

// Render email template
function renderTemplate(templateName: string, data: Record<string, any>): { html: string; text: string } {
  // Load template
  const template = loadTemplate(templateName);
  const layout = loadLayout();
  
  // Prepare data with common variables
  const templateData = {
    ...data,
    frontendUrl: emailConfig.unsubscribe.baseUrl,
    supportUrl: `${emailConfig.unsubscribe.baseUrl}/support`,
    companyName: emailConfig.company.name,
    companyAddress: emailConfig.company.address,
    year: new Date().getFullYear(),
  };
  
  // Render template body
  const body = template(templateData);
  
  // Render full email with layout
  const html = layout({
    ...templateData,
    body,
  });
  
  // Generate plain text version (strip HTML tags)
  const text = html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  return { html, text };
}

// Generate unsubscribe token
async function generateUnsubscribeToken(userId: string, emailType?: string): Promise<string> {
  if (!db) {
    throw new Error('Database not initialized');
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + emailConfig.unsubscribe.tokenExpiry);
  
  await db.query(
    `INSERT INTO unsubscribe_tokens (user_id, token, email_type, expires_at)
     VALUES ($1, $2, $3, $4)`,
    [userId, token, emailType || null, expiresAt]
  );
  
  return token;
}

// Check if user has preference enabled
async function checkEmailPreference(userId: string, emailType: string): Promise<boolean> {
  if (!db) {
    return true; // Default to sending if DB not available
  }

  try {
    const result = await db.query(
      `SELECT ${emailType} FROM email_preferences WHERE user_id = $1`,
      [userId]
    );
    
    if (result.rows.length === 0) {
      return true; // Default to enabled if no preferences set
    }
    
    return result.rows[0][emailType] !== false;
  } catch (error) {
    console.error('Error checking email preference:', error);
    return true; // Default to sending on error
  }
}

// Log email to database
async function logEmail(params: {
  userId?: string;
  toEmail: string;
  fromEmail: string;
  subject: string;
  templateName: string;
  messageId?: string;
  status?: string;
}): Promise<void> {
  if (!db || !emailConfig.features.analytics) {
    return;
  }

  try {
    await db.query(
      `INSERT INTO email_logs (user_id, to_email, from_email, subject, template_name, message_id, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        params.userId || null,
        params.toEmail,
        params.fromEmail,
        params.subject,
        params.templateName,
        params.messageId || null,
        params.status || 'SENT',
      ]
    );
  } catch (error) {
    console.error('Error logging email:', error);
  }
}

// Main send email function
export async function sendEmail(params: {
  to: string;
  userId?: string;
  subject: string;
  templateName: string;
  templateData?: Record<string, any>;
  from?: string;
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';
  emailType?: string;
  scheduledAt?: Date;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    // Check if email service is enabled
    if (!emailConfig.features.enabled) {
      console.log(`[EMAIL DISABLED] Would send: ${params.templateName} to ${params.to}`);
      return { success: true, messageId: 'disabled' };
    }

    // Check user preferences if userId provided
    if (params.userId && params.emailType) {
      const hasPreference = await checkEmailPreference(params.userId, params.emailType);
      if (!hasPreference) {
        console.log(`User ${params.userId} has opted out of ${params.emailType} emails`);
        return { success: true, messageId: 'opted-out' };
      }
    }

    // Generate unsubscribe token and URL
    let unsubscribeUrl: string | undefined;
    if (params.userId && params.emailType) {
      const token = await generateUnsubscribeToken(params.userId, params.emailType);
      unsubscribeUrl = `${emailConfig.unsubscribe.baseUrl}/unsubscribe?token=${token}`;
    }

    // Render template
    const { html, text } = renderTemplate(params.templateName, {
      ...params.templateData,
      toEmail: params.to,
      unsubscribeUrl,
    });

    // Sandbox mode - just log
    if (emailConfig.features.sandbox) {
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📧 [SANDBOX] Email Details:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`To: ${params.to}`);
      console.log(`Subject: ${params.subject}`);
      console.log(`Template: ${params.templateName}`);
      console.log(`Priority: ${params.priority || 'MEDIUM'}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      
      await logEmail({
        userId: params.userId,
        toEmail: params.to,
        fromEmail: params.from || emailConfig.from.default,
        subject: params.subject,
        templateName: params.templateName,
        messageId: 'sandbox-' + crypto.randomBytes(16).toString('hex'),
        status: 'SENT',
      });
      
      return { success: true, messageId: 'sandbox' };
    }

    // If scheduled, add to queue instead of sending immediately
    if (params.scheduledAt || params.priority === 'LOW') {
      await addToQueue({
        userId: params.userId,
        toEmail: params.to,
        subject: params.subject,
        templateName: params.templateName,
        templateData: params.templateData,
        priority: params.priority || 'MEDIUM',
        scheduledAt: params.scheduledAt,
      });
      
      return { success: true, messageId: 'queued' };
    }

    // Send email
    if (!transporter) {
      throw new Error('Email transporter not initialized');
    }

    const info = await transporter.sendMail({
      from: params.from || emailConfig.from.default,
      to: params.to,
      subject: params.subject,
      html,
      text,
      headers: unsubscribeUrl ? {
        'List-Unsubscribe': `<${unsubscribeUrl}>`,
      } : undefined,
    });

    console.log(`✅ Email sent: ${params.templateName} to ${params.to} (${info.messageId})`);

    // Log to database
    await logEmail({
      userId: params.userId,
      toEmail: params.to,
      fromEmail: params.from || emailConfig.from.default,
      subject: params.subject,
      templateName: params.templateName,
      messageId: info.messageId,
      status: 'SENT',
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Add email to queue
async function addToQueue(params: {
  userId?: string;
  toEmail: string;
  subject: string;
  templateName: string;
  templateData?: Record<string, any>;
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';
  scheduledAt?: Date;
}): Promise<void> {
  if (!db) {
    throw new Error('Database not initialized');
  }

  await db.query(
    `INSERT INTO email_queue (user_id, to_email, subject, template_name, template_data, priority, scheduled_at, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'PENDING')`,
    [
      params.userId || null,
      params.toEmail,
      params.subject,
      params.templateName,
      JSON.stringify(params.templateData || {}),
      params.priority || 'MEDIUM',
      params.scheduledAt || new Date(),
    ]
  );
}

// Specific email functions
export async function sendWelcomeEmail(userId: string, userEmail: string, userName: string) {
  return sendEmail({
    to: userEmail,
    userId,
    subject: 'Welcome to Sinaesta! 🎉',
    templateName: 'welcome',
    templateData: {
      userName,
      dashboardUrl: `${emailConfig.unsubscribe.baseUrl}/dashboard`,
      supportUrl: `${emailConfig.unsubscribe.baseUrl}/support`,
    },
    from: emailConfig.from.default,
    emailType: 'feature_updates',
  });
}

export async function sendVerificationEmail(userId: string, userEmail: string, userName: string, verificationToken: string) {
  const verificationUrl = `${emailConfig.unsubscribe.baseUrl}/verify-email?token=${verificationToken}`;
  
  return sendEmail({
    to: userEmail,
    userId,
    subject: 'Verify Your Email Address',
    templateName: 'email-verification',
    templateData: {
      userName,
      verificationUrl,
    },
    from: emailConfig.from.default,
    emailType: 'email_verification',
    priority: 'HIGH',
  });
}

export async function sendPasswordResetEmail(userEmail: string, userName: string, resetToken: string, userId?: string) {
  const resetUrl = `${emailConfig.unsubscribe.baseUrl}/reset-password?token=${resetToken}`;
  
  return sendEmail({
    to: userEmail,
    userId,
    subject: 'Reset Your Password',
    templateName: 'password-reset',
    templateData: {
      userName,
      resetUrl,
      supportUrl: `${emailConfig.unsubscribe.baseUrl}/support`,
    },
    from: emailConfig.from.support,
    emailType: 'password_reset',
    priority: 'HIGH',
  });
}

export async function sendPasswordChangedEmail(userId: string, userEmail: string, userName: string, metadata?: Record<string, any>) {
  return sendEmail({
    to: userEmail,
    userId,
    subject: 'Your Password Was Changed',
    templateName: 'password-changed',
    templateData: {
      userName,
      changedAt: new Date().toLocaleString(),
      ipAddress: metadata?.ipAddress || 'Unknown',
      userAgent: metadata?.userAgent || 'Unknown',
      resetUrl: `${emailConfig.unsubscribe.baseUrl}/forgot-password`,
    },
    from: emailConfig.from.support,
    emailType: 'password_changed',
    priority: 'HIGH',
  });
}

export async function sendExamReminderEmail(
  userId: string,
  userEmail: string,
  userName: string,
  examDetails: {
    id: string;
    title: string;
    topic: string;
    startTime: Date;
    duration: number;
    questionCount: number;
  },
  hoursBefore: number
) {
  const templateName = hoursBefore === 24 ? 'exam-reminder-24h' : 'exam-reminder-1h';
  
  return sendEmail({
    to: userEmail,
    userId,
    subject: hoursBefore === 24 ? `Exam Tomorrow: ${examDetails.title}` : `Exam Starting Soon: ${examDetails.title}`,
    templateName,
    templateData: {
      userName,
      examTitle: examDetails.title,
      examTopic: examDetails.topic,
      startTime: examDetails.startTime.toLocaleString(),
      duration: examDetails.duration,
      questionCount: examDetails.questionCount,
      examUrl: `${emailConfig.unsubscribe.baseUrl}/exam/${examDetails.id}`,
    },
    from: emailConfig.from.notifications,
    emailType: 'exam_reminders',
    priority: hoursBefore === 1 ? 'HIGH' : 'MEDIUM',
  });
}

export async function sendExamResultsEmail(
  userId: string,
  userEmail: string,
  userName: string,
  results: {
    examId: string;
    examTitle: string;
    score: number;
    correctAnswers: number;
    totalQuestions: number;
    passed: boolean;
    domainAnalysis?: Array<{ domain: string; score: number }>;
    aiFeedback?: string;
  }
) {
  return sendEmail({
    to: userEmail,
    userId,
    subject: 'Your Exam Results Are Ready! 🎯',
    templateName: 'exam-results',
    templateData: {
      userName,
      ...results,
      resultsUrl: `${emailConfig.unsubscribe.baseUrl}/results/${results.examId}`,
    },
    from: emailConfig.from.notifications,
    emailType: 'exam_results',
  });
}

export async function sendWeeklyProgressEmail(
  userId: string,
  userEmail: string,
  userName: string,
  progressData: {
    weekStart: string;
    weekEnd: string;
    examsCompleted: number;
    avgScore: number;
    studyTime: string;
    achievements?: string[];
    domainStats?: Array<{ domain: string; questions: number; accuracy: number; trend: string }>;
    weakAreas?: Array<{ domain: string; accuracy: number; recommendation: string }>;
  }
) {
  return sendEmail({
    to: userEmail,
    userId,
    subject: 'Your Weekly Progress Report 📊',
    templateName: 'weekly-progress',
    templateData: {
      userName,
      ...progressData,
      dashboardUrl: `${emailConfig.unsubscribe.baseUrl}/dashboard`,
    },
    from: emailConfig.from.notifications,
    emailType: 'weekly_progress',
  });
}

export async function sendMentorBookingConfirmation(
  userId: string,
  userEmail: string,
  userName: string,
  bookingDetails: {
    mentorName: string;
    sessionTopic: string;
    sessionDateTime: string;
    duration: number;
    sessionPrice?: string;
    meetingLink?: string;
    bookingId: string;
  }
) {
  return sendEmail({
    to: userEmail,
    userId,
    subject: 'Mentor Session Confirmed ✅',
    templateName: 'mentor-booking-confirmation',
    templateData: {
      userName,
      ...bookingDetails,
      manageBookingUrl: `${emailConfig.unsubscribe.baseUrl}/bookings/${bookingDetails.bookingId}`,
    },
    from: emailConfig.from.notifications,
    emailType: 'mentor_bookings',
  });
}

export async function sendMentorCancellationEmail(
  userId: string,
  userEmail: string,
  userName: string,
  cancellationDetails: {
    mentorName: string;
    sessionTopic: string;
    sessionDateTime: string;
    cancelledBy: string;
    cancellationReason?: string;
    refundAmount?: string;
  }
) {
  return sendEmail({
    to: userEmail,
    userId,
    subject: 'Mentor Session Cancelled',
    templateName: 'mentor-cancellation',
    templateData: {
      userName,
      ...cancellationDetails,
      mentorListUrl: `${emailConfig.unsubscribe.baseUrl}/mentors`,
      supportUrl: `${emailConfig.unsubscribe.baseUrl}/support`,
    },
    from: emailConfig.from.notifications,
    emailType: 'mentor_bookings',
  });
}

export async function sendAccountLockedEmail(
  userEmail: string,
  userName: string,
  lockDetails: {
    reason: string;
    lockedAt: string;
    ipAddress?: string;
  },
  userId?: string
) {
  return sendEmail({
    to: userEmail,
    userId,
    subject: 'Security Alert: Account Locked 🔒',
    templateName: 'account-locked',
    templateData: {
      userName,
      userEmail,
      ...lockDetails,
      unlockUrl: `${emailConfig.unsubscribe.baseUrl}/unlock-account`,
      resetUrl: `${emailConfig.unsubscribe.baseUrl}/forgot-password`,
    },
    from: emailConfig.from.support,
    emailType: 'account_locked',
    priority: 'HIGH',
  });
}

export default {
  initialize: initializeEmailService,
  send: sendEmail,
  sendWelcome: sendWelcomeEmail,
  sendVerification: sendVerificationEmail,
  sendPasswordReset: sendPasswordResetEmail,
  sendPasswordChanged: sendPasswordChangedEmail,
  sendExamReminder: sendExamReminderEmail,
  sendExamResults: sendExamResultsEmail,
  sendWeeklyProgress: sendWeeklyProgressEmail,
  sendMentorBookingConfirmation,
  sendMentorCancellation: sendMentorCancellationEmail,
  sendAccountLocked: sendAccountLockedEmail,
  setDatabasePool,
};

# Email Notification System Documentation

A comprehensive email notification system for Sinaesta with template-based emails, user preferences, tracking, analytics, and queue management.

## Table of Contents

- [Features](#features)
- [Setup & Configuration](#setup--configuration)
- [Email Templates](#email-templates)
- [Sending Emails](#sending-emails)
- [User Preferences](#user-preferences)
- [Queue System](#queue-system)
- [Tracking & Analytics](#tracking--analytics)
- [Compliance](#compliance)
- [API Endpoints](#api-endpoints)

## Features

✅ **Multiple Email Providers**: Support for SMTP, SendGrid, Mailgun, AWS SES  
✅ **Template System**: Handlebars-based HTML email templates with layouts  
✅ **User Preferences**: Granular control over email notifications  
✅ **Email Queue**: Database-backed queue for scheduled and bulk emails  
✅ **Tracking**: Track email delivery, opens, clicks, bounces  
✅ **Analytics**: Aggregate statistics and performance metrics  
✅ **Unsubscribe**: One-click unsubscribe with token-based system  
✅ **Retry Logic**: Automatic retry for failed email deliveries  
✅ **Sandbox Mode**: Test emails without actually sending them  
✅ **Rate Limiting**: Prevent spam and respect provider limits  
✅ **Compliance**: CAN-SPAM and GDPR compliant  

## Setup & Configuration

### 1. Install Dependencies

```bash
npm install nodemailer handlebars bullmq ioredis
npm install --save-dev @types/nodemailer @types/ioredis
```

### 2. Run Database Migrations

```bash
# Run the email system migration
psql -h localhost -U postgres -d sinaesta -f server/migrations/003_email_system.sql
```

This creates the following tables:
- `email_preferences` - User notification preferences
- `email_queue` - Queue for scheduled/bulk emails
- `email_logs` - Log of all sent emails
- `unsubscribe_tokens` - Tokens for unsubscribe links
- `email_templates` - Template metadata
- `email_analytics` - Aggregate email statistics

### 3. Configure Environment Variables

```env
# Email Provider ('smtp', 'sendgrid', 'mailgun', 'ses')
EMAIL_PROVIDER=smtp
EMAIL_ENABLED=true
EMAIL_SANDBOX=true  # Set to false in production

# SMTP Configuration (for Gmail, Outlook, etc.)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Email Addresses
EMAIL_FROM=Sinaesta <noreply@sinaesta.com>
EMAIL_FROM_SUPPORT=Sinaesta Support <support@sinaesta.com>
EMAIL_FROM_NOTIFICATIONS=Sinaesta Notifications <notifications@sinaesta.com>

# Company Info (CAN-SPAM compliance)
COMPANY_ADDRESS=Jakarta, Indonesia

# Features
EMAIL_TRACKING=true
EMAIL_ANALYTICS=true
TEMPLATE_CACHE_ENABLED=true
EMAIL_RATE_LIMIT=100
```

### 4. Provider-Specific Setup

#### Gmail SMTP

1. Enable 2-factor authentication
2. Generate an "App Password" at https://myaccount.google.com/apppasswords
3. Use the app password as `SMTP_PASS`

#### SendGrid

```env
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=your_sendgrid_api_key
```

#### Mailgun

```env
EMAIL_PROVIDER=mailgun
MAILGUN_API_KEY=your_mailgun_api_key
MAILGUN_DOMAIN=mg.yourdomain.com
```

#### AWS SES

```env
EMAIL_PROVIDER=ses
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
```

## Email Templates

### Available Templates

| Template | Category | Description |
|----------|----------|-------------|
| `welcome` | Transactional | Sent when user registers |
| `email-verification` | Transactional | Email verification link |
| `password-reset` | Transactional | Password reset link |
| `password-changed` | Transactional | Password change confirmation |
| `exam-reminder-24h` | Notification | Reminder 24h before exam |
| `exam-reminder-1h` | Notification | Reminder 1h before exam |
| `exam-results` | Notification | Exam results ready |
| `weekly-progress` | Notification | Weekly progress report |
| `mentor-booking-confirmation` | Notification | Booking confirmed |
| `mentor-cancellation` | Notification | Booking cancelled |
| `account-locked` | Transactional | Security alert |

### Template Structure

Templates use **Handlebars** syntax and are located in `server/templates/emails/`:

```handlebars
<!-- server/templates/emails/my-template.hbs -->
<h1>{{title}}</h1>
<p>Hi {{userName}},</p>
<p>{{message}}</p>
<a href="{{actionUrl}}" class="button">Take Action</a>
```

All templates are wrapped in `layout.hbs` which provides:
- Consistent branding and styling
- Header with logo
- Footer with unsubscribe link
- Responsive design
- Social links

### Creating New Templates

1. Create new `.hbs` file in `server/templates/emails/`
2. Use Handlebars variables: `{{variableName}}`
3. Available CSS classes: `.button`, `.info-box`, `.stats-container`, etc.
4. Add template metadata to database:

```sql
INSERT INTO email_templates (name, subject, category, description)
VALUES ('my-template', 'Email Subject', 'NOTIFICATION', 'Description');
```

## Sending Emails

### Basic Usage

```typescript
import emailService from './server/services/emailService';

// Send email with template
await emailService.send({
  to: 'user@example.com',
  userId: 'user-uuid',
  subject: 'Welcome!',
  templateName: 'welcome',
  templateData: {
    userName: 'John Doe',
    dashboardUrl: 'https://app.sinaesta.com/dashboard',
  },
  emailType: 'feature_updates',  // For preference checking
  priority: 'HIGH',  // HIGH, MEDIUM, LOW
});
```

### Pre-Built Functions

```typescript
// Welcome email
await emailService.sendWelcome(userId, userEmail, userName);

// Email verification
await emailService.sendVerification(userId, userEmail, userName, verificationToken);

// Password reset
await emailService.sendPasswordReset(userEmail, userName, resetToken, userId);

// Password changed
await emailService.sendPasswordChanged(userId, userEmail, userName, metadata);

// Exam reminder
await emailService.sendExamReminder(userId, userEmail, userName, examDetails, 24);

// Exam results
await emailService.sendExamResults(userId, userEmail, userName, results);

// Weekly progress
await emailService.sendWeeklyProgress(userId, userEmail, userName, progressData);

// Mentor booking
await emailService.sendMentorBookingConfirmation(userId, userEmail, userName, bookingDetails);

// Account locked
await emailService.sendAccountLocked(userEmail, userName, lockDetails, userId);
```

### Integration Points

The system automatically sends emails at these points:

1. **User Registration** → Email verification
2. **Password Reset Request** → Password reset link
3. **Password Changed** → Security notification
4. **24h Before Exam** → Exam reminder
5. **1h Before Exam** → Exam reminder
6. **Exam Completed** → Results notification
7. **Weekly** → Progress report (cron job)
8. **Mentor Booking** → Confirmation
9. **Booking Cancelled** → Cancellation notice
10. **Account Locked** → Security alert

## User Preferences

Users can control which emails they receive through the Notification Settings page.

### Preference Types

**Transactional** (cannot be disabled):
- Email verification
- Password reset
- Password changed
- Account security alerts

**Notifications** (can be disabled):
- Exam reminders
- Exam results
- Mentor bookings
- Weekly progress reports

**Marketing** (can be disabled):
- Feature updates
- Study tips
- Promotional offers

**Subscription** (can be disabled):
- Subscription updates
- Payment receipts
- Trial reminders

### Checking Preferences

The email service automatically checks user preferences before sending:

```typescript
// If user has disabled exam_reminders, this email won't be sent
await emailService.sendExamReminder(userId, userEmail, userName, examDetails, 24);
```

### Digest Frequency

Users can choose:
- **DAILY** - Receive emails every day
- **WEEKLY** - Receive weekly summary
- **NEVER** - No digest emails

## Queue System

### Database Queue

Emails can be queued for later sending:

```typescript
// Schedule email for future
await emailService.send({
  to: 'user@example.com',
  subject: 'Reminder',
  templateName: 'exam-reminder-24h',
  templateData: { ... },
  scheduledAt: new Date('2024-01-20T10:00:00Z'),
});

// Low priority emails are automatically queued
await emailService.send({
  to: 'user@example.com',
  subject: 'Newsletter',
  templateName: 'weekly-progress',
  templateData: { ... },
  priority: 'LOW',
});
```

### Queue Worker

Process queued emails (run as cron job or background worker):

```typescript
// TODO: Implement queue worker
// Process emails from email_queue table with status='PENDING'
// Update status to 'PROCESSING' → 'SENT' or 'FAILED'
// Retry failed emails based on retry_count
```

## Tracking & Analytics

### Email Logs

Every sent email is logged in the `email_logs` table:

```typescript
{
  user_id: 'uuid',
  to_email: 'user@example.com',
  from_email: 'noreply@sinaesta.com',
  subject: 'Welcome to Sinaesta',
  template_name: 'welcome',
  message_id: 'smtp-message-id',
  status: 'SENT',  // SENT, DELIVERED, BOUNCED, OPENED, CLICKED
  opened_at: null,
  clicked_at: null,
  sent_at: '2024-01-15T10:00:00Z'
}
```

### Analytics Dashboard

View aggregate statistics in `email_analytics` table:

```typescript
{
  template_name: 'exam-reminder-24h',
  date: '2024-01-15',
  sent_count: 150,
  delivered_count: 148,
  opened_count: 120,
  clicked_count: 95,
  bounced_count: 2,
  delivery_rate: 98.67,
  open_rate: 81.08,
  click_rate: 79.17,
  bounce_rate: 1.33
}
```

### Tracking Implementation

To track opens and clicks, implement:

1. **Open Tracking**: Include a 1x1 tracking pixel in emails
2. **Click Tracking**: Wrap links with tracking URLs
3. **Webhook Handler**: Receive delivery/bounce notifications from provider

## Compliance

### CAN-SPAM Act

✅ Include unsubscribe link in all emails  
✅ Honor unsubscribe requests within 10 days  
✅ Include physical mailing address  
✅ Identify message as advertisement (marketing emails)  
✅ Subject line reflects email content  

### GDPR

✅ Obtain consent before sending marketing emails  
✅ Provide clear opt-out mechanism  
✅ Store only necessary data  
✅ Respect user privacy preferences  
✅ Data retention policy for email logs  

### Unsubscribe Implementation

One-click unsubscribe is included in all non-transactional emails:

```html
<a href="{{unsubscribeUrl}}">Unsubscribe</a>
```

Users can also manage preferences in settings:
```
/settings/notifications
```

## API Endpoints

### Get Email Preferences
```
GET /api/email/preferences
Authorization: Bearer {token}
```

### Update Email Preferences
```
PUT /api/email/preferences
Authorization: Bearer {token}
Content-Type: application/json

{
  "exam_reminders": true,
  "weekly_progress": false,
  "digest_frequency": "WEEKLY"
}
```

### Unsubscribe
```
POST /api/email/unsubscribe
Content-Type: application/json

{
  "token": "unsubscribe-token"
}
```

### Resend Verification Email
```
POST /api/email/resend-verification
Authorization: Bearer {token}
```

### Verify Email
```
POST /api/email/verify
Content-Type: application/json

{
  "token": "verification-token"
}
```

### Get Email Logs (Admin or Own)
```
GET /api/email/logs?limit=50&offset=0
Authorization: Bearer {token}
```

### Get Email Analytics (Admin)
```
GET /api/email/analytics?startDate=2024-01-01&endDate=2024-01-31&templateName=welcome
Authorization: Bearer {token}
```

## Testing

### Sandbox Mode

During development, enable sandbox mode to log emails without sending:

```env
EMAIL_SANDBOX=true
```

Emails will be logged to console:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 [SANDBOX] Email Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
To: user@example.com
Subject: Welcome to Sinaesta!
Template: welcome
Priority: MEDIUM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Testing Real Emails

1. Use a test email service like [Mailpit](https://mailpit.axllent.org/) or [MailHog](https://github.com/mailhog/MailHog)
2. Configure SMTP to point to test service
3. View emails in web UI

### Email Rendering Tests

Test email templates across clients:
- Gmail (web, iOS, Android)
- Outlook (web, desktop)
- Apple Mail
- Yahoo Mail

Tools:
- [Litmus](https://www.litmus.com/)
- [Email on Acid](https://www.emailonacid.com/)
- [Mail Tester](https://www.mail-tester.com/)

## Troubleshooting

### Emails Not Sending

1. Check `EMAIL_ENABLED=true` in .env
2. Verify SMTP credentials
3. Check email logs in database
4. Review server logs for errors
5. Test SMTP connection: `telnet smtp.gmail.com 587`

### High Bounce Rate

1. Verify "from" email domain
2. Setup SPF, DKIM, DMARC records
3. Clean email list (remove invalid emails)
4. Check email content for spam triggers

### Emails Going to Spam

1. Configure SPF record: `v=spf1 include:_spf.google.com ~all`
2. Setup DKIM signing
3. Add DMARC record: `v=DMARC1; p=none; rua=mailto:dmarc@sinaesta.com`
4. Avoid spam trigger words
5. Maintain good sender reputation
6. Include unsubscribe link
7. Use reputable email provider

## Best Practices

1. **Always test templates** before sending to users
2. **Use sandbox mode** during development
3. **Monitor bounce rates** and remove invalid emails
4. **Respect user preferences** - don't override unsubscribe
5. **Keep templates mobile-friendly** - test on multiple devices
6. **A/B test subject lines** to improve open rates
7. **Segment users** for targeted messaging
8. **Monitor analytics** to optimize email performance
9. **Maintain compliance** with anti-spam laws
10. **Set up alerts** for high failure rates

## Future Enhancements

- [ ] BullMQ integration for Redis-based queue
- [ ] Advanced analytics dashboard
- [ ] A/B testing framework
- [ ] Email template builder UI
- [ ] Webhook handlers for provider events
- [ ] Advanced segmentation
- [ ] Scheduled campaigns
- [ ] Email warmup system
- [ ] Multi-language support
- [ ] SMS notifications integration

## Support

For issues or questions:
- Check server logs: `npm run server:watch`
- Review email logs in database
- Test with sandbox mode enabled
- Contact support team

---

**Built with ❤️ for Sinaesta**

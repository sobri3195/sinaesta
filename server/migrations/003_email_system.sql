-- Email Notification Preferences table
CREATE TABLE IF NOT EXISTS email_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  
  -- Transactional emails (cannot be disabled)
  email_verification BOOLEAN DEFAULT TRUE,
  password_reset BOOLEAN DEFAULT TRUE,
  password_changed BOOLEAN DEFAULT TRUE,
  account_locked BOOLEAN DEFAULT TRUE,
  
  -- Notification emails (can be disabled)
  exam_reminders BOOLEAN DEFAULT TRUE,
  exam_results BOOLEAN DEFAULT TRUE,
  mentor_bookings BOOLEAN DEFAULT TRUE,
  weekly_progress BOOLEAN DEFAULT TRUE,
  
  -- Marketing/promotional emails
  feature_updates BOOLEAN DEFAULT TRUE,
  study_tips BOOLEAN DEFAULT FALSE,
  promotional BOOLEAN DEFAULT FALSE,
  
  -- Subscription/payment emails
  subscription_updates BOOLEAN DEFAULT TRUE,
  payment_receipts BOOLEAN DEFAULT TRUE,
  trial_reminders BOOLEAN DEFAULT TRUE,
  
  -- Frequency settings
  digest_frequency VARCHAR(20) DEFAULT 'WEEKLY', -- DAILY, WEEKLY, NEVER
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Email Queue table (for tracking queued emails)
CREATE TABLE IF NOT EXISTS email_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  to_email VARCHAR(255) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  template_name VARCHAR(100) NOT NULL,
  template_data JSONB,
  
  -- Priority: HIGH, MEDIUM, LOW
  priority VARCHAR(20) DEFAULT 'MEDIUM',
  
  -- Status: PENDING, PROCESSING, SENT, FAILED, CANCELLED
  status VARCHAR(20) DEFAULT 'PENDING',
  
  -- Retry logic
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  last_error TEXT,
  
  -- Scheduling
  scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Email Logs table (for tracking all sent emails)
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  to_email VARCHAR(255) NOT NULL,
  from_email VARCHAR(255) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  template_name VARCHAR(100) NOT NULL,
  
  -- Status: SENT, DELIVERED, BOUNCED, COMPLAINED, OPENED, CLICKED
  status VARCHAR(20) DEFAULT 'SENT',
  
  -- Tracking
  message_id VARCHAR(255) UNIQUE,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  bounced_at TIMESTAMP WITH TIME ZONE,
  bounce_reason TEXT,
  complained_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  metadata JSONB,
  
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Unsubscribe Tokens table (for one-click unsubscribe)
CREATE TABLE IF NOT EXISTS unsubscribe_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  email_type VARCHAR(100), -- null means unsubscribe from all
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Email Templates Cache table (for caching compiled templates)
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  subject VARCHAR(500) NOT NULL,
  category VARCHAR(50) NOT NULL, -- TRANSACTIONAL, NOTIFICATION, MARKETING
  description TEXT,
  
  -- Template versions
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- A/B testing
  variant VARCHAR(50) DEFAULT 'default',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Email Analytics table (aggregate stats)
CREATE TABLE IF NOT EXISTS email_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name VARCHAR(100) NOT NULL,
  date DATE NOT NULL,
  
  -- Counts
  sent_count INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  bounced_count INTEGER DEFAULT 0,
  complained_count INTEGER DEFAULT 0,
  unsubscribed_count INTEGER DEFAULT 0,
  
  -- Rates (calculated)
  delivery_rate DECIMAL(5, 2),
  open_rate DECIMAL(5, 2),
  click_rate DECIMAL(5, 2),
  bounce_rate DECIMAL(5, 2),
  complaint_rate DECIMAL(5, 2),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE (template_name, date)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_preferences_user_id ON email_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_queue(status);
CREATE INDEX IF NOT EXISTS idx_email_queue_scheduled_at ON email_queue(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_email_queue_user_id ON email_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_user_id ON email_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_message_id ON email_logs(message_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON email_logs(sent_at);
CREATE INDEX IF NOT EXISTS idx_unsubscribe_tokens_token ON unsubscribe_tokens(token);
CREATE INDEX IF NOT EXISTS idx_unsubscribe_tokens_user_id ON unsubscribe_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_email_templates_name ON email_templates(name);
CREATE INDEX IF NOT EXISTS idx_email_analytics_template_date ON email_analytics(template_name, date);

-- Create triggers for updated_at
CREATE TRIGGER update_email_preferences_updated_at BEFORE UPDATE ON email_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_queue_updated_at BEFORE UPDATE ON email_queue
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON email_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_analytics_updated_at BEFORE UPDATE ON email_analytics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default email templates metadata
INSERT INTO email_templates (name, subject, category, description) VALUES
  ('welcome', 'Welcome to Sinaesta!', 'TRANSACTIONAL', 'Sent when a user registers'),
  ('email-verification', 'Verify Your Email Address', 'TRANSACTIONAL', 'Email verification link'),
  ('password-reset', 'Reset Your Password', 'TRANSACTIONAL', 'Password reset link'),
  ('password-changed', 'Your Password Was Changed', 'TRANSACTIONAL', 'Confirmation of password change'),
  ('exam-reminder-24h', 'Exam Tomorrow: {{examTitle}}', 'NOTIFICATION', 'Reminder 24 hours before exam'),
  ('exam-reminder-1h', 'Exam Starting Soon: {{examTitle}}', 'NOTIFICATION', 'Reminder 1 hour before exam'),
  ('exam-results', 'Your Exam Results Are Ready', 'NOTIFICATION', 'Exam results notification'),
  ('weekly-progress', 'Your Weekly Progress Report', 'NOTIFICATION', 'Weekly summary of activities'),
  ('mentor-booking-confirmation', 'Mentor Session Confirmed', 'NOTIFICATION', 'Booking confirmation'),
  ('mentor-cancellation', 'Mentor Session Cancelled', 'NOTIFICATION', 'Cancellation notice'),
  ('subscription-confirmation', 'Subscription Activated', 'NOTIFICATION', 'Subscription confirmation'),
  ('payment-receipt', 'Payment Receipt', 'NOTIFICATION', 'Payment receipt/invoice'),
  ('trial-ending', 'Your Trial Ends Soon', 'NOTIFICATION', 'Trial ending reminder'),
  ('account-locked', 'Account Security Alert', 'TRANSACTIONAL', 'Account locked warning')
ON CONFLICT (name) DO NOTHING;

-- Function to create default preferences for new users
CREATE OR REPLACE FUNCTION create_default_email_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO email_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically create email preferences for new users
CREATE TRIGGER create_email_preferences_on_user_creation
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_email_preferences();

-- Add email_verified column to users table if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token_expires TIMESTAMP WITH TIME ZONE;

-- Create index on verification token
CREATE INDEX IF NOT EXISTS idx_users_verification_token ON users(verification_token);

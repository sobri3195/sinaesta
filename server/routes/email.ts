import { Router } from 'express';
import { query } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Get user email preferences
router.get('/preferences', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.userId;

    const result = await query(
      'SELECT * FROM email_preferences WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      // Return default preferences if none exist
      return res.json({
        email_verification: true,
        password_reset: true,
        password_changed: true,
        account_locked: true,
        exam_reminders: true,
        exam_results: true,
        mentor_bookings: true,
        weekly_progress: true,
        feature_updates: true,
        study_tips: false,
        promotional: false,
        subscription_updates: true,
        payment_receipts: true,
        trial_reminders: true,
        digest_frequency: 'WEEKLY',
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching email preferences:', error);
    res.status(500).json({ error: 'Failed to fetch email preferences' });
  }
});

// Update user email preferences
router.put('/preferences', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.userId;
    const {
      exam_reminders,
      exam_results,
      mentor_bookings,
      weekly_progress,
      feature_updates,
      study_tips,
      promotional,
      subscription_updates,
      payment_receipts,
      trial_reminders,
      digest_frequency,
    } = req.body;

    // Check if preferences exist
    const existing = await query(
      'SELECT id FROM email_preferences WHERE user_id = $1',
      [userId]
    );

    if (existing.rows.length === 0) {
      // Create new preferences
      const result = await query(
        `INSERT INTO email_preferences (
          user_id, exam_reminders, exam_results, mentor_bookings,
          weekly_progress, feature_updates, study_tips, promotional,
          subscription_updates, payment_receipts, trial_reminders,
          digest_frequency
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *`,
        [
          userId,
          exam_reminders !== undefined ? exam_reminders : true,
          exam_results !== undefined ? exam_results : true,
          mentor_bookings !== undefined ? mentor_bookings : true,
          weekly_progress !== undefined ? weekly_progress : true,
          feature_updates !== undefined ? feature_updates : true,
          study_tips !== undefined ? study_tips : false,
          promotional !== undefined ? promotional : false,
          subscription_updates !== undefined ? subscription_updates : true,
          payment_receipts !== undefined ? payment_receipts : true,
          trial_reminders !== undefined ? trial_reminders : true,
          digest_frequency || 'WEEKLY',
        ]
      );

      return res.json(result.rows[0]);
    }

    // Update existing preferences
    const result = await query(
      `UPDATE email_preferences SET
        exam_reminders = COALESCE($2, exam_reminders),
        exam_results = COALESCE($3, exam_results),
        mentor_bookings = COALESCE($4, mentor_bookings),
        weekly_progress = COALESCE($5, weekly_progress),
        feature_updates = COALESCE($6, feature_updates),
        study_tips = COALESCE($7, study_tips),
        promotional = COALESCE($8, promotional),
        subscription_updates = COALESCE($9, subscription_updates),
        payment_receipts = COALESCE($10, payment_receipts),
        trial_reminders = COALESCE($11, trial_reminders),
        digest_frequency = COALESCE($12, digest_frequency),
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $1
      RETURNING *`,
      [
        userId,
        exam_reminders,
        exam_results,
        mentor_bookings,
        weekly_progress,
        feature_updates,
        study_tips,
        promotional,
        subscription_updates,
        payment_receipts,
        trial_reminders,
        digest_frequency,
      ]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating email preferences:', error);
    res.status(500).json({ error: 'Failed to update email preferences' });
  }
});

// Unsubscribe from email type or all emails
router.post('/unsubscribe', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    // Verify token
    const tokenResult = await query(
      `SELECT user_id, email_type, expires_at, used_at
       FROM unsubscribe_tokens
       WHERE token = $1`,
      [token]
    );

    if (tokenResult.rows.length === 0) {
      return res.status(404).json({ error: 'Invalid token' });
    }

    const tokenData = tokenResult.rows[0];

    if (tokenData.used_at) {
      return res.status(400).json({ error: 'Token has already been used' });
    }

    if (new Date(tokenData.expires_at) < new Date()) {
      return res.status(400).json({ error: 'Token has expired' });
    }

    // Update preferences
    if (tokenData.email_type) {
      // Unsubscribe from specific email type
      await query(
        `UPDATE email_preferences
         SET ${tokenData.email_type} = false
         WHERE user_id = $1`,
        [tokenData.user_id]
      );
    } else {
      // Unsubscribe from all non-transactional emails
      await query(
        `UPDATE email_preferences SET
          exam_reminders = false,
          exam_results = false,
          mentor_bookings = false,
          weekly_progress = false,
          feature_updates = false,
          study_tips = false,
          promotional = false,
          subscription_updates = false,
          trial_reminders = false
         WHERE user_id = $1`,
        [tokenData.user_id]
      );
    }

    // Mark token as used
    await query(
      'UPDATE unsubscribe_tokens SET used_at = CURRENT_TIMESTAMP WHERE token = $1',
      [token]
    );

    res.json({
      success: true,
      message: tokenData.email_type
        ? `Successfully unsubscribed from ${tokenData.email_type} emails`
        : 'Successfully unsubscribed from all marketing emails',
    });
  } catch (error) {
    console.error('Error processing unsubscribe:', error);
    res.status(500).json({ error: 'Failed to process unsubscribe request' });
  }
});

// Get email logs for user (admin or own logs)
router.get('/logs', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    const { limit = 50, offset = 0 } = req.query;

    let queryText: string;
    let queryParams: any[];

    if (userRole === 'SUPER_ADMIN' || userRole === 'PROGRAM_ADMIN') {
      // Admin can see all logs
      queryText = `
        SELECT * FROM email_logs
        ORDER BY sent_at DESC
        LIMIT $1 OFFSET $2
      `;
      queryParams = [limit, offset];
    } else {
      // Users can only see their own logs
      queryText = `
        SELECT * FROM email_logs
        WHERE user_id = $1
        ORDER BY sent_at DESC
        LIMIT $2 OFFSET $3
      `;
      queryParams = [userId, limit, offset];
    }

    const result = await query(queryText, queryParams);

    res.json({
      logs: result.rows,
      total: result.rowCount,
    });
  } catch (error) {
    console.error('Error fetching email logs:', error);
    res.status(500).json({ error: 'Failed to fetch email logs' });
  }
});

// Get email analytics (admin only)
router.get('/analytics', authenticateToken, async (req, res) => {
  try {
    const userRole = req.user?.role;

    if (userRole !== 'SUPER_ADMIN' && userRole !== 'PROGRAM_ADMIN') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { startDate, endDate, templateName } = req.query;

    let queryText = `
      SELECT
        template_name,
        date,
        sent_count,
        delivered_count,
        opened_count,
        clicked_count,
        bounced_count,
        complained_count,
        unsubscribed_count,
        delivery_rate,
        open_rate,
        click_rate,
        bounce_rate,
        complaint_rate
      FROM email_analytics
      WHERE 1=1
    `;

    const queryParams: any[] = [];
    let paramIndex = 1;

    if (startDate) {
      queryText += ` AND date >= $${paramIndex}`;
      queryParams.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      queryText += ` AND date <= $${paramIndex}`;
      queryParams.push(endDate);
      paramIndex++;
    }

    if (templateName) {
      queryText += ` AND template_name = $${paramIndex}`;
      queryParams.push(templateName);
      paramIndex++;
    }

    queryText += ' ORDER BY date DESC LIMIT 100';

    const result = await query(queryText, queryParams);

    res.json({
      analytics: result.rows,
    });
  } catch (error) {
    console.error('Error fetching email analytics:', error);
    res.status(500).json({ error: 'Failed to fetch email analytics' });
  }
});

// Resend verification email
router.post('/resend-verification', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.userId;

    // Get user info
    const userResult = await query(
      'SELECT email, name, email_verified FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    if (user.email_verified) {
      return res.status(400).json({ error: 'Email already verified' });
    }

    // Generate new verification token
    const crypto = await import('crypto');
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Update user with new token
    await query(
      'UPDATE users SET verification_token = $1, verification_token_expires = $2 WHERE id = $3',
      [verificationToken, expiresAt, userId]
    );

    // Send verification email
    const emailService = await import('../services/emailService.js');
    await emailService.sendVerificationEmail(
      userId,
      user.email,
      user.name,
      verificationToken
    );

    res.json({
      success: true,
      message: 'Verification email sent successfully',
    });
  } catch (error) {
    console.error('Error resending verification email:', error);
    res.status(500).json({ error: 'Failed to resend verification email' });
  }
});

// Verify email with token
router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    // Find user with this token
    const userResult = await query(
      `SELECT id, email, name, verification_token_expires
       FROM users
       WHERE verification_token = $1 AND email_verified = false`,
      [token]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Invalid or expired token' });
    }

    const user = userResult.rows[0];

    // Check if token expired
    if (new Date(user.verification_token_expires) < new Date()) {
      return res.status(400).json({ error: 'Token has expired' });
    }

    // Update user as verified
    await query(
      `UPDATE users
       SET email_verified = true,
           verification_token = NULL,
           verification_token_expires = NULL,
           status = 'VERIFIED'
       WHERE id = $1`,
      [user.id]
    );

    // Send welcome email
    const emailService = await import('../services/emailService.js');
    await emailService.sendWelcomeEmail(user.id, user.email, user.name);

    res.json({
      success: true,
      message: 'Email verified successfully',
    });
  } catch (error) {
    console.error('Error verifying email:', error);
    res.status(500).json({ error: 'Failed to verify email' });
  }
});

export default router;

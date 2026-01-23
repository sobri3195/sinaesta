import { useState, useEffect } from 'react';
import { Mail, Bell, CheckCircle, XCircle, Save, RefreshCw } from 'lucide-react';
import { apiClient } from '../services/apiClient';
import { useAuthStore } from '../stores/authStore';
import { useUIStore } from '../stores/uiStore';

interface EmailPreferences {
  // Transactional emails (cannot be disabled)
  email_verification: boolean;
  password_reset: boolean;
  password_changed: boolean;
  account_locked: boolean;
  
  // Notification emails (can be disabled)
  exam_reminders: boolean;
  exam_results: boolean;
  mentor_bookings: boolean;
  weekly_progress: boolean;
  
  // Marketing/promotional emails
  feature_updates: boolean;
  study_tips: boolean;
  promotional: boolean;
  
  // Subscription/payment emails
  subscription_updates: boolean;
  payment_receipts: boolean;
  trial_reminders: boolean;
  
  // Frequency settings
  digest_frequency: 'DAILY' | 'WEEKLY' | 'NEVER';
}

export default function NotificationSettings() {
  const { user } = useAuthStore();
  const { addToast } = useUIStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resendingVerification, setResendingVerification] = useState(false);
  const [preferences, setPreferences] = useState<EmailPreferences>({
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

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/email/preferences');
      setPreferences(response.data);
    } catch (error) {
      console.error('Error loading email preferences:', error);
      addToast({
        type: 'error',
        message: 'Failed to load email preferences',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await apiClient.put('/api/email/preferences', preferences);
      addToast({
        type: 'success',
        message: 'Email preferences saved successfully',
      });
    } catch (error) {
      console.error('Error saving email preferences:', error);
      addToast({
        type: 'error',
        message: 'Failed to save email preferences',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      setResendingVerification(true);
      await apiClient.post('/api/email/resend-verification');
      addToast({
        type: 'success',
        message: 'Verification email sent! Check your inbox.',
      });
    } catch (error: any) {
      console.error('Error resending verification:', error);
      addToast({
        type: 'error',
        message: error.response?.data?.error || 'Failed to resend verification email',
      });
    } finally {
      setResendingVerification(false);
    }
  };

  const updatePreference = (key: keyof EmailPreferences, value: any) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Email Notifications</h2>
              <p className="text-sm text-gray-600">Manage your email notification preferences</p>
            </div>
          </div>
        </div>

        {/* Email Verification Status */}
        {user && !user.email_verified && (
          <div className="m-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-900">Verify Your Email</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Please verify your email address to ensure you receive important notifications.
                </p>
                <button
                  onClick={handleResendVerification}
                  disabled={resendingVerification}
                  className="mt-3 px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50 flex items-center gap-2 text-sm"
                >
                  {resendingVerification ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      Resend Verification Email
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="p-6 space-y-8">
          {/* Transactional Emails */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Security & Account</h3>
            <p className="text-sm text-gray-600 mb-4">
              These emails are essential for account security and cannot be disabled.
            </p>
            <div className="space-y-3">
              <PreferenceItem
                icon={<CheckCircle className="w-5 h-5 text-green-500" />}
                title="Email Verification"
                description="Verify your email address when you sign up"
                checked={true}
                disabled={true}
              />
              <PreferenceItem
                icon={<CheckCircle className="w-5 h-5 text-green-500" />}
                title="Password Reset"
                description="Receive password reset links"
                checked={true}
                disabled={true}
              />
              <PreferenceItem
                icon={<CheckCircle className="w-5 h-5 text-green-500" />}
                title="Password Changed"
                description="Get notified when your password is changed"
                checked={true}
                disabled={true}
              />
              <PreferenceItem
                icon={<CheckCircle className="w-5 h-5 text-green-500" />}
                title="Account Security Alerts"
                description="Important security notifications about your account"
                checked={true}
                disabled={true}
              />
            </div>
          </div>

          {/* Learning & Exams */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning & Exams</h3>
            <div className="space-y-3">
              <PreferenceItem
                icon={<Bell className="w-5 h-5 text-blue-500" />}
                title="Exam Reminders"
                description="Get reminded 24 hours and 1 hour before scheduled exams"
                checked={preferences.exam_reminders}
                onChange={(checked) => updatePreference('exam_reminders', checked)}
              />
              <PreferenceItem
                icon={<Bell className="w-5 h-5 text-blue-500" />}
                title="Exam Results"
                description="Receive notifications when your exam results are ready"
                checked={preferences.exam_results}
                onChange={(checked) => updatePreference('exam_results', checked)}
              />
              <PreferenceItem
                icon={<Bell className="w-5 h-5 text-blue-500" />}
                title="Weekly Progress Report"
                description="Get a weekly summary of your learning activities and progress"
                checked={preferences.weekly_progress}
                onChange={(checked) => updatePreference('weekly_progress', checked)}
              />
            </div>
          </div>

          {/* Mentor Sessions */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Mentor Sessions</h3>
            <div className="space-y-3">
              <PreferenceItem
                icon={<Bell className="w-5 h-5 text-purple-500" />}
                title="Booking Confirmations & Cancellations"
                description="Get notified about mentor session bookings and cancellations"
                checked={preferences.mentor_bookings}
                onChange={(checked) => updatePreference('mentor_bookings', checked)}
              />
            </div>
          </div>

          {/* Subscription & Billing */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription & Billing</h3>
            <div className="space-y-3">
              <PreferenceItem
                icon={<Bell className="w-5 h-5 text-green-500" />}
                title="Subscription Updates"
                description="Important updates about your subscription"
                checked={preferences.subscription_updates}
                onChange={(checked) => updatePreference('subscription_updates', checked)}
              />
              <PreferenceItem
                icon={<Bell className="w-5 h-5 text-green-500" />}
                title="Payment Receipts"
                description="Receive receipts and invoices for your payments"
                checked={preferences.payment_receipts}
                onChange={(checked) => updatePreference('payment_receipts', checked)}
              />
              <PreferenceItem
                icon={<Bell className="w-5 h-5 text-green-500" />}
                title="Trial Reminders"
                description="Get notified when your trial period is ending"
                checked={preferences.trial_reminders}
                onChange={(checked) => updatePreference('trial_reminders', checked)}
              />
            </div>
          </div>

          {/* Marketing & Updates */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Marketing & Updates</h3>
            <div className="space-y-3">
              <PreferenceItem
                icon={<Mail className="w-5 h-5 text-indigo-500" />}
                title="Feature Updates"
                description="Learn about new features and improvements"
                checked={preferences.feature_updates}
                onChange={(checked) => updatePreference('feature_updates', checked)}
              />
              <PreferenceItem
                icon={<Mail className="w-5 h-5 text-indigo-500" />}
                title="Study Tips & Best Practices"
                description="Receive helpful study tips and learning strategies"
                checked={preferences.study_tips}
                onChange={(checked) => updatePreference('study_tips', checked)}
              />
              <PreferenceItem
                icon={<Mail className="w-5 h-5 text-indigo-500" />}
                title="Promotional Offers"
                description="Get special offers and promotional content"
                checked={preferences.promotional}
                onChange={(checked) => updatePreference('promotional', checked)}
              />
            </div>
          </div>

          {/* Digest Frequency */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Frequency</h3>
            <p className="text-sm text-gray-600 mb-4">
              Choose how often you want to receive digest emails
            </p>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="digest_frequency"
                  value="DAILY"
                  checked={preferences.digest_frequency === 'DAILY'}
                  onChange={(e) => updatePreference('digest_frequency', e.target.value)}
                  className="w-4 h-4 text-purple-600"
                />
                <div>
                  <div className="font-medium text-gray-900">Daily</div>
                  <div className="text-sm text-gray-600">Receive updates every day</div>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="digest_frequency"
                  value="WEEKLY"
                  checked={preferences.digest_frequency === 'WEEKLY'}
                  onChange={(e) => updatePreference('digest_frequency', e.target.value)}
                  className="w-4 h-4 text-purple-600"
                />
                <div>
                  <div className="font-medium text-gray-900">Weekly</div>
                  <div className="text-sm text-gray-600">Receive a weekly summary</div>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="digest_frequency"
                  value="NEVER"
                  checked={preferences.digest_frequency === 'NEVER'}
                  onChange={(e) => updatePreference('digest_frequency', e.target.value)}
                  className="w-4 h-4 text-purple-600"
                />
                <div>
                  <div className="font-medium text-gray-900">Never</div>
                  <div className="text-sm text-gray-600">Don't send digest emails</div>
                </div>
              </label>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Changes will take effect immediately
            </p>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 flex items-center gap-2 font-medium"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Preferences
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-start gap-3">
          <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
          <div className="text-sm text-gray-600">
            <p className="font-medium text-gray-900 mb-1">About Email Notifications</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>You can unsubscribe from any email type using the link at the bottom of each email</li>
              <li>Security-related emails cannot be disabled to protect your account</li>
              <li>Changes to your preferences take effect immediately</li>
              <li>You can update these settings at any time</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

interface PreferenceItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
}

function PreferenceItem({ icon, title, description, checked, disabled, onChange }: PreferenceItemProps) {
  return (
    <label className={`flex items-start gap-4 p-4 border border-gray-200 rounded-lg ${
      disabled ? 'bg-gray-50 cursor-not-allowed' : 'hover:bg-gray-50 cursor-pointer'
    }`}>
      <div className="mt-0.5">{icon}</div>
      <div className="flex-1">
        <div className="font-medium text-gray-900">{title}</div>
        <div className="text-sm text-gray-600 mt-0.5">{description}</div>
      </div>
      <div className="flex items-center">
        {disabled ? (
          <CheckCircle className="w-5 h-5 text-green-500" />
        ) : (
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange?.(e.target.checked)}
            disabled={disabled}
            className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
          />
        )}
      </div>
    </label>
  );
}

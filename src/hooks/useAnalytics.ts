import { useCallback, useEffect } from 'react';
import { analyticsService } from '../services/analyticsService';

const CONSENT_KEY = 'sinaesta_analytics_consent';

export const useAnalytics = () => {
  useEffect(() => {
    const storedConsent = window.localStorage.getItem(CONSENT_KEY);
    const consentGranted = storedConsent === 'true';
    analyticsService.init(consentGranted);
    analyticsService.instrumentFetch();
  }, []);

  const setConsent = useCallback((consentGranted: boolean) => {
    window.localStorage.setItem(CONSENT_KEY, String(consentGranted));
    analyticsService.setConsent(consentGranted);
  }, []);

  const setUserContext = useCallback((context: { id?: string; role?: string; specialty?: string }) => {
    analyticsService.setUserContext(context);
  }, []);

  const trackView = useCallback((view: string) => {
    analyticsService.trackViewChange(view);
  }, []);

  const trackEvent = useCallback((name: string, properties?: Record<string, unknown>) => {
    analyticsService.trackEvent({ name, properties });
  }, []);

  const trackConversion = useCallback((funnel: string, step: string, properties?: Record<string, unknown>) => {
    analyticsService.trackConversion(funnel, step, properties);
  }, []);

  const trackFeatureUsage = useCallback((feature: string, action: string, properties?: Record<string, unknown>) => {
    analyticsService.trackFeatureUsage(feature, action, properties);
  }, []);

  const assignExperiment = useCallback((name: string, variants: string[]) => {
    return analyticsService.assignExperiment({ name, variants });
  }, []);

  return {
    setConsent,
    setUserContext,
    trackView,
    trackEvent,
    trackConversion,
    trackFeatureUsage,
    assignExperiment,
  };
};

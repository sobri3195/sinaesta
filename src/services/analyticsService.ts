import * as Sentry from '@sentry/react';
import { getCLS, getFID, getINP, getLCP, getTTFB } from 'web-vitals';

type AnalyticsProvider = 'ga4' | 'plausible' | 'disabled';

type AnalyticsEvent = {
  name: string;
  properties?: Record<string, unknown>;
};

type UserContext = {
  id?: string;
  role?: string;
  specialty?: string;
};

type ExperimentConfig = {
  name: string;
  variants: string[];
};

const defaultConfig = {
  provider: (import.meta.env.VITE_ANALYTICS_PROVIDER as AnalyticsProvider) || 'disabled',
  gaMeasurementId: import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined,
  plausibleDomain: import.meta.env.VITE_PLAUSIBLE_DOMAIN as string | undefined,
  plausibleApiHost: (import.meta.env.VITE_PLAUSIBLE_API_HOST as string | undefined) || 'https://plausible.io',
  hotjarId: import.meta.env.VITE_HOTJAR_ID as string | undefined,
  clarityId: import.meta.env.VITE_CLARITY_ID as string | undefined,
  sentryDsn: import.meta.env.VITE_SENTRY_DSN as string | undefined,
  release: (import.meta.env.VITE_RELEASE_VERSION as string | undefined) || import.meta.env.VITE_APP_VERSION,
  bundleBudgetKb: Number(import.meta.env.VITE_BUNDLE_BUDGET_KB || 0),
};

class AnalyticsService {
  private initialized = false;
  private consentGranted = false;
  private userContext: UserContext = {};
  private currentView: string | null = null;
  private viewStart = 0;
  private fetchInstrumented = false;

  init(consentGranted: boolean) {
    if (this.initialized) return;
    this.initialized = true;
    this.consentGranted = consentGranted;

    if (defaultConfig.sentryDsn) {
      Sentry.init({
        dsn: defaultConfig.sentryDsn,
        tracesSampleRate: Number(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE || 0.2),
        release: defaultConfig.release,
        environment: import.meta.env.MODE,
      });
    }

    if (!this.consentGranted) {
      return;
    }

    this.initializeProvider();
    this.trackWebVitals();
    this.trackPageLoadTiming();
    this.trackBundleSizeBudget();
    this.initializeHeatmaps();
  }

  setConsent(consentGranted: boolean) {
    this.consentGranted = consentGranted;
    if (consentGranted) {
      this.initializeProvider();
      this.initializeHeatmaps();
    }
  }

  setUserContext(context: UserContext) {
    this.userContext = { ...this.userContext, ...context };
    if (context.id || context.role) {
      Sentry.setUser({ id: context.id, role: context.role } as Sentry.User);
    }
    if (context.role) {
      Sentry.setTag('user_role', context.role);
    }
    if (context.specialty) {
      Sentry.setTag('user_specialty', context.specialty);
    }

    if (!this.consentGranted) return;

    if (defaultConfig.provider === 'ga4' && typeof window !== 'undefined') {
      window.gtag?.('set', 'user_properties', {
        role: context.role,
        specialty: context.specialty,
      });
    }
  }

  trackPageView(path: string, title?: string) {
    if (!this.consentGranted) return;

    if (defaultConfig.provider === 'ga4') {
      window.gtag?.('event', 'page_view', {
        page_location: window.location.href,
        page_path: path,
        page_title: title,
        ...this.userContext,
      });
    }

    if (defaultConfig.provider === 'plausible') {
      window.plausible?.('pageview', { props: { title, path } });
    }

    Sentry.addBreadcrumb({
      category: 'navigation',
      message: `Page view: ${path}`,
      data: { title },
      level: 'info',
    });
  }

  trackViewChange(nextView: string) {
    const now = Date.now();
    if (this.currentView && this.viewStart) {
      const durationMs = now - this.viewStart;
      this.trackEvent({
        name: 'view_duration',
        properties: {
          view: this.currentView,
          durationMs,
        },
      });
    }
    this.currentView = nextView;
    this.viewStart = now;
    this.trackPageView(nextView, `View: ${nextView}`);
  }

  trackEvent(event: AnalyticsEvent) {
    if (!this.consentGranted) return;

    const payload = {
      ...event.properties,
      ...this.userContext,
    };

    if (defaultConfig.provider === 'ga4') {
      window.gtag?.('event', event.name, payload);
    }

    if (defaultConfig.provider === 'plausible') {
      window.plausible?.(event.name, { props: payload });
    }

    Sentry.addBreadcrumb({
      category: 'ui.action',
      message: event.name,
      data: payload,
      level: 'info',
    });
  }

  trackConversion(funnel: string, step: string, properties?: Record<string, unknown>) {
    this.trackEvent({
      name: 'conversion_step',
      properties: {
        funnel,
        step,
        ...properties,
      },
    });
  }

  trackFeatureUsage(feature: string, action: string, properties?: Record<string, unknown>) {
    this.trackEvent({
      name: 'feature_usage',
      properties: {
        feature,
        action,
        ...properties,
      },
    });
  }

  instrumentFetch() {
    if (this.fetchInstrumented || typeof window === 'undefined') return;
    this.fetchInstrumented = true;

    const originalFetch = window.fetch.bind(window);
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const start = performance.now();
      try {
        const response = await originalFetch(input, init);
        const durationMs = Math.round(performance.now() - start);
        const url = typeof input === 'string' ? input : input.toString();
        if (url.includes('/api')) {
          this.trackEvent({
            name: 'api_response',
            properties: {
              url,
              status: response.status,
              durationMs,
              method: init?.method || 'GET',
            },
          });
        }
        return response;
      } catch (error) {
        const durationMs = Math.round(performance.now() - start);
        const url = typeof input === 'string' ? input : input.toString();
        this.trackEvent({
          name: 'api_error',
          properties: {
            url,
            durationMs,
            method: init?.method || 'GET',
          },
        });
        throw error;
      }
    };
  }

  assignExperiment({ name, variants }: ExperimentConfig) {
    if (typeof window === 'undefined') return variants[0];
    const storageKey = `sinaesta_experiment_${name}`;
    const existing = window.localStorage.getItem(storageKey);
    if (existing && variants.includes(existing)) {
      return existing;
    }
    const variant = variants[Math.floor(Math.random() * variants.length)];
    window.localStorage.setItem(storageKey, variant);
    this.trackEvent({
      name: 'experiment_exposure',
      properties: {
        experiment: name,
        variant,
      },
    });
    return variant;
  }

  private initializeProvider() {
    if (defaultConfig.provider === 'ga4' && defaultConfig.gaMeasurementId) {
      if (!document.getElementById('ga4-script')) {
        const script = document.createElement('script');
        script.id = 'ga4-script';
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${defaultConfig.gaMeasurementId}`;
        document.head.appendChild(script);

        const inlineScript = document.createElement('script');
        inlineScript.id = 'ga4-inline-script';
        inlineScript.innerHTML = `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${defaultConfig.gaMeasurementId}', { send_page_view: false });
        `;
        document.head.appendChild(inlineScript);
      }
    }

    if (defaultConfig.provider === 'plausible' && defaultConfig.plausibleDomain) {
      if (!document.getElementById('plausible-script')) {
        const script = document.createElement('script');
        script.id = 'plausible-script';
        script.defer = true;
        script.setAttribute('data-domain', defaultConfig.plausibleDomain);
        script.src = `${defaultConfig.plausibleApiHost}/js/script.js`;
        document.head.appendChild(script);
      }
    }
  }

  private initializeHeatmaps() {
    if (!this.consentGranted || typeof window === 'undefined') return;

    if (defaultConfig.hotjarId && !document.getElementById('hotjar-script')) {
      const script = document.createElement('script');
      script.id = 'hotjar-script';
      script.innerHTML = `
        (function(h,o,t,j,a,r){
          h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
          h._hjSettings={hjid:${defaultConfig.hotjarId},hjsv:6};
          a=o.getElementsByTagName('head')[0];
          r=o.createElement('script');r.async=1;
          r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
          a.appendChild(r);
        })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
      `;
      document.head.appendChild(script);
    }

    if (defaultConfig.clarityId && !document.getElementById('clarity-script')) {
      const script = document.createElement('script');
      script.id = 'clarity-script';
      script.innerHTML = `
        (function(c,l,a,r,i,t,y){
          c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
          y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "${defaultConfig.clarityId}");
      `;
      document.head.appendChild(script);
    }
  }

  private trackWebVitals() {
    const sendVital = (metric: { name: string; value: number; id: string; rating?: string }) => {
      this.trackEvent({
        name: 'web_vital',
        properties: {
          metric: metric.name,
          value: metric.value,
          id: metric.id,
          rating: metric.rating,
        },
      });
    };

    getCLS(sendVital);
    getFID(sendVital);
    getINP(sendVital);
    getLCP(sendVital);
    getTTFB(sendVital);
  }

  private trackPageLoadTiming() {
    if (!this.consentGranted || typeof window === 'undefined' || !window.performance) return;

    window.addEventListener('load', () => {
      const timing = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
      if (!timing) return;
      this.trackEvent({
        name: 'page_load',
        properties: {
          domComplete: Math.round(timing.domComplete),
          domInteractive: Math.round(timing.domInteractive),
          responseTime: Math.round(timing.responseEnd - timing.requestStart),
          transferSize: timing.transferSize,
        },
      });
    });
  }

  private trackBundleSizeBudget() {
    if (!this.consentGranted || typeof window === 'undefined' || !window.performance) return;
    if (!defaultConfig.bundleBudgetKb) return;

    window.addEventListener('load', () => {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      const scriptResources = resources.filter((entry) => entry.initiatorType === 'script');
      const totalBytes = scriptResources.reduce((sum, entry) => sum + (entry.transferSize || 0), 0);
      const totalKb = totalBytes / 1024;

      if (totalKb > defaultConfig.bundleBudgetKb) {
        this.trackEvent({
          name: 'bundle_budget_exceeded',
          properties: {
            totalKb: Math.round(totalKb),
            budgetKb: defaultConfig.bundleBudgetKb,
          },
        });
        Sentry.captureMessage('Bundle size budget exceeded', {
          level: 'warning',
          tags: { totalKb: totalKb.toFixed(2), budgetKb: String(defaultConfig.bundleBudgetKb) },
        });
      }
    });
  }
}

export const analyticsService = new AnalyticsService();

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: any[]) => void;
    plausible?: (event: string, options?: { props?: Record<string, unknown> }) => void;
  }
}

type Metric = {
  name: string;
  value: number;
  rating?: string;
};

const logMetric = (metric: Metric) => {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.log('[performance]', metric.name, metric.value);
  }
};

export const monitorPerformance = () => {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

  try {
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const entry = entries[entries.length - 1] as PerformanceEntry | undefined;
      if (entry) {
        logMetric({ name: 'LCP', value: entry.startTime });
      }
    });
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

    const clsObserver = new PerformanceObserver((list) => {
      let clsValue = 0;
      for (const entry of list.getEntries()) {
        const shift = entry as any;
        if (!shift.hadRecentInput) {
          clsValue += shift.value || 0;
        }
      }
      if (clsValue > 0) {
        logMetric({ name: 'CLS', value: clsValue });
      }
    });
    clsObserver.observe({ type: 'layout-shift', buffered: true });

    const fidObserver = new PerformanceObserver((list) => {
      const entry = list.getEntries()[0] as any;
      if (entry) {
        logMetric({ name: 'FID', value: entry.processingStart - entry.startTime });
      }
    });
    fidObserver.observe({ type: 'first-input', buffered: true });

    const paintObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          logMetric({ name: 'FCP', value: entry.startTime });
        }
      });
    });
    paintObserver.observe({ type: 'paint', buffered: true });

    const navigationEntries = performance.getEntriesByType('navigation');
    if (navigationEntries.length > 0) {
      const navEntry = navigationEntries[0] as PerformanceNavigationTiming;
      logMetric({ name: 'TTFB', value: navEntry.responseStart });
    }
  } catch {
    // ignore performance observer errors
  }
};

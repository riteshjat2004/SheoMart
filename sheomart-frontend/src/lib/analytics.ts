/**
 * Analytics and event tracking helper (Frontend only).
 * Provides a hook for future analytics integrations (e.g. Google Analytics, PostHog, Mixpanel).
 */
export function trackEvent(eventName: string, metadata?: Record<string, unknown>): void {
  // TODO: Connect to external analytics provider (e.g., PostHog, Google Analytics, Mixpanel)
  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.log(`[Analytics Event] ${eventName}:`, metadata);
  }
}

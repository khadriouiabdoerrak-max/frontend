type TrackingPayload = Record<string, string | number | boolean | string[] | undefined>;

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    ttq?: {
      track?: (event: string, payload?: TrackingPayload) => void;
      page?: () => void;
    };
    snaptr?: (...args: unknown[]) => void;
  }
}

export function trackEvent(eventName: string, payload: TrackingPayload = {}) {
  if (typeof window === "undefined") return;

  window.fbq?.("track", eventName, payload);
  window.ttq?.track?.(eventName, payload);
  window.snaptr?.("track", eventName, payload);
}

export function trackAddToCart(payload: TrackingPayload) {
  trackEvent("AddToCart", payload);
}

export function trackInitiateCheckout(payload: TrackingPayload) {
  trackEvent("InitiateCheckout", payload);
}

export function trackPurchase(payload: TrackingPayload) {
  trackEvent("Purchase", payload);
}

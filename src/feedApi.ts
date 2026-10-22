import type { RssAppConfig } from "./feedTypes";

// RSS feeds generally don't send CORS headers, so this app can't fetch a
// feed URL directly from inside its own iframe — DFM's backend proxies it
// (fetches + parses the XML server-side, returns JSON). `apiBase` is DFM's
// own backend URL, injected into every app's config by AppPreviewFrame.jsx/
// AppRenderer.jsx (not something the settings form itself sets) — this is
// what makes the proxy address work in dev, staging, and prod without this
// app needing its own environment-specific config.
export function buildFeedProxyUrl(config: RssAppConfig): string {
  const base = config.apiBase ?? "http://localhost:5000";
  const params = new URLSearchParams({ url: config.feedUrl });
  return `${base}/apps/fetch-feed?${params.toString()}`;
}

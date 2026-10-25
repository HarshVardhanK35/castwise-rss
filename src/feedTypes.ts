export interface BrandLogoConfig {
  enabled: boolean;
  contentId: string | null;
  url: string;
  position: "top-left" | "top-right" | "bottom-left";
  size: number;
  opacity: number;
}

export interface RssAppConfig {
  layout: "ticker" | "split";
  imageFit: "blurred" | "bars" | "crop";
  feedUrl: string;
  refresh: "5 min" | "15 min" | "30 min" | "1 hour";
  itemCount: number;
  font: string;
  speed: "slow" | "medium" | "fast";
  tickerTheme: "dark" | "light";
  audio: string;
  brandLogo: BrandLogoConfig;
  // Injected by DFM's AppPreviewFrame/AppRenderer, not a real settings-form
  // field — see apiBase comment in feedApi.ts.
  apiBase?: string;
}

// GET /apps/fetch-feed's full response shape is { items: FeedItem[],
// sourceImage: string | null } — sourceImage is the FEED's own channel-
// level logo (RSS <channel><image><url>, Atom <feed><icon>/<logo>), read
// once per response, not per item. Used for the ticker's left-corner badge
// (TickerLayout.vue) — not the same thing as an item's own `image`.

// What GET /apps/fetch-feed actually returns per item — every field the
// backend could reasonably extract, not sliced down to just what this
// app's first layout draft needs (per explicit instruction: easier to
// ignore an unused field later than to re-touch the backend for a new one).
export interface FeedItem {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  guid: string;
  author: string;
  image: string | null;
  categories: string[];
  contentEncoded: string;
}

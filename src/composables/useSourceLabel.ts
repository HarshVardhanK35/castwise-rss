import { computed } from "vue";

// Common two-part TLDs where the registrable-domain label sits a part
// further back than usual (mirror.co.uk -> "mirror", not "co"). Covers the
// realistic set for a news-feed reader, not the full IANA public suffix
// list (thousands of entries) — not worth that dependency just for a
// fallback badge's label.
const MULTI_PART_TLDS = new Set([
  "co.uk",
  "org.uk",
  "ac.uk",
  "gov.uk",
  "co.in",
  "co.jp",
  "co.nz",
  "co.za",
  "co.kr",
  "com.au",
  "net.au",
  "org.au",
  "com.br",
  "com.mx",
  "com.sg",
  "com.hk",
]);

// Fallback label when a feed has no channel-level logo (<channel><image>/
// icon/logo) — shows the feed's own brand name instead of leaving a blank
// gap. Was duplicated identically in TickerLayout.vue and SplitLayout.vue.
// Takes a getter (not the raw string) so it stays reactive to the caller's
// own prop changes, same convention as Vue's own `computed`.
export function useSourceLabel(getFeedUrl: () => string) {
  return computed(() => {
    try {
      const hostname = new URL(getFeedUrl()).hostname;
      const parts = hostname.split(".");
      if (parts.length < 2) return hostname;

      const lastTwo = parts.slice(-2).join(".");
      // mirror.co.uk's last two parts are "co.uk", a known multi-part
      // TLD — the real label is one part further back than usual.
      const labelIndex = MULTI_PART_TLDS.has(lastTwo) && parts.length >= 3
        ? parts.length - 3
        : parts.length - 2;
      return parts[labelIndex];
    } catch {
      return "";
    }
  });
}

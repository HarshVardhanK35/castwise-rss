import { computed } from "vue";

// Fallback label when a feed has no channel-level logo (<channel><image>/
// icon/logo) — shows the feed's own domain instead of leaving a blank gap.
// Was duplicated identically in TickerLayout.vue and SplitLayout.vue.
// Takes a getter (not the raw string) so it stays reactive to the caller's
// own prop changes, same convention as Vue's own `computed`.
export function useSourceLabel(getFeedUrl: () => string) {
  return computed(() => {
    try {
      return new URL(getFeedUrl()).hostname.replace(/^www\./, "");
    } catch {
      return "";
    }
  });
}

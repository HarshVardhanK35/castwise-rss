import { ref, watch } from "vue";

// Probes a URL with a real Image() load — used for two things a feed's
// sourceImage logo needs that CSS background-image alone can't tell you:
// whether it actually loaded (some feeds advertise a channel logo that's
// dead on their own server, e.g. Bloomberg's — background-image has no
// onerror, so a broken one would otherwise render as a blank box forever
// instead of falling back to the domain-name badge), and its real
// naturalWidth/naturalHeight ratio (used to size that badge/fallback to
// the logo's own shape instead of a fixed box, which left visible
// "letterbox" margins around logos whose aspect ratio didn't match —
// tried once, reverted, see daily-log Oct 24/25). One probe covers both,
// instead of loading the same image twice for two separate composables.
// Takes a getter so it stays reactive to the caller's own prop, same
// convention as useSourceLabel.
export function useImageProbe(getUrl: () => string | null) {
  const ok = ref(false);
  const ratio = ref<number | null>(null);
  // Same stale-response-guard shape as App.vue's latestRequestId — a quick
  // sourceImage change isn't guaranteed to resolve in request order, so
  // only the most recently issued probe is allowed to write the result.
  let latestRequestId = 0;

  watch(
    getUrl,
    (url) => {
      const requestId = ++latestRequestId;
      ok.value = false;
      ratio.value = null;
      if (!url) return;

      const probe = new Image();
      probe.onload = () => {
        if (requestId !== latestRequestId) return;
        ok.value = true;
        if (probe.naturalWidth && probe.naturalHeight) {
          ratio.value = probe.naturalWidth / probe.naturalHeight;
        }
      };
      probe.onerror = () => {
        if (requestId === latestRequestId) ok.value = false;
      };
      probe.src = url;
    },
    { immediate: true },
  );

  return { ok, ratio };
}

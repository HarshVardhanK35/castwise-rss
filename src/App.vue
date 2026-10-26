<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { init, updateConfig, watchHostConfig, VERSION as IGNITION_VERSION } from "@castwise/ignition";
import type { RssAppConfig, FeedItem } from "./feedTypes";
import { buildFeedProxyUrl } from "./feedApi";
import RssWidget from "./components/RssWidget.vue";

// Own console prefix, distinct from Ignition's own "[IGNITION]" logs — so
// devtools makes it obvious which layer (this app vs. the engine) a given
// line came from.
const log = (...args: unknown[]) => console.log("[RSS]", ...args);

// Real config comes from DFM over postMessage, not a shared global — same
// reasoning as every other app (different origins in dev, and a real
// deployed app is on yet another origin). Used only when opened directly
// (not embedded), since there's no host to hand a handshake to in that
// case — this demo feed URL is a placeholder, nothing fetches with it
// until a real feedUrl is configured in DFM.
const DEFAULT_CONFIG: RssAppConfig = {
  layout: "ticker",
  imageFit: "crop",
  feedUrl: "",
  refresh: "15 min",
  itemCount: 5,
  font: "Inter",
  speed: "medium",
  tickerTheme: "dark",
  audio: "None",
  brandLogo: {
    enabled: false,
    contentId: null,
    url: "",
    position: "top-left",
    size: 9,
    opacity: 60,
  },
};

const REFRESH_MS: Record<RssAppConfig["refresh"], number> = {
  "5 min": 5 * 60_000,
  "15 min": 15 * 60_000,
  "30 min": 30 * 60_000,
  "1 hour": 60 * 60_000,
};

const appConfig = ref<RssAppConfig>(DEFAULT_CONFIG);
const status = ref<"loading" | "ready" | "error" | "no-url" | "invalid-url">("loading");
const items = ref<FeedItem[]>([]);
const sourceImage = ref<string | null>(null);
let refreshTimer: ReturnType<typeof setInterval> | null = null;
let hasLoadedOnce = false;
let usedHostConfig = false;
// Same stale-response guard as weather's App.vue — a quick DFM live-edit
// (e.g. flipping Layout right after typing a new Feed URL) fires two
// fetches whose network timing isn't guaranteed to resolve in request
// order; only the result from the most recently issued request is applied.
let latestRequestId = 0;

function buildIgnitionConfig(c: RssAppConfig) {
  return {
    appName: "rss",
    ...c,
    api: {
      url: buildFeedProxyUrl(c),
      cacheKey: `rss-${c.feedUrl}`,
      maxAgeMs: REFRESH_MS[c.refresh],
      fallbackData: null,
    },
  };
}

function applyResult(data: unknown) {
  const result = data as { items?: FeedItem[]; sourceImage?: string | null } | null;
  const feedItems = result?.items ?? null;
  if (!feedItems) {
    status.value = "error";
    items.value = [];
    sourceImage.value = null;
    log("no feed data returned — showing error state");
    return;
  }
  items.value = feedItems;
  sourceImage.value = result?.sourceImage ?? null;
  status.value = "ready";
  log(`rendered ${feedItems.length} items`);

  const withImage = feedItems.filter((item) => item.image).length;
  log(
    `images: ${withImage}/${feedItems.length} items have one, sourceImage ${sourceImage.value ? "present" : "none"}`,
    { sourceImage: sourceImage.value, perItem: feedItems.map((item) => ({ title: item.title, image: item.image })) },
  );
}

function resetRefreshTimer() {
  if (refreshTimer) clearInterval(refreshTimer);
  if (!appConfig.value.feedUrl) return;
  log(`scheduling next refresh in ${appConfig.value.refresh}`);
  refreshTimer = setInterval(async () => {
    log("refresh timer fired");
    const requestId = ++latestRequestId;
    const updated = await updateConfig(buildIgnitionConfig(appConfig.value));
    if (requestId !== latestRequestId) {
      log("refresh result superseded by a newer request — discarding");
      return;
    }
    applyResult(updated.data);
  }, REFRESH_MS[appConfig.value.refresh]);
}

async function loadFeed() {
  // No feed URL configured yet — nothing to fetch, show the widget's own
  // empty state instead of calling Ignition with an invalid proxy URL.
  // Resolves synchronously, so no APP_LOADING spinner — just the final
  // APP_LOAD, every time (not just the first), so a feed URL cleared
  // after a real load correctly clears DFM's own spinner state too.
  if (!appConfig.value.feedUrl) {
    log(hasLoadedOnce ? "config changed — no feed URL set" : "no feed URL set yet");
    status.value = "no-url";
    items.value = [];
    sourceImage.value = null;
    hasLoadedOnce = true;
    window.parent?.postMessage({ type: "APP_LOAD" }, "*");
    return;
  }

  let isValidUrl = true;
  try {
    new URL(appConfig.value.feedUrl);
  } catch {
    isValidUrl = false;
  }
  if (!isValidUrl) {
    log("feed URL is not a valid URL — showing invalid-url state");
    status.value = "invalid-url";
    items.value = [];
    sourceImage.value = null;
    hasLoadedOnce = true;
    window.parent?.postMessage({ type: "APP_LOAD" }, "*");
    return;
  }

  log(hasLoadedOnce ? "config changed — reloading" : "loading for the first time");
  // Only on a RELOAD (not the very first load) — DFM's own preview frame
  // already shows its spinner by default until the first APP_LOAD, so
  // this is specifically what makes a later reload (e.g. a new Feed URL +
  // Load) show that same spinner again instead of just sitting on stale
  // content until the new data replaces it.
  if (hasLoadedOnce) {
    window.parent?.postMessage({ type: "APP_LOADING" }, "*");
  }
  const requestId = ++latestRequestId;
  const payload = hasLoadedOnce
    ? await updateConfig(buildIgnitionConfig(appConfig.value))
    : await init(buildIgnitionConfig(appConfig.value));
  if (requestId !== latestRequestId) {
    log("load result superseded by a newer request — discarding");
    return;
  }
  applyResult(payload.data);

  const firstLoad = !hasLoadedOnce;
  hasLoadedOnce = true;
  log("posting APP_LOAD to parent");
  window.parent?.postMessage({ type: "APP_LOAD" }, "*");
  if (firstLoad) {
    console.info(`[RSS | E${IGNITION_VERSION}] bootstrap:mounted`, {
      embedded: window.parent !== window,
      hasHostConfig: usedHostConfig,
      status: status.value,
    });
  }

  resetRefreshTimer();
}

let unwatchHostConfig: (() => void) | null = null;

onMounted(() => {
  log("mounted");

  unwatchHostConfig = watchHostConfig((config) => {
    log("received config from host", config);
    usedHostConfig = true;
    appConfig.value = config as unknown as RssAppConfig;
    loadFeed();
  });

  if (window.parent === window) {
    log("not embedded — using default config");
    loadFeed();
  } else {
    log("embedded — sent APP_READY, waiting for host config");
  }
});

onUnmounted(() => {
  if (refreshTimer) clearInterval(refreshTimer);
  unwatchHostConfig?.();
});
</script>

<template>
  <RssWidget
    v-if="status === 'ready'"
    :config="appConfig"
    :items="items"
    :source-image="sourceImage"
  />
  <div v-else-if="status === 'no-url'" class="state-message">Enter a feed URL in settings.</div>
  <div v-else-if="status === 'invalid-url'" class="state-message">This doesn't look like a valid URL.</div>
  <div v-else-if="status === 'error'" class="state-message">Couldn't load this feed.</div>
</template>

<style scoped>
.state-message {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0d1117;
  color: #8b949e;
  font-size: 1.1rem;
}
</style>

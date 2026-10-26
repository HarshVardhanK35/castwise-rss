<script setup lang="ts">
import { computed } from "vue";
import type { FeedItem, BrandLogoConfig } from "../feedTypes";
import AccentProgressBar from "./AccentProgressBar.vue";
import FeedImage from "./FeedImage.vue";
import { useSourceLabel } from "../composables/useSourceLabel";
import { useImageProbe } from "../composables/useImageProbe";

const props = defineProps<{
  item: FeedItem;
  imageFit: "blurred" | "bars" | "crop";
  tickerTheme: "dark" | "light";
  itemKey: number;
  durationMs: number;
  sourceImage: string | null;
  feedUrl: string;
  brandLogo: BrandLogoConfig;
}>();

// Relative time (e.g. "7 hours ago") — same idea as the approved mock's
// timestamp, computed from the feed's own pubDate rather than hardcoded.
function timeAgo(pubDate: string): string {
  if (!pubDate) return "";
  const then = new Date(pubDate).getTime();
  if (Number.isNaN(then)) return "";
  const diffMs = Date.now() - then;
  const hours = Math.floor(diffMs / 3_600_000);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

const sourceLabel = useSourceLabel(() => props.feedUrl);
const { ok: sourceImageOk, ratio: sourceImageRatio } = useImageProbe(() => props.sourceImage);
const sourceThumbRatio = computed(() => sourceImageRatio.value ?? 3);
</script>

<template>
  <div class="split-layout">
    <div class="image-area">
      <FeedImage
        :item="item"
        :image-fit="imageFit"
        :brand-logo="brandLogo"
        :source-image="sourceImage"
        :feed-url="feedUrl"
      />
    </div>

    <div class="text-panel" :class="tickerTheme">
      <div class="meta-row">
        <div
          v-if="sourceImage && sourceImageOk"
          class="source-thumb"
          role="img"
          :style="{ backgroundImage: `url(${sourceImage})`, aspectRatio: String(sourceThumbRatio) }"
        />
        <span v-else-if="sourceLabel" class="source-fallback">{{ sourceLabel }}</span>
        <span v-else />

        <span v-if="item.pubDate" class="timestamp">{{ timeAgo(item.pubDate) }}</span>
      </div>
      <div class="content-group">
        <h1 class="headline">{{ item.title }}</h1>
        <p v-if="item.description" class="description">{{ item.description }}</p>
      </div>
      <AccentProgressBar :item-key="itemKey" :duration-ms="durationMs" :ticker-theme="tickerTheme" />
    </div>
  </div>
</template>

<style scoped>
.split-layout {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  background: #0d1117;
  overflow: hidden;
}
.image-area {
  position: relative;
  flex: 1.4;
  min-width: 0;
  overflow: hidden;
  container-type: size;
}
/* Tablet (4/3) and mobile (9/16) both stack image-on-top/text-below in the
   approved mock — only desktop's wide 16/9 aspect keeps the side-by-side
   row. Matched on the widget's own aspect ratio (container query), not a
   pixel breakpoint, since this widget's real rendered size can vary
   independent of which preview preset picked the aspect. */
@container (max-aspect-ratio: 4/3) {
  .split-layout {
    flex-direction: column;
  }
  .image-area {
    flex: 1;
    min-height: 0;
  }
}
.text-panel {
  flex: 1;
  min-width: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 2cqh;
  padding: 3cqh 3.5cqw 4cqw;
  background: #0d1117;
  box-sizing: border-box;
}
/* Same "Theme" setting TickerLayout's strip already uses — was Ticker-only
   (the field was hidden whenever Layout was Split), so Split always
   rendered dark regardless of this setting until now. */
.text-panel.light {
  background: #ffffff;
}
.meta-row {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2cqw;
}
.source-thumb {
  flex: none;
  /* Height fixed, width follows the logo's own aspect ratio with no cap —
     a max-width + auto-height "mutual fit" was tried and came out wrong
     in practice (shrank a wide logo's height to a sliver to stay under
     the cap). No cap needed: `.meta-row` just gives the timestamp
     whatever room is left. */
  height: 7cqh;
  width: auto;
  min-width: 48px;
  min-height: 20px;
  box-sizing: border-box;
  padding: 0.8cqh 1cqw;
  /* Backing sized to the logo's own aspect ratio (via inline `aspectRatio`
     style, not a fixed box) — an opaque logo covers it edge-to-edge with
     no visible margin, a transparent dark-on-nothing logo (e.g. the New
     York Times') still shows up against this panel's dark background. */
  background-color: #f4f4f2;
  /* `cover`, not `contain` — the box is already sized to the logo's exact
     aspect ratio, so the two should look identical, but `contain` rounds
     down on a sub-pixel ratio mismatch and leaves a hairline gap of the
     backing color showing on one edge. `cover` rounds the other way
     (crops an imperceptible hairline instead), which never leaves a gap. */
  background-size: cover;
  background-position: center center;
  background-repeat: no-repeat;
}
.source-fallback {
  flex: none;
  color: #e6edf3;
  font-weight: 700;
  font-size: clamp(11px, 2.4cqh, 16px);
}
.text-panel.light .source-fallback {
  color: #0d1117;
}
.content-group {
  display: flex;
  flex-direction: column;
  gap: 1.5cqh;
}
.timestamp {
  color: #8b949e;
  font-size: clamp(11px, 2.4cqh, 16px);
}
.text-panel.light .timestamp {
  color: #52514e;
}
.headline {
  margin: 0;
  color: #e6edf3;
  font-weight: 700;
  line-height: 1.2;
  font-size: clamp(16px, 4.5cqh, 34px);
}
.text-panel.light .headline {
  color: #0d1117;
}
.description {
  margin: 0;
  color: #8b949e;
  line-height: 1.5;
  font-size: clamp(12px, 2.6cqh, 18px);
}
.text-panel.light .description {
  color: #52514e;
}
</style>

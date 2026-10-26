<script setup lang="ts">
import type { FeedItem, BrandLogoConfig } from "../feedTypes";
import BrandLogo from "./BrandLogo.vue";
import { useImageProbe } from "../composables/useImageProbe";
import { useSourceLabel } from "../composables/useSourceLabel";

// The current item's background image (or fallback) + optional blurred
// backdrop + the brand-logo overlay — identical markup/CSS previously
// duplicated between TickerLayout.vue and SplitLayout.vue. Rendered INSIDE
// the parent's own `.image-area` wrapper (that wrapper's positioning
// genuinely differs between Ticker's absolute full-bleed box and Split's
// flex row column, so it stays owned by each parent — only this shared
// inner content moved out).
const props = defineProps<{
  item: FeedItem;
  imageFit: "blurred" | "bars" | "crop";
  brandLogo: BrandLogoConfig;
  sourceImage: string | null;
  feedUrl: string;
}>();

// Two-tier fallback for a feed item with no image of its own (some feeds,
// e.g. Bloomberg's, never include one) — try the channel's own logo first
// (already being fetched for the source badge, so this is free), and only
// drop to the generic icon+label when that's missing or also fails to load
// (Bloomberg again — its advertised logo URL 404s on their own server).
const { ok: sourceImageOk } = useImageProbe(() => props.sourceImage);
const sourceLabel = useSourceLabel(() => props.feedUrl);
</script>

<template>
  <img v-if="item.image" :src="item.image" alt="" class="bg-image" :class="imageFit" />
  <div v-else-if="sourceImage && sourceImageOk" class="bg-fallback logo-fallback">
    <div class="fallback-logo-card">
      <img :src="sourceImage" alt="" class="fallback-logo" />
    </div>
  </div>
  <div v-else class="bg-fallback icon-fallback">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="fallback-icon">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-5-5L5 21" />
    </svg>
    <span v-if="sourceLabel" class="fallback-label">{{ sourceLabel }}</span>
  </div>
  <div
    v-if="imageFit === 'blurred' && item.image"
    class="blur-backdrop"
    :style="{ backgroundImage: `url(${item.image})` }"
  />
  <BrandLogo :logo="brandLogo" />
</template>

<style scoped>
.blur-backdrop {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  filter: blur(24px) brightness(0.6);
  transform: scale(1.1);
  z-index: 0;
}
.bg-image {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
}
.bg-image.crop {
  object-fit: cover;
}
.bg-image.bars,
.bg-image.blurred {
  object-fit: contain;
}
.bg-fallback {
  width: 100%;
  height: 100%;
  background: #161b22;
  display: flex;
  align-items: center;
  justify-content: center;
}
.logo-fallback {
  padding: 12cqmin;
  box-sizing: border-box;
}
/* `<img>` sizes itself to its own natural aspect ratio by default (no
   `object-fit`, no explicit width/height forcing a mismatched box) — this
   wrapper shrink-wraps to that same size (`inline-flex`), so the backing
   color only ever covers exactly the logo's own shape. An opaque logo
   fills it edge-to-edge with no visible margin; a transparent
   dark-on-nothing logo (e.g. the New York Times') still shows up. */
.fallback-logo-card {
  display: inline-flex;
  max-width: 100%;
  max-height: 100%;
  padding: 2.5cqmin 3cqmin;
  background-color: #f4f4f2;
  box-sizing: border-box;
}
.fallback-logo {
  display: block;
  max-width: 100%;
  max-height: 100%;
}
.icon-fallback {
  flex-direction: column;
  gap: 2cqmin;
}
.fallback-icon {
  width: 14cqmin;
  height: 14cqmin;
  min-width: 28px;
  min-height: 28px;
  color: #30363d;
}
.fallback-label {
  color: #484f58;
  font-weight: 700;
  font-size: clamp(11px, 2.4cqmin, 16px);
  text-transform: capitalize;
}
</style>

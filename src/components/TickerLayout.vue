<script setup lang="ts">
import { computed } from "vue";
import type { FeedItem, BrandLogoConfig } from "../feedTypes";
import FeedImage from "./FeedImage.vue";
import { useSourceLabel } from "../composables/useSourceLabel";
import { useImageProbe } from "../composables/useImageProbe";

type Speed = "slow" | "medium" | "fast";

const props = defineProps<{
  item: FeedItem;
  imageFit: "blurred" | "bars" | "crop";
  speed: Speed;
  tickerTheme: "dark" | "light";
  itemKey: number;
  sourceImage: string | null;
  feedUrl: string;
  brandLogo: BrandLogoConfig;
}>();

const emit = defineEmits<{ "scroll-end": [] }>();

const SCROLL_DURATION: Record<Speed, string> = {
  slow: "45s",
  medium: "30s",
  fast: "15s",
};

const scrollDuration = computed(() => SCROLL_DURATION[props.speed]);

const sourceLabel = useSourceLabel(() => props.feedUrl);
const { ok: sourceImageOk, ratio: sourceImageRatio } = useImageProbe(() => props.sourceImage);
// 3:1 default until the probe resolves — close to most news-logo banners,
// avoids a zero-width flash before the real ratio is known.
const sourceThumbRatio = computed(() => sourceImageRatio.value ?? 3);
</script>

<template>
  <div class="ticker-layout">
    <div class="image-area">
      <FeedImage
        :item="item"
        :image-fit="imageFit"
        :brand-logo="brandLogo"
        :source-image="sourceImage"
        :feed-url="feedUrl"
      />
    </div>

    <div class="ticker-strip" :class="tickerTheme">
      <div
        v-if="sourceImage && sourceImageOk"
        class="source-thumb"
        role="img"
        :style="{ backgroundImage: `url(${sourceImage})`, aspectRatio: String(sourceThumbRatio) }"
      />
      <div v-else-if="sourceLabel" class="source-fallback"><span>{{ sourceLabel }}</span></div>

      <div class="ticker-clip">
        <div
          :key="itemKey"
          class="ticker-track"
          :style="{ animationDuration: scrollDuration }"
          @animationend="emit('scroll-end')"
        >
          <span class="headline">{{ item.title }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ticker-layout {
  position: relative;
  width: 100%;
  height: 100%;
  background: #0d1117;
  overflow: hidden;
}
.image-area {
  position: absolute;
  inset: 0;
  overflow: hidden;
  container-type: size;
}
.ticker-strip {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  height: 12cqmin;
  min-height: 38px;
  display: flex;
  align-items: center;
  gap: 0;
  padding-left: 0;
  box-sizing: border-box;
  overflow: hidden;
}
.ticker-strip.dark {
  background: linear-gradient(to bottom, transparent, #0d1117 50%);
}
.ticker-strip.light {
  background: linear-gradient(to bottom, transparent, #ffffff 50%);
}
.source-thumb {
  flex: none;
  /* A fixed height smaller than the full strip (not 100%, which made a
     wide 4:1 logo like Sky News' render far too large — its width scales
     with height × ratio) — same idea as SplitLayout's own 7cqh badge,
     which already looks right. Width follows the logo's own aspect ratio
     with no cap: `.ticker-clip` (flex: 1, overflow: hidden) absorbs
     whatever room this leaves for the headline. */
  height: 8cqmin;
  min-height: 28px;
  width: auto;
  min-width: 48px;
  box-sizing: border-box;
  padding: 1.4cqmin 1.6cqmin;
  /* Backing sized to the logo's own aspect ratio (via inline `aspectRatio`
     style, not a fixed box) so an opaque logo covers it edge-to-edge with
     no visible margin, while a transparent dark-on-nothing logo (e.g. the
     New York Times') still shows up against this app's dark panels. */
  background-color: #f4f4f2;
  /* `cover`, not `contain` — see SplitLayout.vue's `.source-thumb` for why
     (sub-pixel rounding gap between the aspect-ratio-sized box and
     `contain`'s own fit calculation). */
  background-size: cover;
  background-position: center center;
  background-repeat: no-repeat;
  background-origin: content-box;
}
.ticker-strip.light .source-thumb {
  border: 1px solid rgba(13, 17, 23, 0.2);
}
.source-fallback {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18cqmin;
  height: 100%;
  min-width: 64px;
  padding: 0 max(1cqw, 8px);
  box-sizing: border-box;
  background: #ffffff;
  color: #0d1117;
  font-weight: 700;
  font-size: clamp(11px, 2.6cqmin, 18px);
}
/* The ellipsis has to live on this inner span, not the flex container
   itself — a flex item centered via `justify-content: center` clips
   symmetrically from both ends when its content overflows (no ellipsis),
   since `text-overflow` only ever applies to the element whose own content
   is overflowing in normal flow. `min-width: 0` overrides flex's default
   `min-width: auto`, which otherwise refuses to let this span shrink
   below its text's natural width at all. */
.source-fallback span {
  max-width: 100%;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ticker-clip {
  flex: 1;
  min-width: 0;
  height: 100%;
  overflow: hidden;
  display: flex;
  align-items: center;
}
.ticker-track {
  display: inline-flex;
  white-space: nowrap;
  animation-name: scroll-left;
  animation-timing-function: linear;
  animation-iteration-count: 1;
  padding-left: 100%;
}
.headline {
  color: #fff;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
  font-weight: 700;
  font-size: clamp(14px, 4.5cqmin, 32px);
  padding-right: 6cqw;
}
.ticker-strip.light .headline {
  color: #0d1117;
  text-shadow: none;
}
@keyframes scroll-left {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-100%);
  }
}
</style>

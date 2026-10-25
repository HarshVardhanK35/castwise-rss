<script setup lang="ts">
import { computed } from "vue";
import type { FeedItem, BrandLogoConfig } from "../feedTypes";
import FeedImage from "./FeedImage.vue";
import { useSourceLabel } from "../composables/useSourceLabel";

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
</script>

<template>
  <div class="ticker-layout">
    <div class="image-area">
      <FeedImage :item="item" :image-fit="imageFit" :brand-logo="brandLogo" />
    </div>

    <div class="ticker-strip" :class="tickerTheme">
      <div
        v-if="sourceImage"
        class="source-thumb"
        role="img"
        :style="{ backgroundImage: `url(${sourceImage})` }"
      />
      <div v-else-if="sourceLabel" class="source-fallback">{{ sourceLabel }}</div>

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
  width: 18cqmin;
  height: 100%;
  min-width: 64px;
  box-sizing: border-box;
  padding: 0.6cqmin 0;
  background-size: contain;
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

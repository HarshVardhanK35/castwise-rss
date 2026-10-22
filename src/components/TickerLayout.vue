<script setup lang="ts">
import { computed } from "vue";
import type { FeedItem } from "../feedTypes";

type Speed = "slow" | "medium" | "fast";

const props = defineProps<{
  item: FeedItem;
  imageFit: "blurred" | "bars" | "crop";
  speed: Speed;
  accentFrom: string;
  accentTo: string;
  itemKey: number;
  sourceImage: string | null;
}>();

const emit = defineEmits<{ "scroll-end": [] }>();

const SCROLL_DURATION: Record<Speed, string> = {
  slow: "32s",
  medium: "20s",
  fast: "12s",
};

const scrollDuration = computed(() => SCROLL_DURATION[props.speed]);
</script>

<template>
  <div class="ticker-layout">
    <div class="image-area">
      <img v-if="item.image" :src="item.image" alt="" class="bg-image" :class="imageFit" />
      <div v-else class="bg-fallback" />
      <div v-if="imageFit === 'blurred' && item.image" class="blur-backdrop" :style="{ backgroundImage: `url(${item.image})` }" />
    </div>

    <div
      class="ticker-strip"
      :style="{ background: `linear-gradient(90deg, ${accentFrom}, ${accentTo})` }"
    >
      <img v-if="sourceImage" :src="sourceImage" alt="" class="source-thumb" />

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
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #0d1117;
  overflow: hidden;
}
.image-area {
  position: relative;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}
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
.bg-image.bars {
  object-fit: contain;
}
.bg-image.blurred {
  object-fit: contain;
}
.bg-fallback {
  width: 100%;
  height: 100%;
  background: #161b22;
}
.ticker-strip {
  flex: none;
  height: 12cqh;
  min-height: 44px;
  display: flex;
  align-items: center;
  gap: 2cqw;
  padding: 0 3cqw;
  box-sizing: border-box;
  overflow: hidden;
}
.source-thumb {
  flex: none;
  width: 7cqh;
  height: 7cqh;
  min-width: 32px;
  min-height: 32px;
  padding: 1cqh;
  border-radius: 6px;
  background: #fff;
  box-sizing: border-box;
  object-fit: contain;
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
  font-size: clamp(14px, 4.5cqh, 32px);
  padding-right: 6cqw;
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

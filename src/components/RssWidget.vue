<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import type { FeedItem, RssAppConfig } from "../feedTypes";
import TickerLayout from "./TickerLayout.vue";
import SplitLayout from "./SplitLayout.vue";

// Pure rendering component: takes a resolved config + already-fetched feed
// items and draws the widget. Knows nothing about Ignition, postMessage,
// or where the data came from — that wiring lives in App.vue. Same split
// as clock/ClockWidget.vue and weather's own App.vue-does-the-fetching
// pattern.
const props = defineProps<{
  config: RssAppConfig;
  items: FeedItem[];
  sourceImage: string | null;
}>();

// Fixed per item for Split — only the COUNT of items in the rotation is a
// real setting (config.itemCount), how long each one stays on screen isn't
// its own setting. Ticker is different: it advances when its headline
// finishes scrolling (see handleScrollEnd), not on a fixed timer — a short
// headline and a long one shouldn't get the same dwell time.
const ROTATION_MS = 8000;

const index = ref(0);
let timer: ReturnType<typeof setInterval> | null = null;

const rotationItems = computed(() => props.items.slice(0, Math.max(1, props.config.itemCount)));
const currentItem = computed(() => rotationItems.value[index.value] ?? null);

function advance() {
  if (rotationItems.value.length === 0) return;
  index.value = (index.value + 1) % rotationItems.value.length;
}

function startSplitRotation() {
  if (timer) clearInterval(timer);
  if (props.config.layout !== "split" || rotationItems.value.length <= 1) return;
  timer = setInterval(advance, ROTATION_MS);
}

function handleScrollEnd() {
  advance();
}

// A feed reload (refresh timer firing, or itemCount changing) hands in a
// new items array — restart from the first item instead of leaving `index`
// pointing past the end of a possibly-shorter new list.
watch(
  () => props.items,
  () => {
    index.value = 0;
    startSplitRotation();
  },
);
watch(() => props.config.layout, startSplitRotation);

onMounted(startSplitRotation);
onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>

<template>
  <div class="rss-widget" :style="{ fontFamily: config.font }">
    <div v-if="!currentItem" class="empty">No feed items to show yet.</div>

    <template v-else>
      <TickerLayout
        v-if="config.layout === 'ticker'"
        :item="currentItem"
        :image-fit="config.imageFit"
        :speed="config.speed"
        :ticker-theme="config.tickerTheme"
        :item-key="index"
        :source-image="sourceImage"
        :feed-url="config.feedUrl"
        :brand-logo="config.brandLogo"
        @scroll-end="handleScrollEnd"
      />
      <SplitLayout
        v-else
        :item="currentItem"
        :image-fit="config.imageFit"
        :item-key="index"
        :duration-ms="ROTATION_MS"
        :source-image="sourceImage"
        :feed-url="config.feedUrl"
        :brand-logo="config.brandLogo"
      />
    </template>
  </div>
</template>

<style scoped>
.rss-widget {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  background: #0d1117;
  box-sizing: border-box;
  container-type: size;
}
.empty {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8b949e;
  font-size: 1.1rem;
}
</style>

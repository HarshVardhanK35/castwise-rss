<script setup lang="ts">
import type { FeedItem } from "../feedTypes";
import AccentProgressBar from "./AccentProgressBar.vue";

defineProps<{
  item: FeedItem;
  imageFit: "blurred" | "bars" | "crop";
  accentFrom: string;
  accentTo: string;
  itemKey: number;
  durationMs: number;
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
</script>

<template>
  <div class="split-layout">
    <div class="image-area">
      <img v-if="item.image" :src="item.image" alt="" class="bg-image" :class="imageFit" />
      <div v-else class="bg-fallback" />
      <div
        v-if="imageFit === 'blurred' && item.image"
        class="blur-backdrop"
        :style="{ backgroundImage: `url(${item.image})` }"
      />
    </div>

    <div class="text-panel">
      <div class="meta-row">
        <span v-if="item.pubDate" class="timestamp">{{ timeAgo(item.pubDate) }}</span>
      </div>
      <h1 class="headline">{{ item.title }}</h1>
      <p v-if="item.description" class="description">{{ item.description }}</p>
      <AccentProgressBar
        :accent-from="accentFrom"
        :accent-to="accentTo"
        :item-key="itemKey"
        :duration-ms="durationMs"
      />
    </div>
  </div>
</template>

<style scoped>
.split-layout {
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
.bg-image.bars,
.bg-image.blurred {
  object-fit: contain;
}
.bg-fallback {
  width: 100%;
  height: 100%;
  background: #161b22;
}
.text-panel {
  flex: none;
  display: flex;
  flex-direction: column;
  gap: 2cqh;
  padding: 4cqw 5cqw;
  background: #0d1117;
  box-sizing: border-box;
}
.meta-row {
  display: flex;
  justify-content: flex-end;
}
.timestamp {
  color: #8b949e;
  font-size: clamp(11px, 2.4cqh, 16px);
}
.headline {
  margin: 0;
  color: #e6edf3;
  font-weight: 700;
  line-height: 1.2;
  font-size: clamp(16px, 4.5cqh, 34px);
}
.description {
  margin: 0;
  color: #8b949e;
  line-height: 1.5;
  font-size: clamp(12px, 2.6cqh, 18px);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

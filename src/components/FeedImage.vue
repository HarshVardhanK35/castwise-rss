<script setup lang="ts">
import type { FeedItem, BrandLogoConfig } from "../feedTypes";
import BrandLogo from "./BrandLogo.vue";

// The current item's background image (or fallback) + optional blurred
// backdrop + the brand-logo overlay — identical markup/CSS previously
// duplicated between TickerLayout.vue and SplitLayout.vue. Rendered INSIDE
// the parent's own `.image-area` wrapper (that wrapper's positioning
// genuinely differs between Ticker's absolute full-bleed box and Split's
// flex row column, so it stays owned by each parent — only this shared
// inner content moved out).
defineProps<{
  item: FeedItem;
  imageFit: "blurred" | "bars" | "crop";
  brandLogo: BrandLogoConfig;
}>();
</script>

<template>
  <img v-if="item.image" :src="item.image" alt="" class="bg-image" :class="imageFit" />
  <div v-else class="bg-fallback" />
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
}
</style>

<script setup lang="ts">
import type { BrandLogoConfig } from "../feedTypes";

defineProps<{ logo: BrandLogoConfig }>();
</script>

<template>
  <img
    v-if="logo.enabled && logo.url"
    :src="logo.url"
    alt=""
    class="brand-logo"
    :class="logo.position"
    :style="{ width: `${logo.size}cqw`, opacity: logo.opacity / 100 }"
  />
</template>

<style scoped>
.brand-logo {
  position: absolute;
  top: 3cqh;
  z-index: 2;
  max-width: 30%;
  height: auto;
  object-fit: contain;
  pointer-events: none;
}
.brand-logo.top-left {
  left: 3cqw;
}
.brand-logo.top-right {
  right: 3cqw;
}
</style>

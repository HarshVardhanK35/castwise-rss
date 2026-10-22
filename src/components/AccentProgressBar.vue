<script setup lang="ts">
// Thin gradient bar that fills over one item's display duration, resetting
// every time `itemKey` changes — a visual cue for how long until the
// widget rotates to the next feed item. `itemKey` (not just a plain CSS
// animation left running) is what forces a clean restart on every item
// change, since Vue only re-triggers a CSS animation when the element
// itself remounts.
defineProps<{
  accentFrom: string;
  accentTo: string;
  itemKey: number;
  durationMs: number;
}>();
</script>

<template>
  <div class="track">
    <div
      :key="itemKey"
      class="fill"
      :style="{
        background: `linear-gradient(90deg, ${accentFrom}, ${accentTo})`,
        animationDuration: `${durationMs}ms`,
      }"
    />
  </div>
</template>

<style scoped>
.track {
  width: 100%;
  height: 3px;
  background: rgba(255, 255, 255, 0.12);
  overflow: hidden;
}
.fill {
  height: 100%;
  width: 100%;
  transform-origin: left;
  animation-name: fill-grow;
  animation-timing-function: linear;
  animation-fill-mode: forwards;
}
@keyframes fill-grow {
  from {
    transform: scaleX(0);
  }
  to {
    transform: scaleX(1);
  }
}
</style>

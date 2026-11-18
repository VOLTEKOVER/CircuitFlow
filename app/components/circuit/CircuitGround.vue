<script setup lang="ts">
withDefaults(defineProps<{
  x: number
  y: number
  size?: number
}>(), {
  size: 16
})
</script>

<template>
  <g>
    <line :x1="x" :y1="y" :x2="x" :y2="y + 6" stroke="currentColor" stroke-opacity="0.6" stroke-width="2" />
    <line :x1="x - size / 2" :y1="y + 6" :x2="x + size / 2" :y2="y + 6" stroke="currentColor" stroke-opacity="0.6" stroke-width="2" />
    <line :x1="x - size / 3" :y1="y + 11" :x2="x + size / 3" :y2="y + 11" stroke="currentColor" stroke-opacity="0.6" stroke-width="2" />
    <line :x1="x - size / 6" :y1="y + 16" :x2="x + size / 6" :y2="y + 16" stroke="currentColor" stroke-opacity="0.6" stroke-width="2" />
  </g>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  x?: number
  y?: number
  type?: 'npn' | 'pnp'
  label?: string
}>(), {
  x: 0,
  y: 0,
  type: 'npn',
  label: 'Q'
})
</script>

<template>
  <g :transform="`translate(${x}, ${y})`">
    <line x1="-20" y1="-30" x2="-20" y2="30" stroke="currentColor" stroke-width="4" />
    <line x1="-60" y1="0" x2="-20" y2="0" stroke="currentColor" stroke-opacity="0.5" stroke-width="2.5" />
    <line x1="-20" y1="-18" x2="20" y2="-40" stroke="currentColor" stroke-width="2.5" />
    <line x1="-20" y1="18" x2="20" y2="40" stroke="currentColor" stroke-width="2.5" />
    <line x1="20" y1="-55" x2="20" y2="-40" stroke="currentColor" stroke-opacity="0.5" stroke-width="2.5" />
    <line x1="20" y1="40" x2="20" y2="55" stroke="currentColor" stroke-opacity="0.5" stroke-width="2.5" />
    <circle cx="-5" cy="0" r="45" fill="none" stroke="currentColor" stroke-opacity="0.25" stroke-width="1.5" />
    <polygon v-if="type==='npn'" points="20,40 8,30 6,44" fill="currentColor" />
    <polygon v-else points="-20,18 -8,28 -6,14" fill="currentColor" />
    <text x="-78" y="4" font-size="12" font-weight="600" fill="currentColor">B</text>
    <text x="26" y="-44" font-size="12" font-weight="600" fill="currentColor">C</text>
    <text x="26" y="48" font-size="12" font-weight="600" fill="currentColor">E</text>
    <text v-if="label" x="-5" y="62" text-anchor="middle" font-size="10" fill="currentColor" opacity="0.7">{{ label }}</text>
  </g>
</template>

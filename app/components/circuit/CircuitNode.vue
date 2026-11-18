<script setup lang="ts">
withDefaults(defineProps<{
  x: number
  y: number
  r?: number
  label?: string
  labelX?: number
  labelY?: number
  labelAnchor?: 'start' | 'middle' | 'end'
  color?: string
}>(), {
  r: 4,
  label: '',
  labelX: undefined,
  labelY: undefined,
  labelAnchor: 'middle',
  color: 'var(--ui-primary)'
})
</script>

<template>
  <g>
    <circle :cx="x" :cy="y" :r="r" :fill="color" />
    <text
      v-if="label"
      :x="labelX ?? x"
      :y="labelY ?? (y - 8)"
      :text-anchor="labelAnchor"
      font-size="12"
      font-weight="600"
      fill="currentColor"
    >{{ label }}</text>
  </g>
</template>

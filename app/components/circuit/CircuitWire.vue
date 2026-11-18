<script setup lang="ts">
const props = withDefaults(defineProps<{
  points: Array<{ x: number, y: number }> | string
  color?: string
  width?: number
  opacity?: number
  dashed?: boolean
}>(), {
  color: 'currentColor',
  width: 2,
  opacity: 0.5,
  dashed: false
})

const d = computed(() => {
  if (typeof props.points === 'string') return props.points
  return props.points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
})
</script>

<template>
  <path
    :d="d"
    fill="none"
    :stroke="color"
    :stroke-width="width"
    :stroke-opacity="opacity"
    :stroke-dasharray="dashed ? '6 4' : undefined"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
</template>

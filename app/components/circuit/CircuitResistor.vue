<script setup lang="ts">
const props = withDefaults(defineProps<{
  x: number
  y: number
  length?: number
  orientation?: 'horizontal' | 'vertical'
  label?: string
}>(), {
  length: 40,
  orientation: 'horizontal',
  label: ''
})

const h = computed(() => props.orientation === 'horizontal')
const x2 = computed(() => props.x + (h.value ? props.length : 0))
const y2 = computed(() => props.y + (h.value ? 0 : props.length))
const midX = computed(() => (props.x + x2.value) / 2)
const midY = computed(() => (props.y + y2.value) / 2)
const body = computed(() => {
  const l = props.length
  const lead = Math.max(6, l * 0.2)
  const bodyLen = l - lead * 2
  const step = bodyLen / 6
  if (h.value) {
    const y = props.y
    const x0 = props.x + lead
    const pts = [
      [props.x, y], [x0, y],
      [x0 + step * 0.5, y - 6], [x0 + step * 1.5, y + 6],
      [x0 + step * 2.5, y - 6], [x0 + step * 3.5, y + 6],
      [x0 + step * 4.5, y - 6], [x0 + step * 5.5, y + 6],
      [x0 + bodyLen, y], [x2.value, y]
    ]
    return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ')
  } else {
    const x = props.x
    const y0 = props.y + lead
    const pts = [
      [x, props.y], [x, y0],
      [x - 6, y0 + step * 0.5], [x + 6, y0 + step * 1.5],
      [x - 6, y0 + step * 2.5], [x + 6, y0 + step * 3.5],
      [x - 6, y0 + step * 4.5], [x + 6, y0 + step * 5.5],
      [x, y0 + bodyLen], [x, y2.value]
    ]
    return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ')
  }
})
</script>

<template>
  <g>
    <path :d="body" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />
    <text
      v-if="label"
      :x="h ? midX : midX + 12"
      :y="h ? midY - 10 : midY"
      text-anchor="middle"
      dominant-baseline="central"
      font-size="11"
      fill="currentColor"
    >{{ label }}</text>
  </g>
</template>

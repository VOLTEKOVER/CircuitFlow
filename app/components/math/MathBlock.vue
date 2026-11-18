<script setup lang="ts">
import katex from 'katex'

const props = withDefaults(defineProps<{
  tex: string
  label?: string
}>(), {
  label: ''
})

const html = computed(() => {
  try {
    return katex.renderToString(props.tex, {
      displayMode: true,
      throwOnError: false,
      strict: 'ignore',
      trust: false
    })
  } catch {
    return props.tex
  }
})
</script>

<template>
  <UCard :ui="{ body: 'p-0 overflow-x-auto text-highlighted', root: 'ring-0 shadow-none bg-transparent my-1' }">
    <template v-if="label" #header>
      <UBadge color="neutral" variant="soft" size="xs" :label="label" class="font-sans text-xs tracking-wide uppercase" />
    </template>
    <UContainer class="p-0 overflow-x-auto text-highlighted" v-html="html" />
  </UCard>
</template>

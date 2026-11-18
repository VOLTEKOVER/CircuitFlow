<script setup lang="ts">
import katex from 'katex'

const props = defineProps<{
  tex: string
}>()

const html = computed(() => {
  try {
    return katex.renderToString(props.tex, {
      displayMode: false,
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
  <UBadge color="neutral" variant="soft" class="inline-flex align-middle font-normal normal-case tracking-normal p-0 bg-transparent ring-0" :ui="{ label: 'inline-flex' }">
    <UContainer class="inline-block align-middle p-0" v-html="html" />
  </UBadge>
</template>

<script setup lang="ts">
const links = [
  { label: 'Home', to: '/' },
  { label: 'Libreria', to: '/libreria' }
]
</script>

<template>
  <UNavigationMenu :items="links" class="hidden md:flex" />
</template>

<script setup lang="ts">
useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  htmlAttrs: {
    lang: 'it'
  }
})

const title = 'CircuitFlow — Piattaforma avanzata di elettronica'
const description = 'Piattaforma web per lo studio dell’elettronica avanzata: teoria, schemi, parametri, grafici e simulazioni interattive.'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  twitterCard: 'summary_large_image'
})

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Libreria', to: '/libreria' },
  { label: 'Ebers–Moll', to: '/libreria/ebers-moll' }
]
</script>

<template>
  <UApp>
    <UHeader>
      <template #left>
        <AppLogo />
        <TemplateMenu />
      </template>

      <template #right>
        <UColorModeButton />
        <UButton
          to="/libreria"
          label="Libreria"
          color="primary"
          size="sm"
          class="hidden sm:inline-flex"
          icon="i-lucide-grid-2x2"
        />
      </template>

      <template #body>
        <UNavigationMenu :items="navLinks" orientation="vertical" class="-mx-2.5" />
      </template>
    </UHeader>

    <UMain>
      <NuxtPage />
    </UMain>

    <USeparator />

    <UFooter>
      <template #left>
        <UBadge color="neutral" variant="soft" :label="`CircuitFlow © ${new Date().getFullYear()}`" />
      </template>

      <template #right>
        <UButton to="/" color="neutral" variant="ghost" size="sm" label="Home" />
        <UButton to="/libreria" color="neutral" variant="ghost" size="sm" label="Libreria" />
      </template>
    </UFooter>
  </UApp>
</template>

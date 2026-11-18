<script setup lang="ts">
import { simulations } from '~/utils/simulations'

useSeoMeta({
  title: 'CircuitFlow — Elettronica interattiva',
  description: 'Libreria di simulazioni elettroniche interattive: modelli, parametri, grafici e analisi.'
})

const featured = simulations.slice(0, 6)
</script>

<template>
  <UPage>
    <UContainer class="py-8 sm:py-10">
      <UPageHeader
        title="CircuitFlow"
        description="Simulazioni elettroniche interattive, con parametri regolabili e grafici in tempo reale."
        :ui="{
          root: 'border-b-0 pb-0 mb-6 max-w-2xl',
          title: 'text-2xl sm:text-3xl font-semibold tracking-tight text-highlighted',
          description: 'mt-2 text-sm text-muted'
        }"
      >
        <template #links>
          <UButton
            to="/libreria"
            size="xs"
            color="primary"
            variant="solid"
            label="Apri la libreria"
            trailing-icon="i-lucide-arrow-right"
          />
        </template>
      </UPageHeader>

      <div class="mb-3 flex items-center justify-between">
        <h2 class="text-sm font-medium text-highlighted">
          Simulazioni in evidenza
        </h2>
        <UButton
          to="/libreria"
          size="xs"
          color="neutral"
          variant="ghost"
          label="Tutte"
          trailing-icon="i-lucide-arrow-right"
        />
      </div>

      <UPageGrid class="sm:grid-cols-2 lg:grid-cols-3">
        <ULink
          v-for="sim in featured"
          :key="sim.to"
          :to="sim.to"
          raw
          class="block focus:outline-none"
        >
          <UCard
            class="h-full transition-colors hover:border-[var(--ui-primary)]/50"
            :ui="{ body: 'h-full flex flex-col gap-1.5 p-3' }"
          >
            <div class="flex items-center gap-2">
              <UIcon
                :name="sim.icon"
                class="size-4 shrink-0 text-primary"
              />
              <span class="text-sm font-medium text-highlighted">{{ sim.title }}</span>
            </div>
            <p class="text-xs text-muted leading-relaxed">
              {{ sim.description }}
            </p>
            <div class="mt-auto flex flex-wrap gap-1 pt-1">
              <UBadge
                v-for="tag in sim.tags.slice(0, 2)"
                :key="tag"
                color="neutral"
                variant="subtle"
                size="xs"
                :label="tag"
              />
            </div>
          </UCard>
        </ULink>
      </UPageGrid>
    </UContainer>
  </UPage>
</template>

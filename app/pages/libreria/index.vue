<script setup lang="ts">
import { simulations } from '~/utils/simulations'

useSeoMeta({
  title: 'Libreria simulazioni — CircuitFlow',
  description: 'Raccolta di simulazioni elettroniche interattive.'
})
</script>

<template>
  <UPage>
    <UContainer class="py-8 sm:py-12">
      <UPageHeader
        title="Libreria simulazioni"
        description="Una raccolta di modelli e simulazioni elettroniche. Seleziona una simulazione per aprire parametri, disegno e grafici."
        :ui="{ root: 'border-b-0 pb-0 mb-8 sm:mb-10 max-w-2xl', title: 'text-2xl sm:text-3xl font-semibold tracking-tight text-highlighted', description: 'mt-2 text-sm sm:text-base text-muted' }"
      />

      <UPageGrid>
        <ULink
          v-for="(sim, index) in simulations"
          :key="sim.to"
          :to="sim.to"
          class="sim-entry block focus:outline-none"
          :style="{ '--delay': `${index * 70}ms` }"
          raw
        >
          <UCard class="h-full transition-all duration-200 hover:border-[var(--ui-primary)]/40 hover:bg-elevated/30" :ui="{ body: 'h-full flex flex-col gap-3' }">
            <UPageHeader
              :ui="{ root: 'border-b-0 py-0' }"
            >
              <template #headline>
                <UButton :icon="sim.icon" color="primary" variant="soft" size="sm" square class="pointer-events-none" />
              </template>
              <template #links>
                <UBadge color="success" variant="subtle" size="xs" :label="sim.status || 'Disponibile'" />
              </template>
            </UPageHeader>
            <UPageHeader
              :title="sim.title"
              :description="sim.description"
              :ui="{ root: 'border-b-0 py-0 flex-1', title: 'text-base font-medium text-highlighted', description: 'mt-1.5 text-sm text-muted leading-relaxed' }"
            />
            <UPageGrid class="grid-cols-none flex flex-wrap gap-1.5 mt-1">
              <UBadge v-for="tag in sim.tags" :key="tag" color="neutral" variant="subtle" size="xs" :label="tag" />
            </UPageGrid>
            <USeparator />
            <UButton color="primary" variant="link" :padded="false" label="Apri simulazione" trailing-icon="i-lucide-arrow-right" class="pointer-events-none justify-start" />
          </UCard>
        </ULink>
      </UPageGrid>
    </UContainer>
  </UPage>
</template>

<style scoped>
.sim-entry {
  opacity: 0;
  transform: translateY(10px);
  animation: sim-enter 420ms ease forwards;
  animation-delay: var(--delay, 0ms);
}

@keyframes sim-enter {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

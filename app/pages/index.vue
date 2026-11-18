<script setup lang="ts">
import { simulations as allSimulations } from '~/utils/simulations'

const simulations = allSimulations.slice(0, 6)

const features = [
  {
    icon: 'i-lucide-circuit-board',
    title: 'Progettazione chiara',
    description: 'Strumenti essenziali per descrivere e organizzare sistemi elettronici in modo preciso.'
  },
  {
    icon: 'i-lucide-activity',
    title: 'Analisi leggibile',
    description: 'Parametri e risultati presentati con gerarchia visiva pulita e immediata.'
  },
  {
    icon: 'i-lucide-library-big',
    title: 'Libreria modulare',
    description: 'Raccolta di modelli e simulazioni accessibili da una vista a griglia ordinata.'
  }
]
</script>

<template>
  <UPage>
    <UPageHero
      title="CircuitFlow"
      description="Ambiente minimale per lo studio e l’analisi dell’elettronica, con una libreria di simulazioni in crescita."
      :links="[
        { label: 'Apri libreria', to: '/libreria', color: 'primary', size: 'lg', icon: 'i-lucide-grid-2x2' },
        { label: 'Simulazione Ebers–Moll', to: '/libreria/ebers-moll', color: 'neutral', variant: 'outline', size: 'lg' }
      ]"
    />

    <UPageSection
      id="funzionalita"
      title="Essenziale, focalizzato"
      description="Un’interfaccia ridotta al necessario per lavorare sui contenuti senza distrazioni."
      :features="features"
    />

    <UPageSection
      id="libreria"
      title="Libreria simulazioni"
      description="Tutte le simulazioni disponibili, raccolte in una vista a griglia."
    >
      <UPageGrid>
        <ULink
          v-for="(sim, index) in simulations"
          :key="sim.to"
          :to="sim.to"
          class="sim-card block focus:outline-none"
          :style="{ '--delay': `${index * 120}ms` }"
          raw
        >
          <UPageCard
            :icon="sim.icon"
            :title="sim.title"
            :description="sim.description"
            variant="outline"
            class="h-full transition-colors hover:border-[var(--ui-primary)]/50"
          >
            <template #footer>
              <UPageGrid class="grid-cols-none flex flex-wrap gap-2">
                <UBadge v-for="tag in sim.tags" :key="tag" color="neutral" variant="subtle" size="sm" :label="tag" />
              </UPageGrid>
            </template>
          </UPageCard>
        </ULink>
      </UPageGrid>

      <UContainer class="mt-8 flex justify-center">
        <UButton to="/libreria" color="neutral" variant="ghost" label="Vedi tutte le simulazioni" trailing-icon="i-lucide-arrow-right" />
      </UContainer>
    </UPageSection>

    <UPageSection id="inizia">
      <UPageCTA
        title="Inizia dalla libreria"
        description="Apri la vista completa delle simulazioni ed esplora i modelli disponibili."
        variant="subtle"
        :links="[{
          label: 'Vai alla libreria',
          to: '/libreria',
          color: 'primary',
          icon: 'i-lucide-grid-2x2'
        }]"
      />
    </UPageSection>
  </UPage>
</template>

<style scoped>
.sim-card {
  opacity: 0;
  transform: translateY(12px);
  animation: sim-reveal 500ms ease forwards;
  animation-delay: var(--delay, 0ms);
}

@keyframes sim-reveal {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

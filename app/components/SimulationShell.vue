<script setup lang="ts">
withDefaults(defineProps<{
  labLabel?: string
  chapter: string
  sim: string
  title: string
  subtitle?: string
  objective: string
}>(), {
  labLabel: 'ELECTRONICS LABORATORY',
  subtitle: ''
})
</script>

<template>
  <UPage>
    <UContainer class="max-w-6xl py-4 sm:py-6">
      <UPageHeader
        :headline="`${chapter}.${sim}`"
        :title="title"
        :description="subtitle || undefined"
        :ui="{ root: 'mb-4 sm:mb-5 border-b-0 pb-0', headline: 'text-xs text-muted font-normal normal-case tracking-normal mb-1', title: 'text-xl sm:text-2xl font-semibold tracking-tight', description: 'text-sm text-muted mt-1' }"
      >
        <template #links>
          <UButton
            to="/libreria"
            color="neutral"
            variant="ghost"
            size="xs"
            icon="i-lucide-arrow-left"
            label="Libreria"
          />
        </template>
      </UPageHeader>

      <UCard
        :ui="{ body: 'space-y-1' }"
        class="mb-4 sm:mb-5 border-l-2 border-l-primary/60 rounded-l-none"
      >
        <span class="text-xs text-muted">Obiettivo</span>
        <UPageHeader
          :description="objective"
          :ui="{ root: 'border-b-0 py-0', description: 'text-xs sm:text-sm text-toned leading-relaxed max-w-3xl mt-0' }"
        />
      </UCard>

      <UPageBody class="space-y-4 sm:space-y-5 mt-0 pt-0">
        <UPageSection
          v-if="$slots.theory"
          title="Richiamo teorico"
          :ui="{ root: 'py-0 sm:py-0 gap-2 sm:gap-2', container: 'gap-2 sm:gap-2', title: 'text-base font-semibold text-highlighted' }"
        >
          <slot name="theory" />
        </UPageSection>

        <UPageSection
          v-if="$slots.schema"
          title="Schema elettrico / modello"
          :ui="{ root: 'py-0 sm:py-0 gap-2 sm:gap-2', container: 'gap-2 sm:gap-2', title: 'text-base font-semibold text-highlighted' }"
        >
          <slot name="schema" />
        </UPageSection>

        <UPageSection
          v-if="$slots.parameters"
          title="Parametri di simulazione"
          :ui="{ root: 'py-0 sm:py-0 gap-2 sm:gap-2', container: 'gap-2 sm:gap-2', title: 'text-base font-semibold text-highlighted' }"
        >
          <slot name="parameters" />
        </UPageSection>

        <UPageSection
          v-if="$slots.results"
          title="Risultati della simulazione"
          :ui="{ root: 'py-0 sm:py-0 gap-2 sm:gap-2', container: 'gap-2 sm:gap-2', title: 'text-base font-semibold text-highlighted' }"
        >
          <slot name="results" />
        </UPageSection>

        <UPageSection
          v-if="$slots.analysis"
          title="Analisi dei risultati"
          :ui="{ root: 'py-0 sm:py-0 gap-2 sm:gap-2', container: 'gap-2 sm:gap-2', title: 'text-base font-semibold text-highlighted' }"
        >
          <slot name="analysis" />
        </UPageSection>

        <UPageSection
          v-if="$slots.conclusion"
          title="Conclusione"
          :ui="{ root: 'py-0 sm:py-0 gap-2 sm:gap-2', container: 'gap-2 sm:gap-2', title: 'text-base font-semibold text-highlighted' }"
        >
          <slot name="conclusion" />
        </UPageSection>
      </UPageBody>

      <USeparator class="mt-6" />
      <p class="py-3 text-[11px] text-muted">
        {{ labLabel }} · {{ chapter }}.{{ sim }}
      </p>
    </UContainer>
  </UPage>
</template>

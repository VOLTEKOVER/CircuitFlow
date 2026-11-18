<script setup lang="ts">
withDefaults(defineProps<{
  labLabel?: string
  chapter: string
  sim: string
  title: string
  subtitle?: string
  objective: string
  footerNote?: string
}>(), {
  labLabel: 'ELECTRONICS LABORATORY',
  subtitle: '',
  footerNote: 'ELECTRONICS · SIMULATION NOTES'
})
</script>

<template>
  <UPage>
    <UContainer class="max-w-6xl py-6 sm:py-8">
      <UPageHeader
        :headline="`${chapter}.${sim}`"
        :title="title"
        :description="subtitle || undefined"
        :ui="{ root: 'mb-6 sm:mb-8 border-b-0 pb-0', headline: 'text-sm text-muted font-normal normal-case tracking-normal mb-1', title: 'text-2xl sm:text-3xl font-semibold tracking-tight', description: 'text-base sm:text-lg text-muted mt-1' }"
      >
        <template #links>
          <UButton to="/libreria" color="neutral" variant="ghost" size="xs" icon="i-lucide-arrow-left" label="Libreria" />
        </template>
      </UPageHeader>

      <UCard :ui="{ body: 'space-y-1' }" class="mb-6 sm:mb-8 border-l-2 border-l-primary/60 rounded-l-none">
        <UBadge color="neutral" variant="soft" size="xs" label="Obiettivo" class="w-fit tracking-[0.12em] uppercase" />
        <UPageHeader
          :description="objective"
          :ui="{ root: 'border-b-0 py-0', description: 'text-sm sm:text-base text-toned leading-relaxed max-w-3xl mt-0' }"
        />
      </UCard>

      <UPageBody class="space-y-6 sm:space-y-8 mt-0 pt-0">
        <UPageSection
          v-if="$slots.theory"
          title="Richiamo teorico"
          :ui="{ root: 'py-0 sm:py-0 gap-3 sm:gap-3', container: 'gap-3 sm:gap-3', title: 'text-lg font-semibold text-highlighted' }"
        >
          <slot name="theory" />
        </UPageSection>

        <UPageSection
          v-if="$slots.schema"
          title="Schema elettrico / modello"
          :ui="{ root: 'py-0 sm:py-0 gap-3 sm:gap-3', container: 'gap-3 sm:gap-3', title: 'text-lg font-semibold text-highlighted' }"
        >
          <slot name="schema" />
        </UPageSection>

        <UPageSection
          v-if="$slots.parameters"
          title="Parametri di simulazione"
          :ui="{ root: 'py-0 sm:py-0 gap-3 sm:gap-3', container: 'gap-3 sm:gap-3', title: 'text-lg font-semibold text-highlighted' }"
        >
          <slot name="parameters" />
        </UPageSection>

        <UPageSection
          v-if="$slots.results"
          title="Risultati della simulazione"
          :ui="{ root: 'py-0 sm:py-0 gap-3 sm:gap-3', container: 'gap-3 sm:gap-3', title: 'text-lg font-semibold text-highlighted' }"
        >
          <slot name="results" />
        </UPageSection>

        <UPageSection
          v-if="$slots.analysis"
          title="Analisi dei risultati"
          :ui="{ root: 'py-0 sm:py-0 gap-3 sm:gap-3', container: 'gap-3 sm:gap-3', title: 'text-lg font-semibold text-highlighted' }"
        >
          <slot name="analysis" />
        </UPageSection>

        <UPageSection
          v-if="$slots.conclusion"
          title="Conclusione"
          :ui="{ root: 'py-0 sm:py-0 gap-3 sm:gap-3', container: 'gap-3 sm:gap-3', title: 'text-lg font-semibold text-highlighted' }"
        >
          <slot name="conclusion" />
        </UPageSection>
      </UPageBody>

      <USeparator class="mt-10" />
      <UPageHeader
        :headline="footerNote"
        :ui="{ root: 'border-b-0 py-4', headline: 'text-[11px] tracking-[0.12em] uppercase text-muted font-normal' }"
      >
        <template #links>
          <UBadge color="neutral" variant="outline" size="xs" :label="`${labLabel} · ${chapter} · ${sim}`" class="tracking-[0.12em]" />
        </template>
      </UPageHeader>
    </UContainer>
  </UPage>
</template>

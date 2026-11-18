<script setup lang="ts">
useSeoMeta({
  title: 'Struttura e correnti NPN/PNP — CircuitFlow',
  description: 'Confronto interattivo tra transistor BJT NPN e PNP: polarità, versi delle correnti e relazioni fondamentali.'
})

const mode = ref<'NPN' | 'PNP'>('NPN')
const ib = ref(50)
const beta = ref(100)

const ic = computed(() => (ib.value * 1e-6) * beta.value)
const ie = computed(() => ic.value + ib.value * 1e-6)
const alpha = computed(() => beta.value / (1 + beta.value))

function fmtI(a: number) {
  const abs = Math.abs(a)
  if (abs >= 1e-3) return `${(a * 1e3).toFixed(2)} mA`
  if (abs >= 1e-6) return `${(a * 1e6).toFixed(1)} µA`
  return `${(a * 1e9).toFixed(1)} nA`
}

const resultColumns = [
  { accessorKey: 'grandezza', header: 'Grandezza' },
  { accessorKey: 'npn', header: 'NPN' },
  { accessorKey: 'pnp', header: 'PNP' }
]

const resultRows = [
  { grandezza: 'Giunzione EB (attiva)', npn: 'V_BE > 0, diretta', pnp: 'V_EB > 0, diretta' },
  { grandezza: 'Giunzione CB (attiva)', npn: 'V_CB > 0, inversa', pnp: 'V_BC > 0, inversa' },
  { grandezza: 'Verso I_B', npn: 'Entrante in base', pnp: 'Uscente dalla base' },
  { grandezza: 'Verso I_C', npn: 'Entrante nel collettore', pnp: 'Uscente dal collettore' },
  { grandezza: 'Verso I_E', npn: 'Uscente dall’emettitore', pnp: 'Entrante nell’emettitore' }
]

const analysisItems = [
  'Invertendo il tipo di transistor (NPN/PNP) si invertono i versi delle correnti e le polarità delle tensioni, mentre le relazioni tra le ampiezze restano equivalenti.',
  'Per valori tipici di β, la corrente di collettore è molto maggiore della corrente di base: una piccola I_B controlla una I_C più grande.',
  'La somma delle correnti rispetta la legge dei nodi: I_E = I_C + I_B (in valore convenzionale).'
]
</script>

<template>
  <SimulationShell
    chapter="02"
    sim="01"
    title="Struttura e correnti NPN/PNP"
    subtitle="Confronto tra transistor bipolari NPN e PNP in configurazione attiva"
    objective="Verificare le differenze tra BJT NPN e PNP in termini di polarità, versi delle correnti e relazioni tra I_E, I_B e I_C."
  >
    <template #theory>
      <UAlert color="neutral" variant="soft" :description="'Il transistor bipolare a giunzione è formato da tre regioni drogate (emettitore, base, collettore). In zona attiva la giunzione emettitore-base è polarizzata direttamente e la giunzione collettore-base inversamente: una piccola corrente di base controlla una corrente di collettore molto maggiore.'" />
      <UCard class="text-sm w-fit">
        <MathBlock tex="I_E = I_C + I_B" />
        <MathBlock tex="I_C = \alpha_F\, I_E = \beta_F\, I_B" />
        <MathBlock tex="\alpha_F = \frac{\beta_F}{1 + \beta_F}" />
      </UCard>
    </template>

    <template #schema>
      <UCard :ui="{ body: 'p-3 sm:p-4 space-y-3' }">
        <UPageHeader
          title="Simbolo e versi delle grandezze"
          :ui="{ root: 'border-b-0 py-0', title: 'text-sm text-muted font-normal' }"
        >
          <template #links>
            <UTabs
              v-model="mode"
              :items="[{ label: 'NPN', value: 'NPN' }, { label: 'PNP', value: 'PNP' }]"
              :content="false"
              size="sm"
              class="w-auto"
            />
          </template>
        </UPageHeader>
        <UCard :ui="{ body: 'p-2 bg-elevated/10' }">
          <svg viewBox="0 0 460 240" class="w-full h-auto">
            <line x1="170" y1="80" x2="170" y2="160" stroke="currentColor" stroke-width="5" />
            <line x1="90" y1="120" x2="170" y2="120" stroke="currentColor" stroke-opacity="0.5" stroke-width="2.5" />
            <line x1="170" y1="95" x2="230" y2="55" stroke="currentColor" stroke-width="2.5" />
            <line x1="170" y1="145" x2="230" y2="185" stroke="currentColor" stroke-width="2.5" />
            <line x1="230" y1="25" x2="230" y2="55" stroke="currentColor" stroke-opacity="0.5" stroke-width="2.5" />
            <line x1="230" y1="185" x2="230" y2="215" stroke="currentColor" stroke-opacity="0.5" stroke-width="2.5" />
            <circle cx="190" cy="120" r="52" fill="none" stroke="currentColor" stroke-opacity="0.3" stroke-width="1.5" />
            <polygon v-if="mode==='NPN'" points="230,185 218,173 215,188" fill="currentColor" />
            <polygon v-else points="170,145 182,157 185,142" fill="currentColor" />
            <circle cx="90" cy="120" r="4" fill="var(--ui-primary)" />
            <circle cx="230" cy="25" r="4" fill="var(--ui-primary)" />
            <circle cx="230" cy="215" r="4" fill="var(--ui-primary)" />
            <text x="70" y="124" font-size="13" font-weight="600" fill="currentColor">B</text>
            <text x="240" y="29" font-size="13" font-weight="600" fill="currentColor">C</text>
            <text x="240" y="219" font-size="13" font-weight="600" fill="currentColor">E</text>
            <g v-if="mode==='NPN'">
              <text x="105" y="108" font-size="11" fill="var(--ui-primary)">I_B →</text>
              <text x="240" y="50" font-size="11" fill="var(--ui-primary)">↓ I_C</text>
              <text x="240" y="200" font-size="11" fill="var(--ui-primary)">↑ I_E</text>
              <text x="300" y="80" font-size="12" fill="currentColor" opacity="0.75">V_BE &gt; 0 (EB diretta)</text>
              <text x="300" y="100" font-size="12" fill="currentColor" opacity="0.75">V_CB &gt; 0 (CB inversa)</text>
            </g>
            <g v-else>
              <text x="105" y="108" font-size="11" fill="var(--ui-primary)">← I_B</text>
              <text x="240" y="50" font-size="11" fill="var(--ui-primary)">↑ I_C</text>
              <text x="240" y="200" font-size="11" fill="var(--ui-primary)">↓ I_E</text>
              <text x="300" y="80" font-size="12" fill="currentColor" opacity="0.75">V_EB &gt; 0 (EB diretta)</text>
              <text x="300" y="100" font-size="12" fill="currentColor" opacity="0.75">V_BC &gt; 0 (CB inversa)</text>
            </g>
            <text x="175" y="72" font-size="10" fill="currentColor" opacity="0.6">{{ mode==='NPN' ? 'N (C)' : 'P (C)' }}</text>
            <text x="120" y="142" font-size="10" fill="currentColor" opacity="0.6">{{ mode==='NPN' ? 'P (B)' : 'N (B)' }}</text>
            <text x="175" y="178" font-size="10" fill="currentColor" opacity="0.6">{{ mode==='NPN' ? 'N (E)' : 'P (E)' }}</text>
          </svg>
        </UCard>
      </UCard>
    </template>

    <template #parameters>
      <UPageGrid class="lg:grid-cols-2">
        <UCard :ui="{ body: 'space-y-4' }">
          <UBadge color="neutral" variant="soft" size="xs" label="Valori impostati" class="tracking-wide uppercase w-fit" />
          <UFormField label="I_B" :hint="`${ib} µA`">
            <USlider v-model="ib" :min="1" :max="200" :step="1" />
          </UFormField>
          <UFormField label="β_F" :hint="`${beta}`">
            <USlider v-model="beta" :min="20" :max="400" :step="1" />
          </UFormField>
        </UCard>
        <UCard :ui="{ body: 'space-y-3' }">
          <UBadge color="neutral" variant="soft" size="xs" label="Valori calcolati" class="tracking-wide uppercase w-fit" />
          <UCard :ui="{ body: 'flex justify-between p-2.5 text-sm' }">
            <UBadge color="neutral" variant="soft" label="I_C = β·I_B" />
            <UBadge color="primary" variant="subtle" :label="fmtI(ic)" class="font-mono font-medium" />
          </UCard>
          <UCard :ui="{ body: 'flex justify-between p-2.5 text-sm' }">
            <UBadge color="neutral" variant="soft" label="I_E = I_C + I_B" />
            <UBadge color="primary" variant="subtle" :label="fmtI(ie)" class="font-mono font-medium" />
          </UCard>
          <UCard :ui="{ body: 'flex justify-between p-2.5 text-sm' }">
            <UBadge color="neutral" variant="soft" label="α_F = β/(1+β)" />
            <UBadge color="primary" variant="subtle" :label="alpha.toFixed(4)" class="font-mono font-medium" />
          </UCard>
        </UCard>
      </UPageGrid>
    </template>

    <template #results>
      <UCard>
        <UTable :columns="resultColumns" :data="resultRows" />
      </UCard>
    </template>

    <template #analysis>
      <UPageGrid class="grid-cols-1 gap-2">
        <UAlert
          v-for="(item, i) in analysisItems"
          :key="i"
          color="neutral"
          variant="soft"
          icon="i-lucide-info"
          :description="item"
        />
      </UPageGrid>
    </template>

    <template #conclusion>
      <UAlert color="neutral" variant="soft" description="Il confronto mostra che NPN e PNP sono dispositivi duali per polarità e versi di corrente, ma condividono lo stesso principio di controllo della corrente di collettore tramite la base." />
      <UCard class="mt-2">
        <UBadge color="neutral" variant="soft" size="xs" label="Verifica teorica" class="tracking-wide uppercase w-fit mb-2" />
        <UAlert color="primary" variant="subtle" description="I risultati calcolati confermano le relazioni fondamentali del BJT in zona attiva." />
      </UCard>
    </template>
  </SimulationShell>
</template>

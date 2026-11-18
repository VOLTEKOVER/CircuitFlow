<script setup lang="ts">
useSeoMeta({
  title: 'Regioni di funzionamento BJT — CircuitFlow',
  description: 'Simulazione interattiva delle quattro regioni di funzionamento del BJT.'
})

const vbe = ref(0.7)
const vbc = ref(-2)
const is = ref(1e-14)
const betaF = ref(100)
const betaR = ref(5)
const vt = ref(0.02585)

function clampExp(x: number) { return Math.exp(Math.max(-80, Math.min(80, x))) }
function fmtI(a: number) {
  const abs = Math.abs(a)
  if (!Number.isFinite(a)) return '—'
  if (abs >= 1e-3) return `${(a * 1e3).toFixed(3)} mA`
  if (abs >= 1e-6) return `${(a * 1e6).toFixed(2)} µA`
  if (abs >= 1e-9) return `${(a * 1e9).toFixed(2)} nA`
  return `${(a * 1e12).toFixed(2)} pA`
}

const calc = computed(() => {
  const Vt = Math.max(vt.value, 1e-6)
  const iF = is.value * (clampExp(vbe.value / Vt) - 1)
  const iR = is.value * (clampExp(vbc.value / Vt) - 1)
  const ic = iF - iR - iR / Math.max(betaR.value, 0.1)
  const ib = iF / Math.max(betaF.value, 0.1) + iR / Math.max(betaR.value, 0.1)
  const ie = ic + ib
  const vce = vbe.value - vbc.value
  return { iF, iR, ic, ib, ie, vce }
})

const region = computed(() => {
  const eb = vbe.value > 0.15
  const cb = vbc.value > 0.15
  if (eb && !cb) return { name: 'Zona attiva (normale diretta)', short: 'Attiva', color: 'success' as const, eb: 'Diretta', cb: 'Inversa', note: 'I_C ≈ β_F·I_B: funzionamento da amplificatore.' }
  if (eb && cb) return { name: 'Saturazione', short: 'Saturazione', color: 'warning' as const, eb: 'Diretta', cb: 'Diretta', note: 'V_CE basso, guadagno apparente ridotto: interruttore chiuso.' }
  if (!eb && !cb) return { name: 'Interdizione (cut-off)', short: 'Interdizione', color: 'neutral' as const, eb: 'Inversa', cb: 'Inversa', note: 'Correnti molto piccole: interruttore aperto.' }
  return { name: 'Zona inversa', short: 'Inversa', color: 'primary' as const, eb: 'Inversa', cb: 'Diretta', note: 'Guadagno β_R tipicamente molto inferiore a β_F.' }
})

const presets = [
  { label: 'Attiva', vbe: 0.7, vbc: -2 },
  { label: 'Saturazione', vbe: 0.75, vbc: 0.6 },
  { label: 'Interdizione', vbe: -0.5, vbc: -2 },
  { label: 'Inversa', vbe: -1, vbc: 0.7 }
]

const regionColumns = [
  { accessorKey: 'name', header: 'Regione' },
  { accessorKey: 'eb', header: 'EB' },
  { accessorKey: 'cb', header: 'CB' },
  { accessorKey: 'use', header: 'Uso tipico' },
  { accessorKey: 'cond', header: 'Condizione' }
]

const regionRows = [
  { name: 'Attiva', eb: 'Diretta', cb: 'Inversa', use: 'Amplificazione', cond: 'I_C ≈ β_F·I_B' },
  { name: 'Saturazione', eb: 'Diretta', cb: 'Diretta', use: 'Interruttore ON', cond: 'V_CE ≈ V_CE(sat), I_C < β_F·I_B' },
  { name: 'Interdizione', eb: 'Inversa', cb: 'Inversa', use: 'Interruttore OFF', cond: 'I_B ≈ 0, I_C ≈ 0' },
  { name: 'Inversa', eb: 'Inversa', cb: 'Diretta', use: 'Funzionamento inverso', cond: 'I_E ≈ β_R·I_B' }
]

const analysisItems = [
  'In zona attiva la CB è inversa e il transistor opera come amplificatore (I_C controllata da I_B).',
  'In saturazione entrambe le giunzioni sono dirette: V_CE si riduce e il rapporto I_C/I_B scende sotto β_F.',
  'In interdizione le correnti sono trascurabili; in zona inversa i ruoli di emettitore e collettore si scambiano con guadagno β_R ridotto.'
]
</script>

<template>
  <SimulationShell
    chapter="03"
    sim="02"
    title="Regioni di funzionamento del BJT"
    subtitle="Attiva, saturazione, interdizione e zona inversa"
    objective="Verificare il comportamento del BJT nelle quattro regioni di funzionamento al variare della polarizzazione delle giunzioni EB e CB."
  >
    <template #theory>
      <UAlert color="neutral" variant="soft" description="La regione di funzionamento dipende dalla polarizzazione delle due giunzioni: emettitore-base (EB) e collettore-base (CB). Ogni combinazione determina un comportamento caratteristico del dispositivo." />
      <UCard :ui="{ body: 'space-y-2 text-sm' }">
        <UPageGrid class="grid-cols-1 gap-2">
          <UCard :ui="{ body: 'p-2 text-sm' }">Attiva: EB diretta, CB inversa → <MathInline tex="I_C \approx \beta_F I_B" /></UCard>
          <UCard :ui="{ body: 'p-2 text-sm' }">Saturazione: EB diretta, CB diretta → <MathInline tex="V_{CE} \approx V_{CE(sat)}" /></UCard>
          <UCard :ui="{ body: 'p-2 text-sm' }">Interdizione: EB inversa, CB inversa → <MathInline tex="I_B \approx 0,\; I_C \approx 0" /></UCard>
        </UPageGrid>
      </UCard>
    </template>

    <template #schema>
      <UCard :ui="{ body: 'p-3 sm:p-4 space-y-3' }">
        <UPageHeader :ui="{ root: 'border-b-0 py-0' }">
          <template #headline>
            <UBadge color="neutral" variant="soft" :label="`Stato corrente: ${region.name}`" />
          </template>
          <template #links>
            <UBadge :color="region.color" variant="subtle" :label="region.short" />
          </template>
        </UPageHeader>
        <UPageGrid class="sm:grid-cols-2">
          <UCard :ui="{ body: 'space-y-2 text-sm' }">
            <UBadge color="neutral" variant="soft" size="xs" label="Giunzioni" class="tracking-wide uppercase w-fit" />
            <UCard :ui="{ body: 'flex justify-between p-2 text-sm' }">
              <UBadge color="neutral" variant="soft" label="Giunzione EB" />
              <UBadge :color="region.eb==='Diretta' ? 'primary' : 'neutral'" variant="subtle" :label="region.eb" />
            </UCard>
            <UCard :ui="{ body: 'flex justify-between p-2 text-sm' }">
              <UBadge color="neutral" variant="soft" label="Giunzione CB" />
              <UBadge :color="region.cb==='Diretta' ? 'primary' : 'neutral'" variant="subtle" :label="region.cb" />
            </UCard>
            <UAlert color="neutral" variant="soft" :description="region.note" />
          </UCard>
          <UCard :ui="{ body: 'space-y-2 text-sm' }">
            <UBadge color="neutral" variant="soft" size="xs" label="Indicatori" class="tracking-wide uppercase w-fit" />
            <UPageGrid class="grid-cols-2 gap-2">
              <UCard :ui="{ body: 'p-2 space-y-1' }"><UBadge color="neutral" variant="soft" size="xs" label="V_BE" /><UBadge color="primary" variant="subtle" :label="`${vbe.toFixed(2)} V`" class="font-mono" /></UCard>
              <UCard :ui="{ body: 'p-2 space-y-1' }"><UBadge color="neutral" variant="soft" size="xs" label="V_BC" /><UBadge color="primary" variant="subtle" :label="`${vbc.toFixed(2)} V`" class="font-mono" /></UCard>
              <UCard :ui="{ body: 'p-2 space-y-1' }"><UBadge color="neutral" variant="soft" size="xs" label="V_CE" /><UBadge color="primary" variant="subtle" :label="`${calc.vce.toFixed(2)} V`" class="font-mono" /></UCard>
              <UCard :ui="{ body: 'p-2 space-y-1' }"><UBadge color="neutral" variant="soft" size="xs" label="I_C/I_B" /><UBadge color="primary" variant="subtle" :label="(calc.ic/Math.max(Math.abs(calc.ib),1e-15)).toFixed(1)" class="font-mono" /></UCard>
            </UPageGrid>
          </UCard>
        </UPageGrid>
      </UCard>
    </template>

    <template #parameters>
      <UPageGrid class="lg:grid-cols-2">
        <UCard :ui="{ body: 'space-y-4' }">
          <UPageHeader :ui="{ root: 'border-b-0 py-0' }">
            <template #headline>
              <UBadge color="neutral" variant="soft" size="xs" label="Valori impostati" class="tracking-wide uppercase" />
            </template>
            <template #links>
              <UButton v-for="p in presets" :key="p.label" size="xs" color="neutral" variant="ghost" :label="p.label" @click="vbe=p.vbe; vbc=p.vbc" />
            </template>
          </UPageHeader>
          <UFormField label="V_BE" :hint="`${vbe.toFixed(3)} V`">
            <USlider v-model="vbe" :min="-1" :max="1" :step="0.01" />
          </UFormField>
          <UFormField label="V_BC" :hint="`${vbc.toFixed(3)} V`">
            <USlider v-model="vbc" :min="-5" :max="1" :step="0.01" />
          </UFormField>
          <UPageGrid class="grid-cols-2 gap-3">
            <UFormField label="β_F" size="sm">
              <UInput v-model.number="betaF" type="number" step="1" size="sm" />
            </UFormField>
            <UFormField label="β_R" size="sm">
              <UInput v-model.number="betaR" type="number" step="0.5" size="sm" />
            </UFormField>
          </UPageGrid>
        </UCard>
        <UCard :ui="{ body: 'space-y-3' }">
          <UBadge color="neutral" variant="soft" size="xs" label="Valori calcolati" class="tracking-wide uppercase w-fit" />
          <UPageGrid class="grid-cols-2 gap-2">
            <UCard :ui="{ body: 'p-2 space-y-1' }"><UBadge color="neutral" variant="soft" size="xs" label="V_CE" /><UBadge color="primary" variant="subtle" :label="`${calc.vce.toFixed(3)} V`" class="font-mono" /></UCard>
            <UCard :ui="{ body: 'p-2 space-y-1' }"><UBadge color="neutral" variant="soft" size="xs" label="I_B" /><UBadge color="primary" variant="subtle" :label="fmtI(calc.ib)" class="font-mono" /></UCard>
            <UCard :ui="{ body: 'p-2 space-y-1' }"><UBadge color="neutral" variant="soft" size="xs" label="I_C" /><UBadge color="primary" variant="subtle" :label="fmtI(calc.ic)" class="font-mono" /></UCard>
            <UCard :ui="{ body: 'p-2 space-y-1' }"><UBadge color="neutral" variant="soft" size="xs" label="I_E" /><UBadge color="primary" variant="subtle" :label="fmtI(calc.ie)" class="font-mono" /></UCard>
          </UPageGrid>
        </UCard>
      </UPageGrid>
    </template>

    <template #results>
      <UCard :ui="{ body: 'space-y-3' }">
        <UPageHeader title="Tabella delle quattro regioni" :ui="{ root: 'border-b-0 py-0', title: 'text-base font-medium text-highlighted' }" />
        <UTable :columns="regionColumns" :data="regionRows" />
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
      <UAlert color="neutral" variant="soft" description="Le quattro regioni del BJT sono determinate univocamente dalla polarizzazione delle giunzioni EB e CB e corrispondono a comportamenti distinti utili per amplificazione o commutazione." />
      <UCard class="mt-2">
        <UBadge color="neutral" variant="soft" size="xs" label="Verifica teorica" class="tracking-wide uppercase w-fit mb-2" />
        <UAlert color="primary" variant="subtle" description="Tensioni, correnti e regione individuata dalla simulazione sono coerenti con il modello di Ebers–Moll e con la classificazione teorica." />
      </UCard>
    </template>
  </SimulationShell>
</template>

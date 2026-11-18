<script setup lang="ts">
useSeoMeta({
  title: 'Spessore di base e ricombinazione — CircuitFlow',
  description: 'Effetto della larghezza della base e della ricombinazione su α_F, β_F e trasporto dei portatori nel BJT.'
})

const baseWidth = ref(40)
const doping = ref(50)
const lifetime = ref(60)

const alphaF = computed(() => {
  const w = baseWidth.value / 100
  const tau = lifetime.value / 100
  const transport = 1 / (1 + 0.5 * w * w)
  const injection = 0.995 - (100 - doping.value) * 0.0006
  const recomb = 0.85 + tau * 0.149
  const a = transport * injection * Math.min(0.9995, recomb)
  return Math.max(0.5, Math.min(0.9995, a))
})
const betaF = computed(() => alphaF.value / (1 - alphaF.value))

const carriers = computed(() => {
  const n = 24
  const arr = []
  for (let i = 0; i < n; i++) {
    const x = i / (n - 1)
    const w = baseWidth.value / 100
    const survival = Math.exp(-x * (0.3 + w * 2.2) * (1.2 - lifetime.value / 150))
    arr.push({ x, survival })
  }
  return arr
})

function fmt(n: number, d = 3) { return n.toFixed(d) }

const chart = computed(() => {
  const W = 520, H = 220, pad = { l: 46, r: 16, t: 14, b: 34 }
  const pts = carriers.value
  const sx = (x: number) => pad.l + x * (W - pad.l - pad.r)
  const sy = (y: number) => H - pad.b - y * (H - pad.t - pad.b)
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${sx(p.x).toFixed(2)} ${sy(p.survival).toFixed(2)}`).join(' ')
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(v => ({ v, y: sy(v) }))
  return { W, H, pad, path, yTicks }
})

const analysisItems = [
  'Aumentando lo spessore della base cresce la probabilità di ricombinazione prima del raggiungimento del collettore, riducendo la frazione raccolta.',
  'Una vita media τ maggiore (minore ricombinazione) aumenta la quota di portatori che attraversa la base.',
  'La variazione di α_F si riflette in modo amplificato su β_F, specialmente per α_F prossimi a 1.'
]
</script>

<template>
  <SimulationShell
    chapter="02"
    sim="03"
    title="Spessore di base e ricombinazione"
    subtitle="Trasporto dei portatori, α_F e β_F in funzione della struttura della base"
    objective="Comprendere come la larghezza della base e la ricombinazione influenzano la frazione di portatori raccolti al collettore e i guadagni di corrente α_F e β_F."
  >
    <template #theory>
      <UCard :ui="{ body: 'space-y-2' }">
        <UAlert color="neutral" variant="soft" description="Nel BJT i portatori iniettati dall’emettitore attraversano la base per diffusione. Se la base è sottile e con bassa ricombinazione, la maggior parte raggiunge il collettore; altrimenti una frazione maggiore si ricombina, riducendo α_F e β_F." />
        <MathBlock tex="\beta_F = \frac{\alpha_F}{1 - \alpha_F}" />
        <UAlert color="neutral" variant="soft" description="Base sottile, τ alta → α_F ↑, β_F ↑" />
        <UAlert color="neutral" variant="soft" description="Base spessa, ricombinazione ↑ → α_F ↓, β_F ↓" />
      </UCard>
    </template>

    <template #schema>
      <UCard :ui="{ body: 'p-3 sm:p-4' }">
        <UCard :ui="{ body: 'p-3 bg-elevated/10' }">
          <svg viewBox="0 0 520 200" class="w-full h-auto">
            <rect x="20" y="40" width="120" height="120" rx="4" fill="rgba(34,211,238,0.10)" stroke="rgba(34,211,238,0.35)" />
            <rect :x="140" y="40" :width="80 + baseWidth*1.6" height="120" rx="4" fill="rgba(148,163,184,0.08)" stroke="rgba(148,163,184,0.45)" />
            <rect :x="220 + baseWidth*1.6" y="40" width="120" height="120" rx="4" fill="rgba(34,211,238,0.10)" stroke="rgba(34,211,238,0.35)" />
            <text x="80" y="30" text-anchor="middle" font-size="12" fill="currentColor" font-weight="600">Emettitore</text>
            <text :x="180 + baseWidth*0.8" y="30" text-anchor="middle" font-size="12" fill="currentColor" font-weight="600">Base (W_B)</text>
            <text :x="280 + baseWidth*1.6" y="30" text-anchor="middle" font-size="12" fill="currentColor" font-weight="600">Collettore</text>
            <g v-for="(c, i) in carriers" :key="i">
              <circle :cx="140 + c.x * (80 + baseWidth*1.6)" :cy="70 + (i % 5) * 18" :r="4.5" :fill="`rgba(14,165,233,${0.15 + c.survival * 0.75})`" />
            </g>
            <line x1="110" y1="100" x2="135" y2="100" stroke="var(--ui-primary)" stroke-width="2" />
            <polygon points="135,100 126,95 126,105" fill="var(--ui-primary)" />
            <text x="55" y="96" font-size="10" fill="var(--ui-primary)">iniezione</text>
            <line :x1="225 + baseWidth*1.6" y1="100" :x2="250 + baseWidth*1.6" y2="100" stroke="var(--ui-primary)" stroke-width="2" />
            <polygon :points="`${250 + baseWidth*1.6},100 ${241 + baseWidth*1.6},95 ${241 + baseWidth*1.6},105`" fill="var(--ui-primary)" />
            <g v-for="i in 5" :key="'r'+i"><text :x="150 + (60 + baseWidth*1.4) * (i/6)" :y="150" font-size="11" :fill="`rgba(239,68,68,${0.2 + (1-(carriers[Math.min(23, Math.floor(i*4))]?.survival ?? 0))*0.7})`">×</text></g>
            <text :x="180 + baseWidth*0.8" y="175" text-anchor="middle" font-size="10" fill="currentColor" opacity="0.7">ricombinazione in base</text>
          </svg>
        </UCard>
      </UCard>
    </template>

    <template #parameters>
      <UPageGrid class="lg:grid-cols-2">
        <UCard :ui="{ body: 'space-y-4' }">
          <UBadge color="neutral" variant="soft" size="xs" label="Valori impostati (qualitativi)" class="tracking-wide uppercase w-fit" />
          <UFormField label="Spessore base W_B" :hint="`${baseWidth}`" help="Sottile ← → Spessa">
            <USlider v-model="baseWidth" :min="10" :max="100" :step="1" />
          </UFormField>
          <UFormField label="Drogaggio (rel.)" :hint="`${doping}`">
            <USlider v-model="doping" :min="10" :max="100" :step="1" />
          </UFormField>
          <UFormField label="Vita media τ (rel.)" :hint="`${lifetime}`" help="Ricombinazione alta ← → bassa">
            <USlider v-model="lifetime" :min="10" :max="100" :step="1" />
          </UFormField>
        </UCard>
        <UCard :ui="{ body: 'space-y-3' }">
          <UBadge color="neutral" variant="soft" size="xs" label="Valori calcolati" class="tracking-wide uppercase w-fit" />
          <UPageGrid class="grid-cols-2 gap-2">
            <UCard :ui="{ body: 'p-3 space-y-1' }"><UBadge color="neutral" variant="soft" size="xs" label="α_F" /><UBadge color="primary" variant="subtle" :label="fmt(alphaF, 4)" class="text-lg font-mono font-semibold" /></UCard>
            <UCard :ui="{ body: 'p-3 space-y-1' }"><UBadge color="neutral" variant="soft" size="xs" label="β_F" /><UBadge color="primary" variant="subtle" :label="fmt(betaF, 1)" class="text-lg font-mono font-semibold" /></UCard>
          </UPageGrid>
          <UAlert color="neutral" variant="soft" description="Modello qualitativo: i valori rappresentano l’andamento atteso al variare dei parametri strutturali." />
        </UCard>
      </UPageGrid>
    </template>

    <template #results>
      <UCard :ui="{ body: 'p-3 sm:p-4 space-y-2' }">
        <UPageHeader title="Frazione di portatori raccolti" description="Profilo qualitativo lungo la base (0 = emettitore, 1 = collettore)" :ui="{ root: 'border-b-0 py-0', title: 'text-base font-medium text-highlighted', description: 'text-xs text-muted' }" />
        <svg :viewBox="`0 0 ${chart.W} ${chart.H}`" class="w-full min-w-[280px] h-auto">
          <line :x1="chart.pad.l" :y1="chart.H-chart.pad.b" :x2="chart.W-chart.pad.r" :y2="chart.H-chart.pad.b" stroke="currentColor" stroke-opacity="0.25" />
          <line :x1="chart.pad.l" :y1="chart.pad.t" :x2="chart.pad.l" :y2="chart.H-chart.pad.b" stroke="currentColor" stroke-opacity="0.25" />
          <g v-for="t in chart.yTicks" :key="t.v"><line :x1="chart.pad.l" :x2="chart.W-chart.pad.r" :y1="t.y" :y2="t.y" stroke="currentColor" stroke-opacity="0.06" /><text :x="chart.pad.l-6" :y="t.y+3" text-anchor="end" font-size="9" fill="currentColor" opacity="0.6">{{ (t.v*100).toFixed(0) }}%</text></g>
          <path :d="chart.path" fill="none" stroke="var(--ui-primary)" stroke-width="2" />
          <text :x="chart.W/2" :y="chart.H-4" text-anchor="middle" font-size="10" fill="currentColor" opacity="0.6">Posizione nella base</text>
        </svg>
      </UCard>
    </template>

    <template #analysis>
      <UPageGrid class="grid-cols-1 gap-2">
        <UAlert v-for="(item, i) in analysisItems" :key="i" color="neutral" variant="soft" icon="i-lucide-info" :description="item" />
      </UPageGrid>
    </template>

    <template #conclusion>
      <UAlert color="neutral" variant="soft" description="La geometria e la qualità della base sono determinanti per l’efficienza di trasporto del BJT e per il guadagno di corrente ottenibile." />
      <UCard class="mt-2">
        <UBadge color="neutral" variant="soft" size="xs" label="Verifica teorica" class="tracking-wide uppercase w-fit mb-2" />
        <UAlert color="primary" variant="subtle" description="L’andamento osservato è coerente con il modello fisico del trasporto in base e con la relazione β_F = α_F/(1−α_F)." />
      </UCard>
    </template>
  </SimulationShell>
</template>

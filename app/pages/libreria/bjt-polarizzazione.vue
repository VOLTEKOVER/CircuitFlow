<script setup lang="ts">
useSeoMeta({
  title: 'Polarizzazione e caratteristica esponenziale — CircuitFlow',
  description: 'Simulazione interattiva di V_BE, I_C, I_B, α_F e β_F per il BJT in zona attiva.'
})

const vbe = ref(0.7)
const ib_uA = ref(50)
const betaF = ref(100)
const is = ref(1e-14)
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

const icFromVbe = computed(() => is.value * (clampExp(vbe.value / Math.max(vt.value, 1e-6)) - 1))
const icFromIb = computed(() => (ib_uA.value * 1e-6) * betaF.value)
const alphaF = computed(() => betaF.value / (1 + betaF.value))
const ibFromVbe = computed(() => icFromVbe.value / Math.max(betaF.value, 0.001))

const transferChart = computed(() => {
  const W = 520, H = 240, pad = { l: 52, r: 16, t: 14, b: 34 }
  const xMin = 0.4, xMax = 0.85
  const steps = 120
  const pts: { x: number, y: number }[] = []
  let yMax = 1e-9
  for (let i = 0; i <= steps; i++) {
    const x = xMin + (xMax - xMin) * i / steps
    const y = Math.max(0, is.value * (clampExp(x / Math.max(vt.value, 1e-6)) - 1))
    pts.push({ x, y })
    if (y > yMax) yMax = y
  }
  yMax = yMax * 1.1 || 1e-6
  const sx = (x: number) => pad.l + (x - xMin) / (xMax - xMin) * (W - pad.l - pad.r)
  const sy = (y: number) => H - pad.b - (y / yMax) * (H - pad.t - pad.b)
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${sx(p.x).toFixed(2)} ${sy(p.y).toFixed(2)}`).join(' ')
  const opX = sx(Math.min(xMax, Math.max(xMin, vbe.value)))
  const opY = sy(Math.min(yMax, Math.max(0, icFromVbe.value)))
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(t => ({ y: sy(yMax * t), label: fmtI(yMax * t) }))
  const xTicks = [0.4, 0.5, 0.6, 0.7, 0.8].map(v => ({ x: sx(v), v }))
  return { W, H, pad, path, opX, opY, yTicks, xTicks }
})

const ibChart = computed(() => {
  const W = 520, H = 240, pad = { l: 52, r: 16, t: 14, b: 34 }
  const xMin = 0, xMax = 200
  const betas = [50, 100, 200]
  const yMax = (xMax * 1e-6) * 200 * 1.1
  const sx = (x: number) => pad.l + (x - xMin) / (xMax - xMin) * (W - pad.l - pad.r)
  const sy = (y: number) => H - pad.b - (y / yMax) * (H - pad.t - pad.b)
  const colors = ['#67e8f9', '#22d3ee', '#0891b2']
  const curves = betas.map((b, i) => ({
    b, color: colors[i],
    path: `M ${sx(0)} ${sy(0)} L ${sx(xMax)} ${sy(xMax * 1e-6 * b)}`
  }))
  const opX = sx(ib_uA.value)
  const opY = sy(Math.min(yMax, icFromIb.value))
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(t => ({ y: sy(yMax * t), label: fmtI(yMax * t) }))
  const xTicks = [0, 50, 100, 150, 200].map(v => ({ x: sx(v), v }))
  return { W, H, pad, curves, opX, opY, yTicks, xTicks }
})

const alphaTable = computed(() => [0.90, 0.95, 0.98, 0.99].map(a => ({ a, b: a / (1 - a) })))

const analysisItems = [
  'Piccole variazioni di V_BE (decine di mV) producono grandi variazioni di I_C, come previsto dalla legge esponenziale.',
  'A parità di I_B, un β_F maggiore determina una corrente di collettore proporzionalmente maggiore (andamento lineare).',
  'Una riduzione di α_F dovuta a ricombinazione in base provoca una forte riduzione di β_F, riducendo l’efficacia di amplificazione.'
]
</script>

<template>
  <SimulationShell
    chapter="02"
    sim="02"
    title="Polarizzazione e caratteristica esponenziale"
    subtitle="Variazione di V_BE, I_B, α_F e β_F in zona attiva"
    objective="Verificare la dipendenza esponenziale di I_C da V_BE e la relazione lineare I_C = β_F · I_B, analizzando l’effetto di α_F e β_F."
  >
    <template #theory>
      <UAlert color="neutral" variant="soft" description="In zona attiva la corrente di collettore dipende in modo esponenziale dalla tensione base-emettitore ed è proporzionale alla corrente di base tramite il guadagno di corrente." />
      <UCard :ui="{ body: 'text-sm inline-block space-y-1' }">
        <MathBlock tex="I_C \approx I_S\, e^{V_{BE}/V_T}" />
        <MathBlock tex="I_C = \beta_F\, I_B" />
        <MathBlock tex="\beta_F = \frac{\alpha_F}{1 - \alpha_F}" />
      </UCard>
    </template>

    <template #schema>
      <UCard :ui="{ body: 'p-3 sm:p-4' }">
        <UCard :ui="{ body: 'p-3 bg-elevated/10' }">
          <svg viewBox="0 0 520 200" class="w-full h-auto">
            <text x="250" y="20" font-size="11" fill="currentColor" opacity="0.7">V_CC</text>
            <line x1="260" y1="24" x2="260" y2="40" stroke="currentColor" stroke-opacity="0.5" stroke-width="2" />
            <rect x="245" y="40" width="30" height="40" fill="none" stroke="currentColor" stroke-width="2" />
            <text x="280" y="64" font-size="10" fill="currentColor">R_C</text>
            <line x1="260" y1="80" x2="260" y2="95" stroke="currentColor" stroke-opacity="0.5" stroke-width="2" />
            <line x1="230" y1="95" x2="230" y2="135" stroke="currentColor" stroke-width="4" />
            <line x1="160" y1="115" x2="230" y2="115" stroke="currentColor" stroke-opacity="0.5" stroke-width="2" />
            <line x1="230" y1="103" x2="260" y2="87" stroke="currentColor" stroke-width="2" />
            <line x1="230" y1="127" x2="260" y2="143" stroke="currentColor" stroke-width="2" />
            <polygon points="260,143 249,133 246,147" fill="currentColor" />
            <circle cx="245" cy="115" r="32" fill="none" stroke="currentColor" stroke-opacity="0.3" stroke-width="1.5" />
            <line x1="260" y1="143" x2="260" y2="170" stroke="currentColor" stroke-opacity="0.5" stroke-width="2" />
            <line x1="245" y1="170" x2="275" y2="170" stroke="currentColor" stroke-opacity="0.5" stroke-width="2" />
            <rect x="100" y="100" width="40" height="30" fill="none" stroke="currentColor" stroke-width="2" />
            <line x1="60" y1="115" x2="100" y2="115" stroke="currentColor" stroke-opacity="0.5" stroke-width="2" />
            <text x="106" y="145" font-size="10" fill="currentColor">R_B</text>
            <text x="30" y="100" font-size="10" fill="currentColor">V_BB</text>
            <line x1="60" y1="104" x2="60" y2="126" stroke="currentColor" stroke-opacity="0.5" stroke-width="2" />
            <text x="320" y="80" font-size="11" fill="currentColor" opacity="0.75">V_BE controlla I_C</text>
            <text x="320" y="100" font-size="11" fill="currentColor" opacity="0.75">I_B = (V_BB − V_BE)/R_B</text>
            <text x="320" y="120" font-size="11" fill="currentColor" opacity="0.75">I_C = β_F · I_B</text>
          </svg>
        </UCard>
      </UCard>
    </template>

    <template #parameters>
      <UPageGrid class="lg:grid-cols-3">
        <UCard class="lg:col-span-2" :ui="{ body: 'space-y-4' }">
          <UBadge color="neutral" variant="soft" size="xs" label="Valori impostati" class="tracking-wide uppercase w-fit" />
          <UPageGrid class="sm:grid-cols-2 gap-x-6 gap-y-4">
            <UFormField label="V_BE" :hint="`${vbe.toFixed(3)} V`" class="sm:col-span-2">
              <USlider v-model="vbe" :min="0.4" :max="0.85" :step="0.001" />
            </UFormField>
            <UFormField label="I_B" :hint="`${ib_uA} µA`" class="sm:col-span-2">
              <USlider v-model="ib_uA" :min="0" :max="200" :step="1" />
            </UFormField>
            <UFormField label="β_F" :hint="`${betaF}`">
              <USlider v-model="betaF" :min="20" :max="300" :step="1" />
            </UFormField>
            <UFormField label="I_S (A)" size="sm">
              <UInput v-model.number="is" type="number" step="any" size="sm" />
            </UFormField>
            <UFormField label="V_T (V)" size="sm">
              <UInput v-model.number="vt" type="number" step="0.0001" size="sm" />
            </UFormField>
          </UPageGrid>
        </UCard>
        <UCard :ui="{ body: 'space-y-3' }">
          <UBadge color="neutral" variant="soft" size="xs" label="Valori calcolati" class="tracking-wide uppercase w-fit" />
          <UCard :ui="{ body: 'space-y-2' }">
            <UCard :ui="{ body: 'flex justify-between p-2 text-sm' }"><UBadge color="neutral" variant="soft" label="I_C da V_BE" /><UBadge color="primary" variant="subtle" :label="fmtI(icFromVbe)" class="font-mono" /></UCard>
            <UCard :ui="{ body: 'flex justify-between p-2 text-sm' }"><UBadge color="neutral" variant="soft" label="I_B ≈ I_C/β" /><UBadge color="primary" variant="subtle" :label="fmtI(ibFromVbe)" class="font-mono" /></UCard>
            <UCard :ui="{ body: 'flex justify-between p-2 text-sm' }"><UBadge color="neutral" variant="soft" label="I_C da I_B" /><UBadge color="primary" variant="subtle" :label="fmtI(icFromIb)" class="font-mono" /></UCard>
            <UCard :ui="{ body: 'flex justify-between p-2 text-sm' }"><UBadge color="neutral" variant="soft" label="α_F" /><UBadge color="primary" variant="subtle" :label="alphaF.toFixed(5)" class="font-mono" /></UCard>
          </UCard>
          <UCard :ui="{ body: 'p-2 space-y-1' }">
            <UBadge color="neutral" variant="soft" size="xs" label="α_F → β_F (ricombinazione)" class="w-fit" />
            <UPageGrid class="grid-cols-1 gap-1">
              <UCard v-for="row in alphaTable" :key="row.a" :ui="{ body: 'flex justify-between text-xs font-mono py-0.5 px-2' }">
                <UBadge color="neutral" variant="soft" size="xs" :label="`α=${row.a.toFixed(2)}`" />
                <UBadge color="primary" variant="subtle" size="xs" :label="`β=${row.b.toFixed(1)}`" />
              </UCard>
            </UPageGrid>
          </UCard>
        </UCard>
      </UPageGrid>
    </template>

    <template #results>
      <UPageGrid class="lg:grid-cols-2">
        <UCard :ui="{ body: 'p-3 sm:p-4 space-y-2' }">
          <UPageHeader title="I_C = f(V_BE)" description="Caratteristica esponenziale" :ui="{ root: 'border-b-0 py-0', title: 'text-base font-medium text-highlighted', description: 'text-xs text-muted' }" />
          <svg :viewBox="`0 0 ${transferChart.W} ${transferChart.H}`" class="w-full min-w-[280px] h-auto">
            <line :x1="transferChart.pad.l" :y1="transferChart.H-transferChart.pad.b" :x2="transferChart.W-transferChart.pad.r" :y2="transferChart.H-transferChart.pad.b" stroke="currentColor" stroke-opacity="0.25" />
            <line :x1="transferChart.pad.l" :y1="transferChart.pad.t" :x2="transferChart.pad.l" :y2="transferChart.H-transferChart.pad.b" stroke="currentColor" stroke-opacity="0.25" />
            <g v-for="(t,i) in transferChart.yTicks" :key="'y'+i"><text :x="transferChart.pad.l-6" :y="t.y+3" text-anchor="end" font-size="9" fill="currentColor" opacity="0.6">{{ t.label }}</text></g>
            <g v-for="t in transferChart.xTicks" :key="'x'+t.v"><text :x="t.x" :y="transferChart.H-transferChart.pad.b+14" text-anchor="middle" font-size="9" fill="currentColor" opacity="0.6">{{ t.v }}</text></g>
            <path :d="transferChart.path" fill="none" stroke="var(--ui-primary)" stroke-width="2" />
            <circle :cx="transferChart.opX" :cy="transferChart.opY" r="4.5" fill="var(--ui-primary)" />
            <text :x="transferChart.W/2" :y="transferChart.H-4" text-anchor="middle" font-size="10" fill="currentColor" opacity="0.6">V_BE (V)</text>
          </svg>
        </UCard>
        <UCard :ui="{ body: 'p-3 sm:p-4 space-y-2' }">
          <UPageHeader title="I_C = f(I_B)" description="Dipendenza dal guadagno β_F" :ui="{ root: 'border-b-0 py-0', title: 'text-base font-medium text-highlighted', description: 'text-xs text-muted' }" />
          <svg :viewBox="`0 0 ${ibChart.W} ${ibChart.H}`" class="w-full min-w-[280px] h-auto">
            <line :x1="ibChart.pad.l" :y1="ibChart.H-ibChart.pad.b" :x2="ibChart.W-ibChart.pad.r" :y2="ibChart.H-ibChart.pad.b" stroke="currentColor" stroke-opacity="0.25" />
            <line :x1="ibChart.pad.l" :y1="ibChart.pad.t" :x2="ibChart.pad.l" :y2="ibChart.H-ibChart.pad.b" stroke="currentColor" stroke-opacity="0.25" />
            <g v-for="(t,i) in ibChart.yTicks" :key="'iy'+i"><text :x="ibChart.pad.l-6" :y="t.y+3" text-anchor="end" font-size="9" fill="currentColor" opacity="0.6">{{ t.label }}</text></g>
            <g v-for="t in ibChart.xTicks" :key="'ix'+t.v"><text :x="t.x" :y="ibChart.H-ibChart.pad.b+14" text-anchor="middle" font-size="9" fill="currentColor" opacity="0.6">{{ t.v }}</text></g>
            <path v-for="c in ibChart.curves" :key="c.b" :d="c.path" fill="none" :stroke="c.color" stroke-width="2" />
            <circle :cx="ibChart.opX" :cy="ibChart.opY" r="4.5" fill="var(--ui-primary)" />
            <g v-for="(c,i) in ibChart.curves" :key="'l'+c.b"><line :x1="ibChart.W-ibChart.pad.r-70" :x2="ibChart.W-ibChart.pad.r-54" :y1="ibChart.pad.t+10+i*14" :y2="ibChart.pad.t+10+i*14" :stroke="c.color" stroke-width="2" /><text :x="ibChart.W-ibChart.pad.r-50" :y="ibChart.pad.t+13+i*14" font-size="9" fill="currentColor" opacity="0.7">β={{ c.b }}</text></g>
            <text :x="ibChart.W/2" :y="ibChart.H-4" text-anchor="middle" font-size="10" fill="currentColor" opacity="0.6">I_B (µA)</text>
          </svg>
        </UCard>
      </UPageGrid>
    </template>

    <template #analysis>
      <UPageGrid class="grid-cols-1 gap-2">
        <UAlert v-for="(item, i) in analysisItems" :key="i" color="neutral" variant="soft" icon="i-lucide-info" :description="item" />
      </UPageGrid>
    </template>

    <template #conclusion>
      <UAlert color="neutral" variant="soft" description="La simulazione conferma la natura esponenziale della giunzione base-emettitore e il ruolo del guadagno di corrente nel controllo di I_C tramite I_B." />
      <UCard class="mt-2">
        <UBadge color="neutral" variant="soft" size="xs" label="Verifica teorica" class="tracking-wide uppercase w-fit mb-2" />
        <UAlert color="primary" variant="subtle" description="Gli andamenti ottenuti sono coerenti con I_C ≈ I_S·e^(V_BE/V_T) e con I_C = β_F·I_B in zona attiva." />
      </UCard>
    </template>
  </SimulationShell>
</template>
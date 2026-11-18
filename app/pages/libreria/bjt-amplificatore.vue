<script setup lang="ts">
useSeoMeta({
  title: 'Punto di lavoro e amplificatore CE — CircuitFlow',
  description: 'Analisi DC/AC di un BJT in configurazione a emettitore comune: retta di carico, punto Q e guadagno.'
})

const vcc = ref(12)
const rc = ref(2.2)
const rb = ref(470)
const beta = ref(100)
const vbeOn = ref(0.7)
const vt = ref(25.85)
const reUnbyp = ref(0)

const ib = computed(() => Math.max(0, (vcc.value - vbeOn.value)) / (rb.value * 1e3))
const ic = computed(() => beta.value * ib.value)
const ie = computed(() => ic.value + ib.value)
const vce = computed(() => vcc.value - ic.value * (rc.value * 1e3))
const icSat = computed(() => vcc.value / (rc.value * 1e3))

const region = computed(() => {
  if (ib.value <= 1e-9) return { name: 'Interdizione', color: 'neutral' as const }
  if (vce.value <= 0.2) return { name: 'Saturazione', color: 'warning' as const }
  return { name: 'Zona attiva', color: 'success' as const }
})

const gm = computed(() => ic.value / (vt.value * 1e-3))
const rpi = computed(() => beta.value / Math.max(gm.value, 1e-12))
const av = computed(() => region.value.name === 'Zona attiva' ? -gm.value * (rc.value * 1e3) / (1 + gm.value * reUnbyp.value) : 0)

function fmtI(a: number) {
  const abs = Math.abs(a)
  if (abs >= 1e-3) return `${(a * 1e3).toFixed(3)} mA`
  if (abs >= 1e-6) return `${(a * 1e6).toFixed(2)} µA`
  return `${(a * 1e9).toFixed(1)} nA`
}

const loadLine = computed(() => {
  const W = 520, H = 260, pad = { l: 54, r: 16, t: 16, b: 36 }
  const xMax = Math.max(12, vcc.value)
  const yMax = Math.max(icSat.value * 1.1, 0.001)
  const sx = (x: number) => pad.l + (x / xMax) * (W - pad.l - pad.r)
  const sy = (y: number) => H - pad.b - (y / yMax) * (H - pad.t - pad.b)
  const ll = `M ${sx(0)} ${sy(icSat.value)} L ${sx(vcc.value)} ${sy(0)}`
  const ibVals = [ib.value * 0.5, ib.value, ib.value * 1.5, ib.value * 2].map(x => Math.max(x, 1e-7))
  const colors = ['#a5f3fc', '#22d3ee', '#0891b2', '#155e75']
  const va = 80
  const curves = ibVals.map((ibv, idx) => {
    const icActive = beta.value * ibv
    const pts: string[] = []
    for (let i = 0; i <= 80; i++) {
      const vcex = xMax * i / 80
      let icy = 0
      if (vcex < 0.2) icy = icActive * (vcex / 0.2)
      else icy = icActive * (1 + vcex / va)
      pts.push(`${i === 0 ? 'M' : 'L'} ${sx(vcex).toFixed(2)} ${sy(Math.min(yMax, icy)).toFixed(2)}`)
    }
    return { ibv, color: colors[idx], path: pts.join(' '), active: idx === 1 }
  })
  const qx = sx(Math.min(xMax, Math.max(0, vce.value)))
  const qy = sy(Math.min(yMax, Math.max(0, ic.value)))
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(t => ({ y: sy(yMax * t), label: fmtI(yMax * t) }))
  const xTicks = Array.from({ length: 6 }, (_, i) => xMax * i / 5).map(v => ({ x: sx(v), v: v.toFixed(1) }))
  return { W, H, pad, ll, curves, qx, qy, yTicks, xTicks }
})

const analysisItems = [
  'Il punto Q è l’intersezione tra la retta di carico V_CE = V_CC − R_C·I_C e la caratteristica del transistor per l’I_B imposto.',
  'Se Q cade in zona attiva il circuito può amplificare; se V_CE è troppo basso si entra in saturazione, se I_B≈0 in interdizione.',
  'Il guadagno a piccolo segnale cresce con g_m (quindi con I_C) e con R_C, compatibilmente con i limiti di escursione del punto Q.'
]
</script>

<template>
  <SimulationShell
    chapter="05"
    sim="01"
    title="Punto di lavoro e amplificatore CE"
    subtitle="Polarizzazione, retta di carico e guadagno a emettitore comune"
    objective="Determinare il punto di lavoro Q di un BJT in configurazione a emettitore comune mediante analisi DC/grafica e stimare il guadagno a piccolo segnale."
  >
    <template #theory>
      <UAlert color="neutral" variant="soft" description="La polarizzazione fissa le correnti e le tensioni di riposo (punto Q). La retta di carico di uscita rappresenta il vincolo imposto dalla rete esterna; il guadagno in piccolo segnale dipende da g_m e dalle resistenze del circuito." />
      <UCard :ui="{ body: 'text-sm inline-block space-y-1' }">
        <MathBlock tex="I_B = \frac{V_{CC} - V_{BE}}{R_B}" />
        <MathBlock tex="I_C = \beta\, I_B" />
        <MathBlock tex="V_{CE} = V_{CC} - R_C I_C" />
        <MathBlock tex="A_v \approx -g_m R_C \quad (R_E\ \text{bypassata})" />
      </UCard>
    </template>

    <template #schema>
      <UCard :ui="{ body: 'p-3 sm:p-4' }">
        <UPageGrid class="lg:grid-cols-2">
          <UCard :ui="{ body: 'p-2 bg-elevated/10' }">
            <svg viewBox="0 0 360 240" class="w-full h-auto">
              <text x="170" y="18" font-size="11" fill="currentColor">V_CC = {{ vcc }} V</text>
              <line x1="180" y1="22" x2="180" y2="40" stroke="currentColor" stroke-opacity="0.5" stroke-width="2" />
              <rect x="165" y="40" width="30" height="50" fill="none" stroke="currentColor" stroke-width="2" />
              <text x="200" y="70" font-size="10" fill="currentColor">R_C {{ rc }}k</text>
              <line x1="180" y1="90" x2="180" y2="110" stroke="currentColor" stroke-opacity="0.5" stroke-width="2" />
              <line x1="150" y1="110" x2="150" y2="150" stroke="currentColor" stroke-width="4" />
              <line x1="90" y1="130" x2="150" y2="130" stroke="currentColor" stroke-opacity="0.5" stroke-width="2" />
              <line x1="150" y1="118" x2="180" y2="102" stroke="currentColor" stroke-width="2" />
              <line x1="150" y1="142" x2="180" y2="158" stroke="currentColor" stroke-width="2" />
              <polygon points="180,158 169,148 166,162" fill="currentColor" />
              <circle cx="165" cy="130" r="35" fill="none" stroke="currentColor" stroke-opacity="0.3" stroke-width="1.5" />
              <line x1="180" y1="158" x2="180" y2="210" stroke="currentColor" stroke-opacity="0.5" stroke-width="2" />
              <line x1="165" y1="210" x2="195" y2="210" stroke="currentColor" stroke-opacity="0.5" stroke-width="2" />
              <line x1="170" y1="216" x2="190" y2="216" stroke="currentColor" stroke-opacity="0.5" stroke-width="2" />
              <line x1="175" y1="222" x2="185" y2="222" stroke="currentColor" stroke-opacity="0.5" stroke-width="2" />
              <line x1="40" y1="22" x2="40" y2="130" stroke="currentColor" stroke-opacity="0.5" stroke-width="2" />
              <rect x="50" y="115" width="40" height="30" fill="none" stroke="currentColor" stroke-width="2" />
              <line x1="40" y1="130" x2="50" y2="130" stroke="currentColor" stroke-opacity="0.5" stroke-width="2" />
              <text x="45" y="160" font-size="10" fill="currentColor">R_B {{ rb }}k</text>
              <text x="30" y="18" font-size="11" fill="currentColor">V_CC</text>
              <text x="210" y="110" font-size="10" fill="var(--ui-primary)">V_CE {{ vce.toFixed(2) }}V</text>
            </svg>
          </UCard>
          <UCard :ui="{ body: 'space-y-3 justify-center' }">
            <UCard :ui="{ body: 'flex items-center justify-between p-2' }"><UBadge color="neutral" variant="soft" label="Regione operativa" /><UBadge :color="region.color" variant="subtle" :label="region.name" /></UCard>
            <UCard :ui="{ body: 'space-y-1' }">
              <UBadge color="neutral" variant="soft" size="xs" label="Punto Q (calcolato)" class="tracking-wide uppercase w-fit mb-1" />
              <UBadge color="primary" variant="subtle" :label="`I_B = ${fmtI(ib)}`" class="font-mono w-fit" />
              <UBadge color="primary" variant="subtle" :label="`I_C = ${fmtI(ic)}`" class="font-mono w-fit" />
              <UBadge color="primary" variant="subtle" :label="`V_CE = ${vce.toFixed(3)} V`" class="font-mono w-fit" />
            </UCard>
          </UCard>
        </UPageGrid>
      </UCard>
    </template>

    <template #parameters>
      <UCard :ui="{ body: 'space-y-4' }">
        <UBadge color="neutral" variant="soft" size="xs" label="Valori impostati" class="tracking-wide uppercase w-fit" />
        <UPageGrid class="sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <UFormField label="V_CC" :hint="`${vcc} V`"><USlider v-model="vcc" :min="5" :max="20" :step="0.5" /></UFormField>
          <UFormField label="R_C" :hint="`${rc} kΩ`"><USlider v-model="rc" :min="0.5" :max="10" :step="0.1" /></UFormField>
          <UFormField label="R_B" :hint="`${rb} kΩ`"><USlider v-model="rb" :min="50" :max="1000" :step="10" /></UFormField>
          <UFormField label="β_F" :hint="`${beta}`"><USlider v-model="beta" :min="20" :max="300" :step="1" /></UFormField>
        </UPageGrid>
      </UCard>
    </template>

    <template #results>
      <UPageGrid class="grid-cols-1 gap-4">
        <UCard :ui="{ body: 'p-3 sm:p-4 space-y-2' }">
          <UPageHeader title="Retta di carico e punto Q" description="Piano di uscita I_C–V_CE con retta di carico DC e punto operativo" :ui="{ root: 'border-b-0 py-0', title: 'text-base font-medium text-highlighted', description: 'text-xs text-muted' }" />
          <svg :viewBox="`0 0 ${loadLine.W} ${loadLine.H}`" class="w-full min-w-[300px] h-auto">
            <line :x1="loadLine.pad.l" :y1="loadLine.H-loadLine.pad.b" :x2="loadLine.W-loadLine.pad.r" :y2="loadLine.H-loadLine.pad.b" stroke="currentColor" stroke-opacity="0.25" />
            <line :x1="loadLine.pad.l" :y1="loadLine.pad.t" :x2="loadLine.pad.l" :y2="loadLine.H-loadLine.pad.b" stroke="currentColor" stroke-opacity="0.25" />
            <g v-for="(t,i) in loadLine.yTicks" :key="'ly'+i"><text :x="loadLine.pad.l-6" :y="t.y+3" text-anchor="end" font-size="9" fill="currentColor" opacity="0.6">{{ t.label }}</text></g>
            <g v-for="t in loadLine.xTicks" :key="'lx'+t.v"><text :x="t.x" :y="loadLine.H-loadLine.pad.b+14" text-anchor="middle" font-size="9" fill="currentColor" opacity="0.6">{{ t.v }}</text></g>
            <path v-for="c in loadLine.curves" :key="c.ibv" :d="c.path" fill="none" :stroke="c.color" :stroke-width="c.active ? 2.2 : 1.2" :stroke-opacity="c.active ? 1 : 0.5" />
            <path :d="loadLine.ll" fill="none" stroke="var(--ui-primary)" stroke-width="2.5" />
            <circle :cx="loadLine.qx" :cy="loadLine.qy" r="5" fill="var(--ui-primary)" stroke="white" stroke-width="1.5" />
            <text :x="loadLine.qx + 8" :y="loadLine.qy - 8" font-size="10" fill="var(--ui-primary)" font-weight="600">Q</text>
            <text :x="loadLine.W/2" :y="loadLine.H-4" text-anchor="middle" font-size="10" fill="currentColor" opacity="0.6">V_CE (V)</text>
            <text :x="12" :y="loadLine.H/2" text-anchor="middle" font-size="10" fill="currentColor" opacity="0.6" transform="rotate(-90 12 130)">I_C</text>
          </svg>
        </UCard>
        <UPageGrid class="sm:grid-cols-2">
          <UCard :ui="{ body: 'space-y-2' }">
            <UBadge color="neutral" variant="soft" size="xs" label="Valori calcolati (DC)" class="tracking-wide uppercase w-fit mb-1" />
            <UCard :ui="{ body: 'flex justify-between p-2 text-sm' }"><UBadge color="neutral" variant="soft" label="I_B" /><UBadge color="primary" variant="subtle" :label="fmtI(ib)" class="font-mono" /></UCard>
            <UCard :ui="{ body: 'flex justify-between p-2 text-sm' }"><UBadge color="neutral" variant="soft" label="I_C" /><UBadge color="primary" variant="subtle" :label="fmtI(ic)" class="font-mono" /></UCard>
            <UCard :ui="{ body: 'flex justify-between p-2 text-sm' }"><UBadge color="neutral" variant="soft" label="V_CE" /><UBadge color="primary" variant="subtle" :label="`${vce.toFixed(3)} V`" class="font-mono" /></UCard>
            <UCard :ui="{ body: 'flex justify-between p-2 text-sm' }"><UBadge color="neutral" variant="soft" label="I_C(sat)" /><UBadge color="primary" variant="subtle" :label="fmtI(icSat)" class="font-mono" /></UCard>
          </UCard>
          <UCard :ui="{ body: 'space-y-2' }">
            <UBadge color="neutral" variant="soft" size="xs" label="Piccolo segnale (stima)" class="tracking-wide uppercase w-fit mb-1" />
            <UCard :ui="{ body: 'flex justify-between p-2 text-sm' }"><UBadge color="neutral" variant="soft" label="g_m" /><UBadge color="primary" variant="subtle" :label="`${gm.toFixed(4)} S`" class="font-mono" /></UCard>
            <UCard :ui="{ body: 'flex justify-between p-2 text-sm' }"><UBadge color="neutral" variant="soft" label="r_π" /><UBadge color="primary" variant="subtle" :label="`${(rpi/1000).toFixed(2)} kΩ`" class="font-mono" /></UCard>
            <UCard :ui="{ body: 'flex justify-between p-2 text-sm' }"><UBadge color="neutral" variant="soft" label="A_v ≈ −g_m R_C" /><UBadge color="primary" variant="subtle" :label="av.toFixed(2)" class="font-mono" /></UCard>
          </UCard>
        </UPageGrid>
      </UPageGrid>
    </template>

    <template #analysis>
      <UPageGrid class="grid-cols-1 gap-2">
        <UAlert v-for="(item, i) in analysisItems" :key="i" color="neutral" variant="soft" icon="i-lucide-info" :description="item" />
      </UPageGrid>
    </template>

    <template #conclusion>
      <UAlert color="neutral" variant="soft" description="L’analisi grafica e analitica fornisce il punto di lavoro e consente di verificare la regione operativa e la capacità di amplificazione del circuito CE." />
      <UCard class="mt-2">
        <UBadge color="neutral" variant="soft" size="xs" label="Verifica teorica" class="tracking-wide uppercase w-fit mb-2" />
        <UAlert color="primary" variant="subtle" description="I valori di I_B, I_C, V_CE e il guadagno stimato sono coerenti con le equazioni di polarizzazione e il modello a piccolo segnale." />
      </UCard>
    </template>
  </SimulationShell>
</template>
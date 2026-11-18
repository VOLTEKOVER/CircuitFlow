<script setup lang="ts">
useSeoMeta({
  title: 'Curve caratteristiche BJT — CircuitFlow',
  description: 'Curve di trasferimento e di uscita per transistor BJT NPN e PNP.'
})

const device = ref<'NPN' | 'PNP'>('NPN')
const is = ref(1e-14)
const vt = ref(0.02585)
const betaF = ref(100)
const va = ref(80)

function clampExp(x: number) { return Math.exp(Math.max(-80, Math.min(80, x))) }
function fmtI(a: number) {
  const abs = Math.abs(a)
  if (!Number.isFinite(a)) return '—'
  if (abs >= 1e-3) return `${(a * 1e3).toFixed(2)} mA`
  if (abs >= 1e-6) return `${(a * 1e6).toFixed(1)} µA`
  if (abs >= 1e-9) return `${(a * 1e9).toFixed(1)} nA`
  return `${a.toExponential(1)} A`
}

const ibSteps = [20, 40, 60, 80]

const transfer = computed(() => {
  const W = 520, H = 260, pad = { l: 54, r: 16, t: 16, b: 36 }
  const xMin = 0.4, xMax = 0.85
  const vcbVals = [0, 2, 5]
  let yMax = 1e-9
  const sx = (x: number) => pad.l + (x - xMin) / (xMax - xMin) * (W - pad.l - pad.r)
  const curvesRaw = vcbVals.map((vcb) => {
    const pts: { x: number, y: number }[] = []
    for (let i = 0; i <= 120; i++) {
      const vbe = xMin + (xMax - xMin) * i / 120
      const vbcVal = -vcb
      const ic = Math.max(0, is.value * (clampExp(vbe / vt.value) - clampExp(vbcVal / vt.value)) * (1 + Math.max(0, vbe - vbcVal) / Math.max(va.value, 1)))
      pts.push({ x: vbe, y: ic })
      if (ic > yMax) yMax = ic
    }
    return { vcb, pts }
  })
  yMax = yMax * 1.1 || 1e-6
  const sy = (y: number) => H - pad.b - (y / yMax) * (H - pad.t - pad.b)
  const colors = ['#67e8f9', '#22d3ee', '#0891b2']
  const curves = curvesRaw.map((c, i) => ({ vcb: c.vcb, color: colors[i], path: c.pts.map((p, j) => `${j === 0 ? 'M' : 'L'} ${sx(p.x).toFixed(2)} ${sy(p.y).toFixed(2)}`).join(' ') }))
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(t => ({ y: sy(yMax * t), label: fmtI(yMax * t) }))
  const xTicks = [0.4, 0.5, 0.6, 0.7, 0.8].map(v => ({ x: sx(v), v }))
  return { W, H, pad, curves, yTicks, xTicks }
})

const output = computed(() => {
  const W = 520, H = 260, pad = { l: 54, r: 16, t: 16, b: 36 }
  const xMin = 0, xMax = 10
  let yMax = 1e-6
  const sx = (x: number) => pad.l + (x - xMin) / (xMax - xMin) * (W - pad.l - pad.r)
  const colors = ['#a5f3fc', '#67e8f9', '#22d3ee', '#0891b2']
  const curvesRaw = ibSteps.map((ib) => {
    const pts: { x: number, y: number }[] = []
    for (let i = 0; i <= 120; i++) {
      const vce = xMin + (xMax - xMin) * i / 120
      let ic = 0
      if (vce < 0.2) ic = Math.max(0, (ib * 1e-6) * betaF.value * (vce / 0.2))
      else ic = (ib * 1e-6) * betaF.value * (1 + vce / Math.max(va.value, 1))
      pts.push({ x: vce, y: ic })
      if (ic > yMax) yMax = ic
    }
    return { ib, pts }
  })
  yMax *= 1.15
  const sy = (y: number) => H - pad.b - (y / yMax) * (H - pad.t - pad.b)
  const curves = curvesRaw.map((c, i) => ({ ib: c.ib, color: colors[i], path: c.pts.map((p, j) => `${j === 0 ? 'M' : 'L'} ${sx(p.x).toFixed(2)} ${sy(p.y).toFixed(2)}`).join(' ') }))
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(t => ({ y: sy(yMax * t), label: fmtI(yMax * t) }))
  const xTicks = [0, 2, 4, 6, 8, 10].map(v => ({ x: sx(v), v }))
  return { W, H, pad, curves, yTicks, xTicks }
})

const analysisItems = [
  'La curva di trasferimento mostra la crescita esponenziale di I_C con V_BE; la dipendenza da V_CB è legata alla modulazione della giunzione di collettore.',
  'Nelle curve di uscita si distinguono saturazione (basso V_CE), zona attiva (I_C quasi costante per dato I_B) e, per I_B≈0, interdizione.',
  'La pendenza non nulla in zona attiva rappresenta l’effetto Early, modellato tramite V_A.'
]
</script>

<template>
  <SimulationShell
    chapter="04"
    sim="01"
    title="Curve caratteristiche del BJT"
    subtitle="Curve di trasferimento e di uscita per NPN e PNP"
    objective="Tracciare e interpretare le curve I_C=f(V_BE) e I_C=f(V_CE) per diversi valori di polarizzazione, individuando interdizione, zona attiva e saturazione."
  >
    <template #theory>
      <UAlert color="neutral" variant="soft" description="Le curve caratteristiche descrivono il comportamento del transistor: la caratteristica di trasferimento evidenzia la dipendenza esponenziale da V_BE, mentre le caratteristiche di uscita mostrano l’andamento di I_C al variare di V_CE per valori fissati di I_B." />
      <UCard :ui="{ body: 'space-y-2 text-sm' }">
        <UAlert color="neutral" variant="soft">Trasferimento: <MathInline tex="I_C = f(V_{BE})" /> a <MathInline tex="V_{CB}" /> costante</UAlert>
        <UAlert color="neutral" variant="soft">Uscita: <MathInline tex="I_C = f(V_{CE})" /> a <MathInline tex="I_B" /> costante</UAlert>
        <UAlert color="neutral" variant="soft">Effetto Early: <MathInline tex="I_C \approx I_{C0}\left(1 + \frac{V_{CE}}{V_A}\right)" /></UAlert>
      </UCard>
    </template>

    <template #schema>
      <UCard :ui="{ body: 'p-3 sm:p-4 space-y-3' }">
        <UPageHeader title="Configurazione di misura (a emettitore comune)" :ui="{ root: 'border-b-0 py-0', title: 'text-sm text-muted font-normal' }">
          <template #links>
            <UTabs
              v-model="device"
              :items="[{ label: 'NPN', value: 'NPN' }, { label: 'PNP', value: 'PNP' }]"
              :content="false"
              size="sm"
              class="w-auto"
            />
          </template>
        </UPageHeader>
        <UCard :ui="{ body: 'text-sm text-muted space-y-2 bg-elevated/10' }">
          <UAlert color="neutral" variant="soft" :description="`Per il dispositivo ${device} si tracciano: (1) I_C in funzione di V_${device==='NPN' ? 'BE' : 'EB'} a V_${device==='NPN' ? 'CB' : 'BC'} costante; (2) I_C in funzione di V_${device==='NPN' ? 'CE' : 'EC'} per I_B = 20, 40, 60, 80 µA.`" />
          <UAlert color="neutral" variant="soft" description="Nel PNP le polarità delle tensioni e i versi delle correnti sono invertiti, ma l’andamento qualitativo delle curve è analogo." />
        </UCard>
      </UCard>
    </template>

    <template #parameters>
      <UPageGrid class="lg:grid-cols-2">
        <UCard :ui="{ body: 'space-y-3' }">
          <UBadge color="neutral" variant="soft" size="xs" label="Valori impostati (modello)" class="tracking-wide uppercase w-fit" />
          <UPageGrid class="sm:grid-cols-2 gap-3">
            <UFormField label="β_F" size="sm"><UInput v-model.number="betaF" type="number" step="1" size="sm" /></UFormField>
            <UFormField label="I_S (A)" size="sm"><UInput v-model.number="is" type="number" step="any" size="sm" /></UFormField>
            <UFormField label="V_T (V)" size="sm"><UInput v-model.number="vt" type="number" step="0.0001" size="sm" /></UFormField>
            <UFormField label="V_A (V, Early)" size="sm"><UInput v-model.number="va" type="number" step="1" size="sm" /></UFormField>
          </UPageGrid>
        </UCard>
        <UCard :ui="{ body: 'space-y-2' }">
          <UBadge color="neutral" variant="soft" size="xs" label="Condizioni di simulazione" class="tracking-wide uppercase w-fit mb-1" />
          <UCard :ui="{ body: 'flex justify-between p-2 text-sm' }"><UBadge color="neutral" variant="soft" label="I_B (curve di uscita)" /><UBadge color="primary" variant="subtle" label="20, 40, 60, 80 µA" class="font-mono" /></UCard>
          <UCard :ui="{ body: 'flex justify-between p-2 text-sm' }"><UBadge color="neutral" variant="soft" label="V_CB (trasferimento)" /><UBadge color="primary" variant="subtle" label="0, 2, 5 V" class="font-mono" /></UCard>
          <UCard :ui="{ body: 'flex justify-between p-2 text-sm' }"><UBadge color="neutral" variant="soft" label="V_CE sweep" /><UBadge color="primary" variant="subtle" label="0 → 10 V" class="font-mono" /></UCard>
        </UCard>
      </UPageGrid>
    </template>

    <template #results>
      <UPageGrid class="grid-cols-1 gap-4">
        <UCard :ui="{ body: 'p-3 sm:p-4 space-y-2' }">
          <UPageHeader title="Curva di trasferimento" :description="`I_C = f(V_${device==='NPN'?'BE':'EB'}) per diversi V_${device==='NPN'?'CB':'BC'}`" :ui="{ root: 'border-b-0 py-0', title: 'text-base font-medium text-highlighted', description: 'text-xs text-muted' }" />
          <svg :viewBox="`0 0 ${transfer.W} ${transfer.H}`" class="w-full min-w-[280px] h-auto">
            <line :x1="transfer.pad.l" :y1="transfer.H-transfer.pad.b" :x2="transfer.W-transfer.pad.r" :y2="transfer.H-transfer.pad.b" stroke="currentColor" stroke-opacity="0.25" />
            <line :x1="transfer.pad.l" :y1="transfer.pad.t" :x2="transfer.pad.l" :y2="transfer.H-transfer.pad.b" stroke="currentColor" stroke-opacity="0.25" />
            <g v-for="(t,i) in transfer.yTicks" :key="'ty'+i"><text :x="transfer.pad.l-6" :y="t.y+3" text-anchor="end" font-size="9" fill="currentColor" opacity="0.6">{{ t.label }}</text></g>
            <g v-for="t in transfer.xTicks" :key="'tx'+t.v"><text :x="t.x" :y="transfer.H-transfer.pad.b+14" text-anchor="middle" font-size="9" fill="currentColor" opacity="0.6">{{ t.v }}</text></g>
            <path v-for="c in transfer.curves" :key="c.vcb" :d="c.path" fill="none" :stroke="c.color" stroke-width="2" />
            <g v-for="(c,i) in transfer.curves" :key="'tl'+c.vcb"><line :x1="transfer.W-transfer.pad.r-80" :x2="transfer.W-transfer.pad.r-64" :y1="transfer.pad.t+10+i*14" :y2="transfer.pad.t+10+i*14" :stroke="c.color" stroke-width="2" /><text :x="transfer.W-transfer.pad.r-60" :y="transfer.pad.t+13+i*14" font-size="9" fill="currentColor" opacity="0.7">V_CB={{ c.vcb }}V</text></g>
            <text :x="transfer.W/2" :y="transfer.H-4" text-anchor="middle" font-size="10" fill="currentColor" opacity="0.6">V_{{ device==='NPN'?'BE':'EB' }} (V)</text>
          </svg>
        </UCard>
        <UCard :ui="{ body: 'p-3 sm:p-4 space-y-2' }">
          <UPageHeader title="Curve di uscita" :description="`I_C = f(V_${device==='NPN'?'CE':'EC'}) per diversi I_B`" :ui="{ root: 'border-b-0 py-0', title: 'text-base font-medium text-highlighted', description: 'text-xs text-muted' }" />
          <svg :viewBox="`0 0 ${output.W} ${output.H}`" class="w-full min-w-[280px] h-auto">
            <line :x1="output.pad.l" :y1="output.H-output.pad.b" :x2="output.W-output.pad.r" :y2="output.H-output.pad.b" stroke="currentColor" stroke-opacity="0.25" />
            <line :x1="output.pad.l" :y1="output.pad.t" :x2="output.pad.l" :y2="output.H-output.pad.b" stroke="currentColor" stroke-opacity="0.25" />
            <line :x1="output.pad.l + (0.2/10)*(output.W-output.pad.l-output.pad.r)" :y1="output.pad.t" :x2="output.pad.l + (0.2/10)*(output.W-output.pad.l-output.pad.r)" :y2="output.H-output.pad.b" stroke="currentColor" stroke-opacity="0.15" stroke-dasharray="4 4" />
            <text :x="output.pad.l + (0.2/10)*(output.W-output.pad.l-output.pad.r) + 4" :y="output.pad.t + 12" font-size="9" fill="currentColor" opacity="0.5">sat.</text>
            <g v-for="(t,i) in output.yTicks" :key="'oy'+i"><text :x="output.pad.l-6" :y="t.y+3" text-anchor="end" font-size="9" fill="currentColor" opacity="0.6">{{ t.label }}</text></g>
            <g v-for="t in output.xTicks" :key="'ox'+t.v"><text :x="t.x" :y="output.H-output.pad.b+14" text-anchor="middle" font-size="9" fill="currentColor" opacity="0.6">{{ t.v }}</text></g>
            <path v-for="c in output.curves" :key="c.ib" :d="c.path" fill="none" :stroke="c.color" stroke-width="2" />
            <g v-for="(c,i) in output.curves" :key="'ol'+c.ib"><line :x1="output.W-output.pad.r-78" :x2="output.W-output.pad.r-62" :y1="output.pad.t+10+i*14" :y2="output.pad.t+10+i*14" :stroke="c.color" stroke-width="2" /><text :x="output.W-output.pad.r-58" :y="output.pad.t+13+i*14" font-size="9" fill="currentColor" opacity="0.7">I_B={{ c.ib }}µA</text></g>
            <text :x="output.W/2" :y="output.H-4" text-anchor="middle" font-size="10" fill="currentColor" opacity="0.6">V_{{ device==='NPN'?'CE':'EC' }} (V)</text>
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
      <UAlert color="neutral" variant="soft" description="Le curve caratteristiche ottenute consentono di identificare le regioni operative e di collegare i parametri del dispositivo al suo comportamento I-V." />
      <UCard class="mt-2">
        <UBadge color="neutral" variant="soft" size="xs" label="Verifica teorica" class="tracking-wide uppercase w-fit mb-2" />
        <UAlert color="primary" variant="subtle" description="Gli andamenti di trasferimento e uscita sono coerenti con il modello teorico del BJT e con l’effetto Early." />
      </UCard>
    </template>
  </SimulationShell>
</template>
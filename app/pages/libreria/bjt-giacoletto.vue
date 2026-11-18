<script setup lang="ts">
useSeoMeta({
  title: 'Modello di Giacoletto — CircuitFlow',
  description: 'Modello a piccolo segnale del BJT: g_m, r_π, r_o, capacità e risposta in frequenza.'
})

const ic_mA = ref(2)
const beta = ref(100)
const vt = ref(25.85)
const va = ref(80)
const cpi = ref(20)
const cmu = ref(2)
const rl = ref(2000)
const rs = ref(500)

const ic = computed(() => ic_mA.value * 1e-3)
const gm = computed(() => ic.value / (vt.value * 1e-3))
const rpi = computed(() => beta.value / Math.max(gm.value, 1e-12))
const ro = computed(() => va.value / Math.max(ic.value, 1e-12))
const rOut = computed(() => 1 / (1 / ro.value + 1 / rl.value))
const avMid = computed(() => -gm.value * rOut.value)
const avMidDb = computed(() => 20 * Math.log10(Math.max(Math.abs(avMid.value), 1e-9)))
const rin = computed(() => 1 / (1 / rs.value + 1 / rpi.value))
const cInMiller = computed(() => cpi.value * 1e-12 + cmu.value * 1e-12 * (1 + Math.abs(avMid.value)))
const fH = computed(() => 1 / (2 * Math.PI * Math.max(rin.value, 1) * Math.max(cInMiller.value, 1e-15)))

function fmtR(x: number) {
  if (!Number.isFinite(x)) return '—'
  if (x >= 1e6) return `${(x / 1e6).toFixed(2)} MΩ`
  if (x >= 1e3) return `${(x / 1e3).toFixed(2)} kΩ`
  return `${x.toFixed(1)} Ω`
}
function fmtF(x: number) {
  if (!Number.isFinite(x)) return '—'
  if (x >= 1e6) return `${(x / 1e6).toFixed(2)} MHz`
  if (x >= 1e3) return `${(x / 1e3).toFixed(2)} kHz`
  return `${x.toFixed(1)} Hz`
}

const bode = computed(() => {
  const W = 520, H = 240, pad = { l: 48, r: 16, t: 14, b: 34 }
  const fMin = 1e2, fMax = 1e8
  const pts: { f: number, g: number }[] = []
  const n = 140
  for (let i = 0; i <= n; i++) {
    const logf = Math.log10(fMin) + (Math.log10(fMax) - Math.log10(fMin)) * i / n
    const f = Math.pow(10, logf)
    const mag = Math.abs(avMid.value) / Math.sqrt(1 + Math.pow(f / Math.max(fH.value, 1), 2))
    pts.push({ f, g: 20 * Math.log10(Math.max(mag, 1e-9)) })
  }
  const gMax = Math.max(...pts.map(p => p.g), 0) + 6
  const gMin = gMax - 60
  const sx = (f: number) => pad.l + (Math.log10(f) - Math.log10(fMin)) / (Math.log10(fMax) - Math.log10(fMin)) * (W - pad.l - pad.r)
  const sy = (g: number) => H - pad.b - (g - gMin) / (gMax - gMin) * (H - pad.t - pad.b)
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${sx(p.f).toFixed(2)} ${sy(p.g).toFixed(2)}`).join(' ')
  const yTicks = Array.from({ length: 5 }, (_, i) => gMax - i * 15).map(v => ({ v, y: sy(v) }))
  const xTicks = [1e2, 1e3, 1e4, 1e5, 1e6, 1e7, 1e8].map(f => ({ f, x: sx(f), label: fmtF(f) }))
  const fHx = sx(Math.min(fMax, Math.max(fMin, fH.value)))
  return { W, H, pad, path, yTicks, xTicks, fHx }
})

const analysisItems = [
  'Aumentando I_C cresce g_m, il che incrementa |A_v| ma riduce r_π: guadagno e impedenza d’ingresso dipendono dal punto di lavoro.',
  'r_o (effetto Early) limita il guadagno massimo disponibile in parallelo al carico R_L.',
  'C_μ, amplificata dall’effetto Miller, domina spesso la capacità d’ingresso equivalente e abbassa la frequenza di taglio superiore f_H.'
]
</script>

<template>
  <SimulationShell
    chapter="04"
    sim="02"
    title="Modello di Giacoletto"
    subtitle="Modello a piccolo segnale (ibrido-π) del BJT"
    objective="Analizzare il modello a piccolo segnale del BJT calcolando g_m, r_π, r_o e valutando l’effetto delle capacità parassite sulla risposta in frequenza."
  >
    <template #theory>
      <UAlert color="neutral" variant="soft" description="Il modello di Giacoletto (ibrido-π) rappresenta il comportamento dinamico del BJT attorno al punto di lavoro: la transconduttanza g_m controlla la corrente di uscita, r_π modella l’ingresso e r_o l’effetto Early; C_π e C_μ determinano i limiti in frequenza." />
      <UCard :ui="{ body: 'text-sm inline-block space-y-1' }">
        <MathBlock tex="g_m = \frac{I_C}{V_T}" />
        <MathBlock tex="r_\pi = \frac{\beta}{g_m}" />
        <MathBlock tex="r_o = \frac{V_A}{I_C}" />
        <MathBlock tex="A_{v(mid)} \approx -g_m\,(R_L \parallel r_o)" />
      </UCard>
    </template>

    <template #schema>
      <UCard :ui="{ body: 'p-3 sm:p-4' }">
        <UCard :ui="{ body: 'p-2 sm:p-3 bg-elevated/10' }">
          <svg viewBox="0 0 520 240" class="w-full h-auto">
            <text x="20" y="95" font-size="13" font-weight="600" fill="currentColor">B</text>
            <text x="490" y="55" font-size="13" font-weight="600" fill="currentColor">C</text>
            <text x="490" y="215" font-size="13" font-weight="600" fill="currentColor">E</text>
            <line x1="35" y1="90" x2="100" y2="90" stroke="currentColor" stroke-opacity="0.5" stroke-width="2" />
            <line x1="100" y1="90" x2="100" y2="190" stroke="currentColor" stroke-opacity="0.5" stroke-width="2" />
            <line x1="100" y1="190" x2="480" y2="190" stroke="currentColor" stroke-opacity="0.5" stroke-width="2" />
            <line x1="480" y1="50" x2="480" y2="190" stroke="currentColor" stroke-opacity="0.5" stroke-width="2" />
            <rect x="140" y="70" width="50" height="40" rx="2" fill="none" stroke="currentColor" stroke-width="2" />
            <line x1="100" y1="90" x2="140" y2="90" stroke="currentColor" stroke-opacity="0.5" stroke-width="2" />
            <line x1="190" y1="90" x2="240" y2="90" stroke="currentColor" stroke-opacity="0.5" stroke-width="2" />
            <line x1="240" y1="90" x2="240" y2="190" stroke="currentColor" stroke-opacity="0.5" stroke-width="2" />
            <text x="148" y="64" font-size="11" fill="currentColor">r_π</text>
            <text x="132" y="126" font-size="10" fill="var(--ui-primary)">{{ fmtR(rpi) }}</text>
            <text x="200" y="82" font-size="10" fill="currentColor" opacity="0.7">v_be</text>
            <line x1="240" y1="90" x2="280" y2="90" stroke="currentColor" stroke-opacity="0.5" stroke-width="2" />
            <line x1="280" y1="72" x2="280" y2="108" stroke="currentColor" stroke-width="2" />
            <line x1="290" y1="72" x2="290" y2="108" stroke="currentColor" stroke-width="2" />
            <line x1="290" y1="90" x2="330" y2="90" stroke="currentColor" stroke-opacity="0.5" stroke-width="2" />
            <line x1="330" y1="90" x2="330" y2="190" stroke="currentColor" stroke-opacity="0.5" stroke-width="2" />
            <text x="272" y="64" font-size="11" fill="currentColor">C_π</text>
            <text x="270" y="126" font-size="10" fill="var(--ui-primary)">{{ cpi }} pF</text>
            <circle cx="380" cy="130" r="24" fill="none" stroke="var(--ui-primary)" stroke-width="2" />
            <line x1="380" y1="50" x2="380" y2="106" stroke="currentColor" stroke-opacity="0.5" stroke-width="2" />
            <line x1="380" y1="154" x2="380" y2="190" stroke="currentColor" stroke-opacity="0.5" stroke-width="2" />
            <line x1="380" y1="112" x2="380" y2="148" stroke="var(--ui-primary)" stroke-width="2" />
            <polygon points="380,112 374,122 386,122" fill="var(--ui-primary)" />
            <text x="410" y="126" font-size="11" fill="currentColor">g_m·v_be</text>
            <text x="410" y="142" font-size="10" fill="var(--ui-primary)">{{ gm.toFixed(3) }} S</text>
            <line x1="380" y1="50" x2="480" y2="50" stroke="currentColor" stroke-opacity="0.5" stroke-width="2" />
            <rect x="430" y="70" width="30" height="44" rx="2" fill="none" stroke="currentColor" stroke-width="2" />
            <line x1="445" y1="50" x2="445" y2="70" stroke="currentColor" stroke-opacity="0.5" stroke-width="2" />
            <line x1="445" y1="114" x2="445" y2="190" stroke="currentColor" stroke-opacity="0.5" stroke-width="2" />
            <text x="465" y="96" font-size="11" fill="currentColor">r_o</text>
            <line x1="165" y1="90" x2="165" y2="30" stroke="currentColor" stroke-opacity="0.5" stroke-width="2" />
            <line x1="165" y1="30" x2="445" y2="30" stroke="currentColor" stroke-opacity="0.5" stroke-width="2" />
            <line x1="445" y1="30" x2="445" y2="50" stroke="currentColor" stroke-opacity="0.5" stroke-width="2" />
            <line x1="295" y1="22" x2="295" y2="38" stroke="currentColor" stroke-width="2" />
            <line x1="305" y1="22" x2="305" y2="38" stroke="currentColor" stroke-width="2" />
            <text x="288" y="16" font-size="11" fill="currentColor">C_μ ({{ cmu }} pF)</text>
          </svg>
        </UCard>
      </UCard>
    </template>

    <template #parameters>
      <UPageGrid class="lg:grid-cols-3">
        <UCard class="lg:col-span-2" :ui="{ body: 'space-y-4' }">
          <UBadge color="neutral" variant="soft" size="xs" label="Valori impostati" class="tracking-wide uppercase w-fit" />
          <UPageGrid class="sm:grid-cols-2 gap-3">
            <UFormField label="I_C (mA)" size="sm"><UInput v-model.number="ic_mA" type="number" step="0.1" size="sm" /></UFormField>
            <UFormField label="β_F" size="sm"><UInput v-model.number="beta" type="number" step="1" size="sm" /></UFormField>
            <UFormField label="V_T (mV)" size="sm"><UInput v-model.number="vt" type="number" step="0.1" size="sm" /></UFormField>
            <UFormField label="V_A (V)" size="sm"><UInput v-model.number="va" type="number" step="1" size="sm" /></UFormField>
            <UFormField label="C_π (pF)" size="sm"><UInput v-model.number="cpi" type="number" step="1" size="sm" /></UFormField>
            <UFormField label="C_μ (pF)" size="sm"><UInput v-model.number="cmu" type="number" step="0.5" size="sm" /></UFormField>
            <UFormField label="R_L (Ω)" size="sm"><UInput v-model.number="rl" type="number" step="100" size="sm" /></UFormField>
            <UFormField label="R_S (Ω)" size="sm"><UInput v-model.number="rs" type="number" step="50" size="sm" /></UFormField>
          </UPageGrid>
        </UCard>
        <UCard :ui="{ body: 'space-y-2' }">
          <UBadge color="neutral" variant="soft" size="xs" label="Valori calcolati" class="tracking-wide uppercase w-fit mb-1" />
          <UCard :ui="{ body: 'flex justify-between p-2 text-sm' }"><UBadge color="neutral" variant="soft" label="g_m" /><UBadge color="primary" variant="subtle" :label="`${gm.toFixed(4)} S`" class="font-mono" /></UCard>
          <UCard :ui="{ body: 'flex justify-between p-2 text-sm' }"><UBadge color="neutral" variant="soft" label="r_π" /><UBadge color="primary" variant="subtle" :label="fmtR(rpi)" class="font-mono" /></UCard>
          <UCard :ui="{ body: 'flex justify-between p-2 text-sm' }"><UBadge color="neutral" variant="soft" label="r_o" /><UBadge color="primary" variant="subtle" :label="fmtR(ro)" class="font-mono" /></UCard>
          <UCard :ui="{ body: 'flex justify-between p-2 text-sm' }"><UBadge color="neutral" variant="soft" label="A_v(mid)" /><UBadge color="primary" variant="subtle" :label="`${avMid.toFixed(2)} (${avMidDb.toFixed(1)} dB)`" class="font-mono" /></UCard>
          <UCard :ui="{ body: 'flex justify-between p-2 text-sm' }"><UBadge color="neutral" variant="soft" label="C_in (Miller)" /><UBadge color="primary" variant="subtle" :label="`${(cInMiller*1e12).toFixed(1)} pF`" class="font-mono" /></UCard>
          <UCard :ui="{ body: 'flex justify-between p-2 text-sm' }"><UBadge color="neutral" variant="soft" label="f_H (stima)" /><UBadge color="primary" variant="subtle" :label="fmtF(fH)" class="font-mono" /></UCard>
        </UCard>
      </UPageGrid>
    </template>

    <template #results>
      <UCard :ui="{ body: 'p-3 sm:p-4 space-y-2' }">
        <UPageHeader title="Risposta in frequenza |A_v(f)|" description="Stima a polo dominante con effetto Miller (asse frequenza logaritmico, guadagno in dB)" :ui="{ root: 'border-b-0 py-0', title: 'text-base font-medium text-highlighted', description: 'text-xs text-muted' }" />
        <UCard :ui="{ body: 'p-0 w-full overflow-x-auto' }">
          <svg :viewBox="`0 0 ${bode.W} ${bode.H}`" class="w-full min-w-[320px] h-auto">
            <line :x1="bode.pad.l" :y1="bode.H-bode.pad.b" :x2="bode.W-bode.pad.r" :y2="bode.H-bode.pad.b" stroke="currentColor" stroke-opacity="0.25" />
            <line :x1="bode.pad.l" :y1="bode.pad.t" :x2="bode.pad.l" :y2="bode.H-bode.pad.b" stroke="currentColor" stroke-opacity="0.25" />
            <g v-for="t in bode.yTicks" :key="t.v"><line :x1="bode.pad.l" :x2="bode.W-bode.pad.r" :y1="t.y" :y2="t.y" stroke="currentColor" stroke-opacity="0.06" /><text :x="bode.pad.l-6" :y="t.y+3" text-anchor="end" font-size="9" fill="currentColor" opacity="0.6">{{ t.v.toFixed(0) }}</text></g>
            <g v-for="t in bode.xTicks" :key="t.f"><line :x1="t.x" :x2="t.x" :y1="bode.pad.t" :y2="bode.H-bode.pad.b" stroke="currentColor" stroke-opacity="0.06" /><text :x="t.x" :y="bode.H-bode.pad.b+14" text-anchor="middle" font-size="9" fill="currentColor" opacity="0.6">{{ t.label }}</text></g>
            <path :d="bode.path" fill="none" stroke="var(--ui-primary)" stroke-width="2" />
            <line :x1="bode.fHx" :x2="bode.fHx" :y1="bode.pad.t" :y2="bode.H-bode.pad.b" stroke="var(--ui-primary)" stroke-opacity="0.4" stroke-dasharray="4 4" />
            <text :x="bode.fHx+4" :y="bode.pad.t+12" font-size="9" fill="var(--ui-primary)">f_H</text>
            <text :x="bode.W/2" :y="bode.H-4" text-anchor="middle" font-size="10" fill="currentColor" opacity="0.6">Frequenza (Hz)</text>
            <text :x="12" :y="bode.H/2" text-anchor="middle" font-size="10" fill="currentColor" opacity="0.6" transform="rotate(-90 12 120)">|A_v| (dB)</text>
          </svg>
        </UCard>
      </UCard>
    </template>

    <template #analysis>
      <UPageGrid class="grid-cols-1 gap-2">
        <UAlert v-for="(item, i) in analysisItems" :key="i" color="neutral" variant="soft" icon="i-lucide-info" :description="item" />
      </UPageGrid>
    </template>

    <template #conclusion>
      <UAlert color="neutral" variant="soft" description="Il modello di Giacoletto collega parametri DC e comportamento AC del BJT, permettendo di stimare guadagno e banda passante a piccolo segnale." />
      <UCard class="mt-2">
        <UBadge color="neutral" variant="soft" size="xs" label="Verifica teorica" class="tracking-wide uppercase w-fit mb-2" />
        <UAlert color="primary" variant="subtle" description="I valori di g_m, r_π, r_o e l’andamento della risposta in frequenza sono coerenti con le relazioni teoriche del modello ibrido-π." />
      </UCard>
    </template>
  </SimulationShell>
</template>
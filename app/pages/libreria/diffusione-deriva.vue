<script setup lang="ts">
useSeoMeta({
  title: 'Diffusione, deriva e regione di svuotamento — CircuitFlow',
  description: 'Modello interattivo che spiega diffusione e deriva di elettroni e lacune e la formazione della regione di svuotamento in una giunzione PN.'
})

const canvasRef = ref<HTMLCanvasElement | null>(null)
const bias = ref(0)
const doping = ref(50)

const vbi = computed(() => 0.7 + (doping.value - 50) * 0.004)
const va = computed(() => bias.value)
const wDep = computed(() => {
  const vEff = Math.max(0.05, vbi.value - va.value)
  const scale = 22 + (100 - doping.value) * 0.35
  return Math.min(140, Math.max(18, Math.sqrt(vEff) * scale))
})

type Carrier = { x: number, y: number, vx: number, vy: number, type: 'h' | 'e' }

let carriers: Carrier[] = []
let raf = 0
let width = 720
let height = 320

function rand(min: number, max: number) {
  return min + Math.random() * (max - min)
}

function seedCarriers() {
  carriers = []
  const nH = 70
  const nE = 70
  for (let i = 0; i < nH; i++) carriers.push({ x: rand(10, width * 0.45), y: rand(20, height - 20), vx: rand(-0.4, 0.4), vy: rand(-0.4, 0.4), type: 'h' })
  for (let i = 0; i < nE; i++) carriers.push({ x: rand(width * 0.55, width - 10), y: rand(20, height - 20), vx: rand(-0.4, 0.4), vy: rand(-0.4, 0.4), type: 'e' })
}

function draw() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const w = canvas.width
  const h = canvas.height
  width = w
  height = h
  ctx.clearRect(0, 0, w, h)

  const cx = w / 2
  const dep = wDep.value
  const xL = cx - dep / 2
  const xR = cx + dep / 2

  ctx.fillStyle = 'rgba(148,163,184,0.06)'
  ctx.fillRect(0, 0, w, h)
  ctx.fillStyle = 'rgba(34,211,238,0.06)'
  ctx.fillRect(0, 0, xL, h)
  ctx.fillStyle = 'rgba(56,189,248,0.06)'
  ctx.fillRect(xR, 0, w - xR, h)
  ctx.fillStyle = 'rgba(100,116,139,0.12)'
  ctx.fillRect(xL, 0, xR - xL, h)

  ctx.strokeStyle = 'rgba(100,116,139,0.7)'
  ctx.setLineDash([6, 4])
  ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.moveTo(xL, 0); ctx.lineTo(xL, h); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(xR, 0); ctx.lineTo(xR, h); ctx.stroke()
  ctx.setLineDash([])

  ctx.font = '14px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  for (let y = 30; y < h - 20; y += 34) {
    for (let x = xL + 16; x < cx - 6; x += 28) {
      ctx.fillStyle = 'rgba(239,68,68,0.7)'
      ctx.fillText('−', x, y)
    }
    for (let x = cx + 12; x < xR - 10; x += 28) {
      ctx.fillStyle = 'rgba(34,197,94,0.8)'
      ctx.fillText('+', x, y)
    }
  }

  if (xR - xL > 30) {
    const ay = 24
    ctx.strokeStyle = 'rgba(245,158,11,0.9)'
    ctx.fillStyle = 'rgba(245,158,11,0.9)'
    ctx.lineWidth = 2
    ctx.beginPath(); ctx.moveTo(xR - 12, ay); ctx.lineTo(xL + 12, ay); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(xL + 12, ay); ctx.lineTo(xL + 22, ay - 5); ctx.lineTo(xL + 22, ay + 5); ctx.closePath(); ctx.fill()
    ctx.font = '12px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('Campo E (deriva)', cx, ay - 10)
  }

  ctx.font = '600 13px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillStyle = 'rgba(14,116,144,0.9)'
  ctx.fillText('Regione P', Math.max(40, xL / 2), h - 14)
  ctx.fillText('lacune (+) maggioritarie', Math.max(70, xL / 2), h - 30)
  ctx.fillStyle = 'rgba(14,116,144,0.9)'
  ctx.fillText('Regione N', Math.min(w - 40, xR + (w - xR) / 2), h - 14)
  ctx.fillText('elettroni (−) maggioritari', Math.min(w - 70, xR + (w - xR) / 2), h - 30)
  ctx.fillStyle = 'rgba(71,85,105,0.95)'
  ctx.fillText('Regione di svuotamento', cx, h - 14)

  const eFieldDir = -1
  const eStrength = 0.12 + (dep / 140) * 0.25
  for (const c of carriers) {
    c.vx += rand(-0.08, 0.08)
    c.vy += rand(-0.08, 0.08)
    if (c.x > xL && c.x < xR) {
      if (c.type === 'h') c.vx += eFieldDir * eStrength
      else c.vx -= eFieldDir * eStrength
      c.vx *= 0.98
    } else {
      if (c.type === 'h' && c.x < xL) c.vx += 0.015 * (1 + Math.max(0, va.value) * 1.2)
      if (c.type === 'e' && c.x > xR) c.vx -= 0.015 * (1 + Math.max(0, va.value) * 1.2)
      c.vx *= 0.96
    }
    if (va.value > 0.05) {
      if (c.type === 'h') c.vx += 0.01 * va.value
      if (c.type === 'e') c.vx -= 0.01 * va.value
    } else if (va.value < -0.05) {
      if (c.type === 'h') c.vx -= 0.008 * Math.abs(va.value)
      if (c.type === 'e') c.vx += 0.008 * Math.abs(va.value)
    }
    c.vx = Math.max(-1.6, Math.min(1.6, c.vx))
    c.vy = Math.max(-1.2, Math.min(1.2, c.vy))
    c.x += c.vx
    c.y += c.vy
    if (c.y < 16) { c.y = 16; c.vy *= -0.5 }
    if (c.y > h - 44) { c.y = h - 44; c.vy *= -0.5 }
    if (c.type === 'h') {
      if (c.x < 6) { c.x = 6; c.vx *= -0.4 }
      if (c.x > w - 6) { c.x = rand(10, xL - 5); c.y = rand(20, h - 50) }
      if (c.x > xR + 40) { c.x = rand(10, Math.max(20, xL - 10)); c.y = rand(20, h - 50) }
    } else {
      if (c.x > w - 6) { c.x = w - 6; c.vx *= -0.4 }
      if (c.x < 6) { c.x = rand(xR + 5, w - 10); c.y = rand(20, h - 50) }
      if (c.x < xL - 40) { c.x = rand(Math.min(w - 20, xR + 10), w - 10); c.y = rand(20, h - 50) }
    }
    if (c.type === 'h') {
      ctx.strokeStyle = 'rgba(239,68,68,0.9)'
      ctx.lineWidth = 1.6
      ctx.beginPath(); ctx.arc(c.x, c.y, 5, 0, Math.PI * 2); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(c.x - 2.5, c.y); ctx.lineTo(c.x + 2.5, c.y); ctx.moveTo(c.x, c.y - 2.5); ctx.lineTo(c.x, c.y + 2.5); ctx.stroke()
    } else {
      ctx.fillStyle = 'rgba(14,165,233,0.9)'
      ctx.beginPath(); ctx.arc(c.x, c.y, 4.5, 0, Math.PI * 2); ctx.fill()
      ctx.strokeStyle = 'white'
      ctx.lineWidth = 1.4
      ctx.beginPath(); ctx.moveTo(c.x - 2.3, c.y); ctx.lineTo(c.x + 2.3, c.y); ctx.stroke()
    }
  }

  ctx.strokeStyle = 'rgba(100,116,139,0.5)'
  ctx.setLineDash([2, 4])
  ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, h - 40); ctx.stroke()
  ctx.setLineDash([])

  raf = requestAnimationFrame(draw)
}

function resize() {
  const canvas = canvasRef.value
  if (!canvas) return
  const parent = canvas.parentElement
  if (!parent) return
  const dpr = window.devicePixelRatio || 1
  const cssW = parent.clientWidth
  const cssH = 340
  canvas.width = Math.floor(cssW * dpr)
  canvas.height = Math.floor(cssH * dpr)
  canvas.style.width = cssW + 'px'
  canvas.style.height = cssH + 'px'
  const ctx = canvas.getContext('2d')
  if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  width = cssW
  height = cssH
  seedCarriers()
}

onMounted(() => {
  resize()
  window.addEventListener('resize', resize)
  raf = requestAnimationFrame(draw)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resize)
  cancelAnimationFrame(raf)
})

watch([bias, doping], () => {})

const fieldChart = computed(() => {
  const W = 520, H = 180, pad = { l: 42, r: 14, t: 12, b: 28 }
  const n = 100
  const dep = wDep.value / 140
  const half = 0.2 + dep * 0.3
  const ePeak = 0.4 + dep * 0.6
  const pts: { x: number, y: number }[] = []
  for (let i = 0; i <= n; i++) {
    const xn = -1 + 2 * (i / n)
    let e = 0
    if (xn >= -half && xn <= 0) e = -ePeak * (1 + xn / half)
    else if (xn > 0 && xn <= half) e = -ePeak * (1 - xn / half)
    else e = 0
    pts.push({ x: xn, y: e })
  }
  const yMin = -1.2, yMax = 0.3
  const sx = (x: number) => pad.l + ((x + 1) / 2) * (W - pad.l - pad.r)
  const sy = (y: number) => H - pad.b - ((y - yMin) / (yMax - yMin)) * (H - pad.t - pad.b)
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${sx(p.x).toFixed(2)} ${sy(p.y).toFixed(2)}`).join(' ')
  const zeroY = sy(0)
  const yTicks = [-1.0, -0.5, 0].map(v => ({ v, y: sy(v) }))
  const xTicks = [-1, -0.5, 0, 0.5, 1].map(v => ({ v, x: sx(v), label: v === 0 ? '0' : v.toString() }))
  return { W, H, pad, path, zeroY, yTicks, xTicks }
})

const potentialChart = computed(() => {
  const W = 520, H = 180, pad = { l: 42, r: 14, t: 12, b: 28 }
  const n = 100
  const dep = wDep.value / 140
  const half = 0.2 + dep * 0.3
  const vPeak = Math.max(0.05, vbi.value - va.value)
  const pts: { x: number, y: number }[] = []
  for (let i = 0; i <= n; i++) {
    const xn = -1 + 2 * (i / n)
    let v = 0
    if (xn < -half) v = 0
    else if (xn >= -half && xn <= 0) { const t = (xn + half) / half; v = vPeak * (t * t) * 0.5 }
    else if (xn > 0 && xn <= half) { const t = xn / half; v = vPeak * (1 - 0.5 * (1 - t) * (1 - t)) }
    else v = vPeak
    pts.push({ x: xn, y: v })
  }
  const yMin = -0.1, yMax = 1.2
  const sx = (x: number) => pad.l + ((x + 1) / 2) * (W - pad.l - pad.r)
  const sy = (y: number) => H - pad.b - ((y - yMin) / (yMax - yMin)) * (H - pad.t - pad.b)
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${sx(p.x).toFixed(2)} ${sy(p.y).toFixed(2)}`).join(' ')
  const yTicks = [0, 0.3, 0.6, 0.9, 1.2].map(v => ({ v, y: sy(v) }))
  const xTicks = [-1, -0.5, 0, 0.5, 1].map(v => ({ v, x: sx(v), label: v === 0 ? '0' : v.toString() }))
  return { W, H, pad, path, yTicks, xTicks }
})

function reset() {
  bias.value = 0
  doping.value = 50
  seedCarriers()
}

const theoryCards = [
  { title: 'Diffusione', description: 'Moto da alta a bassa concentrazione (lacune P→N, elettroni N→P).' },
  { title: 'Regione di svuotamento', description: 'Zona con ioni fissi (frontiere/“pareti” della barriera) priva di portatori mobili.' },
  { title: 'Deriva', description: 'Moto dovuto al campo elettrico interno (da N verso P) che contrasta la diffusione.' }
]

const analysisItems = [
  'In assenza di polarizzazione esterna, la diffusione iniziale dei portatori maggioritari crea ioni fissi e quindi la regione di svuotamento con le sue frontiere.',
  'Il campo elettrico interno (diretto da N verso P) genera una corrente di deriva che bilancia la diffusione all’equilibrio.',
  'Con polarizzazione diretta la barriera e l’ampiezza di svuotamento si riducono (più portatori attraversano la giunzione); con polarizzazione inversa aumentano.'
]
</script>

<template>
  <SimulationShell
    chapter="01"
    sim="01"
    title="Diffusione, deriva e regione di svuotamento"
    subtitle="Giunzione PN: moto dei portatori e formazione della barriera di potenziale"
    objective="Spiegare e visualizzare la diffusione e la deriva di elettroni e lacune in una giunzione PN e la formazione della regione di svuotamento (barriera di potenziale)."
  >
    <template #theory>
      <UAlert color="neutral" variant="soft" description="Nella giunzione PN i portatori maggioritari diffondono verso la regione opposta per gradiente di concentrazione. La diffusione scopre ioni fissi e genera una regione di svuotamento con carica spaziale e campo elettrico interno; tale campo produce una corrente di deriva che si oppone alla diffusione fino all’equilibrio." />
      <UPageGrid class="sm:grid-cols-3">
        <UCard v-for="card in theoryCards" :key="card.title" :ui="{ body: 'space-y-1' }">
          <UBadge color="primary" variant="soft" :label="card.title" class="w-fit" />
          <UAlert color="neutral" variant="soft" :description="card.description" />
        </UCard>
      </UPageGrid>
    </template>

    <template #schema>
      <UCard :ui="{ body: 'p-3 sm:p-4 space-y-2' }">
        <UPageHeader title="Visualizzazione giunzione PN (P a sinistra, N a destra)" :ui="{ root: 'border-b-0 py-0', title: 'text-sm text-muted font-normal' }">
          <template #links>
            <UButton color="error" variant="soft" size="xs" label="lacuna" class="pointer-events-none" />
            <UButton color="info" variant="soft" size="xs" label="elettrone" class="pointer-events-none" />
          </template>
        </UPageHeader>
        <UCard :ui="{ body: 'p-0 overflow-hidden' }">
          <canvas ref="canvasRef" class="block w-full" />
        </UCard>
      </UCard>
    </template>

    <template #parameters>
      <UPageGrid class="lg:grid-cols-3">
        <UCard class="lg:col-span-2" :ui="{ body: 'space-y-4' }">
          <UPageHeader :ui="{ root: 'border-b-0 py-0' }">
            <template #headline>
              <UBadge color="neutral" variant="soft" size="xs" label="Valori impostati" class="tracking-wide uppercase" />
            </template>
            <template #links>
              <UButton size="xs" color="neutral" variant="ghost" icon="i-lucide-rotate-ccw" label="Ripristina" @click="reset" />
            </template>
          </UPageHeader>
          <UFormField label="Tensione applicata V" :hint="`${bias.toFixed(2)} V`" help="Inversa (sinistra) · Equilibrio · Diretta (destra)">
            <USlider v-model="bias" :min="-1" :max="0.8" :step="0.01" />
          </UFormField>
          <UFormField label="Drogaggio (relativo)" :hint="`${doping}`">
            <USlider v-model="doping" :min="10" :max="100" :step="1" />
          </UFormField>
        </UCard>
        <UCard :ui="{ body: 'space-y-2' }">
          <UBadge color="neutral" variant="soft" size="xs" label="Valori calcolati (stima)" class="tracking-wide uppercase w-fit mb-1" />
          <UCard :ui="{ body: 'flex justify-between p-2 text-sm' }"><UBadge color="neutral" variant="soft" label="V_bi" /><UBadge color="primary" variant="subtle" :label="`${vbi.toFixed(2)} V`" class="font-mono" /></UCard>
          <UCard :ui="{ body: 'flex justify-between p-2 text-sm' }"><UBadge color="neutral" variant="soft" label="V_bi − V_a" /><UBadge color="primary" variant="subtle" :label="`${Math.max(0, vbi - va).toFixed(2)} V`" class="font-mono" /></UCard>
          <UCard :ui="{ body: 'flex justify-between p-2 text-sm' }"><UBadge color="neutral" variant="soft" label="Ampiezza svuotamento" /><UBadge color="primary" variant="subtle" :label="`${wDep.toFixed(0)} (rel.)`" class="font-mono" /></UCard>
        </UCard>
      </UPageGrid>
    </template>

    <template #results>
      <UPageGrid class="lg:grid-cols-2">
        <UCard :ui="{ body: 'p-3 sm:p-4 space-y-2' }">
          <UPageHeader title="Campo elettrico E(x)" description="Profilo qualitativo nella regione di svuotamento" :ui="{ root: 'border-b-0 py-0', title: 'text-base font-medium text-highlighted', description: 'text-xs text-muted' }" />
          <svg :viewBox="`0 0 ${fieldChart.W} ${fieldChart.H}`" class="w-full min-w-[280px] h-auto">
            <line :x1="fieldChart.pad.l" :x2="fieldChart.W-fieldChart.pad.r" :y1="fieldChart.zeroY" :y2="fieldChart.zeroY" stroke="currentColor" stroke-opacity="0.3" />
            <g v-for="t in fieldChart.yTicks" :key="'fy'+t.v"><text :x="fieldChart.pad.l-6" :y="t.y+3" text-anchor="end" font-size="9" fill="currentColor" opacity="0.6">{{ t.v }}</text></g>
            <g v-for="t in fieldChart.xTicks" :key="'fx'+t.v"><line :x1="t.x" :x2="t.x" :y1="fieldChart.pad.t" :y2="fieldChart.H-fieldChart.pad.b" stroke="currentColor" stroke-opacity="0.06" /><text :x="t.x" :y="fieldChart.H-fieldChart.pad.b+14" text-anchor="middle" font-size="9" fill="currentColor" opacity="0.6">{{ t.label }}</text></g>
            <path :d="fieldChart.path" fill="none" stroke="var(--ui-primary)" stroke-width="2" />
            <text :x="fieldChart.W/2" :y="fieldChart.H-4" text-anchor="middle" font-size="10" fill="currentColor" opacity="0.6">posizione x (P ← → N)</text>
          </svg>
        </UCard>
        <UCard :ui="{ body: 'p-3 sm:p-4 space-y-2' }">
          <UPageHeader title="Potenziale V(x)" description="Barriera di potenziale attraverso la giunzione" :ui="{ root: 'border-b-0 py-0', title: 'text-base font-medium text-highlighted', description: 'text-xs text-muted' }" />
          <svg :viewBox="`0 0 ${potentialChart.W} ${potentialChart.H}`" class="w-full min-w-[280px] h-auto">
            <g v-for="t in potentialChart.yTicks" :key="'py'+t.v"><line :x1="potentialChart.pad.l" :x2="potentialChart.W-potentialChart.pad.r" :y1="t.y" :y2="t.y" stroke="currentColor" stroke-opacity="0.06" /><text :x="potentialChart.pad.l-6" :y="t.y+3" text-anchor="end" font-size="9" fill="currentColor" opacity="0.6">{{ t.v.toFixed(1) }}</text></g>
            <g v-for="t in potentialChart.xTicks" :key="'px'+t.v"><line :x1="t.x" :x2="t.x" :y1="potentialChart.pad.t" :y2="potentialChart.H-potentialChart.pad.b" stroke="currentColor" stroke-opacity="0.06" /><text :x="t.x" :y="potentialChart.H-potentialChart.pad.b+14" text-anchor="middle" font-size="9" fill="currentColor" opacity="0.6">{{ t.label }}</text></g>
            <path :d="potentialChart.path" fill="none" stroke="var(--ui-primary)" stroke-width="2" />
            <text :x="potentialChart.W/2" :y="potentialChart.H-4" text-anchor="middle" font-size="10" fill="currentColor" opacity="0.6">posizione x (P ← → N)</text>
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
      <UAlert color="neutral" variant="soft" description="Il modello mostra come diffusione, deriva e carica spaziale determinino la formazione della regione di svuotamento e della barriera di potenziale nella giunzione PN." />
      <UCard class="mt-2">
        <UBadge color="neutral" variant="soft" size="xs" label="Verifica teorica" class="tracking-wide uppercase w-fit mb-2" />
        <UAlert color="primary" variant="subtle" description="Il comportamento osservato è coerente con la teoria della giunzione PN: equilibrio tra diffusione e deriva e modulazione della barriera con la tensione applicata." />
      </UCard>
    </template>
  </SimulationShell>
</template>
<script setup lang="ts">
useSeoMeta({
  title: 'Modello Ebers–Moll — CircuitFlow',
  description: 'Simulazione interattiva del modello Ebers–Moll per BJT NPN: parametri, modello equivalente, grafici e confronto tra configurazioni.'
})

type Region = 'Interdizione' | 'Attiva diretta' | 'Saturazione' | 'Attiva inversa'
type BadgeColor = 'neutral' | 'success' | 'warning' | 'info' | 'primary'
type Config = {
  vbe: number
  vbc: number
  isat: number
  isatR: number
  betaF: number
  betaR: number
  vt: number
}

const DEFAULTS: Config = {
  vbe: 0.7,
  vbc: -1,
  isat: 1e-14,
  isatR: 1e-14,
  betaF: 100,
  betaR: 5,
  vt: 0.02585
}

const vbe = ref(DEFAULTS.vbe)
const vbc = ref(DEFAULTS.vbc)
const isat = ref(DEFAULTS.isat)
const isatR = ref(DEFAULTS.isatR)
const betaF = ref(DEFAULTS.betaF)
const betaR = ref(DEFAULTS.betaR)
const vt = ref(DEFAULTS.vt)

const PRESETS: { key: string, label: string, color: BadgeColor, values: Partial<Config> }[] = [
  { key: 'cutoff', label: 'Interdizione', color: 'neutral', values: { vbe: 0.35, vbc: -2 } },
  { key: 'forward', label: 'Attiva diretta', color: 'success', values: { vbe: 0.7, vbc: -1 } },
  { key: 'saturation', label: 'Saturazione', color: 'warning', values: { vbe: 0.82, vbc: 0.65 } },
  { key: 'reverse', label: 'Attiva inversa', color: 'info', values: { vbe: 0.15, vbc: 0.75 } }
]

const LEVELS = [0.6, 0.65, 0.7, 0.75, 0.8]
const LEVEL_COLORS = ['#fcd34d', '#f59e0b', '#d97706', '#b45309', '#78350f']
const selectedLevels = ref<number[]>([0.6, 0.65, 0.7, 0.75])

const CHART_W = 560
const CHART_H = 280
const CHART_PAD = { l: 56, r: 18, t: 18, b: 40 }

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v))
}

function clampExp(x: number) {
  return Math.exp(clamp(x, -80, 80))
}

function positiveNumber(value: number, fallback: number, min: number) {
  const n = Number(value)
  return Number.isFinite(n) ? Math.max(min, n) : fallback
}

const params = computed<Config>(() => ({
  vbe: vbe.value,
  vbc: vbc.value,
  isat: positiveNumber(isat.value, DEFAULTS.isat, 1e-30),
  isatR: positiveNumber(isatR.value, DEFAULTS.isatR, 1e-30),
  betaF: positiveNumber(betaF.value, DEFAULTS.betaF, 1e-3),
  betaR: positiveNumber(betaR.value, DEFAULTS.betaR, 1e-3),
  vt: positiveNumber(vt.value, DEFAULTS.vt, 1e-6)
}))

const hasInvalidInput = computed(() => [isat, isatR, betaF, betaR, vt].some((field) => {
  const n = Number(field.value)
  return !Number.isFinite(n) || n <= 0
}))

function normalizeInputs() {
  const clean = params.value
  isat.value = clean.isat
  isatR.value = clean.isatR
  betaF.value = clean.betaF
  betaR.value = clean.betaR
  vt.value = clean.vt
}

/**
 * Ebers-Moll completo, convenzione: correnti entranti in C e B positive,
 * corrente di emettitore riportata come ampiezza uscente (I_E = I_C + I_B).
 * I_F e I_R sono le correnti di trasporto: I_F = alpha_F * I_DE, I_R = alpha_R * I_DC.
 */
function calc(vBE: number, vBC: number, prm: Config = params.value) {
  const alphaF = prm.betaF / (1 + prm.betaF)
  const alphaR = prm.betaR / (1 + prm.betaR)
  const iF = prm.isat * (clampExp(vBE / prm.vt) - 1)
  const iR = prm.isatR * (clampExp(vBC / prm.vt) - 1)
  const iDE = iF / alphaF
  const iDC = iR / alphaR
  const ic = iF - iDC
  const ib = iF / prm.betaF + iR / prm.betaR
  const ie = iDE - iR
  return { ic, ib, ie, iF, iR, iDE, iDC, alphaF, alphaR, vce: vBE - vBC }
}

function classify(vBE: number, vBC: number, prm: Config) {
  const threshold = Math.max(0.08, 3 * prm.vt)
  const beOn = vBE > threshold
  const bcOn = vBC > threshold
  let region: Region
  let color: BadgeColor
  if (!beOn && !bcOn) { region = 'Interdizione'; color = 'neutral' }
  else if (beOn && !bcOn) { region = 'Attiva diretta'; color = 'success' }
  else if (beOn && bcOn) { region = 'Saturazione'; color = 'warning' }
  else { region = 'Attiva inversa'; color = 'info' }
  return {
    region,
    color,
    beBias: beOn ? 'diretta' : 'inversa',
    bcBias: bcOn ? 'diretta' : 'inversa',
    threshold
  }
}

const op = computed(() => {
  const prm = params.value
  const result = calc(prm.vbe, prm.vbc, prm)
  const bias = classify(prm.vbe, prm.vbc, prm)
  const kclAbs = Math.abs(result.ie - (result.ic + result.ib))
  const kclScale = Math.max(Math.abs(result.ie), Math.abs(result.ic + result.ib), 1e-30)
  const reciprocity = Math.abs(Math.log10(prm.isat / prm.isatR))
  const icSimple = prm.betaF * prm.isat * (clampExp(prm.vbe / prm.vt) - 1)
  const simpleError = Math.abs(result.ic - icSimple) / Math.max(Math.abs(icSimple), Math.abs(result.ic), 1e-30) * 100
  return {
    ...result,
    ...bias,
    kclError: kclAbs / kclScale,
    kclAbs,
    reciprocity,
    icSimple,
    simpleError
  }
})

const snapshot = ref<Config | null>(null)
const snapshotOp = computed(() => {
  if (!snapshot.value) return null
  const cfg = snapshot.value
  return { ...calc(cfg.vbe, cfg.vbc, cfg), ...classify(cfg.vbe, cfg.vbc, cfg) }
})

function captureSnapshot() {
  snapshot.value = { ...params.value }
}

function restoreSnapshot() {
  if (!snapshot.value) return
  const cfg = snapshot.value
  vbe.value = cfg.vbe
  vbc.value = cfg.vbc
  isat.value = cfg.isat
  isatR.value = cfg.isatR
  betaF.value = cfg.betaF
  betaR.value = cfg.betaR
  vt.value = cfg.vt
}

function applyPreset(preset: typeof PRESETS[number]) {
  if (preset.values.vbe !== undefined) vbe.value = preset.values.vbe
  if (preset.values.vbc !== undefined) vbc.value = preset.values.vbc
}

function resetDefaults() {
  vbe.value = DEFAULTS.vbe
  vbc.value = DEFAULTS.vbc
  isat.value = DEFAULTS.isat
  isatR.value = DEFAULTS.isatR
  betaF.value = DEFAULTS.betaF
  betaR.value = DEFAULTS.betaR
  vt.value = DEFAULTS.vt
  snapshot.value = null
}

function toggleLevel(level: number) {
  selectedLevels.value = selectedLevels.value.includes(level)
    ? selectedLevels.value.filter(l => l !== level)
    : [...selectedLevels.value, level].sort((a, b) => a - b)
}

function makeScales(xMin: number, xMax: number, yTop: number) {
  const sx = (x: number) => CHART_PAD.l + ((x - xMin) / (xMax - xMin)) * (CHART_W - CHART_PAD.l - CHART_PAD.r)
  const sy = (y: number) => CHART_H - CHART_PAD.b - (y / yTop) * (CHART_H - CHART_PAD.t - CHART_PAD.b)
  return { sx, sy }
}

const transferChart = computed(() => {
  const xMin = -0.1
  const xMax = 0.9
  const steps = 140
  const pts: { x: number, y: number }[] = []
  let yMax = 1e-12
  for (let i = 0; i <= steps; i++) {
    const x = xMin + (xMax - xMin) * (i / steps)
    const y = Math.max(0, calc(x, params.value.vbc).ic)
    pts.push({ x, y })
    yMax = Math.max(yMax, y)
  }
  const yTop = yMax * 1.1
  const { sx, sy } = makeScales(xMin, xMax, yTop)
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${sx(p.x).toFixed(2)} ${sy(p.y).toFixed(2)}`).join(' ')
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(t => ({ v: yTop * t, y: sy(yTop * t), label: formatCurrent(yTop * t) }))
  const xTicks = [-0.1, 0.1, 0.3, 0.5, 0.7, 0.9].map(v => ({ v, x: sx(v) }))
  const opX = sx(clamp(params.value.vbe, xMin, xMax))
  const opY = sy(clamp(Math.max(0, op.value.ic), 0, yTop))
  const snapX = snapshotOp.value ? sx(clamp(snapshot!.vbe, xMin, xMax)) : null
  const snapY = snapshotOp.value ? sy(clamp(Math.max(0, snapshotOp.value.ic), 0, yTop)) : null
  return { W: CHART_W, H: CHART_H, pad: CHART_PAD, xMin, xMax, yTop, pts, path, sx, sy, yTicks, xTicks, opX, opY, snapX, snapY }
})

const outputChart = computed(() => {
  const xMin = 0
  const xMax = 5
  const steps = 120
  const series = selectedLevels.value.map(vb => {
    const pts: { x: number, y: number }[] = []
    for (let i = 0; i <= steps; i++) {
      const vce = xMin + (xMax - xMin) * (i / steps)
      const y = Math.max(0, calc(vb, vb - vce).ic)
      pts.push({ x: vce, y })
    }
    return { vb, pts }
  })
  const yMax = Math.max(1e-12, ...series.flatMap(s => s.pts.map(p => p.y)))
  const yTop = yMax * 1.1
  const { sx, sy } = makeScales(xMin, xMax, yTop)
  const curves = series.map((s, i) => ({
    v: s.vb,
    color: LEVEL_COLORS[i % LEVEL_COLORS.length],
    path: s.pts.map((p, j) => `${j === 0 ? 'M' : 'L'} ${sx(p.x).toFixed(2)} ${sy(p.y).toFixed(2)}`).join(' ')
  }))
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(t => ({ v: yTop * t, y: sy(yTop * t), label: formatCurrent(yTop * t) }))
  const xTicks = [0, 1, 2, 3, 4, 5].map(v => ({ v, x: sx(v) }))
  const opX = sx(clamp(op.value.vce, xMin, xMax))
  const opY = sy(clamp(Math.max(0, op.value.ic), 0, yTop))
  const snapX = snapshotOp.value ? sx(clamp(snapshotOp.value.vce, xMin, xMax)) : null
  const snapY = snapshotOp.value ? sy(clamp(Math.max(0, snapshotOp.value.ic), 0, yTop)) : null
  const satEdge = sx(0.2)
  return { W: CHART_W, H: CHART_H, pad: CHART_PAD, xMin, xMax, yTop, series, curves, sx, sy, yTicks, xTicks, opX, opY, snapX, snapY, satEdge }
})

type HoverPoint = { chart: 'transfer' | 'output', x: number, y: number, boxX: number, boxY: number, lines: string[] }
const hover = ref<HoverPoint | null>(null)
const expandedChart = ref<'transfer' | 'output' | null>(null)
const transferSvg = ref<SVGSVGElement | null>(null)
const outputSvg = ref<SVGSVGElement | null>(null)

function pointerToValue(event: MouseEvent, xMin: number, xMax: number) {
  const svg = event.currentTarget as SVGSVGElement
  const rect = svg.getBoundingClientRect()
  const px = ((event.clientX - rect.left) / rect.width) * CHART_W
  if (px < CHART_PAD.l || px > CHART_W - CHART_PAD.r) return null
  return xMin + ((px - CHART_PAD.l) / (CHART_W - CHART_PAD.l - CHART_PAD.r)) * (xMax - xMin)
}

function onTransferMove(event: MouseEvent) {
  const c = transferChart.value
  const vx = pointerToValue(event, c.xMin, c.xMax)
  if (vx === null) { hover.value = null; return }
  const ic = Math.max(0, calc(vx, params.value.vbc).ic)
  const x = c.sx(vx)
  const y = c.sy(clamp(ic, 0, c.yTop))
  hover.value = {
    chart: 'transfer', x, y,
    boxX: Math.min(x + 10, c.W - 130),
    boxY: Math.max(y - 46, 4),
    lines: [`V_BE  ${formatNum(vx, 3)} V`, `I_C   ${formatCurrent(ic)}`]
  }
}

function onOutputMove(event: MouseEvent) {
  const c = outputChart.value
  const vx = pointerToValue(event, c.xMin, c.xMax)
  if (vx === null || selectedLevels.value.length === 0) { hover.value = null; return }
  const vb = selectedLevels.value.reduce((best, level) =>
    Math.abs(level - params.value.vbe) < Math.abs(best - params.value.vbe) ? level : best, selectedLevels.value[0]!)
  const ic = Math.max(0, calc(vb, vb - vx).ic)
  const x = c.sx(vx)
  const y = c.sy(clamp(ic, 0, c.yTop))
  hover.value = {
    chart: 'output', x, y,
    boxX: Math.min(x + 10, c.W - 130),
    boxY: Math.max(y - 60, 4),
    lines: [`V_CE  ${formatNum(vx, 2)} V`, `V_BE  ${formatNum(vb, 2)} V`, `I_C   ${formatCurrent(ic)}`]
  }
}

function formatCurrent(a: number) {
  const abs = Math.abs(a)
  if (!Number.isFinite(a)) return '—'
  if (abs === 0) return '0 A'
  if (abs >= 1) return `${a.toFixed(3)} A`
  if (abs >= 1e-3) return `${(a * 1e3).toFixed(3)} mA`
  if (abs >= 1e-6) return `${(a * 1e6).toFixed(2)} µA`
  if (abs >= 1e-9) return `${(a * 1e9).toFixed(2)} nA`
  return `${(a * 1e12).toFixed(2)} pA`
}

function formatNum(n: number, digits = 3) {
  if (!Number.isFinite(n)) return '—'
  return n.toLocaleString('it-IT', { maximumFractionDigits: digits, minimumFractionDigits: 0 })
}

function formatPercent(n: number) {
  if (!Number.isFinite(n)) return '—'
  return n < 0.01 ? '<0,01 %' : `${formatNum(n, 2)} %`
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

function downloadCSV() {
  const rows: string[][] = [['curva', 'x_V', 'y_A']]
  transferChart.value.pts.forEach(pt => rows.push(['I_C-V_BE', pt.x.toFixed(4), pt.y.toExponential(4)]))
  outputChart.value.series.forEach(s => s.pts.forEach(pt => rows.push([`I_C-V_CE V_BE=${s.vb}`, pt.x.toFixed(4), pt.y.toExponential(4)])))
  rows.push(['punto_di_lavoro', params.value.vbe.toFixed(4), op.value.ic.toExponential(4)])
  const csv = rows.map(row => row.join(';')).join('\n')
  triggerDownload(new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' }), 'ebers-moll.csv')
}

function downloadPNG(svg: SVGSVGElement | null, filename: string) {
  if (!svg) return
  const clone = svg.cloneNode(true) as SVGSVGElement
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  const markup = new XMLSerializer().serializeToString(clone)
    .replace(/var\(--ui-primary\)/g, '#f59e0b')
    .replace(/var\(--ui-color-neutral-\d+\)/g, '#64748b')
  const url = URL.createObjectURL(new Blob([markup], { type: 'image/svg+xml;charset=utf-8' }))
  const image = new Image()
  image.onload = () => {
    const canvas = document.createElement('canvas')
    canvas.width = CHART_W * 2
    canvas.height = CHART_H * 2
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(blob => { if (blob) triggerDownload(blob, filename) })
    }
    URL.revokeObjectURL(url)
  }
  image.src = url
}

const summaryRows = computed(() => [
  { label: 'V_BE', value: `${formatNum(params.value.vbe, 3)} V`, note: `giunzione BE ${op.value.beBias}` },
  { label: 'V_BC', value: `${formatNum(params.value.vbc, 3)} V`, note: `giunzione BC ${op.value.bcBias}` },
  { label: 'V_CE', value: `${formatNum(op.value.vce, 3)} V`, note: 'V_BE − V_BC' },
  { label: 'I_F', value: formatCurrent(op.value.iF), note: 'trasporto diretto' },
  { label: 'I_R', value: formatCurrent(op.value.iR), note: 'trasporto inverso' },
  { label: 'I_C', value: formatCurrent(op.value.ic), note: 'collettore' },
  { label: 'I_B', value: formatCurrent(op.value.ib), note: 'base' },
  { label: 'I_E', value: formatCurrent(op.value.ie), note: 'emettitore' },
  { label: 'Regione', value: op.value.region, note: `soglia giunzioni ${formatNum(op.value.threshold, 3)} V` },
  { label: 'KCL', value: formatNum(op.value.kclError * 100, 6) + ' %', note: `I_E − (I_C + I_B) = ${formatCurrent(op.value.kclAbs)}` },
  { label: 'Reciprocità', value: formatNum(op.value.reciprocity, 3) + ' dec', note: 'log₁₀(I_SF / I_SR)' }
])

const analysisItems = computed(() => {
  const items = [
    `La giunzione BE è polarizzata in modo ${op.value.beBias} (V_BE = ${formatNum(params.value.vbe, 3)} V) e la giunzione BC in modo ${op.value.bcBias} (V_BC = ${formatNum(params.value.vbc, 3)} V): ne risulta la regione di ${op.value.region.toLowerCase()}.`,
    `Il trasporto diretto vale I_F = ${formatCurrent(op.value.iF)} e quello inverso I_R = ${formatCurrent(op.value.iR)}; α_F = ${formatNum(op.value.alphaF, 4)} e α_R = ${formatNum(op.value.alphaR, 4)}.`,
    `Le correnti del modello soddisfano I_E = I_C + I_B con errore relativo ${formatNum(op.value.kclError * 100, 6)} %.`
  ]
  if (op.value.region === 'Attiva diretta') {
    items.push(`Rispetto al modello semplificato I_C ≈ β_F·I_S·e^(V_BE/V_T) = ${formatCurrent(op.value.icSimple)}, lo scarto è ${formatPercent(op.value.simpleError)}: la differenza nasce dal termine inverso e dal fattore 1/α_R.`)
  }
  if (snapshot.value) {
    items.push(`Confronto: il punto bloccato ha V_BE = ${formatNum(snapshot.value.vbe, 3)} V, V_CE = ${formatNum(snapshotOp.value?.vce ?? 0, 3)} V e I_C = ${formatCurrent(snapshotOp.value?.ic ?? 0)}, contro V_BE = ${formatNum(params.value.vbe, 3)} V, V_CE = ${formatNum(op.value.vce, 3)} V e I_C = ${formatCurrent(op.value.ic)} del punto corrente.`)
  }
  return items
})
</script>

<template>
  <SimulationShell
    chapter="03"
    sim="01"
    title="Modello di Ebers–Moll"
    subtitle="BJT NPN: modello equivalente a due diodi e due generatori di corrente controllati"
    objective="Verificare il modello di Ebers–Moll calcolando correnti e tensioni ai terminali al variare della polarizzazione e osservare le regioni di funzionamento e le caratteristiche I-V."
  >
    <template #theory>
      <UAlert color="neutral" variant="soft" description="Il modello di Ebers–Moll descrive il transistor bipolare come due giunzioni p-n accoppiate: due diodi (uno base-emettitore, uno base-collettore) e due generatori di corrente controllati che rappresentano il trasporto di carica tra collettore ed emettitore." />
      <UPageGrid class="sm:grid-cols-2">
        <UCard :ui="{ body: 'space-y-1 text-sm' }">
          <UBadge color="neutral" variant="soft" size="xs" label="Correnti di giunzione" class="w-fit mb-1" />
          <MathBlock tex="I_F = I_{SF}\!\left(e^{V_{BE}/V_T}-1\right)" />
          <MathBlock tex="I_R = I_{SR}\!\left(e^{V_{BC}/V_T}-1\right)" />
        </UCard>
        <UCard :ui="{ body: 'space-y-1 text-sm' }">
          <UBadge color="neutral" variant="soft" size="xs" label="Correnti ai terminali" class="w-fit mb-1" />
          <MathBlock tex="I_C = I_F - \frac{I_R}{\alpha_R}" />
          <MathBlock tex="I_B = \frac{I_F}{\beta_F} + \frac{I_R}{\beta_R}" />
          <MathBlock tex="I_E = I_F\left(1+\frac{1}{\beta_F}\right) - I_R" />
        </UCard>
        <UCard :ui="{ body: 'space-y-2 text-sm' }">
          <UBadge color="neutral" variant="soft" size="xs" label="Significato fisico" class="w-fit mb-1" />
          <p class="text-xs text-muted leading-relaxed"><strong>I_F</strong> è la corrente di carrieri iniettata dall'emettitore e raccolta dal collettore; <strong>I_R</strong> è il flusso inverso dovuto alla giunzione base-collettore. I diodi del modello equivalente trasportano I_F/α_F e I_R/α_R, mentre i generatori controllati trasportano α_F·(I_F/α_F) = I_F e α_R·(I_R/α_R) = I_R.</p>
          <MathBlock tex="\alpha_F = \frac{\beta_F}{1+\beta_F} \qquad \alpha_R = \frac{\beta_R}{1+\beta_R}" />
        </UCard>
        <UCard :ui="{ body: 'space-y-2 text-sm' }">
          <UBadge color="neutral" variant="soft" size="xs" label="Confronto con il modello semplificato" class="w-fit mb-1" />
          <p class="text-xs text-muted leading-relaxed">Il modello a grande segnale semplificato vale solo in attiva diretta, con BC inversa e I_R ≈ 0. Il modello completo aggiunge il termine inverso e il fattore 1/α_R, importante in saturazione e attiva inversa.</p>
          <MathBlock tex="I_C \simeq \beta_F\,I_{SF}\,e^{V_{BE}/V_T}" />
        </UCard>
      </UPageGrid>
      <UCard :ui="{ body: 'space-y-2 text-sm' }">
        <UBadge color="neutral" variant="soft" size="xs" label="Quattro regioni operative" class="w-fit mb-1" />
        <div class="grid grid-cols-2 gap-2 text-xs">
          <div class="rounded border border-muted p-2"><strong>Interdizione</strong><br /><span class="text-muted">BE inversa · BC inversa</span></div>
          <div class="rounded border border-muted p-2"><strong>Attiva diretta</strong><br /><span class="text-muted">BE diretta · BC inversa</span></div>
          <div class="rounded border border-muted p-2"><strong>Saturazione</strong><br /><span class="text-muted">BE diretta · BC diretta</span></div>
          <div class="rounded border border-muted p-2"><strong>Attiva inversa</strong><br /><span class="text-muted">BE inversa · BC diretta</span></div>
        </div>
      </UCard>
      <UCard :ui="{ body: 'space-y-1 text-sm' }">
        <UBadge color="neutral" variant="soft" size="xs" label="Esempio numerico (valori iniziali)" class="w-fit mb-1" />
        <p class="text-xs text-muted leading-relaxed">Con V_BE = 0,70 V, V_T = 0,02585 V e I_SF = 10⁻¹⁴ A si ha e^(V_BE/V_T) ≈ 5,7·10¹¹, quindi I_F ≈ 5,7 mA. Con β_F = 100 risulta I_B ≈ 57 µA e I_C ≈ 5,7 mA: il transistor è in attiva diretta perché V_BC = −1 V polarizza la giunzione BC in inversa.</p>
      </UCard>
    </template>

    <template #schema>
      <UPageGrid class="lg:grid-cols-3">
        <UCard class="lg:col-span-2" :ui="{ body: 'p-3 sm:p-4' }">
          <UCard :ui="{ body: 'p-2 sm:p-3 bg-elevated/10' }">
            <svg viewBox="0 0 520 300" class="w-full h-auto" aria-label="Modello equivalente Ebers–Moll con due diodi e due generatori di corrente controllati">
              <defs>
                <marker id="arr-em" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
                  <path d="M0,0 L7,3.5 L0,7 Z" fill="currentColor" />
                </marker>
              </defs>
              <circle cx="40" cy="150" r="4" fill="var(--ui-primary)" />
              <circle cx="470" cy="50" r="4" fill="var(--ui-primary)" />
              <circle cx="470" cy="250" r="4" fill="var(--ui-primary)" />
              <text x="18" y="154" font-size="13" font-weight="600" fill="currentColor">B</text>
              <text x="482" y="54" font-size="13" font-weight="600" fill="currentColor">C</text>
              <text x="482" y="254" font-size="13" font-weight="600" fill="currentColor">E</text>
              <line x1="40" y1="150" x2="120" y2="150" stroke="currentColor" stroke-opacity="0.5" stroke-width="2" />
              <line x1="120" y1="150" x2="120" y2="70" stroke="currentColor" stroke-opacity="0.5" stroke-width="2" />
              <line x1="120" y1="150" x2="120" y2="230" stroke="currentColor" stroke-opacity="0.5" stroke-width="2" />
              <line x1="120" y1="70" x2="210" y2="70" stroke="currentColor" stroke-opacity="0.5" stroke-width="2" />
              <polygon points="210,58 210,82 232,70" fill="none" stroke="currentColor" stroke-width="2" />
              <line x1="232" y1="58" x2="232" y2="82" stroke="currentColor" stroke-width="2" />
              <line x1="232" y1="70" x2="300" y2="70" stroke="currentColor" stroke-opacity="0.5" stroke-width="2" />
              <line x1="300" y1="70" x2="300" y2="50" stroke="currentColor" stroke-opacity="0.5" stroke-width="2" />
              <line x1="300" y1="50" x2="470" y2="50" stroke="currentColor" stroke-opacity="0.5" stroke-width="2" />
              <line x1="120" y1="230" x2="210" y2="230" stroke="currentColor" stroke-opacity="0.5" stroke-width="2" />
              <polygon points="210,218 210,242 232,230" fill="none" stroke="currentColor" stroke-width="2" />
              <line x1="232" y1="218" x2="232" y2="242" stroke="currentColor" stroke-width="2" />
              <line x1="232" y1="230" x2="300" y2="230" stroke="currentColor" stroke-opacity="0.5" stroke-width="2" />
              <line x1="300" y1="230" x2="300" y2="250" stroke="currentColor" stroke-opacity="0.5" stroke-width="2" />
              <line x1="300" y1="250" x2="470" y2="250" stroke="currentColor" stroke-opacity="0.5" stroke-width="2" />
              <line x1="360" y1="50" x2="360" y2="110" stroke="currentColor" stroke-opacity="0.5" stroke-width="2" />
              <line x1="420" y1="50" x2="420" y2="110" stroke="currentColor" stroke-opacity="0.5" stroke-width="2" />
              <line x1="360" y1="190" x2="360" y2="250" stroke="currentColor" stroke-opacity="0.5" stroke-width="2" />
              <line x1="420" y1="190" x2="420" y2="250" stroke="currentColor" stroke-opacity="0.5" stroke-width="2" />
              <circle cx="360" cy="150" r="22" fill="none" stroke="var(--ui-primary)" stroke-width="2" />
              <line x1="360" y1="133" x2="360" y2="167" stroke="var(--ui-primary)" stroke-width="2" />
              <polygon points="360,167 354,156 366,156" fill="var(--ui-primary)" />
              <line x1="360" y1="110" x2="360" y2="128" stroke="currentColor" stroke-opacity="0.5" stroke-width="2" />
              <line x1="360" y1="172" x2="360" y2="190" stroke="currentColor" stroke-opacity="0.5" stroke-width="2" />
              <circle cx="420" cy="150" r="22" fill="none" stroke="var(--ui-primary)" stroke-width="2" />
              <line x1="420" y1="133" x2="420" y2="167" stroke="var(--ui-primary)" stroke-width="2" />
              <polygon points="420,133 414,144 426,144" fill="var(--ui-primary)" />
              <line x1="420" y1="110" x2="420" y2="128" stroke="currentColor" stroke-opacity="0.5" stroke-width="2" />
              <line x1="420" y1="172" x2="420" y2="190" stroke="currentColor" stroke-opacity="0.5" stroke-width="2" />
              <text x="200" y="44" font-size="11" font-weight="600" fill="currentColor">D_R</text>
              <text x="204" y="56" font-size="9" fill="currentColor" opacity="0.75">I_R/α_R = {{ formatCurrent(op.iDC) }}</text>
              <text x="200" y="204" font-size="11" font-weight="600" fill="currentColor">D_F</text>
              <text x="204" y="216" font-size="9" fill="currentColor" opacity="0.75">I_F/α_F = {{ formatCurrent(op.iDE) }}</text>
              <text x="306" y="138" font-size="10" fill="var(--ui-primary)">α_F·I_DE = I_F</text>
              <text x="306" y="152" font-size="9" fill="currentColor" opacity="0.75">{{ formatCurrent(op.iF) }}</text>
              <text x="438" y="138" font-size="10" fill="var(--ui-primary)">α_R·I_DC = I_R</text>
              <text x="438" y="152" font-size="9" fill="currentColor" opacity="0.75">{{ formatCurrent(op.iR) }}</text>
              <text x="132" y="34" font-size="10" fill="currentColor" opacity="0.75">V_BC = {{ formatNum(vbc, 3) }} V · {{ op.bcBias }}</text>
              <text x="132" y="258" font-size="10" fill="currentColor" opacity="0.75">V_BE = {{ formatNum(vbe, 3) }} V · {{ op.beBias }}</text>
              <text x="55" y="138" font-size="10" fill="var(--ui-primary)">I_B {{ formatCurrent(op.ib) }}</text>
              <text x="388" y="24" font-size="10" fill="var(--ui-primary)">I_C {{ formatCurrent(op.ic) }}</text>
              <text x="388" y="282" font-size="10" fill="var(--ui-primary)">I_E {{ formatCurrent(op.ie) }}</text>
            </svg>
          </UCard>
        </UCard>
        <UCard :ui="{ body: 'space-y-2' }">
          <UCard :ui="{ body: 'flex items-center justify-between p-2' }">
            <UBadge color="neutral" variant="soft" label="Regione" />
            <UBadge :color="op.color" variant="subtle" :label="op.region" />
          </UCard>
          <UCard :ui="{ body: 'space-y-2 text-sm' }">
            <UCard :ui="{ body: 'flex justify-between p-2' }"><UBadge color="neutral" variant="soft" label="V_CE" /><UBadge color="primary" variant="subtle" :label="`${formatNum(op.vce, 4)} V`" class="font-mono" /></UCard>
            <UCard :ui="{ body: 'flex justify-between p-2' }"><UBadge color="neutral" variant="soft" label="α_F" /><UBadge color="primary" variant="subtle" :label="formatNum(op.alphaF, 5)" class="font-mono" /></UCard>
            <UCard :ui="{ body: 'flex justify-between p-2' }"><UBadge color="neutral" variant="soft" label="α_R" /><UBadge color="primary" variant="subtle" :label="formatNum(op.alphaR, 5)" class="font-mono" /></UCard>
            <UCard :ui="{ body: 'flex justify-between p-2' }"><UBadge color="neutral" variant="soft" label="KCL" /><UBadge :color="op.kclError < 1e-9 ? 'success' : 'warning'" variant="subtle" :label="formatPercent(op.kclError * 100)" class="font-mono" /></UCard>
          </UCard>
          <UAlert color="neutral" variant="soft" description="Equivalent circuit: due diodi (I_F/α_F, I_R/α_R) e due generatori controllati (I_F, I_R)." />
        </UCard>
      </UPageGrid>
    </template>

    <template #parameters>
      <UPageGrid class="lg:grid-cols-3">
        <UCard class="lg:col-span-2" :ui="{ body: 'space-y-4' }">
          <UPageHeader :ui="{ root: 'border-b-0 py-0' }">
            <template #headline>
              <UBadge color="neutral" variant="soft" size="xs" label="Valori impostati" class="tracking-wide uppercase" />
            </template>
            <template #links>
              <UButton size="xs" color="neutral" variant="ghost" icon="i-lucide-rotate-ccw" label="Ripristina" @click="resetDefaults" />
            </template>
          </UPageHeader>
          <UFormField label="Preset regione operativa">
            <div class="flex flex-wrap gap-2">
              <UButton v-for="preset in PRESETS" :key="preset.key" size="xs" :color="preset.color" variant="subtle" :label="preset.label" @click="applyPreset(preset)" />
            </div>
          </UFormField>
          <UPageGrid class="sm:grid-cols-2 gap-x-6 gap-y-4">
            <UFormField label="V_BE" :hint="`${vbe.toFixed(3)} V`" class="sm:col-span-2">
              <USlider v-model="vbe" :min="-0.2" :max="0.9" :step="0.005" />
            </UFormField>
            <UFormField label="V_BC" :hint="`${vbc.toFixed(3)} V`" class="sm:col-span-2">
              <USlider v-model="vbc" :min="-5" :max="0.8" :step="0.01" />
            </UFormField>
            <UFormField label="I_SF (A)" size="sm">
              <div class="flex items-center gap-1">
                <UInput v-model.number="isat" type="number" step="any" min="1e-30" size="sm" class="min-w-0 flex-1" @change="normalizeInputs" />
                <UButton size="xs" color="neutral" variant="ghost" icon="i-lucide-rotate-ccw" title="Ripristina I_SF" @click="isat = DEFAULTS.isat" />
              </div>
            </UFormField>
            <UFormField label="I_SR (A)" size="sm">
              <div class="flex items-center gap-1">
                <UInput v-model.number="isatR" type="number" step="any" min="1e-30" size="sm" class="min-w-0 flex-1" @change="normalizeInputs" />
                <UButton size="xs" color="neutral" variant="ghost" icon="i-lucide-rotate-ccw" title="Ripristina I_SR" @click="isatR = DEFAULTS.isatR" />
              </div>
            </UFormField>
            <UFormField label="V_T (V)" size="sm">
              <div class="flex items-center gap-1">
                <UInput v-model.number="vt" type="number" step="0.0001" min="1e-6" size="sm" class="min-w-0 flex-1" @change="normalizeInputs" />
                <UButton size="xs" color="neutral" variant="ghost" icon="i-lucide-rotate-ccw" title="Ripristina V_T" @click="vt = DEFAULTS.vt" />
              </div>
            </UFormField>
            <UFormField label="β_F" size="sm">
              <div class="flex items-center gap-1">
                <UInput v-model.number="betaF" type="number" step="1" min="0.001" size="sm" class="min-w-0 flex-1" @change="normalizeInputs" />
                <UButton size="xs" color="neutral" variant="ghost" icon="i-lucide-rotate-ccw" title="Ripristina β_F" @click="betaF = DEFAULTS.betaF" />
              </div>
            </UFormField>
            <UFormField label="β_R" size="sm">
              <div class="flex items-center gap-1">
                <UInput v-model.number="betaR" type="number" step="0.1" min="0.001" size="sm" class="min-w-0 flex-1" @change="normalizeInputs" />
                <UButton size="xs" color="neutral" variant="ghost" icon="i-lucide-rotate-ccw" title="Ripristina β_R" @click="betaR = DEFAULTS.betaR" />
              </div>
            </UFormField>
          </UPageGrid>
          <UAlert v-if="hasInvalidInput" color="warning" variant="subtle" title="Valori non validi" description="Sono stati corretti automaticamente valori negativi, nulli o non numerici. I calcoli usano i limiti minimi ammessi." />
          <div class="flex flex-wrap gap-2">
            <UButton size="xs" color="neutral" variant="outline" icon="i-lucide-crosshair" label="Blocca punto di lavoro" @click="captureSnapshot" />
            <UButton size="xs" color="neutral" variant="ghost" icon="i-lucide-rotate-ccw" label="Rilascia confronto" :disabled="!snapshot" @click="snapshot = null" />
            <UButton size="xs" color="neutral" variant="ghost" icon="i-lucide-upload" label="Ripristina confronto" :disabled="!snapshot" @click="restoreSnapshot" />
            <UButton size="xs" color="neutral" variant="ghost" icon="i-lucide-download" label="Esporta CSV" @click="downloadCSV" />
          </div>
        </UCard>
        <UCard :ui="{ body: 'space-y-2' }">
          <UBadge color="neutral" variant="soft" size="xs" label="Valori calcolati" class="tracking-wide uppercase w-fit mb-1" />
          <UCard :ui="{ body: 'flex justify-between p-2 text-sm' }"><UBadge color="neutral" variant="soft" label="I_C" /><UBadge color="primary" variant="subtle" :label="formatCurrent(op.ic)" class="font-mono font-medium" /></UCard>
          <UCard :ui="{ body: 'flex justify-between p-2 text-sm' }"><UBadge color="neutral" variant="soft" label="I_B" /><UBadge color="primary" variant="subtle" :label="formatCurrent(op.ib)" class="font-mono font-medium" /></UCard>
          <UCard :ui="{ body: 'flex justify-between p-2 text-sm' }"><UBadge color="neutral" variant="soft" label="I_E" /><UBadge color="primary" variant="subtle" :label="formatCurrent(op.ie)" class="font-mono font-medium" /></UCard>
          <UCard :ui="{ body: 'flex justify-between p-2 text-sm' }"><UBadge color="neutral" variant="soft" label="I_F" /><UBadge color="primary" variant="subtle" :label="formatCurrent(op.iF)" class="font-mono" /></UCard>
          <UCard :ui="{ body: 'flex justify-between p-2 text-sm' }"><UBadge color="neutral" variant="soft" label="I_R" /><UBadge color="primary" variant="subtle" :label="formatCurrent(op.iR)" class="font-mono" /></UCard>
          <UCard :ui="{ body: 'flex justify-between p-2 text-sm' }"><UBadge color="neutral" variant="soft" label="Errore KCL" /><UBadge :color="op.kclError < 1e-9 ? 'success' : 'warning'" variant="subtle" :label="formatPercent(op.kclError * 100)" class="font-mono" /></UCard>
        </UCard>
      </UPageGrid>
    </template>

    <template #results>
      <UCard class="lg:col-span-2" :ui="{ body: 'p-3 sm:p-4 space-y-2' }">
        <UBadge color="neutral" variant="soft" size="xs" label="Tabella riepilogativa" class="tracking-wide uppercase w-fit" />
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead><tr class="text-left text-xs uppercase text-muted"><th class="py-1 pr-3">Grandezza</th><th class="py-1 pr-3">Valore</th><th class="py-1">Interpretazione</th></tr></thead>
            <tbody>
              <tr v-for="row in summaryRows" :key="row.label" class="border-t border-muted/40">
                <td class="py-1 pr-3 font-medium">{{ row.label }}</td>
                <td class="py-1 pr-3 font-mono">{{ row.value }}</td>
                <td class="py-1 text-muted">{{ row.note }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <UAlert v-if="op.region === 'Attiva diretta'" color="success" variant="subtle" :description="`Interpretazione: BE diretta e BC inversa, il collettore raccoglie quasi tutta la corrente di emettitore. Modello semplificato: ${formatCurrent(op.icSimple)} (scarto ${formatPercent(op.simpleError)}).`" />
        <UAlert v-else-if="op.region === 'Saturazione'" color="warning" variant="subtle" description="Interpretazione: entrambe le giunzioni sono dirette, il termine inverso I_R non è trascurabile e V_CE è piccolo." />
        <UAlert v-else-if="op.region === 'Attiva inversa'" color="info" variant="subtle" description="Interpretazione: BC diretta e BE inversa, il trasporto inverso domina e il guadagno è molto minore (β_R)." />
        <UAlert v-else color="neutral" variant="subtle" description="Interpretazione: entrambe le giunzioni sono inverse, restano solo correnti di fuga dell'ordine di I_S." />
        <UAlert v-if="snapshot" color="primary" variant="subtle" :description="`Confronto attivo: A = ${formatNum(snapshot.vbe, 3)} V / ${formatCurrent(snapshotOp?.ic ?? 0)} · B = ${formatNum(params.vbe, 3)} V / ${formatCurrent(op.ic)}.`" />
      </UCard>

      <UPageGrid class="lg:col-span-2 sm:grid-cols-2 gap-4">
        <UCard :ui="{ body: 'p-3 sm:p-4 space-y-2' }">
          <UPageHeader title="Caratteristica di trasferimento I_C–V_BE" :description="`V_BC = ${formatNum(vbc, 2)} V (parametro impostato)`" :ui="{ root: 'border-b-0 py-0', title: 'text-base font-medium text-highlighted', description: 'text-xs text-muted' }">
            <template #links>
              <UButton size="xs" color="neutral" variant="ghost" icon="i-lucide-maximize-2" title="Ingrandisci" @click="expandedChart = expandedChart === 'transfer' ? null : 'transfer'" />
              <UButton size="xs" color="neutral" variant="ghost" icon="i-lucide-image-down" title="Scarica PNG" @click="downloadPNG(transferSvg, 'ebers-moll-transfer.png')" />
            </template>
          </UPageHeader>
          <div :class="expandedChart === 'transfer' ? 'fixed inset-0 z-50 flex items-center justify-center bg-carbon-950/85 p-4' : ''" @click.self="expandedChart = null">
            <div :class="expandedChart === 'transfer' ? 'w-full max-w-5xl rounded-lg bg-elevated p-4' : ''">
              <div v-if="expandedChart === 'transfer'" class="mb-2 flex justify-end">
                <UButton size="xs" color="neutral" variant="ghost" icon="i-lucide-x" label="Chiudi" @click="expandedChart = null" />
              </div>
              <svg ref="transferSvg" :viewBox="`0 0 ${transferChart.W} ${transferChart.H}`" class="w-full h-auto" @mousemove="onTransferMove" @mouseleave="hover = null">
                <line :x1="transferChart.pad.l" :y1="transferChart.H - transferChart.pad.b" :x2="transferChart.W - transferChart.pad.r" :y2="transferChart.H - transferChart.pad.b" stroke="currentColor" stroke-opacity="0.35" />
                <line :x1="transferChart.pad.l" :y1="transferChart.pad.t" :x2="transferChart.pad.l" :y2="transferChart.H - transferChart.pad.b" stroke="currentColor" stroke-opacity="0.35" />
                <g v-for="(t, i) in transferChart.yTicks" :key="'yt' + i">
                  <line :x1="transferChart.pad.l" :x2="transferChart.W - transferChart.pad.r" :y1="t.y" :y2="t.y" stroke="currentColor" stroke-opacity="0.12" />
                  <text :x="transferChart.pad.l - 6" :y="t.y + 3" text-anchor="end" font-size="9" fill="currentColor" opacity="0.7">{{ t.label }}</text>
                </g>
                <g v-for="(t, i) in transferChart.xTicks" :key="'xt' + i">
                  <line :x1="t.x" :x2="t.x" :y1="transferChart.pad.t" :y2="transferChart.H - transferChart.pad.b" stroke="currentColor" stroke-opacity="0.08" />
                  <text :x="t.x" :y="transferChart.H - transferChart.pad.b + 14" text-anchor="middle" font-size="9" fill="currentColor" opacity="0.7">{{ formatNum(t.v, 2) }}</text>
                </g>
                <path :d="transferChart.path" fill="none" stroke="var(--ui-primary)" stroke-width="2" />
                <line :x1="transferChart.opX" :x2="transferChart.opX" :y1="transferChart.opY" :y2="transferChart.H - transferChart.pad.b" stroke="var(--ui-primary)" stroke-opacity="0.5" stroke-width="1" stroke-dasharray="4 4" />
                <line :x1="transferChart.pad.l" :x2="transferChart.opX" :y1="transferChart.opY" :y2="transferChart.opY" stroke="var(--ui-primary)" stroke-opacity="0.5" stroke-width="1" stroke-dasharray="4 4" />
                <circle :cx="transferChart.opX" :cy="transferChart.opY" r="5" fill="var(--ui-primary)" stroke="white" stroke-width="1.5" />
                <circle v-if="transferChart.snapX !== null && transferChart.snapY !== null" :cx="transferChart.snapX" :cy="transferChart.snapY" r="5" fill="none" stroke="#38bdf8" stroke-width="2" />
                <g v-if="hover && hover.chart === 'transfer'">
                  <line :x1="hover.x" :x2="hover.x" :y1="transferChart.pad.t" :y2="transferChart.H - transferChart.pad.b" stroke="currentColor" stroke-opacity="0.35" stroke-dasharray="3 3" />
                  <rect :x="hover.boxX" :y="hover.boxY" width="126" :height="hover.lines.length * 15 + 8" rx="3" fill="var(--ui-bg)" stroke="currentColor" stroke-opacity="0.3" />
                  <text v-for="(line, i) in hover.lines" :key="i" :x="hover.boxX + 6" :y="hover.boxY + 14 + i * 15" font-size="9" fill="currentColor">{{ line }}</text>
                </g>
                <text :x="transferChart.W / 2" :y="transferChart.H - 4" text-anchor="middle" font-size="10" fill="currentColor" opacity="0.7">V_BE (V)</text>
                <text :x="12" :y="transferChart.H / 2" text-anchor="middle" font-size="10" fill="currentColor" opacity="0.7" transform="rotate(-90 12 140)">I_C</text>
              </svg>
            </div>
          </div>
        </UCard>

        <UCard :ui="{ body: 'p-3 sm:p-4 space-y-2' }">
          <UPageHeader title="Caratteristiche di uscita I_C–V_CE" description="Famiglia di curve: seleziona i livelli di V_BE" :ui="{ root: 'border-b-0 py-0', title: 'text-base font-medium text-highlighted', description: 'text-xs text-muted' }">
            <template #links>
              <UButton size="xs" color="neutral" variant="ghost" icon="i-lucide-maximize-2" title="Ingrandisci" @click="expandedChart = expandedChart === 'output' ? null : 'output'" />
              <UButton size="xs" color="neutral" variant="ghost" icon="i-lucide-image-down" title="Scarica PNG" @click="downloadPNG(outputSvg, 'ebers-moll-output.png')" />
            </template>
          </UPageHeader>
          <div class="flex flex-wrap gap-1">
            <UButton v-for="(level, i) in LEVELS" :key="level" size="xs" :color="selectedLevels.includes(level) ? 'primary' : 'neutral'" :variant="selectedLevels.includes(level) ? 'subtle' : 'outline'" :label="`${formatNum(level, 2)} V`" @click="toggleLevel(level)" />
          </div>
          <div :class="expandedChart === 'output' ? 'fixed inset-0 z-50 flex items-center justify-center bg-carbon-950/85 p-4' : ''" @click.self="expandedChart = null">
            <div :class="expandedChart === 'output' ? 'w-full max-w-5xl rounded-lg bg-elevated p-4' : ''">
              <div v-if="expandedChart === 'output'" class="mb-2 flex justify-end">
                <UButton size="xs" color="neutral" variant="ghost" icon="i-lucide-x" label="Chiudi" @click="expandedChart = null" />
              </div>
              <svg ref="outputSvg" :viewBox="`0 0 ${outputChart.W} ${outputChart.H}`" class="w-full h-auto" @mousemove="onOutputMove" @mouseleave="hover = null">
                <rect :x="outputChart.pad.l" :y="outputChart.pad.t" :width="outputChart.satEdge - outputChart.pad.l" :height="outputChart.H - outputChart.pad.t - outputChart.pad.b" fill="#f59e0b" fill-opacity="0.09" />
                <rect :x="outputChart.satEdge" :y="outputChart.pad.t" :width="outputChart.W - outputChart.pad.r - outputChart.satEdge" :height="outputChart.H - outputChart.pad.t - outputChart.pad.b" fill="#22c55e" fill-opacity="0.05" />
                <text :x="(outputChart.pad.l + outputChart.satEdge) / 2" :y="outputChart.pad.t + 12" text-anchor="middle" font-size="9" fill="#f59e0b">saturazione</text>
                <text :x="(outputChart.satEdge + outputChart.W - outputChart.pad.r) / 2" :y="outputChart.pad.t + 12" text-anchor="middle" font-size="9" fill="#22c55e">attiva diretta</text>
                <line :x1="outputChart.pad.l" :y1="outputChart.H - outputChart.pad.b" :x2="outputChart.W - outputChart.pad.r" :y2="outputChart.H - outputChart.pad.b" stroke="currentColor" stroke-opacity="0.35" />
                <line :x1="outputChart.pad.l" :y1="outputChart.pad.t" :x2="outputChart.pad.l" :y2="outputChart.H - outputChart.pad.b" stroke="currentColor" stroke-opacity="0.35" />
                <g v-for="(t, i) in outputChart.yTicks" :key="'oyt' + i">
                  <line :x1="outputChart.pad.l" :x2="outputChart.W - outputChart.pad.r" :y1="t.y" :y2="t.y" stroke="currentColor" stroke-opacity="0.12" />
                  <text :x="outputChart.pad.l - 6" :y="t.y + 3" text-anchor="end" font-size="9" fill="currentColor" opacity="0.7">{{ t.label }}</text>
                </g>
                <g v-for="(t, i) in outputChart.xTicks" :key="'oxt' + i">
                  <line :x1="t.x" :x2="t.x" :y1="outputChart.pad.t" :y2="outputChart.H - outputChart.pad.b" stroke="currentColor" stroke-opacity="0.08" />
                  <text :x="t.x" :y="outputChart.H - outputChart.pad.b + 14" text-anchor="middle" font-size="9" fill="currentColor" opacity="0.7">{{ t.v }}</text>
                </g>
                <path v-for="curve in outputChart.curves" :key="curve.v" :d="curve.path" fill="none" :stroke="curve.color" stroke-width="1.8" />
                <line :x1="outputChart.opX" :x2="outputChart.opX" :y1="outputChart.opY" :y2="outputChart.H - outputChart.pad.b" stroke="var(--ui-primary)" stroke-opacity="0.5" stroke-width="1" stroke-dasharray="4 4" />
                <line :x1="outputChart.pad.l" :x2="outputChart.opX" :y1="outputChart.opY" :y2="outputChart.opY" stroke="var(--ui-primary)" stroke-opacity="0.5" stroke-width="1" stroke-dasharray="4 4" />
                <circle :cx="outputChart.opX" :cy="outputChart.opY" r="5" fill="var(--ui-primary)" stroke="white" stroke-width="1.5" />
                <circle v-if="outputChart.snapX !== null && outputChart.snapY !== null" :cx="outputChart.snapX" :cy="outputChart.snapY" r="5" fill="none" stroke="#38bdf8" stroke-width="2" />
                <g v-if="hover && hover.chart === 'output'">
                  <rect :x="hover.boxX" :y="hover.boxY" width="126" :height="hover.lines.length * 15 + 8" rx="3" fill="var(--ui-bg)" stroke="currentColor" stroke-opacity="0.3" />
                  <text v-for="(line, i) in hover.lines" :key="i" :x="hover.boxX + 6" :y="hover.boxY + 14 + i * 15" font-size="9" fill="currentColor">{{ line }}</text>
                </g>
                <g v-for="(curve, i) in outputChart.curves" :key="'leg' + curve.v">
                  <line :x1="outputChart.W - outputChart.pad.r - 74" :x2="outputChart.W - outputChart.pad.r - 58" :y1="outputChart.pad.t + 10 + i * 14" :y2="outputChart.pad.t + 10 + i * 14" :stroke="curve.color" stroke-width="2" />
                  <text :x="outputChart.W - outputChart.pad.r - 54" :y="outputChart.pad.t + 13 + i * 14" font-size="9" fill="currentColor" opacity="0.75">{{ formatNum(curve.v, 2) }} V</text>
                </g>
                <text :x="outputChart.W / 2" :y="outputChart.H - 4" text-anchor="middle" font-size="10" fill="currentColor" opacity="0.7">V_CE (V)</text>
                <text :x="12" :y="outputChart.H / 2" text-anchor="middle" font-size="10" fill="currentColor" opacity="0.7" transform="rotate(-90 12 140)">I_C</text>
              </svg>
            </div>
          </div>
        </UCard>
      </UPageGrid>
    </template>

    <template #analysis>
      <UPageGrid class="grid-cols-1 gap-2">
        <UAlert v-for="(item, i) in analysisItems" :key="i" color="neutral" variant="soft" icon="i-lucide-info" :description="item" />
      </UPageGrid>
    </template>

    <template #conclusion>
      <UAlert color="neutral" variant="soft" :description="`La simulazione conferma il modello equivalente a due diodi e due generatori controllati: la regione di ${op.region.toLowerCase()} è determinata dalle polarizzazioni delle giunzioni e le correnti rispettano I_E = I_C + I_B.`" />
      <UCard class="mt-2">
        <UBadge color="neutral" variant="soft" size="xs" label="Verifica teorica" class="tracking-wide uppercase w-fit mb-2" />
        <UAlert :color="op.kclError < 1e-9 ? 'success' : 'warning'" variant="subtle" :description="`Errore di Kirchhoff: ${formatPercent(op.kclError * 100)} · reciprocità I_SF/I_SR: ${formatNum(op.reciprocity, 3)} decadi.`" />
      </UCard>
    </template>
  </SimulationShell>
</template>

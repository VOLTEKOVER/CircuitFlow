export interface SimulationItem {
  title: string
  description: string
  to: string
  icon: string
  tags: string[]
  status?: string
  category?: string
}

export const simulations: SimulationItem[] = [
  {
    title: 'Modello Ebers–Moll',
    description: 'Modello equivalente a due diodi e due generatori di corrente, correnti, regioni operative e grafici caratteristici.',
    to: '/libreria/ebers-moll',
    icon: 'i-lucide-microchip',
    tags: ['BJT', 'Ebers–Moll', 'DC'],
    status: 'Disponibile',
    category: 'BJT'
  },
  {
    title: 'Struttura e correnti NPN/PNP',
    description: 'Confronto tra BJT NPN e PNP: terminali, polarità, versi delle correnti e relazioni fondamentali.',
    to: '/libreria/bjt-struttura',
    icon: 'i-lucide-git-compare-arrows',
    tags: ['BJT', 'NPN', 'PNP'],
    status: 'Disponibile',
    category: 'BJT'
  },
  {
    title: 'Polarizzazione e caratteristica esponenziale',
    description: 'Variazione di V_BE, I_B, α_F e β_F con curve I_C-V_BE e I_C-I_B in zona attiva.',
    to: '/libreria/bjt-polarizzazione',
    icon: 'i-lucide-trending-up',
    tags: ['BJT', 'Polarizzazione', 'Guadagno'],
    status: 'Disponibile',
    category: 'BJT'
  },
  {
    title: 'Regioni di funzionamento',
    description: 'Attiva, saturazione, interdizione e inversa: condizioni di polarizzazione, correnti e tensioni.',
    to: '/libreria/bjt-regioni',
    icon: 'i-lucide-grid-2x2',
    tags: ['BJT', 'Regioni', 'Bias'],
    status: 'Disponibile',
    category: 'BJT'
  },
  {
    title: 'Curve caratteristiche NPN/PNP',
    description: 'Curve di trasferimento e di uscita per transistor NPN e PNP con parametri regolabili.',
    to: '/libreria/bjt-curve',
    icon: 'i-lucide-chart-spline',
    tags: ['BJT', 'Curve', 'NPN/PNP'],
    status: 'Disponibile',
    category: 'BJT'
  },
  {
    title: 'Modello di Giacoletto (piccolo segnale)',
    description: 'Parametri g_m, r_π, r_o, capacità e risposta in frequenza del modello equivalente a piccolo segnale.',
    to: '/libreria/bjt-giacoletto',
    icon: 'i-lucide-audio-waveform',
    tags: ['BJT', 'Giacoletto', 'AC'],
    status: 'Disponibile',
    category: 'BJT'
  },
  {
    title: 'Punto di lavoro e amplificatore CE',
    description: 'Retta di carico, punto Q, soluzioni analitiche/grafiche e guadagno dell’amplificatore a emettitore comune.',
    to: '/libreria/bjt-amplificatore',
    icon: 'i-lucide-sliders-vertical',
    tags: ['BJT', 'Bias', 'Amplificatore'],
    status: 'Disponibile',
    category: 'BJT'
  },
  {
    title: 'Spessore di base e ricombinazione',
    description: 'Effetto della larghezza della base e della ricombinazione su α_F, β_F e trasporto dei portatori.',
    to: '/libreria/bjt-base-spessore',
    icon: 'i-lucide-ruler',
    tags: ['BJT', 'Fisica', 'Base'],
    status: 'Disponibile',
    category: 'BJT'
  },
  {
    title: 'Diffusione, deriva e regione di svuotamento',
    description: 'Modello interattivo di giunzione PN: movimento di lacune ed elettroni, formazione della barriera e profili di campo e potenziale.',
    to: '/libreria/diffusione-deriva',
    icon: 'i-lucide-atom',
    tags: ['Giunzione PN', 'Portatori', 'Fisica'],
    status: 'Disponibile',
    category: 'Fisica dei semiconduttori'
  }
]
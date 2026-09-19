export type CurrencyCode = 'CFA';

export interface ServerPlan {
  id: string;
  name: string;
  tagline: string;
  priceMonthlyCfa: number;
  priceMonthlyUsd: number; // rétrocompatibilité
  cpuCores: number;
  cpuLabel: string;
  ramMb: number;
  ramLabel: string;
  diskGb: number;
  diskLabel: string;
  bandwidthLabel: string;
  recommendedFor: string;
  badge?: string;
  badgeColor?: string;
  accentBorder: string;
  accentBg: string;
  features: string[];
}

export const SERVER_PLANS: ServerPlan[] = [
  {
    id: 'eco-2',
    name: 'Starter Eco',
    tagline: 'Idéal pour débuter avec un bot personnel léger',
    priceMonthlyCfa: 1300,
    priceMonthlyUsd: 1300,
    cpuCores: 0.5,
    cpuLabel: '0.5 vCPU Dédié',
    ramMb: 512,
    ramLabel: '512 MB RAM',
    diskGb: 2,
    diskLabel: '2 GB SSD NVMe',
    bandwidthLabel: 'Trafic 200 GB / mois',
    recommendedFor: 'WhatsApp personnel ou bot Telegram solo',
    badge: 'Économique',
    badgeColor: 'bg-emerald-950/80 text-emerald-400 border-emerald-800/80',
    accentBorder: 'hover:border-emerald-500/60',
    accentBg: 'from-emerald-900/20 to-slate-900',
    features: [
      '1 Bot en ligne 24h/24',
      '0.5 vCPU Cgroups v2',
      '512 MB RAM allouée',
      '2 GB Stockage SSD',
      'Pairing Code WhatsApp 24/7',
      'Watchdog Crash (délai 5s)',
      'Sauvegarde ZIP manuelle',
      'Durée : 30 jours (1 mois)',
    ],
  },
  {
    id: 'standard-2.5',
    name: 'Standard Baileys',
    tagline: 'Le choix n°1 pour les bots WhatsApp complets',
    priceMonthlyCfa: 1650,
    priceMonthlyUsd: 1650,
    cpuCores: 1.0,
    cpuLabel: '1.0 vCPU Dédié',
    ramMb: 1024,
    ramLabel: '1024 MB (1 GB) RAM',
    diskGb: 5,
    diskLabel: '5 GB SSD NVMe',
    bandwidthLabel: 'Trafic 500 GB / mois',
    recommendedFor: 'WhatsApp Baileys multi-groupes avec commandes',
    badge: 'Plus Populaire',
    badgeColor: 'bg-indigo-950/90 text-indigo-300 border-indigo-500/50',
    accentBorder: 'border-indigo-500/80 shadow-indigo-500/20 ring-1 ring-indigo-500/30',
    accentBg: 'from-indigo-900/30 to-slate-900',
    features: [
      '1 à 2 Bots en ligne 24h/24',
      '1.0 vCPU Dédié (Ultra réactif)',
      '1024 MB (1 GB) RAM',
      '5 GB SSD NVMe rapide',
      'Pairing Code WhatsApp & QR',
      'Watchdog Crash immédiat (3s)',
      'Éditeur de code in-browser',
      'Sauvegardes ZIP illimitées',
      'Durée : 30 jours (1 mois)',
    ],
  },
  {
    id: 'plus-5',
    name: 'Plus Turbo',
    tagline: 'Pour les groupes actifs et envoi intensif de médias',
    priceMonthlyCfa: 3250,
    priceMonthlyUsd: 3250,
    cpuCores: 2.0,
    cpuLabel: '2.0 vCPUs Haute Vitesse',
    ramMb: 2048,
    ramLabel: '2048 MB (2 GB) RAM',
    diskGb: 10,
    diskLabel: '10 GB SSD NVMe',
    bandwidthLabel: 'Trafic 1 TB / mois',
    recommendedFor: 'Bots multi-groupes, stickers, vidéos et audio',
    badge: 'Multi-Groupes',
    badgeColor: 'bg-cyan-950/80 text-cyan-300 border-cyan-700/60',
    accentBorder: 'hover:border-cyan-500/60',
    accentBg: 'from-cyan-900/20 to-slate-900',
    features: [
      'Jusqu\'à 4 Bots actifs 24/7',
      '2.0 vCPUs Haute priorité',
      '2048 MB (2 GB) RAM',
      '10 GB SSD NVMe',
      'Téléchargement médias lourds',
      'Bases de données SQLite volumineuses',
      'Watchdog prioritaire',
      'Durée : 30 jours (1 mois)',
    ],
  },
  {
    id: 'pro-7.5',
    name: 'Pro High-Power',
    tagline: 'Idéal pour l\'automatisation IA et scripts Python/Node lourds',
    priceMonthlyCfa: 4900,
    priceMonthlyUsd: 4900,
    cpuCores: 3.0,
    cpuLabel: '3.0 vCPUs Turbo',
    ramMb: 3072,
    ramLabel: '3072 MB (3 GB) RAM',
    diskGb: 15,
    diskLabel: '15 GB SSD NVMe',
    bandwidthLabel: 'Trafic 2 TB / mois',
    recommendedFor: 'Bots IA (Gemini/OpenAI), scraping web et Telegram mass',
    badge: 'Haute Puissance',
    badgeColor: 'bg-violet-950/80 text-violet-300 border-violet-700/60',
    accentBorder: 'hover:border-violet-500/60',
    accentBg: 'from-violet-900/20 to-slate-900',
    features: [
      'Multi-bots et scripts IA',
      '3.0 vCPUs Turbo',
      '3072 MB (3 GB) RAM',
      '15 GB Stockage NVMe',
      'Support Gemini API & OpenAI',
      'Auto-restart instantané',
      'Accès prioritaire aux ressources VPS',
      'Durée : 30 jours (1 mois)',
    ],
  },
  {
    id: 'ultra-10',
    name: 'Ultra VPS Master',
    tagline: 'Performances maximales absolues et bande passante illimitée',
    priceMonthlyCfa: 6500,
    priceMonthlyUsd: 6500,
    cpuCores: 4.0,
    cpuLabel: '4.0 vCPUs Dédiés Max',
    ramMb: 4096,
    ramLabel: '4096 MB (4 GB) RAM',
    diskGb: 25,
    diskLabel: '25 GB SSD NVMe',
    bandwidthLabel: 'Trafic Illimité (1 Gbps)',
    recommendedFor: 'Ferme de bots, charges extrêmes, revendeurs',
    badge: 'Puissance Maximale',
    badgeColor: 'bg-amber-950/90 text-amber-300 border-amber-500/60',
    accentBorder: 'hover:border-amber-500/70',
    accentBg: 'from-amber-900/20 to-slate-900',
    features: [
      'Nombre de bots illimité (selon RAM)',
      '4.0 vCPUs Dédiés Cgroups v2',
      '4096 MB (4 GB) RAM haute vitesse',
      '25 GB SSD NVMe ultra-rapide',
      'Port réseau dédié 1 Gbps',
      'Watchdog Ultra (restart < 1s)',
      'Support prioritaire WhatsApp VIP',
      'Durée : 30 jours (1 mois)',
    ],
  },
];

// Devise unique officielle de la plateforme
export const CURRENCY_CONFIG = {
  symbol: 'CFA',
  suffix: 'CFA',
  label: 'Francs CFA (FCFA)',
};

export const formatPrice = (priceCfa: number, _currency?: any): string => {
  const rounded = Math.round(priceCfa);
  return `${rounded.toLocaleString('fr-FR')} CFA`;
};

// Helper pour calculer la date d'expiration (J + 30 jours)
export const calculateExpirationDate = (days: number = 30): { iso: string; formatted: string; daysRemaining: number } => {
  const now = new Date();
  const expDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  return {
    iso: expDate.toISOString(),
    formatted: expDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
    daysRemaining: days,
  };
};

export const getDaysRemaining = (expiresAtIso: string): number => {
  const expTime = new Date(expiresAtIso).getTime();
  const nowTime = new Date().getTime();
  const diffDays = Math.ceil((expTime - nowTime) / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
};

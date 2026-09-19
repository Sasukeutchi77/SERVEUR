import React from 'react';
import { 
  Rocket, 
  Play, 
  Cpu, 
  HardDrive, 
  Layers, 
  CheckCircle2, 
  Clock, 
  Smartphone, 
  Send, 
  Bot, 
  MoreVertical, 
  ArrowUpRight, 
  RotateCw,
  Square,
  ChevronRight,
  Terminal,
  ShieldAlert
} from 'lucide-react';
import { MetricCard } from '../ui/MetricCard.tsx';
import { StatusBadge } from '../ui/StatusBadge.tsx';
import type { Deployment } from '../../../shared/types/index.ts';

interface DashboardOverviewProps {
  onNavigate: (tab: any) => void;
  onSelectDeployment: (bot: any) => void;
  onTriggerAction: (action: string, botName: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  onNavigate,
  onSelectDeployment,
  onTriggerAction,
}) => {
  // Sample active user bots in the platform
  const sampleBots = [
    {
      id: 'dep-wa-01',
      name: 'WhatsApp Customer Support Bot',
      type: 'whatsapp',
      runtime: 'Node.js 22 LTS',
      status: 'RUNNING',
      uptime: '14d 08h',
      cpu: '12%',
      memory: '340 MB / 512 MB',
      source: 'ZIP (baileys-v6.zip)',
      volume: '/app/session (auth_info_baileys)',
      lastActivity: 'Il y a 2 minutes',
    },
    {
      id: 'dep-tg-02',
      name: 'Telegram Crypto Signals & Alert',
      type: 'telegram',
      runtime: 'Python 3.12',
      status: 'RUNNING',
      uptime: '6d 19h',
      cpu: '8%',
      memory: '185 MB / 512 MB',
      source: 'GitHub (repo: user/tg-alerts)',
      volume: '/app/session (sqlite3)',
      lastActivity: 'Il y a 14 secondes',
    },
    {
      id: 'dep-dc-03',
      name: 'Discord Community Moderation Bot',
      type: 'custom',
      runtime: 'Node.js 20 LTS',
      status: 'STOPPED',
      uptime: '0h (Arrêté)',
      cpu: '0%',
      memory: '0 MB / 512 MB',
      source: 'ZIP (discord-mod.zip)',
      volume: '/app/session',
      lastActivity: 'Arrêté manuellement',
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* 1. Welcome & Primary CTA Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950/30 to-slate-900 border border-slate-800/90 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 uppercase tracking-wide mb-1">
              <span>Bonjour, lordmakima99</span>
              <span>•</span>
              <span className="text-emerald-400 font-semibold">Instance Host OK</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Gérez vos bots et applications hébergés 24h/24
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Vos conteneurs isolés s'exécutent en continu avec persistance garantie pour les sessions WhatsApp (Baileys) et secrets Telegram chiffrés.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => onNavigate('new-deployment')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-98 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all glow-accent"
            >
              <Rocket className="w-4 h-4" />
              <span>Nouveau Déploiement</span>
            </button>

            <button
              onClick={() => onNavigate('docs')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-slate-200 text-xs font-medium transition-all"
            >
              <span>Architecture</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          label="Déploiements Totaux"
          value="3 Projets"
          subValue="2 Node.js • 1 Python"
          trend="+1 ce mois"
          trendPositive={true}
          icon={Layers}
          iconColor="text-indigo-400"
        />

        <MetricCard 
          label="Bots Actifs 24h/24"
          value="2 Online"
          subValue="Supervisés par Bot Manager"
          trend="100% SLA"
          trendPositive={true}
          icon={Play}
          iconColor="text-emerald-400"
        />

        <MetricCard 
          label="Charge CPU Allouée"
          value="20 %"
          subValue="Cap global : 1.5 vCPU alloué"
          trend="Nominal"
          trendPositive={true}
          icon={Cpu}
          iconColor="text-sky-400"
        />

        <MetricCard 
          label="Mémoire RAM Réservée"
          value="525 MB"
          subValue="Plafond : 1.5 GB alloué"
          trend="Stable"
          trendPositive={true}
          icon={HardDrive}
          iconColor="text-amber-400"
        />
      </div>

      {/* 3. Active Deployments Cards / Table */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800/90 overflow-hidden shadow-sm">
        <div className="p-4 sm:p-5 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">Déploiements Récents</h3>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700/60">
                {sampleBots.length} bots configurés
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Statuts en direct, allocations de ressources et commandes d'action rapide.
            </p>
          </div>

          <button
            onClick={() => onNavigate('deployments')}
            className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1 self-start sm:self-auto transition-colors"
          >
            <span>Voir tous les déploiements</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Deployments List */}
        <div className="divide-y divide-slate-800/80">
          {sampleBots.map((bot) => (
            <div 
              key={bot.id} 
              className="p-4 sm:p-5 hover:bg-slate-800/30 transition-colors flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
            >
              {/* Left: Identity and Runtime */}
              <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                <div className={`p-2.5 rounded-xl border shrink-0 ${
                  bot.type === 'whatsapp'
                    ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-400'
                    : bot.type === 'telegram'
                    ? 'bg-sky-950/30 border-sky-800/40 text-sky-400'
                    : 'bg-indigo-950/30 border-indigo-800/40 text-indigo-400'
                }`}>
                  {bot.type === 'whatsapp' ? (
                    <Smartphone className="w-5 h-5" />
                  ) : bot.type === 'telegram' ? (
                    <Send className="w-5 h-5" />
                  ) : (
                    <Bot className="w-5 h-5" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-white text-sm tracking-tight truncate">
                      {bot.name}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/50">
                      {bot.runtime}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 flex-wrap font-mono">
                    <span className="text-[11px] text-slate-500">Source: {bot.source}</span>
                    <span>•</span>
                    <span className="text-[11px] text-slate-500">Volume: {bot.volume}</span>
                  </div>
                </div>
              </div>

              {/* Center: Live Resource metrics */}
              <div className="grid grid-cols-3 gap-3 sm:gap-6 text-left shrink-0 py-2 sm:py-0 border-y sm:border-y-0 border-slate-800/60">
                <div>
                  <div className="text-[10px] uppercase font-mono text-slate-400">Statut</div>
                  <div className="mt-0.5">
                    <StatusBadge status={bot.status} size="sm" />
                  </div>
                </div>

                <div>
                  <div className="text-[10px] uppercase font-mono text-slate-400">CPU & RAM</div>
                  <div className="text-xs font-mono text-slate-200 mt-0.5">
                    {bot.cpu} • {bot.memory.split('/')[0]}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] uppercase font-mono text-slate-400">Uptime</div>
                  <div className="text-xs font-mono text-slate-200 mt-0.5">
                    {bot.uptime}
                  </div>
                </div>
              </div>

              {/* Right: Quick Action buttons */}
              <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
                {bot.status === 'RUNNING' ? (
                  <>
                    <button
                      onClick={() => onTriggerAction('restart', bot.name)}
                      title="Redémarrer le bot"
                      className="p-2 rounded-lg bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white transition-colors"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onTriggerAction('stop', bot.name)}
                      title="Arrêter le bot"
                      className="p-2 rounded-lg bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 text-rose-400 hover:text-rose-300 transition-colors"
                    >
                      <Square className="w-3.5 h-3.5 fill-current" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => onTriggerAction('start', bot.name)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Démarrer</span>
                  </button>
                )}

                <button
                  onClick={() => onNavigate('logs')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-slate-200 text-xs font-medium transition-colors"
                >
                  <Terminal className="w-3 h-3 text-indigo-400" />
                  <span>Logs</span>
                </button>
              </div>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

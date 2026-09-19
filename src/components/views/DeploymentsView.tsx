import React, { useState } from 'react';
import { 
  Rocket, 
  Smartphone, 
  Send, 
  Bot, 
  Play, 
  Square, 
  RotateCw, 
  Terminal, 
  MoreVertical, 
  HardDrive, 
  Cpu, 
  Layers, 
  Search,
  CheckCircle2,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { StatusBadge } from '../ui/StatusBadge.tsx';

interface DeploymentsViewProps {
  onNavigate: (tab: any) => void;
  onTriggerAction: (action: string, botName: string) => void;
}

export const DeploymentsView: React.FC<DeploymentsViewProps> = ({
  onNavigate,
  onTriggerAction,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'RUNNING' | 'STOPPED' | 'WHATSAPP' | 'TELEGRAM'>('ALL');
  const [search, setSearch] = useState<string>('');

  const bots = [
    {
      id: 'dep-wa-01',
      name: 'WhatsApp Customer Support Bot',
      category: 'WHATSAPP',
      runtime: 'Node.js 22 LTS',
      status: 'RUNNING',
      uptime: '14d 08h',
      cpu: '12%',
      memory: '340 MB / 512 MB',
      source: 'ZIP (baileys-v6.zip)',
      volume: '/app/session (auth_info_baileys)',
      description: 'Bot de support WhatsApp automatisé avec reconnexion instantanée après reboot hôte.',
    },
    {
      id: 'dep-tg-02',
      name: 'Telegram Crypto Signals & Alert',
      category: 'TELEGRAM',
      runtime: 'Python 3.12',
      status: 'RUNNING',
      uptime: '6d 19h',
      cpu: '8%',
      memory: '185 MB / 512 MB',
      source: 'GitHub (repo: user/tg-alerts)',
      volume: '/app/session (sqlite3)',
      description: 'Bot Telegram de diffusion de signaux crypto et alertes de marché temps réel.',
    },
    {
      id: 'dep-dc-03',
      name: 'Discord Community Moderation Bot',
      category: 'CUSTOM',
      runtime: 'Node.js 20 LTS',
      status: 'STOPPED',
      uptime: 'Arrêté',
      cpu: '0%',
      memory: '0 MB / 512 MB',
      source: 'ZIP (discord-mod.zip)',
      volume: '/app/session',
      description: 'Bot de modération communautaire et filtrage automatique des liens frauduleux.',
    },
  ];

  const filteredBots = bots.filter((b) => {
    const matchesSearch = b.name.toLowerCase().includes(search.toLowerCase()) || b.runtime.toLowerCase().includes(search.toLowerCase());
    if (filter === 'ALL') return matchesSearch;
    if (filter === 'RUNNING') return matchesSearch && b.status === 'RUNNING';
    if (filter === 'STOPPED') return matchesSearch && b.status === 'STOPPED';
    if (filter === 'WHATSAPP') return matchesSearch && b.category === 'WHATSAPP';
    if (filter === 'TELEGRAM') return matchesSearch && b.category === 'TELEGRAM';
    return matchesSearch;
  });

  return (
    <div className="space-y-5">
      
      {/* Search & Filter bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
        
        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(['ALL', 'RUNNING', 'STOPPED', 'WHATSAPP', 'TELEGRAM'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                filter === cat
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {cat === 'ALL' ? 'Tous les bots' : cat === 'RUNNING' ? 'En ligne (24/7)' : cat === 'STOPPED' ? 'Arrêtés' : cat}
            </button>
          ))}
        </div>

        {/* Search and New CTA */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un bot..."
              className="pl-8 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-48"
            />
          </div>

          <button
            onClick={() => onNavigate('new-deployment')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shrink-0 transition-colors"
          >
            <Rocket className="w-3.5 h-3.5" />
            <span>Nouveau Bot</span>
          </button>
        </div>

      </div>

      {/* Deployments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBots.map((bot) => (
          <div
            key={bot.id}
            className="rounded-xl bg-slate-900/70 border border-slate-800/90 p-5 hover:border-slate-700 hover:bg-slate-900/90 transition-all shadow-sm flex flex-col justify-between"
          >
            <div>
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2.5 rounded-xl border shrink-0 ${
                    bot.category === 'WHATSAPP'
                      ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-400'
                      : bot.category === 'TELEGRAM'
                      ? 'bg-sky-950/30 border-sky-800/40 text-sky-400'
                      : 'bg-indigo-950/30 border-indigo-800/40 text-indigo-400'
                  }`}>
                    {bot.category === 'WHATSAPP' ? (
                      <Smartphone className="w-4 h-4" />
                    ) : bot.category === 'TELEGRAM' ? (
                      <Send className="w-4 h-4" />
                    ) : (
                      <Bot className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-tight leading-tight">
                      {bot.name}
                    </h3>
                    <span className="text-[11px] font-mono text-slate-400">{bot.runtime}</span>
                  </div>
                </div>

                <StatusBadge status={bot.status} size="sm" />
              </div>

              <p className="text-xs text-slate-400 mt-3 line-clamp-2 leading-relaxed">
                {bot.description}
              </p>

              {/* Metrics block */}
              <div className="mt-4 p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 grid grid-cols-3 gap-2 text-left">
                <div>
                  <div className="text-[10px] uppercase font-mono text-slate-500">CPU</div>
                  <div className="text-xs font-mono text-slate-200 mt-0.5">{bot.cpu}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-mono text-slate-500">RAM</div>
                  <div className="text-xs font-mono text-slate-200 mt-0.5">{bot.memory.split('/')[0]}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-mono text-slate-500">Uptime</div>
                  <div className="text-xs font-mono text-slate-200 mt-0.5">{bot.uptime}</div>
                </div>
              </div>

              {/* Volume tag */}
              <div className="mt-3 flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
                <HardDrive className="w-3 h-3 text-indigo-400 shrink-0" />
                <span className="truncate">{bot.volume}</span>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                {bot.status === 'RUNNING' ? (
                  <>
                    <button
                      onClick={() => onTriggerAction('restart', bot.name)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      title="Redémarrer"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onTriggerAction('stop', bot.name)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-400 hover:text-rose-300 transition-colors"
                      title="Arrêter"
                    >
                      <Square className="w-3.5 h-3.5 fill-current" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => onTriggerAction('start', bot.name)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Démarrer</span>
                  </button>
                )}
              </div>

              <button
                onClick={() => onNavigate('logs')}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 transition-colors"
              >
                <Terminal className="w-3 h-3 text-indigo-400" />
                <span>Logs Live</span>
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

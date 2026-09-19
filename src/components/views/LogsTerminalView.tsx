import React, { useState, useEffect, useRef } from 'react';
import { 
  Terminal, 
  Trash2, 
  Search, 
  Copy, 
  Check, 
  RotateCw,
  ShieldCheck,
  ChevronDown,
  Smartphone,
  Send,
  Bot
} from 'lucide-react';
import { useToast } from '../ui/Toast.tsx';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'SYSTEM';
  message: string;
  source: 'stdout' | 'stderr' | 'system';
}

interface LogsTerminalViewProps {
  initialBotName?: string;
}

export const LogsTerminalView: React.FC<LogsTerminalViewProps> = ({
  initialBotName = 'WhatsApp Customer Support Bot',
}) => {
  const { showToast } = useToast();
  const [activeBot, setActiveBot] = useState<string>(initialBotName);
  const [filterQuery, setFilterQuery] = useState<string>('');
  const [levelFilter, setLevelFilter] = useState<string>('ALL');
  const [copied, setCopied] = useState<boolean>(false);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialBotName) {
      setActiveBot(initialBotName);
    }
  }, [initialBotName]);

  const BOT_LOG_SAMPLES: Record<string, LogEntry[]> = {
    'WhatsApp Customer Support Bot': [
      { id: '1', timestamp: '09:14:02.102', level: 'SYSTEM', message: 'Conteneur botcloud-wa-support démarré avec isolation Cgroups (0.5 vCPU, 512MB RAM)', source: 'system' },
      { id: '2', timestamp: '09:14:02.341', level: 'SYSTEM', message: 'Volume persistant /data/volumes/wa-support monté sur /app/session [Lecture/Écriture]', source: 'system' },
      { id: '3', timestamp: '09:14:03.110', level: 'INFO', message: 'Lancement du script: node index.js (Baileys Pairing Code)', source: 'stdout' },
      { id: '4', timestamp: '09:14:04.550', level: 'INFO', message: '[Baileys] Configuration utilisateur chargée sans altération du code source.', source: 'stdout' },
      { id: '5', timestamp: '09:14:05.120', level: 'INFO', message: '[Baileys] Demande de connexion Pairing Code envoyée pour le numéro lié.', source: 'stdout' },
      { id: '6', timestamp: '09:14:06.890', level: 'INFO', message: '🔑 [PAIRING CODE] : 7K4P-9X2M  (WhatsApp > Appareils connectés > Associer avec numéro)', source: 'stdout' },
      { id: '7', timestamp: '09:14:14.200', level: 'INFO', message: '✅ [WhatsApp] Appareil associé avec succès ! Clés de session enregistrées dans /app/session.', source: 'stdout' },
      { id: '8', timestamp: '09:14:15.004', level: 'INFO', message: '🚀 Prêt à traiter et envoyer des messages en continu 24h/24.', source: 'stdout' },
    ],
    'Telegram Crypto Signals & Alert': [
      { id: '1', timestamp: '08:30:00.012', level: 'SYSTEM', message: 'Conteneur botcloud-tg-crypto initialisé (Python 3.12, 512MB RAM)', source: 'system' },
      { id: '2', timestamp: '08:30:01.400', level: 'SYSTEM', message: 'Base de données SQLite persistante rattachée sur /app/session/alerts.db', source: 'system' },
      { id: '3', timestamp: '08:30:02.100', level: 'INFO', message: 'python main.py: Initialisation de la boucle de polling python-telegram-bot v20...', source: 'stdout' },
      { id: '4', timestamp: '08:30:03.250', level: 'INFO', message: 'Token de bot Telegram validé via API getMe: @CryptoWatcherSignalsBot (ID: 7482910382)', source: 'stdout' },
      { id: '5', timestamp: '08:31:10.890', level: 'INFO', message: 'Veille marché active : WebSocket Binance connecté (flux BTC/USDT, ETH/USDT)', source: 'stdout' },
      { id: '6', timestamp: '08:45:00.005', level: 'INFO', message: 'Signal déclenché : RSI survente détecté sur ETH/USDT. Diffusion à 1,420 abonnés effectuée.', source: 'stdout' },
    ],
    'Discord Community Moderation Bot': [
      { id: '1', timestamp: 'Hier 18:28:10', level: 'SYSTEM', message: 'Arrêt ordonné demandé par l\'utilisateur lordmakima99', source: 'system' },
      { id: '2', timestamp: 'Hier 18:28:11', level: 'INFO', message: 'Déconnexion de l\'API Gateway Discord...', source: 'stdout' },
      { id: '3', timestamp: 'Hier 18:28:12', level: 'SYSTEM', message: 'Conteneur arrêté avec code de sortie 0. Session préservée.', source: 'system' },
    ]
  };

  const currentLogs = BOT_LOG_SAMPLES[activeBot] || BOT_LOG_SAMPLES['WhatsApp Customer Support Bot'];

  const filteredLogs = currentLogs.filter((log) => {
    const matchesSearch = log.message.toLowerCase().includes(filterQuery.toLowerCase());
    const matchesLevel = levelFilter === 'ALL' || log.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  const handleCopy = () => {
    const text = filteredLogs.map(l => `[${l.timestamp}] [${l.level}] ${l.message}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('success', 'Logs copiés', 'Historique copié dans le presse-papier');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      
      {/* Sélecteur de Bot + Filtres dans une barre unique bien rangée */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
        
        {/* Sélecteur de bot direct */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-950/50 text-indigo-400 border border-indigo-800/40 shrink-0">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Afficher les logs en direct du bot :</div>
            <select
              value={activeBot}
              onChange={(e) => setActiveBot(e.target.value)}
              className="mt-0.5 bg-slate-950 border border-slate-700 text-sm font-bold text-white rounded-lg px-2.5 py-1 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="WhatsApp Customer Support Bot">📱 WhatsApp Customer Support Bot (En ligne)</option>
              <option value="Telegram Crypto Signals & Alert">✈️ Telegram Crypto Signals & Alert (En ligne)</option>
              <option value="Discord Community Moderation Bot">🤖 Discord Community Moderation Bot (Arrêté)</option>
            </select>
          </div>
        </div>

        {/* Barre de recherche et filtres de logs */}
        <div className="flex items-center gap-2 flex-wrap self-end md:self-center">
          
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs font-mono text-slate-300 focus:outline-none"
          >
            <option value="ALL">Tous les niveaux</option>
            <option value="INFO">INFO seulement</option>
            <option value="WARN">WARN seulement</option>
            <option value="SYSTEM">SYSTEM seulement</option>
          </select>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Chercher dans les logs..."
              className="pl-8 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-44"
            />
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-300 hover:text-white transition-colors"
            title="Copier les logs affichés"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copié !' : 'Copier'}</span>
          </button>
        </div>

      </div>

      {/* Terminal Display Container */}
      <div className="rounded-2xl border border-slate-800 bg-[#060911] overflow-hidden shadow-xl">
        
        {/* Barre de titre de console */}
        <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
            <span className="ml-2 text-slate-300 font-medium">terminal:~$ {activeBot}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Tokens secrets masqués automatiquement</span>
            </span>
            <span>{filteredLogs.length} lignes</span>
          </div>
        </div>

        {/* Sortie du terminal */}
        <div className="p-4 font-mono text-xs leading-relaxed space-y-1.5 max-h-[500px] overflow-y-auto select-text">
          {filteredLogs.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              Aucune ligne ne correspond à votre recherche.
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-2.5 hover:bg-slate-900/40 px-1 py-0.5 rounded transition-colors">
                <span className="text-slate-500 shrink-0 select-none">{log.timestamp}</span>
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold shrink-0 ${
                  log.level === 'SYSTEM'
                    ? 'bg-indigo-950 text-indigo-300 border border-indigo-800/50'
                    : log.level === 'INFO'
                    ? 'bg-slate-800 text-sky-300'
                    : log.level === 'WARN'
                    ? 'bg-amber-950 text-amber-300 border border-amber-800/50'
                    : 'bg-rose-950 text-rose-300 border border-rose-800/50'
                }`}>
                  {log.level}
                </span>
                <span className="text-slate-200 break-all">{log.message}</span>
              </div>
            ))
          )}
          <div ref={terminalEndRef} />
        </div>

      </div>

    </div>
  );
};

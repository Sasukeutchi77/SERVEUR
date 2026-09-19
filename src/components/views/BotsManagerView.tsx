import React, { useState } from 'react';
import { 
  Rocket, 
  Play, 
  Square, 
  RotateCw, 
  Terminal, 
  Smartphone, 
  Send, 
  Bot, 
  Search, 
  HardDrive, 
  Cpu, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Trash2, 
  Upload, 
  AlertTriangle, 
  X, 
  FolderArchive, 
  RefreshCw,
  Loader2,
  Check,
  ShieldCheck
} from 'lucide-react';
import { StatusBadge } from '../ui/StatusBadge.tsx';
import { useToast } from '../ui/Toast.tsx';

export interface BotItem {
  id: string;
  name: string;
  category: 'WHATSAPP' | 'TELEGRAM' | 'CUSTOM';
  runtime: string;
  status: 'RUNNING' | 'STOPPED';
  uptime: string;
  cpu: string;
  memory: string;
  source: string;
  volume: string;
  description: string;
  lastEvent: string;
}

interface BotsManagerViewProps {
  bots: BotItem[];
  onUpdateBots: (bots: BotItem[]) => void;
  onNavigate: (tab: any) => void;
  onSelectBotForLogs: (botName: string) => void;
  onTriggerAction: (action: string, botName: string) => void;
}

export const BotsManagerView: React.FC<BotsManagerViewProps> = ({
  bots,
  onUpdateBots,
  onNavigate,
  onSelectBotForLogs,
  onTriggerAction,
}) => {
  const { showToast } = useToast();
  const [filter, setFilter] = useState<'ALL' | 'RUNNING' | 'STOPPED' | 'WHATSAPP' | 'TELEGRAM'>('ALL');
  const [search, setSearch] = useState<string>('');

  // Modale de suppression de serveur
  const [botToDelete, setBotToDelete] = useState<BotItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Modale de remplacement de fichier ZIP
  const [botToReplaceZip, setBotToReplaceZip] = useState<BotItem | null>(null);
  const [newZipName, setNewZipName] = useState<string>('');
  const [keepSession, setKeepSession] = useState<boolean>(true);
  const [isReplacingZip, setIsReplacingZip] = useState<boolean>(false);

  const runningCount = bots.filter((b) => b.status === 'RUNNING').length;
  const stoppedCount = bots.filter((b) => b.status === 'STOPPED').length;

  const handleAction = (action: 'start' | 'stop' | 'restart', bot: BotItem) => {
    onTriggerAction(action, bot.name);
    onUpdateBots(
      bots.map((b) => {
        if (b.id !== bot.id) return b;
        if (action === 'start') {
          return { ...b, status: 'RUNNING', uptime: 'À l\'instant', cpu: '5%', memory: '120 MB / 512 MB', lastEvent: 'Démarré à l\'instant' };
        }
        if (action === 'stop') {
          return { ...b, status: 'STOPPED', uptime: 'Arrêté', cpu: '0%', memory: '0 MB / 512 MB', lastEvent: 'Arrêté manuellement' };
        }
        return { ...b, uptime: 'À l\'instant', lastEvent: 'Redémarré avec succès' };
      })
    );
  };

  // Confirmation de suppression d'un serveur
  const confirmDeleteServer = () => {
    if (!botToDelete) return;
    setIsDeleting(true);

    setTimeout(() => {
      const deletedName = botToDelete.name;
      const updated = bots.filter((b) => b.id !== botToDelete.id);
      onUpdateBots(updated);
      setIsDeleting(false);
      setBotToDelete(null);
      showToast(
        'success', 
        'Serveur supprimé', 
        `Le bot « ${deletedName} » a été supprimé. Les ressources (0.5 vCPU, 512MB RAM) sont libérées.`
      );
    }, 600);
  };

  // Confirmation de remplacement de fichier ZIP
  const confirmReplaceZip = () => {
    if (!botToReplaceZip) return;
    const finalZipName = newZipName.trim() || 'nouveau-code-bot.zip';
    setIsReplacingZip(true);

    setTimeout(() => {
      const updated = bots.map((b) => {
        if (b.id !== botToReplaceZip.id) return b;
        return {
          ...b,
          source: `Archive ZIP (${finalZipName})`,
          status: 'RUNNING' as const,
          uptime: 'À l\'instant',
          cpu: '7%',
          memory: '140 MB / 512 MB',
          lastEvent: `ZIP remplacé par ${finalZipName} et relancé`,
        };
      });

      onUpdateBots(updated);
      setIsReplacingZip(false);
      setBotToReplaceZip(null);
      setNewZipName('');
      showToast(
        'success', 
        'Fichier ZIP mis à jour !', 
        `Le code a été remplacé par ${finalZipName}. Le serveur a été relancé en ligne 24h/24.`
      );
    }, 1200);
  };

  const filteredBots = bots.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.description.toLowerCase().includes(search.toLowerCase()) ||
      b.source.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (filter === 'RUNNING') return b.status === 'RUNNING';
    if (filter === 'STOPPED') return b.status === 'STOPPED';
    if (filter === 'WHATSAPP') return b.category === 'WHATSAPP';
    if (filter === 'TELEGRAM') return b.category === 'TELEGRAM';
    return true;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* 1. Résumé en un coup d'œil */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* Total bots hébergés */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono uppercase text-slate-400">Total Serveurs</span>
            <div className="text-2xl font-bold font-mono text-white mt-0.5">{bots.length}</div>
            <div className="text-[11px] text-slate-400 mt-1">Serveurs alloués</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-950/60 border border-indigo-800/40 text-indigo-400 flex items-center justify-center">
            <Bot className="w-5 h-5" />
          </div>
        </div>

        {/* Bots en ligne */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono uppercase text-slate-400">En Ligne 24h/24</span>
            <div className="text-2xl font-bold font-mono text-emerald-400 mt-0.5 flex items-center gap-2">
              <span>{runningCount}</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="text-[11px] text-emerald-400/80 mt-1">Supervisés en continu</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 flex items-center justify-center">
            <Rocket className="w-5 h-5" />
          </div>
        </div>

        {/* Bots à l'arrêt */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono uppercase text-slate-400">Arrêtés</span>
            <div className="text-2xl font-bold font-mono text-slate-300 mt-0.5">{stoppedCount}</div>
            <div className="text-[11px] text-slate-400 mt-1">Sessions conservées</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-800/60 border border-slate-700/40 text-slate-400 flex items-center justify-center">
            <Square className="w-4 h-4" />
          </div>
        </div>

        {/* Bouton d'action proéminent Déployer */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/70 to-slate-900 border border-indigo-500/40 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-300">Ajouter un serveur</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
              Instantané
            </span>
          </div>
          <button
            onClick={() => onNavigate('new-deployment')}
            className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-98 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Déployer un Bot</span>
          </button>
        </div>

      </div>

      {/* 2. Barre d'outils (Filtres & Recherche) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
        
        {/* Filtres par bouton rapide */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
              filter === 'ALL'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Tous ({bots.length})
          </button>

          <button
            onClick={() => setFilter('RUNNING')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
              filter === 'RUNNING'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            En ligne ({runningCount})
          </button>

          <button
            onClick={() => setFilter('STOPPED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
              filter === 'STOPPED'
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Arrêtés ({stoppedCount})
          </button>

          <span className="w-px h-4 bg-slate-700 mx-1 hidden sm:block" />

          <button
            onClick={() => setFilter('WHATSAPP')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
              filter === 'WHATSAPP'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            WhatsApp
          </button>

          <button
            onClick={() => setFilter('TELEGRAM')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
              filter === 'TELEGRAM'
                ? 'bg-sky-950 text-sky-300 border border-sky-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Telegram
          </button>
        </div>

        {/* Barre de recherche */}
        <div className="relative w-full sm:w-60">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom ou code..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

      </div>

      {/* 3. Liste des Serveurs de Bots */}
      <div className="space-y-3.5">
        {filteredBots.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
            <Bot className="w-10 h-10 text-slate-600 mx-auto" />
            <div className="text-sm font-semibold text-white">
              {bots.length === 0 ? 'Vous n\'avez aucun serveur de bot pour le moment' : 'Aucun serveur ne correspond à votre recherche'}
            </div>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {bots.length === 0 
                ? 'Cliquez sur « + Déployer un Bot » pour héberger votre premier script en 2 clics.'
                : 'Essayez de réinitialiser vos filtres ou effectuez une nouvelle recherche.'}
            </p>
            {bots.length === 0 ? (
              <button
                onClick={() => onNavigate('new-deployment')}
                className="mt-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30"
              >
                + Déployer un Bot maintenant
              </button>
            ) : (
              <button
                onClick={() => { setFilter('ALL'); setSearch(''); }}
                className="mt-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200"
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>
        ) : (
          filteredBots.map((bot) => (
            <div
              key={bot.id}
              className={`rounded-2xl border transition-all p-5 ${
                bot.status === 'RUNNING'
                  ? 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                  : 'bg-slate-900/40 border-slate-800/60 opacity-85'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                
                {/* 1. Identification & Type */}
                <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                  
                  {/* Icône de type avec couleur dédiée */}
                  <div className={`p-3 rounded-xl border shrink-0 ${
                    bot.category === 'WHATSAPP'
                      ? 'bg-emerald-950/40 border-emerald-800/50 text-emerald-400'
                      : bot.category === 'TELEGRAM'
                      ? 'bg-sky-950/40 border-sky-800/50 text-sky-400'
                      : 'bg-indigo-950/40 border-indigo-800/50 text-indigo-400'
                  }`}>
                    {bot.category === 'WHATSAPP' ? (
                      <Smartphone className="w-5 h-5" />
                    ) : bot.category === 'TELEGRAM' ? (
                      <Send className="w-5 h-5" />
                    ) : (
                      <Bot className="w-5 h-5" />
                    )}
                  </div>

                  {/* Nom, badge et description */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-white tracking-tight truncate">
                        {bot.name}
                      </h3>
                      
                      {/* Badge runtime */}
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {bot.runtime}
                      </span>

                      {/* Statut clair */}
                      <StatusBadge status={bot.status} size="sm" />
                    </div>

                    <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                      {bot.description}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono mt-1.5 flex-wrap">
                      <span className="text-slate-300 font-medium bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        {bot.source}
                      </span>
                      <span>•</span>
                      <span className="text-indigo-400 flex items-center gap-1">
                        <HardDrive className="w-3 h-3" />
                        <span>Session persistante ({bot.volume})</span>
                      </span>
                    </div>
                  </div>

                </div>

                {/* 2. Métriques claires (Colonnes lisibles) */}
                <div className="grid grid-cols-3 gap-4 sm:gap-6 shrink-0 py-2 lg:py-0 border-y lg:border-y-0 border-slate-800/80">
                  <div>
                    <div className="text-[10px] uppercase font-mono text-slate-400">Temps actif</div>
                    <div className="text-xs font-bold text-white font-mono mt-0.5">
                      {bot.uptime}
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] uppercase font-mono text-slate-400">Charge CPU</div>
                    <div className="text-xs font-bold text-white font-mono mt-0.5">
                      {bot.cpu}
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] uppercase font-mono text-slate-400">RAM allouée</div>
                    <div className="text-xs font-bold text-white font-mono mt-0.5">
                      {bot.memory.split('/')[0].trim()}
                    </div>
                  </div>
                </div>

                {/* 3. Boutons d'Action Clairs (Démarrer/Arrêter, Changer ZIP, Logs, Supprimer) */}
                <div className="flex items-center gap-2 shrink-0 self-end lg:self-center flex-wrap">
                  
                  {/* Action Démarrer / Arrêter / Redémarrer */}
                  {bot.status === 'RUNNING' ? (
                    <>
                      <button
                        onClick={() => handleAction('restart', bot)}
                        title="Redémarrer le conteneur en conservant la session"
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 transition-colors"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                        <span>Redémarrer</span>
                      </button>

                      <button
                        onClick={() => handleAction('stop', bot)}
                        title="Arrêter temporairement le conteneur"
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-950/40 hover:bg-amber-900/60 border border-amber-800/60 text-xs font-medium text-amber-300 transition-colors"
                      >
                        <Square className="w-3 h-3 fill-current" />
                        <span>Arrêter</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleAction('start', bot)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition-all"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Démarrer 24h/24</span>
                    </button>
                  )}

                  {/* Bouton Remplacer le fichier ZIP */}
                  <button
                    onClick={() => {
                      setBotToReplaceZip(bot);
                      setNewZipName('');
                      setKeepSession(true);
                    }}
                    title="Remplacer le fichier ZIP du bot par une autre version"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 hover:text-white transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5 text-sky-400" />
                    <span>Changer de ZIP</span>
                  </button>

                  {/* Bouton Voir les Logs */}
                  <button
                    onClick={() => {
                      onSelectBotForLogs(bot.name);
                      onNavigate('logs');
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600/15 hover:bg-indigo-600/25 border border-indigo-500/30 text-xs font-semibold text-indigo-300 transition-colors"
                    title="Voir les logs de sortie"
                  >
                    <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Logs</span>
                  </button>

                  {/* Bouton Supprimer le serveur */}
                  <button
                    onClick={() => setBotToDelete(bot)}
                    className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 border border-transparent hover:border-rose-900/50 transition-colors"
                    title="Supprimer définitivement ce serveur"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                </div>

              </div>
            </div>
          ))
        )}
      </div>

      {/* ========================================================== */}
      {/* MODALE 1 : SUPPRESSION DÉFINITIVE DE SERVEUR               */}
      {/* ========================================================== */}
      {botToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-2xl">
            
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-400">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">Supprimer le serveur ?</h3>
                  <p className="text-xs text-slate-400">Cette action est irréversible.</p>
                </div>
              </div>
              <button
                onClick={() => setBotToDelete(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2 text-xs">
              <div className="text-slate-300">
                Vous êtes sur le point de supprimer : <span className="font-bold text-white">{botToDelete.name}</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Le conteneur Docker étanche sera détruit et les ressources allouées (<span className="text-indigo-300 font-mono">0.5 vCPU</span>, <span className="text-indigo-300 font-mono">512 MB RAM</span>) seront immédiatement libérées pour vous permettre de créer un autre serveur.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setBotToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
              >
                Annuler
              </button>

              <button
                type="button"
                onClick={confirmDeleteServer}
                disabled={isDeleting}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/30 transition-all disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Suppression...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Supprimer définitivement</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* MODALE 2 : MODIFIER / REMPLACER LE FICHIER ZIP DU BOT      */}
      {/* ========================================================== */}
      {botToReplaceZip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-5 shadow-2xl">
            
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-sky-950/60 border border-sky-800 text-sky-400">
                  <FolderArchive className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    Modifier le fichier ZIP du serveur
                  </h3>
                  <p className="text-xs text-slate-400">
                    Remplacez le code actuel par une nouvelle archive ZIP sans recréer le serveur
                  </p>
                </div>
              </div>
              <button
                onClick={() => setBotToReplaceZip(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Information sur le fichier actuel */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-mono">Fichier ZIP actuel (Bot A) :</span>
                <span className="font-mono text-slate-200 font-bold">{botToReplaceZip.source}</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                Sera remplacé
              </span>
            </div>

            {/* Zone de téléversement du nouveau ZIP (Bot B) */}
            <div className="border-2 border-dashed border-slate-700 hover:border-sky-500 rounded-2xl p-6 text-center bg-slate-950/40 transition-colors">
              <Upload className="w-8 h-8 text-sky-400 mx-auto mb-2" />
              <div className="text-xs font-bold text-white">
                Sélectionnez le nouveau fichier ZIP (Bot B)
              </div>
              <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
                L'ancien ZIP sera écrasé et le conteneur installera les nouveaux paquets automatiquement.
              </p>

              <input
                type="file"
                accept=".zip"
                id="replace-zip-picker"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setNewZipName(e.target.files[0].name);
                  }
                }}
              />
              
              <label
                htmlFor="replace-zip-picker"
                className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium cursor-pointer border border-slate-700 transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Choisir le nouveau .ZIP sur mon ordinateur</span>
              </label>

              {newZipName && (
                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-xs font-mono">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Nouveau ZIP prêt : {newZipName}</span>
                </div>
              )}
            </div>

            {/* Option de conservation du volume de session */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={keepSession}
                  onChange={(e) => setKeepSession(e.target.checked)}
                  className="mt-0.5 rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
                <div className="text-xs">
                  <div className="font-semibold text-slate-200">
                    Conserver la session persistante (/app/session)
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {botToReplaceZip.category === 'WHATSAPP' 
                      ? 'Recommandé si vous souhaitez garder le Pairing Code WhatsApp déjà lié et authentifié.' 
                      : 'Conserve la base de données et les identifiants déjà stockés.'}
                  </p>
                </div>
              </label>
            </div>

            {/* Actions de confirmation */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setBotToReplaceZip(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
              >
                Annuler
              </button>

              <button
                type="button"
                onClick={confirmReplaceZip}
                disabled={isReplacingZip}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md shadow-sky-600/30 transition-all disabled:opacity-50"
              >
                {isReplacingZip ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Remplacement et relance du serveur...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Remplacer le ZIP et relancer 24/7</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

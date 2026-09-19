import React, { useState } from 'react';
import { 
  Plus, 
  Server as ServerIcon, 
  Terminal, 
  Trash2, 
  ChevronRight, 
  HardDrive, 
  Cpu, 
  Search, 
  X,
  Bot,
  Radio,
  Layers,
  CreditCard,
  RotateCw,
  Clock,
  AlertTriangle,
  Folder,
  Zap,
  Activity
} from 'lucide-react';
import type { ServerItem } from './ServerDetailView.tsx';
import { formatPrice } from '../../data/serverPlans.ts';

interface ServersVerticalListViewProps {
  servers: ServerItem[];
  onSelectServer: (server: ServerItem) => void;
  onCreateServer: (name: string, runtime: string) => void;
  onDeleteServer: (serverId: string) => void;
  onOpenPurchaseModal?: () => void;
  onOpenRenewModal?: (server: ServerItem) => void;
}

export const ServersVerticalListView: React.FC<ServersVerticalListViewProps> = ({
  servers,
  onSelectServer,
  onCreateServer,
  onDeleteServer,
  onOpenPurchaseModal,
  onOpenRenewModal,
}) => {
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'expired'>('all');

  const filteredServers = servers.filter((s) => {
    const matchesSearch = 
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.nodeIp.includes(search) ||
      (s.sourceFile && s.sourceFile.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;

    if (statusFilter === 'online') {
      return s.status === 'ONLINE';
    }
    if (statusFilter === 'expired') {
      return s.isExpired || (s.daysRemaining !== undefined && s.daysRemaining <= 0);
    }
    return true;
  });

  const onlineCount = servers.filter((s) => s.status === 'ONLINE').length;
  const expiredCount = servers.filter((s) => s.isExpired || (s.daysRemaining !== undefined && s.daysRemaining <= 0)).length;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* 1. En-tête de section aéré et moderne */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800/80">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Mes Serveurs Déployés
            </h2>
            <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
              ORAX-HOSTING
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
            Gérez vos conteneurs actifs 24h/24, accédez à la console en direct et surveillez vos abonnements.
          </p>
        </div>

        <button
          onClick={() => {
            if (onOpenPurchaseModal) {
              onOpenPurchaseModal();
            }
          }}
          className="flex items-center justify-center gap-2.5 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs sm:text-sm font-bold font-mono shadow-lg shadow-indigo-600/25 transition-all self-start md:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Commander un Serveur (1 Mois)</span>
        </button>
      </div>

      {/* 2. Barre d'indicateurs clés & Recherche aérée */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
              <ServerIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-mono uppercase text-slate-400">Total Serveurs</div>
              <div className="text-lg font-bold text-white font-mono">{servers.length} alloués</div>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-mono uppercase text-slate-400">En Ligne 24/7</div>
              <div className="text-lg font-bold text-emerald-400 font-mono flex items-center gap-2">
                <span>{onlineCount} actifs</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-mono uppercase text-slate-400">Statut Expirations</div>
              <div className="text-lg font-bold text-white font-mono">
                {expiredCount > 0 ? (
                  <span className="text-rose-400">{expiredCount} à renouveler</span>
                ) : (
                  <span className="text-slate-300">Tous à jour</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Filtres & Champ de recherche */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-2.5 rounded-2xl bg-slate-900/50 border border-slate-800/80">
        {/* Filtres par bouton */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950/70 rounded-xl border border-slate-800/60">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Tous ({servers.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('online')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
              statusFilter === 'online'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            En Ligne ({onlineCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('expired')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
              statusFilter === 'expired'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Expirés ({expiredCount})
          </button>
        </div>

        {/* Barre de recherche spacieuse */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom, IP, bot..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono transition-colors"
          />
        </div>
      </div>

      {/* 4. DISPOSITION AÉRÉE & STYLÉE DES SERVEURS */}
      <div className="space-y-4">
        {filteredServers.length === 0 ? (
          <div className="p-16 text-center rounded-3xl bg-slate-900/30 border border-slate-800/80 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-slate-400 flex items-center justify-center mx-auto">
              <ServerIcon className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <div className="text-base font-semibold text-white">Aucun serveur ne correspond</div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Modifiez vos critères de recherche ou déployez un nouveau serveur pour vos bots.
              </p>
            </div>
            <button
              onClick={() => {
                if (onOpenPurchaseModal) {
                  onOpenPurchaseModal();
                }
              }}
              className="mt-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold font-mono shadow-md cursor-pointer transition-all"
            >
              + Commander un Serveur (1 Mois)
            </button>
          </div>
        ) : (
          filteredServers.map((server) => {
            const daysLeft = server.daysRemaining !== undefined ? server.daysRemaining : 28;
            const isExp = server.isExpired || daysLeft === 0;
            const isCrit = daysLeft <= 5 && !isExp;

            return (
              <div
                key={server.id}
                onClick={() => onSelectServer(server)}
                className="group relative rounded-3xl border border-slate-800/90 hover:border-indigo-500/60 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950 p-5 sm:p-6 transition-all duration-200 cursor-pointer shadow-md hover:shadow-indigo-500/10 hover:-translate-y-0.5"
              >
                {/* Ligne 1 : Identité du serveur + Statut d'abonnement / Expiration */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/60">
                  
                  {/* Gauche : Icône + Nom + Node IP */}
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600/25 to-indigo-950/60 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:border-indigo-400/60 transition-transform shadow-inner">
                      <ServerIcon className="w-6 h-6" />
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-base sm:text-lg font-bold text-white tracking-tight group-hover:text-indigo-300 transition-colors truncate">
                          {server.name}
                        </h3>

                        {/* Statut Online / Offline propre */}
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold ${
                          server.status === 'ONLINE'
                            ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-800/80'
                            : 'bg-rose-950/70 text-rose-400 border border-rose-800/80'
                        }`}>
                          <span className={`w-2 h-2 rounded-full ${server.status === 'ONLINE' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
                          <span>{server.status}</span>
                        </span>
                      </div>

                      {/* Adresse IP du Node & Fichier source */}
                      <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                        <span className="text-slate-300 font-semibold">{server.nodeIp}</span>
                        <span className="text-slate-600">•</span>
                        <span className="text-indigo-300 truncate max-w-[200px]">{server.sourceFile || 'Aucun code téléversé'}</span>
                        <span className="text-slate-600">•</span>
                        <span>{server.files.length} fichier(s)</span>
                      </div>
                    </div>
                  </div>

                  {/* Droite : Badge Abonnement + Badge Expiration (Spacieux & Lisible) */}
                  <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
                    {/* Badge Formule */}
                    <span className="px-3 py-1 rounded-xl bg-indigo-950/80 text-indigo-300 border border-indigo-800/80 text-xs font-mono font-semibold flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{formatPrice(server.monthlyPriceCfa || (server.monthlyPriceUsd && server.monthlyPriceUsd > 100 ? server.monthlyPriceUsd : 1650))}/m</span>
                    </span>

                    {/* Badge d'expiration claire */}
                    {isExp ? (
                      <span className="px-3 py-1 rounded-xl bg-rose-950/80 text-rose-400 border border-rose-800 text-xs font-mono font-bold flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Abonnement Expiré</span>
                      </span>
                    ) : isCrit ? (
                      <span className="px-3 py-1 rounded-xl bg-amber-950/80 text-amber-300 border border-amber-800 text-xs font-mono font-bold flex items-center gap-1.5 animate-pulse">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span>Reste {daysLeft}j</span>
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-xl bg-slate-950 text-emerald-400 border border-slate-800 text-xs font-mono font-semibold flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Expire dans {daysLeft} jours</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Ligne 2 : Specs matérielles aérées + Actions de contrôle */}
                <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  
                  {/* Spécifications hardware bien espacées */}
                  <div className="flex items-center gap-4 sm:gap-6 text-xs font-mono text-slate-400 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-slate-800/90 text-slate-300 text-[11px] border border-slate-700/60 font-semibold">
                        {server.runtime}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                      <span>CPU :</span>
                      <strong className="text-white">{server.cpuCores || 1.0} vCPU</strong>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span>RAM :</span>
                      <strong className="text-emerald-400">
                        {server.status === 'ONLINE' ? `${server.memoryMb} MB` : '0 MB'} / {server.memoryMaxMb / 1024} GB
                      </strong>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Disque :</span>
                      <strong className="text-slate-200">{(server.diskMb / 1024).toFixed(1)} / {(server.diskMaxMb / 1024).toFixed(0)} GB</strong>
                    </div>
                  </div>

                  {/* Actions élégantes à droite */}
                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    {/* Bouton Renouveler */}
                    {onOpenRenewModal && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenRenewModal(server);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-mono font-semibold border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
                        title="Prolonger de 1 mois (+30 jours)"
                      >
                        <RotateCw className="w-3 h-3 text-indigo-400" />
                        <span>Renouveler</span>
                      </button>
                    )}

                    {/* Bouton Ouvrir la Console */}
                    <button
                      type="button"
                      onClick={() => onSelectServer(server)}
                      className="px-4 py-1.5 rounded-xl bg-indigo-600/90 hover:bg-indigo-600 text-white text-xs font-mono font-bold flex items-center gap-1.5 shadow-sm shadow-indigo-600/20 group-hover:translate-x-0.5 transition-all cursor-pointer"
                    >
                      <span>Console</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    {/* Suppression */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteServer(server.id);
                      }}
                      className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer"
                      title="Supprimer ce serveur"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};

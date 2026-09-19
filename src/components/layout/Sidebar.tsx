import React from 'react';
import { 
  Server, 
  PlusCircle, 
  Terminal, 
  Cpu, 
  FileText, 
  X,
  Layers,
  Radio,
  CreditCard
} from 'lucide-react';

export type NavigationTab = 
  | 'servers'
  | 'new-server'
  | 'billing'
  | 'resources'
  | 'docs'
  // Compatibilité ascendante
  | 'bots'
  | 'new-deployment'
  | 'logs'
  | 'overview'
  | 'deployments'
  | 'activity'
  | 'settings';

interface SidebarProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  runningBotsCount?: number;
  totalBotsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  mobileOpen,
  onCloseMobile,
  runningBotsCount = 2,
  totalBotsCount = 4,
}) => {
  const normalizedTab = 
    activeTab === 'bots' || activeTab === 'overview' || activeTab === 'deployments' || activeTab === 'logs' ? 'servers' :
    activeTab === 'new-deployment' ? 'new-server' :
    activeTab === 'activity' || activeTab === 'settings' ? 'resources' :
    activeTab;

  const navItemClass = (tab: string) => {
    const isActive = normalizedTab === tab;
    return `w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group ${
      isActive
        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
    }`;
  };

  return (
    <>
      {/* Voile sombre pour mobile */}
      {mobileOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Barre latérale principale */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0a0d16] border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-200 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* En-tête de marque ORAX-HOSTING */}
        <div className="p-4 border-b border-slate-800/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-700 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
                <Server className="w-5 h-5" />
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0a0d16] animate-pulse" />
              </div>
              <div>
                <div className="font-bold text-white tracking-tight text-sm flex items-center gap-1.5">
                  <span>ORAX-HOSTING</span>
                </div>
                <div className="text-[10px] font-mono text-indigo-400 flex items-center gap-1">
                  <Radio className="w-2.5 h-2.5" />
                  <span>Panels & Serveurs 24/7</span>
                </div>
              </div>
            </div>

            {/* Bouton fermeture sur mobile */}
            <button 
              onClick={onCloseMobile}
              className="lg:hidden p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              aria-label="Fermer le menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Menu de navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-5 space-y-6">
          
          {/* Section Serveurs */}
          <div className="space-y-1.5">
            <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              Serveurs & Déploiements
            </div>

            {/* 1. Mes Serveurs */}
            <button 
              onClick={() => { onSelectTab('servers'); onCloseMobile(); }}
              className={navItemClass('servers')}
            >
              <div className="flex items-center gap-3">
                <Layers className="w-4 h-4" />
                <span>Mes Serveurs</span>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                normalizedTab === 'servers'
                  ? 'bg-indigo-950 text-indigo-200 border border-indigo-400/40'
                  : 'bg-slate-800 text-slate-300'
              }`}>
                {runningBotsCount}/{totalBotsCount}
              </span>
            </button>

            {/* 2. Nouveau Serveur */}
            <button 
              onClick={() => { onSelectTab('new-server'); onCloseMobile(); }}
              className={navItemClass('new-server')}
            >
              <div className="flex items-center gap-3">
                <PlusCircle className="w-4 h-4 text-emerald-400" />
                <span>+ Créer un Serveur</span>
              </div>
              <span className="text-[9px] font-mono uppercase bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 px-1.5 py-0.5 rounded">
                Nouveau
              </span>
            </button>

            {/* 3. Tarifs & Paiement (Boutique) */}
            <button 
              onClick={() => { onSelectTab('billing'); onCloseMobile(); }}
              className={navItemClass('billing')}
            >
              <div className="flex items-center gap-3">
                <CreditCard className="w-4 h-4 text-amber-400" />
                <span>Tarifs & Paiement</span>
              </div>
              <span className="text-[9px] font-mono uppercase bg-amber-950/80 text-amber-400 border border-amber-800/80 px-1.5 py-0.5 rounded font-bold">
                CFA
              </span>
            </button>
          </div>

          {/* Section Monitoring */}
          <div className="space-y-1.5">
            <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              Infrastructure
            </div>

            {/* 3. Ressources */}
            <button 
              onClick={() => { onSelectTab('resources'); onCloseMobile(); }}
              className={navItemClass('resources')}
            >
              <div className="flex items-center gap-3">
                <Cpu className="w-4 h-4" />
                <span>Santé & Ressources</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">100% OK</span>
            </button>

            {/* 4. Docs & Architecture */}
            <button 
              onClick={() => { onSelectTab('docs'); onCloseMobile(); }}
              className={navItemClass('docs')}
            >
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4" />
                <span>Architecture & Docs</span>
              </div>
            </button>
          </div>

        </div>

        {/* Pied de la barre latérale */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800/60 text-xs">
            <div className="flex items-center space-x-2.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <div>
                <div className="font-semibold text-slate-200">ORAX Node #1</div>
                <div className="text-[10px] font-mono text-slate-500">92.119.165.177</div>
              </div>
            </div>
          </div>
        </div>

      </aside>
    </>
  );
};

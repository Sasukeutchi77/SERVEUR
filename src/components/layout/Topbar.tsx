import React from 'react';
import { 
  Menu, 
  Plus, 
  Server,
  Terminal,
  Cpu
} from 'lucide-react';
import type { NavigationTab } from './Sidebar.tsx';

interface TopbarProps {
  activeTab: NavigationTab;
  selectedServerName?: string;
  onOpenMobile: () => void;
  onNewDeployment: () => void;
  uptimeSeconds: number;
  serverReady: boolean;
}

export const Topbar: React.FC<TopbarProps> = ({
  activeTab,
  selectedServerName,
  onOpenMobile,
  onNewDeployment,
}) => {
  return (
    <header className="sticky top-0 z-30 h-16 bg-[#0a0d16]/90 border-b border-slate-800/80 backdrop-blur-md px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
      {/* Titre de l'écran actuel */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobile}
          className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
          aria-label="Ouvrir le menu de navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-sm sm:text-base font-bold text-white tracking-tight truncate">
              {selectedServerName 
                ? `Console - ${selectedServerName}` 
                : activeTab === 'new-server' 
                ? 'Créer un Nouveau Serveur' 
                : activeTab === 'resources' 
                ? 'Santé & Ressources Infrastructure' 
                : activeTab === 'docs' 
                ? 'Architecture & Guide ORAX-HOSTING' 
                : 'Mes Serveurs'}
            </h1>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-950/60 text-emerald-400 border border-emerald-800/50">
              ● ORAX Node En Ligne
            </span>
          </div>
          <p className="hidden md:block text-xs text-slate-400 truncate">
            {selectedServerName
              ? 'Console en direct, terminal interactif et gestion des fichiers /home/container/'
              : 'Panels d\'hébergement et de déploiement de bots 24h/24'}
          </p>
        </div>
      </div>

      {/* Action rapide : + Créer un serveur */}
      <div className="flex items-center gap-3">
        <button
          onClick={onNewDeployment}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-98 text-white text-xs font-bold font-mono shadow-md shadow-indigo-600/30 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">+ Créer un Serveur</span>
          <span className="sm:hidden">Nouveau</span>
        </button>
      </div>
    </header>
  );
};

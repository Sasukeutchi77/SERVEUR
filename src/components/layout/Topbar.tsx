import React, { useState, useRef, useEffect } from 'react';
import { 
  Menu, 
  Plus, 
  Server,
  Terminal,
  Cpu,
  LogIn,
  LogOut,
  User,
  ChevronDown
} from 'lucide-react';
import type { NavigationTab } from './Sidebar.tsx';

interface TopbarProps {
  activeTab: NavigationTab;
  selectedServerName?: string;
  onOpenMobile: () => void;
  onNewDeployment: () => void;
  uptimeSeconds: number;
  serverReady: boolean;
  currentUser?: {
    email: string | null;
    displayName?: string | null;
  } | null;
  onOpenAuthModal: () => void;
  onLogout: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  activeTab,
  selectedServerName,
  onOpenMobile,
  onNewDeployment,
  currentUser,
  onOpenAuthModal,
  onLogout,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const userInitial = currentUser?.displayName 
    ? currentUser.displayName[0].toUpperCase()
    : currentUser?.email 
    ? currentUser.email[0].toUpperCase() 
    : 'U';

  const userTitle = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Client ORAX';

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

      {/* Actions droite : Profil / Connexion & + Créer un serveur */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Gestion Authentification Firebase */}
        {currentUser ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 hover:border-slate-600 text-slate-200 transition-all text-xs cursor-pointer"
              title={currentUser.email || 'Mon Compte'}
            >
              <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                {userInitial}
              </div>
              <span className="hidden md:inline font-medium max-w-[120px] truncate">
                {userTitle}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Menu Déroulant Profil */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#0d121f] border border-slate-700/80 p-2.5 shadow-2xl z-50 animate-fadeIn text-xs">
                <div className="p-2 border-b border-slate-800 mb-1.5">
                  <div className="font-bold text-white truncate">{userTitle}</div>
                  <div className="text-[11px] text-slate-400 truncate font-mono mt-0.5">
                    {currentUser.email}
                  </div>
                  <div className="mt-1 inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-1.5 py-0.5 rounded-full font-mono">
                    ● Firebase Auth Connecté
                  </div>
                </div>

                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors text-left cursor-pointer font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Se Déconnecter</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={onOpenAuthModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white text-xs font-semibold transition-all cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5 text-indigo-400" />
            <span>Connexion</span>
          </button>
        )}

        {/* Bouton + Créer un serveur */}
        <button
          onClick={onNewDeployment}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-98 text-white text-xs font-bold font-mono shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">+ Créer un Serveur</span>
          <span className="sm:hidden">Nouveau</span>
        </button>
      </div>
    </header>
  );
};

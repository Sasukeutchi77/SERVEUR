import React from 'react';
import { Server, ShieldCheck, Terminal, Layers } from 'lucide-react';

interface HeaderProps {
  currentPhase: number;
  phaseTitle: string;
  uptimeSeconds: number;
  serverReady: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentPhase,
  phaseTitle,
  uptimeSeconds,
  serverReady,
}) => {
  return (
    <header id="platform-header" className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-white tracking-tight text-base">BotCloud PaaS</span>
              <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Phase {currentPhase} / 15
              </span>
            </div>
            <p className="text-xs text-slate-400">Hébergement 24h/24 & Déploiement de bots isolés</p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2 text-xs">
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700/60 text-slate-300">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-slate-400">Étape active :</span>
            <span className="text-white font-medium">{phaseTitle}</span>
          </div>

          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700/60 text-slate-300 font-mono">
            <div className={`w-2 h-2 rounded-full ${serverReady ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span>Serveur API : {serverReady ? `ONLINE (${uptimeSeconds}s)` : 'Connexion...'}</span>
          </div>

          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Phase 1 Validée</span>
          </div>
        </div>
      </div>
    </header>
  );
};

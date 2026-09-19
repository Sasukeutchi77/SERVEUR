import React from 'react';
import { Terminal, FileCode, Check, ArrowUpRight, Cpu } from 'lucide-react';
import type { RuntimeConfig } from '../../shared/types/index.ts';

interface RuntimeExplorerProps {
  runtimes: RuntimeConfig[];
}

export const RuntimeExplorer: React.FC<RuntimeExplorerProps> = ({ runtimes }) => {
  return (
    <div id="runtime-explorer" className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-800 gap-2">
        <div>
          <h2 className="text-lg font-semibold text-white flex items-center space-x-2">
            <Terminal className="w-5 h-5 text-indigo-400" />
            <span>Architecture des Runtimes & Adapters (Phase 1)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Conception modulaire découplée : le moteur de déploiement détecte et configure automatiquement l'environnement selon le projet utilisateur.
          </p>
        </div>
        <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-md self-start sm:self-auto">
          Multi-Runtime Découplé
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
        {runtimes.map((runtime) => (
          <div 
            key={runtime.id} 
            className="bg-slate-800/40 border border-slate-800 hover:border-slate-700 rounded-lg p-4 flex flex-col justify-between transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-white text-sm">{runtime.label}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-700/60 text-slate-300">
                  {runtime.family}
                </span>
              </div>

              <div className="mb-2">
                <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-indigo-950/80 border border-indigo-800/50 text-indigo-300">
                  {runtime.categoryBadge}
                </span>
              </div>

              <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                {runtime.description}
              </p>

              <div className="mt-3.5 space-y-2 text-xs">
                <div>
                  <div className="text-[11px] text-slate-400 font-mono flex items-center space-x-1">
                    <FileCode className="w-3.5 h-3.5 text-slate-500" />
                    <span>Détection auto :</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {runtime.detectionFiles.map((file, i) => (
                      <span key={i} className="text-[10px] font-mono bg-slate-900 px-1.5 py-0.5 rounded text-slate-300 border border-slate-800">
                        {file}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] text-slate-400 font-mono">Commande d'install :</div>
                  <div className="mt-0.5 p-1.5 rounded bg-slate-900 font-mono text-[11px] text-emerald-400 border border-slate-800 truncate">
                    {runtime.defaultInstallCommand}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] text-slate-400 font-mono">Commande de start :</div>
                  <div className="mt-0.5 p-1.5 rounded bg-slate-900 font-mono text-[11px] text-sky-400 border border-slate-800 truncate">
                    {runtime.defaultStartCommand}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>Image :</span>
              <span className="text-slate-300">{runtime.dockerImage}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Extensibility note */}
      <div className="mt-4 p-3 rounded-lg bg-slate-800/30 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Cpu className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>
            <strong>Extensibilité garantie :</strong> L'interface <code className="font-mono text-slate-300">RuntimeAdapter</code> est conçue pour supporter ultérieurement <strong>Golang</strong>, <strong>Java</strong>, <strong>PHP</strong> et <strong>Rust</strong> sans modifier le Bot Manager ni le système de logs.
          </span>
        </div>
      </div>
    </div>
  );
};

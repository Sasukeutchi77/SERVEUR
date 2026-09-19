import React, { useState } from 'react';
import { 
  Network, 
  Cpu, 
  Database, 
  Layers, 
  ShieldAlert, 
  HardDrive, 
  Bot, 
  Flame, 
  CheckCircle2, 
  Info,
  ArrowRight
} from 'lucide-react';
import type { ArchitectureComponentStatus } from '../../shared/types/index.ts';

interface ArchitectureGraphProps {
  components?: ArchitectureComponentStatus[];
}

const DEFAULT_COMPONENT: ArchitectureComponentStatus = {
  id: 'bot-manager',
  name: 'Bot Manager & Supervisor',
  category: 'Core Platform',
  technology: 'Daemon interne avec Healthcheck Loop (Tick 5s)',
  status: 'Configured',
  description: "Surveillance de l'uptime des bots 24h/24, détection de crashs et auto-restart.",
  responsibilities: ['Supervision 24/7', 'Politique de redémarrage', 'Capture de métriques'],
};

export const ArchitectureGraph: React.FC<ArchitectureGraphProps> = ({ components = [] }) => {
  const [selectedNode, setSelectedNode] = useState<string>('bot-manager');

  const selectedComponent = 
    components.find(c => c.id === selectedNode) || 
    components[0] || 
    DEFAULT_COMPONENT;

  return (
    <div id="architecture-graph-container" className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-800/80 gap-2">
        <div>
          <h2 className="text-lg font-semibold text-white flex items-center space-x-2">
            <Network className="w-5 h-5 text-indigo-400" />
            <span>Topologie et Architecture Globale PaaS</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Flux de requêtes, isolation des processus et persistance continue 24h/24. Cliquez sur un bloc pour inspecter sa configuration.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs">
          <span className="flex items-center space-x-1 text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
            <span>Prêt / Spécifié</span>
          </span>
          <span className="flex items-center space-x-1 text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block"></span>
            <span>Sélectionné</span>
          </span>
        </div>
      </div>

      {/* Grid Layout: Visual Flow on the left, Inspector on the right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-5">
        
        {/* Visual interactive flow */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          {/* Level 1: Internet & Reverse Proxy */}
          <div className="flex flex-col items-center">
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-1">Entrée Publique (Port 443 / 80)</div>
            <button
              onClick={() => setSelectedNode('rev-proxy')}
              className={`w-full max-w-md p-3 rounded-lg border text-left transition-all ${
                selectedNode === 'rev-proxy' 
                  ? 'bg-indigo-950/50 border-indigo-500 text-white ring-1 ring-indigo-500' 
                  : 'bg-slate-800/60 border-slate-700/80 text-slate-200 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="p-1.5 rounded bg-slate-700/60 text-indigo-400">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold">Reverse Proxy (Traefik / Nginx)</div>
                    <div className="text-[11px] text-slate-400">Terminaison TLS, Buffering SSE, Routage API/Web</div>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Ready
                </span>
              </div>
            </button>
            <div className="h-4 w-px bg-slate-700 my-0.5"></div>
          </div>

          {/* Level 2: Frontend & Backend Control Plane */}
          <div className="flex flex-col items-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl">
              <div className="p-3 rounded-lg border bg-slate-800/40 border-slate-700/70 text-slate-300">
                <div className="text-xs font-semibold text-white">Frontend Dashboard</div>
                <div className="text-[11px] text-slate-400 mt-0.5">React + TS + Tailwind + SSE Client</div>
              </div>

              <button
                onClick={() => setSelectedNode('control-plane')}
                className={`p-3 rounded-lg border text-left transition-all ${
                  selectedNode === 'control-plane'
                    ? 'bg-indigo-950/50 border-indigo-500 text-white ring-1 ring-indigo-500'
                    : 'bg-slate-800/60 border-slate-700/80 text-slate-200 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold">Backend Control Plane (API)</div>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400">Active</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">Express + Auth + Quotas + SSE Logs</div>
              </button>
            </div>
            <div className="h-4 w-px bg-slate-700 my-0.5"></div>
          </div>

          {/* Level 3: Bot Manager (Core Orchestrator) */}
          <div className="flex flex-col items-center">
            <button
              onClick={() => setSelectedNode('bot-manager')}
              className={`w-full max-w-xl p-3.5 rounded-lg border text-left transition-all ${
                selectedNode === 'bot-manager'
                  ? 'bg-indigo-950/60 border-indigo-500 text-white ring-1 ring-indigo-500'
                  : 'bg-slate-800/80 border-slate-700 text-slate-200 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-md bg-indigo-600/30 text-indigo-300">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold flex items-center space-x-2">
                      <span>Bot Manager (Core Orchestrator & Supervisor 24/7)</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Boucle de santé continue, détection des crashs, auto-restart intelligent, gestion de l'état
                    </div>
                  </div>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Cœur PaaS
                </span>
              </div>
            </button>
            <div className="h-4 w-px bg-slate-700 my-0.5"></div>
          </div>

          {/* Level 4: Dual Support (Redis Queue + PostgreSQL DB) */}
          <div className="flex flex-col items-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl">
              <button
                onClick={() => setSelectedNode('queue-redis')}
                className={`p-3 rounded-lg border text-left transition-all ${
                  selectedNode === 'queue-redis'
                    ? 'bg-indigo-950/50 border-indigo-500 text-white ring-1 ring-indigo-500'
                    : 'bg-slate-800/60 border-slate-700/80 text-slate-200 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Flame className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-semibold">Redis 7 + BullMQ</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300">Queue</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">File asynchrone des déploiements & builds lourds</div>
              </button>

              <button
                onClick={() => setSelectedNode('db-postgres')}
                className={`p-3 rounded-lg border text-left transition-all ${
                  selectedNode === 'db-postgres'
                    ? 'bg-indigo-950/50 border-indigo-500 text-white ring-1 ring-indigo-500'
                    : 'bg-slate-800/60 border-slate-700/80 text-slate-200 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Database className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-semibold">PostgreSQL 16</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300">ACID + JSONB</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">Utilisateurs, bots, métadonnées et secrets chiffrés</div>
              </button>
            </div>
            <div className="h-4 w-px bg-slate-700 my-0.5"></div>
          </div>

          {/* Level 5: Worker Engine (Docker Runtime) */}
          <div className="flex flex-col items-center">
            <button
              onClick={() => setSelectedNode('worker-docker')}
              className={`w-full max-w-xl p-3 rounded-lg border text-left transition-all ${
                selectedNode === 'worker-docker'
                  ? 'bg-indigo-950/50 border-indigo-500 text-white ring-1 ring-indigo-500'
                  : 'bg-slate-800/60 border-slate-700/80 text-slate-200 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Cpu className="w-4 h-4 text-sky-400" />
                  <span className="text-xs font-semibold">Worker / Docker Engine (Daemon isolé)</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  Cgroups v2 + no-root
                </span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Contrôle des conteneurs, allocation des quotas (0.5 CPU, 512MB RAM, 100 PIDs limit)
              </div>
            </button>
            <div className="h-4 w-px bg-slate-700 my-0.5"></div>
          </div>

          {/* Level 6: Isolated User Bots */}
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-center text-slate-500 mb-2">
              Conteneurs Déployés des Utilisateurs (Exécution 24/7)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Bot WhatsApp */}
              <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-800/40 text-left">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-emerald-300 flex items-center space-x-1">
                    <Bot className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Bot WhatsApp</span>
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-900/40 px-1.5 py-0.5 rounded">
                    Node.js 22
                  </span>
                </div>
                <div className="text-[11px] text-slate-300">Bibliothèque : Baileys multi-device</div>
                <div className="mt-2 text-[10px] p-1.5 rounded bg-slate-900/80 border border-emerald-900/50 text-emerald-200">
                  💾 Volume monté : <span className="font-mono">/app/session</span> (creds.json préservé au reboot)
                </div>
              </div>

              {/* Bot Telegram */}
              <div className="p-3 rounded-lg bg-sky-950/20 border border-sky-800/40 text-left">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-sky-300 flex items-center space-x-1">
                    <Bot className="w-3.5 h-3.5 text-sky-400" />
                    <span>Bot Telegram</span>
                  </span>
                  <span className="text-[10px] font-mono text-sky-400 bg-sky-900/40 px-1.5 py-0.5 rounded">
                    Python 3.12
                  </span>
                </div>
                <div className="text-[11px] text-slate-300">Aiogram / python-telegram-bot</div>
                <div className="mt-2 text-[10px] p-1.5 rounded bg-slate-900/80 border border-sky-900/50 text-sky-200">
                  🔒 Secret chiffré : <span className="font-mono">BOT_TOKEN</span> injecté en mémoire
                </div>
              </div>

              {/* Bot Custom Node / Python */}
              <div className="p-3 rounded-lg bg-indigo-950/20 border border-indigo-800/40 text-left">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-indigo-300 flex items-center space-x-1">
                    <Bot className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Application Bot C</span>
                  </span>
                  <span className="text-[10px] font-mono text-indigo-400 bg-indigo-900/40 px-1.5 py-0.5 rounded">
                    Node/Python
                  </span>
                </div>
                <div className="text-[11px] text-slate-300">Custom worker / REST bot</div>
                <div className="mt-2 text-[10px] p-1.5 rounded bg-slate-900/80 border border-indigo-900/50 text-indigo-200">
                  ⚙️ Quota : 0.5 CPU / 512 MB / Logs auto-rotatifs
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Component Inspector Panel */}
        <div className="lg:col-span-4 bg-slate-800/40 border border-slate-800 rounded-lg p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono uppercase text-indigo-400 mb-1">
              <Info className="w-3.5 h-3.5" />
              <span>Inspecteur de composant</span>
            </div>
            <h3 className="text-base font-semibold text-white">{selectedComponent.name}</h3>
            <div className="text-xs font-mono text-slate-400 mt-0.5 pb-3 border-b border-slate-700/60">
              {selectedComponent.technology}
            </div>

            <div className="mt-3">
              <div className="text-xs font-medium text-slate-300 mb-1">Rôle et Fonctionnement :</div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {selectedComponent.description}
              </p>
            </div>

            <div className="mt-4">
              <div className="text-xs font-medium text-slate-300 mb-2">Responsabilités clés :</div>
              <ul className="space-y-1.5">
                {(selectedComponent.responsibilities || []).map((resp, idx) => (
                  <li key={idx} className="flex items-start space-x-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-700/60 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Catégorie : <strong className="text-slate-200">{selectedComponent.category}</strong></span>
            <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-mono">Phase 1 Prêt</span>
          </div>
        </div>

      </div>
    </div>
  );
};

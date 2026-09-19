import React from 'react';
import { 
  Cpu, 
  HardDrive, 
  ShieldCheck, 
  Layers, 
  Lock, 
  Server, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { MetricCard } from '../ui/MetricCard.tsx';

export const ResourcesView: React.FC = () => {
  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs uppercase tracking-wider mb-1">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Garantie de Sandbox & Isolation Multi-Tenant</span>
        </div>
        <h2 className="text-lg font-bold text-white tracking-tight">
          Allocation des Ressources & Sécurité Conteneurisée
        </h2>
        <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
          Chaque bot s'exécute dans son conteneur Docker étanche avec restrictions kernel Cgroups v2 strictes, interdiction de root (<code className="font-mono text-indigo-300">UID 1001</code>) et volumes persistants montés sur <code className="font-mono text-emerald-300">/app/session</code>.
        </p>
      </div>

      {/* Resource Quotas Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-400">Plafond CPU / Bot</span>
            <Cpu className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">0.5 vCPU</div>
          <p className="text-xs text-slate-400">
            Équivalent à 50% d'un cœur CPU hôte, bridé via <code className="font-mono text-slate-300">--cpus=0.5</code>.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-400">Plafond RAM / Bot</span>
            <HardDrive className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">512 MB RAM</div>
          <p className="text-xs text-slate-400">
            Mémoire vive dédiée avec swap contrôlé, bridée via <code className="font-mono text-slate-300">--memory=512m</code>.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-400">Processus Max (PIDs)</span>
            <Lock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">100 PIDs</div>
          <p className="text-xs text-slate-400">
            Protection absolue anti fork-bomb via <code className="font-mono text-slate-300">--pids-limit=100</code>.
          </p>
        </div>
      </div>

      {/* Security Flags Matrix */}
      <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-5 space-y-4">
        <h3 className="text-sm font-bold text-white">Flags de Sécurité Injectés aux Conteneurs</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <div className="font-mono font-semibold text-white">--security-opt=no-new-privileges</div>
              <div className="text-slate-400 mt-0.5">Empêche les processus fils d'élever leurs privilèges sudo ou root.</div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <div className="font-mono font-semibold text-white">--cap-drop=ALL</div>
              <div className="text-slate-400 mt-0.5">Retrait de toutes les capacités kernel Linux superflues (net_raw, sys_admin).</div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <div className="font-mono font-semibold text-white">--network=botcloud_bots_net</div>
              <div className="text-slate-400 mt-0.5">Réseau bridge externe étanche interdisant l'accès au socket Docker hôte ou à la DB.</div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <div className="font-mono font-semibold text-white">USER botuser (UID 1001)</div>
              <div className="text-slate-400 mt-0.5">Exécution garantie sous utilisateur non-root sans droit d'écriture système.</div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

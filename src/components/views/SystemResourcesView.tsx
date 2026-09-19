import React from 'react';
import { 
  Cpu, 
  HardDrive, 
  ShieldCheck, 
  Lock, 
  Server, 
  CheckCircle2, 
  Activity,
  Layers,
  Key,
  RefreshCw,
  Clock
} from 'lucide-react';
import { Phase1Validator } from '../Phase1Validator.tsx';
import { useToast } from '../ui/Toast.tsx';

export const SystemResourcesView: React.FC = () => {
  const { showToast } = useToast();

  const handleRegenerateKey = () => {
    showToast('success', 'Clé API régénérée', 'Nouvelle clé de contrôle PaaS active et chiffrée');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* 1. En-tête de section clair */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/30 border border-slate-800 p-5 sm:p-6">
        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
          <ShieldCheck className="w-4 h-4" />
          <span>Supervision & Sécurité Multi-Tenant</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Santé du Système & Quotas des Bots
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
          Chaque bot dispose de son propre conteneur Docker étanche avec limitation stricte des ressources (CPU, RAM) et persistance garantie.
        </p>
      </div>

      {/* 2. Quotas de compte & Limites par bot */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* CPU */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-400">Plafond CPU / Bot</span>
            <div className="p-2 rounded-lg bg-indigo-950/50 text-indigo-400">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-white">0.5 vCPU</div>
          <div className="text-xs text-slate-400 leading-relaxed">
            Limite par conteneur via cgroups v2 (<code className="font-mono text-indigo-300">--cpus=0.5</code>). Empêche un bot de saturer le serveur.
          </div>
        </div>

        {/* RAM */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-400">Plafond RAM / Bot</span>
            <div className="p-2 rounded-lg bg-sky-950/50 text-sky-400">
              <HardDrive className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-white">512 MB RAM</div>
          <div className="text-xs text-slate-400 leading-relaxed">
            Mémoire vive isolée (<code className="font-mono text-sky-300">--memory=512m</code>). Idéal pour Node.js Baileys et Python telegram.
          </div>
        </div>

        {/* Stockage */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-400">Volume Persistant</span>
            <div className="p-2 rounded-lg bg-emerald-950/50 text-emerald-400">
              <Lock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-white">/app/session</div>
          <div className="text-xs text-slate-400 leading-relaxed">
            Point de montage dédié. Conserve les sessions (Pairing Code, auth_info, tokens) sans altérer votre code ni vos configurations.
          </div>
        </div>

      </div>

      {/* 3. Sécurité et Règles d'isolation */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Garanties d'Exécution & Sécurité</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
            <div className="font-semibold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Exécution Non-Root (UID 1001)</span>
            </div>
            <p className="text-slate-400">
              Les bots s'exécutent avec un utilisateur système non-privilégié pour empêcher tout accès au système hôte.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
            <div className="font-semibold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Chiffrement AES-256-GCM des Secrets</span>
            </div>
            <p className="text-slate-400">
              Tous vos tokens Telegram et variables d'environnement sont cryptés au repos avant écriture en base.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Validateur en direct de la Phase 1 (Preserved) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Diagnostic Automatisé de Disponibilité</h3>
          <span className="text-xs text-slate-400 font-mono">Auto-Restart & Cgroups Test Suite</span>
        </div>
        <Phase1Validator />
      </div>

    </div>
  );
};

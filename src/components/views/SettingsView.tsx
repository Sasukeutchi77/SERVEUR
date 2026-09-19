import React from 'react';
import { 
  Key, 
  ShieldCheck, 
  Database, 
  User, 
  Lock, 
  HardDrive, 
  Cpu, 
  RefreshCw,
  CheckCircle2
} from 'lucide-react';
import { useToast } from '../ui/Toast.tsx';

export const SettingsView: React.FC = () => {
  const { showToast } = useToast();

  const handleRegenerateKey = () => {
    showToast('success', 'Clé API générée', 'Nouvelle clé de contrôle PaaS créée et active');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Account & Quotas */}
      <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white">Quotas & Abonnement Développeur</h3>
            <p className="text-xs text-slate-400 mt-0.5">Ressources allouées à votre compte pour l'hébergement 24h/24</p>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/25">
            Plan PRO Developer
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
            <div className="text-[11px] font-mono uppercase text-slate-400">Bots Simultanés</div>
            <div className="text-lg font-bold font-mono text-white mt-1">3 / 5 Bots</div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-indigo-500 h-full rounded-full w-[60%]" />
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
            <div className="text-[11px] font-mono uppercase text-slate-400">RAM Réservée</div>
            <div className="text-lg font-bold font-mono text-white mt-1">1.5 / 2.5 GB</div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-sky-500 h-full rounded-full w-[60%]" />
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
            <div className="text-[11px] font-mono uppercase text-slate-400">Stockage Persistant</div>
            <div className="text-lg font-bold font-mono text-white mt-1">1.2 / 5.0 GB</div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full w-[24%]" />
            </div>
          </div>
        </div>
      </div>

      {/* Security & Encryption */}
      <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-5 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Lock className="w-4 h-4 text-emerald-400" />
          <span>Sécurité & Chiffrement au Repos</span>
        </h3>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 border border-slate-800">
            <div>
              <div className="font-semibold text-white">Chiffrement AES-256-GCM des Secrets</div>
              <div className="text-slate-400 mt-0.5">Toutes les variables chiffrées sont cryptées avant insertion en base de données.</div>
            </div>
            <span className="flex items-center gap-1 text-emerald-400 font-mono text-xs">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Actif</span>
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 border border-slate-800">
            <div>
              <div className="font-semibold text-white">Clé d'API Control Plane</div>
              <div className="font-mono text-slate-400 text-[11px] mt-0.5">pk_live_botcloud_99a8*******************</div>
            </div>
            <button
              onClick={handleRegenerateKey}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs border border-slate-700 transition-colors"
            >
              Régénérer
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

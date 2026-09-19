import React from 'react';
import { Database, ShieldCheck, HardDrive, Smartphone, Send, Lock } from 'lucide-react';

export const TechDecisions: React.FC = () => {
  return (
    <div id="tech-decisions-section" className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* PostgreSQL vs MongoDB */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-800">
          <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Analyse Base de Données : PostgreSQL vs MongoDB</h3>
            <p className="text-xs text-slate-400">Choix technique argumenté pour un PaaS multi-tenant</p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-700/80 text-slate-400">
                  <th className="py-2 pr-3 font-medium">Critère</th>
                  <th className="py-2 px-3 font-semibold text-emerald-400 bg-emerald-950/20 rounded-t">PostgreSQL (Retenu)</th>
                  <th className="py-2 pl-3 font-medium text-slate-400">MongoDB</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                <tr>
                  <td className="py-2 pr-3 font-medium text-white">Intégrité Relationnelle</td>
                  <td className="py-2 px-3 bg-emerald-950/10 text-emerald-300 font-medium">
                    Clés étrangères strictes (User ➜ Bot ➜ Volumes ➜ Quotas)
                  </td>
                  <td className="py-2 pl-3 text-slate-400">Références manuelles sans contrainte moteur</td>
                </tr>
                <tr>
                  <td className="py-2 pr-3 font-medium text-white">Transactions ACID</td>
                  <td className="py-2 px-3 bg-emerald-950/10 text-emerald-300 font-medium">
                    Atomiques sur toutes les tables lors du provisioning
                  </td>
                  <td className="py-2 pl-3 text-slate-400">Transactions multi-documents plus lentes et lourdes</td>
                </tr>
                <tr>
                  <td className="py-2 pr-3 font-medium text-white">Données Flexibles</td>
                  <td className="py-2 px-3 bg-emerald-950/10 text-emerald-300 font-medium">
                    Colonnes <code className="font-mono text-xs text-indigo-300">JSONB</code> indexables GIN (Best of both worlds)
                  </td>
                  <td className="py-2 pl-3 text-slate-400">Natif (BSON)</td>
                </tr>
                <tr>
                  <td className="py-2 pr-3 font-medium text-white">Gestion des Quotas</td>
                  <td className="py-2 px-3 bg-emerald-950/10 text-emerald-300 font-medium">
                    Protection absolue contre la sur-allocation de bots
                  </td>
                  <td className="py-2 pl-3 text-slate-400">Risque d'incohérence sous forte concurrence</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/60 text-xs text-slate-300 leading-relaxed">
            <strong className="text-white">Conclusion d'architecture : </strong>
            PostgreSQL 16 est choisi. Il apporte la rigueur relationnelle pour garantir qu'un bot ne peut exister sans son utilisateur propriétaire, tout en offrant la flexibilité de stockage des configurations dynamiques grâce au format JSONB.
          </div>
        </div>
      </div>

      {/* Spécificités WhatsApp Baileys & Telegram */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-800">
          <div className="p-2 rounded-lg bg-emerald-600/20 text-emerald-400">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Persistance WhatsApp & Sécurité Telegram</h3>
            <p className="text-xs text-slate-400">Garantie 24h/24 sans déconnexion ni fuite de tokens</p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {/* WhatsApp Baileys detail */}
          <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-800/40">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-emerald-300 flex items-center space-x-1.5">
                <HardDrive className="w-4 h-4 text-emerald-400" />
                <span>WhatsApp : Préservation de session Baileys</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-900/50 px-2 py-0.5 rounded">
                Mount: /app/session
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Les fichiers d'authentification WhatsApp (<code className="font-mono text-emerald-300">creds.json</code>, clés d'échange) sont montés sur un volume persistant dédié indépendant du conteneur.
            </p>
            <div className="mt-2 text-[11px] text-emerald-400/90 font-mono bg-slate-950/60 p-2 rounded border border-emerald-900/40">
              Serveur arrêté ➜ Serveur redémarré ➜ Conteneur recréé ➜ Volume restauré ➜ Session Pairing Code réactivée sans altération
            </div>
          </div>

          {/* Telegram Security detail */}
          <div className="p-3 rounded-lg bg-sky-950/20 border border-sky-800/40">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-sky-300 flex items-center space-x-1.5">
                <Lock className="w-4 h-4 text-sky-400" />
                <span>Telegram : Protection des Tokens & Secrets</span>
              </span>
              <span className="text-[10px] font-mono text-sky-400 bg-sky-900/50 px-2 py-0.5 rounded">
                AES-256-GCM
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Le <code className="font-mono text-sky-300">BOT_TOKEN</code> n'est jamais stocké en clair. Il est chiffré en base de données et injecté au démarrage via l'environnement Docker.
            </p>
            <div className="mt-2 text-[11px] text-sky-400/90 font-mono bg-slate-950/60 p-2 rounded border border-sky-900/40">
              Sanitization automatique : Tout pattern de token détecté dans les flux de logs est masqué en [PROTECTED_SECRET]
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

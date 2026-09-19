import React from 'react';
import { Layers, CheckCircle2, ArrowRight, Clock, ShieldCheck } from 'lucide-react';

interface PhaseItem {
  number: number;
  title: string;
  description: string;
  status: 'COMPLETED' | 'ACTIVE' | 'PLANNED';
}

const PHASES: PhaseItem[] = [
  {
    number: 1,
    title: 'Architecture & Initialisation',
    description: 'Modèle de données partagé, choix technologiques, Docker Compose, isolation et runtimes.',
    status: 'COMPLETED',
  },
  {
    number: 2,
    title: 'Base de données & Authentification',
    description: 'Schéma PostgreSQL, migrations, hashage mots de passe, sessions JWT sécurisées et RBAC.',
    status: 'ACTIVE',
  },
  {
    number: 3,
    title: 'Frontend & Dashboard',
    description: 'Interface de gestion des bots, métriques globales, responsive mobile et desktop.',
    status: 'PLANNED',
  },
  {
    number: 4,
    title: 'Système de Création de Déploiement',
    description: 'Formulaire de création, sélection du runtime, variables d\'environnement et secrets chiffrés.',
    status: 'PLANNED',
  },
  {
    number: 5,
    title: 'Upload ZIP & GitHub',
    description: 'Validation de sécurité ZIP, anti-zip slip, clone shallow GitHub et gestion de branches.',
    status: 'PLANNED',
  },
  {
    number: 6,
    title: 'Deployment Engine',
    description: 'Pipeline de build, détection automatique, exécution isolée et transition des 11 statuts.',
    status: 'PLANNED',
  },
  {
    number: 7,
    title: 'Docker & Isolation',
    description: 'Conteneurs sans privilèges (non-root), cgroups (0.5 CPU, 512MB RAM), réseaux étanches.',
    status: 'PLANNED',
  },
  {
    number: 8,
    title: 'Cycle de Vie & Monitoring',
    description: 'Start, Stop, Restart, Redeploy, détection de crashs et politique de redémarrage 24h/24.',
    status: 'PLANNED',
  },
  {
    number: 9,
    title: 'Logs en Temps Réel',
    description: 'Streaming Server-Sent Events (SSE), masquage automatique des secrets et auto-scroll.',
    status: 'PLANNED',
  },
  {
    number: 10,
    title: 'Persistance & Sessions WhatsApp',
    description: 'Volumes persistants pour Baileys (creds.json) et bases SQLite locales avec reprise après reboot.',
    status: 'PLANNED',
  },
  {
    number: 11,
    title: 'Support Avancé Node.js & Python',
    description: 'Optimisations multi-versions, dépendances natives, modules audio/vidéo ffmpeg.',
    status: 'PLANNED',
  },
  {
    number: 12,
    title: 'Administration & Supervision',
    description: 'Panel admin, statistiques globales, gestion des comptes et arrêt d\'urgence.',
    status: 'PLANNED',
  },
  {
    number: 13,
    title: 'Sécurité Avancée',
    description: 'Rate limiting, headers CORS stricts, audit logs et protection contre les abus de ressources.',
    status: 'PLANNED',
  },
  {
    number: 14,
    title: 'Préparation Production & Haute Dispo',
    description: 'Architecture multi-workers, reverse proxy TLS, clustering et scalabilité horizontale.',
    status: 'PLANNED',
  },
  {
    number: 15,
    title: 'Monétisation & Quotas',
    description: 'Plans Free / Starter / Pro, limites CPU/RAM par tier et suspension automatique en fin de cycle.',
    status: 'PLANNED',
  },
];

export const RoadmapPhases: React.FC = () => {
  return (
    <div id="roadmap-phases" className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-800 gap-2">
        <div>
          <h2 className="text-lg font-semibold text-white flex items-center space-x-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <span>Feuille de Route Progressive (Méthodologie en 15 Phases)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Développement pas-à-pas rigoureux : chaque phase est validée avant d'activer la suivante sur ordre explicite.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs">
          <span className="px-2.5 py-1 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/50 flex items-center space-x-1.5 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Phase 1 Complète</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 mt-5">
        {PHASES.map((phase) => {
          const isCompleted = phase.status === 'COMPLETED';
          const isActive = phase.status === 'ACTIVE';

          return (
            <div
              key={phase.number}
              className={`p-3 rounded-lg border text-left flex flex-col justify-between transition-all ${
                isCompleted
                  ? 'bg-emerald-950/20 border-emerald-800/50 text-slate-200'
                  : isActive
                  ? 'bg-indigo-950/30 border-indigo-500/60 text-slate-200 ring-1 ring-indigo-500/30'
                  : 'bg-slate-800/30 border-slate-800/80 text-slate-400'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[11px] font-mono font-semibold ${
                    isCompleted ? 'text-emerald-400' : isActive ? 'text-indigo-400' : 'text-slate-500'
                  }`}>
                    PHASE {phase.number}
                  </span>
                  {isCompleted && (
                    <span className="flex items-center space-x-0.5 text-[10px] text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Terminé</span>
                    </span>
                  )}
                  {isActive && (
                    <span className="flex items-center space-x-1 text-[10px] text-indigo-300 font-medium bg-indigo-900/40 px-1.5 py-0.2 rounded">
                      <ArrowRight className="w-3 h-3 text-indigo-400" />
                      <span>Suivant</span>
                    </span>
                  )}
                </div>

                <div className="text-xs font-semibold text-white line-clamp-1">
                  {phase.title}
                </div>

                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {phase.description}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800/60 text-[10px] flex items-center justify-between">
                <span className="text-slate-500">Ordre d'exécution</span>
                <span className="font-mono text-slate-400">#{phase.number}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { 
  Upload, 
  Github, 
  CheckCircle2, 
  Rocket, 
  Smartphone,
  Loader2,
  Bot,
  Send,
  ArrowLeft,
  Check,
  ShieldCheck,
  FolderArchive
} from 'lucide-react';
import type { SupportedRuntime, SourceType } from '../../../shared/types/index.ts';

interface NewDeploymentViewProps {
  onDeploymentCreated: (deploymentData: any) => void;
  onNavigate: (tab: any) => void;
}

export const NewDeploymentView: React.FC<NewDeploymentViewProps> = ({
  onDeploymentCreated,
  onNavigate,
}) => {
  // Sélection du type de bot pour détection optimale
  const [selectedPreset, setSelectedPreset] = useState<'whatsapp' | 'telegram' | 'custom'>('whatsapp');
  
  // États du formulaire
  const [sourceType, setSourceType] = useState<SourceType>('ZIP');
  const [zipFileName, setZipFileName] = useState<string>('');
  const [githubUrl, setGithubUrl] = useState<string>('https://github.com/votre-compte/whatsapp-bot');
  const [githubBranch, setGithubBranch] = useState<string>('main');
  const [name, setName] = useState<string>('Mon Bot WhatsApp (Baileys)');
  const [runtime, setRuntime] = useState<SupportedRuntime>('nodejs-22');

  // Simulation du processus de déploiement
  const [deploying, setDeploying] = useState<boolean>(false);
  const [deployStep, setDeployStep] = useState<number>(0);

  const applyPreset = (preset: 'whatsapp' | 'telegram' | 'custom') => {
    setSelectedPreset(preset);
    if (preset === 'whatsapp') {
      setName('Mon Bot WhatsApp (Pairing Code)');
      setRuntime('nodejs-22');
    } else if (preset === 'telegram') {
      setName('Mon Bot Telegram');
      setRuntime('python-3.12');
    } else {
      setName('Mon Bot Discord');
      setRuntime('nodejs-20');
    }
  };

  const handleStartDeploy = () => {
    setDeploying(true);
    setDeployStep(1);

    setTimeout(() => setDeployStep(2), 700);
    setTimeout(() => setDeployStep(3), 1400);
    setTimeout(() => setDeployStep(4), 2100);
    setTimeout(() => {
      setDeployStep(5);
      setDeploying(false);
      onDeploymentCreated({
        name,
        runtime,
        sourceType,
        sourceRef: sourceType === 'ZIP' ? (zipFileName || 'bot-archive.zip') : githubUrl,
      });
    }, 2800);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Bouton retour + Titre limpide */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('bots')}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Retour à mes bots"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Déployer un nouveau bot</h2>
            <p className="text-xs text-slate-400">
              Uploadez votre bot ou connectez votre GitHub. Tout est extrait et configuré automatiquement pour tourner 24h/24.
            </p>
          </div>
        </div>
      </div>

      {/* Barre d'état du déploiement en direct */}
      {deploying && (
        <div className="p-5 rounded-2xl bg-indigo-950/40 border border-indigo-500/50 space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-white flex items-center gap-2.5">
              <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
              <span>Mise en ligne de votre bot en cours...</span>
            </span>
            <span className="text-xs font-mono text-indigo-300">Étape {deployStep} / 4</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${
              deployStep >= 1 ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}>
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>1. Code importé</span>
            </div>

            <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${
              deployStep >= 2 ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}>
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>2. Sandbox prête</span>
            </div>

            <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${
              deployStep >= 3 ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}>
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>3. Paquets installés</span>
            </div>

            <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${
              deployStep >= 4 ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}>
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>4. En ligne 24/7 !</span>
            </div>
          </div>
        </div>
      )}

      {/* Étape 1 : Quel type de bot héberger ? */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-mono text-xs flex items-center justify-center font-bold">
            1
          </span>
          <h3 className="text-sm font-bold text-white">
            Quel type de bot souhaitez-vous héberger ?
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          {/* Option WhatsApp */}
          <button
            type="button"
            onClick={() => applyPreset('whatsapp')}
            className={`p-4 rounded-xl border text-left transition-all ${
              selectedPreset === 'whatsapp'
                ? 'bg-emerald-950/30 border-emerald-500 ring-1 ring-emerald-500/40 text-white'
                : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-emerald-950/50 text-emerald-400">
                <Smartphone className="w-5 h-5" />
              </div>
              {selectedPreset === 'whatsapp' && (
                <Check className="w-4 h-4 text-emerald-400" />
              )}
            </div>
            <div className="font-bold text-sm text-white">Bot WhatsApp</div>
            <div className="text-[11px] text-slate-400 mt-1">
              Connexion par Pairing Code (Baileys). Le serveur exécute votre bot tel quel sans altérer votre configuration.
            </div>
          </button>

          {/* Option Telegram */}
          <button
            type="button"
            onClick={() => applyPreset('telegram')}
            className={`p-4 rounded-xl border text-left transition-all ${
              selectedPreset === 'telegram'
                ? 'bg-sky-950/30 border-sky-500 ring-1 ring-sky-500/40 text-white'
                : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-sky-950/50 text-sky-400">
                <Send className="w-5 h-5" />
              </div>
              {selectedPreset === 'telegram' && (
                <Check className="w-4 h-4 text-sky-400" />
              )}
            </div>
            <div className="font-bold text-sm text-white">Bot Telegram</div>
            <div className="text-[11px] text-slate-400 mt-1">
              Token BotFather ou Pairing Code. Vos scripts et sessions sont exécutés à 100% sans modification.
            </div>
          </button>

          {/* Option Discord ou Personnalisé */}
          <button
            type="button"
            onClick={() => applyPreset('custom')}
            className={`p-4 rounded-xl border text-left transition-all ${
              selectedPreset === 'custom'
                ? 'bg-indigo-950/30 border-indigo-500 ring-1 ring-indigo-500/40 text-white'
                : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-indigo-950/50 text-indigo-400">
                <Bot className="w-5 h-5" />
              </div>
              {selectedPreset === 'custom' && (
                <Check className="w-4 h-4 text-indigo-400" />
              )}
            </div>
            <div className="font-bold text-sm text-white">Discord ou Autre</div>
            <div className="text-[11px] text-slate-400 mt-1">
              Tout bot ou script sur mesure. Vos configurations et variables sont préservées intactes.
            </div>
          </button>

        </div>

        {/* Nom du bot */}
        <div className="pt-2">
          <label className="text-xs font-semibold text-slate-300 block mb-1">
            Donnez un nom à votre bot :
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex : Mon Assistant WhatsApp"
            className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
          />
        </div>
      </div>

      {/* Étape 2 : Votre code source (ZIP ou GitHub) */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-mono text-xs flex items-center justify-center font-bold">
              2
            </span>
            <h3 className="text-sm font-bold text-white">
              Où se trouve le dossier de votre bot ?
            </h3>
          </div>
          <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Fichiers & variables lus directement</span>
          </span>
        </div>

        {/* Choix ZIP ou GitHub */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setSourceType('ZIP')}
            className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition-all ${
              sourceType === 'ZIP'
                ? 'bg-indigo-600/20 border-indigo-500 text-white'
                : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <Upload className="w-4 h-4 text-indigo-400" />
            <span>Fichier ZIP de mon bot</span>
          </button>

          <button
            type="button"
            onClick={() => setSourceType('GITHUB')}
            className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition-all ${
              sourceType === 'GITHUB'
                ? 'bg-indigo-600/20 border-indigo-500 text-white'
                : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <Github className="w-4 h-4 text-slate-200" />
            <span>Dépôt GitHub</span>
          </button>
        </div>

        {/* Zone de chargement ZIP */}
        {sourceType === 'ZIP' ? (
          <div className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-2xl p-7 text-center bg-slate-950/40 transition-colors">
            <FolderArchive className="w-10 h-10 text-indigo-400 mx-auto mb-2" />
            <div className="text-sm font-bold text-white">
              Déposez votre fichier archive .ZIP ici
            </div>
            <div className="text-xs text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
              Toutes vos variables, tokens, fichiers de configuration (.env) et scripts inclus dans votre ZIP seront exécutés directement.
            </div>
            
            <input 
              type="file" 
              accept=".zip" 
              id="zip-picker" 
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) setZipFileName(e.target.files[0].name);
              }}
            />
            <label
              htmlFor="zip-picker"
              className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium cursor-pointer border border-slate-700 transition-colors shadow-sm"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Sélectionner le fichier .ZIP sur mon ordinateur</span>
            </label>

            {zipFileName && (
              <div className="mt-3 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-mono">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Archive sélectionnée : {zipFileName}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Lien du dépôt GitHub :
              </label>
              <input
                type="text"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/votre-nom/votre-bot"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Branche :
              </label>
              <input
                type="text"
                value={githubBranch}
                onChange={(e) => setGithubBranch(e.target.value)}
                placeholder="main"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>
        )}

        {/* Note informative rassurante */}
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-start gap-2.5 text-xs text-slate-400">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="text-slate-200 font-semibold">Aucune modification de vos configurations : </span>
            Le serveur n'altère en aucun cas vos scripts, vos tokens ou votre configuration de bot. Si votre bot utilise un <span className="text-indigo-300 font-mono font-bold">Pairing Code</span>, le code de jumelage apparaît directement dans votre onglet <strong>Logs</strong> pour lier votre compte en quelques secondes.
          </div>
        </div>

      </div>

      {/* Bouton de déploiement final bien visible */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={() => onNavigate('bots')}
          className="px-4 py-2.5 rounded-xl text-xs text-slate-400 hover:text-white transition-colors"
        >
          Annuler
        </button>

        <button
          type="button"
          onClick={handleStartDeploy}
          disabled={deploying}
          className="flex items-center gap-2 px-7 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all active:scale-98 disabled:opacity-50"
        >
          {deploying ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Déploiement en cours...</span>
            </>
          ) : (
            <>
              <Rocket className="w-4 h-4" />
              <span>Mettre mon bot en ligne 24h/24</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
};

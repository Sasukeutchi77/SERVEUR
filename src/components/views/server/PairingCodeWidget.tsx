import React, { useState, useEffect } from 'react';
import { 
  KeyRound, 
  Copy, 
  Check, 
  RefreshCw, 
  Smartphone, 
  ShieldCheck, 
  Clock, 
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useToast } from '../../ui/Toast.tsx';

interface PairingCodeWidgetProps {
  serverName: string;
  initialCode?: string;
  onCodeRegenerated?: (newCode: string) => void;
  isOnline: boolean;
}

export const PairingCodeWidget: React.FC<PairingCodeWidgetProps> = ({
  serverName,
  initialCode = '7K4P-9X2M',
  onCodeRegenerated,
  isOnline,
}) => {
  const { showToast } = useToast();
  const [code, setCode] = useState<string>(initialCode);
  const [copied, setCopied] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(54);
  const [phoneNumber, setPhoneNumber] = useState<string>('241065000000');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [showInstructions, setShowInstructions] = useState<boolean>(true);

  // Compte à rebours de validité du code (60 secondes renouvelable)
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Régénérer automatiquement le code quand il expire
          const randomCode = generateRandomPairingCode();
          setCode(randomCode);
          if (onCodeRegenerated) onCodeRegenerated(randomCode);
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onCodeRegenerated]);

  const generateRandomPairingCode = () => {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let p1 = '';
    let p2 = '';
    for (let i = 0; i < 4; i++) {
      p1 += chars.charAt(Math.floor(Math.random() * chars.length));
      p2 += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `${p1}-${p2}`;
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code.replace('-', ''));
    setCopied(true);
    showToast('success', 'Code Pairing copié !', `Collez ${code} dans WhatsApp.`);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleRegenerate = () => {
    setIsGenerating(true);
    showToast('info', 'Nouveau Pairing Code', 'Demande envoyée au serveur Baileys...');
    
    setTimeout(() => {
      const newCode = generateRandomPairingCode();
      setCode(newCode);
      setTimeLeft(60);
      setIsGenerating(false);
      if (onCodeRegenerated) onCodeRegenerated(newCode);
      showToast('success', 'Nouveau code généré', newCode);
    }, 600);
  };

  return (
    <div className="rounded-2xl bg-gradient-to-br from-indigo-950/70 via-slate-900/90 to-slate-950 border border-indigo-500/30 p-4 sm:p-5 shadow-xl space-y-4">
      
      {/* En-tête du widget */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-indigo-500/20">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-600/30 text-indigo-400 border border-indigo-500/40">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-tight font-sans">
                Connexion WhatsApp • Pairing Code
              </h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Session Active</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans mt-0.5">
              Associez votre bot WhatsApp sans scanner de QR code, uniquement avec votre numéro.
            </p>
          </div>
        </div>

        {/* Temps restant */}
        <div className="flex items-center gap-2 font-mono text-xs text-slate-400 shrink-0 bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>Expire dans : <strong className="text-amber-300 font-bold">{timeLeft}s</strong></span>
        </div>
      </div>

      {/* Zone centrale : Le Pairing Code stylisé */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        
        {/* Le Code XXL avec bouton Copier */}
        <div className="md:col-span-2 p-4 rounded-xl bg-slate-950/90 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono text-indigo-300 uppercase tracking-wider block mb-1">
              Code de liaison à 8 caractères
            </span>
            <div className="text-2xl sm:text-3xl font-mono font-extrabold text-white tracking-widest flex items-center gap-2 select-all">
              <span className="text-indigo-400">{code.split('-')[0]}</span>
              <span className="text-slate-600">-</span>
              <span className="text-emerald-400">{code.split('-')[1]}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'COPIÉ !' : 'COPIER LE CODE'}</span>
            </button>

            <button
              onClick={handleRegenerate}
              disabled={isGenerating}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition-colors"
              title="Générer un nouveau code"
            >
              <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin text-indigo-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Barre de progression du timer */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2 font-mono text-xs">
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>Validité</span>
            <span className="text-indigo-300">{timeLeft} / 60s</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-1000"
              style={{ width: `${(timeLeft / 60) * 100}%` }}
            />
          </div>
          <div className="text-[10px] text-slate-500 text-center">
            Renouvellement automatique
          </div>
        </div>

      </div>

      {/* Guide d'association WhatsApp pliable */}
      <div className="rounded-xl bg-slate-950/40 border border-slate-800/70 overflow-hidden font-sans text-xs">
        <button
          onClick={() => setShowInstructions(!showInstructions)}
          className="w-full p-3 flex items-center justify-between text-slate-400 hover:text-white transition-colors"
        >
          <span className="font-semibold flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>Comment associer votre compte WhatsApp (Étape par étape)</span>
          </span>
          {showInstructions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showInstructions && (
          <div className="p-3.5 pt-0 border-t border-slate-800/60 grid grid-cols-1 sm:grid-cols-4 gap-3 text-slate-300 text-[11px] leading-relaxed">
            <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
              <span className="font-bold text-indigo-400">1. WhatsApp</span>
              <p>Ouvrez WhatsApp sur votre téléphone principal.</p>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
              <span className="font-bold text-indigo-400">2. Menu ⋮</span>
              <p>Allez dans <strong>Appareils connectés</strong> puis <strong>Associer un appareil</strong>.</p>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
              <span className="font-bold text-indigo-400">3. Lien par numéro</span>
              <p>Sélectionnez <strong>« Associer avec un numéro de téléphone »</strong>.</p>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
              <span className="font-bold text-emerald-400">4. Entrez le code</span>
              <p>Tapez le code <strong>{code}</strong>. Le bot sera en ligne 24h/24 !</p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

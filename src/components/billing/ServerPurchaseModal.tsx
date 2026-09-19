import React, { useState } from 'react';
import { 
  X, 
  Server as ServerIcon, 
  Check, 
  Cpu, 
  HardDrive, 
  Zap, 
  ShieldCheck, 
  CreditCard, 
  Smartphone, 
  Coins, 
  Wallet, 
  ChevronRight, 
  Sparkles, 
  Info, 
  Clock, 
  CheckCircle2, 
  Copy,
  Lock,
  AlertTriangle
} from 'lucide-react';
import { 
  SERVER_PLANS, 
  ServerPlan, 
  formatPrice, 
  calculateExpirationDate 
} from '../../data/serverPlans.ts';
import { useToast } from '../ui/Toast.tsx';
import { PaymentChannels, OFFICIAL_PAYMENT_CHANNELS } from './PaymentChannels.tsx';
import type { PaymentVerificationResult } from '../../types/payment.ts';

interface ServerPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newServerData: {
    name: string;
    runtime: string;
    plan: ServerPlan;
    expiresAt: string;
    daysRemaining: number;
    transactionId: string;
    paymentMethod: string;
  }) => void;
  onSuccessPurchase?: (newServerData: {
    name: string;
    runtime: string;
    plan: ServerPlan;
    expiresAt: string;
    daysRemaining: number;
    transactionId: string;
    paymentMethod: string;
  }) => void;
  initialPlanId?: string;
  userWalletBalanceCfa?: number;
  userWalletBalanceUsd?: number;
}

export const ServerPurchaseModal: React.FC<ServerPurchaseModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onSuccessPurchase,
  initialPlanId = 'standard-2.5',
  userWalletBalanceCfa,
  userWalletBalanceUsd = 3500,
}) => {
  const effectiveWalletBalanceCfa = userWalletBalanceCfa !== undefined
    ? userWalletBalanceCfa
    : (userWalletBalanceUsd >= 500 ? userWalletBalanceUsd : Math.round(userWalletBalanceUsd * 660));
  const { showToast } = useToast();

  const [step, setStep] = useState<'plan' | 'configure' | 'payment' | 'processing'>('plan');
  const [selectedPlanId, setSelectedPlanId] = useState<string>(initialPlanId);
  const [serverName, setServerName] = useState<string>('');
  const [serverRuntime, setServerRuntime] = useState<string>('Node.js 22 LTS');
  
  // Méthode de paiement & Vérification stricte
  const [paymentMethod, setPaymentMethod] = useState<'mobile_money' | 'wallet'>('mobile_money');
  const [selectedChannelId, setSelectedChannelId] = useState<string>('bf-orange');
  const [senderPhone, setSenderPhone] = useState<string>('');
  const [transactionReference, setTransactionReference] = useState<string>('');
  const [verificationResult, setVerificationResult] = useState<PaymentVerificationResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const selectedPlan = SERVER_PLANS.find((p) => p.id === selectedPlanId) || SERVER_PLANS[1];

  if (!isOpen) return null;

  const handleNextToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serverName.trim()) {
      setServerName(`Serveur ${selectedPlan.name.split(' ')[0]}`);
    }
    setStep('payment');
  };

  // Exécution de l'allocation sécurisée via l'API backend
  const handleExecutePayment = async () => {
    // CONTRÔLE CÔTÉ CLIENT : Impossible sans jeton de vérification
    if (!verificationResult || !verificationResult.verificationToken) {
      showToast(
        'error',
        'Paiement Non Vérifié',
        'Vous devez obligatoirement effectuer et faire valider votre transaction avant de créer le serveur.'
      );
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);
    setStep('processing');

    try {
      // Appel strict au backend d'allocation
      const response = await fetch('/api/v1/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: selectedPlan.id,
          serverName: serverName.trim() || `Serveur ${selectedPlan.name}`,
          verificationToken: verificationResult.verificationToken,
          paymentMethod: verificationResult.operator,
          currency: 'CFA',
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setStep('payment');
        const errMsg = data.error || "Échec de l'allocation : le paiement n'a pas pu être validé par le serveur.";
        setSubmitError(errMsg);
        showToast('error', 'Erreur d\'Allocation', errMsg);
        return;
      }

      // Succès certifié par le serveur ORAX
      const callback = onSuccess || onSuccessPurchase;
      if (callback) {
        callback({
          name: data.serverName || serverName.trim() || `Serveur ${selectedPlan.name}`,
          runtime: serverRuntime,
          plan: selectedPlan,
          expiresAt: data.expiresAt || calculateExpirationDate(30).iso,
          daysRemaining: data.daysRemaining || 30,
          transactionId: data.transactionId || `TX-${verificationResult.operatorReference}`,
          paymentMethod: data.paymentMethod || verificationResult.operator,
        });
      }

      showToast(
        'success',
        'Serveur Déployé avec Succès !',
        `Paiement ${verificationResult.operator} certifié. Votre conteneur a été alloué pour 30 jours.`
      );
      onClose();
    } catch (err: any) {
      setStep('payment');
      const msg = "Erreur de connexion lors de l'allocation. Veuillez réessayer.";
      setSubmitError(msg);
      showToast('error', 'Erreur Réseau', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="w-full max-w-3xl my-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* En-tête */}
        <div className="p-4 sm:p-6 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center font-bold">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Commander un Serveur (Abonnement 1 Mois)
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                  30 Jours Inclus
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Isolation Cgroups v2 dédiée, paiement sécurisé avec vérification en temps réel.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Information Devise Officielle */}
        <div className="px-4 sm:px-6 py-2.5 bg-slate-950/40 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>Devise officielle de facturation :</span>
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 text-xs font-bold font-mono">
            Francs CFA (CFA)
          </span>
        </div>

        {/* Corps principal défilable */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* Indicateur d'étapes */}
          <div className="flex items-center justify-between text-xs font-mono pb-2 border-b border-slate-800">
            <button
              type="button"
              onClick={() => setStep('plan')}
              className={`flex items-center gap-1.5 ${step === 'plan' ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px]">1</span>
              <span>1. Choisir le Plan</span>
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <button
              type="button"
              onClick={() => setStep('configure')}
              className={`flex items-center gap-1.5 ${step === 'configure' ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px]">2</span>
              <span>2. Configuration</span>
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <div className={`flex items-center gap-1.5 ${step === 'payment' ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
              <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px]">3</span>
              <span>3. Paiement & Vérification</span>
            </div>
          </div>

          {/* ========================================================= */}
          {/* ÉTAPE 1 : CHOIX DU PLAN                                   */}
          {/* ========================================================= */}
          {step === 'plan' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-400">
                Sélectionnez l'offre adaptée à votre charge de travail :
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {SERVER_PLANS.map((plan) => {
                  const isSelected = selectedPlanId === plan.id;
                  return (
                    <div
                      key={plan.id}
                      onClick={() => {
                        setSelectedPlanId(plan.id);
                        // Réinitialiser la vérification si changement de plan
                        setVerificationResult(null);
                      }}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-950/40 shadow-lg shadow-indigo-950/50 ring-1 ring-indigo-500/80'
                          : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900/60'
                      }`}
                    >
                      {plan.badge && (
                        <div className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-indigo-600 text-white font-mono text-[9px] font-bold tracking-wider uppercase">
                          {plan.badge}
                        </div>
                      )}

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-white text-sm font-sans">
                            {plan.name}
                          </h4>
                          {plan.badge && (
                            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-slate-800 text-indigo-300">
                              {plan.badge}
                            </span>
                          )}
                        </div>

                        <div className="text-base font-extrabold text-white font-mono flex items-baseline gap-1">
                          <span>{formatPrice(plan.priceMonthlyCfa)}</span>
                          <span className="text-xs text-slate-400 font-normal">/ 30 jours</span>
                        </div>

                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          {plan.tagline}
                        </p>

                        <div className="grid grid-cols-3 gap-1.5 pt-2 text-[10px] font-mono text-slate-300 border-t border-slate-800/80">
                          <div className="flex items-center gap-1">
                            <Cpu className="w-3 h-3 text-indigo-400" />
                            <span>{plan.cpuLabel}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Zap className="w-3 h-3 text-emerald-400" />
                            <span>{plan.ramLabel}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <HardDrive className="w-3 h-3 text-sky-400" />
                            <span>{plan.diskLabel}</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 mt-3 border-t border-slate-800/50 flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-400">{plan.recommendedFor}</span>
                        {isSelected ? (
                          <span className="text-indigo-400 font-bold flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Sélectionné
                          </span>
                        ) : (
                          <span className="text-slate-500 group-hover:text-slate-300">Choisir</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setStep('configure')}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-sans font-bold text-xs shadow-md shadow-indigo-600/30 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <span>Configurer le serveur</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* ÉTAPE 2 : CONFIGURATION DU SERVEUR                        */}
          {/* ========================================================= */}
          {step === 'configure' && (
            <form onSubmit={handleNextToPayment} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white font-sans flex items-center gap-2">
                  <ServerIcon className="w-4 h-4 text-indigo-400" />
                  <span>Nom du Serveur ou Projet :</span>
                </label>
                <input
                  type="text"
                  value={serverName}
                  onChange={(e) => setServerName(e.target.value)}
                  placeholder={`Ex: Mon Bot ${selectedPlan.name.split(' ')[0]}`}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  required
                />
                <p className="text-[11px] text-slate-400 font-mono">
                  Identifiant affiché dans la console et vos logs d'exécution.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white font-sans">
                  Environnement d'exécution (Runtime) :
                </label>
                <select
                  value={serverRuntime}
                  onChange={(e) => setServerRuntime(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono cursor-pointer"
                >
                  <option value="Node.js 22 LTS">Node.js 22 LTS (Optimisé WhatsApp Baileys & Discord.js)</option>
                  <option value="Python 3.12">Python 3.12 (Bots Telegram, FastApi, IA)</option>
                  <option value="Node.js 20 LTS">Node.js 20 LTS</option>
                  <option value="Bun 1.1">Bun 1.1 Fast Runtime</option>
                </select>
              </div>

              {/* Récapitulatif technique des ressources */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-slate-300 text-[11px]">
                <div className="font-sans font-bold text-white pb-1 border-b border-slate-800">
                  Ressources VPS qui seront isolées pour vous :
                </div>
                <div className="flex justify-between">
                  <span>Plan souscrit :</span>
                  <span className="text-indigo-300 font-bold">{selectedPlan.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>CPU dédié (Cgroups v2) :</span>
                  <span className="text-white font-bold">{selectedPlan.cpuLabel}</span>
                </div>
                <div className="flex justify-between">
                  <span>Mémoire RAM garantie :</span>
                  <span className="text-emerald-400 font-bold">{selectedPlan.ramLabel}</span>
                </div>
                <div className="flex justify-between">
                  <span>Stockage SSD NVMe :</span>
                  <span className="text-white">{selectedPlan.diskLabel}</span>
                </div>
                <div className="flex justify-between">
                  <span>Durée initiale :</span>
                  <span className="text-amber-400 font-bold">1 Mois (30 jours) dès activation</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep('plan')}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-sans font-semibold text-xs cursor-pointer"
                >
                  Retour
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-sans font-bold text-xs shadow-md shadow-indigo-600/30 flex items-center gap-2 cursor-pointer transition-all"
                >
                  <span>Passer au Paiement ({formatPrice(selectedPlan.priceMonthlyCfa)})</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* ========================================================= */}
          {/* ÉTAPE 3 : PAIEMENT MOBILE MONEY & VÉRIFICATION STRICTE   */}
          {/* ========================================================= */}
          {step === 'payment' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h4 className="text-sm font-bold text-white">
                  3. Paiement Sécurisé & Vérification Passerelle
                </h4>
                <button
                  type="button"
                  onClick={() => setStep('configure')}
                  className="text-xs text-indigo-400 hover:underline font-mono cursor-pointer"
                >
                  ← Modifier configuration
                </button>
              </div>

              {/* Composant officiel des canaux de paiement (Orange Money 🇧🇫, Wave 🇧🇫, Airtel Money 🇨🇩, Telegram support) */}
              <PaymentChannels
                amountCfa={selectedPlan.priceMonthlyCfa}
                planId={selectedPlan.id}
                selectedChannelId={selectedChannelId}
                onSelectChannel={(chId) => {
                  setSelectedChannelId(chId);
                  setPaymentMethod('mobile_money');
                }}
                senderPhone={senderPhone}
                onChangeSenderPhone={setSenderPhone}
                transactionReference={transactionReference}
                onChangeTransactionReference={setTransactionReference}
                verificationResult={verificationResult}
                onVerificationChange={setVerificationResult}
                showWalletOption={true}
                walletBalanceCfa={effectiveWalletBalanceCfa}
                isUsingWallet={paymentMethod === 'wallet'}
                onUseWallet={() => {
                  setPaymentMethod((prev) => prev === 'wallet' ? 'mobile_money' : 'wallet');
                }}
              />

              {/* Message d'erreur de soumission si tentative échouée */}
              {submitError && (
                <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Récapitulatif de facturation */}
              <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 space-y-2 text-xs font-mono">
                <div className="flex justify-between text-slate-300">
                  <span>Serveur :</span>
                  <span className="text-white font-bold">{serverName || `Serveur ${selectedPlan.name}`}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Plan & Puissance :</span>
                  <span className="text-indigo-300 font-bold">{selectedPlan.name} ({selectedPlan.cpuLabel}, {selectedPlan.ramLabel})</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Durée d'hébergement :</span>
                  <span className="text-emerald-400 font-bold">1 Mois (30 Jours)</span>
                </div>
                <div className="pt-2 border-t border-indigo-500/30 flex justify-between text-sm">
                  <span className="font-bold text-white font-sans">Total à payer :</span>
                  <span className="font-extrabold text-indigo-400 font-mono text-base">
                    {formatPrice(selectedPlan.priceMonthlyCfa)}
                  </span>
                </div>
              </div>

              {/* Zone de Validation / Verrouillage Strict */}
              <div className="space-y-2 pt-2">
                {!verificationResult ? (
                  <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-300 text-xs flex items-center gap-2 font-mono">
                    <Lock className="w-4 h-4 shrink-0 text-amber-400" />
                    <span>Allocation verrouillée : vous devez d'abord lancer la vérification de votre transaction ci-dessus.</span>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-700 text-emerald-300 text-xs flex items-center gap-2 font-mono">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>Transaction certifiée conforme (Reçu {verificationResult.receiptNumber}). Vous pouvez allouer votre serveur.</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => setStep('configure')}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs cursor-pointer transition-colors"
                  >
                    Retour
                  </button>

                  <button
                    type="button"
                    onClick={handleExecutePayment}
                    disabled={!verificationResult || isSubmitting}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs font-mono shadow-lg transition-all ${
                      verificationResult
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30 cursor-pointer active:scale-95'
                        : 'bg-slate-800 text-slate-500 border border-slate-700/60 cursor-not-allowed opacity-60'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        <span>Création du Conteneur...</span>
                      </>
                    ) : verificationResult ? (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Allouer le Serveur Maintenant (Paiement Vérifié)</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>Allocation Bloquée (Paiement Non Vérifié)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* ÉTAPE 4 : TRAITEMENT & ACTIVATION DU SERVEUR               */}
          {/* ========================================================= */}
          {step === 'processing' && (
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full border-4 border-indigo-500/30 border-t-indigo-500 animate-spin mx-auto" />
              <div className="text-base font-bold text-white">
                Allocation et Isolation de votre conteneur ORAX...
              </div>
              <p className="text-xs text-slate-400 font-mono max-w-sm mx-auto">
                Paiement vérifié par la passerelle télécom. Création du volume persistant, isolation Cgroups v2 (RAM {selectedPlan.ramLabel}, CPU {selectedPlan.cpuLabel}) et enregistrement de l'échéance de 30 jours...
              </p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

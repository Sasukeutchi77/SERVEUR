import React, { useState } from 'react';
import { 
  X, 
  RotateCw, 
  Check, 
  Cpu, 
  HardDrive, 
  Zap, 
  ShieldCheck, 
  CreditCard, 
  Smartphone, 
  Coins, 
  Wallet, 
  Sparkles,
  ArrowUpRight,
  Clock,
  Lock,
  CheckCircle2,
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

interface ServerRenewModalProps {
  isOpen: boolean;
  onClose: () => void;
  serverName: string;
  currentPlanId?: string;
  currentExpiresAt?: string;
  daysRemaining?: number;
  onSuccessRenew: (renewData: {
    plan: ServerPlan;
    newExpiresAt: string;
    newDaysRemaining: number;
    transactionId: string;
  }) => void;
  userWalletBalanceCfa?: number;
  userWalletBalanceUsd?: number;
}

export const ServerRenewModal: React.FC<ServerRenewModalProps> = ({
  isOpen,
  onClose,
  serverName,
  currentPlanId = 'standard-2.5',
  currentExpiresAt,
  daysRemaining = 28,
  onSuccessRenew,
  userWalletBalanceCfa,
  userWalletBalanceUsd = 3500,
}) => {
  const effectiveWalletBalanceCfa = userWalletBalanceCfa !== undefined
    ? userWalletBalanceCfa
    : (userWalletBalanceUsd >= 500 ? userWalletBalanceUsd : Math.round(userWalletBalanceUsd * 660));
  const { showToast } = useToast();

  const [selectedPlanId, setSelectedPlanId] = useState<string>(currentPlanId);
  const [paymentMethod, setPaymentMethod] = useState<'mobile_money' | 'wallet'>('mobile_money');
  const [selectedChannelId, setSelectedChannelId] = useState<string>('bf-orange');
  const [senderPhone, setSenderPhone] = useState<string>('');
  const [transactionReference, setTransactionReference] = useState<string>('');
  const [verificationResult, setVerificationResult] = useState<PaymentVerificationResult | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [renewError, setRenewError] = useState<string | null>(null);

  const selectedPlan = SERVER_PLANS.find((p) => p.id === selectedPlanId) || SERVER_PLANS[1];
  const isUpgrade = selectedPlanId !== currentPlanId;

  if (!isOpen) return null;

  const handleConfirmRenew = async () => {
    if (!verificationResult || !verificationResult.verificationToken) {
      showToast('error', 'Paiement Non Vérifié', 'Veuillez vérifier votre transaction de renouvellement avant de valider.');
      return;
    }

    setRenewError(null);
    setIsProcessing(true);

    try {
      const response = await fetch('/api/v1/billing/renew', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serverId: serverName,
          planId: selectedPlan.id,
          verificationToken: verificationResult.verificationToken,
          paymentMethod: verificationResult.operator,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        const msg = data.error || 'Erreur lors du renouvellement : paiement non certifié.';
        setRenewError(msg);
        showToast('error', 'Échec du Renouvellement', msg);
        setIsProcessing(false);
        return;
      }

      const newDays = 30 + Math.max(0, daysRemaining);
      const newExpiration = calculateExpirationDate(newDays);

      onSuccessRenew({
        plan: selectedPlan,
        newExpiresAt: data.newExpiresAt || newExpiration.iso,
        newDaysRemaining: newDays,
        transactionId: data.transactionId || `RNW-${verificationResult.operatorReference}`,
      });

      showToast(
        'success',
        isUpgrade ? 'Plan Amélioré & Renouvelé !' : 'Serveur Renouvelé pour 30 Jours !',
        `Paiement ${verificationResult.operator} certifié. Nouvelle date d'expiration : ${newExpiration.formatted}.`
      );
      setIsProcessing(false);
      onClose();
    } catch (err: any) {
      const msg = 'Erreur réseau lors du renouvellement. Veuillez vérifier votre connexion.';
      setRenewError(msg);
      showToast('error', 'Erreur Réseau', msg);
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="w-full max-w-xl my-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* En-tête */}
        <div className="p-4 sm:p-5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-600/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold">
              <RotateCw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Renouveler le Serveur (1 Mois / 30 Jours)
              </h3>
              <p className="text-xs text-slate-400">
                Prolongez l'hébergement 24h/24 de <strong className="text-white">{serverName}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corps */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          
          {/* État actuel de l'abonnement */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono">
            <div>
              <span className="text-slate-400">Temps restant actuel :</span>
              <div className="font-bold text-white flex items-center gap-1.5 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>{daysRemaining} jours restants</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-slate-400">Après renouvellement :</span>
              <div className="font-bold text-emerald-400 mt-0.5">
                +{30} jours ({daysRemaining + 30} jours)
              </div>
            </div>
          </div>

          {/* Choix du plan (Prolongation ou Upgrade) */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-white flex items-center justify-between">
              <span>Choisir la formule de renouvellement :</span>
              {isUpgrade && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-800">
                  Upgrade de puissance
                </span>
              )}
            </label>

            <div className="space-y-2">
              {SERVER_PLANS.map((plan) => {
                const isSelected = selectedPlanId === plan.id;
                return (
                  <div
                    key={plan.id}
                    onClick={() => {
                      setSelectedPlanId(plan.id);
                      setVerificationResult(null);
                    }}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-950/40 ring-1 ring-indigo-500/80 shadow-md'
                        : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-slate-600'}`}>
                        {isSelected && <Check className="w-2.5 h-2.5" />}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white font-sans flex items-center gap-2">
                          <span>{plan.name}</span>
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-indigo-300">
                            {plan.badge || plan.cpuLabel}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {plan.cpuLabel} • {plan.ramLabel} • {plan.diskLabel}
                        </div>
                      </div>
                    </div>

                    <div className="text-right font-mono shrink-0">
                      <div className="font-bold text-white text-sm">
                        {formatPrice(plan.priceMonthlyCfa)}
                      </div>
                      <div className="text-[10px] text-slate-400">/ 30 jours</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Canaux de paiement officiels (Burkina Faso, Congo RDC, support Telegram) avec vérification */}
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
              setPaymentMethod((prev) => (prev === 'wallet' ? 'mobile_money' : 'wallet'));
            }}
          />

          {/* Erreur de renouvellement */}
          {renewError && (
            <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{renewError}</span>
            </div>
          )}

          {/* Récapitulatif */}
          <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/30 flex items-center justify-between text-xs font-mono">
            <div>
              <span className="text-slate-400">Total à régler :</span>
              <div className="text-base font-extrabold text-white">
                {formatPrice(selectedPlan.priceMonthlyCfa)}
              </div>
            </div>
            <div className="text-right text-[11px] text-indigo-300">
              Durée ajoutée : <strong>+30 jours</strong>
            </div>
          </div>

          {/* Verrouillage strict */}
          <div className="space-y-2 pt-1">
            {!verificationResult ? (
              <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-300 text-xs flex items-center gap-2 font-mono">
                <Lock className="w-4 h-4 shrink-0 text-amber-400" />
                <span>Renouvellement verrouillé : veuillez d'abord vérifier votre transaction de paiement.</span>
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-emerald-950/50 border border-emerald-700 text-emerald-300 text-xs flex items-center gap-2 font-mono">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>Paiement certifié (Réf {verificationResult.receiptNumber}). Vous pouvez confirmer le renouvellement.</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
              >
                Annuler
              </button>

              <button
                type="button"
                onClick={handleConfirmRenew}
                disabled={!verificationResult || isProcessing}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs font-mono shadow-lg transition-all ${
                  verificationResult
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30 cursor-pointer active:scale-95'
                    : 'bg-slate-800 text-slate-500 border border-slate-700/60 cursor-not-allowed opacity-60'
                }`}
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    <span>Renouvellement en cours...</span>
                  </>
                ) : verificationResult ? (
                  <>
                    <RotateCw className="w-4 h-4" />
                    <span>Confirmer le Renouvellement (+30j)</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Paiement Non Vérifié</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

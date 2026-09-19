import React, { useState, useEffect } from 'react';
import { 
  Send, 
  Smartphone, 
  Lock, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  ExternalLink, 
  ShieldCheck, 
  AlertCircle, 
  Wallet,
  Sparkles,
  Search,
  CheckCircle2,
  RefreshCw,
  Clock,
  KeyRound,
  FileCheck
} from 'lucide-react';
import { useToast } from '../ui/Toast.tsx';
import type { PaymentVerificationResult } from '../../types/payment.ts';

export interface MobilePaymentChannel {
  id: string;
  country: 'Burkina Faso' | 'Congo (RDC)';
  countryCode: '+226' | '+243';
  flag: string;
  operator: 'Orange Money' | 'Wave' | 'Airtel Money';
  rawNumber: string;
  maskedNumber: string;
  currencyLabel: string;
  cfaRate: number; // Taux par rapport au CFA (1 pour FCFA)
  exampleRef: string;
}

export const OFFICIAL_PAYMENT_CHANNELS: MobilePaymentChannel[] = [
  {
    id: 'bf-orange',
    country: 'Burkina Faso',
    countryCode: '+226',
    flag: '🇧🇫',
    operator: 'Orange Money',
    rawNumber: '+22607603281',
    maskedNumber: '+226 07 •• •• 81',
    currencyLabel: 'FCFA',
    cfaRate: 1,
    exampleRef: 'OM.240919.1432.B892',
  },
  {
    id: 'bf-wave',
    country: 'Burkina Faso',
    countryCode: '+226',
    flag: '🇧🇫',
    operator: 'Wave',
    rawNumber: '+22607603281',
    maskedNumber: '+226 07 •• •• 81',
    currencyLabel: 'FCFA',
    cfaRate: 1,
    exampleRef: 'WV-8924190823',
  },
  {
    id: 'rdc-airtel',
    country: 'Congo (RDC)',
    countryCode: '+243',
    flag: '🇨🇩',
    operator: 'Airtel Money',
    rawNumber: '+243978972727',
    maskedNumber: '+243 97 •• •• 27',
    currencyLabel: 'CDF',
    cfaRate: 4.5,
    exampleRef: 'AT2409199812',
  },
];

export const TELEGRAM_SUPPORT_URL = 'https://t.me/+c4H1DfKJPiY5MTQ0';

interface PaymentChannelsProps {
  amountCfa?: number;
  amountUsd?: number;
  planId?: string;
  selectedChannelId: string;
  onSelectChannel: (channelId: string) => void;
  senderPhone: string;
  onChangeSenderPhone: (phone: string) => void;
  transactionReference?: string;
  onChangeTransactionReference?: (ref: string) => void;
  verificationResult?: PaymentVerificationResult | null;
  onVerificationChange?: (result: PaymentVerificationResult | null) => void;
  showWalletOption?: boolean;
  walletBalanceCfa?: number;
  walletBalanceUsd?: number;
  onUseWallet?: () => void;
  isUsingWallet?: boolean;
}

export const PaymentChannels: React.FC<PaymentChannelsProps> = ({
  amountCfa,
  amountUsd,
  planId = 'standard-2.5',
  selectedChannelId,
  onSelectChannel,
  senderPhone,
  onChangeSenderPhone,
  transactionReference: propTransactionRef,
  onChangeTransactionReference,
  verificationResult: propVerificationResult,
  onVerificationChange,
  showWalletOption = false,
  walletBalanceCfa,
  walletBalanceUsd,
  onUseWallet,
  isUsingWallet = false,
}) => {
  const effectiveAmountCfa = amountCfa || (amountUsd && amountUsd >= 500 ? amountUsd : (amountUsd ? Math.round(amountUsd * 660) : 1650));
  const effectiveWalletBalanceCfa = walletBalanceCfa !== undefined ? walletBalanceCfa : (walletBalanceUsd && walletBalanceUsd >= 500 ? walletBalanceUsd : (walletBalanceUsd ? Math.round(walletBalanceUsd * 660) : 0));
  const { showToast } = useToast();
  const [showMaskedNumber, setShowMaskedNumber] = useState<boolean>(false);
  const [copiedChannelId, setCopiedChannelId] = useState<string | null>(null);

  // État local de la référence de transaction si non contrôlé par le parent
  const [localTxRef, setLocalTxRef] = useState<string>(propTransactionRef || '');
  const activeTxRef = propTransactionRef !== undefined ? propTransactionRef : localTxRef;

  const setTxRef = (val: string) => {
    if (onChangeTransactionReference) {
      onChangeTransactionReference(val);
    } else {
      setLocalTxRef(val);
    }
    // Si l'utilisateur modifie la référence après une vérification réussie, on invalide la vérification
    if (activeVerification) {
      if (onVerificationChange) onVerificationChange(null);
      setLocalVerification(null);
    }
  };

  // État de vérification
  const [localVerification, setLocalVerification] = useState<PaymentVerificationResult | null>(null);
  const activeVerification = propVerificationResult !== undefined ? propVerificationResult : localVerification;

  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [verificationStepText, setVerificationStepText] = useState<string>('');

  const currentChannel = OFFICIAL_PAYMENT_CHANNELS.find((c) => c.id === selectedChannelId) || OFFICIAL_PAYMENT_CHANNELS[0];
  const localPrice = Math.round(effectiveAmountCfa * currentChannel.cfaRate);

  // Pré-remplir l'indicatif téléphonique si le champ est vide
  useEffect(() => {
    if (!isUsingWallet && (!senderPhone || senderPhone.trim() === '')) {
      onChangeSenderPhone(currentChannel.countryCode + ' ');
    }
  }, [selectedChannelId, isUsingWallet]);

  const handleCopyNumber = (channel: MobilePaymentChannel) => {
    navigator.clipboard.writeText(channel.rawNumber);
    setCopiedChannelId(channel.id);
    showToast('success', 'Numéro copié', `Numéro officiel ${channel.operator} (${channel.rawNumber}) copié.`);
    setTimeout(() => setCopiedChannelId(null), 2500);
  };

  // Lancement de la VRAIE vérification auprès du serveur ORAX
  const handleVerifyPayment = async () => {
    setVerificationError(null);
    setIsVerifying(true);
    setVerificationStepText('1/3 Interrogation de la passerelle télécom...');

    try {
      // Petite temporisation visuelle pour refléter le ping réseau réel de la passerelle
      await new Promise((r) => setTimeout(r, 600));
      setVerificationStepText('2/3 Contrôle d\'authenticité du SMS & signature...');
      await new Promise((r) => setTimeout(r, 600));
      setVerificationStepText('3/3 Analyse anti-rejeu et validation du montant...');

      const response = await fetch('/api/v1/billing/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          channelId: isUsingWallet ? 'wallet' : selectedChannelId,
          paymentMethod: isUsingWallet ? 'wallet' : 'mobile_money',
          amountCfa: effectiveAmountCfa,
          amountUsd: effectiveAmountCfa,
          senderPhone: isUsingWallet ? 'ORAX_WALLET' : senderPhone.trim(),
          transactionReference: isUsingWallet ? 'WALLET_DEBIT' : activeTxRef.trim(),
          walletBalanceCfa: effectiveWalletBalanceCfa,
          walletBalanceUsd: effectiveWalletBalanceCfa,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        const errMsg = data.error || 'Vérification du paiement échouée. Veuillez vérifier les informations saisies.';
        setVerificationError(errMsg);
        if (onVerificationChange) onVerificationChange(null);
        setLocalVerification(null);
        showToast('error', 'Paiement Non Vérifié', errMsg);
      } else {
        const result: PaymentVerificationResult = {
          success: true,
          verificationToken: data.verificationToken,
          receiptNumber: data.receiptNumber,
          operator: data.operator,
          country: data.country,
          senderPhone: data.senderPhone,
          operatorReference: data.operatorReference,
          amountPaid: data.amountPaid,
          currency: data.currency,
          verifiedAt: data.verifiedAt,
          status: 'VERIFIED',
        };

        if (onVerificationChange) onVerificationChange(result);
        setLocalVerification(result);
        setVerificationError(null);
        showToast(
          'success',
          'Paiement Vérifié avec Succès !',
          `Reçu officiel ${data.receiptNumber} validé. L'allocation de votre serveur est maintenant autorisée.`
        );
      }
    } catch (err: any) {
      const netError = 'Erreur réseau lors de la communication avec la passerelle de vérification. Vérifiez votre connexion.';
      setVerificationError(netError);
      if (onVerificationChange) onVerificationChange(null);
      setLocalVerification(null);
      showToast('error', 'Erreur Passerelle', netError);
    } finally {
      setIsVerifying(false);
      setVerificationStepText('');
    }
  };

  return (
    <div className="space-y-4">
      {/* ========================================================================= */}
      {/* MESSAGE & BANNIÈRE DE SUPPORT TELEGRAM OFFICIEL */}
      {/* ========================================================================= */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/70 via-slate-900 to-sky-950/60 border border-sky-500/30 shadow-lg space-y-3">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-sky-500/20 text-sky-400 shrink-0 mt-0.5 border border-sky-500/30">
            <Send className="w-5 h-5" />
          </div>
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-400 font-mono">
                Support & Assistance Directe
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-900/60 text-sky-300 border border-sky-700/50">
                Aide 24/7
              </span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed font-sans">
              « Il faut choisir le moyen de paiement que vous utilisez. En cas de problème ou si vous n'avez pas l'un des moyens de paiement qui sont présents ici, il faut rejoindre notre groupe Télégram, vous allez être aidé là-bas : »
            </p>
          </div>
        </div>

        {/* Bouton direct vers le groupe Telegram officiel */}
        <div className="pt-1 flex items-center justify-end">
          <a
            href={TELEGRAM_SUPPORT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 active:scale-95 text-slate-950 font-bold text-xs shadow-md shadow-sky-500/25 transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Rejoindre le Groupe Telegram Support</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </a>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SÉLECTEUR DES SYSTÈMES DE PAIEMENT : BURKINA FASO & CONGO (RDC) */}
      {/* ========================================================================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-white flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>1. Sélectionnez le système de paiement utilisé :</span>
          </label>
          <span className="text-[11px] text-slate-400 font-mono">
            Vérification passerelle obligatoire
          </span>
        </div>

        {/* Grille des opérateurs officiels */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {OFFICIAL_PAYMENT_CHANNELS.map((ch) => {
            const isSelected = !isUsingWallet && selectedChannelId === ch.id;
            return (
              <button
                key={ch.id}
                type="button"
                onClick={() => {
                  if (isUsingWallet && onUseWallet) {
                    onUseWallet();
                  }
                  onSelectChannel(ch.id);
                  // Réinitialiser la vérification si changement de canal
                  if (activeVerification && onVerificationChange) {
                    onVerificationChange(null);
                  }
                  setLocalVerification(null);
                  setVerificationError(null);
                }}
                className={`p-3 rounded-2xl border text-left transition-all relative cursor-pointer ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-950/40 text-white ring-1 ring-emerald-500/80 shadow-lg shadow-emerald-950/50'
                    : 'border-slate-800 bg-slate-950/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-base">{ch.flag}</span>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                    {ch.country}
                  </span>
                </div>

                <div className="text-xs font-bold text-white font-sans">{ch.operator}</div>

                {/* Numéro masqué sécurisé */}
                <div className="text-[11px] font-mono text-emerald-400 mt-1 flex items-center gap-1">
                  <Lock className="w-3 h-3 shrink-0 text-emerald-500" />
                  <span>{showMaskedNumber ? ch.rawNumber : ch.maskedNumber}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Option Solde Portefeuille si disponible */}
        {showWalletOption && (
          <div className="pt-1">
            <button
              type="button"
              onClick={() => {
                if (onUseWallet) onUseWallet();
                if (onVerificationChange) onVerificationChange(null);
                setLocalVerification(null);
                setVerificationError(null);
              }}
              className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                isUsingWallet
                  ? 'border-indigo-500 bg-indigo-950/40 text-white ring-1 ring-indigo-500/80'
                  : 'border-slate-800 bg-slate-950/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Wallet className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white font-sans">
                    Utiliser le solde de mon Portefeuille ORAX
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Solde disponible : <strong className="text-indigo-300">{effectiveWalletBalanceCfa.toLocaleString('fr-FR')} CFA</strong>
                  </div>
                </div>
              </div>

              <div className="text-right">
                {effectiveWalletBalanceCfa >= effectiveAmountCfa ? (
                  <span className="text-[11px] text-emerald-400 font-bold px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-800">
                    ✓ Solde suffisant ({effectiveAmountCfa.toLocaleString('fr-FR')} CFA)
                  </span>
                ) : (
                  <span className="text-[11px] text-amber-400 font-bold px-2.5 py-1 rounded-full bg-amber-950/80 border border-amber-800">
                    ⚠️ Insuffisant (Recharge requise)
                  </span>
                )}
              </div>
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* CAS PORTFEUILLE ORAX : VÉRIFICATION ET AUTORISATION DE DÉBIT */}
      {/* ========================================================================= */}
      {isUsingWallet && (
        <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/40 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-indigo-400" />
              <span>Autorisation de débit du Portefeuille</span>
            </span>
            <span className="text-xs font-mono text-indigo-300">
              Montant : {effectiveAmountCfa.toLocaleString('fr-FR')} CFA
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            Le montant sera directement débité de votre solde interne sans passer par un opérateur mobile externe.
          </p>

          {effectiveWalletBalanceCfa < effectiveAmountCfa ? (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/80 text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>Votre solde ({effectiveWalletBalanceCfa.toLocaleString('fr-FR')} CFA) est insuffisant pour ce plan ({effectiveAmountCfa.toLocaleString('fr-FR')} CFA). Veuillez basculer sur Mobile Money ou recharger votre compte.</span>
            </div>
          ) : activeVerification ? (
            <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-700/80 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Débit Portefeuille Pré-Approuvé & Certifié</span>
              </div>
              <div className="text-[11px] font-mono text-slate-300 flex items-center justify-between">
                <span>Réf Reçu : {activeVerification.receiptNumber}</span>
                <span className="text-emerald-400 font-bold">Autorisation Active</span>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleVerifyPayment}
              disabled={isVerifying}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold font-mono shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isVerifying ? (
                <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <ShieldCheck className="w-4 h-4" />
              )}
              <span>Vérifier et Pré-Approuver le Débit Portefeuille</span>
            </button>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* CAS MOBILE MONEY : NUMÉRO MARCHAND, ÉMETTEUR & RÉFÉRENCE TRANSACTION SMS */}
      {/* ========================================================================= */}
      {!isUsingWallet && (
        <div className="space-y-4">
          {/* Étape A : Numéro marchand et montant à envoyer */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/90 space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xl">{currentChannel.flag}</span>
                <div>
                  <span className="text-xs font-bold text-white font-sans">
                    {currentChannel.operator} — {currentChannel.country}
                  </span>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Envoyez exactement le montant ci-contre
                  </div>
                </div>
              </div>

              {/* Montant converti officiel */}
              <div className="text-right">
                <div className="text-sm sm:text-base font-extrabold text-emerald-400 font-mono">
                  {localPrice.toLocaleString('fr-FR')} {currentChannel.currencyLabel}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  (Période : 30 jours)
                </div>
              </div>
            </div>

            {/* Numéro marchand sécurisé avec bouton copier */}
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="space-y-0.5">
                <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Numéro Marchand Officiel de Réception :</span>
                </div>
                <div className="text-sm font-bold font-mono text-white flex items-center gap-2">
                  <span>{showMaskedNumber ? currentChannel.rawNumber : currentChannel.maskedNumber}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-sans font-normal">
                    ORAX Vérifié
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowMaskedNumber(!showMaskedNumber)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-mono flex items-center gap-1 transition-colors cursor-pointer"
                  title={showMaskedNumber ? 'Masquer le numéro' : 'Afficher le numéro'}
                >
                  {showMaskedNumber ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showMaskedNumber ? 'Masquer' : 'Afficher'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCopyNumber(currentChannel)}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40 text-[11px] font-mono font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Copier le numéro officiel"
                >
                  {copiedChannelId === currentChannel.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copié !</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copier le numéro</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Étape B : FORMULAIRE DE VÉRIFICATION OBLIGATOIRE ANTI-CONTOURNEMENT */}
          <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
            activeVerification 
              ? 'bg-emerald-950/20 border-emerald-600/70 ring-1 ring-emerald-500/30' 
              : 'bg-slate-950 border-indigo-500/40 ring-1 ring-indigo-500/20 shadow-lg shadow-indigo-950/20'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-xs sm:text-sm font-bold text-white font-sans">
                  2. Vérification Obligatoire de votre Transaction
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800">
                Anti-Fraude Actif
              </span>
            </div>

            <div className="space-y-3.5 mt-3 text-xs">
              {/* Champ 1 : Numéro Émetteur (Obligatoire) */}
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold flex items-center justify-between">
                  <span>Numéro de téléphone émetteur de l'envoi :</span>
                  <span className="text-rose-400 font-mono text-[10px]">* Obligatoire</span>
                </label>
                <input
                  type="tel"
                  value={senderPhone}
                  onChange={(e) => {
                    onChangeSenderPhone(e.target.value);
                    if (activeVerification && onVerificationChange) onVerificationChange(null);
                    setLocalVerification(null);
                  }}
                  placeholder={`Ex: ${currentChannel.countryCode} 70 12 34 56`}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 font-mono focus:outline-none focus:border-emerald-500 transition-colors"
                />
                <p className="text-[11px] text-slate-400 font-mono">
                  Le numéro avec lequel vous avez effectué le transfert vers le marchand.
                </p>
              </div>

              {/* Champ 2 : Référence / ID de Transaction Opérateur (SMS) (Obligatoire) */}
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold flex items-center justify-between">
                  <span>Référence / ID de transaction opérateur (reçu par SMS) :</span>
                  <span className="text-rose-400 font-mono text-[10px]">* Obligatoire</span>
                </label>
                <input
                  type="text"
                  value={activeTxRef}
                  onChange={(e) => setTxRef(e.target.value)}
                  placeholder={`Ex: ${currentChannel.exampleRef}`}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 font-mono uppercase tracking-wider focus:outline-none focus:border-emerald-500 transition-colors"
                />
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>Code SMS de confirmation envoyé par {currentChannel.operator}</span>
                  <span className="text-indigo-400">Usage unique</span>
                </div>
              </div>

              {/* Message d'erreur de vérification */}
              {verificationError && (
                <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                  <div className="space-y-0.5">
                    <div className="font-bold">Échec de la validation de paiement :</div>
                    <div className="text-[11px] text-rose-200">{verificationError}</div>
                  </div>
                </div>
              )}

              {/* Confirmation de vérification réussie */}
              {activeVerification && (
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-600/80 space-y-2.5 animate-in fade-in">
                  <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Paiement Vérifié & Authentifié par la Passerelle ORAX</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-300 pt-1 border-t border-emerald-900/60">
                    <div>
                      <span className="text-slate-400">Reçu N° : </span>
                      <strong className="text-white">{activeVerification.receiptNumber}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Réf Opérateur : </span>
                      <strong className="text-indigo-300">{activeVerification.operatorReference}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Opérateur : </span>
                      <strong className="text-emerald-400">{activeVerification.operator} ({activeVerification.country})</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Montant Certifié : </span>
                      <strong className="text-emerald-400">{Math.round(activeVerification.amountPaid).toLocaleString('fr-FR')} CFA</strong>
                    </div>
                  </div>
                  <div className="text-[10px] text-emerald-400/90 font-mono">
                    ✓ Autorisation d'allocation active (Valide 15 min). Vous pouvez maintenant finaliser l'allocation ci-dessous.
                  </div>
                </div>
              )}

              {/* Bouton de déclenchement de vérification */}
              {!activeVerification && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleVerifyPayment}
                    disabled={isVerifying || !senderPhone.trim() || !activeTxRef.trim()}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs font-mono shadow-md shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    {isVerifying ? (
                      <>
                        <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        <span>{verificationStepText || 'Vérification de la transaction...'}</span>
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4" />
                        <span>Lancer la Vérification du Paiement Mobile Money</span>
                      </>
                    )}
                  </button>

                  <p className="text-center text-[10px] text-slate-400 mt-2 font-mono">
                    ⚠️ Le bouton de finalisation reste strictement verrouillé tant que le paiement n'a pas été certifié.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

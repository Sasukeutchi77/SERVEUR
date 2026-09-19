import React, { useState } from 'react';
import { 
  CreditCard, 
  Coins, 
  Zap, 
  Cpu, 
  HardDrive, 
  Check, 
  ShieldCheck, 
  Clock, 
  RotateCw, 
  Plus, 
  Wallet, 
  Smartphone, 
  CheckCircle2, 
  Sparkles,
  Server as ServerIcon,
  ChevronRight,
  TrendingUp,
  Receipt,
  Download,
  Lock,
  AlertTriangle
} from 'lucide-react';
import type { PaymentVerificationResult } from '../../types/payment.ts';
import { 
  SERVER_PLANS, 
  ServerPlan, 
  formatPrice 
} from '../../data/serverPlans.ts';
import type { ServerItem } from './ServerDetailView.tsx';
import { useToast } from '../ui/Toast.tsx';
import { PaymentChannels, OFFICIAL_PAYMENT_CHANNELS } from '../billing/PaymentChannels.tsx';

interface BillingPlansViewProps {
  servers: ServerItem[];
  walletBalanceCfa?: number;
  walletBalanceUsd?: number;
  onOpenPurchaseModal?: (planId?: string) => void;
  onSelectPlan?: (planId?: string) => void;
  onOpenRenewModal?: (server: ServerItem) => void;
  onRenewServer?: (server: ServerItem) => void;
  onRechargeWallet: (amountCfa: number) => void;
}

interface InvoiceRecord {
  id: string;
  serverName: string;
  planName: string;
  amountCfa: number;
  date: string;
  method: string;
  status: 'PAYÉ' | 'EN_COURS';
}

export const BillingPlansView: React.FC<BillingPlansViewProps> = ({
  servers,
  walletBalanceCfa,
  walletBalanceUsd = 3500,
  onOpenPurchaseModal,
  onSelectPlan,
  onOpenRenewModal,
  onRenewServer,
  onRechargeWallet,
}) => {
  const { showToast } = useToast();

  const handlePurchase = (planId?: string) => {
    if (typeof onOpenPurchaseModal === 'function') {
      onOpenPurchaseModal(planId);
    } else if (typeof onSelectPlan === 'function') {
      onSelectPlan(planId);
    }
  };

  const handleRenew = (server: ServerItem) => {
    if (typeof onOpenRenewModal === 'function') {
      onOpenRenewModal(server);
    } else if (typeof onRenewServer === 'function') {
      onRenewServer(server);
    }
  };
  const effectiveWalletCfa = walletBalanceCfa !== undefined
    ? walletBalanceCfa
    : (walletBalanceUsd >= 500 ? walletBalanceUsd : Math.round(walletBalanceUsd * 660));

  const [showRechargeModal, setShowRechargeModal] = useState<boolean>(false);
  const [rechargeAmount, setRechargeAmount] = useState<number>(1650);
  const [rechargeChannelId, setRechargeChannelId] = useState<string>('bf-orange');
  const [rechargeSenderPhone, setRechargeSenderPhone] = useState<string>('');
  const [rechargeTxRef, setRechargeTxRef] = useState<string>('');
  const [rechargeVerificationResult, setRechargeVerificationResult] = useState<PaymentVerificationResult | null>(null);

  // Historique réaliste de facturation en CFA
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([
    {
      id: 'INV-2026-9812',
      serverName: 'LORD (WhatsApp Bot)',
      planName: 'Standard Baileys (1 650 CFA/m)',
      amountCfa: 1650,
      date: '18 Sept 2026',
      method: 'Orange Money (Burkina Faso)',
      status: 'PAYÉ',
    },
    {
      id: 'INV-2026-8741',
      serverName: 'Telegram Crypto Bot',
      planName: 'Starter Eco (1 300 CFA/m)',
      amountCfa: 1300,
      date: '12 Sept 2026',
      method: 'Wave (Burkina Faso)',
      status: 'PAYÉ',
    },
    {
      id: 'INV-2026-7650',
      serverName: 'Discord Modération',
      planName: 'Plus Turbo (3 300 CFA/m)',
      amountCfa: 3300,
      date: '05 Sept 2026',
      method: 'Airtel Money (Congo RDC)',
      status: 'PAYÉ',
    },
  ]);

  const handleConfirmRecharge = (e: React.FormEvent) => {
    e.preventDefault();

    if (!rechargeVerificationResult) {
      showToast('error', 'Recharge Non Vérifiée', 'Veuillez vérifier votre transaction de recharge auprès de votre opérateur.');
      return;
    }

    onRechargeWallet(rechargeAmount);

    const methodStr = `${rechargeVerificationResult.operator} (${rechargeVerificationResult.country})`;

    const newInvoice: InvoiceRecord = {
      id: rechargeVerificationResult.receiptNumber || `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      serverName: 'Recharge Portefeuille ORAX',
      planName: `Crédit Compte (+${formatPrice(rechargeAmount)})`,
      amountCfa: rechargeAmount,
      date: 'Aujourd\'hui',
      method: methodStr,
      status: 'PAYÉ',
    };
    setInvoices((prev) => [newInvoice, ...prev]);

    showToast(
      'success',
      'Portefeuille Rechargé !',
      `+${formatPrice(rechargeAmount)} validés via ${methodStr}. Transaction certifiée ${rechargeVerificationResult.operatorReference}.`
    );
    setRechargeVerificationResult(null);
    setRechargeTxRef('');
    setShowRechargeModal(false);
  };

  const totalMonthlySpend = servers.reduce((acc, s) => acc + (s.monthlyPriceCfa || (s.monthlyPriceUsd && s.monthlyPriceUsd > 100 ? s.monthlyPriceUsd : 1650)), 0);

  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-in fade-in">
      
      {/* 1. En-tête avec Solde & Switcher de devise */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-indigo-600/30 text-indigo-400">
              <CreditCard className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Boutique Serveurs & Facturation
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
            Abonnements serveurs mensuels (30 jours) à partir de 1 300 CFA/mois. Puissance proportionnelle, isolation Cgroups v2 et Watchdog anti-crash 24h/24.
          </p>
        </div>

        {/* Portefeuille et Devise Officielle */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          
          {/* Badge Devise Officielle */}
          <div className="flex items-center gap-2 bg-slate-950/80 px-3.5 py-2 rounded-2xl border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold font-mono text-slate-300">Devise : FCFA (CFA)</span>
          </div>

          {/* Solde Portefeuille */}
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between sm:justify-start gap-4">
            <div>
              <div className="text-[10px] font-mono uppercase text-slate-400">Solde Portefeuille</div>
              <div className="text-sm font-bold text-emerald-400 font-mono">
                {formatPrice(effectiveWalletCfa)}
              </div>
            </div>
            <button
              onClick={() => setShowRechargeModal(true)}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold font-mono shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Recharger</span>
            </button>
          </div>

        </div>
      </div>

      {/* 2. Résumé des Métriques Financières aéré */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/80 border border-slate-800/90 flex items-center gap-4 shadow-sm hover:border-slate-700 transition-colors">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-bold shrink-0">
            <ServerIcon className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <div className="text-xs text-slate-400 font-mono">Serveurs Actifs</div>
            <div className="text-2xl font-black text-white font-mono tracking-tight">
              {servers.length} serveurs
            </div>
            <div className="text-[11px] text-emerald-400 font-mono flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{servers.filter(s => s.status === 'ONLINE').length} en ligne 24h/24</span>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/80 border border-slate-800/90 flex items-center gap-4 shadow-sm hover:border-slate-700 transition-colors">
          <div className="w-14 h-14 rounded-2xl bg-amber-600/20 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold shrink-0">
            <TrendingUp className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <div className="text-xs text-slate-400 font-mono">Coût Mensuel Total</div>
            <div className="text-2xl font-black text-white font-mono tracking-tight">
              {formatPrice(totalMonthlySpend)}
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              Cycle de 30 jours par instance
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/80 border border-slate-800/90 flex items-center gap-4 shadow-sm hover:border-slate-700 transition-colors">
          <div className="w-14 h-14 rounded-2xl bg-cyan-600/20 border border-cyan-500/30 text-cyan-400 flex items-center justify-center font-bold shrink-0">
            <Clock className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <div className="text-xs text-slate-400 font-mono">Prochaine Échéance</div>
            <div className="text-2xl font-black text-white font-mono tracking-tight">
              Dans 28 jours
            </div>
            <div className="text-[11px] text-cyan-400 font-mono">
              Renouvellement en 1 clic
            </div>
          </div>
        </div>
      </div>

      {/* 3. GRILLE COMPLÈTE DES FORMULES DE SERVEURS (CFA) */}
      <div className="space-y-6 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
              <span>Formules d'Hébergement Disponibles</span>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-indigo-950/80 text-indigo-400 border border-indigo-800/80">
                1 Mois (30 Jours)
              </span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">
              Choisissez le niveau de puissance adapté à vos bots. Tarifs exclusivement en Francs CFA (Mobile Money & Portefeuille).
            </p>
          </div>

          <button
            onClick={() => handlePurchase('standard-2.5')}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold font-mono shadow-lg shadow-indigo-600/30 transition-all self-start sm:self-auto active:scale-95 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Déployer un Serveur</span>
          </button>
        </div>

        {/* Cartes des plans bien aérées et modernes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVER_PLANS.map((plan) => {
            const isPopular = plan.id === 'standard-2.5';

            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl p-6 sm:p-7 border flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 shadow-xl ${
                  isPopular
                    ? 'border-indigo-500/80 shadow-indigo-500/20 ring-1 ring-indigo-500/30 bg-gradient-to-b from-indigo-950/40 via-slate-900 to-slate-900/95'
                    : 'border-slate-800/90 bg-slate-900/80 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                {/* Badge populaire / puissance */}
                {plan.badge && (
                  <div className="absolute -top-3.5 left-6">
                    <span className={`px-3 py-1 rounded-full text-[11px] font-bold font-mono border shadow-md ${plan.badgeColor}`}>
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="space-y-5">
                  <div className="pt-1.5">
                    <h4 className="text-lg font-bold text-white tracking-tight">{plan.name}</h4>
                    <p className="text-xs text-slate-400 mt-1 min-h-[36px] leading-relaxed">
                      {plan.tagline}
                    </p>
                  </div>

                  {/* Prix grand format avec design net */}
                  <div className="pt-4 border-t border-slate-800/80">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-white font-mono tracking-tight">
                        {formatPrice(plan.priceMonthlyCfa)}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">/ 30 jours</span>
                    </div>
                  </div>

                  {/* Spécifications matérielles aérées */}
                  <div className="space-y-2.5 p-4 rounded-2xl bg-slate-950/90 border border-slate-800/80 font-mono text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                        <span>vCPU :</span>
                      </span>
                      <span className="font-bold text-white">{plan.cpuLabel}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                        <span>RAM Dédiée :</span>
                      </span>
                      <span className="font-bold text-emerald-400">{plan.ramLabel}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Disque NVMe :</span>
                      </span>
                      <span className="font-bold text-slate-200">{plan.diskLabel}</span>
                    </div>
                  </div>

                  {/* Liste des fonctionnalités */}
                  <ul className="space-y-2.5 text-xs text-slate-300 pt-1">
                    {plan.features.slice(0, 5).map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="leading-snug">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Bouton de commande directe espacé */}
                <div className="mt-7 pt-4 border-t border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => handlePurchase(plan.id)}
                    className={`w-full py-3 px-4 rounded-xl font-bold font-mono text-xs transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer active:scale-98 ${
                      isPopular
                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
                        : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700/60'
                    }`}
                  >
                    <span>Commander ({formatPrice(plan.priceMonthlyCfa)})</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* 4. MES SERVEURS ET LEUR STATUT D'EXPIRATION (1 MOIS) */}
      <div className="p-6 sm:p-7 rounded-3xl bg-slate-900/80 border border-slate-800/90 space-y-6 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800/80">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              État des Abonnements de vos Serveurs
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Gérez le cycle mensuel de vos bots en 1 clic pour éviter toute coupure ou suspension de service.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {servers.length} serveur(s) sous surveillance
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {servers.map((srv) => {
            const daysLeft = srv.daysRemaining !== undefined ? srv.daysRemaining : 28;
            const isCritical = daysLeft <= 5 && daysLeft > 0;
            const isExpired = daysLeft === 0 || srv.isExpired;

            return (
              <div 
                key={srv.id} 
                className={`p-5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-5 ${
                  isExpired 
                    ? 'bg-rose-950/25 border-rose-800/60 shadow-md shadow-rose-950/20' 
                    : isCritical
                    ? 'bg-amber-950/25 border-amber-800/60'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold shrink-0 ${
                    isExpired
                      ? 'bg-rose-600/20 text-rose-400 border border-rose-500/30'
                      : isCritical
                      ? 'bg-amber-600/20 text-amber-400 border border-amber-500/30'
                      : 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                  }`}>
                    <ServerIcon className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-bold text-white text-base">{srv.name}</span>
                      <span className="text-xs font-mono px-2.5 py-0.5 rounded-lg bg-slate-800/90 text-indigo-300 border border-slate-700">
                        {srv.planName || 'Plan Standard Baileys (2.50$/m)'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 font-mono flex items-center gap-2 flex-wrap">
                      <span>Node: <strong className="text-slate-300">{srv.nodeIp}</strong></span>
                      <span className="text-slate-600">•</span>
                      <span>{srv.runtime}</span>
                      <span className="text-slate-600">•</span>
                      <span>RAM: <strong className="text-slate-300">{srv.memoryMaxMb} MB</strong></span>
                    </div>
                  </div>
                </div>

                {/* Statut expiration et bouton renouveler */}
                <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 font-mono text-xs pt-2 md:pt-0 border-t md:border-t-0 border-slate-800/60">
                  <div>
                    {isExpired ? (
                      <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-rose-950 text-rose-300 border border-rose-800 shadow-sm flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        <span>Expiré (Suspendu)</span>
                      </span>
                    ) : isCritical ? (
                      <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-amber-950 text-amber-300 border border-amber-800 shadow-sm animate-pulse flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                        <span>Expire dans {daysLeft}j</span>
                      </span>
                    ) : (
                      <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800 shadow-sm flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span>Actif • {daysLeft}j restants</span>
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRenew(srv)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs font-mono shadow-md shadow-indigo-600/30 transition-all active:scale-95 cursor-pointer"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Renouveler (+30j)</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. HISTORIQUE DES FACTURES & TRANSACTIONS */}
      <div className="p-6 sm:p-7 rounded-3xl bg-slate-900/80 border border-slate-800/90 space-y-5 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-bold shrink-0">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Factures Récentes & Historique de Paiement
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Reçus numériques officiels et historique des recharges ou créations d'instances.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-800/80 self-start sm:self-auto">
            100% Transactions Validées
          </span>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-800/80 bg-slate-950/50">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="text-slate-400 bg-slate-900/90 border-b border-slate-800/80">
                <th className="py-3.5 px-4 font-bold">RÉFÉRENCE</th>
                <th className="py-3.5 px-4 font-bold">SERVEUR / OBJET</th>
                <th className="py-3.5 px-4 font-bold">FORMULE</th>
                <th className="py-3.5 px-4 font-bold">CANAL</th>
                <th className="py-3.5 px-4 font-bold">DATE</th>
                <th className="py-3.5 px-4 font-bold">MONTANT</th>
                <th className="py-3.5 px-4 font-bold text-right">STATUT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 text-indigo-400 font-bold">{inv.id}</td>
                  <td className="py-3.5 px-4 font-sans font-bold text-white">{inv.serverName}</td>
                  <td className="py-3.5 px-4 text-slate-400">{inv.planName}</td>
                  <td className="py-3.5 px-4 text-slate-300">
                    <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[11px]">
                      {inv.method}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">{inv.date}</td>
                  <td className="py-3.5 px-4 font-extrabold text-white">
                    {formatPrice(inv.amountCfa)}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>{inv.status}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODALE RECHARGER LE PORTEFEUILLE                           */}
      {/* ========================================================= */}
      {showRechargeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900 border border-slate-800 p-5 sm:p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white font-sans">
                  Recharger le Portefeuille ORAX
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowRechargeModal(false)}
                className="text-slate-400 hover:text-white text-base"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmRecharge} className="space-y-4 font-mono text-xs">
              <div>
                <label className="text-slate-300 block mb-2 font-sans font-semibold">
                  Montant à recharger (CFA) :
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[1650, 3300, 6600, 13200].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setRechargeAmount(amt)}
                      className={`p-2.5 rounded-xl border font-bold text-center transition-all cursor-pointer ${
                        rechargeAmount === amt
                          ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300 ring-1 ring-emerald-500'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                      }`}
                    >
                      {formatPrice(amt)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Canaux officiels (Burkina Faso, Congo RDC, assistance Telegram) avec vérification stricte */}
              <PaymentChannels
                amountCfa={rechargeAmount}
                selectedChannelId={rechargeChannelId}
                onSelectChannel={(chId) => {
                  setRechargeChannelId(chId);
                  setRechargeVerificationResult(null);
                }}
                senderPhone={rechargeSenderPhone}
                onChangeSenderPhone={setRechargeSenderPhone}
                transactionReference={rechargeTxRef}
                onChangeTransactionReference={setRechargeTxRef}
                verificationResult={rechargeVerificationResult}
                onVerificationChange={setRechargeVerificationResult}
                showWalletOption={false}
              />

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 text-[11px] font-sans">
                Le montant sera crédité immédiatement sur votre solde après contrôle de la référence par la passerelle de vérification.
              </div>

              {/* État de verrouillage anti-fraude */}
              {!rechargeVerificationResult ? (
                <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-300 text-xs flex items-center gap-2 font-mono">
                  <Lock className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>Recharge verrouillée : veuillez vérifier votre transaction Mobile Money ci-dessus avant de valider.</span>
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-emerald-950/50 border border-emerald-700 text-emerald-300 text-xs flex items-center gap-2 font-mono">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>Transaction certifiée (Reçu {rechargeVerificationResult.receiptNumber}). Vous pouvez créditer votre compte.</span>
                </div>
              )}

              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRechargeModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-sans font-semibold text-xs transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={!rechargeVerificationResult}
                  className={`px-5 py-2.5 rounded-xl font-sans font-bold text-xs shadow-md transition-all flex items-center gap-2 ${
                    rechargeVerificationResult
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30 cursor-pointer active:scale-95'
                      : 'bg-slate-800 text-slate-500 border border-slate-700/60 cursor-not-allowed opacity-60'
                  }`}
                >
                  {rechargeVerificationResult ? (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Valider la Recharge ({formatPrice(rechargeAmount)})</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Recharge Bloquée (Non Vérifiée)</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

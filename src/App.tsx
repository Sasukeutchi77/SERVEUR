import React, { useEffect, useState } from 'react';
import { Sidebar, NavigationTab } from './components/layout/Sidebar.tsx';
import { Topbar } from './components/layout/Topbar.tsx';
import { ServersVerticalListView } from './components/views/ServersVerticalListView.tsx';
import { ServerDetailView, ServerItem } from './components/views/ServerDetailView.tsx';
import { SystemResourcesView } from './components/views/SystemResourcesView.tsx';
import { BillingPlansView } from './components/views/BillingPlansView.tsx';
import { ServerPurchaseModal } from './components/billing/ServerPurchaseModal.tsx';
import { ServerRenewModal } from './components/billing/ServerRenewModal.tsx';

// Composants techniques pour l'onglet Architecture & Docs
import { ArchitectureGraph } from './components/ArchitectureGraph.tsx';
import { TechDecisions } from './components/TechDecisions.tsx';
import { RuntimeExplorer } from './components/RuntimeExplorer.tsx';
import { RoadmapPhases } from './components/RoadmapPhases.tsx';

import { ToastProvider, useToast } from './components/ui/Toast.tsx';
import { AuthModal } from './components/auth/AuthModal.tsx';
import {
  subscribeToAuth,
  logoutUser,
  getUserProfile,
} from './lib/firebase.ts';
import { INITIAL_COMPONENTS, INITIAL_RUNTIMES } from './data/initialData.ts';
import { SERVER_PLANS, ServerPlan, calculateExpirationDate, formatPrice } from './data/serverPlans.ts';
import type { ArchitectureComponentStatus, RuntimeConfig } from '../shared/types/index.ts';

const INITIAL_SERVERS: ServerItem[] = [
  {
    id: 'srv-1',
    name: 'LORD (WhatsApp Bot)',
    nodeIp: '92.119.165.177:6291',
    category: 'WHATSAPP',
    runtime: 'Node.js 22 LTS',
    status: 'ONLINE',
    uptime: '14 jours 08h',
    cpu: 12.5,
    cpuCores: 1.0,
    memoryMb: 340,
    memoryMaxMb: 1024,
    diskMb: 220.39,
    diskMaxMb: 3910,
    sourceFile: 'baileys-v6.zip',
    volume: '/app/session (auth_info_baileys)',
    planId: 'standard-2.5',
    planName: 'Standard Baileys (1 650 CFA/m)',
    monthlyPriceCfa: 1650,
    monthlyPriceUsd: 1650,
    expiresAt: calculateExpirationDate(28).iso,
    daysRemaining: 28,
    isExpired: false,
    files: [
      { name: 'baileys-v6.zip', size: '14.2 MB', type: 'file', updatedAt: 'Hier à 14h20' },
      { name: 'package.json', size: '1.24 KB', type: 'file', updatedAt: 'Hier à 14h20' },
      { name: 'index.js', size: '4.82 KB', type: 'file', updatedAt: 'Hier à 14h20' },
      { name: '.env', size: '320 B', type: 'file', updatedAt: 'Hier à 14h20' },
      { name: 'session', size: '24.1 MB', type: 'dir', updatedAt: 'Il y a 5 min' },
      { name: 'node_modules', size: '82.4 MB', type: 'dir', updatedAt: 'Hier à 14h21' },
    ],
    logs: [
      { id: '1', timestamp: '09:14:02', level: 'SYSTEM', message: '<<<[ORAX-HOSTING]>>> Conteneur LORD démarré avec isolation Cgroups (1.0 vCPU, 1024MB RAM)', source: 'system' },
      { id: '2', timestamp: '09:14:02', level: 'SYSTEM', message: 'Volume persistant /data/volumes/srv-1 monté sur /app/session [Lecture/Écriture]', source: 'system' },
      { id: '3', timestamp: '09:14:03', level: 'INFO', message: 'Lancement du script: node index.js (Baileys Pairing Code)', source: 'stdout' },
      { id: '4', timestamp: '09:14:04', level: 'INFO', message: '[Baileys] Configuration utilisateur chargée sans altération du code source.', source: 'stdout' },
      { id: '5', timestamp: '09:14:05', level: 'INFO', message: '[Baileys] Demande de connexion Pairing Code envoyée pour le numéro lié.', source: 'stdout' },
      { id: '6', timestamp: '09:14:06', level: 'INFO', message: '🔑 [PAIRING CODE] : 7K4P-9X2M  (WhatsApp > Appareils connectés > Associer avec numéro)', source: 'stdout' },
      { id: '7', timestamp: '09:14:14', level: 'INFO', message: '✅ [WhatsApp] Appareil associé avec succès ! Clés de session enregistrées dans /app/session.', source: 'stdout' },
      { id: '8', timestamp: '09:14:15', level: 'INFO', message: '🚀 Prêt à traiter et envoyer des messages en continu 24h/24.', source: 'stdout' },
      { id: '9', timestamp: '09:16:40', level: 'SYSTEM', message: '<<<[ORAX-HOSTING]>>> Server marked as online...', source: 'system' },
    ],
  },
  {
    id: 'srv-2',
    name: 'Telegram Crypto Bot',
    nodeIp: '92.119.165.177:6292',
    category: 'TELEGRAM',
    runtime: 'Python 3.12',
    status: 'ONLINE',
    uptime: '6 jours 19h',
    cpu: 8.2,
    cpuCores: 0.5,
    memoryMb: 185,
    memoryMaxMb: 512,
    diskMb: 140.5,
    diskMaxMb: 2048,
    sourceFile: 'tg-crypto-bot.zip',
    volume: '/app/session (sqlite3)',
    planId: 'eco-2',
    planName: 'Starter Eco (1 300 CFA/m)',
    monthlyPriceCfa: 1300,
    monthlyPriceUsd: 1300,
    expiresAt: calculateExpirationDate(14).iso,
    daysRemaining: 14,
    isExpired: false,
    files: [
      { name: 'tg-crypto-bot.zip', size: '8.4 MB', type: 'file', updatedAt: 'Il y a 3 jours' },
      { name: 'main.py', size: '5.1 KB', type: 'file', updatedAt: 'Il y a 3 jours' },
      { name: 'requirements.txt', size: '340 B', type: 'file', updatedAt: 'Il y a 3 jours' },
      { name: 'database.sqlite', size: '2.1 MB', type: 'file', updatedAt: 'Il y a 10 min' },
    ],
    logs: [
      { id: '1', timestamp: '08:30:00', level: 'SYSTEM', message: '<<<[ORAX-HOSTING]>>> Conteneur Telegram initialisé (Python 3.12, 512MB RAM)', source: 'system' },
      { id: '2', timestamp: '08:30:01', level: 'INFO', message: 'Script lancé: python main.py', source: 'stdout' },
      { id: '3', timestamp: '08:30:03', level: 'INFO', message: '[Telegram] Authentification par Token réussie sans altération.', source: 'stdout' },
      { id: '4', timestamp: '08:30:04', level: 'INFO', message: '🚀 Bot Telegram actif et à l\'écoute 24h/24.', source: 'stdout' },
    ],
  },
  {
    id: 'srv-3',
    name: 'Discord Modération',
    nodeIp: '92.119.165.177:6293',
    category: 'CUSTOM',
    runtime: 'Node.js 20 LTS',
    status: 'OFFLINE',
    uptime: 'Arrêté',
    cpu: 0,
    cpuCores: 2.0,
    memoryMb: 0,
    memoryMaxMb: 2048,
    diskMb: 95.2,
    diskMaxMb: 4096,
    sourceFile: 'discord-mod.zip',
    volume: '/app/session',
    planId: 'plus-5',
    planName: 'Plus Turbo (3 300 CFA/m)',
    monthlyPriceCfa: 3300,
    monthlyPriceUsd: 3300,
    expiresAt: calculateExpirationDate(2).iso,
    daysRemaining: 2,
    isExpired: false,
    files: [
      { name: 'discord-mod.zip', size: '4.2 MB', type: 'file', updatedAt: 'Il y a 5 jours' },
      { name: 'bot.js', size: '3.1 KB', type: 'file', updatedAt: 'Il y a 5 jours' },
      { name: 'package.json', size: '890 B', type: 'file', updatedAt: 'Il y a 5 jours' },
    ],
    logs: [
      { id: '1', timestamp: '18:30:10', level: 'WARN', message: '<<<[ORAX-HOSTING]>>> Signal d\'arrêt reçu.', source: 'system' },
      { id: '2', timestamp: '18:30:11', level: 'SYSTEM', message: '<<<[ORAX-HOSTING]>>> Server marked as offline...', source: 'system' },
    ],
  },
  {
    id: 'srv-4',
    name: 'Serveur de Secours',
    nodeIp: '92.119.165.177:6294',
    category: 'CUSTOM',
    runtime: 'Node.js 22 LTS',
    status: 'OFFLINE',
    uptime: 'Suspendu (Abonnement expiré)',
    cpu: 0,
    cpuCores: 1.0,
    memoryMb: 0,
    memoryMaxMb: 1024,
    diskMb: 12.0,
    diskMaxMb: 3910,
    sourceFile: '',
    volume: '/app/session',
    planId: 'standard-2.5',
    planName: 'Standard Baileys (1 650 CFA/m)',
    monthlyPriceCfa: 1650,
    monthlyPriceUsd: 1650,
    expiresAt: calculateExpirationDate(0).iso,
    daysRemaining: 0,
    isExpired: true,
    files: [],
    logs: [
      { id: '1', timestamp: '12:00:00', level: 'SYSTEM', message: '<<<[ORAX-HOSTING]>>> Serveur suspendu suite à l\'expiration de la période de 30 jours.', source: 'system' },
      { id: '2', timestamp: '12:00:01', level: 'WARN', message: '<<<[ORAX-HOSTING]>>> Vos fichiers et données sont sécurisés. Renouvelez votre abonnement pour relancer le serveur.', source: 'system' },
    ],
  },
];

function AppContent() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<NavigationTab>('servers');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [uptime, setUptime] = useState<number>(0);
  const [serverReady, setServerReady] = useState<boolean>(true);
  const [components, setComponents] = useState<ArchitectureComponentStatus[]>(INITIAL_COMPONENTS);
  const [runtimes, setRuntimes] = useState<RuntimeConfig[]>(INITIAL_RUNTIMES);

  const [servers, setServers] = useState<ServerItem[]>(INITIAL_SERVERS);
  const [selectedServerId, setSelectedServerId] = useState<string | null>(null);

  const [walletBalanceCfa, setWalletBalanceCfa] = useState<number>(0);
  const [purchaseModalOpen, setPurchaseModalOpen] = useState<boolean>(false);
  const [purchaseInitialPlanId, setPurchaseInitialPlanId] = useState<string>('standard-2.5');
  const [renewTargetServer, setRenewTargetServer] = useState<ServerItem | null>(null);

  const [currentUser, setCurrentUser] = useState<{
    uid: string;
    email: string | null;
    displayName: string | null;
  } | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = subscribeToAuth(async (user) => {
      if (user) {
        setCurrentUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
        });

        const profile = await getUserProfile(user.uid);
        if (profile && typeof profile.walletBalanceCfa === 'number') {
          setWalletBalanceCfa(0);
        }
      } else {
        setCurrentUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
      showToast('info', 'Déconnexion réussie', 'Vous naviguez désormais en mode invité.');
    } catch (err: any) {
      showToast('error', 'Erreur de déconnexion', err?.message || 'Impossible de se déconnecter.');
    }
  };

  const handleAuthSuccess = (email: string, isNewUser: boolean) => {
    showToast(
      'success',
      isNewUser ? 'Compte ORAX créé !' : 'Bon retour parmi nous !',
      `Connecté sous ${email}. Vos serveurs sont sécurisés.`
    );
  };

  useEffect(() => {
    const checkSystem = async () => {
      try {
        const [healthRes, overviewRes] = await Promise.all([
          fetch('/api/health'),
          fetch('/api/v1/system/overview'),
        ]);

        if (healthRes.ok) {
          const health = await healthRes.json();
          setServerReady(true);
          setUptime(health.uptimeSeconds || 0);
        }

        if (overviewRes.ok) {
          const overview = await overviewRes.json();
          if (overview.components) setComponents(overview.components);
          if (overview.runtimes) setRuntimes(overview.runtimes);
        }
      } catch (err) {
        console.warn('Backend API non disponible (mode fallback client actif)', err);
      }
    };

    checkSystem();
    const interval = setInterval(checkSystem, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectServer = (server: ServerItem) => {
    setSelectedServerId(server.id);
  };

  const handleCreateServer = (name: string, runtime: string) => {
    const randomPort = 6290 + servers.length + 1;
    const newServerId = `srv-${Date.now()}`;

    const newServer: ServerItem = {
      id: newServerId,
      name,
      nodeIp: `92.119.165.177:${randomPort}`,
      category: runtime.includes('Python') ? 'TELEGRAM' : 'WHATSAPP',
      runtime,
      status: 'OFFLINE',
      uptime: 'À l\'instant',
      cpu: 0,
      memoryMb: 0,
      memoryMaxMb: 1024,
      diskMb: 15.0,
      diskMaxMb: 3910,
      sourceFile: '',
      volume: '/app/session',
      files: [],
      logs: [
        {
          id: '1',
          timestamp: new Date().toLocaleTimeString(),
          level: 'SYSTEM',
          message: `<<<[ORAX-HOSTING]>>> Serveur ${name} créé avec succès. Ouvrez l'onglet "Files" pour téléverser votre archive ZIP.`,
          source: 'system',
        },
        {
          id: '2',
          timestamp: new Date().toLocaleTimeString(),
          level: 'SYSTEM',
          message: '<<<[ORAX-HOSTING]>>> Server marked as offline...',
          source: 'system',
        },
      ],
    };

    setServers((prev) => [...prev, newServer]);
    setSelectedServerId(newServer.id);
    showToast('success', `Serveur créé !`, `Vous êtes maintenant dans ${name}.`);
  };

  const handlePurchaseSuccess = (newServerData: {
    plan: ServerPlan;
    serverName: string;
    runtime: string;
    transactionId: string;
    expiresAt: string;
    daysRemaining: number;
  }) => {
    const randomPort = 6290 + servers.length + 1;
    const newServerId = `srv-${Date.now()}`;
    const newServer: ServerItem = {
      id: newServerId,
      name: newServerData.serverName,
      nodeIp: `92.119.165.177:${randomPort}`,
      category: newServerData.runtime.includes('Python') ? 'TELEGRAM' : 'WHATSAPP',
      runtime: newServerData.runtime,
      status: 'ONLINE',
      uptime: 'À l\'instant',
      cpu: 4.5,
      cpuCores: newServerData.plan.cpuCores,
      memoryMb: 95,
      memoryMaxMb: newServerData.plan.ramMb,
      diskMb: 15.0,
      diskMaxMb: newServerData.plan.diskGb * 1024,
      sourceFile: '',
      volume: '/app/session',
      planId: newServerData.plan.id,
      planName: `${newServerData.plan.name} (${formatPrice(newServerData.plan.priceMonthlyCfa)}/m)`,
      monthlyPriceCfa: newServerData.plan.priceMonthlyCfa,
      monthlyPriceUsd: newServerData.plan.priceMonthlyCfa,
      expiresAt: newServerData.expiresAt,
      daysRemaining: newServerData.daysRemaining,
      isExpired: false,
      files: [],
      logs: [
        {
          id: '1',
          timestamp: new Date().toLocaleTimeString(),
          level: 'SYSTEM',
          message: `<<<[ORAX-HOSTING]>>> Serveur "${newServerData.serverName}" provisionné sous la formule ${newServerData.plan.name} (Validité: 30 jours / 1 mois).`,
          source: 'system',
        },
        {
          id: '2',
          timestamp: new Date().toLocaleTimeString(),
          level: 'INFO',
          message: `Specs VPS allouées : ${newServerData.plan.cpuCores} vCPU, ${newServerData.plan.ramMb} MB RAM, ${newServerData.plan.diskGb} GB SSD NVMe.`,
          source: 'system',
        },
        {
          id: '3',
          timestamp: new Date().toLocaleTimeString(),
          level: 'INFO',
          message: `Téléversez votre archive bot ZIP dans l'onglet "Files" pour lancer vos automatisations Baileys ou Python 24h/24.`,
          source: 'system',
        },
      ],
    };

    setServers((prev) => [...prev, newServer]);
    setSelectedServerId(newServer.id);
    setActiveTab('servers');
    showToast('success', 'Serveur Déployé !', `Formule ${newServerData.plan.name} activée pour 30 jours.`);
  };

  const handleRenewSuccess = (renewData: {
    plan: ServerPlan;
    newExpiresAt: string;
    newDaysRemaining: number;
    transactionId: string;
  }) => {
    if (!renewTargetServer) return;
    const updated: ServerItem = {
      ...renewTargetServer,
      planId: renewData.plan.id,
      planName: `${renewData.plan.name} (${formatPrice(renewData.plan.priceMonthlyCfa)}/m)`,
      monthlyPriceCfa: renewData.plan.priceMonthlyCfa,
      monthlyPriceUsd: renewData.plan.priceMonthlyCfa,
      cpuCores: renewData.plan.cpuCores,
      memoryMaxMb: renewData.plan.ramMb,
      diskMaxMb: renewData.plan.diskGb * 1024,
      expiresAt: renewData.newExpiresAt,
      daysRemaining: renewData.newDaysRemaining,
      isExpired: false,
      status: renewTargetServer.status === 'OFFLINE' ? 'ONLINE' : renewTargetServer.status,
    };
    handleUpdateServer(updated);
    setRenewTargetServer(null);
    showToast('success', 'Abonnement Renouvelé !', `${renewTargetServer.name} a été prolongé de 30 jours.`);
  };

  const handleDeleteServer = (serverId: string) => {
    const serverToDelete = servers.find((s) => s.id === serverId);
    setServers((prev) => prev.filter((s) => s.id !== serverId));
    if (selectedServerId === serverId) {
      setSelectedServerId(null);
    }
    showToast('info', 'Serveur supprimé', `Le serveur ${serverToDelete?.name || ''} a été supprimé et ses ressources libérées.`);
  };

  const handleUpdateServer = (updatedServer: ServerItem) => {
    setServers((prev) => prev.map((s) => (s.id === updatedServer.id ? updatedServer : s)));
  };

  const runningServersCount = servers.filter((s) => s.status === 'ONLINE').length;
  const currentSelectedServer = servers.find((s) => s.id === selectedServerId);

  return (
    <div id="orax-hosting-root" className="min-h-screen bg-[#07090e] text-slate-100 flex font-sans selection:bg-indigo-600 selection:text-white bg-tech-grid">
      <Sidebar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'servers') {
            setSelectedServerId(null);
          } else if (tab === 'new-server') {
            setSelectedServerId(null);
          }
        }}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        runningBotsCount={runningServersCount}
        totalBotsCount={servers.length}
        currentUser={currentUser}
        onOpenAuthModal={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <Topbar
          activeTab={activeTab}
          selectedServerName={currentSelectedServer ? currentSelectedServer.name : undefined}
          onOpenMobile={() => setMobileMenuOpen(true)}
          onNewDeployment={() => {
            setSelectedServerId(null);
            handleCreateServer(`Serveur ${servers.length + 1}`, 'Node.js 22 LTS');
          }}
          uptimeSeconds={uptime}
          serverReady={serverReady}
          currentUser={currentUser}
          onOpenAuthModal={() => setAuthModalOpen(true)}
          onLogout={handleLogout}
        />

        <main className="flex-1 p-4 sm:p-7 lg:p-9 max-w-7xl w-full mx-auto">
          {(activeTab === 'servers' || activeTab === 'bots' || activeTab === 'overview' || activeTab === 'deployments' || activeTab === 'logs') && (
            selectedServerId && currentSelectedServer ? (
              <ServerDetailView
                server={currentSelectedServer}
                onBack={() => setSelectedServerId(null)}
                onUpdateServer={handleUpdateServer}
                onDeleteServer={handleDeleteServer}
              />
            ) : (
              <ServersVerticalListView
                servers={servers}
                onSelectServer={handleSelectServer}
                onCreateServer={handleCreateServer}
                onDeleteServer={handleDeleteServer}
                onOpenPurchaseModal={() => {
                  setPurchaseInitialPlanId('standard-2.5');
                  setPurchaseModalOpen(true);
                }}
                onOpenRenewModal={(server) => setRenewTargetServer(server)}
              />
            )
          )}

          {activeTab === 'new-server' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <ServersVerticalListView
                servers={servers}
                onSelectServer={handleSelectServer}
                onCreateServer={handleCreateServer}
                onDeleteServer={handleDeleteServer}
                onOpenPurchaseModal={() => {
                  setPurchaseInitialPlanId('standard-2.5');
                  setPurchaseModalOpen(true);
                }}
                onOpenRenewModal={(server) => setRenewTargetServer(server)}
              />
            </div>
          )}

          {activeTab === 'billing' && (
            <BillingPlansView
              servers={servers}
              walletBalanceCfa={walletBalanceCfa}
              onRechargeWallet={() => {
                showToast('info', 'Paiement désactivé', 'Le système de paiement est actuellement désactivé tant qu\'un fournisseur vérifiable n\'est configuré.');
              }}
              onOpenPurchaseModal={(planId) => {
                setPurchaseInitialPlanId(planId || 'standard-2.5');
                setPurchaseModalOpen(true);
              }}
              onSelectPlan={(planId) => {
                setPurchaseInitialPlanId(planId || 'standard-2.5');
                setPurchaseModalOpen(true);
              }}
              onOpenRenewModal={(server) => {
                setRenewTargetServer(server);
              }}
              onRenewServer={(server) => {
                setRenewTargetServer(server);
              }}
            />
          )}

          {(activeTab === 'resources' || activeTab === 'activity' || activeTab === 'settings') && (
            <SystemResourcesView />
          )}

          {activeTab === 'docs' && (
            <div className="space-y-7">
              <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  ORAX-HOSTING • Spécification Technique
                </h2>
                <p className="text-xs text-slate-300 mt-1">
                  Panels Pterodactyl-style, sockets cgroups, volumes persistants Pairing Code et non-altération du code source.
                </p>
              </div>

              <ArchitectureGraph components={components} />
              <TechDecisions />
              <RuntimeExplorer runtimes={runtimes} />
              <RoadmapPhases />
            </div>
          )}
        </main>

        <footer className="border-t border-slate-800/80 bg-slate-950/80 px-4 sm:px-8 py-3 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>© 2026 | Hosted by <strong className="text-indigo-400">ORAX-HOSTING</strong></span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            Serveurs dédiés 24h/24 • Pairing Code WhatsApp & Telegram • Fichiers & Consoles isolées
          </div>
        </footer>
      </div>

      {purchaseModalOpen && (
        <ServerPurchaseModal
          isOpen={purchaseModalOpen}
          onClose={() => setPurchaseModalOpen(false)}
          initialPlanId={purchaseInitialPlanId}
          userWalletBalanceCfa={walletBalanceCfa}
          onSuccessPurchase={handlePurchaseSuccess}
        />
      )}

      {renewTargetServer && (
        <ServerRenewModal
          isOpen={!!renewTargetServer}
          onClose={() => setRenewTargetServer(null)}
          serverName={renewTargetServer.name}
          currentPlanId={renewTargetServer.planId || 'standard-2.5'}
          currentExpiresAt={renewTargetServer.expiresAt}
          daysRemaining={renewTargetServer.daysRemaining !== undefined ? renewTargetServer.daysRemaining : 28}
          userWalletBalanceCfa={walletBalanceCfa}
          onSuccessRenew={handleRenewSuccess}
        />
      )}

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccessAuth={handleAuthSuccess}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}

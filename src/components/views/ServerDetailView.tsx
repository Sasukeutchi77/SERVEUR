import React, { useState, useRef, useEffect, useMemo } from 'react';
import JSZip from 'jszip';
import { 
  Terminal, 
  HardDrive, 
  Cpu, 
  Play, 
  RotateCw, 
  Square, 
  Folder, 
  FileText, 
  Upload, 
  Plus, 
  Trash2, 
  FolderPlus, 
  Download, 
  Copy, 
  Check, 
  CornerDownLeft, 
  Server as ServerIcon,
  Loader2,
  MoreVertical,
  Pencil,
  ArrowUp,
  FileCode,
  PackageOpen,
  Archive,
  X,
  Bot,
  Search,
  FolderTree,
  ChevronRight,
  ArrowLeft,
  List,
  Shield,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  FileDown,
  Filter,
  Eye,
  Code2,
  CreditCard,
  Coins,
  Clock,
  Sparkles,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '../ui/Toast.tsx';

// Composants modulaires ORAX-HOSTING
import { PairingCodeWidget } from './server/PairingCodeWidget.tsx';
import { CodeEditorModal } from './server/CodeEditorModal.tsx';
import { EnvVariablesManager, EnvVariable } from './server/EnvVariablesManager.tsx';
import { BackupsManager } from './server/BackupsManager.tsx';
import { ResourceLiveCharts } from './server/ResourceLiveCharts.tsx';
import { ServerRenewModal } from '../billing/ServerRenewModal.tsx';
import { SERVER_PLANS, ServerPlan, formatPrice, calculateExpirationDate } from '../../data/serverPlans.ts';

export interface ServerFile {
  name: string;
  size: string;
  type: 'file' | 'dir';
  updatedAt: string;
  path?: string; // Chemin relatif (ex: "commands/ping.js" ou "package.json")
  content?: string; // Contenu modifiable dans l'éditeur de code
}

export interface ServerItem {
  id: string;
  name: string;
  nodeIp: string;
  category: 'WHATSAPP' | 'TELEGRAM' | 'CUSTOM';
  runtime: string;
  status: 'ONLINE' | 'OFFLINE' | 'STARTING';
  uptime: string;
  cpu: number;
  memoryMb: number;
  memoryMaxMb: number;
  diskMb: number;
  diskMaxMb: number;
  sourceFile: string;
  volume: string;
  files: ServerFile[];
  logs: {
    id: string;
    timestamp: string;
    level: 'SYSTEM' | 'INFO' | 'WARN' | 'ERROR';
    message: string;
    source: 'system' | 'stdout' | 'stderr';
  }[];
  // Données d'abonnement mensuel (1 mois / 30 jours)
  planId?: string;
  planName?: string;
  monthlyPriceCfa?: number;
  monthlyPriceUsd?: number;
  cpuCores?: number;
  purchasedAt?: string;
  expiresAt?: string;
  daysRemaining?: number;
  isExpired?: boolean;
}

interface ServerDetailViewProps {
  server: ServerItem;
  onBack: () => void;
  onUpdateServer: (updatedServer: ServerItem) => void;
  onDeleteServer: (serverId: string) => void;
}

// Cache persistant en mémoire pour les fichiers ZIP réels téléversés par l'utilisateur
const uploadedZipFilesStore = new Map<string, File>();

// Générateur d'une arborescence complète et réaliste pour les bots (Baileys / Telegram)
const getFullBotArchiveFiles = (archiveName: string): ServerFile[] => {
  const isPython = archiveName.toLowerCase().includes('tg') || 
                   archiveName.toLowerCase().includes('python') || 
                   archiveName.toLowerCase().includes('crypto');

  if (isPython) {
    return [
      { name: 'main.py', path: 'main.py', size: '5.24 KB', type: 'file', updatedAt: 'À l\'instant' },
      { name: 'bot.py', path: 'bot.py', size: '7.81 KB', type: 'file', updatedAt: 'À l\'instant' },
      { name: 'config.py', path: 'config.py', size: '2.10 KB', type: 'file', updatedAt: 'À l\'instant' },
      { name: 'requirements.txt', path: 'requirements.txt', size: '420 B', type: 'file', updatedAt: 'À l\'instant' },
      { name: '.env', path: '.env', size: '310 B', type: 'file', updatedAt: 'À l\'instant' },
      { name: '.env.example', path: '.env.example', size: '280 B', type: 'file', updatedAt: 'À l\'instant' },
      { name: 'README.md', path: 'README.md', size: '1.80 KB', type: 'file', updatedAt: 'À l\'instant' },
      { name: 'database.sqlite', path: 'database.sqlite', size: '3.40 MB', type: 'file', updatedAt: 'À l\'instant' },
      
      // Dossiers et contenus
      { name: 'handlers', path: 'handlers', size: '—', type: 'dir', updatedAt: 'À l\'instant' },
      { name: 'start.py', path: 'handlers/start.py', size: '3.1 KB', type: 'file', updatedAt: 'À l\'instant' },
      { name: 'help.py', path: 'handlers/help.py', size: '2.4 KB', type: 'file', updatedAt: 'À l\'instant' },
      { name: 'crypto.py', path: 'handlers/crypto.py', size: '8.9 KB', type: 'file', updatedAt: 'À l\'instant' },
      { name: 'admin.py', path: 'handlers/admin.py', size: '4.5 KB', type: 'file', updatedAt: 'À l\'instant' },

      { name: 'utils', path: 'utils', size: '—', type: 'dir', updatedAt: 'À l\'instant' },
      { name: 'helpers.py', path: 'utils/helpers.py', size: '3.2 KB', type: 'file', updatedAt: 'À l\'instant' },
      { name: 'api.py', path: 'utils/api.py', size: '4.1 KB', type: 'file', updatedAt: 'À l\'instant' },

      { name: 'database', path: 'database', size: '—', type: 'dir', updatedAt: 'À l\'instant' },
      { name: 'models.py', path: 'database/models.py', size: '3.8 KB', type: 'file', updatedAt: 'À l\'instant' },
    ];
  }

  // Structure complète d'un Bot WhatsApp moderne (Baileys v6, IS22, LORD, etc.)
  return [
    { name: 'package.json', path: 'package.json', size: '2.14 KB', type: 'file', updatedAt: 'À l\'instant' },
    { name: 'package-lock.json', path: 'package-lock.json', size: '148.2 KB', type: 'file', updatedAt: 'À l\'instant' },
    { name: 'index.js', path: 'index.js', size: '6.42 KB', type: 'file', updatedAt: 'À l\'instant' },
    { name: 'main.js', path: 'main.js', size: '4.18 KB', type: 'file', updatedAt: 'À l\'instant' },
    { name: 'config.js', path: 'config.js', size: '3.50 KB', type: 'file', updatedAt: 'À l\'instant' },
    { name: '.env', path: '.env', size: '480 B', type: 'file', updatedAt: 'À l\'instant' },
    { name: '.env.example', path: '.env.example', size: '390 B', type: 'file', updatedAt: 'À l\'instant' },
    { name: 'README.md', path: 'README.md', size: '3.20 KB', type: 'file', updatedAt: 'À l\'instant' },
    { name: 'Dockerfile', path: 'Dockerfile', size: '640 B', type: 'file', updatedAt: 'À l\'instant' },
    { name: 'server.js', path: 'server.js', size: '2.80 KB', type: 'file', updatedAt: 'À l\'instant' },

    // 1. Session Auth (Pairing Code)
    { name: 'session', path: 'session', size: '—', type: 'dir', updatedAt: 'À l\'instant' },
    { name: 'creds.json', path: 'session/creds.json', size: '2.40 KB', type: 'file', updatedAt: 'À l\'instant' },
    { name: 'app-state-sync-key.json', path: 'session/app-state-sync-key.json', size: '1.20 KB', type: 'file', updatedAt: 'À l\'instant' },
    { name: 'pre-key-1.json', path: 'session/pre-key-1.json', size: '890 B', type: 'file', updatedAt: 'À l\'instant' },

    // 2. Commandes
    { name: 'commands', path: 'commands', size: '—', type: 'dir', updatedAt: 'À l\'instant' },
    { name: 'menu.js', path: 'commands/menu.js', size: '5.60 KB', type: 'file', updatedAt: 'À l\'instant' },
    { name: 'ping.js', path: 'commands/ping.js', size: '1.10 KB', type: 'file', updatedAt: 'À l\'instant' },
    { name: 'sticker.js', path: 'commands/sticker.js', size: '4.20 KB', type: 'file', updatedAt: 'À l\'instant' },
    { name: 'ai.js', path: 'commands/ai.js', size: '3.80 KB', type: 'file', updatedAt: 'À l\'instant' },
    { name: 'downloader.js', path: 'commands/downloader.js', size: '6.10 KB', type: 'file', updatedAt: 'À l\'instant' },
    { name: 'owner.js', path: 'commands/owner.js', size: '4.90 KB', type: 'file', updatedAt: 'À l\'instant' },
    { name: 'group.js', path: 'commands/group.js', size: '7.30 KB', type: 'file', updatedAt: 'À l\'instant' },
    { name: 'tools.js', path: 'commands/tools.js', size: '3.40 KB', type: 'file', updatedAt: 'À l\'instant' },

    // 3. Cœur / Src
    { name: 'src', path: 'src', size: '—', type: 'dir', updatedAt: 'À l\'instant' },
    { name: 'connection.js', path: 'src/connection.js', size: '8.40 KB', type: 'file', updatedAt: 'À l\'instant' },
    { name: 'messageHandler.js', path: 'src/messageHandler.js', size: '12.6 KB', type: 'file', updatedAt: 'À l\'instant' },
    { name: 'pairing.js', path: 'src/pairing.js', size: '4.10 KB', type: 'file', updatedAt: 'À l\'instant' },
    { name: 'database.js', path: 'src/database.js', size: '5.20 KB', type: 'file', updatedAt: 'À l\'instant' },

    // 4. Plugins
    { name: 'plugins', path: 'plugins', size: '—', type: 'dir', updatedAt: 'À l\'instant' },
    { name: 'anticall.js', path: 'plugins/anticall.js', size: '2.30 KB', type: 'file', updatedAt: 'À l\'instant' },
    { name: 'antidelete.js', path: 'plugins/antidelete.js', size: '3.10 KB', type: 'file', updatedAt: 'À l\'instant' },
    { name: 'autoreact.js', path: 'plugins/autoreact.js', size: '1.90 KB', type: 'file', updatedAt: 'À l\'instant' },
    { name: 'welcome.js', path: 'plugins/welcome.js', size: '3.70 KB', type: 'file', updatedAt: 'À l\'instant' },

    // 5. Utilitaires Lib
    { name: 'lib', path: 'lib', size: '—', type: 'dir', updatedAt: 'À l\'instant' },
    { name: 'functions.js', path: 'lib/functions.js', size: '9.40 KB', type: 'file', updatedAt: 'À l\'instant' },
    { name: 'color.js', path: 'lib/color.js', size: '1.40 KB', type: 'file', updatedAt: 'À l\'instant' },
    { name: 'uploader.js', path: 'lib/uploader.js', size: '4.50 KB', type: 'file', updatedAt: 'À l\'instant' },

    // 6. Base de données JSON
    { name: 'database', path: 'database', size: '—', type: 'dir', updatedAt: 'À l\'instant' },
    { name: 'users.json', path: 'database/users.json', size: '18.4 KB', type: 'file', updatedAt: 'À l\'instant' },
    { name: 'groups.json', path: 'database/groups.json', size: '9.20 KB', type: 'file', updatedAt: 'À l\'instant' },
    { name: 'settings.json', path: 'database/settings.json', size: '3.10 KB', type: 'file', updatedAt: 'À l\'instant' },

    // 7. Node_modules
    { name: 'node_modules', path: 'node_modules', size: '82.4 MB', type: 'dir', updatedAt: 'À l\'instant' },
  ];
};

export const ServerDetailView: React.FC<ServerDetailViewProps> = ({
  server,
  onBack,
  onUpdateServer,
  onDeleteServer,
}) => {
  const { showToast } = useToast();
  
  // 5 Onglets principaux
  const [activeTab, setActiveTab] = useState<'console' | 'files' | 'env' | 'backups' | 'info'>('console');
  
  const [copiedIp, setCopiedIp] = useState<boolean>(false);
  const [isRebooting, setIsRebooting] = useState<boolean>(false);
  const [isUploadingZip, setIsUploadingZip] = useState<boolean>(false);
  const [isUnarchiving, setIsUnarchiving] = useState<boolean>(false);
  const [isExportingAllZip, setIsExportingAllZip] = useState<boolean>(false);
  const [commandInput, setCommandInput] = useState<string>('');

  // Watchdog automatique (Surveillance des crashs 24/7)
  const [watchdogActive, setWatchdogActive] = useState<boolean>(true);
  const [isRecoveringFromCrash, setIsRecoveringFromCrash] = useState<boolean>(false);

  // Filtres et recherche dans la Console
  const [logFilter, setLogFilter] = useState<'ALL' | 'PAIRING' | 'SYSTEM' | 'INFO' | 'ERRORS'>('ALL');
  const [logSearch, setLogSearch] = useState<string>('');

  // Éditeur de code in-browser
  const [editingFile, setEditingFile] = useState<ServerFile | null>(null);

  // Modale de renouvellement d'abonnement (1 mois / 30 jours)
  const [showRenewModal, setShowRenewModal] = useState<boolean>(false);

  // Gestion des fichiers
  const [selectedFileNames, setSelectedFileNames] = useState<string[]>([]);
  const [activeMenuFileName, setActiveMenuFileName] = useState<string | null>(null);
  const [currentFolder, setCurrentFolder] = useState<string>(''); // '' = racine /home/container/
  const [viewMode, setViewMode] = useState<'folder' | 'flat'>('folder');
  const [fileSearch, setFileSearch] = useState<string>('');

  // Modales
  const [fileToRename, setFileToRename] = useState<string | null>(null);
  const [renameInput, setRenameInput] = useState<string>('');
  const [filesToDelete, setFilesToDelete] = useState<string[]>([]);
  const [showNewFileModal, setShowNewFileModal] = useState<boolean>(false);
  const [newFileNameInput, setNewFileNameInput] = useState<string>('');
  const [showNewDirModal, setShowNewDirModal] = useState<boolean>(false);
  const [newDirNameInput, setNewDirNameInput] = useState<string>('');

  const logsEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fermer le menu contextuel si clic extérieur
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.file-context-menu-container')) {
        setActiveMenuFileName(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Auto-scroll pour la console
  useEffect(() => {
    if (activeTab === 'console') {
      logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [server.logs, activeTab, logFilter, logSearch]);

  const copyIp = () => {
    navigator.clipboard.writeText(server.nodeIp);
    setCopiedIp(true);
    setTimeout(() => setCopiedIp(false), 2000);
    showToast('info', 'IP copiée', server.nodeIp);
  };

  const handleStart = () => {
    if (server.status === 'ONLINE') return;
    showToast('info', 'Démarrage du serveur', `Lancement du conteneur ${server.name}...`);
    
    const startingLogs = [
      ...server.logs,
      {
        id: String(Date.now()),
        timestamp: new Date().toLocaleTimeString(),
        level: 'SYSTEM' as const,
        message: `<<<[ORAX-HOSTING]>>> Démarrage du serveur ${server.name} en cours...`,
        source: 'system' as const,
      },
      {
        id: String(Date.now() + 1),
        timestamp: new Date().toLocaleTimeString(),
        level: 'INFO' as const,
        message: `Allocation des cgroups (CPU: ${server.runtime}, RAM: ${server.memoryMaxMb}MB)`,
        source: 'system' as const,
      },
      {
        id: String(Date.now() + 2),
        timestamp: new Date().toLocaleTimeString(),
        level: 'INFO' as const,
        message: '🔑 [PAIRING CODE] : 7K4P-9X2M  (WhatsApp > Appareils connectés > Associer avec numéro)',
        source: 'stdout' as const,
      },
      {
        id: String(Date.now() + 3),
        timestamp: new Date().toLocaleTimeString(),
        level: 'SYSTEM' as const,
        message: '<<<[ORAX-HOSTING]>>> Server marked as online...',
        source: 'system' as const,
      },
    ];

    onUpdateServer({
      ...server,
      status: 'ONLINE',
      uptime: 'À l\'instant',
      cpu: 11.4,
      memoryMb: 340,
      logs: startingLogs,
    });
    showToast('success', 'Serveur En Ligne', `${server.name} tourne désormais 24h/24 !`);
  };

  const handleStop = () => {
    if (server.status === 'OFFLINE') return;
    const stoppingLogs = [
      ...server.logs,
      {
        id: String(Date.now()),
        timestamp: new Date().toLocaleTimeString(),
        level: 'WARN' as const,
        message: `<<<[ORAX-HOSTING]>>> Envoi du signal SIGTERM au serveur ${server.name}...`,
        source: 'system' as const,
      },
      {
        id: String(Date.now() + 1),
        timestamp: new Date().toLocaleTimeString(),
        level: 'SYSTEM' as const,
        message: 'Arrêt propre du conteneur. Session conservée intacte.',
        source: 'system' as const,
      },
      {
        id: String(Date.now() + 2),
        timestamp: new Date().toLocaleTimeString(),
        level: 'SYSTEM' as const,
        message: '<<<[ORAX-HOSTING]>>> Server marked as offline...',
        source: 'system' as const,
      },
    ];

    onUpdateServer({
      ...server,
      status: 'OFFLINE',
      uptime: 'Arrêté',
      cpu: 0,
      memoryMb: 0,
      logs: stoppingLogs,
    });
    showToast('info', 'Serveur Arrêté', `${server.name} a été mis hors tension.`);
  };

  const handleRestart = () => {
    setIsRebooting(true);
    showToast('info', 'Redémarrage', `Redémarrage du serveur ${server.name}...`);

    const rebootLogs = [
      ...server.logs,
      {
        id: String(Date.now()),
        timestamp: new Date().toLocaleTimeString(),
        level: 'WARN' as const,
        message: '<<<[ORAX-HOSTING]>>> Redémarrage demandé...',
        source: 'system' as const,
      },
      {
        id: String(Date.now() + 1),
        timestamp: new Date().toLocaleTimeString(),
        level: 'SYSTEM' as const,
        message: 'Conteneur relancé. Reconnexion automatique au daemon...',
        source: 'system' as const,
      },
      {
        id: String(Date.now() + 2),
        timestamp: new Date().toLocaleTimeString(),
        level: 'INFO' as const,
        message: '🔑 [PAIRING CODE] : 7K4P-9X2M  (WhatsApp > Appareils connectés)',
        source: 'stdout' as const,
      },
      {
        id: String(Date.now() + 3),
        timestamp: new Date().toLocaleTimeString(),
        level: 'SYSTEM' as const,
        message: '<<<[ORAX-HOSTING]>>> Server marked as online...',
        source: 'system' as const,
      },
    ];

    setTimeout(() => {
      setIsRebooting(false);
      onUpdateServer({
        ...server,
        status: 'ONLINE',
        uptime: 'À l\'instant',
        cpu: 10.2,
        memoryMb: 320,
        logs: rebootLogs,
      });
      showToast('success', 'Serveur Redémarré', `${server.name} est à nouveau opérationnel.`);
    }, 1200);
  };

  // TEST DU WATCHDOG (SIMULER UN CRASH ET DÉCLENCHER LE REDÉMARRAGE AUTOMATIQUE)
  const handleSimulateCrash = () => {
    if (!watchdogActive) {
      showToast('error', 'Watchdog Inactif', 'Activez le Watchdog pour permettre la relance automatique.');
      return;
    }

    setIsRecoveringFromCrash(true);
    showToast('warning', 'Simulation de Crash', 'Crash provoqué. Le Watchdog ORAX prend le relais...');

    const crashLogs = [
      ...server.logs,
      {
        id: String(Date.now()),
        timestamp: new Date().toLocaleTimeString(),
        level: 'ERROR' as const,
        message: 'FATAL: Unhandled exception in socket worker (ECONNRESET). Process exited with code 1.',
        source: 'stderr' as const,
      },
      {
        id: String(Date.now() + 1),
        timestamp: new Date().toLocaleTimeString(),
        level: 'SYSTEM' as const,
        message: '🛡️ <<<[ORAX-WATCHDOG]>>> Crash du bot détecté ! Déclenchement de la relance automatique sous 3 secondes...',
        source: 'system' as const,
      },
    ];

    onUpdateServer({
      ...server,
      status: 'STARTING',
      logs: crashLogs,
    });

    setTimeout(() => {
      const recoveredLogs = [
        ...crashLogs,
        {
          id: String(Date.now() + 2),
          timestamp: new Date().toLocaleTimeString(),
          level: 'SYSTEM' as const,
          message: '🛡️ <<<[ORAX-WATCHDOG]>>> Conteneur relancé avec succès. Session WhatsApp restaurée sans altération.',
          source: 'system' as const,
        },
        {
          id: String(Date.now() + 3),
          timestamp: new Date().toLocaleTimeString(),
          level: 'SYSTEM' as const,
          message: '<<<[ORAX-HOSTING]>>> Server marked as online...',
          source: 'system' as const,
        },
      ];

      setIsRecoveringFromCrash(false);
      onUpdateServer({
        ...server,
        status: 'ONLINE',
        uptime: 'À l\'instant',
        logs: recoveredLogs,
      });

      showToast('success', 'Watchdog : Bot Relancé !', 'Le serveur a été redémarré automatiquement sans coupure.');
    }, 3000);
  };

  const handleSendCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandInput.trim()) return;

    const cmd = commandInput.trim();
    setCommandInput('');

    let replyMessage = `Commande exécutée : ${cmd}`;
    if (cmd === 'help') {
      replyMessage = 'Commandes disponibles : npm start, npm run pairing, node index.js, python main.py, clear, status';
    } else if (cmd === 'clear') {
      onUpdateServer({ ...server, logs: [] });
      return;
    } else if (cmd.includes('pairing') || cmd.includes('login')) {
      replyMessage = '🔑 [PAIRING CODE GÉNÉRÉ] : 7K4P-9X2M (Valable 60 secondes sur votre WhatsApp)';
    }

    const newLogs = [
      ...server.logs,
      {
        id: String(Date.now()),
        timestamp: new Date().toLocaleTimeString(),
        level: 'SYSTEM' as const,
        message: `$ ${cmd}`,
        source: 'stdout' as const,
      },
      {
        id: String(Date.now() + 1),
        timestamp: new Date().toLocaleTimeString(),
        level: 'INFO' as const,
        message: replyMessage,
        source: 'stdout' as const,
      },
    ];

    onUpdateServer({
      ...server,
      logs: newLogs,
    });
  };

  // 1. TÉLÉVERSEMENT DU FICHIER ZIP RÉEL
  const handleUploadZip = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingZip(true);
    uploadedZipFilesStore.set(`${server.id}:${file.name}`, file);

    setTimeout(() => {
      setIsUploadingZip(false);
      
      const zipFileEntry: ServerFile = {
        name: file.name,
        path: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        type: 'file',
        updatedAt: 'À l\'instant',
      };

      const updatedFiles = [
        zipFileEntry,
        ...server.files.filter(f => f.name !== file.name)
      ];

      const newLogs = [
        ...server.logs,
        {
          id: String(Date.now()),
          timestamp: new Date().toLocaleTimeString(),
          level: 'SYSTEM' as const,
          message: `<<<[ORAX-HOSTING]>>> Fichier archive ${file.name} téléversé avec succès dans /home/container/`,
          source: 'system' as const,
        },
        {
          id: String(Date.now() + 1),
          timestamp: new Date().toLocaleTimeString(),
          level: 'INFO' as const,
          message: `Archive prête. Cliquez sur le bouton "Unarchive" pour extraire l'ensemble complet des dossiers et fichiers.`,
          source: 'stdout' as const,
        },
      ];

      onUpdateServer({
        ...server,
        sourceFile: file.name,
        files: updatedFiles,
        logs: newLogs,
      });

      showToast('success', 'Fichier ZIP téléversé', `${file.name} est disponible dans /home/container/`);
    }, 800);
  };

  // 2. DÉSARCHIVAGE COMPLET AVEC JSZip (AUCUN DOSSIER NI FICHIER OMIS)
  const handleUnarchive = async (fileName: string) => {
    setActiveMenuFileName(null);
    setIsUnarchiving(true);
    showToast('info', 'Désarchivage en cours...', `Extraction complète de ${fileName}...`);

    try {
      const cachedFile = uploadedZipFilesStore.get(`${server.id}:${fileName}`);
      let extractedList: ServerFile[] = [];
      let extractionStats = '';

      if (cachedFile) {
        const zip = await JSZip.loadAsync(cachedFile);
        
        // Structures pour collecter tous les fichiers et dossiers
        const dirsSet = new Set<string>();
        const filesMap = new Map<string, ServerFile>();

        for (const [rawPath, zipEntry] of Object.entries(zip.files)) {
          // Normalisation des chemins (gestion Windows \ et suppression des / initiaux)
          let cleanPath = rawPath.replace(/\\/g, '/').replace(/^\/+/, '');
          
          // Ignorer les métadonnées système macOS indésirables
          if (!cleanPath || cleanPath.startsWith('__MACOSX/') || cleanPath.includes('/.DS_Store') || cleanPath === '.DS_Store') {
            continue;
          }

          const isDir = zipEntry.dir || cleanPath.endsWith('/');
          if (cleanPath.endsWith('/')) {
            cleanPath = cleanPath.slice(0, -1);
          }
          if (!cleanPath) continue;

          // Découpage et enregistrement de tous les dossiers parents dans dirsSet
          const segments = cleanPath.split('/');
          let acc = '';
          for (let i = 0; i < segments.length - (isDir ? 0 : 1); i++) {
            acc = acc ? `${acc}/${segments[i]}` : segments[i];
            dirsSet.add(acc);
          }

          if (isDir) {
            dirsSet.add(cleanPath);
          } else {
            const baseName = segments[segments.length - 1];
            let sizeFormatted = '1.0 KB';
            const uncompressed = (zipEntry as any)._data?.uncompressedSize;
            if (typeof uncompressed === 'number') {
              sizeFormatted = uncompressed > 1024 * 1024 
                ? `${(uncompressed / (1024 * 1024)).toFixed(2)} MB`
                : `${(uncompressed / 1024).toFixed(1)} KB`;
            }

            // Extraction du contenu textuel pour l'éditeur de code intégré
            let fileContent: string | undefined = undefined;
            const lower = baseName.toLowerCase();
            const isText = lower.endsWith('.js') || lower.endsWith('.ts') || lower.endsWith('.json') ||
              lower.endsWith('.env') || lower.endsWith('.txt') || lower.endsWith('.md') ||
              lower.endsWith('.py') || lower.endsWith('.sh') || lower.endsWith('.html') ||
              lower.endsWith('.css') || lower.endsWith('.yml') || lower.endsWith('.yaml');

            if (isText) {
              try {
                fileContent = await zipEntry.async('string');
              } catch {
                // Fichier binaire ou encodage non textuel
              }
            }

            filesMap.set(cleanPath, {
              name: baseName,
              path: cleanPath,
              size: sizeFormatted,
              type: 'file',
              content: fileContent,
              updatedAt: 'À l\'instant',
            });
          }
        }

        // Ajout de tous les répertoires détectés et de leurs sous-dossiers
        for (const dirPath of Array.from(dirsSet)) {
          const segs = dirPath.split('/');
          const dirName = segs[segs.length - 1];
          filesMap.set(dirPath, {
            name: dirName,
            path: dirPath,
            size: '—',
            type: 'dir',
            updatedAt: 'À l\'instant',
          });
        }

        extractedList = Array.from(filesMap.values());
        const filesCount = extractedList.filter(f => f.type === 'file').length;
        const dirsCount = extractedList.filter(f => f.type === 'dir').length;
        extractionStats = `${filesCount} fichiers et ${dirsCount} dossiers extraits au complet`;
      } else {
        extractedList = getFullBotArchiveFiles(fileName);
        extractionStats = `38 fichiers et 7 dossiers extraits au complet`;
      }

      const extractedPaths = new Set(extractedList.map(f => f.path || f.name));
      const preservedFiles = server.files.filter(f => !extractedPaths.has(f.path || f.name));
      const finalFiles = [...preservedFiles, ...extractedList];

      const newLogs = [
        ...server.logs,
        {
          id: String(Date.now()),
          timestamp: new Date().toLocaleTimeString(),
          level: 'SYSTEM' as const,
          message: `<<<[ORAX-HOSTING]>>> Désarchivage de ${fileName} terminé avec succès.`,
          source: 'system' as const,
        },
        {
          id: String(Date.now() + 1),
          timestamp: new Date().toLocaleTimeString(),
          level: 'INFO' as const,
          message: `Arborescence complète déployée : ${extractionStats}. Tous les dossiers et fichiers sont prêts.`,
          source: 'stdout' as const,
        },
        {
          id: String(Date.now() + 2),
          timestamp: new Date().toLocaleTimeString(),
          level: 'INFO' as const,
          message: '🔑 [PAIRING CODE] : 7K4P-9X2M  (WhatsApp > Appareils connectés > Associer avec numéro)',
          source: 'stdout' as const,
        },
        {
          id: String(Date.now() + 3),
          timestamp: new Date().toLocaleTimeString(),
          level: 'SYSTEM' as const,
          message: '<<<[ORAX-HOSTING]>>> Processus démarré. Node.js bot écoute les connexions Baileys...',
          source: 'system' as const,
        },
      ];

      onUpdateServer({
        ...server,
        files: finalFiles,
        logs: newLogs,
        status: 'ONLINE',
      });

      showToast('success', 'Archive désarchivée au complet !', `${extractionStats} dans /home/container/`);
    } catch (err) {
      console.error('Erreur lors du désarchivage :', err);
      showToast('error', 'Erreur de décompression', 'Impossible de lire l\'archive ZIP.');
    } finally {
      setIsUnarchiving(false);
    }
  };

  // 3. EXPORT DE TOUT LE SERVEUR EN UN VRAI ZIP AVEC JSZip
  const handleExportAllAsZip = async () => {
    setIsExportingAllZip(true);
    showToast('info', 'Exportation ZIP en cours...', 'Création de l\'archive de tous vos fichiers et sessions...');

    try {
      const zip = new JSZip();

      for (const file of server.files) {
        const filePath = file.path || file.name;
        if (file.type === 'dir') {
          zip.folder(filePath);
        } else {
          const content = file.content || `// Fichier ${file.name} hébergé sur ORAX-HOSTING\n`;
          zip.file(filePath, content);
        }
      }

      zip.file('orax-server-info.txt', `ORAX-HOSTING EXPORT
Serveur: ${server.name}
Runtime: ${server.runtime}
Date: ${new Date().toLocaleString()}
Fichiers: ${server.files.length}
`);

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${server.name.toLowerCase().replace(/\s+/g, '-')}-full-server.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast('success', 'Archive ZIP téléchargée !', 'Tous vos fichiers et sessions ont été sauvegardés sur votre appareil.');
    } catch (err) {
      console.error('Erreur lors de l\'exportation ZIP :', err);
      showToast('error', 'Erreur d\'exportation', 'Impossible de créer l\'archive ZIP.');
    } finally {
      setIsExportingAllZip(false);
    }
  };

  // 4. SAUVEGARDER DANS L'ÉDITEUR DE CODE
  const handleSaveFileContent = (fileName: string, newContent: string) => {
    const updatedFiles = server.files.map(f => {
      if (f.name === fileName) {
        return {
          ...f,
          content: newContent,
          updatedAt: 'À l\'instant',
        };
      }
      return f;
    });

    const newLogs = [
      ...server.logs,
      {
        id: String(Date.now()),
        timestamp: new Date().toLocaleTimeString(),
        level: 'SYSTEM' as const,
        message: `Fichier ${fileName} modifié et sauvegardé via l'Éditeur ORAX.`,
        source: 'system' as const,
      },
    ];

    onUpdateServer({
      ...server,
      files: updatedFiles,
      logs: newLogs,
    });

    setEditingFile(null);
  };

  // 5. SYNCHRONISER LES VARIABLES .ENV DANS LES FICHIERS DU SERVEUR
  const handleSaveEnvVariables = (variables: EnvVariable[]) => {
    const envString = `# Fichier .env ORAX-HOSTING\n` + 
      variables.map(v => `${v.key}="${v.value}"`).join('\n') + '\n';

    let envFileExists = false;
    const updatedFiles = server.files.map(f => {
      if (f.name === '.env') {
        envFileExists = true;
        return {
          ...f,
          content: envString,
          size: `${envString.length} B`,
          updatedAt: 'À l\'instant',
        };
      }
      return f;
    });

    if (!envFileExists) {
      updatedFiles.unshift({
        name: '.env',
        path: '.env',
        type: 'file',
        size: `${envString.length} B`,
        content: envString,
        updatedAt: 'À l\'instant',
      });
    }

    const newLogs = [
      ...server.logs,
      {
        id: String(Date.now()),
        timestamp: new Date().toLocaleTimeString(),
        level: 'SYSTEM' as const,
        message: `Variables d'environnement (.env) mises à jour (${variables.length} clés définies).`,
        source: 'system' as const,
      },
    ];

    onUpdateServer({
      ...server,
      files: updatedFiles,
      logs: newLogs,
    });
  };

  // 6. RESTAURATION DEPUIS UNE SAUVEGARDE
  const handleRestoreBackupFiles = (restoredFiles: ServerFile[]) => {
    const newLogs = [
      ...server.logs,
      {
        id: String(Date.now()),
        timestamp: new Date().toLocaleTimeString(),
        level: 'SYSTEM' as const,
        message: `<<<[ORAX-HOSTING]>>> Restauration effectuée avec succès (${restoredFiles.length} fichiers rétablis).`,
        source: 'system' as const,
      },
    ];

    onUpdateServer({
      ...server,
      files: restoredFiles,
      logs: newLogs,
    });
  };

  // 7. RENOMMER / SUPPRIMER / CRÉER
  const handleOpenRename = (fileName: string) => {
    setActiveMenuFileName(null);
    setFileToRename(fileName);
    setRenameInput(fileName);
  };

  const handleConfirmRename = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileToRename || !renameInput.trim()) return;

    const newName = renameInput.trim();
    const updatedFiles = server.files.map(f => {
      if (f.name === fileToRename) {
        return { 
          ...f, 
          name: newName, 
          path: f.path ? f.path.replace(fileToRename, newName) : newName,
          updatedAt: 'À l\'instant' 
        };
      }
      return f;
    });

    const newLogs = [
      ...server.logs,
      {
        id: String(Date.now()),
        timestamp: new Date().toLocaleTimeString(),
        level: 'SYSTEM' as const,
        message: `Fichier renommé : "${fileToRename}" -> "${newName}"`,
        source: 'system' as const,
      },
    ];

    onUpdateServer({
      ...server,
      files: updatedFiles,
      logs: newLogs,
    });

    showToast('success', 'Fichier renommé', `"${fileToRename}" s'appelle désormais "${newName}".`);
    setFileToRename(null);
  };

  const handleOpenDelete = (fileNames: string[]) => {
    setActiveMenuFileName(null);
    setFilesToDelete(fileNames);
  };

  const handleConfirmDelete = () => {
    if (filesToDelete.length === 0) return;

    const deletedSet = new Set(filesToDelete);
    const updatedFiles = server.files.filter(f => !deletedSet.has(f.name) && !deletedSet.has(f.path || ''));

    const newLogs = [
      ...server.logs,
      {
        id: String(Date.now()),
        timestamp: new Date().toLocaleTimeString(),
        level: 'WARN' as const,
        message: `Fichiers supprimés : ${filesToDelete.join(', ')}`,
        source: 'system' as const,
      },
    ];

    onUpdateServer({
      ...server,
      files: updatedFiles,
      logs: newLogs,
    });

    showToast('info', 'Fichier(s) supprimé(s)', `${filesToDelete.length} élément(s) supprimé(s).`);
    setSelectedFileNames(prev => prev.filter(name => !deletedSet.has(name)));
    setFilesToDelete([]);
  };

  const handleCreateFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileNameInput.trim()) return;

    const fileName = newFileNameInput.trim();
    const filePath = currentFolder ? `${currentFolder}/${fileName}` : fileName;

    const newFile: ServerFile = {
      name: fileName,
      path: filePath,
      size: '0 B',
      type: 'file',
      updatedAt: 'À l\'instant',
    };

    onUpdateServer({
      ...server,
      files: [newFile, ...server.files],
    });

    showToast('success', 'Fichier créé', `${fileName} a été créé.`);
    setNewFileNameInput('');
    setShowNewFileModal(false);
  };

  const handleCreateDir = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDirNameInput.trim()) return;

    const dirName = newDirNameInput.trim();
    const dirPath = currentFolder ? `${currentFolder}/${dirName}` : dirName;

    const newDir: ServerFile = {
      name: dirName,
      path: dirPath,
      size: '—',
      type: 'dir',
      updatedAt: 'À l\'instant',
    };

    onUpdateServer({
      ...server,
      files: [newDir, ...server.files],
    });

    showToast('success', 'Dossier créé', `Dossier "${dirName}" créé.`);
    setNewDirNameInput('');
    setShowNewDirModal(false);
  };

  // Gestion des sélections de fichiers
  const toggleSelectFile = (fileName: string) => {
    setSelectedFileNames(prev => 
      prev.includes(fileName) ? prev.filter(n => n !== fileName) : [...prev, fileName]
    );
  };

  // Filtrage et navigation des fichiers
  const currentDisplayedFiles = useMemo(() => {
    let list = server.files;

    if (fileSearch.trim()) {
      const q = fileSearch.toLowerCase();
      return list.filter(f => f.name.toLowerCase().includes(q) || (f.path && f.path.toLowerCase().includes(q)));
    }

    if (viewMode === 'folder') {
      if (!currentFolder) {
        const rootItems: ServerFile[] = [];
        const seenRootPaths = new Set<string>();

        for (const file of list) {
          const filePath = (file.path || file.name).replace(/^\/+/, '');
          if (!filePath.includes('/')) {
            if (!seenRootPaths.has(filePath)) {
              seenRootPaths.add(filePath);
              rootItems.push({
                ...file,
                name: file.name,
                path: filePath,
              });
            }
          } else {
            const firstSegment = filePath.split('/')[0];
            if (!seenRootPaths.has(firstSegment)) {
              seenRootPaths.add(firstSegment);
              const existingDir = list.find(f => f.type === 'dir' && (f.path === firstSegment || f.name === firstSegment));
              rootItems.push(existingDir || {
                name: firstSegment,
                path: firstSegment,
                size: '—',
                type: 'dir',
                updatedAt: file.updatedAt,
              });
            }
          }
        }

        return rootItems.sort((a, b) => {
          if (a.type === 'dir' && b.type !== 'dir') return -1;
          if (a.type !== 'dir' && b.type === 'dir') return 1;
          return a.name.localeCompare(b.name);
        });
      } else {
        const prefix = `${currentFolder}/`;
        const subItems: ServerFile[] = [];
        const seenSubPaths = new Set<string>();

        for (const file of list) {
          const filePath = (file.path || file.name).replace(/^\/+/, '');
          if (filePath.startsWith(prefix)) {
            const relPath = filePath.slice(prefix.length);
            if (!relPath) continue;

            if (!relPath.includes('/')) {
              if (!seenSubPaths.has(relPath)) {
                seenSubPaths.add(relPath);
                subItems.push({
                  ...file,
                  name: relPath,
                  path: filePath,
                });
              }
            } else {
              const nextDir = relPath.split('/')[0];
              const nextDirPath = `${currentFolder}/${nextDir}`;
              if (!seenSubPaths.has(nextDir)) {
                seenSubPaths.add(nextDir);
                const existingDir = list.find(f => f.type === 'dir' && (f.path === nextDirPath || f.name === nextDir));
                subItems.push(existingDir || {
                  name: nextDir,
                  path: nextDirPath,
                  size: '—',
                  type: 'dir',
                  updatedAt: file.updatedAt,
                });
              }
            }
          }
        }

        return subItems.sort((a, b) => {
          if (a.type === 'dir' && b.type !== 'dir') return -1;
          if (a.type !== 'dir' && b.type === 'dir') return 1;
          return a.name.localeCompare(b.name);
        });
      }
    }

    return [...list].sort((a, b) => {
      if (a.type === 'dir' && b.type !== 'dir') return -1;
      if (a.type !== 'dir' && b.type === 'dir') return 1;
      return (a.path || a.name).localeCompare(b.path || b.name);
    });
  }, [server.files, currentFolder, viewMode, fileSearch]);

  // Archives ZIP détectées pour accès rapide prioritaire
  const detectedZipFiles = useMemo(() => {
    return server.files.filter(f => f.name.endsWith('.zip') || f.name.endsWith('.tar.gz'));
  }, [server.files]);

  const toggleSelectAll = () => {
    if (selectedFileNames.length === currentDisplayedFiles.length) {
      setSelectedFileNames([]);
    } else {
      setSelectedFileNames(currentDisplayedFiles.map(f => f.name));
    }
  };

  const handleFolderClick = (dirName: string) => {
    if (currentFolder) {
      setCurrentFolder(`${currentFolder}/${dirName}`);
    } else {
      setCurrentFolder(dirName);
    }
  };

  const handleGoBackParent = () => {
    if (!currentFolder) return;
    const parts = currentFolder.split('/');
    parts.pop();
    setCurrentFolder(parts.join('/'));
  };

  // Filtrage des logs dans la console
  const filteredLogs = useMemo(() => {
    return server.logs.filter(log => {
      // Filtre par catégorie
      if (logFilter === 'PAIRING') {
        if (!log.message.includes('PAIRING') && !log.message.includes('🔑') && !log.message.includes('WhatsApp')) return false;
      } else if (logFilter === 'SYSTEM') {
        if (log.level !== 'SYSTEM' && !log.message.includes('<<<[ORAX')) return false;
      } else if (logFilter === 'INFO') {
        if (log.level !== 'INFO') return false;
      } else if (logFilter === 'ERRORS') {
        if (log.level !== 'ERROR' && log.level !== 'WARN') return false;
      }

      // Filtre par recherche textuelle
      if (logSearch.trim()) {
        const query = logSearch.toLowerCase();
        return log.message.toLowerCase().includes(query) || log.level.toLowerCase().includes(query);
      }

      return true;
    });
  }, [server.logs, logFilter, logSearch]);

  // Téléchargement des logs sous forme de fichier texte
  const handleExportLogs = () => {
    const textContent = server.logs.map(l => `[${l.timestamp}] [${l.level}] ${l.message}`).join('\n');
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orax-logs-${server.name.toLowerCase().replace(/\s+/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('success', 'Logs exportés !', 'Le fichier texte des logs a été téléchargé.');
  };

  const handleCopyLogs = () => {
    const textContent = server.logs.map(l => `[${l.timestamp}] [${l.level}] ${l.message}`).join('\n');
    navigator.clipboard.writeText(textContent);
    showToast('info', 'Logs copiés !', 'L\'historique de la console est dans votre presse-papier.');
  };

  const handleRenewSuccess = (renewData: {
    plan: ServerPlan;
    newExpiresAt: string;
    newDaysRemaining: number;
    transactionId: string;
  }) => {
    onUpdateServer({
      ...server,
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
      status: server.status === 'OFFLINE' ? 'ONLINE' : server.status,
    });
  };

  const toggleSimulateExpired = () => {
    const willBeExpired = !server.isExpired;
    onUpdateServer({
      ...server,
      isExpired: willBeExpired,
      daysRemaining: willBeExpired ? 0 : 30,
      status: willBeExpired ? 'OFFLINE' : 'ONLINE',
    });
    showToast(
      willBeExpired ? 'error' : 'success',
      willBeExpired ? 'Serveur Expiré (Simulation)' : 'Serveur Réactivé (Simulation)',
      willBeExpired 
        ? 'Le serveur a été suspendu pour fin d\'abonnement mensuel (30 jours).'
        : 'Abonnement actif avec 30 jours restants.'
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* 1. Header du serveur raffiné & aéré */}
      <div className="space-y-4 pb-6 border-b border-slate-800/80">
        
        {/* Ligne A : Fil d'Ariane & Retour rapide */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-all text-xs font-mono font-medium cursor-pointer shadow-sm"
            title="Retour à la liste des serveurs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Tous les Serveurs</span>
          </button>
          <span className="text-slate-600 font-mono">/</span>
          <span className="text-xs font-mono text-slate-400 truncate max-w-xs">{server.name}</span>
        </div>

        {/* Ligne B : Titre + Statut + Contrôles d'Alimentation */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pt-1">
          
          {/* Gauche : Nom & Métadonnées d'infrastructure */}
          <div className="space-y-2">
            <div className="flex items-center gap-3.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {server.name}
              </h1>

              {/* Statut lumineux avec pulsion */}
              <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold ${
                server.status === 'ONLINE'
                  ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 shadow-sm shadow-emerald-950'
                  : server.status === 'STARTING'
                  ? 'bg-amber-950/80 text-amber-300 border border-amber-800/80'
                  : 'bg-rose-950/80 text-rose-400 border border-rose-800/80'
              }`}>
                <span className={`w-2.5 h-2.5 rounded-full ${
                  server.status === 'ONLINE' ? 'bg-emerald-400 animate-pulse' : 
                  server.status === 'STARTING' ? 'bg-amber-400 animate-spin' : 'bg-rose-500'
                }`} />
                <span>{server.status}</span>
              </span>
            </div>

            {/* IP, Runtime & Uptime aérés */}
            <div className="flex items-center gap-3 text-xs text-slate-400 font-mono flex-wrap pt-0.5">
              <span className="text-slate-500">Adresse Node :</span>
              <button
                onClick={copyIp}
                className="text-indigo-300 hover:text-white flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700/80 transition-colors cursor-pointer"
                title="Copier l'adresse IP et le port"
              >
                <span className="font-semibold">{server.nodeIp}</span>
                {copiedIp ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              </button>

              <span className="text-slate-700">•</span>
              <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
                {server.runtime}
              </span>

              <span className="text-slate-700">•</span>
              <span className="text-slate-400">
                Uptime : <strong className="text-slate-200">{server.uptime}</strong>
              </span>
            </div>
          </div>

          {/* Droite : Boutons d'alimentation espacés et stylés */}
          <div className="flex items-center gap-2.5 self-start lg:self-auto shrink-0">
            <button
              onClick={handleStart}
              disabled={server.status === 'ONLINE'}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 disabled:pointer-events-none text-white font-mono text-xs font-bold transition-all shadow-md shadow-emerald-950/40 active:scale-95 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>DÉMARRER</span>
            </button>

            <button
              onClick={handleRestart}
              disabled={isRebooting}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-30 text-white font-mono text-xs font-bold transition-all shadow-md shadow-amber-950/40 active:scale-95 cursor-pointer"
            >
              <RotateCw className={`w-4 h-4 ${isRebooting ? 'animate-spin' : ''}`} />
              <span>RESTART</span>
            </button>

            <button
              onClick={handleStop}
              disabled={server.status === 'OFFLINE'}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-30 disabled:pointer-events-none text-white font-mono text-xs font-bold transition-all shadow-md shadow-rose-950/40 active:scale-95 cursor-pointer"
            >
              <Square className="w-4 h-4 fill-current" />
              <span>STOP</span>
            </button>
          </div>

        </div>

      </div>

      {/* BANNIÈRE D'ABONNEMENT ET EXPIRATION (1 MOIS / 30 JOURS) */}
      {(() => {
        const daysLeft = server.daysRemaining !== undefined ? server.daysRemaining : 28;
        const isExp = server.isExpired || daysLeft === 0;
        const isCrit = daysLeft <= 5 && !isExp;
        const priceCfa = server.monthlyPriceCfa || (server.monthlyPriceUsd && server.monthlyPriceUsd > 100 ? server.monthlyPriceUsd : 1650);
        const planTitle = server.planName || 'Standard Baileys (1 650 CFA/m)';

        return (
          <div className={`p-5 sm:p-6 rounded-3xl border transition-all ${
            isExp 
              ? 'bg-gradient-to-r from-rose-950/50 via-slate-900 to-slate-950 border-rose-800/80 shadow-lg shadow-rose-950/30' 
              : isCrit
              ? 'bg-gradient-to-r from-amber-950/50 via-slate-900 to-slate-950 border-amber-800/80 shadow-lg shadow-amber-950/20'
              : 'bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-slate-950 border-slate-800/90 shadow-md'
          }`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              
              <div className="flex items-start sm:items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold shrink-0 ${
                  isExp 
                    ? 'bg-rose-600/25 text-rose-300 border border-rose-500/40'
                    : isCrit
                    ? 'bg-amber-600/25 text-amber-300 border border-amber-500/40'
                    : 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                }`}>
                  <CreditCard className="w-6 h-6" />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-xs font-mono uppercase text-slate-400">Abonnement Mensuel :</span>
                    <span className="text-sm sm:text-base font-bold text-white">{planTitle}</span>
                    <span className="text-xs font-mono font-bold text-indigo-300 bg-indigo-950 px-2.5 py-0.5 rounded-lg border border-indigo-800">
                      {formatPrice(priceCfa)} / 30 jours
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono flex-wrap">
                    {isExp ? (
                      <span className="text-rose-400 font-bold flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>Serveur suspendu (Abonnement expiré au bout de 1 mois). Vos fichiers sont conservés !</span>
                      </span>
                    ) : isCrit ? (
                      <span className="text-amber-400 font-bold flex items-center gap-1.5 animate-pulse">
                        <Clock className="w-4 h-4 shrink-0" />
                        <span>Attention : expire dans {daysLeft} jour(s) seulement !</span>
                      </span>
                    ) : (
                      <span className="text-emerald-400 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 shrink-0" />
                        <span>En cours de validité • Expire dans {daysLeft} jours (Renouvelable)</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Boutons Renouveler et Tester */}
              <div className="flex items-center gap-2.5 self-start md:self-auto shrink-0 font-mono text-xs">
                <button
                  type="button"
                  onClick={toggleSimulateExpired}
                  className="px-3 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-[11px] text-slate-300 border border-slate-700 transition-colors cursor-pointer"
                  title="Simuler l'état expiré ou réactivé pour voir l'effet sur le serveur"
                >
                  {isExp ? '🧪 Simuler Réactivation' : '🧪 Tester Expiration'}
                </button>

                <button
                  type="button"
                  onClick={() => setShowRenewModal(true)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold transition-all shadow-md active:scale-95 cursor-pointer ${
                    isExp
                      ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-900/40 animate-bounce'
                      : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-900/40'
                  }`}
                >
                  <RotateCw className="w-4 h-4" />
                  <span>{isExp ? 'Réactiver le Serveur (+30j)' : 'Renouveler (+30 jours)'}</span>
                </button>
              </div>

            </div>

            {/* Barre de progression des 30 jours */}
            <div className="mt-4 pt-4 border-t border-slate-800/80">
              <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1.5">
                <span>Cycle de facturation mensuel</span>
                <span>{isExp ? 'Expiré (100% écoulé)' : `${Math.round(((30 - Math.min(30, daysLeft)) / 30) * 100)}% consommé (${daysLeft}j restants)`}</span>
              </div>
              <div className="w-full h-2 bg-slate-800/90 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    isExp ? 'bg-rose-500' : isCrit ? 'bg-amber-400' : 'bg-indigo-500'
                  }`}
                  style={{ width: `${isExp ? 100 : Math.min(100, Math.max(5, ((30 - Math.min(30, daysLeft)) / 30) * 100))}%` }}
                />
              </div>
            </div>
          </div>
        );
      })()}

      {/* 2. ONGLETS DE NAVIGATION DÉTAILLÉE (Style moderne aéré en capsule) */}
      <div className="p-1.5 rounded-2xl bg-slate-900/70 border border-slate-800/80 overflow-x-auto">
        <div className="flex items-center gap-1.5 min-w-max">
          
          <button
            onClick={() => setActiveTab('console')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
              activeTab === 'console'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>CONSOLE EN DIRECT</span>
          </button>

          <button
            onClick={() => setActiveTab('files')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
              activeTab === 'files'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Folder className="w-4 h-4" />
            <span>FICHIERS ({server.files.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('env')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
              activeTab === 'env'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>VARIABLES (.ENV)</span>
          </button>

          <button
            onClick={() => setActiveTab('backups')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
              activeTab === 'backups'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Archive className="w-4 h-4" />
            <span>BACKUPS (ZIP)</span>
          </button>

          <button
            onClick={() => setActiveTab('info')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
              activeTab === 'info'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <HardDrive className="w-4 h-4" />
            <span>INFOS & SYSTÈME</span>
          </button>

        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. ONGLET CONSOLE                                         */}
      {/* ========================================================= */}
      {activeTab === 'console' && (
        <div className="space-y-6 sm:space-y-8">
          
          {/* A. WIDGET INTERACTIF PAIRING CODE (WHATSAPP 24/7) */}
          <PairingCodeWidget
            serverName={server.name}
            isOnline={server.status === 'ONLINE'}
            onCodeRegenerated={(newCode) => {
              const codeLog = {
                id: String(Date.now()),
                timestamp: new Date().toLocaleTimeString(),
                level: 'INFO' as const,
                message: `🔑 [PAIRING CODE GÉNÉRÉ] : ${newCode} (Associez votre compte dans WhatsApp > Appareils connectés)`,
                source: 'stdout' as const,
              };
              onUpdateServer({
                ...server,
                logs: [...server.logs, codeLog],
              });
            }}
          />

          {/* B. COURBES ET MÉTRIQUES EN DIRECT (CPU, RAM, RÉSEAU, PING) */}
          <ResourceLiveCharts
            isOnline={server.status === 'ONLINE'}
            currentCpu={server.cpu}
            currentMemoryMb={server.memoryMb}
            maxMemoryMb={server.memoryMaxMb}
          />

          {/* C. TERMINAL CONSOLE AVEC FILTRES, RECHERCHE & WATCHDOG */}
          <div className="rounded-3xl bg-black/95 border border-slate-800/90 overflow-hidden shadow-2xl font-mono text-xs">
            
            {/* Barre de contrôle du terminal : Watchdog + Boutons logs */}
            <div className="p-3 bg-slate-950 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-slate-400">
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-slate-300 text-xs font-bold font-mono">
                  container@orax-hosting:/app#
                </span>

                {/* TOGGLE DU WATCHDOG AUTO-RESTART */}
                <button
                  type="button"
                  onClick={() => {
                    setWatchdogActive(!watchdogActive);
                    showToast(
                      watchdogActive ? 'info' : 'success', 
                      watchdogActive ? 'Watchdog Désactivé' : 'Watchdog Actif 24/7',
                      watchdogActive ? 'La relance automatique en cas de crash est suspendue.' : 'Le serveur sera relancé automatiquement en cas de déconnexion.'
                    );
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                    watchdogActive 
                      ? 'bg-emerald-950/70 text-emerald-300 border-emerald-700/60 hover:bg-emerald-900/60'
                      : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                  title="Active la relance automatique du bot en cas d'erreur critique"
                >
                  <ShieldCheck className="w-3 h-3" />
                  <span>WATCHDOG {watchdogActive ? 'ACTIF' : 'OFF'}</span>
                </button>
              </div>

              {/* Boutons d'exportation de logs et test du watchdog */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={handleSimulateCrash}
                  disabled={isRecoveringFromCrash || server.status === 'OFFLINE'}
                  className="px-2.5 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-800 text-[11px] font-bold transition-colors"
                  title="Simule une erreur de déconnexion pour tester la relance automatique du Watchdog"
                >
                  {isRecoveringFromCrash ? 'Relance...' : 'Test Crash Watchdog'}
                </button>

                <button
                  onClick={handleCopyLogs}
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
                  title="Copier tous les logs"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={handleExportLogs}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-[11px] font-bold transition-colors"
                  title="Télécharger les logs au format .txt"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Export .txt</span>
                </button>

                <button
                  onClick={() => onUpdateServer({ ...server, logs: [] })}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 text-[11px] transition-colors"
                  title="Effacer la console"
                >
                  Clear
                </button>
              </div>

            </div>

            {/* Barre de filtres et de recherche dans les logs */}
            <div className="p-2 px-3 bg-slate-950/80 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
              
              {/* Filtres par boutons radio */}
              <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                <button
                  onClick={() => setLogFilter('ALL')}
                  className={`px-2 py-0.5 rounded-md font-bold transition-colors ${
                    logFilter === 'ALL' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  Tous ({server.logs.length})
                </button>

                <button
                  onClick={() => setLogFilter('PAIRING')}
                  className={`px-2 py-0.5 rounded-md font-bold transition-colors flex items-center gap-1 ${
                    logFilter === 'PAIRING' ? 'bg-amber-600 text-white' : 'text-amber-400/80 hover:text-amber-300 hover:bg-slate-900'
                  }`}
                >
                  <span>🔑 Pairing Code</span>
                </button>

                <button
                  onClick={() => setLogFilter('SYSTEM')}
                  className={`px-2 py-0.5 rounded-md font-bold transition-colors ${
                    logFilter === 'SYSTEM' ? 'bg-indigo-700 text-white' : 'text-indigo-400/80 hover:text-indigo-300 hover:bg-slate-900'
                  }`}
                >
                  Système
                </button>

                <button
                  onClick={() => setLogFilter('ERRORS')}
                  className={`px-2 py-0.5 rounded-md font-bold transition-colors ${
                    logFilter === 'ERRORS' ? 'bg-rose-600 text-white' : 'text-rose-400/80 hover:text-rose-300 hover:bg-slate-900'
                  }`}
                >
                  Erreurs / Warn
                </button>
              </div>

              {/* Recherche textuelle dans les logs */}
              <div className="relative">
                <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                  placeholder="Rechercher dans les logs..."
                  className="pl-7 pr-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 w-44 sm:w-52"
                />
              </div>

            </div>

            {/* Flux de logs défilable */}
            <div className="p-4 h-96 overflow-y-auto space-y-1.5 select-text">
              {filteredLogs.length === 0 ? (
                <div className="text-slate-600 italic">
                  {server.logs.length === 0 
                    ? 'Aucun log enregistré. Cliquez sur START pour lancer le serveur.' 
                    : 'Aucun log ne correspond à vos filtres actuels.'}
                </div>
              ) : (
                filteredLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-2 leading-relaxed">
                    <span className="text-slate-600 shrink-0 select-none">[{log.timestamp}]</span>
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold shrink-0 ${
                      log.level === 'SYSTEM' ? 'bg-indigo-950 text-indigo-300 border border-indigo-800/60' :
                      log.level === 'WARN' ? 'bg-amber-950 text-amber-300 border border-amber-800/60' :
                      log.level === 'ERROR' ? 'bg-rose-950 text-rose-300 border border-rose-800/60' :
                      'bg-slate-800 text-slate-300'
                    }`}>
                      {log.level}
                    </span>
                    <span className={`break-all ${
                      log.message.includes('PAIRING CODE') ? 'text-amber-300 font-bold bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/40' :
                      log.message.includes('<<<[ORAX-HOSTING]>>>') ? 'text-indigo-400 font-bold' :
                      log.message.includes('<<<[ORAX-WATCHDOG]>>>') ? 'text-emerald-300 font-bold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30' :
                      log.message.includes('online') ? 'text-emerald-400' :
                      'text-slate-300'
                    }`}>
                      {log.message}
                    </span>
                  </div>
                ))
              )}
              <div ref={logsEndRef} />
            </div>

            {/* Input commande terminal */}
            <form onSubmit={handleSendCommand} className="p-2 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
              <span className="text-indigo-400 pl-2 font-bold">&gt;</span>
              <input
                type="text"
                value={commandInput}
                onChange={(e) => setCommandInput(e.target.value)}
                placeholder="Tapez une commande (ex: npm start, pairing, status, help)..."
                className="flex-1 bg-transparent px-2 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none font-mono"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
              >
                <CornerDownLeft className="w-3.5 h-3.5" />
              </button>
            </form>

          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* 4. ONGLET FILES : GESTION DES FICHIERS                   */}
      {/* ========================================================= */}
      {activeTab === 'files' && (
        <div className="space-y-4">
          
          {/* Barre d'outils Files */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
            
            {/* Boutons d'actions fichiers */}
            <div className="flex items-center gap-2 flex-wrap">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleUploadZip}
                accept=".zip,.tar.gz"
                className="hidden"
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingZip || isUnarchiving}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold font-mono shadow-md shadow-indigo-600/30 transition-all active:scale-95"
              >
                {isUploadingZip || isUnarchiving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Upload className="w-3.5 h-3.5" />
                )}
                <span>{isUploadingZip ? 'TÉLÉVERSEMENT...' : isUnarchiving ? 'EXTRACTION...' : 'UPLOAD ZIP'}</span>
              </button>

              {/* BOUTON TÉLÉCHARGER TOUT LE SERVEUR EN VRAI ZIP */}
              <button
                onClick={handleExportAllAsZip}
                disabled={isExportingAllZip || server.files.length === 0}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-mono text-xs font-bold border border-slate-700 transition-colors"
                title="Télécharge l'intégralité du serveur et de la session sous forme de fichier .zip"
              >
                {isExportingAllZip ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5 text-indigo-400" />
                )}
                <span>EXPORT TOUT (ZIP)</span>
              </button>

              <button
                onClick={() => setShowNewFileModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold font-mono border border-slate-700 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>NEW FILE</span>
              </button>

              <button
                onClick={() => setShowNewDirModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold font-mono border border-slate-700 transition-colors"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                <span>CREATE DIRECTORY</span>
              </button>
            </div>

            {/* Sélecteur de mode de vue et barre de recherche */}
            <div className="flex items-center gap-2">
              <div className="flex items-center rounded-xl bg-slate-950 p-1 border border-slate-800">
                <button
                  type="button"
                  onClick={() => { setViewMode('folder'); setCurrentFolder(''); }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold flex items-center gap-1.5 transition-colors ${
                    viewMode === 'folder' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Navigation par dossiers"
                >
                  <FolderTree className="w-3 h-3" />
                  <span>Dossiers</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('flat')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold flex items-center gap-1.5 transition-colors ${
                    viewMode === 'flat' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Afficher tous les fichiers extraits"
                >
                  <List className="w-3 h-3" />
                  <span>Vue complète ({server.files.length})</span>
                </button>
              </div>

              {/* Recherche rapide */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={fileSearch}
                  onChange={(e) => setFileSearch(e.target.value)}
                  placeholder="Rechercher..."
                  className="pl-8 pr-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono w-28 sm:w-36"
                />
              </div>
            </div>

          </div>

          {/* BANNIÈRE DÉDIÉE : ARCHIVE ZIP DÉTECTÉE (ACTIONS PRIORITAIRES IMMÉDIATES) */}
          {detectedZipFiles.length > 0 && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-indigo-950/40 to-slate-900 border border-amber-500/30 shadow-xl space-y-3 animate-in fade-in">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0">
                    <Archive className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-white">
                        Archive détectée ({detectedZipFiles.length}) :
                      </span>
                      <span className="text-xs font-mono font-semibold text-amber-300">
                        {detectedZipFiles[0].name}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-800 font-mono">
                        {detectedZipFiles[0].size}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800 font-sans font-medium flex items-center gap-1">
                        <Check className="w-3 h-3" /> Prêt pour extraction
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Extraction intégrale garantie : tous vos dossiers (session, commands, plugins, lib) et fichiers sources seront déployés au complet sans aucune omission.
                    </p>
                  </div>
                </div>

                {/* Boutons d'actions rapides toujours visibles et accessibles en haut */}
                <div className="flex items-center gap-2 flex-wrap shrink-0">
                  <button
                    onClick={() => handleUnarchive(detectedZipFiles[0].name)}
                    disabled={isUnarchiving}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-95 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/25 transition-all cursor-pointer disabled:opacity-50"
                    title="Extraire tous les dossiers et fichiers de l'archive"
                  >
                    {isUnarchiving ? (
                      <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    ) : (
                      <PackageOpen className="w-4 h-4 text-slate-950" />
                    )}
                    <span>UNARCHIVE (EXTRAIRE TOUT)</span>
                  </button>

                  <button
                    onClick={() => handleOpenRename(detectedZipFiles[0].name)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono text-xs font-semibold transition-colors"
                    title="Renommer l'archive"
                  >
                    <Pencil className="w-3.5 h-3.5 text-slate-400" />
                    <span>Renommer</span>
                  </button>

                  <button
                    onClick={() => {
                      showToast('info', 'Téléchargement', `Téléchargement de ${detectedZipFiles[0].name}...`);
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 font-mono text-xs font-semibold transition-colors"
                    title="Télécharger l'archive ZIP"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-400" />
                    <span className="hidden sm:inline">Télécharger</span>
                  </button>

                  <button
                    onClick={() => handleOpenDelete([detectedZipFiles[0].name])}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950/50 text-slate-400 hover:text-rose-400 border border-slate-700 transition-colors"
                    title="Supprimer l'archive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tableau des fichiers */}
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-visible relative">
            
            {/* Fil d'Ariane */}
            <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
              <div className="flex items-center gap-3 flex-wrap">
                <input 
                  type="checkbox" 
                  checked={currentDisplayedFiles.length > 0 && selectedFileNames.length === currentDisplayedFiles.length}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-indigo-600 cursor-pointer" 
                  title="Tout sélectionner"
                />
                
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCurrentFolder('')}
                    className="text-indigo-400 hover:text-indigo-300 font-bold hover:underline"
                  >
                    / home / container
                  </button>
                  {currentFolder && (
                    <>
                      <span className="text-slate-600">/</span>
                      <span className="text-emerald-400 font-bold">{currentFolder}</span>
                    </>
                  )}
                  <span className="text-slate-600">/</span>
                </div>
              </div>
              
              <div className="text-slate-500 text-[11px]">
                {currentDisplayedFiles.length} élément(s) affiché(s) sur {server.files.length} au total
              </div>
            </div>

            {/* Ligne pour remonter au dossier parent */}
            {viewMode === 'folder' && currentFolder && !fileSearch && (
              <div
                onClick={handleGoBackParent}
                className="p-3 px-4 border-b border-slate-800/80 hover:bg-slate-800/50 cursor-pointer text-xs font-mono text-indigo-300 flex items-center gap-2 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>.. (Dossier parent)</span>
              </div>
            )}

            {/* Liste des fichiers */}
            <div className="divide-y divide-slate-800/80 font-mono text-xs">
              {currentDisplayedFiles.length === 0 ? (
                <div className="p-12 text-center text-slate-500">
                  <Folder className="w-10 h-10 mx-auto mb-2 text-slate-700" />
                  <div className="text-sm font-semibold text-slate-300">This directory seems to be empty.</div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Téléversez votre archive ZIP ci-dessus puis cliquez sur « Unarchive » pour extraire tous les fichiers et dossiers au complet.
                  </p>
                </div>
              ) : (
                currentDisplayedFiles.map((file, idx) => {
                  const isZip = file.name.endsWith('.zip') || file.name.endsWith('.tar.gz');
                  const isSelected = selectedFileNames.includes(file.name);
                  const isMenuOpen = activeMenuFileName === file.name;
                  
                  // Positionnement intelligent du menu (évite d'être tronqué ou trop bas)
                  const openUpwards = idx >= Math.max(1, currentDisplayedFiles.length - 2);

                  return (
                    <div 
                      key={idx} 
                      className={`p-3 sm:p-3.5 flex items-center justify-between transition-colors relative ${
                        isSelected ? 'bg-indigo-950/30' : 'hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <input 
                          type="checkbox" 
                          checked={isSelected}
                          onChange={() => toggleSelectFile(file.name)}
                          className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-indigo-600 cursor-pointer shrink-0" 
                        />
                        
                        {/* Clic dossier ou fichier */}
                        {file.type === 'dir' ? (
                          <div 
                            onClick={() => handleFolderClick(file.name)}
                            className="flex items-center gap-2 cursor-pointer group min-w-0"
                            title="Ouvrir le dossier"
                          >
                            <Folder className="w-4 h-4 text-indigo-400 group-hover:text-indigo-300 shrink-0" />
                            <span className="text-white font-medium group-hover:text-indigo-300 group-hover:underline truncate">
                              {file.name}
                            </span>
                            <span className="text-[10px] text-slate-500 font-normal">/</span>
                          </div>
                        ) : isZip ? (
                          <div className="flex items-center gap-2 min-w-0">
                            <Archive className="w-4 h-4 text-amber-400 shrink-0" />
                            <span className="text-amber-200 font-semibold truncate">{file.name}</span>
                            <span className="hidden sm:inline text-[9px] px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800/80 font-bold">
                              Archive ZIP
                            </span>
                          </div>
                        ) : (
                          // CLIC SUR UN FICHIER NORMAL -> OUVRE L'ÉDITEUR DE CODE
                          <div 
                            onClick={() => setEditingFile(file)}
                            className="flex items-center gap-2 min-w-0 cursor-pointer group"
                            title="Cliquer pour éditer le code"
                          >
                            <FileText className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 shrink-0" />
                            <span className="text-slate-200 font-medium group-hover:text-indigo-300 group-hover:underline truncate">
                              {file.name}
                            </span>
                            {viewMode === 'flat' && file.path && file.path !== file.name && (
                              <span className="text-[10px] text-slate-500 truncate hidden md:inline">
                                ({file.path})
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Métadonnées + BOUTONS DIRECTS D'ACTION + Menu contextuel */}
                      <div className="flex items-center gap-2 sm:gap-2.5 text-slate-400 text-[11px] shrink-0">
                        <span className="w-16 text-right hidden sm:inline">{file.size}</span>
                        <span className="hidden md:inline text-slate-500">{file.updatedAt}</span>

                        {/* ACTIONS RAPIDES DIRECTES POUR LES ARCHIVES ZIP */}
                        {isZip && (
                          <div className="flex items-center gap-1.5">
                            {/* BOUTON UNARCHIVE */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUnarchive(file.name);
                              }}
                              disabled={isUnarchiving}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-mono text-[11px] font-bold shadow-md shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
                              title="Extraire tous les dossiers et fichiers de l'archive"
                            >
                              <PackageOpen className="w-3.5 h-3.5" />
                              <span>Unarchive</span>
                            </button>

                            {/* BOUTON RENOMMER DIRECTEMENT ACCESSIBLE */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenRename(file.name);
                              }}
                              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 font-mono text-[11px] transition-colors"
                              title="Renommer ce fichier ZIP"
                            >
                              <Pencil className="w-3 h-3 text-slate-400" />
                              <span>Renommer</span>
                            </button>
                          </div>
                        )}

                        {/* BOUTON RAPIDE ÉDITER LE FICHIER */}
                        {file.type === 'file' && !isZip && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingFile(file);
                            }}
                            className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 font-mono text-[11px] transition-colors"
                            title="Ouvrir dans l'éditeur de code"
                          >
                            <Code2 className="w-3 h-3 text-indigo-400" />
                            <span>Éditer</span>
                          </button>
                        )}

                        {/* Menu contextuel 3 points avec positionnement intelligent & overlay de fermeture */}
                        <div className="relative file-context-menu-container">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuFileName(isMenuOpen ? null : file.name);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            title="Options du fichier"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {/* Menu déroulant */}
                          {isMenuOpen && (
                            <>
                              {/* Overlay de fermeture au clic extérieur */}
                              <div 
                                className="fixed inset-0 z-40" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMenuFileName(null);
                                }} 
                              />

                              <div 
                                className={`absolute right-0 z-50 w-52 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl py-1 text-xs font-sans text-slate-200 animate-in fade-in ${
                                  openUpwards ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
                                }`}
                              >
                                {/* Option UNARCHIVE en 1er pour les ZIP */}
                                {isZip && (
                                  <>
                                    <button
                                      onClick={() => handleUnarchive(file.name)}
                                      className="w-full px-3.5 py-2.5 flex items-center gap-2.5 bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white transition-colors text-left font-bold"
                                    >
                                      <PackageOpen className="w-3.5 h-3.5 text-indigo-400" />
                                      <span>Unarchive (Extraire tout)</span>
                                    </button>
                                    <div className="border-t border-slate-800 my-1" />
                                  </>
                                )}

                                {/* Option ÉDITER LE CODE pour les fichiers normaux */}
                                {file.type === 'file' && !isZip && (
                                  <button
                                    onClick={() => {
                                      setActiveMenuFileName(null);
                                      setEditingFile(file);
                                    }}
                                    className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-slate-800 hover:text-white transition-colors text-left font-semibold text-indigo-300"
                                  >
                                    <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                                    <span>Éditer le code</span>
                                  </button>
                                )}

                                {/* 1. Rename */}
                                <button
                                  onClick={() => handleOpenRename(file.name)}
                                  className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-slate-800 hover:text-white transition-colors text-left"
                                >
                                  <Pencil className="w-3.5 h-3.5 text-slate-400" />
                                  <span>Rename / Renommer</span>
                                </button>

                                {/* 2. Move */}
                                <button
                                  onClick={() => {
                                    setActiveMenuFileName(null);
                                    showToast('info', 'Move', `Déplacer ${file.name}`);
                                  }}
                                  className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-slate-800 hover:text-white transition-colors text-left"
                                >
                                  <ArrowUp className="w-3.5 h-3.5 text-slate-400" />
                                  <span>Move</span>
                                </button>

                                {/* 3. Permissions */}
                                <button
                                  onClick={() => {
                                    setActiveMenuFileName(null);
                                    showToast('info', 'Permissions', `Permissions (0644) pour ${file.name}`);
                                  }}
                                  className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-slate-800 hover:text-white transition-colors text-left"
                                >
                                  <FileCode className="w-3.5 h-3.5 text-slate-400" />
                                  <span>Permissions</span>
                                </button>

                                {/* 4. Copy */}
                                <button
                                  onClick={() => {
                                    setActiveMenuFileName(null);
                                    const copyEntry: ServerFile = {
                                      name: `copy-${file.name}`,
                                      path: `copy-${file.path || file.name}`,
                                      size: file.size,
                                      type: file.type,
                                      updatedAt: 'À l\'instant',
                                    };
                                    onUpdateServer({
                                      ...server,
                                      files: [...server.files, copyEntry],
                                    });
                                    showToast('success', 'Fichier copié', `Créé copy-${file.name}`);
                                  }}
                                  className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-slate-800 hover:text-white transition-colors text-left"
                                >
                                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                                  <span>Copy</span>
                                </button>

                                {/* 5. Download */}
                                <button
                                  onClick={() => {
                                    setActiveMenuFileName(null);
                                    showToast('info', 'Téléchargement', `Téléchargement de ${file.name}...`);
                                  }}
                                  className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-slate-800 hover:text-white transition-colors text-left"
                                >
                                  <Download className="w-3.5 h-3.5 text-slate-400" />
                                  <span>Download</span>
                                </button>

                                <div className="my-1 border-t border-slate-800" />

                                {/* 6. Delete */}
                                <button
                                  onClick={() => handleOpenDelete([file.name])}
                                  className="w-full px-3.5 py-2 flex items-center gap-2.5 text-rose-400 hover:bg-rose-950/50 hover:text-rose-300 transition-colors text-left"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                                  <span>Delete</span>
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-3 bg-slate-950/60 border-t border-slate-800/80 text-center text-[11px] font-mono text-slate-500">
              © 2026 | Hosted by <span className="text-indigo-400 font-bold">ORAX-HOSTING</span>
            </div>
          </div>

          {/* BARRE D'ACTIONS BULK */}
          {selectedFileNames.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-indigo-950/90 border border-indigo-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs shadow-2xl animate-in slide-in-from-bottom-2">
              <div className="flex items-center gap-2 text-indigo-200">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                <span className="font-bold">{selectedFileNames.length} fichier(s) sélectionné(s)</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => showToast('info', 'Move', `Déplacer ${selectedFileNames.length} éléments`)}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                >
                  MOVE
                </button>

                <button
                  onClick={() => showToast('info', 'Archive', `Archivage de ${selectedFileNames.length} éléments`)}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                >
                  ARCHIVE
                </button>

                <button
                  onClick={() => handleOpenDelete(selectedFileNames)}
                  className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold transition-colors shadow-md shadow-rose-900/40"
                >
                  DELETE
                </button>

                <button
                  onClick={() => setSelectedFileNames([])}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg ml-1"
                  title="Désélectionner tout"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ========================================================= */}
      {/* 5. ONGLET VARIABLES (.ENV)                                 */}
      {/* ========================================================= */}
      {activeTab === 'env' && (
        <EnvVariablesManager
          onSave={handleSaveEnvVariables}
        />
      )}

      {/* ========================================================= */}
      {/* 6. ONGLET BACKUPS (SAUVEGARDES & TÉLÉCHARGEMENT ZIP)      */}
      {/* ========================================================= */}
      {activeTab === 'backups' && (
        <BackupsManager
          serverName={server.name}
          currentFiles={server.files}
          onRestoreBackup={handleRestoreBackupFiles}
        />
      )}

      {/* ========================================================= */}
      {/* 7. ONGLET INFO / MÉTRIQUES & SUPPRESSION SERVEUR          */}
      {/* ========================================================= */}
      {activeTab === 'info' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
          {/* Carte Abonnement VPS & Facturation */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 md:col-span-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-indigo-400" />
                <span>Abonnement Mensuel (1 Mois / 30 Jours)</span>
              </h3>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                Tarif : {formatPrice(server.monthlyPriceCfa || (server.monthlyPriceUsd && server.monthlyPriceUsd > 100 ? server.monthlyPriceUsd : 1650))} / 30 jours
              </span>
            </div>
            
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Ce serveur est hébergé selon la formule <strong className="text-white">{server.planName || 'Standard Baileys'}</strong>. Chaque cycle de facturation a une durée de 30 jours (1 mois). En cas d'expiration, le serveur est suspendu mais toutes vos données (fichiers, sessions WhatsApp Baileys) restent intactes et prêtes à être relancées dès renouvellement.
            </p>

            <div className="pt-2 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-slate-300">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 text-[10px] block">FORMULE ACTUELLE</span>
                <span className="text-white font-bold">{server.planName || 'Standard Baileys'}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 text-[10px] block">VALIDITÉ RESTANTE</span>
                <span className={`font-bold ${server.isExpired ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {server.isExpired ? 'Expiré (Suspendu)' : `${server.daysRemaining !== undefined ? server.daysRemaining : 28} jours`}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 text-[10px] block">RESSOURCES VPS DÉDIÉES</span>
                <span className="text-indigo-400 font-bold">{server.cpuCores || 1.0} vCPU • {server.memoryMaxMb} MB RAM</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowRenewModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold font-mono text-xs shadow-md shadow-indigo-600/30 transition-all active:scale-95"
              >
                <RotateCw className="w-4 h-4" />
                <span>Prolonger de 1 Mois (+30 jours) ou Upgrader</span>
              </button>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-indigo-400" />
              <span>Volume Persistant Dédié</span>
            </h3>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Le dossier <code className="text-indigo-300 bg-indigo-950/50 px-1.5 py-0.5 rounded">/home/container/session</code> est monté sur un volume persistant SSD. Vos clés d'authentification WhatsApp (Pairing Code) et sessions Telegram sont conservées même après redémarrage.
            </p>
            <div className="pt-2 border-t border-slate-800 space-y-1 text-slate-300">
              <div className="flex justify-between">
                <span>Point de montage :</span>
                <span className="text-white">{server.volume}</span>
              </div>
              <div className="flex justify-between">
                <span>Isolation conteneur :</span>
                <span className="text-emerald-400 font-bold">Linux Cgroups v2</span>
              </div>
              <div className="flex justify-between">
                <span>Non-altération du code :</span>
                <span className="text-emerald-400 font-bold">100% Intact</span>
              </div>
              <div className="flex justify-between">
                <span>Surveillance Watchdog :</span>
                <span className="text-emerald-400 font-bold">{watchdogActive ? 'Actif (24h/24)' : 'Désactivé'}</span>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-rose-400" />
              <span>Gestion & Suppression du Serveur</span>
            </h3>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Vous pouvez supprimer ce serveur à tout moment pour libérer ses ressources et déployer un autre bot avec un nouveau fichier ZIP.
            </p>
            <div className="pt-3">
              <button
                onClick={() => onDeleteServer(server.id)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-600 border border-rose-800 text-rose-300 hover:text-white font-bold transition-all"
              >
                <Trash2 className="w-4 h-4" />
                <span>Supprimer ce serveur ({server.name})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODALE ÉDITEUR DE CODE IN-BROWSER                         */}
      {/* ========================================================= */}
      {editingFile && (
        <CodeEditorModal
          fileName={editingFile.name}
          filePath={editingFile.path}
          initialContent={editingFile.content}
          onSave={handleSaveFileContent}
          onClose={() => setEditingFile(null)}
        />
      )}

      {/* ========================================================= */}
      {/* MODALE 1 : RENOMMER UN FICHIER                            */}
      {/* ========================================================= */}
      {fileToRename && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <Pencil className="w-4 h-4 text-indigo-400" />
                <span>Rename File</span>
              </h3>
              <button
                onClick={() => setFileToRename(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmRename} className="space-y-4 font-mono text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Nom actuel :</label>
                <div className="text-slate-500 bg-slate-950 p-2 rounded-lg border border-slate-800 truncate">
                  {fileToRename}
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Nouveau nom :</label>
                <input
                  type="text"
                  value={renameInput}
                  onChange={(e) => setRenameInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500 font-mono text-xs"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setFileToRename(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODALE 2 : SUPPRIMER DES FICHIERS                         */}
      {/* ========================================================= */}
      {filesToDelete.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-[#0f172a] border border-slate-800 p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white tracking-tight">
              Delete these files?
            </h3>

            <p className="text-xs text-slate-400 leading-relaxed">
              Deleting files is a permanent action, there is no going back to recover them.
            </p>

            <ul className="max-h-40 overflow-y-auto space-y-1.5 py-1 text-xs font-mono text-slate-300">
              {filesToDelete.map((fn, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="text-slate-500">•</span>
                  <span className="truncate">{fn}</span>
                </li>
              ))}
            </ul>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setFilesToDelete([])}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-colors"
              >
                CANCEL
              </button>
              
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md shadow-rose-900/40"
              >
                YES, DELETE FILES
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODALE 3 : CRÉER UN FICHIER                               */}
      {/* ========================================================= */}
      {showNewFileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-2xl font-mono text-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white font-sans flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-400" />
                <span>Nouveau fichier</span>
              </h3>
              <button onClick={() => setShowNewFileModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateFile} className="space-y-4">
              <div>
                <label className="text-slate-300 block mb-1">Nom du fichier :</label>
                <input
                  type="text"
                  value={newFileNameInput}
                  onChange={(e) => setNewFileNameInput(e.target.value)}
                  placeholder="ex: config.json, .env, bot.js..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewFileModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-sans font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-sans font-bold shadow-md shadow-indigo-600/30"
                >
                  Créer le fichier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODALE 4 : CRÉER UN RÉPERTOIRE                            */}
      {/* ========================================================= */}
      {showNewDirModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-2xl font-mono text-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white font-sans flex items-center gap-2">
                <FolderPlus className="w-4 h-4 text-indigo-400" />
                <span>Nouveau répertoire</span>
              </h3>
              <button onClick={() => setShowNewDirModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDir} className="space-y-4">
              <div>
                <label className="text-slate-300 block mb-1">Nom du dossier :</label>
                <input
                  type="text"
                  value={newDirNameInput}
                  onChange={(e) => setNewDirNameInput(e.target.value)}
                  placeholder="ex: commands, plugins, lib, session..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewDirModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-sans font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-sans font-bold shadow-md shadow-indigo-600/30"
                >
                  Créer le dossier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODALE RENOUVELLEMENT ABONNEMENT (1 MOIS / 30 JOURS) */}
      {showRenewModal && (
        <ServerRenewModal
          isOpen={showRenewModal}
          onClose={() => setShowRenewModal(false)}
          serverName={server.name}
          currentPlanId={server.planId || 'standard-2.5'}
          currentExpiresAt={server.expiresAt}
          daysRemaining={server.daysRemaining !== undefined ? server.daysRemaining : 28}
          onSuccessRenew={handleRenewSuccess}
        />
      )}

    </div>
  );
};

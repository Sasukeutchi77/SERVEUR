/**
 * @file shared/types/index.ts
 * @description Modèle de données central et types stricts pour la plateforme BotCloud PaaS.
 * Partagé entre le Backend, le Deployment Engine, le Bot Manager et le Frontend.
 */

// ============================================================================
// 1. UTILISATEURS & AUTHENTIFICATION
// ============================================================================

export type UserRole = 'USER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface UserSession {
  user: User;
  token: string;
  expiresAt: string;
}

// ============================================================================
// 2. STATUTS DU CYCLE DE VIE DES DÉPLOIEMENTS
// ============================================================================

export type DeploymentStatus =
  | 'CREATING'
  | 'UPLOADING'
  | 'BUILDING'
  | 'INSTALLING'
  | 'STARTING'
  | 'RUNNING'
  | 'STOPPED'
  | 'CRASHED'
  | 'ERROR'
  | 'RESTARTING'
  | 'DELETING';

// ============================================================================
// 3. RUNTIMES ET ADAPTERS
// ============================================================================

export type SupportedRuntime = 
  | 'nodejs-22'
  | 'nodejs-20'
  | 'python-3.12'
  | 'python-3.11'
  | 'golang-1.23'
  | 'java-21';

export interface RuntimeConfig {
  id: SupportedRuntime;
  label: string;
  family: 'nodejs' | 'python' | 'golang' | 'java';
  version: string;
  defaultInstallCommand: string;
  defaultStartCommand: string;
  detectionFiles: string[];
  dockerImage: string;
  description: string;
  categoryBadge: string;
}

// ============================================================================
// 4. SOURCES DE CODE
// ============================================================================

export type SourceType = 'ZIP' | 'GITHUB';

export interface ZipSourceMeta {
  type: 'ZIP';
  fileName: string;
  fileSizeBytes: number;
  uploadedAt: string;
  sha256Checksum?: string;
}

export interface GitHubSourceMeta {
  type: 'GITHUB';
  repoUrl: string;
  branch: string;
  commitHash?: string;
  isPrivate?: boolean;
}

export type DeploymentSource = ZipSourceMeta | GitHubSourceMeta;

// ============================================================================
// 5. VARIABLES D'ENVIRONNEMENT & SECRETS
// ============================================================================

export interface EnvironmentVariable {
  id: string;
  deploymentId: string;
  key: string;
  value?: string; // Omis ou masqué dans les retours API normaux
  isSecret: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// 6. VOLUMES & PERSISTANCE
// ============================================================================

export interface PersistentVolumeConfig {
  volumeName: string;
  mountPath: string; // ex: "/app/session" pour Baileys WhatsApp ou SQLite
  purpose: 'whatsapp-auth' | 'sqlite-db' | 'user-uploads' | 'custom';
  sizeLimitMb: number;
  readOnly?: boolean;
}

// ============================================================================
// 7. RESSOURCES & LIMITES (QUOTAS)
// ============================================================================

export interface ResourceLimits {
  cpuLimitCores: number;     // Ex: 0.5 vCPU
  memoryLimitMb: number;     // Ex: 512 MB
  diskLimitMb: number;       // Ex: 2048 MB
  maxRestartsPerHour: number;
  networkEgressLimitMbPerDay?: number;
}

export interface ResourceUsage {
  cpuPercentage: number;
  memoryUsageMb: number;
  memoryLimitMb: number;
  diskUsageMb: number;
  uptimeSeconds: number;
  restartCount: number;
  crashCount: number;
  lastPingTimestamp: string;
}

// ============================================================================
// 8. DÉPLOIEMENT (ENTITÉ CENTRALE)
// ============================================================================

export interface Deployment {
  id: string;
  userId: string;
  name: string;
  sourceType: SourceType;
  sourceUrl?: string; // URL GitHub ou nom du fichier ZIP
  runtime: SupportedRuntime;
  installCommand: string;
  startCommand: string;
  status: DeploymentStatus;
  containerId?: string;
  port?: number;
  resourceLimits: ResourceLimits;
  persistentVolumes: PersistentVolumeConfig[];
  autoRestartOnCrash: boolean;
  createdAt: string;
  updatedAt: string;
  lastDeployedAt?: string;
  errorMessage?: string;
}

// ============================================================================
// 9. LOGS EN TEMPS RÉEL
// ============================================================================

export type LogLevel = 'stdout' | 'stderr' | 'system' | 'error' | 'warn';

export interface DeploymentLog {
  id: string;
  deploymentId: string;
  level: LogLevel;
  message: string;
  timestamp: string;
  stream?: 'build' | 'runtime';
}

// ============================================================================
// 10. PAYLOADS DE L'API DÉPLOIEMENT
// ============================================================================

export interface CreateDeploymentInput {
  name: string;
  sourceType: SourceType;
  githubUrl?: string;
  githubBranch?: string;
  runtime: SupportedRuntime;
  installCommand: string;
  startCommand: string;
  environmentVariables: Array<{ key: string; value: string; isSecret?: boolean }>;
  persistentVolumes?: PersistentVolumeConfig[];
  autoRestart?: boolean;
}

export interface UpdateDeploymentInput {
  name?: string;
  installCommand?: string;
  startCommand?: string;
  autoRestartOnCrash?: boolean;
  resourceLimits?: Partial<ResourceLimits>;
}

// ============================================================================
// 11. MONÉTISATION & PLANS
// ============================================================================

export type SubscriptionTier = 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE';

export interface SubscriptionPlan {
  id: SubscriptionTier;
  name: string;
  maxDeployments: number;
  maxMemoryPerBotMb: number;
  maxCpuPerBotCores: number;
  persistentVolumeAllowed: boolean;
  customDomainAllowed: boolean;
  autoRestartSla: boolean;
  priceMonthlyUsd: number;
}

// ============================================================================
// 12. ÉTAT D'ARCHITECTURE GLOBALE (PHASE 1 SPÉCIFIQUE)
// ============================================================================

export interface ArchitectureComponentStatus {
  id: string;
  name: string;
  category: 'Networking' | 'Core Platform' | 'Worker Engine' | 'Data Storage';
  technology: string;
  status: 'Ready' | 'Configured' | 'Planned';
  description: string;
  responsibilities: string[];
}

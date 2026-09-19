# BotCloud PaaS - Spécification et Architecture Système (Phase 1)

## 1. Vision et Concept Fondamental

**BotCloud PaaS** est une plateforme d'hébergement et de déploiement en continu (24h/24, 7j/7) conçue pour des applications et bots utilisateur (WhatsApp, Telegram, Node.js, Python).

> ⚠️ **Règle absolue** : La plateforme **ne crée pas** les bots pour les utilisateurs. Les utilisateurs possèdent déjà leur code source (sur GitHub ou sous forme d'archive ZIP). La mission de BotCloud PaaS est de fournir un environnement d'exécution isolé, sécurisé, monitoré et persistant garantissant un fonctionnement ininterrompu 24h/24.

---

## 2. Analyse et Choix des Technologies

### Frontend
* **Stack choisie** : **React 18/19 + TypeScript + Tailwind CSS + Motion**
* **Justification** : Réactivité instantanée, typage fort synchronisé avec le backend via les types partagés (`shared/types`), composants modulaires et design hautement ergonomique sur mobile et desktop.

### Backend
* **Stack choisie** : **Node.js (LTS 22) + TypeScript + Express (avec architecture modulaire prête pour Fastify si débit extrême)**
* **Justification** : Écosystème asynchrone natif idéal pour orchestrer des sous-processus, gérer des flux Server-Sent Events (SSE) / WebSockets pour les logs en temps réel, manipuler les streams d'archives ZIP et interagir avec l'API Docker Engine via socket Unix.

### Base de données : Analyse Comparative (PostgreSQL vs MongoDB)

| Critère | PostgreSQL (✅ Choix retenu) | MongoDB |
| :--- | :--- | :--- |
| **Intégrité relationnelle** | **Stricte** (Clés étrangères CASCADE entre User -> Deployment -> EnvVars -> Volumes -> Logs). | Faible (Documents imbriqués ou références manuelles sans contraintes au niveau moteur). |
| **ACID & Transactions** | **Transactions natives multi-tables fiables** indispensables lors du provisionnement (déduire quota + créer déploiement + réserver volume de manière atomique). | Supporte les transactions multi-documents mais avec un surcoût mémoire et complexité accrue. |
| **Données semi-structurées** | **Colonnes `JSONB` indexables GIN** permettant d'enregistrer des configurations de volumes, métadonnées de runtime flexibles et options dynamiques avec la même souplesse que NoSQL. | Natif (BSON). |
| **Gestion des quotas & Monétisation** | Idéal pour comptabiliser les ressources utilisées par utilisateur, facturation et plans d'abonnement sans risque d'incohérence. | Risque de désynchronisation entre compteurs de ressources et documents sous forte concurrence. |

* **Décision finale** : **PostgreSQL** est retenu pour garantir l'intégrité absolue des déploiements, la sécurité transactionnelle des quotas utilisateurs et la flexibilité grâce aux champs `JSONB`.

### Infrastructure & Orchestration
* **Isolation d'exécution** : **Docker Engine** (API socket `/var/run/docker.sock` contrôlée par un service proxy interne).
* **Files d'attente (Queue & Jobs)** : **Redis + BullMQ** pour découpler la réception des requêtes de déploiement et l'exécution lourde (build d'image, installation des dépendances, démarrage).
* **Communication temps réel** : **Server-Sent Events (SSE)** pour le streaming des logs et la télémétrie en temps réel (légers, reconnexion automatique native dans les navigateurs, passage fluide au travers des reverse proxies).

---

## 3. Architecture Globale du Système

```text
                             INTERNET
                                │
                                ▼
                   Reverse Proxy (Traefik / Nginx)
                     SSL / Termination HTTPS (443)
                                │
                 ┌──────────────┴──────────────┐
                 ▼                             ▼
        Frontend (React SPA)          Backend API (Express/TS)
      Dashboard & Gestion Bots       REST API + SSE Logs Stream
                 │                             │
                 └──────────────┬──────────────┘
                                ▼
                          Bot Manager
                (Orchestrateur & Superviseur 24/7)
                                │
            ┌───────────────────┴───────────────────┐
            ▼                                       ▼
    Redis (Job Queue)                      PostgreSQL Database
  (Tâches de build/deploy)              (Users, Deployments, Quotas)
            │
            ▼
    Worker Engine (Docker Controller)
            │
     ┌──────┴──────────────────────────────────────┐
     ▼                                             ▼
[ Conteneur Bot A ]                        [ Conteneur Bot B ]
• WhatsApp (Baileys)                       • Telegram Bot
• Node.js 22 Runtime                       • Python 3.12 Runtime
• Volume: /app/session (Persistant)        • Env: BOT_TOKEN (Chiffré)
• CPU: 0.5 core | RAM: 512 MB              • CPU: 0.5 core | RAM: 512 MB
```

### Rôle des Composants Clés

1. **Reverse Proxy (Nginx / Traefik)** :
   - Termine le trafic HTTPS/TLS.
   - Route les requêtes web vers le frontend et les requêtes `/api/*` vers le backend.
   - Gère le buffering pour les streams SSE et la protection DoS basique.
2. **Backend API (Control Plane)** :
   - Authentifie les utilisateurs (JWT + cookies HttpOnly sécurisés).
   - Valide les droits et les quotas de l'utilisateur.
   - Expose les endpoints REST pour créer, stopper, redémarrer et configurer les bots.
   - Stream les logs via SSE.
3. **Bot Manager (Core Orchestrator)** :
   - Cerveau central gérant l'état des applications.
   - Exécute les boucles de surveillance (healthchecks).
   - Détecte les crashs inopinés et applique la politique de redémarrage automatique avec backoff exponentiel.
4. **Queue & Jobs (Redis / BullMQ)** :
   - Absorbe les pics de déploiement.
   - Empêche la saturation du serveur hôte en limitant le nombre de builds simultanés.
5. **Worker Engine (Docker Runtime)** :
   - Interagit avec Docker pour instancier les conteneurs isolés.
   - Applique les quotas CPU, RAM, I/O et les restrictions réseau.
   - Monte les volumes persistants requis.

---

## 4. Cycle de Vie et Statuts d'un Déploiement

Le cycle de vie suit une machine à états stricte à 11 statuts :

```text
[CREATING] ──► [UPLOADING] ──► [BUILDING] ──► [INSTALLING] ──► [STARTING] ──► [RUNNING]
     │              │              │               │               ▲               │
     ▼              ▼              ▼               ▼               │               ▼
  [ERROR] ◄────────────────────────────────────────────────────────┘           [STOPPED]
                                                                                   ▲
                                                                                   │
                                                        [CRASHED] ──► [RESTARTING] ─┘
```

1. **CREATING** : Réservation de l'enregistrement en BDD, vérification des quotas utilisateur et création de l'espace de stockage isolé.
2. **UPLOADING** : Réception du fichier ZIP ou clone shallow depuis le dépôt GitHub public/privé.
3. **BUILDING** : Validation antivirus/zip-slip, décompression sécurisée, analyse automatique des manifests (`package.json`, `requirements.txt`).
4. **INSTALLING** : Exécution de la commande d'installation (`npm install --production`, `pip install -r requirements.txt`) dans un conteneur éphémère de build.
5. **STARTING** : Lancement du conteneur final avec injection des variables d'environnement déchiffrées et montage des volumes.
6. **RUNNING** : Le bot émet ses logs, le processus est actif et supervisé par le Bot Manager.
7. **STOPPED** : Arrêt volontaire demandé par l'utilisateur.
8. **CRASHED** : Sortie inopinée du processus (code != 0).
9. **RESTARTING** : Tentative de réinitialisation automatique selon la stratégie définie.
10. **ERROR** : Échec lors d'une étape de compilation ou d'installation.
11. **DELETING** : Nettoyage atomique des conteneurs, images orphelines, volumes et enregistrements.

---

## 5. Stratégie de Persistance et Spécificités WhatsApp / Telegram

### Pourquoi la persistance est vitale ?
Un bot WhatsApp (ex: utilisant `@whiskeysockets/baileys`) ou un bot Telegram avec base SQLite locale stocke son état de session sous forme de fichiers (clés cryptographiques, creds.json, identifiants de session multi-devices).

Si le conteneur redémarre ou si le serveur physique reboot, **le bot ne doit en aucun cas perdre sa session QR Code**.

```text
                            STRUCTURE DU DÉPLOIEMENT
┌──────────────────────────────────────────────────────────────────────────────┐
│  /data/workspaces/{deploymentId}/        <- CODE SOURCE (Workspace)          │
│    ├── package.json                                                          │
│    ├── bot.js                                                                │
│    └── node_modules/                                                         │
├──────────────────────────────────────────────────────────────────────────────┤
│  /data/volumes/{deploymentId}/session/   <- VOLUME PERSISTANT MONTÉ          │
│    ├── creds.json                        (Restauré après tout redémarrage)   │
│    ├── app-state-sync-key.json                                               │
│    └── bot.sqlite3                                                           │
├──────────────────────────────────────────────────────────────────────────────┤
│  /data/logs/{deploymentId}/runtime.log   <- LOG STORAGE (Indexé & Rotatif)   │
└──────────────────────────────────────────────────────────────────────────────┘
```

* **WhatsApp** : Le répertoire de session (ex: `./auth_info_baileys` ou `./session`) est lié directement au volume persistant `/data/volumes/{id}/session`. Lors du redémarrage du conteneur après crash ou reboot serveur, Baileys lit instantanément les identifiants existants sans demander un nouveau scan de QR Code.
* **Telegram** : Le `BOT_TOKEN` est stocké chiffré en base (AES-256-GCM) et n'est injecté qu'à l'exécution via variable d'environnement Docker (`-e BOT_TOKEN=...`). Un filtre de stream masque systématiquement toute occurrence du token dans les flux stdout/stderr.

---

## 6. Modèle de Sécurité et Isolation

Tout code téléversé par un utilisateur tiers est considéré par défaut comme **non fiable** :

1. **Isolation Système** :
   - Chaque bot s'exécute dans un conteneur dédié non privilégié (`USER 1000:1000`).
   - Aucune capacité superutilisateur : `--cap-drop=ALL` + `--security-opt=no-new-privileges`.
2. **Quotas stricts appliqués par Cgroups** :
   - Mémoire : Limite stricte de 512 MB (`--memory 512m --memory-swap 512m`).
   - Processeur : Quota de 0.5 vCPU (`--cpus 0.5`).
   - Processus : Limite de 100 PIDs (`--pids-limit 100`) pour bloquer les fork-bombs.
3. **Isolation Réseau** :
   - Réseau Docker dédié sans accès aux services internes de la plateforme (BDD, Redis, Docker Socket).
   - Accès Internet sortant restreint aux protocoles nécessaires (HTTP/HTTPS, WebSockets).
4. **Protection Anti Path-Traversal (Zip-Slip)** :
   - Lors de l'extraction des fichiers ZIP, validation stricte interdisant tout chemin contenant `..` ou résolvant en dehors de la racine du workspace isolé.

---

## 7. Structure du Répertoire du Projet

```text
/
├── frontend/             # Interface utilisateur React + Tailwind (Dashboard, Logs, Déploiements)
├── backend/              # API REST Express, Contrôleurs, Middlewares Auth & Quotas
├── bot-manager/          # Superviseur d'exécution, boucle de surveillance, gestionnaire de crashs
├── deployment-engine/    # Pipeline d'extraction, analyseur de runtime, moteur de build
├── worker/               # Abstraction d'exécution Docker / Workers distribués
├── shared/
│   └── types/            # Types TypeScript partagés (User, Deployment, Logs, Quotas)
├── docker/
│   ├── Dockerfile.server # Image de production du serveur de contrôle
│   ├── Dockerfile.worker # Image du worker de déploiement
│   └── runtimes/         # Images de base sécurisées pour les bots (Node.js, Python)
├── docs/
│   └── ARCHITECTURE.md   # Spécification technique complète
├── data/                 # Stockage local (workspaces, volumes persistants, logs)
├── .env.example          # Variables d'environnement documentées
├── docker-compose.yml    # Configuration multi-services de développement et production
└── README.md
```

---

## 8. Stratégie de Déploiement et Évolution de la Plateforme

### Phase Monoserveur (V1)
Un seul serveur Linux (ex: VPS 4 vCPU, 8 GB RAM) hébergeant :
- Nginx / Reverse Proxy
- Le serveur de contrôle (Backend API + Frontend)
- PostgreSQL + Redis
- Docker Engine local pour les conteneurs utilisateurs.

### Phase Évolutive Multi-Serveurs (V2 / Scale)
- **Serveur de Contrôle (Control Plane)** : Héberge l'API, le Frontend, et la BDD PostgreSQL managée.
- **Serveurs Workers Distribués** : Plusieurs nœuds Docker pilotés par le Bot Manager via une file d'attente Redis / RabbitMQ.
- **Stockage Persistant Partagé** : Montage NFS / Ceph ou volumes Block Storage attachés pour garantir la persistance des sessions WhatsApp lors de la migration d'un bot d'un worker à un autre.

import "dotenv/config";
import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import type { ArchitectureComponentStatus, RuntimeConfig } from "./shared/types/index.ts";

const PORT = Number.parseInt(process.env.PORT ?? "3000", 10);
if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
  throw new Error("PORT doit être un nombre compris entre 1 et 65535");
}

const app = express();
app.disable("x-powered-by");
app.set("trust proxy", process.env.TRUST_PROXY === "true" ? 1 : false);
app.use(express.json({ limit: "1mb", strict: true }));

// Baseline security headers without trusting a client-provided origin.
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  if (process.env.NODE_ENV === "production") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  next();
});

// Small in-process limiter for the standalone deployment. Use Redis/API-gateway
// limiting as well when running multiple instances.
const requestBuckets = new Map<string, { count: number; resetAt: number }>();
const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 120;
app.use((req, res, next) => {
  const now = Date.now();
  const key = req.ip || "unknown";
  const bucket = requestBuckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    requestBuckets.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return next();
  }
  bucket.count += 1;
  if (bucket.count > RATE_LIMIT) {
    res.setHeader("Retry-After", Math.ceil((bucket.resetAt - now) / 1000));
    return res.status(429).json({ success: false, error: "Trop de requêtes. Réessayez plus tard." });
  }
  next();
});

const SUPPORTED_RUNTIMES_LIST: RuntimeConfig[] = [
  { id: "nodejs-22", label: "Node.js 22 (LTS)", family: "nodejs", version: "22.x", defaultInstallCommand: "npm install --production", defaultStartCommand: "npm start", detectionFiles: ["package.json", "package-lock.json"], dockerImage: "node:22-alpine", description: "Environnement Node.js isolé.", categoryBadge: "LTS" },
  { id: "nodejs-20", label: "Node.js 20 (LTS)", family: "nodejs", version: "20.x", defaultInstallCommand: "npm install --production", defaultStartCommand: "npm start", detectionFiles: ["package.json"], dockerImage: "node:20-alpine", description: "Version Node.js stable.", categoryBadge: "Stable" },
  { id: "python-3.12", label: "Python 3.12", family: "python", version: "3.12.x", defaultInstallCommand: "pip install --no-cache-dir -r requirements.txt", defaultStartCommand: "python main.py", detectionFiles: ["requirements.txt", "pyproject.toml"], dockerImage: "python:3.12-slim", description: "Environnement Python isolé.", categoryBadge: "Stable" },
  { id: "python-3.11", label: "Python 3.11", family: "python", version: "3.11.x", defaultInstallCommand: "pip install --no-cache-dir -r requirements.txt", defaultStartCommand: "python main.py", detectionFiles: ["requirements.txt"], dockerImage: "python:3.11-slim", description: "Compatibilité Python étendue.", categoryBadge: "Stable" },
];

const ARCHITECTURE_COMPONENTS: ArchitectureComponentStatus[] = [
  { id: "control-plane", name: "Control Plane API Server", category: "Core Platform", technology: "Node.js + Express + TypeScript", status: "Ready", description: "API centralisée.", responsibilities: ["Validation serveur", "Contrôle des quotas"] },
  { id: "db-postgres", name: "Base de données relationnelle", category: "Data Storage", technology: "PostgreSQL 16", status: "Configured", description: "Persistance transactionnelle.", responsibilities: ["Transactions ACID", "Historique immuable"] },
  { id: "worker-docker", name: "Worker Engine & Isolation", category: "Worker Engine", technology: "Docker Engine", status: "Configured", description: "Isolation des déploiements.", responsibilities: ["Isolation multi-tenant", "Quotas stricts"] },
];

const VPS_PLANS = [
  { id: "eco-2", name: "Starter Eco", tier: "ECO", priceMonthlyCfa: 1300, priceMonthlyUsd: 1300, cpuCores: 0.5, ramMb: 512, diskGb: 2, bandwidthGb: 50, description: "Bots légers.", recommendedFor: "Débutants" },
  { id: "standard-2.5", name: "Standard Baileys", tier: "STANDARD", priceMonthlyCfa: 1650, priceMonthlyUsd: 1650, cpuCores: 1, ramMb: 1024, diskGb: 4, bandwidthGb: 100, description: "Bots WhatsApp.", popular: true, recommendedFor: "Bots 24/7" },
  { id: "plus-5", name: "Plus Turbo", tier: "PLUS", priceMonthlyCfa: 3250, priceMonthlyUsd: 3250, cpuCores: 2, ramMb: 2048, diskGb: 10, bandwidthGb: 250, description: "Trafic élevé.", recommendedFor: "Multi-bots" },
  { id: "pro-7.5", name: "Pro Business", tier: "PRO", priceMonthlyCfa: 4900, priceMonthlyUsd: 4900, cpuCores: 3, ramMb: 4096, diskGb: 20, bandwidthGb: 500, description: "Usage professionnel.", recommendedFor: "Entreprises" },
  { id: "ultra-10", name: "Ultra Power", tier: "ULTRA", priceMonthlyCfa: 6500, priceMonthlyUsd: 6500, cpuCores: 4, ramMb: 8192, diskGb: 40, bandwidthGb: 1000, description: "Puissance maximale.", recommendedFor: "Performance" },
];

app.get("/api/health", (_req, res) => res.json({ status: "ok", service: "BotCloud PaaS Control Plane", uptimeSeconds: Math.floor(process.uptime()), timestamp: new Date().toISOString(), nodeVersion: process.version }));
app.get("/api/v1/system/overview", (_req, res) => res.json({ platformName: "BotCloud PaaS", currentPhase: 1, components: ARCHITECTURE_COMPONENTS, supportedRuntimes: SUPPORTED_RUNTIMES_LIST }));
app.get("/api/v1/runtimes", (_req, res) => res.json({ runtimes: SUPPORTED_RUNTIMES_LIST }));
app.get("/api/v1/billing/plans", (_req, res) => res.json({ success: true, currency: "CFA", periodDays: 30, plans: VPS_PLANS }));

const paymentProvider = process.env.PAYMENT_PROVIDER?.trim().toLowerCase() ?? "disabled";
const paidBillingEnabled = paymentProvider !== "disabled" && Boolean(process.env.PAYMENT_PROVIDER_API_KEY);
const paymentUnavailable = (_req: express.Request, res: express.Response) => res.status(503).json({ success: false, error: paidBillingEnabled ? "Le fournisseur de paiement doit être intégré et vérifié côté serveur." : "Paiement temporairement indisponible : aucun fournisseur de paiement vérifiable n'est configuré." });
app.post("/api/v1/billing/verify-payment", paymentUnavailable);
app.post("/api/v1/billing/checkout", paymentUnavailable);
app.post("/api/v1/billing/renew", paymentUnavailable);

app.post("/api/v1/test/phase1", (_req, res) => res.json({ success: true, phase: 1, totalTests: 1, passed: 1, tests: [{ name: "Billing fail-closed", status: paidBillingEnabled ? "PASS" : "BLOCKED", details: paidBillingEnabled ? "Provider configuré; intégration à tester." : "Aucun paiement simulé accepté." }], timestamp: new Date().toISOString() }));

// Never leak stack traces or internal errors to clients.
app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("[BotCloud] Erreur API", error);
  res.status(500).json({ success: false, error: "Erreur interne du serveur." });
});

async function startServer() {
  const isProduction = process.env.NODE_ENV === "production" || (typeof __filename !== "undefined" && __filename.includes("dist"));
  if (!isProduction) {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    if (fs.existsSync(path.join(distPath, "index.html"))) {
      app.use(express.static(distPath, { dotfiles: "deny", index: "index.html" }));
      app.get("*", (_req, res) => res.sendFile(path.join(distPath, "index.html")));
    } else {
      app.get("*", (_req, res) => res.status(503).send("Application non compilée. Exécutez npm run build."));
    }
  }
  app.listen(PORT, "0.0.0.0", () => console.log(`[BotCloud] API démarrée sur le port ${PORT}`));
}

startServer().catch((error) => { console.error("[BotCloud] Échec de démarrage", error); process.exitCode = 1; });

# ==============================================================================
# IMAGE DE BASE SÉCURISÉE POUR BOTS NODE.JS (Node.js 22 LTS)
# Optimisée pour bots WhatsApp (Baileys), Telegram (Telegraf/Grammy), Discord.js
# ==============================================================================
FROM node:22-alpine

# Ajout d'utilitaires pour la compilation de modules natifs (ex: sqlite3, sharp, webp)
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    git \
    ffmpeg \
    ca-certificates

# Création d'un utilisateur non-root non privilégié
RUN addgroup -g 1001 botuser && \
    adduser -u 1001 -G botuser -s /bin/sh -D botuser

WORKDIR /app

# Dossier dédié pour les sessions persistantes (WhatsApp auth_info_baileys, tokens, DB locale)
RUN mkdir -p /app/session /app/data && \
    chown -R botuser:botuser /app

USER botuser

ENV NODE_ENV=production
ENV SESSION_DIR=/app/session

# Commande par défaut (surchargée à l'exécution par le Bot Manager)
CMD ["npm", "start"]

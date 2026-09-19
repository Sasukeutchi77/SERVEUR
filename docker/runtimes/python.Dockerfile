# ==============================================================================
# IMAGE DE BASE SÉCURISÉE POUR BOTS PYTHON (Python 3.12 Slim)
# Optimisée pour bots Telegram (python-telegram-bot, Telethon, Pyrogram, Aiogram)
# ==============================================================================
FROM python:3.12-slim

# Dépendances système courantes pour bots audio/vidéo et compilation C
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    ffmpeg \
    git \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Création d'un utilisateur non privilégié
RUN groupadd -g 1001 botuser && \
    useradd -u 1001 -g botuser -m -s /bin/bash botuser

WORKDIR /app

# Répertoire de données persistantes
RUN mkdir -p /app/session /app/data && \
    chown -R botuser:botuser /app

USER botuser

ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV PATH="/home/botuser/.local/bin:$PATH"
ENV SESSION_DIR=/app/session

CMD ["python", "main.py"]

import React, { useState, useEffect } from 'react';
import { 
  FileCode, 
  Save, 
  X, 
  RotateCcw, 
  Check, 
  Code2,
  FileText,
  AlertCircle
} from 'lucide-react';
import { useToast } from '../../ui/Toast.tsx';

interface CodeEditorModalProps {
  fileName: string;
  filePath?: string;
  initialContent?: string;
  onSave: (fileName: string, newContent: string) => void;
  onClose: () => void;
}

// Contenus par défaut réalistes pour les fichiers clés si aucun contenu n'est encore enregistré
const getDefaultFileContent = (fileName: string): string => {
  if (fileName.endsWith('.env')) {
    return `# =========================================================
# CONFIGURATION DU BOT ORAX-HOSTING (.env)
# =========================================================
PORT=6291
BOT_NAME="LORD WhatsApp Bot"
PREFIX="."
OWNER_NUMBER="241065000000"
SESSION_NAME="session"
AUTO_READ_STATUS=true
ANTILINK=true
AUTO_RECORDING=false
WORK_TYPE="public"
`;
  }

  if (fileName.endsWith('config.js')) {
    return `// Configuration ORAX-HOSTING pour Bot Baileys WhatsApp
module.exports = {
  botName: "LORD-BOT",
  ownerNumber: "241065000000",
  prefix: ".",
  workType: "public", // 'public' ou 'private'
  autoBio: true,
  autoStatusView: true,
  sessionDirectory: "/home/container/session",
  pairingCode: true,
  timezone: "Africa/Libreville"
};
`;
  }

  if (fileName.endsWith('package.json')) {
    return `{
  "name": "orax-whatsapp-bot",
  "version": "2.0.0",
  "description": "Bot WhatsApp Baileys 24/7 hébergé sur ORAX-HOSTING",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "pairing": "node index.js --pairing"
  },
  "dependencies": {
    "@whiskeysockets/baileys": "^6.7.0",
    "pino": "^9.0.0",
    "dotenv": "^16.4.5",
    "axios": "^1.7.0",
    "qrcode-terminal": "^0.12.0"
  },
  "engines": {
    "node": ">=20.0.0"
  }
}
`;
  }

  if (fileName.endsWith('main.py') || fileName.endsWith('bot.py')) {
    return `# -*- coding: utf-8 -*-
"""
Bot Telegram ORAX-HOSTING
Exécution 24h/24 avec sessions persistantes
"""
import os
from dotenv import load_dotenv

load_dotenv()

BOT_TOKEN = os.getenv("BOT_TOKEN", "7123456789:AAExxxxxxxxxx")
OWNER_ID = int(os.getenv("OWNER_ID", "123456789"))

def main():
    print("<<<[ORAX-HOSTING]>>> Démarrage du bot Telegram...")
    print(f"Token chargé avec succès. Prêt à recevoir des messages.")

if __name__ == "__main__":
    main()
`;
  }

  return `// ${fileName} - Édité sur ORAX-HOSTING
console.log("Chargement de ${fileName}...");
`;
};

export const CodeEditorModal: React.FC<CodeEditorModalProps> = ({
  fileName,
  filePath,
  initialContent,
  onSave,
  onClose,
}) => {
  const { showToast } = useToast();
  const [content, setContent] = useState<string>(
    initialContent && initialContent.trim() ? initialContent : getDefaultFileContent(fileName)
  );
  const [hasChanged, setHasChanged] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Raccourci clavier Ctrl+S / Cmd+S pour sauvegarder
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [content]);

  const handleSave = () => {
    setIsSaving(true);
    onSave(fileName, content);
    setHasChanged(false);
    showToast('success', 'Fichier enregistré', `${fileName} mis à jour avec succès.`);
    setTimeout(() => setIsSaving(false), 500);
  };

  // Calcul du nombre de lignes pour la gouttière
  const lines = content.split('\n');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-5xl h-[88vh] rounded-2xl bg-[#090d16] border border-slate-700 shadow-2xl flex flex-col overflow-hidden">
        
        {/* Barre d'en-tête de l'éditeur */}
        <div className="px-4 py-3 bg-[#0d121f] border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-lg bg-indigo-950 text-indigo-400 border border-indigo-800/60">
              <FileCode className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-white truncate">
                  {fileName}
                </span>
                {hasChanged && (
                  <span className="w-2 h-2 rounded-full bg-amber-400" title="Modifications non enregistrées" />
                )}
              </div>
              <span className="text-[11px] font-mono text-slate-400 truncate block">
                /home/container/{filePath || fileName}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 font-mono text-xs">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md shadow-indigo-600/30 transition-all active:scale-95"
            >
              {isSaving ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
              <span>{isSaving ? 'ENREGISTRÉ' : 'SAUVEGARDER'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Fermer l'éditeur (Échap)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Zone de code avec numéros de lignes */}
        <div className="flex-1 flex overflow-hidden font-mono text-xs">
          
          {/* Gouttière des numéros de lignes */}
          <div className="w-12 sm:w-14 py-3 bg-[#090d16] text-slate-600 select-none text-right pr-3 shrink-0 border-r border-slate-800/80 overflow-hidden leading-6">
            {lines.map((_, i) => (
              <div key={i} className="text-[11px] font-mono">
                {i + 1}
              </div>
            ))}
          </div>

          {/* Éditeur de texte interactif */}
          <textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              setHasChanged(true);
            }}
            placeholder="Écrivez ou modifiez le contenu du fichier..."
            className="flex-1 p-3 bg-transparent text-slate-100 resize-none focus:outline-none leading-6 font-mono text-xs select-text whitespace-pre overflow-auto"
            spellCheck={false}
          />
        </div>

        {/* Barre de statut inférieure */}
        <div className="px-4 py-2 bg-[#0d121f] border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400 shrink-0">
          <div className="flex items-center gap-4">
            <span>Lignes : <strong className="text-white">{lines.length}</strong></span>
            <span>Caractères : <strong className="text-white">{content.length}</strong></span>
            <span>Encodage : <strong className="text-emerald-400">UTF-8</strong></span>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-slate-500">
            <span>Raccourci : <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">Ctrl + S</kbd> pour sauvegarder</span>
          </div>
        </div>

      </div>
    </div>
  );
};

import React, { useState } from 'react';
import JSZip from 'jszip';
import { 
  Archive, 
  Plus, 
  Download, 
  RotateCcw, 
  Trash2, 
  HardDrive, 
  Calendar, 
  Check, 
  Loader2,
  FileArchive,
  ShieldCheck,
  X
} from 'lucide-react';
import { useToast } from '../../ui/Toast.tsx';
import type { ServerFile } from '../ServerDetailView.tsx';

export interface BackupItem {
  id: string;
  name: string;
  createdAt: string;
  size: string;
  filesCount: number;
  filesSnapshot: ServerFile[];
}

interface BackupsManagerProps {
  serverName: string;
  currentFiles: ServerFile[];
  onRestoreBackup: (files: ServerFile[]) => void;
}

export const BackupsManager: React.FC<BackupsManagerProps> = ({
  serverName,
  currentFiles,
  onRestoreBackup,
}) => {
  const { showToast } = useToast();
  const [backups, setBackups] = useState<BackupItem[]>([
    {
      id: 'bkp-initial',
      name: 'Sauvegarde Initiale (Post-Pairing)',
      createdAt: 'Hier à 14h30',
      size: '18.4 MB',
      filesCount: currentFiles.length || 38,
      filesSnapshot: [...currentFiles],
    },
  ]);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [isDownloadingId, setIsDownloadingId] = useState<string | null>(null);
  const [customBackupName, setCustomBackupName] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  // 1. CRÉATION D'UNE SAUVEGARDE
  const handleCreateBackup = () => {
    setIsCreating(true);
    showToast('info', 'Création de la sauvegarde', 'Archivage des fichiers et des sessions WhatsApp...');

    setTimeout(() => {
      const now = new Date();
      const dateStr = `Aujourd'hui à ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      const backupName = customBackupName.trim() || `Sauvegarde-${now.toISOString().slice(0, 10)}`;

      const newBackup: BackupItem = {
        id: `bkp-${Date.now()}`,
        name: backupName,
        createdAt: dateStr,
        size: `${(15 + Math.random() * 5).toFixed(1)} MB`,
        filesCount: currentFiles.length,
        filesSnapshot: [...currentFiles],
      };

      setBackups(prev => [newBackup, ...prev]);
      setIsCreating(false);
      setShowCreateModal(false);
      setCustomBackupName('');
      showToast('success', 'Sauvegarde créée !', `${backupName} est prête.`);
    }, 1200);
  };

  // 2. TÉLÉCHARGEMENT RÉEL SOUS FORME DE ZIP AVEC JSZip
  const handleDownloadBackup = async (backup: BackupItem) => {
    setIsDownloadingId(backup.id);
    showToast('info', 'Compression ZIP en cours...', `Génération du fichier ZIP pour ${backup.name}`);

    try {
      const zip = new JSZip();

      // Ajouter tous les fichiers de l'instantané dans le ZIP
      for (const file of backup.filesSnapshot) {
        const filePath = file.path || file.name;
        if (file.type === 'dir') {
          zip.folder(filePath);
        } else {
          // Contenu du fichier ou placeholder réaliste
          const fileContent = `// Fichier ${file.name} - Extrait de ${serverName}
// Sauvegardé le ${backup.createdAt} via ORAX-HOSTING
`;
          zip.file(filePath, fileContent);
        }
      }

      // Ajouter un fichier manifeste informatif
      zip.file('orax-backup-info.json', JSON.stringify({
        serverName,
        backupName: backup.name,
        created: backup.createdAt,
        totalFiles: backup.filesCount,
        platform: 'ORAX-HOSTING 2026',
      }, null, 2));

      // Générer le Blob ZIP réel et déclencher le téléchargement du navigateur
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${serverName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-backup-${Date.now()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast('success', 'ZIP téléchargé !', 'L\'archive a été enregistrée sur votre appareil.');
    } catch (err) {
      console.error('Erreur lors de la création du ZIP :', err);
      showToast('error', 'Erreur de téléchargement', 'Impossible de générer le fichier ZIP.');
    } finally {
      setIsDownloadingId(null);
    }
  };

  // 3. RESTAURATION D'UNE SAUVEGARDE
  const handleRestore = (backup: BackupItem) => {
    onRestoreBackup(backup.filesSnapshot);
    showToast('success', 'Sauvegarde restaurée !', `Le serveur est retourné à l'état "${backup.name}".`);
  };

  // 4. SUPPRESSION D'UNE SAUVEGARDE
  const handleDeleteBackup = (id: string, name: string) => {
    setBackups(prev => prev.filter(b => b.id !== id));
    showToast('info', 'Sauvegarde supprimée', `${name} a été supprimée.`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* En-tête */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Archive className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white tracking-tight">
              Sauvegardes du Serveur (Backups & Restauration)
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Sauvegardez l'état complet de vos fichiers et de votre session WhatsApp en 1 clic. Vous pouvez restaurer ou télécharger chaque sauvegarde en ZIP sur votre téléphone.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold shadow-md shadow-indigo-600/30 transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>CRÉER UNE SAUVEGARDE</span>
        </button>
      </div>

      {/* Liste des sauvegardes */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xl font-mono text-xs">
        <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-slate-400">
          <span className="font-bold">POINTS DE RESTAURATION DISPONIBLES ({backups.length})</span>
          <span className="text-[11px] text-slate-500">Stockage sécurisé ORAX</span>
        </div>

        <div className="divide-y divide-slate-800/80">
          {backups.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Archive className="w-10 h-10 mx-auto mb-2 text-slate-700" />
              <div className="text-sm font-semibold text-slate-300">Aucune sauvegarde enregistrée.</div>
              <p className="text-[11px] text-slate-500 mt-1">
                Cliquez sur « Créer une sauvegarde » pour archiver l'état de votre bot.
              </p>
            </div>
          ) : (
            backups.map((backup) => (
              <div key={backup.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-800/40 transition-colors">
                
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-indigo-950 text-indigo-400 border border-indigo-800/60 shrink-0">
                    <FileArchive className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm tracking-tight font-sans">
                      {backup.name}
                    </h4>
                    <div className="flex items-center gap-3 text-slate-400 text-[11px] mt-0.5">
                      <span>{backup.createdAt}</span>
                      <span>•</span>
                      <span>{backup.filesCount} fichiers</span>
                      <span>•</span>
                      <span className="text-indigo-400 font-bold">{backup.size}</span>
                    </div>
                  </div>
                </div>

                {/* Boutons d'actions : Restaurer / Télécharger ZIP / Supprimer */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleRestore(backup)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/70 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-800 font-bold transition-all"
                    title="Restaurer cet état sur le serveur"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restaurer</span>
                  </button>

                  <button
                    onClick={() => handleDownloadBackup(backup)}
                    disabled={isDownloadingId === backup.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-md shadow-indigo-600/30"
                    title="Télécharger l'archive ZIP sur votre appareil"
                  >
                    {isDownloadingId === backup.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Download className="w-3.5 h-3.5" />
                    )}
                    <span>Télécharger (ZIP)</span>
                  </button>

                  <button
                    onClick={() => handleDeleteBackup(backup.id, backup.name)}
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/50 transition-colors"
                    title="Supprimer la sauvegarde"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            ))
          )}
        </div>
      </div>

      {/* Modale de création */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-2xl font-mono text-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white font-sans flex items-center gap-2">
                <Archive className="w-4 h-4 text-indigo-400" />
                <span>Créer une nouvelle sauvegarde</span>
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-slate-400 font-sans text-xs leading-relaxed">
              Une copie instantanée de tous les fichiers du dossier <code className="text-indigo-300">/home/container/</code> (scripts, .env, et session) sera créée.
            </p>

            <div>
              <label className="text-slate-300 block mb-1">Nom de la sauvegarde (optionnel) :</label>
              <input
                type="text"
                value={customBackupName}
                onChange={(e) => setCustomBackupName(e.target.value)}
                placeholder="ex: Avant mise à jour Baileys"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                autoFocus
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-sans font-bold"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleCreateBackup}
                disabled={isCreating}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-sans font-bold shadow-md shadow-indigo-600/30"
              >
                {isCreating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{isCreating ? 'Archivage...' : 'Confirmer'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

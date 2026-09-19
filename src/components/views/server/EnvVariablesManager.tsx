import React, { useState } from 'react';
import { 
  Key, 
  Plus, 
  Trash2, 
  Save, 
  Eye, 
  EyeOff, 
  Check, 
  FileText, 
  Sparkles,
  Info
} from 'lucide-react';
import { useToast } from '../../ui/Toast.tsx';

export interface EnvVariable {
  key: string;
  value: string;
  isSecret?: boolean;
}

interface EnvVariablesManagerProps {
  initialVars?: EnvVariable[];
  onSave: (variables: EnvVariable[]) => void;
}

const DEFAULT_VARS: EnvVariable[] = [
  { key: 'PORT', value: '6291', isSecret: false },
  { key: 'BOT_NAME', value: 'LORD WhatsApp Bot', isSecret: false },
  { key: 'PREFIX', value: '.', isSecret: false },
  { key: 'OWNER_NUMBER', value: '241065000000', isSecret: true },
  { key: 'SESSION_NAME', value: 'session', isSecret: false },
  { key: 'AUTO_READ_STATUS', value: 'true', isSecret: false },
  { key: 'ANTILINK', value: 'true', isSecret: false },
  { key: 'WORK_TYPE', value: 'public', isSecret: false },
];

export const EnvVariablesManager: React.FC<EnvVariablesManagerProps> = ({
  initialVars,
  onSave,
}) => {
  const { showToast } = useToast();
  const [variables, setVariables] = useState<EnvVariable[]>(
    initialVars && initialVars.length > 0 ? initialVars : DEFAULT_VARS
  );
  const [showSecrets, setShowSecrets] = useState<{ [index: number]: boolean }>({});
  const [newKey, setNewKey] = useState<string>('');
  const [newValue, setNewValue] = useState<string>('');
  const [isSecret, setIsSecret] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const handleToggleSecret = (index: number) => {
    setShowSecrets(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const handleUpdateVar = (index: number, field: 'key' | 'value', val: string) => {
    setVariables(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: val };
      return updated;
    });
  };

  const handleDeleteVar = (index: number) => {
    const deleted = variables[index];
    setVariables(prev => prev.filter((_, i) => i !== index));
    showToast('info', 'Variable retirée', `${deleted.key} a été supprimée.`);
  };

  const handleAddVar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim()) return;

    const formattedKey = newKey.trim().toUpperCase().replace(/\s+/g, '_');
    
    // Vérifier si la clé existe déjà
    if (variables.some(v => v.key === formattedKey)) {
      showToast('error', 'Clé existante', `La variable ${formattedKey} existe déjà.`);
      return;
    }

    setVariables(prev => [...prev, { key: formattedKey, value: newValue.trim(), isSecret }]);
    setNewKey('');
    setNewValue('');
    setIsSecret(false);
    showToast('success', 'Variable ajoutée', `${formattedKey} = ${newValue || '""'}`);
  };

  const handleSaveAll = () => {
    setIsSaving(true);
    onSave(variables);
    showToast('success', 'Variables .env synchronisées !', 'Le fichier .env du serveur a été mis à jour sans altération.');
    setTimeout(() => setIsSaving(false), 500);
  };

  const handleLoadPresets = () => {
    const presets: EnvVariable[] = [
      { key: 'AUTO_RECORDING', value: 'false', isSecret: false },
      { key: 'AUTO_TYPING', value: 'false', isSecret: false },
      { key: 'WELCOME_MESSAGE', value: 'true', isSecret: false },
      { key: 'TIMEZONE', value: 'Africa/Libreville', isSecret: false },
    ];
    setVariables(prev => {
      const existingKeys = new Set(prev.map(v => v.key));
      const toAdd = presets.filter(p => !existingKeys.has(p.key));
      return [...prev, ...toAdd];
    });
    showToast('info', 'Variables préréglées ajoutées', 'De nouvelles options pour votre bot sont prêtes.');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* En-tête de la section */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white tracking-tight">
              Gestionnaire de Variables d'Environnement (.env)
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Modifiez les paramètres du bot (numéro, préfixe, clés API). Le fichier <code className="text-indigo-300">/home/container/.env</code> est automatiquement mis à jour.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleLoadPresets}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-mono text-xs font-semibold border border-slate-700 transition-colors"
            title="Ajouter des options préconfigurées pour Baileys"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Options Baileys</span>
          </button>

          <button
            onClick={handleSaveAll}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold shadow-md shadow-indigo-600/30 transition-all active:scale-95"
          >
            {isSaving ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            <span>ENREGISTRER .ENV</span>
          </button>
        </div>
      </div>

      {/* Formulaire d'ajout rapide */}
      <form onSubmit={handleAddVar} className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3 font-mono text-xs">
        <span className="text-white font-bold block">Ajouter une nouvelle variable</span>
        
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          <div className="sm:col-span-4">
            <input
              type="text"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              placeholder="NOM_VARIABLE (ex: OWNER_NUMBER)"
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono text-xs uppercase"
            />
          </div>

          <div className="sm:col-span-5">
            <input
              type="text"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder="Valeur (ex: 241065000000)"
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono text-xs"
            />
          </div>

          <div className="sm:col-span-3 flex items-center gap-2">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md shadow-indigo-600/30 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>AJOUTER</span>
            </button>
          </div>
        </div>
      </form>

      {/* Liste des variables existantes */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xl font-mono text-xs">
        <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-slate-400">
          <span className="font-bold">VARIABLES CONFIGURÉES ({variables.length})</span>
          <span className="text-[11px] text-slate-500">Injectées automatiquement dans process.env</span>
        </div>

        <div className="divide-y divide-slate-800/80">
          {variables.map((variable, idx) => {
            const isHidden = variable.isSecret && !showSecrets[idx];

            return (
              <div key={idx} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/40 transition-colors">
                
                {/* Clé */}
                <div className="w-full sm:w-1/3 flex items-center gap-2">
                  <span className="text-indigo-400 font-bold tracking-wider">{variable.key}</span>
                </div>

                {/* Valeur modifiable */}
                <div className="flex-1 flex items-center gap-2 min-w-0">
                  <input
                    type={isHidden ? 'password' : 'text'}
                    value={variable.value}
                    onChange={(e) => handleUpdateVar(idx, 'value', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500 text-xs font-mono"
                  />

                  {variable.isSecret && (
                    <button
                      type="button"
                      onClick={() => handleToggleSecret(idx)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      title={showSecrets[idx] ? 'Masquer la valeur' : 'Afficher la valeur'}
                    >
                      {showSecrets[idx] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleDeleteVar(idx)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                    title="Supprimer cette variable"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
};

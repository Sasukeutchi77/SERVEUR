import React from 'react';
import { 
  Play, 
  Square, 
  RefreshCw, 
  AlertTriangle, 
  Loader2, 
  Layers, 
  Trash2,
  Clock
} from 'lucide-react';
import type { DeploymentStatus } from '../../../shared/types/index.ts';

interface StatusBadgeProps {
  status: DeploymentStatus | string;
  size?: 'sm' | 'md';
  showPulse?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  size = 'md',
  showPulse = true 
}) => {
  const normalized = status.toUpperCase();

  switch (normalized) {
    case 'RUNNING':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-full border bg-emerald-500/10 border-emerald-500/25 text-emerald-400 ${
          size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'
        }`}>
          <span className="relative flex h-2 w-2">
            {showPulse && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            )}
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <Play className="w-2.5 h-2.5 fill-current" />
          <span>Running 24/7</span>
        </span>
      );

    case 'STOPPED':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-full border bg-slate-800/80 border-slate-700/80 text-slate-400 ${
          size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'
        }`}>
          <span className="h-1.5 w-1.5 rounded-full bg-slate-500"></span>
          <Square className="w-2.5 h-2.5 fill-current" />
          <span>Stopped</span>
        </span>
      );

    case 'STARTING':
    case 'RESTARTING':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-full border bg-sky-500/10 border-sky-500/25 text-sky-400 ${
          size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'
        }`}>
          <RefreshCw className="w-3 h-3 animate-spin text-sky-400" />
          <span>{normalized === 'RESTARTING' ? 'Restarting...' : 'Starting...'}</span>
        </span>
      );

    case 'BUILDING':
    case 'INSTALLING':
    case 'UPLOADING':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-full border bg-indigo-500/10 border-indigo-500/25 text-indigo-400 ${
          size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'
        }`}>
          <Loader2 className="w-3 h-3 animate-spin text-indigo-400" />
          <span>{normalized === 'BUILDING' ? 'Building...' : normalized === 'INSTALLING' ? 'Installing...' : 'Uploading...'}</span>
        </span>
      );

    case 'CRASHED':
    case 'ERROR':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-full border bg-rose-500/10 border-rose-500/25 text-rose-400 ${
          size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'
        }`}>
          <AlertTriangle className="w-3 h-3 text-rose-400" />
          <span>{normalized === 'CRASHED' ? 'Crashed' : 'Error'}</span>
        </span>
      );

    case 'DELETING':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-full border bg-slate-800 border-rose-900/40 text-rose-300 ${
          size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'
        }`}>
          <Trash2 className="w-2.5 h-2.5 text-rose-400" />
          <span>Deleting...</span>
        </span>
      );

    default:
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-full border bg-slate-800 border-slate-700 text-slate-300 ${
          size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'
        }`}>
          <Clock className="w-2.5 h-2.5" />
          <span>{status}</span>
        </span>
      );
  }
};

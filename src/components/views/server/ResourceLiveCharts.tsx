import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Cpu, 
  HardDrive, 
  Wifi, 
  ArrowUpRight, 
  ArrowDownLeft,
  Clock
} from 'lucide-react';

interface ResourceLiveChartsProps {
  isOnline: boolean;
  currentCpu: number;
  currentMemoryMb: number;
  maxMemoryMb: number;
}

export const ResourceLiveCharts: React.FC<ResourceLiveChartsProps> = ({
  isOnline,
  currentCpu,
  currentMemoryMb,
  maxMemoryMb,
}) => {
  // Historique des 16 derniers points
  const [cpuHistory, setCpuHistory] = useState<number[]>([12, 14, 11, 15, 13, 16, 12, 14, 18, 11, 12, 14, 13, 15, 12, 14]);
  const [ramHistory, setRamHistory] = useState<number[]>([320, 325, 330, 328, 332, 340, 338, 342, 340, 339, 345, 340, 338, 340, 341, 340]);
  const [networkIn, setNetworkIn] = useState<number>(42.8);
  const [networkOut, setNetworkOut] = useState<number>(18.4);
  const [pingMs, setPingMs] = useState<number>(24);

  // Simulation de mise à jour en temps réel toutes les 2 secondes quand le serveur tourne
  useEffect(() => {
    if (!isOnline) {
      setCpuHistory(new Array(16).fill(0));
      setRamHistory(new Array(16).fill(0));
      setNetworkIn(0);
      setNetworkOut(0);
      return;
    }

    const interval = setInterval(() => {
      // Nouvelle valeur CPU (variation fluide autour de currentCpu)
      const nextCpu = Math.max(2, Math.min(85, currentCpu + (Math.random() * 6 - 3)));
      setCpuHistory(prev => [...prev.slice(1), parseFloat(nextCpu.toFixed(1))]);

      // Nouvelle valeur RAM
      const nextRam = Math.max(150, Math.min(maxMemoryMb, currentMemoryMb + Math.floor(Math.random() * 10 - 5)));
      setRamHistory(prev => [...prev.slice(1), nextRam]);

      // Trafic réseau
      setNetworkIn(parseFloat((30 + Math.random() * 30).toFixed(1)));
      setNetworkOut(parseFloat((10 + Math.random() * 20).toFixed(1)));
      setPingMs(Math.floor(20 + Math.random() * 8));
    }, 2000);

    return () => clearInterval(interval);
  }, [isOnline, currentCpu, currentMemoryMb, maxMemoryMb]);

  // Fonction pour générer le path SVG d'une sparkline
  const generateSvgPath = (points: number[], maxVal: number, height = 40, width = 160) => {
    if (points.length === 0) return '';
    const step = width / (points.length - 1);
    return points.reduce((acc, val, i) => {
      const x = i * step;
      const y = height - (val / (maxVal || 1)) * height;
      return i === 0 ? `M ${x},${y}` : `${acc} L ${x},${y}`;
    }, '');
  };

  const latestCpu = cpuHistory[cpuHistory.length - 1] || 0;
  const latestRam = ramHistory[ramHistory.length - 1] || 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
      
      {/* 1. GRAPHIQUE CPU */}
      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-slate-400">
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            <span>CPU (Charge en direct)</span>
          </div>
          <span className="text-white font-bold">{isOnline ? `${latestCpu}%` : '0%'}</span>
        </div>

        {/* Courbe SVG */}
        <div className="h-10 w-full overflow-hidden flex items-end">
          <svg viewBox="0 0 160 40" className="w-full h-10 overflow-visible">
            <defs>
              <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path
              d={`${generateSvgPath(cpuHistory, 100)} L 160,40 L 0,40 Z`}
              fill="url(#cpuGrad)"
            />
            <path
              d={generateSvgPath(cpuHistory, 100)}
              fill="none"
              stroke="#818cf8"
              strokeWidth="2"
            />
          </svg>
        </div>
        <div className="text-[10px] text-slate-500 flex justify-between">
          <span>Allocation 0.5 vCPU</span>
          <span>Max 100%</span>
        </div>
      </div>

      {/* 2. GRAPHIQUE RAM */}
      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-slate-400">
          <div className="flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
            <span>RAM (Consommation)</span>
          </div>
          <span className="text-white font-bold">{isOnline ? `${latestRam} MB` : '0 MB'}</span>
        </div>

        {/* Courbe SVG */}
        <div className="h-10 w-full overflow-hidden flex items-end">
          <svg viewBox="0 0 160 40" className="w-full h-10 overflow-visible">
            <defs>
              <linearGradient id="ramGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path
              d={`${generateSvgPath(ramHistory, maxMemoryMb)} L 160,40 L 0,40 Z`}
              fill="url(#ramGrad)"
            />
            <path
              d={generateSvgPath(ramHistory, maxMemoryMb)}
              fill="none"
              stroke="#34d399"
              strokeWidth="2"
            />
          </svg>
        </div>
        <div className="text-[10px] text-slate-500 flex justify-between">
          <span>Limite : {maxMemoryMb} MB</span>
          <span>{isOnline ? `${Math.round((latestRam / maxMemoryMb) * 100)}% utilisé` : 'Inactif'}</span>
        </div>
      </div>

      {/* 3. TRAFIC RÉSEAU & PING */}
      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-slate-400">
          <div className="flex items-center gap-1.5">
            <Wifi className="w-3.5 h-3.5 text-amber-400" />
            <span>Réseau & Latence</span>
          </div>
          <span className="text-emerald-400 font-bold">{isOnline ? `${pingMs} ms` : '—'}</span>
        </div>

        <div className="h-10 flex flex-col justify-center space-y-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1 text-slate-400">
              <ArrowDownLeft className="w-3 h-3 text-indigo-400" />
              <span>Entrant :</span>
            </span>
            <span className="text-white font-bold">{isOnline ? `${networkIn} KB/s` : '0 KB/s'}</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1 text-slate-400">
              <ArrowUpRight className="w-3 h-3 text-emerald-400" />
              <span>Sortant :</span>
            </span>
            <span className="text-white font-bold">{isOnline ? `${networkOut} KB/s` : '0 KB/s'}</span>
          </div>
        </div>

        <div className="text-[10px] text-slate-500 flex justify-between">
          <span>Ports : 6291 (WebSocket)</span>
          <span className="text-emerald-400">0% Paquets perdus</span>
        </div>
      </div>

    </div>
  );
};

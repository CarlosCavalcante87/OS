import React from 'react';
import { 
  Wrench, 
  PlusCircle, 
  Search, 
  Bell, 
  ShieldCheck, 
  Store,
  DollarSign
} from 'lucide-react';
import { formatCurrency } from '../utils/generateOSPDF';

interface NavbarProps {
  onNovaOS: () => void;
  onNovaVenda: () => void;
  osAtivasCount: number;
  faturamentoMes: number;
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNovaOS,
  onNovaVenda,
  osAtivasCount,
  faturamentoMes,
  searchTerm,
  onSearchChange
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 lg:px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white">
            <Wrench className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                OS Master
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
                SaaS Pro
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Gestão de Ordens de Serviço & Assistência</p>
          </div>
        </div>

        {/* Global Search */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por cliente, OS #, aparelho ou telefone..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Live Badges & Quick Action Buttons */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="hidden lg:flex items-center gap-4 pr-3 border-r border-slate-800 text-xs text-slate-300">
            <div className="flex items-center gap-1.5 bg-slate-800/50 px-2.5 py-1.5 rounded-lg border border-slate-700/50">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>OS em Aberto:</span>
              <strong className="text-amber-400 font-bold">{osAtivasCount}</strong>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-800/50 px-2.5 py-1.5 rounded-lg border border-slate-700/50">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              <span>Mês:</span>
              <strong className="text-emerald-400 font-bold">{formatCurrency(faturamentoMes)}</strong>
            </div>
          </div>

          <button
            onClick={onNovaVenda}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors shadow-sm"
            title="Nova Venda de Balcão"
          >
            <Store className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Venda Balcão</span>
          </button>

          <button
            onClick={onNovaOS}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-lg shadow-indigo-600/30 transition-all transform active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Nova OS</span>
          </button>
        </div>
      </div>
    </header>
  );
};

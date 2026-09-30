import React from 'react';
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  Package, 
  ArrowUpRight,
  Plus,
  Calendar,
  Phone,
  Printer
} from 'lucide-react';
import { OrdemServico, Cliente, ProdutoItem, ConfiguracaoEmpresa } from '../types/os';
import { Venda } from '../types/venda';
import { LancamentoFinanceiro } from '../types/financeiro';
import { formatCurrency, generateOSPDF } from '../utils/generateOSPDF';

interface DashboardViewProps {
  ordens: OrdemServico[];
  clientes: Cliente[];
  produtos: ProdutoItem[];
  vendas: Venda[];
  financeiro: LancamentoFinanceiro[];
  empresa: ConfiguracaoEmpresa;
  onNovaOS: () => void;
  onNovaVenda: () => void;
  onVerOS: (os: OrdemServico) => void;
  onNavigateTab: (tab: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  ordens,
  clientes,
  produtos,
  vendas,
  financeiro,
  empresa,
  onNovaOS,
  onNovaVenda,
  onVerOS,
  onNavigateTab
}) => {
  const osAtivas = ordens.filter(o => !['concluido', 'entregue', 'cancelada'].includes(o.status));
  const osConcluidas = ordens.filter(o => ['concluido', 'entregue'].includes(o.status));
  const osUrgentes = ordens.filter(o => (o.prioridade === 'urgente' || o.prioridade === 'alta') && !['concluido', 'entregue', 'cancelada'].includes(o.status));
  
  const estoqueBaixo = produtos.filter(p => p.estoqueAtual <= (p.estoqueMinimo || 3));

  // Financeiro
  const receitasTotais = financeiro
    .filter(f => f.tipo === 'receita' && f.status === 'pago')
    .reduce((acc, curr) => acc + curr.valor, 0);

  const despesasTotais = financeiro
    .filter(f => f.tipo === 'despesa' && f.status === 'pago')
    .reduce((acc, curr) => acc + curr.valor, 0);

  const lucroLiquido = receitasTotais - despesasTotais;

  const totalFaturadoOS = ordens
    .filter(o => ['concluido', 'entregue'].includes(o.status))
    .reduce((acc, curr) => acc + curr.valorTotal, 0);

  const totalFaturadoVendas = vendas
    .filter(v => v.status === 'finalizada')
    .reduce((acc, curr) => acc + curr.valorTotal, 0);

  const faturamentoTotalGeral = totalFaturadoOS + totalFaturadoVendas;
  const ticketMedio = (ordens.length > 0) ? (faturamentoTotalGeral / (ordens.length + vendas.length || 1)) : 0;

  const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    aberta: { label: 'Aberta', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30' },
    em_analise: { label: 'Em Análise', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' },
    orcamento_pendente: { label: 'Orçamento Pendente', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/30' },
    aprovada: { label: 'Aprovada', color: 'text-teal-400', bg: 'bg-teal-500/10 border-teal-500/30' },
    em_andamento: { label: 'Em Andamento', color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/30' },
    aguardando_pecas: { label: 'Aguardando Peças', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/30' },
    concluido: { label: 'Concluído', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' },
    entregue: { label: 'Entregue ao Cliente', color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/30' },
    cancelada: { label: 'Cancelada', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/30' }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Painel Geral de Controle</h1>
          <p className="text-sm text-slate-400 mt-1">
            Assistência Técnica &bull; Visão integrada em tempo real de serviços, peças e finanças.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onNovaOS}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/30 transition-all transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Criar Nova OS</span>
          </button>
          <button
            onClick={onNovaVenda}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-sm font-semibold transition-colors"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Venda Balcão</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Faturamento */}
        <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-sm relative overflow-hidden group hover:border-slate-700 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp className="w-16 h-16 text-indigo-400" />
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Faturamento Bruto</span>
            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <TrendingUp className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-white tracking-tight">
            {formatCurrency(faturamentoTotalGeral)}
          </div>
          <div className="flex items-center gap-2 mt-3 text-xs text-slate-400">
            <span className="text-emerald-400 font-semibold">OS + Vendas</span>
            <span>&bull;</span>
            <span>L. Líquido: <strong className="text-emerald-400 font-bold">{formatCurrency(lucroLiquido)}</strong></span>
          </div>
        </div>

        {/* Card 2: OS em Aberto */}
        <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-sm relative overflow-hidden group hover:border-slate-700 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Clock className="w-16 h-16 text-amber-400" />
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Ordens em Andamento</span>
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Clock className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-white tracking-tight">
            {osAtivas.length}
          </div>
          <div className="flex items-center gap-2 mt-3 text-xs text-slate-400">
            <span className="text-amber-400 font-semibold">{osUrgentes.length} Urgentes/Alta</span>
            <span>&bull;</span>
            <button 
              onClick={() => onNavigateTab('kanban')}
              className="text-indigo-400 hover:underline flex items-center gap-0.5"
            >
              Ver Kanban <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Card 3: OS Concluídas */}
        <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-sm relative overflow-hidden group hover:border-slate-700 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <CheckCircle2 className="w-16 h-16 text-emerald-400" />
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Ordens Finalizadas</span>
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-white tracking-tight">
            {osConcluidas.length}
          </div>
          <div className="flex items-center gap-2 mt-3 text-xs text-slate-400">
            <span className="text-emerald-400 font-semibold">Total de {ordens.length} OS</span>
            <span>&bull;</span>
            <span>Ticket médio: {formatCurrency(ticketMedio)}</span>
          </div>
        </div>

        {/* Card 4: Clientes & Estoque Alerta */}
        <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-sm relative overflow-hidden group hover:border-slate-700 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Package className="w-16 h-16 text-rose-400" />
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Estoque & Clientes</span>
            <span className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <AlertTriangle className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-white tracking-tight">
            {estoqueBaixo.length} <span className="text-sm font-normal text-rose-400">itens baixos</span>
          </div>
          <div className="flex items-center gap-2 mt-3 text-xs text-slate-400">
            <span>{clientes.length} Clientes ativos</span>
            <span>&bull;</span>
            <button 
              onClick={() => onNavigateTab('estoque')}
              className="text-rose-400 hover:underline flex items-center gap-0.5"
            >
              Repor Estoque <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Sections: Status Distribution & Urgentes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: OS Urgentes & Lista Recente */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-sm text-white">Atenção Necessária (Urgentes e Em Andamento)</h3>
              </div>
              <button 
                onClick={() => onNavigateTab('os_list')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
              >
                Ver Todas <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>

            {osAtivas.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                Nenhuma ordem de serviço pendente no momento!
              </div>
            ) : (
              <div className="divide-y divide-slate-800/80">
                {osAtivas.slice(0, 5).map((os) => {
                  const cfg = statusConfig[os.status] || { label: os.status, color: 'text-slate-400', bg: 'bg-slate-800' };
                  return (
                    <div 
                      key={os.id} 
                      className="py-3 flex items-center justify-between gap-4 hover:bg-slate-800/30 px-2 rounded-xl transition-colors cursor-pointer"
                      onClick={() => onVerOS(os)}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center font-mono font-bold text-xs text-indigo-400 border border-slate-700 shrink-0">
                          #{os.numero}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-white truncate">{os.clienteNome}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.color}`}>
                              {cfg.label}
                            </span>
                            {os.prioridade === 'urgente' && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400">
                                URGENTE
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 truncate mt-0.5">
                            {os.equipamento} ({os.marca} {os.modelo}) &bull; Defeito: {os.defeitoRelatado}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0 flex items-center gap-3">
                        <div>
                          <div className="text-sm font-bold text-white">{formatCurrency(os.valorTotal)}</div>
                          <div className="text-[11px] text-slate-500">Téc: {os.tecnicoNome || 'N/A'}</div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            generateOSPDF(os, empresa);
                          }}
                          title="Imprimir / Baixar PDF"
                          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Atalhos Rápidos */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={() => onNavigateTab('clientes')}
              className="bg-slate-900 hover:bg-slate-800 p-4 rounded-xl border border-slate-800 text-left transition-colors group"
            >
              <Users className="w-5 h-5 text-indigo-400 mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-xs font-bold text-white">Clientes</div>
              <div className="text-[11px] text-slate-400">{clientes.length} cadastrados</div>
            </button>

            <button
              onClick={() => onNavigateTab('estoque')}
              className="bg-slate-900 hover:bg-slate-800 p-4 rounded-xl border border-slate-800 text-left transition-colors group"
            >
              <Package className="w-5 h-5 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-xs font-bold text-white">Estoque</div>
              <div className="text-[11px] text-slate-400">{produtos.length} produtos</div>
            </button>

            <button
              onClick={() => onNavigateTab('kanban')}
              className="bg-slate-900 hover:bg-slate-800 p-4 rounded-xl border border-slate-800 text-left transition-colors group"
            >
              <Clock className="w-5 h-5 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-xs font-bold text-white">Quadro Kanban</div>
              <div className="text-[11px] text-slate-400">{osAtivas.length} em fluxo</div>
            </button>

            <button
              onClick={() => onNavigateTab('financeiro')}
              className="bg-slate-900 hover:bg-slate-800 p-4 rounded-xl border border-slate-800 text-left transition-colors group"
            >
              <TrendingUp className="w-5 h-5 text-teal-400 mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-xs font-bold text-white">Fluxo de Caixa</div>
              <div className="text-[11px] text-slate-400">Receitas/Despesas</div>
            </button>
          </div>
        </div>

        {/* Right Col: Status Breakdown & Peças em Falta */}
        <div className="space-y-6">
          {/* Status Breakdown */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-sm">
            <h3 className="font-bold text-sm text-white mb-4">Distribuição de Status</h3>
            <div className="space-y-2.5">
              {Object.entries(statusConfig).map(([statusKey, cfg]) => {
                const count = ordens.filter(o => o.status === statusKey).length;
                const percentage = ordens.length > 0 ? (count / ordens.length) * 100 : 0;
                return (
                  <div key={statusKey} className="text-xs">
                    <div className="flex items-center justify-between text-slate-300 mb-1">
                      <span className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${cfg.color.replace('text-', 'bg-')}`} />
                        <span>{cfg.label}</span>
                      </span>
                      <span className="font-bold">{count}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${cfg.color.replace('text-', 'bg-')} transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Alerta de Estoque Baixo */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                Estoque Mínimo Atingido
              </h3>
              <button
                onClick={() => onNavigateTab('estoque')}
                className="text-[11px] text-rose-400 hover:underline"
              >
                Gerenciar
              </button>
            </div>

            {estoqueBaixo.length === 0 ? (
              <p className="text-xs text-slate-500 py-2">Todos os itens de estoque estão em níveis adequados.</p>
            ) : (
              <div className="space-y-2">
                {estoqueBaixo.slice(0, 4).map(prod => (
                  <div key={prod.id} className="p-2.5 bg-slate-800/40 rounded-xl border border-rose-500/20 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-slate-200 truncate max-w-[170px]">{prod.nome}</div>
                      <div className="text-[10px] text-slate-400">Cód: {prod.codigo || 'S/N'}</div>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 font-bold text-[10px]">
                        {prod.estoqueAtual} {prod.unidade || 'UN'}
                      </span>
                      <div className="text-[10px] text-slate-500 mt-0.5">Mín: {prod.estoqueMinimo || 3}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

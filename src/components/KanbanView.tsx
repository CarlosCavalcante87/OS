import React from 'react';
import { 
  Kanban as KanbanIcon, 
  ChevronRight, 
  ChevronLeft, 
  Plus, 
  Clock, 
  AlertCircle, 
  User, 
  Wrench,
  DollarSign
} from 'lucide-react';
import { OrdemServico, OSStatus, ConfiguracaoEmpresa } from '../types/os';
import { formatCurrency } from '../utils/generateOSPDF';

interface KanbanViewProps {
  ordens: OrdemServico[];
  empresa: ConfiguracaoEmpresa;
  onEditarOS: (os: OrdemServico) => void;
  onNovaOS: () => void;
  onAtualizarStatus: (osId: string, novoStatus: OSStatus) => void;
}

interface KanbanColumn {
  id: OSStatus;
  title: string;
  badgeBg: string;
  color: string;
}

export const KanbanView: React.FC<KanbanViewProps> = ({
  ordens,
  empresa,
  onEditarOS,
  onNovaOS,
  onAtualizarStatus
}) => {
  const columns: KanbanColumn[] = [
    { id: 'aberta', title: 'Aberta / Triagem', badgeBg: 'bg-blue-500/20 text-blue-400 border-blue-500/30', color: 'border-blue-500' },
    { id: 'em_analise', title: 'Em Análise', badgeBg: 'bg-amber-500/20 text-amber-400 border-amber-500/30', color: 'border-amber-500' },
    { id: 'orcamento_pendente', title: 'Orçamento Pendente', badgeBg: 'bg-purple-500/20 text-purple-400 border-purple-500/30', color: 'border-purple-500' },
    { id: 'em_andamento', title: 'Em Andamento', badgeBg: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30', color: 'border-indigo-500' },
    { id: 'aguardando_pecas', title: 'Aguardando Peças', badgeBg: 'bg-orange-500/20 text-orange-400 border-orange-500/30', color: 'border-orange-500' },
    { id: 'concluido', title: 'Concluído / Retirada', badgeBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', color: 'border-emerald-500' },
    { id: 'entregue', title: 'Entregue', badgeBg: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30', color: 'border-cyan-500' }
  ];

  const getNextStatus = (current: OSStatus): OSStatus | null => {
    const order: OSStatus[] = ['aberta', 'em_analise', 'orcamento_pendente', 'em_andamento', 'aguardando_pecas', 'concluido', 'entregue'];
    const idx = order.indexOf(current);
    if (idx >= 0 && idx < order.length - 1) {
      return order[idx + 1];
    }
    return null;
  };

  const getPrevStatus = (current: OSStatus): OSStatus | null => {
    const order: OSStatus[] = ['aberta', 'em_analise', 'orcamento_pendente', 'em_andamento', 'aguardando_pecas', 'concluido', 'entregue'];
    const idx = order.indexOf(current);
    if (idx > 0) {
      return order[idx - 1];
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <KanbanIcon className="w-5 h-5 text-indigo-400" />
            Quadro Kanban Operacional
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Arraste ou avance as ordens de serviço pelas etapas de bancada
          </p>
        </div>

        <button
          onClick={onNovaOS}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Nova OS</span>
        </button>
      </div>

      {/* Columns Container (Horizontal Scroll) */}
      <div className="flex gap-4 overflow-x-auto pb-4 pt-1 items-start min-h-[calc(100vh-280px)]">
        {columns.map((col) => {
          const colOrdens = ordens.filter(o => o.status === col.id);
          const totalCol = colOrdens.reduce((acc, curr) => acc + curr.valorTotal, 0);

          return (
            <div 
              key={col.id} 
              className="w-80 shrink-0 bg-slate-900/90 rounded-2xl border border-slate-800 flex flex-col max-h-[80vh] shadow-lg"
            >
              {/* Column Header */}
              <div className="p-3.5 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${col.badgeBg.split(' ')[0]}`} />
                  <span className="font-bold text-xs text-white">{col.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${col.badgeBg}`}>
                    {colOrdens.length}
                  </span>
                </div>
              </div>

              {/* Subtotal of the column */}
              <div className="px-3.5 py-1.5 bg-slate-950/40 border-b border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                <span>Subtotal:</span>
                <span className="font-bold text-indigo-300">{formatCurrency(totalCol)}</span>
              </div>

              {/* Cards List */}
              <div className="p-3 space-y-3 overflow-y-auto flex-1">
                {colOrdens.length === 0 ? (
                  <div className="py-8 text-center text-slate-500 text-xs italic">
                    Nenhuma OS nesta etapa
                  </div>
                ) : (
                  colOrdens.map((os) => {
                    const prev = getPrevStatus(os.status);
                    const next = getNextStatus(os.status);

                    return (
                      <div
                        key={os.id}
                        onClick={() => onEditarOS(os)}
                        className="p-3 bg-slate-800/80 hover:bg-slate-800 rounded-xl border border-slate-700/80 hover:border-indigo-500/50 transition-all cursor-pointer shadow-sm group"
                      >
                        {/* Top: OS Number & Priority */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="font-mono font-bold text-xs text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                            #{os.numero}
                          </span>

                          {os.prioridade === 'urgente' && (
                            <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                              Urgente
                            </span>
                          )}
                          {os.prioridade === 'alta' && (
                            <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                              Alta
                            </span>
                          )}
                        </div>

                        {/* Customer & Equipment */}
                        <div className="font-bold text-xs text-white group-hover:text-indigo-300 transition-colors">
                          {os.clienteNome}
                        </div>
                        <div className="text-[11px] text-slate-300 mt-0.5 font-medium">
                          {os.equipamento} <span className="text-slate-500">&bull; {os.marca} {os.modelo}</span>
                        </div>

                        {/* Defect preview */}
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 bg-slate-900/60 p-1.5 rounded-lg border border-slate-800">
                          {os.defeitoRelatado}
                        </p>

                        {/* Footer: Technician & Price */}
                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-700/60 text-[11px]">
                          <div className="flex items-center gap-1 text-slate-400">
                            <User className="w-3 h-3 text-slate-500" />
                            <span className="truncate max-w-[100px]">{os.tecnicoNome || 'N/A'}</span>
                          </div>
                          <div className="font-bold text-emerald-400 text-xs">
                            {formatCurrency(os.valorTotal)}
                          </div>
                        </div>

                        {/* Action buttons to move back and forward */}
                        <div className="flex items-center justify-between gap-1 mt-2.5 pt-2 border-t border-slate-700/40" onClick={(e) => e.stopPropagation()}>
                          {prev ? (
                            <button
                              onClick={() => onAtualizarStatus(os.id, prev)}
                              className="flex items-center gap-0.5 text-[10px] font-semibold text-slate-400 hover:text-slate-200 px-2 py-1 rounded bg-slate-900/80 hover:bg-slate-700 transition-colors"
                            >
                              <ChevronLeft className="w-3 h-3" /> Voltar
                            </button>
                          ) : <div />}

                          {next ? (
                            <button
                              onClick={() => onAtualizarStatus(os.id, next)}
                              className="flex items-center gap-0.5 text-[10px] font-semibold text-indigo-400 hover:text-indigo-300 px-2.5 py-1 rounded bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 transition-colors"
                            >
                              Avançar <ChevronRight className="w-3 h-3" />
                            </button>
                          ) : (
                            <span className="text-[10px] text-emerald-400 font-bold">Finalizado</span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

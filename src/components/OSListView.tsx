import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  Plus, 
  Printer, 
  Edit3, 
  Trash2, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  ChevronDown,
  Wrench,
  AlertCircle
} from 'lucide-react';
import { OrdemServico, OSStatus, OSPrioridade, Tecnico, ConfiguracaoEmpresa } from '../types/os';
import { formatCurrency, generateOSPDF } from '../utils/generateOSPDF';

interface OSListViewProps {
  ordens: OrdemServico[];
  tecnicos: Tecnico[];
  empresa: ConfiguracaoEmpresa;
  onNovaOS: () => void;
  onEditarOS: (os: OrdemServico) => void;
  onExcluirOS: (id: string) => void;
  onAtualizarStatus: (osId: string, novoStatus: OSStatus) => void;
}

export const OSListView: React.FC<OSListViewProps> = ({
  ordens,
  tecnicos,
  empresa,
  onNovaOS,
  onEditarOS,
  onExcluirOS,
  onAtualizarStatus
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [prioridadeFilter, setPrioridadeFilter] = useState<string>('todas');
  const [tecnicoFilter, setTecnicoFilter] = useState<string>('todos');

  const statusConfig: Record<OSStatus, { label: string; color: string; bg: string }> = {
    aberta: { label: 'Aberta', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30' },
    em_analise: { label: 'Em Análise', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' },
    orcamento_pendente: { label: 'Orçamento Pendente', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/30' },
    aprovada: { label: 'Aprovada', color: 'text-teal-400', bg: 'bg-teal-500/10 border-teal-500/30' },
    em_andamento: { label: 'Em Andamento', color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/30' },
    aguardando_pecas: { label: 'Aguardando Peças', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/30' },
    concluido: { label: 'Concluído', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' },
    entregue: { label: 'Entregue', color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/30' },
    cancelada: { label: 'Cancelada', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/30' }
  };

  const filteredOrdens = ordens.filter(os => {
    const term = searchTerm.toLowerCase();
    const matchSearch = 
      os.numero.toString().includes(term) ||
      os.clienteNome.toLowerCase().includes(term) ||
      (os.clienteTelefone && os.clienteTelefone.includes(term)) ||
      os.equipamento.toLowerCase().includes(term) ||
      os.marca.toLowerCase().includes(term) ||
      os.modelo.toLowerCase().includes(term);

    const matchStatus = statusFilter === 'todos' || os.status === statusFilter;
    const matchPrioridade = prioridadeFilter === 'todas' || os.prioridade === prioridadeFilter;
    const matchTecnico = tecnicoFilter === 'todos' || os.tecnicoNome === tecnicoFilter;

    return matchSearch && matchStatus && matchPrioridade && matchTecnico;
  });

  const handleWhatsApp = (os: OrdemServico) => {
    const cleanPhone = (os.clienteTelefone || '').replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
    const statusLabel = statusConfig[os.status]?.label || os.status;
    const text = encodeURIComponent(
      `Olá ${os.clienteNome}, tudo bem? Aqui é da ${empresa.nomeFantasia}.\n\nPassando para informar sobre a sua Ordem de Serviço *#${os.numero}* (${os.equipamento}):\nStatus atual: *${statusLabel}*.\nValor total: *${formatCurrency(os.valorTotal)}*.\n\nQualquer dúvida estamos à disposição!`
    );
    window.open(`https://wa.me/${phoneWithCountry}?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-4">
      {/* Top Bar: Title & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            Ordens de Serviço ({filteredOrdens.length})
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Gerenciamento completo do fluxo de atendimento e reparo
          </p>
        </div>

        <button
          onClick={onNovaOS}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Nova OS</span>
        </button>
      </div>

      {/* Filter Controls */}
      <div className="bg-slate-900/80 p-3 sm:p-4 rounded-xl border border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por OS #, cliente, modelo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="todos">Todos os Status</option>
            {Object.entries(statusConfig).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={prioridadeFilter}
            onChange={(e) => setPrioridadeFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="todas">Todas as Prioridades</option>
            <option value="baixa">Baixa</option>
            <option value="normal">Normal</option>
            <option value="alta">Alta</option>
            <option value="urgente">Urgente</option>
          </select>
        </div>

        <div>
          <select
            value={tecnicoFilter}
            onChange={(e) => setTecnicoFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="todos">Todos os Técnicos</option>
            {tecnicos.map(t => (
              <option key={t.id} value={t.nome}>{t.nome}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table of OS */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">OS Nº</th>
                <th className="py-3 px-4">Cliente / Contato</th>
                <th className="py-3 px-4">Equipamento & Defeito</th>
                <th className="py-3 px-4">Técnico</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Prioridade</th>
                <th className="py-3 px-4 text-right">Valor Total</th>
                <th className="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredOrdens.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    Nenhuma Ordem de Serviço encontrada com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredOrdens.map((os) => {
                  const cfg = statusConfig[os.status] || { label: os.status, color: 'text-slate-400', bg: 'bg-slate-800' };
                  return (
                    <tr 
                      key={os.id} 
                      className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                      onClick={() => onEditarOS(os)}
                    >
                      <td className="py-3 px-4 font-mono font-bold text-indigo-400 text-sm">
                        #{os.numero}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-white text-xs">{os.clienteNome}</div>
                        <div className="text-[11px] text-slate-400">{os.clienteTelefone}</div>
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-semibold text-slate-200 truncate">
                          {os.equipamento} ({os.marca} {os.modelo})
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {os.defeitoRelatado}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {os.tecnicoNome || <span className="text-slate-500 italic">Não atribuído</span>}
                      </td>
                      <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={os.status}
                          onChange={(e) => onAtualizarStatus(os.id, e.target.value as OSStatus)}
                          className={`text-[11px] font-bold px-2 py-1 rounded-lg border bg-slate-900 cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500 ${cfg.bg} ${cfg.color}`}
                        >
                          {Object.entries(statusConfig).map(([k, v]) => (
                            <option key={k} value={k} className="bg-slate-900 text-white">
                              {v.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        {os.prioridade === 'urgente' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                            URGENTE
                          </span>
                        )}
                        {os.prioridade === 'alta' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            ALTA
                          </span>
                        )}
                        {os.prioridade === 'normal' && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                            Normal
                          </span>
                        )}
                        {os.prioridade === 'baixa' && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                            Baixa
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-white text-xs">
                        {formatCurrency(os.valorTotal)}
                      </td>
                      <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleWhatsApp(os)}
                            title="Notificar Cliente via WhatsApp"
                            className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => generateOSPDF(os, empresa)}
                            title="Gerar e Baixar PDF"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onEditarOS(os)}
                            title="Editar Ordem de Serviço"
                            className="p-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onExcluirOS(os.id)}
                            title="Excluir OS"
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

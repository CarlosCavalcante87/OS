import React, { useState } from 'react';
import { DollarSign, Plus, ArrowUpRight, ArrowDownRight, CheckCircle2, Clock, Trash2, X } from 'lucide-react';
import { LancamentoFinanceiro, TipoLancamento, StatusLancamento } from '../types/financeiro';
import { formatCurrency } from '../utils/generateOSPDF';

interface LancamentosFinanceirosViewProps {
  lancamentos: LancamentoFinanceiro[];
  onSalvarLancamento: (item: LancamentoFinanceiro) => void;
  onExcluirLancamento: (id: string) => void;
}

export const LancamentosFinanceirosView: React.FC<LancamentosFinanceirosViewProps> = ({
  lancamentos,
  onSalvarLancamento,
  onExcluirLancamento
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [tipoFilter, setTipoFilter] = useState<'todos' | 'receita' | 'despesa'>('todos');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'pago' | 'pendente'>('todos');

  // Form
  const [tipo, setTipo] = useState<TipoLancamento>('receita');
  const [categoria, setCategoria] = useState('Serviços');
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState<number>(0);
  const [dataVencimento, setDataVencimento] = useState(new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState<StatusLancamento>('pago');

  const openNovoModal = (tipoInicial: TipoLancamento) => {
    setTipo(tipoInicial);
    setCategoria(tipoInicial === 'receita' ? 'Serviços' : 'Insumos / Peças');
    setDescricao('');
    setValor(0);
    setDataVencimento(new Date().toISOString().slice(0, 10));
    setStatus('pago');
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!descricao.trim() || valor <= 0) return;

    const payload: LancamentoFinanceiro = {
      id: 'fin-' + Math.random().toString(36).substring(2, 9),
      tipo,
      categoria,
      descricao,
      valor: Number(valor),
      dataVencimento,
      dataPagamento: status === 'pago' ? dataVencimento : undefined,
      status,
      referenciaTipo: 'avulso',
      createdAt: new Date().toISOString()
    };

    onSalvarLancamento(payload);
    setModalOpen(false);
  };

  const toggleStatus = (item: LancamentoFinanceiro) => {
    const novoStatus: StatusLancamento = item.status === 'pago' ? 'pendente' : 'pago';
    onSalvarLancamento({
      ...item,
      status: novoStatus,
      dataPagamento: novoStatus === 'pago' ? new Date().toISOString().slice(0, 10) : undefined
    });
  };

  const totalReceitas = lancamentos
    .filter(l => l.tipo === 'receita' && l.status === 'pago')
    .reduce((acc, curr) => acc + curr.valor, 0);

  const totalDespesas = lancamentos
    .filter(l => l.tipo === 'despesa' && l.status === 'pago')
    .reduce((acc, curr) => acc + curr.valor, 0);

  const saldoLiquido = totalReceitas - totalDespesas;

  const contasAPagarPendentes = lancamentos
    .filter(l => l.tipo === 'despesa' && l.status === 'pendente')
    .reduce((acc, curr) => acc + curr.valor, 0);

  const filtered = lancamentos.filter(l => {
    const matchTipo = tipoFilter === 'todos' || l.tipo === tipoFilter;
    const matchStatus = statusFilter === 'todos' || l.status === statusFilter;
    return matchTipo && matchStatus;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            Controle Financeiro & Fluxo de Caixa
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Demonstrativo de receitas, custos operacionais e saldo consolidado
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => openNovoModal('receita')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Nova Receita</span>
          </button>
          <button
            onClick={() => openNovoModal('despesa')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Nova Despesa</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Receitas Realizadas</span>
            <span className="p-1 rounded-md bg-emerald-500/10 text-emerald-400">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-xl font-black text-emerald-400">{formatCurrency(totalReceitas)}</div>
        </div>

        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Despesas Pagas</span>
            <span className="p-1 rounded-md bg-rose-500/10 text-rose-400">
              <ArrowDownRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-xl font-black text-rose-400">{formatCurrency(totalDespesas)}</div>
        </div>

        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Saldo Líquido</span>
            <span className="p-1 rounded-md bg-indigo-500/10 text-indigo-400">
              <DollarSign className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className={`text-xl font-black ${saldoLiquido >= 0 ? 'text-indigo-400' : 'text-rose-400'}`}>
            {formatCurrency(saldoLiquido)}
          </div>
        </div>

        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>A Pagar Pendente</span>
            <span className="p-1 rounded-md bg-amber-500/10 text-amber-400">
              <Clock className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-xl font-black text-amber-400">{formatCurrency(contasAPagarPendentes)}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex flex-wrap gap-3">
        <select
          value={tipoFilter}
          onChange={(e) => setTipoFilter(e.target.value as any)}
          className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200"
        >
          <option value="todos">Todos os Tipos</option>
          <option value="receita">Apenas Receitas</option>
          <option value="despesa">Apenas Despesas</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200"
        >
          <option value="todos">Todos os Status</option>
          <option value="pago">Quitados / Pagos</option>
          <option value="pendente">Pendentes</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Tipo</th>
                <th className="py-3 px-4">Descrição</th>
                <th className="py-3 px-4">Categoria</th>
                <th className="py-3 px-4">Data Venc.</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Valor</th>
                <th className="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    Nenhum lançamento financeiro registrado.
                  </td>
                </tr>
              ) : (
                filtered.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      {l.tipo === 'receita' ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          RECEITA
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          DESPESA
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-bold text-white">
                      {l.descricao}
                      {l.referenciaNumero && (
                        <span className="ml-1.5 text-[10px] text-indigo-400 font-mono font-normal">
                          (Ref: #{l.referenciaNumero})
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-400">{l.categoria}</td>
                    <td className="py-3 px-4 text-slate-300">
                      {new Date(l.dataVencimento).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => toggleStatus(l)}
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border transition-all ${
                          l.status === 'pago' 
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        }`}
                      >
                        {l.status === 'pago' ? 'PAGO' : 'PENDENTE'}
                      </button>
                    </td>
                    <td className={`py-3 px-4 text-right font-bold text-sm ${
                      l.tipo === 'receita' ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {l.tipo === 'receita' ? '+' : '-'}{formatCurrency(l.valor)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => onExcluirLancamento(l.id)}
                        className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="font-bold text-white text-base">
                {tipo === 'receita' ? 'Adicionar Receita' : 'Adicionar Despesa'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Descrição *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Pagamento Fornecedor, Internet, Conta de Luz..."
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Valor (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={valor}
                    onChange={(e) => setValor(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Categoria</label>
                  <input
                    type="text"
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Data Vencimento</label>
                  <input
                    type="date"
                    value={dataVencimento}
                    onChange={(e) => setDataVencimento(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as StatusLancamento)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="pago">Pago / Recebido</option>
                    <option value="pendente">Pendente</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg"
                >
                  Salvar Lançamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

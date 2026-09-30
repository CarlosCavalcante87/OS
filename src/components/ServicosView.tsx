import React, { useState } from 'react';
import { Wrench, Plus, Search, Edit3, Trash2, Clock, X } from 'lucide-react';
import { ServicoItem } from '../types/os';
import { formatCurrency } from '../utils/generateOSPDF';

interface ServicosViewProps {
  servicos: ServicoItem[];
  onSalvarServico: (servico: ServicoItem) => void;
  onExcluirServico: (id: string) => void;
}

export const ServicosView: React.FC<ServicosViewProps> = ({
  servicos,
  onSalvarServico,
  onExcluirServico
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [servicoEditando, setServicoEditando] = useState<ServicoItem | null>(null);

  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState<number>(0);
  const [tempoEstimadoMinutos, setTempoEstimadoMinutos] = useState<number>(60);

  const openNovoModal = () => {
    setServicoEditando(null);
    setNome('');
    setDescricao('');
    setPreco(0);
    setTempoEstimadoMinutos(60);
    setModalOpen(true);
  };

  const openEditarModal = (s: ServicoItem) => {
    setServicoEditando(s);
    setNome(s.nome);
    setDescricao(s.descricao || '');
    setPreco(s.preco);
    setTempoEstimadoMinutos(s.tempoEstimadoMinutos || 60);
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;

    const payload: ServicoItem = {
      id: servicoEditando ? servicoEditando.id : 'srv-' + Math.random().toString(36).substring(2, 9),
      nome,
      descricao,
      preco: Number(preco) || 0,
      tempoEstimadoMinutos: Number(tempoEstimadoMinutos) || 60,
      createdAt: servicoEditando?.createdAt || new Date().toISOString()
    };

    onSalvarServico(payload);
    setModalOpen(false);
  };

  const filteredServicos = servicos.filter(s =>
    s.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.descricao && s.descricao.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Wrench className="w-5 h-5 text-indigo-400" />
            Tabela de Serviços & Mão de Obra ({servicos.length})
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Preços padrão, descrições e tempo estimado de bancada
          </p>
        </div>

        <button
          onClick={openNovoModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Serviço</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar serviço por nome ou descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredServicos.map((s) => (
          <div
            key={s.id}
            className="bg-slate-900 rounded-2xl border border-slate-800 p-4 flex flex-col justify-between hover:border-slate-700 transition-colors shadow-sm"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold text-sm text-white">{s.nome}</h3>
                <div className="text-right shrink-0">
                  <span className="font-bold text-emerald-400 text-base">
                    {formatCurrency(s.preco)}
                  </span>
                </div>
              </div>

              {s.descricao && (
                <p className="text-xs text-slate-400 mt-2 line-clamp-3">
                  {s.descricao}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 mt-4 border-t border-slate-800 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>{s.tempoEstimadoMinutos || 60} minutos</span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEditarModal(s)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onExcluirServico(s.id)}
                  className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="font-bold text-white text-base">
                {servicoEditando ? 'Editar Serviço' : 'Cadastrar Serviço'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Título do Serviço *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Formatação com Backup, Troca de Conector..."
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Valor do Serviço (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={preco}
                    onChange={(e) => setPreco(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-emerald-400 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Tempo Estimado (min)</label>
                  <input
                    type="number"
                    min="1"
                    value={tempoEstimadoMinutos}
                    onChange={(e) => setTempoEstimadoMinutos(parseInt(e.target.value) || 60)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Descrição Detalhada do Procedimento</label>
                <textarea
                  rows={3}
                  placeholder="O que está incluso neste serviço..."
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
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
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { UserCheck, Plus, Search, Edit3, Trash2, Award, Phone, Mail, DollarSign, X } from 'lucide-react';
import { Tecnico, OrdemServico } from '../types/os';
import { formatCurrency } from '../utils/generateOSPDF';

interface TecnicosViewProps {
  tecnicos: Tecnico[];
  ordens: OrdemServico[];
  onSalvarTecnico: (tecnico: Tecnico) => void;
  onExcluirTecnico: (id: string) => void;
}

export const TecnicosView: React.FC<TecnicosViewProps> = ({
  tecnicos,
  ordens,
  onSalvarTecnico,
  onExcluirTecnico
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [tecnicoEditando, setTecnicoEditando] = useState<Tecnico | null>(null);

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [especialidade, setEspecialidade] = useState('');
  const [comissaoPercent, setComissaoPercent] = useState<number>(10);
  const [status, setStatus] = useState<'ativo' | 'inativo'>('ativo');

  const openNovoModal = () => {
    setTecnicoEditando(null);
    setNome('');
    setEmail('');
    setTelefone('');
    setEspecialidade('');
    setComissaoPercent(10);
    setStatus('ativo');
    setModalOpen(true);
  };

  const openEditarModal = (t: Tecnico) => {
    setTecnicoEditando(t);
    setNome(t.nome);
    setEmail(t.email || '');
    setTelefone(t.telefone || '');
    setEspecialidade(t.especialidade || '');
    setComissaoPercent(t.comissaoPercent || 10);
    setStatus(t.status);
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;

    const payload: Tecnico = {
      id: tecnicoEditando ? tecnicoEditando.id : 'tec-' + Math.random().toString(36).substring(2, 9),
      nome,
      email,
      telefone,
      especialidade,
      comissaoPercent: Number(comissaoPercent) || 0,
      status,
      createdAt: tecnicoEditando?.createdAt || new Date().toISOString()
    };

    onSalvarTecnico(payload);
    setModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-indigo-400" />
            Técnicos & Produtividade ({tecnicos.length})
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Controle de equipe, especialidades e comissões sobre mão de obra
          </p>
        </div>

        <button
          onClick={openNovoModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Técnico</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tecnicos.map((t) => {
          const osTecnico = ordens.filter(o => o.tecnicoNome === t.nome);
          const osConcluidas = osTecnico.filter(o => ['concluido', 'entregue'].includes(o.status));
          const totalMaoDeObra = osConcluidas.reduce((acc, curr) => acc + curr.valorServicos, 0);
          const comissaoTotal = (totalMaoDeObra * (t.comissaoPercent || 10)) / 100;

          return (
            <div
              key={t.id}
              className="bg-slate-900 rounded-2xl border border-slate-800 p-5 flex flex-col justify-between shadow-sm hover:border-slate-700 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white font-bold flex items-center justify-center text-sm shadow-md">
                      {t.nome.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white">{t.nome}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        t.status === 'ativo' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-500'
                      }`}>
                        {t.status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditarModal(t)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onExcluirTecnico(t.id)}
                      className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 text-xs text-slate-300 space-y-1">
                  <p className="text-slate-400 font-medium">
                    Especialidade: <strong className="text-slate-200">{t.especialidade || 'Geral'}</strong>
                  </p>
                  {t.telefone && (
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      <span>{t.telefone}</span>
                    </div>
                  )}
                  {t.email && (
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Mail className="w-3.5 h-3.5 text-slate-500" />
                      <span className="truncate">{t.email}</span>
                    </div>
                  )}
                </div>

                {/* KPI Metrics do Técnico */}
                <div className="mt-4 p-3 bg-slate-950/60 rounded-xl border border-slate-800 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400">OS Concluídas</span>
                    <div className="font-bold text-white text-sm">{osConcluidas.length} / {osTecnico.length}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">Comissão ({t.comissaoPercent || 10}%)</span>
                    <div className="font-bold text-emerald-400 text-sm">{formatCurrency(comissaoTotal)}</div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex justify-between">
                <span>Mão de Obra Faturada:</span>
                <span className="font-semibold text-slate-300">{formatCurrency(totalMaoDeObra)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="font-bold text-white text-base">
                {tecnicoEditando ? 'Editar Técnico' : 'Cadastrar Novo Técnico'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Especialidade Principal</label>
                <input
                  type="text"
                  placeholder="Ex: Solda BGA, Troca de Telas, MacBooks"
                  value={especialidade}
                  onChange={(e) => setEspecialidade(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Telefone</label>
                  <input
                    type="text"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Comissão (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={comissaoPercent}
                    onChange={(e) => setComissaoPercent(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">E-mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'ativo' | 'inativo')}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                >
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                </select>
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

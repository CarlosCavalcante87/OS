import React, { useState } from 'react';
import { Settings, Save, CheckCircle2, ShieldCheck, Building } from 'lucide-react';
import { ConfiguracaoEmpresa } from '../types/os';

interface ConfiguracoesViewProps {
  empresa: ConfiguracaoEmpresa;
  onSalvarEmpresa: (config: ConfiguracaoEmpresa) => void;
}

export const ConfiguracoesView: React.FC<ConfiguracoesViewProps> = ({
  empresa,
  onSalvarEmpresa
}) => {
  const [nomeFantasia, setNomeFantasia] = useState(empresa.nomeFantasia || '');
  const [razaoSocial, setRazaoSocial] = useState(empresa.razaoSocial || '');
  const [cnpj, setCnpj] = useState(empresa.cnpj || '');
  const [telefone, setTelefone] = useState(empresa.telefone || '');
  const [email, setEmail] = useState(empresa.email || '');
  const [endereco, setEndereco] = useState(empresa.endereco || '');
  const [cidade, setCidade] = useState(empresa.cidade || '');
  const [estado, setEstado] = useState(empresa.estado || 'SP');
  const [cep, setCep] = useState(empresa.cep || '');
  const [diasGarantiaPadrao, setDiasGarantiaPadrao] = useState<number>(empresa.diasGarantiaPadrao || 90);
  const [mensagemTermosOS, setMensagemTermosOS] = useState(empresa.mensagemTermosOS || '');

  const [salvoFeedback, setSalvoFeedback] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: ConfiguracaoEmpresa = {
      nomeFantasia,
      razaoSocial,
      cnpj,
      telefone,
      email,
      endereco,
      cidade,
      estado,
      cep,
      diasGarantiaPadrao: Number(diasGarantiaPadrao) || 90,
      mensagemTermosOS
    };

    onSalvarEmpresa(payload);
    setSalvoFeedback(true);
    setTimeout(() => setSalvoFeedback(false), 3000);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
        <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-400" />
          Configurações da Empresa & Termos de Garantia
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Estes dados são exibidos no cabeçalho e rodapé das Ordens de Serviço e Comprovantes em PDF
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-5 text-xs shadow-xl">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <Building className="w-4 h-4 text-indigo-400" />
          <h3 className="font-bold text-white text-sm">Dados Cadastrais da Assistência</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-400 mb-1">Nome Fantasia (Aparece no Topo da OS) *</label>
            <input
              type="text"
              required
              value={nomeFantasia}
              onChange={(e) => setNomeFantasia(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Razão Social</label>
            <input
              type="text"
              value={razaoSocial}
              onChange={(e) => setRazaoSocial(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">CNPJ</label>
            <input
              type="text"
              value={cnpj}
              onChange={(e) => setCnpj(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Telefone Comercial / WhatsApp *</label>
            <input
              type="text"
              required
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">E-mail de Contato</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Endereço Completo</label>
            <input
              type="text"
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
            />
          </div>

          <div className="grid grid-cols-3 gap-2 sm:col-span-2">
            <div>
              <label className="block text-slate-400 mb-1">Cidade</label>
              <input
                type="text"
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Estado (UF)</label>
              <input
                type="text"
                maxLength={2}
                value={estado}
                onChange={(e) => setEstado(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">CEP</label>
              <input
                type="text"
                value={cep}
                onChange={(e) => setCep(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-4 pb-3 border-b border-slate-800">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <h3 className="font-bold text-white text-sm">Garantia e Cláusulas da Ordem de Serviço</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="sm:col-span-1">
            <label className="block text-slate-400 mb-1">Prazo Padrão Garantia (Dias)</label>
            <input
              type="number"
              min="0"
              value={diasGarantiaPadrao}
              onChange={(e) => setDiasGarantiaPadrao(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold"
            />
          </div>

          <div className="sm:col-span-3">
            <label className="block text-slate-400 mb-1">Termos e Condições Impressos na OS</label>
            <textarea
              rows={4}
              value={mensagemTermosOS}
              onChange={(e) => setMensagemTermosOS(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono text-[11px]"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <div>
            {salvoFeedback && (
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" /> Configurações salvas com sucesso!
              </span>
            )}
          </div>

          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all transform active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Alterações</span>
          </button>
        </div>
      </form>
    </div>
  );
};

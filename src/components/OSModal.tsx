import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Plus, 
  Trash2, 
  Printer, 
  User, 
  Wrench, 
  Package, 
  DollarSign, 
  Clock, 
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { 
  OrdemServico, 
  Cliente, 
  Tecnico, 
  ServicoItem, 
  ProdutoItem, 
  ItemOS, 
  OSStatus, 
  OSPrioridade, 
  ConfiguracaoEmpresa 
} from '../types/os';
import { formatCurrency, generateOSPDF } from '../utils/generateOSPDF';

interface OSModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (os: OrdemServico) => void;
  osParaEditar: OrdemServico | null;
  clientes: Cliente[];
  tecnicos: Tecnico[];
  servicos: ServicoItem[];
  produtos: ProdutoItem[];
  empresa: ConfiguracaoEmpresa;
  proximoNumero: number;
}

export const OSModal: React.FC<OSModalProps> = ({
  isOpen,
  onClose,
  onSave,
  osParaEditar,
  clientes,
  tecnicos,
  servicos,
  produtos,
  empresa,
  proximoNumero
}) => {
  if (!isOpen) return null;

  const [numero, setNumero] = useState<number>(proximoNumero);
  const [clienteNome, setClienteNome] = useState('');
  const [clienteTelefone, setClienteTelefone] = useState('');
  const [clienteCpfCnpj, setClienteCpfCnpj] = useState('');
  const [tecnicoNome, setTecnicoNome] = useState('');
  const [equipamento, setEquipamento] = useState('');
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [numeroSerie, setNumeroSerie] = useState('');
  const [acessorios, setAcessorios] = useState('');
  const [defeitoRelatado, setDefeitoRelatado] = useState('');
  const [diagnosticoTecnico, setDiagnosticoTecnico] = useState('');
  const [solucao, setSolucao] = useState('');
  const [status, setStatus] = useState<OSStatus>('aberta');
  const [prioridade, setPrioridade] = useState<OSPrioridade>('normal');
  const [dataAbertura, setDataAbertura] = useState('');
  const [previsaoEntrega, setPrevisaoEntrega] = useState('');
  const [valorDesconto, setValorDesconto] = useState<number>(0);
  const [formaPagamento, setFormaPagamento] = useState('PIX');
  const [observacoes, setObservacoes] = useState('');
  const [garantiaDias, setGarantiaDias] = useState<number>(empresa.diasGarantiaPadrao || 90);

  const [itensServicos, setItensServicos] = useState<ItemOS[]>([]);
  const [itensPecas, setItensPecas] = useState<ItemOS[]>([]);

  // State for adding item
  const [selectedServicoId, setSelectedServicoId] = useState('');
  const [selectedProdutoId, setSelectedProdutoId] = useState('');

  useEffect(() => {
    if (osParaEditar) {
      setNumero(osParaEditar.numero);
      setClienteNome(osParaEditar.clienteNome);
      setClienteTelefone(osParaEditar.clienteTelefone);
      setClienteCpfCnpj(osParaEditar.clienteCpfCnpj || '');
      setTecnicoNome(osParaEditar.tecnicoNome || '');
      setEquipamento(osParaEditar.equipamento);
      setMarca(osParaEditar.marca);
      setModelo(osParaEditar.modelo);
      setNumeroSerie(osParaEditar.numeroSerie || '');
      setAcessorios(osParaEditar.acessorios || '');
      setDefeitoRelatado(osParaEditar.defeitoRelatado);
      setDiagnosticoTecnico(osParaEditar.diagnosticoTecnico || '');
      setSolucao(osParaEditar.solucao || '');
      setStatus(osParaEditar.status);
      setPrioridade(osParaEditar.prioridade);
      setDataAbertura(osParaEditar.dataAbertura);
      setPrevisaoEntrega(osParaEditar.previsaoEntrega || '');
      setValorDesconto(osParaEditar.valorDesconto || 0);
      setFormaPagamento(osParaEditar.formaPagamento || 'PIX');
      setObservacoes(osParaEditar.observacoes || '');
      setGarantiaDias(osParaEditar.garantiaDias || 90);
      setItensServicos(osParaEditar.itensServicos || []);
      setItensPecas(osParaEditar.itensPecas || []);
    } else {
      setNumero(proximoNumero);
      setClienteNome('');
      setClienteTelefone('');
      setClienteCpfCnpj('');
      setTecnicoNome('');
      setEquipamento('');
      setMarca('');
      setModelo('');
      setNumeroSerie('');
      setAcessorios('');
      setDefeitoRelatado('');
      setDiagnosticoTecnico('');
      setSolucao('');
      setStatus('aberta');
      setPrioridade('normal');
      setDataAbertura(new Date().toISOString().slice(0, 10));
      setPrevisaoEntrega(new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10));
      setValorDesconto(0);
      setFormaPagamento('PIX');
      setObservacoes('');
      setGarantiaDias(empresa.diasGarantiaPadrao || 90);
      setItensServicos([]);
      setItensPecas([]);
    }
  }, [osParaEditar, proximoNumero, empresa]);

  const handleClienteSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cli = clientes.find(c => c.nome === e.target.value);
    if (cli) {
      setClienteNome(cli.nome);
      setClienteTelefone(cli.telefone);
      setClienteCpfCnpj(cli.cpfCnpj || '');
    }
  };

  const handleAddServico = () => {
    if (!selectedServicoId) return;
    const serv = servicos.find(s => s.id === selectedServicoId);
    if (!serv) return;

    setItensServicos(prev => [
      ...prev,
      {
        id: 'srv-' + Math.random().toString(36).substring(2, 7),
        itemId: serv.id,
        nome: serv.nome,
        preco: serv.preco,
        quantidade: 1,
        tipo: 'servico'
      }
    ]);
    setSelectedServicoId('');
  };

  const handleAddProduto = () => {
    if (!selectedProdutoId) return;
    const prod = produtos.find(p => p.id === selectedProdutoId);
    if (!prod) return;

    setItensPecas(prev => [
      ...prev,
      {
        id: 'peca-' + Math.random().toString(36).substring(2, 7),
        itemId: prod.id,
        nome: prod.nome,
        preco: prod.precoVenda,
        quantidade: 1,
        tipo: 'peca'
      }
    ]);
    setSelectedProdutoId('');
  };

  const totalServicos = itensServicos.reduce((acc, s) => acc + (s.preco * s.quantidade), 0);
  const totalPecas = itensPecas.reduce((acc, p) => acc + (p.preco * p.quantidade), 0);
  const valorTotalFinal = Math.max(0, (totalServicos + totalPecas) - valorDesconto);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteNome.trim() || !equipamento.trim()) {
      alert('Por favor informe o Nome do Cliente e o Equipamento.');
      return;
    }

    const payload: OrdemServico = {
      id: osParaEditar ? osParaEditar.id : 'os-' + numero,
      numero: numero,
      clienteNome,
      clienteTelefone,
      clienteCpfCnpj,
      tecnicoNome,
      equipamento,
      marca,
      modelo,
      numeroSerie,
      acessorios,
      defeitoRelatado,
      diagnosticoTecnico,
      solucao,
      status,
      prioridade,
      dataAbertura,
      previsaoEntrega,
      dataConclusao: status === 'concluido' || status === 'entregue' ? new Date().toISOString().slice(0, 10) : undefined,
      itensServicos,
      itensPecas,
      valorServicos: totalServicos,
      valorPecas: totalPecas,
      valorDesconto: Number(valorDesconto) || 0,
      valorTotal: valorTotalFinal,
      formaPagamento,
      observacoes,
      garantiaDias,
      createdAt: osParaEditar?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold font-mono">
              #{numero}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                {osParaEditar ? `Editar Ordem de Serviço #${numero}` : `Nova Ordem de Serviço #${numero}`}
              </h2>
              <p className="text-xs text-slate-400">Preencha os dados do cliente, aparelho e serviços</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {osParaEditar && (
              <button
                type="button"
                onClick={() => generateOSPDF(osParaEditar, empresa)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                title="Imprimir PDF"
              >
                <Printer className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline">Imprimir PDF</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {/* Seção 1: Cliente & Técnico */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <User className="w-4 h-4 text-indigo-400" />
              Dados do Cliente & Técnico Responsável
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-slate-400 mb-1">Cliente * (ou selecione cadastrado)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Nome completo do cliente"
                    value={clienteNome}
                    onChange={(e) => setClienteNome(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500"
                  />
                  {clientes.length > 0 && (
                    <select
                      onChange={handleClienteSelect}
                      className="px-2 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 max-w-[140px]"
                    >
                      <option value="">Buscar...</option>
                      {clientes.map(c => (
                        <option key={c.id} value={c.nome}>{c.nome}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Telefone / WhatsApp *</label>
                <input
                  type="text"
                  required
                  placeholder="(11) 99999-9999"
                  value={clienteTelefone}
                  onChange={(e) => setClienteTelefone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">CPF / CNPJ</label>
                <input
                  type="text"
                  placeholder="000.000.000-00"
                  value={clienteCpfCnpj}
                  onChange={(e) => setClienteCpfCnpj(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Técnico Atribuído</label>
                <select
                  value={tecnicoNome}
                  onChange={(e) => setTecnicoNome(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Não atribuído ainda</option>
                  {tecnicos.map(t => (
                    <option key={t.id} value={t.nome}>{t.nome} ({t.especialidade || 'Geral'})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Status da OS</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as OSStatus)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-indigo-300 font-bold focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="aberta">Aberta</option>
                  <option value="em_analise">Em Análise</option>
                  <option value="orcamento_pendente">Orçamento Pendente</option>
                  <option value="aprovada">Aprovada</option>
                  <option value="em_andamento">Em Andamento</option>
                  <option value="aguardando_pecas">Aguardando Peças</option>
                  <option value="concluido">Concluída</option>
                  <option value="entregue">Entregue</option>
                  <option value="cancelada">Cancelada</option>
                </select>
              </div>
            </div>
          </div>

          {/* Seção 2: Aparelho & Defeito */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <h3 className="font-bold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Wrench className="w-4 h-4 text-emerald-400" />
              Equipamento & Defeito Relatado
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-slate-400 mb-1">Equipamento *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Notebook, Smartphone, Console, Placa de Vídeo"
                  value={equipamento}
                  onChange={(e) => setEquipamento(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Marca</label>
                <input
                  type="text"
                  placeholder="Ex: Dell, Apple, Samsung"
                  value={marca}
                  onChange={(e) => setMarca(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Modelo</label>
                <input
                  type="text"
                  placeholder="Ex: Inspiron 15 5510"
                  value={modelo}
                  onChange={(e) => setModelo(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-400 mb-1">Nº de Série / IMEI</label>
                <input
                  type="text"
                  placeholder="Número de identificação do aparelho"
                  value={numeroSerie}
                  onChange={(e) => setNumeroSerie(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-400 mb-1">Acessórios Deixados</label>
                <input
                  type="text"
                  placeholder="Ex: Carregador, cabo USB, capa, mouse"
                  value={acessorios}
                  onChange={(e) => setAcessorios(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="sm:col-span-4">
                <label className="block text-slate-400 mb-1">Defeito Relatado pelo Cliente *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Descreva exatamente o sintoma relatado..."
                  value={defeitoRelatado}
                  onChange={(e) => setDefeitoRelatado(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-400 mb-1">Diagnóstico do Técnico / Laudo</label>
                <textarea
                  rows={2}
                  placeholder="Parecer técnico obtido nos testes..."
                  value={diagnosticoTecnico}
                  onChange={(e) => setDiagnosticoTecnico(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-400 mb-1">Solução Aplicada</label>
                <textarea
                  rows={2}
                  placeholder="Procedimento final executado..."
                  value={solucao}
                  onChange={(e) => setSolucao(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>
            </div>
          </div>

          {/* Seção 3: Serviços e Peças */}
          <div className="space-y-4 pt-3 border-t border-slate-800">
            <h3 className="font-bold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Package className="w-4 h-4 text-purple-400" />
              Itens da Ordem: Mão de Obra & Peças
            </h3>

            {/* Adicionar Serviço */}
            <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200">Serviços / Mão de Obra</span>
                <div className="flex gap-2">
                  <select
                    value={selectedServicoId}
                    onChange={(e) => setSelectedServicoId(e.target.value)}
                    className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-slate-200"
                  >
                    <option value="">Selecione serviço...</option>
                    {servicos.map(s => (
                      <option key={s.id} value={s.id}>{s.nome} ({formatCurrency(s.preco)})</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleAddServico}
                    className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-bold"
                  >
                    + Adicionar
                  </button>
                </div>
              </div>

              {itensServicos.length > 0 && (
                <div className="divide-y divide-slate-700/50">
                  {itensServicos.map((s, idx) => (
                    <div key={s.id || idx} className="py-1.5 flex items-center justify-between text-[11px]">
                      <span className="text-white">{s.nome}</span>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-indigo-300">{formatCurrency(s.preco)}</span>
                        <button
                          type="button"
                          onClick={() => setItensServicos(prev => prev.filter((_, i) => i !== idx))}
                          className="text-rose-400 hover:text-rose-300"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Adicionar Peça do Estoque */}
            <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200">Peças & Componentes (Estoque)</span>
                <div className="flex gap-2">
                  <select
                    value={selectedProdutoId}
                    onChange={(e) => setSelectedProdutoId(e.target.value)}
                    className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-slate-200"
                  >
                    <option value="">Selecione produto/peça...</option>
                    {produtos.map(p => (
                      <option key={p.id} value={p.id}>{p.nome} ({formatCurrency(p.precoVenda)})</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleAddProduto}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold"
                  >
                    + Adicionar
                  </button>
                </div>
              </div>

              {itensPecas.length > 0 && (
                <div className="divide-y divide-slate-700/50">
                  {itensPecas.map((p, idx) => (
                    <div key={p.id || idx} className="py-1.5 flex items-center justify-between text-[11px]">
                      <span className="text-white">{p.nome}</span>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-emerald-400">{formatCurrency(p.preco)}</span>
                        <button
                          type="button"
                          onClick={() => setItensPecas(prev => prev.filter((_, i) => i !== idx))}
                          className="text-rose-400 hover:text-rose-300"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Seção 4: Valores, Datas, Garantia e Pagamento */}
          <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-slate-400 mb-1">Data Abertura</label>
              <input
                type="date"
                value={dataAbertura}
                onChange={(e) => setDataAbertura(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Previsão de Entrega</label>
              <input
                type="date"
                value={previsaoEntrega}
                onChange={(e) => setPrevisaoEntrega(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Prioridade</label>
              <select
                value={prioridade}
                onChange={(e) => setPrioridade(e.target.value as OSPrioridade)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
              >
                <option value="baixa">Baixa</option>
                <option value="normal">Normal</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Garantia (Dias)</label>
              <input
                type="number"
                value={garantiaDias}
                onChange={(e) => setGarantiaDias(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Forma Pagamento</label>
              <select
                value={formaPagamento}
                onChange={(e) => setFormaPagamento(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
              >
                <option value="PIX">PIX</option>
                <option value="Dinheiro">Dinheiro</option>
                <option value="Cartão de Crédito">Cartão de Crédito</option>
                <option value="Cartão de Débito">Cartão de Débito</option>
                <option value="Boleto">Boleto Bancário</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Desconto (R$)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={valorDesconto}
                onChange={(e) => setValorDesconto(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
              />
            </div>

            <div className="sm:col-span-2 bg-indigo-950/40 p-3 rounded-xl border border-indigo-500/30 flex items-center justify-between">
              <div>
                <div className="text-[11px] text-indigo-300">Resumo da OS:</div>
                <div className="text-[10px] text-slate-400">Serviços: {formatCurrency(totalServicos)} | Peças: {formatCurrency(totalPecas)}</div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Total a Cobrar</span>
                <div className="text-xl font-black text-emerald-400">{formatCurrency(valorTotalFinal)}</div>
              </div>
            </div>
          </div>

          {/* Modal Footer Buttons */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold transition-colors"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/30 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{osParaEditar ? 'Atualizar OS' : 'Salvar Ordem de Serviço'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

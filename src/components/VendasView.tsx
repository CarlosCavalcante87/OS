import React, { useState } from 'react';
import { ShoppingCart, Plus, Trash2, Printer, Search, CheckCircle2, User, DollarSign } from 'lucide-react';
import { Venda, ItemVenda, FormaPagamento } from '../types/venda';
import { ProdutoItem, Cliente, ConfiguracaoEmpresa } from '../types/os';
import { formatCurrency, generateVendaPDF } from '../utils/generateOSPDF';

interface VendasViewProps {
  vendas: Venda[];
  produtos: ProdutoItem[];
  clientes: Cliente[];
  empresa: ConfiguracaoEmpresa;
  proximoNumeroVenda: number;
  onFinalizarVenda: (venda: Venda) => void;
  onCancelarVenda: (id: string) => void;
}

export const VendasView: React.FC<VendasViewProps> = ({
  vendas,
  produtos,
  clientes,
  empresa,
  proximoNumeroVenda,
  onFinalizarVenda,
  onCancelarVenda
}) => {
  const [tab, setTab] = useState<'nova' | 'historico'>('nova');
  const [clienteNome, setClienteNome] = useState('');
  const [carrinho, setCarrinho] = useState<ItemVenda[]>([]);
  const [selectedProdutoId, setSelectedProdutoId] = useState('');
  const [desconto, setDesconto] = useState<number>(0);
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>('pix');
  const [searchTerm, setSearchTerm] = useState('');

  const handleAddItem = (prod: ProdutoItem) => {
    setCarrinho(prev => {
      const existing = prev.find(item => item.produtoId === prod.id);
      if (existing) {
        return prev.map(item => item.produtoId === prod.id 
          ? { ...item, quantidade: item.quantidade + 1, subtotal: (item.quantidade + 1) * item.precoUnitario }
          : item
        );
      } else {
        return [
          ...prev,
          {
            id: 'item-' + Math.random().toString(36).substring(2, 7),
            produtoId: prod.id,
            nome: prod.nome,
            quantidade: 1,
            precoUnitario: prod.precoVenda,
            subtotal: prod.precoVenda
          }
        ];
      }
    });
  };

  const handleUpdateQtd = (produtoId: string, novaQtd: number) => {
    if (novaQtd <= 0) {
      setCarrinho(prev => prev.filter(item => item.produtoId !== produtoId));
      return;
    }
    setCarrinho(prev => prev.map(item => item.produtoId === produtoId
      ? { ...item, quantidade: novaQtd, subtotal: novaQtd * item.precoUnitario }
      : item
    ));
  };

  const subtotal = carrinho.reduce((acc, curr) => acc + curr.subtotal, 0);
  const total = Math.max(0, subtotal - (Number(desconto) || 0));

  const handleFinalizar = (e: React.FormEvent) => {
    e.preventDefault();
    if (carrinho.length === 0) {
      alert('Adicione pelo menos um produto ao carrinho.');
      return;
    }

    const payload: Venda = {
      id: 'venda-' + proximoNumeroVenda,
      numero: proximoNumeroVenda,
      clienteNome: clienteNome.trim() || 'Cliente Balcão',
      dataVenda: new Date().toISOString(),
      itens: carrinho,
      valorSubtotal: subtotal,
      valorDesconto: Number(desconto) || 0,
      valorTotal: total,
      formaPagamento,
      status: 'finalizada',
      createdAt: new Date().toISOString()
    };

    onFinalizarVenda(payload);
    // Reset form
    setCarrinho([]);
    setClienteNome('');
    setDesconto(0);
    setTab('historico');
  };

  const filteredProdutos = produtos.filter(p => 
    p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.codigo && p.codigo.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-emerald-400" />
            Ponto de Venda (PDV Balcão)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Venda direta de peças, acessórios e insumos com baixa automática no estoque
          </p>
        </div>

        <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => setTab('nova')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              tab === 'nova' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Nova Venda (Caixa)
          </button>
          <button
            onClick={() => setTab('historico')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              tab === 'historico' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Histórico ({vendas.length})
          </button>
        </div>
      </div>

      {tab === 'nova' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left: Product Selector */}
          <div className="lg:col-span-7 space-y-3">
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Pesquisar produto pelo nome ou código de barras..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[500px] overflow-y-auto pr-1">
                {filteredProdutos.map((p) => {
                  const esgotado = p.estoqueAtual <= 0;
                  return (
                    <button
                      key={p.id}
                      disabled={esgotado}
                      onClick={() => handleAddItem(p)}
                      className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                        esgotado 
                          ? 'bg-slate-950/40 border-slate-800/40 opacity-50 cursor-not-allowed'
                          : 'bg-slate-800/80 border-slate-700/80 hover:border-emerald-500/60 hover:bg-slate-800 active:scale-98'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                          <span>{p.categoria || 'Geral'}</span>
                          <span className={`font-bold ${p.estoqueAtual <= 2 ? 'text-rose-400' : 'text-slate-400'}`}>
                            {p.estoqueAtual} em estoque
                          </span>
                        </div>
                        <div className="font-bold text-xs text-white line-clamp-1">{p.nome}</div>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="font-mono text-[10px] text-slate-500">{p.codigo || '—'}</span>
                        <span className="font-bold text-emerald-400 text-sm">{formatCurrency(p.precoVenda)}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Cart & Checkout */}
          <div className="lg:col-span-5">
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 sm:p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white">Carrinho da Venda</span>
                  <span className="font-mono text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Venda #{proximoNumeroVenda}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setCarrinho([])}
                  className="text-[11px] text-rose-400 hover:underline"
                >
                  Limpar
                </button>
              </div>

              {/* Client selector */}
              <div>
                <label className="block text-slate-400 text-xs mb-1">Cliente</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nome do cliente (opcional)"
                    value={clienteNome}
                    onChange={(e) => setClienteNome(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                  />
                  {clientes.length > 0 && (
                    <select
                      onChange={(e) => setClienteNome(e.target.value)}
                      className="px-2 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-300 max-w-[120px]"
                    >
                      <option value="">Buscar...</option>
                      {clientes.map(c => (
                        <option key={c.id} value={c.nome}>{c.nome}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {carrinho.length === 0 ? (
                  <div className="py-8 text-center text-slate-500 text-xs italic">
                    Nenhum item adicionado ao carrinho.
                  </div>
                ) : (
                  carrinho.map((item) => (
                    <div key={item.id} className="p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/60 flex items-center justify-between gap-2 text-xs">
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-white truncate">{item.nome}</div>
                        <div className="text-[10px] text-slate-400">{formatCurrency(item.precoUnitario)} cada</div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700">
                          <button
                            type="button"
                            onClick={() => handleUpdateQtd(item.produtoId, item.quantidade - 1)}
                            className="text-slate-400 hover:text-white px-1"
                          >
                            -
                          </button>
                          <span className="font-bold text-white text-xs px-1">{item.quantidade}</span>
                          <button
                            type="button"
                            onClick={() => handleUpdateQtd(item.produtoId, item.quantidade + 1)}
                            className="text-slate-400 hover:text-white px-1"
                          >
                            +
                          </button>
                        </div>

                        <span className="font-bold text-emerald-400 text-xs min-w-[65px] text-right">
                          {formatCurrency(item.subtotal)}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleUpdateQtd(item.produtoId, 0)}
                          className="text-rose-400 hover:text-rose-300 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Payment & Totals */}
              <div className="pt-3 border-t border-slate-800 space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Forma de Pagamento</label>
                    <select
                      value={formaPagamento}
                      onChange={(e) => setFormaPagamento(e.target.value as FormaPagamento)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-semibold"
                    >
                      <option value="pix">PIX</option>
                      <option value="dinheiro">Dinheiro</option>
                      <option value="cartao_credito">Cartão de Crédito</option>
                      <option value="cartao_debito">Cartão de Débito</option>
                      <option value="boleto">Boleto Bancário</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Desconto (R$)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={desconto}
                      onChange={(e) => setDesconto(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-semibold"
                    />
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1.5">
                  <div className="flex justify-between text-slate-400 text-xs">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  {desconto > 0 && (
                    <div className="flex justify-between text-rose-400 text-xs">
                      <span>Desconto:</span>
                      <span>-{formatCurrency(desconto)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2 border-t border-slate-800 font-extrabold text-sm">
                    <span className="text-white">TOTAL A RECEBER:</span>
                    <span className="text-emerald-400 text-xl">{formatCurrency(total)}</span>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={carrinho.length === 0}
                  onClick={handleFinalizar}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Finalizar Venda & Emitir</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* History of Sales */
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Venda Nº</th>
                  <th className="py-3 px-4">Data</th>
                  <th className="py-3 px-4">Cliente</th>
                  <th className="py-3 px-4">Itens</th>
                  <th className="py-3 px-4">Pagamento</th>
                  <th className="py-3 px-4 text-right">Total</th>
                  <th className="py-3 px-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {vendas.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      Nenhuma venda registrada ainda.
                    </td>
                  </tr>
                ) : (
                  vendas.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                        #{v.numero}
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {new Date(v.dataVenda).toLocaleString('pt-BR')}
                      </td>
                      <td className="py-3 px-4 font-bold text-white">
                        {v.clienteNome}
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {v.itens.length} {v.itens.length === 1 ? 'item' : 'itens'}
                      </td>
                      <td className="py-3 px-4 uppercase text-indigo-300 font-semibold text-[10px]">
                        {v.formaPagamento}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-400">
                        {formatCurrency(v.valorTotal)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => generateVendaPDF(v, empresa)}
                            title="Imprimir Comprovante"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onCancelarVenda(v.id)}
                            title="Cancelar Venda"
                            className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

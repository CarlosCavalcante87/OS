import React, { useState } from 'react';
import { Package, Plus, Search, Edit3, Trash2, AlertTriangle, TrendingUp, X } from 'lucide-react';
import { ProdutoItem } from '../types/os';
import { formatCurrency } from '../utils/generateOSPDF';

interface EstoqueViewProps {
  produtos: ProdutoItem[];
  onSalvarProduto: (produto: ProdutoItem) => void;
  onExcluirProduto: (id: string) => void;
}

export const EstoqueView: React.FC<EstoqueViewProps> = ({
  produtos,
  onSalvarProduto,
  onExcluirProduto
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaFilter, setCategoriaFilter] = useState('todas');
  const [modalOpen, setModalOpen] = useState(false);
  const [produtoEditando, setProdutoEditando] = useState<ProdutoItem | null>(null);

  const [codigo, setCodigo] = useState('');
  const [nome, setNome] = useState('');
  const [categoria, setCategoria] = useState('');
  const [precoCusto, setPrecoCusto] = useState<number>(0);
  const [precoVenda, setPrecoVenda] = useState<number>(0);
  const [estoqueAtual, setEstoqueAtual] = useState<number>(1);
  const [estoqueMinimo, setEstoqueMinimo] = useState<number>(3);
  const [unidade, setUnidade] = useState('UN');

  const openNovoModal = () => {
    setProdutoEditando(null);
    setCodigo('');
    setNome('');
    setCategoria('Peças');
    setPrecoCusto(0);
    setPrecoVenda(0);
    setEstoqueAtual(5);
    setEstoqueMinimo(2);
    setUnidade('UN');
    setModalOpen(true);
  };

  const openEditarModal = (p: ProdutoItem) => {
    setProdutoEditando(p);
    setCodigo(p.codigo || '');
    setNome(p.nome);
    setCategoria(p.categoria || 'Geral');
    setPrecoCusto(p.precoCusto || 0);
    setPrecoVenda(p.precoVenda || 0);
    setEstoqueAtual(p.estoqueAtual);
    setEstoqueMinimo(p.estoqueMinimo || 3);
    setUnidade(p.unidade || 'UN');
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;

    const payload: ProdutoItem = {
      id: produtoEditando ? produtoEditando.id : 'prod-' + Math.random().toString(36).substring(2, 9),
      codigo,
      nome,
      categoria,
      precoCusto: Number(precoCusto) || 0,
      precoVenda: Number(precoVenda) || 0,
      estoqueAtual: Number(estoqueAtual) || 0,
      estoqueMinimo: Number(estoqueMinimo) || 0,
      unidade,
      createdAt: produtoEditando?.createdAt || new Date().toISOString()
    };

    onSalvarProduto(payload);
    setModalOpen(false);
  };

  const ajustarEstoque = (p: ProdutoItem, delta: number) => {
    const novoEstoque = Math.max(0, p.estoqueAtual + delta);
    onSalvarProduto({ ...p, estoqueAtual: novoEstoque });
  };

  const categorias = Array.from(new Set(produtos.map(p => p.categoria || 'Geral')));

  const filteredProdutos = produtos.filter(p => {
    const term = searchTerm.toLowerCase();
    const matchTerm = 
      p.nome.toLowerCase().includes(term) ||
      (p.codigo && p.codigo.toLowerCase().includes(term)) ||
      (p.categoria && p.categoria.toLowerCase().includes(term));
    const matchCat = categoriaFilter === 'todas' || p.categoria === categoriaFilter;
    return matchTerm && matchCat;
  });

  const totalEstoqueValor = produtos.reduce((acc, curr) => acc + (curr.precoVenda * curr.estoqueAtual), 0);
  const totalCustoEstoque = produtos.reduce((acc, curr) => acc + ((curr.precoCusto || 0) * curr.estoqueAtual), 0);
  const lucroPotencial = totalEstoqueValor - totalCustoEstoque;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-indigo-400" />
            Estoque de Peças & Produtos ({produtos.length})
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Valor em estoque: <strong className="text-emerald-400">{formatCurrency(totalEstoqueValor)}</strong> &bull; Lucro potencial: <strong className="text-indigo-400">{formatCurrency(lucroPotencial)}</strong>
          </p>
        </div>

        <button
          onClick={openNovoModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Item</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por código, produto ou categoria..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          value={categoriaFilter}
          onChange={(e) => setCategoriaFilter(e.target.value)}
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200"
        >
          <option value="todas">Todas as Categorias</option>
          {categorias.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Código</th>
                <th className="py-3 px-4">Item / Peça</th>
                <th className="py-3 px-4">Categoria</th>
                <th className="py-3 px-4 text-right">P. Custo</th>
                <th className="py-3 px-4 text-right">P. Venda</th>
                <th className="py-3 px-4 text-center">Margem</th>
                <th className="py-3 px-4 text-center">Estoque Atual</th>
                <th className="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredProdutos.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    Nenhum produto cadastrado no estoque.
                  </td>
                </tr>
              ) : (
                filteredProdutos.map((p) => {
                  const margem = p.precoCusto && p.precoCusto > 0 
                    ? (((p.precoVenda - p.precoCusto) / p.precoCusto) * 100).toFixed(0) 
                    : 100;
                  const isBaixo = p.estoqueAtual <= (p.estoqueMinimo || 3);

                  return (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-400 font-bold">
                        {p.codigo || '—'}
                      </td>
                      <td className="py-3 px-4 font-bold text-white">
                        {p.nome}
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {p.categoria || 'Geral'}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-400">
                        {formatCurrency(p.precoCusto || 0)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-400">
                        {formatCurrency(p.precoVenda)}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-indigo-400">
                        +{margem}%
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => ajustarEstoque(p, -1)}
                            className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center justify-center"
                          >
                            -
                          </button>
                          <span className={`px-2.5 py-0.5 rounded-full font-bold text-xs ${
                            isBaixo ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-slate-800 text-slate-200'
                          }`}>
                            {p.estoqueAtual} {p.unidade || 'UN'}
                          </span>
                          <button
                            onClick={() => ajustarEstoque(p, 1)}
                            className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center justify-center"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => openEditarModal(p)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onExcluirProduto(p.id)}
                            className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="font-bold text-white text-base">
                {produtoEditando ? 'Editar Produto / Peça' : 'Cadastrar no Estoque'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Código / SKU</label>
                  <input
                    type="text"
                    placeholder="Ex: SSD-512"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-slate-400 mb-1">Categoria</label>
                  <input
                    type="text"
                    placeholder="Ex: Armazenamento, Telas, Baterias"
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Nome do Produto / Descrição *</label>
                <input
                  type="text"
                  required
                  placeholder="Nome completo do item"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Preço de Custo (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={precoCusto}
                    onChange={(e) => setPrecoCusto(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Preço de Venda (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={precoVenda}
                    onChange={(e) => setPrecoVenda(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-emerald-400 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Estoque Inicial</label>
                  <input
                    type="number"
                    min="0"
                    value={estoqueAtual}
                    onChange={(e) => setEstoqueAtual(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Estoque Mínimo</label>
                  <input
                    type="number"
                    min="0"
                    value={estoqueMinimo}
                    onChange={(e) => setEstoqueMinimo(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Unidade</label>
                  <input
                    type="text"
                    value={unidade}
                    onChange={(e) => setUnidade(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
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

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { SidebarMenu, ActiveTab } from './components/SidebarMenu';
import { DashboardView } from './components/DashboardView';
import { OSListView } from './components/OSListView';
import { KanbanView } from './components/KanbanView';
import { VendasView } from './components/VendasView';
import { LancamentosFinanceirosView } from './components/LancamentosFinanceirosView';
import { ClientesView } from './components/ClientesView';
import { TecnicosView } from './components/TecnicosView';
import { EstoqueView } from './components/EstoqueView';
import { ServicosView } from './components/ServicosView';
import { ConfiguracoesView } from './components/ConfiguracoesView';
import { OSModal } from './components/OSModal';
import { ConfirmModal } from './components/ConfirmModal';

import {
  clientesRepo,
  tecnicosRepo,
  servicosRepo,
  produtosRepo,
  osRepo,
  vendasRepo,
  financeiroRepo,
  getEmpresaConfig,
  saveEmpresaConfig,
  initializeDatabaseIfEmpty,
  DEFAULT_EMPRESA_CONFIG
} from './services/api';

import { 
  OrdemServico, 
  Cliente, 
  Tecnico, 
  ServicoItem, 
  ProdutoItem, 
  OSStatus, 
  ConfiguracaoEmpresa 
} from './types/os';
import { Venda } from './types/venda';
import { LancamentoFinanceiro } from './types/financeiro';

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [loading, setLoading] = useState(true);

  // Data states
  const [ordens, setOrdens] = useState<OrdemServico[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);
  const [servicos, setServicos] = useState<ServicoItem[]>([]);
  const [produtos, setProdutos] = useState<ProdutoItem[]>([]);
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [financeiro, setFinanceiro] = useState<LancamentoFinanceiro[]>([]);
  const [empresa, setEmpresa] = useState<ConfiguracaoEmpresa>(DEFAULT_EMPRESA_CONFIG);

  // Global search
  const [globalSearch, setGlobalSearch] = useState('');

  // Modal states
  const [isOSModalOpen, setIsOSModalOpen] = useState(false);
  const [osParaEditar, setOsParaEditar] = useState<OrdemServico | null>(null);

  // Confirm delete modal
  const [confirmDelete, setConfirmDelete] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const loadAllData = async () => {
    try {
      await initializeDatabaseIfEmpty();
      const [osData, cliData, tecData, srvData, prodData, vData, finData, empData] = await Promise.all([
        osRepo.getAll(),
        clientesRepo.getAll(),
        tecnicosRepo.getAll(),
        servicosRepo.getAll(),
        produtosRepo.getAll(),
        vendasRepo.getAll(),
        financeiroRepo.getAll(),
        getEmpresaConfig()
      ]);

      setOrdens(osData);
      setClientes(cliData);
      setTecnicos(tecData);
      setServicos(srvData);
      setProdutos(prodData);
      setVendas(vData);
      setFinanceiro(finData);
      setEmpresa(empData);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Handlers for OS
  const handleNovaOS = () => {
    setOsParaEditar(null);
    setIsOSModalOpen(true);
  };

  const handleEditarOS = (os: OrdemServico) => {
    setOsParaEditar(os);
    setIsOSModalOpen(true);
  };

  const handleSalvarOS = async (novaOS: OrdemServico) => {
    await osRepo.save(novaOS);
    setOrdens(prev => {
      const idx = prev.findIndex(o => o.id === novaOS.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = novaOS;
        return copy;
      }
      return [novaOS, ...prev];
    });

    // Se a OS foi entregue ou concluída, registra receita financeira se ainda não existir
    if (['concluido', 'entregue'].includes(novaOS.status) && novaOS.valorTotal > 0) {
      const jaExiste = financeiro.some(f => f.referenciaTipo === 'os' && f.referenciaId === novaOS.id);
      if (!jaExiste) {
        const novoFin: LancamentoFinanceiro = {
          id: 'fin-os-' + novaOS.numero,
          tipo: 'receita',
          categoria: 'Ordem de Serviço',
          descricao: `OS #${novaOS.numero} - ${novaOS.clienteNome} (${novaOS.equipamento})`,
          valor: novaOS.valorTotal,
          dataVencimento: new Date().toISOString().slice(0, 10),
          dataPagamento: new Date().toISOString().slice(0, 10),
          status: 'pago',
          referenciaTipo: 'os',
          referenciaId: novaOS.id,
          referenciaNumero: novaOS.numero,
          createdAt: new Date().toISOString()
        };
        await financeiroRepo.save(novoFin);
        setFinanceiro(prev => [novoFin, ...prev]);
      }
    }

    setIsOSModalOpen(false);
  };

  const handleExcluirOS = (id: string) => {
    setConfirmDelete({
      isOpen: true,
      title: 'Excluir Ordem de Serviço',
      message: 'Tem certeza que deseja excluir esta OS permanentemente?',
      onConfirm: async () => {
        await osRepo.remove(id);
        setOrdens(prev => prev.filter(o => o.id !== id));
        setConfirmDelete(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleAtualizarStatusOS = async (osId: string, novoStatus: OSStatus) => {
    const os = ordens.find(o => o.id === osId);
    if (!os) return;
    const updated: OrdemServico = {
      ...os,
      status: novoStatus,
      dataConclusao: ['concluido', 'entregue'].includes(novoStatus) ? new Date().toISOString().slice(0, 10) : os.dataConclusao,
      updatedAt: new Date().toISOString()
    };
    await osRepo.save(updated);
    setOrdens(prev => prev.map(o => o.id === osId ? updated : o));
  };

  // Handlers for Vendas
  const handleFinalizarVenda = async (venda: Venda) => {
    await vendasRepo.save(venda);
    setVendas(prev => [venda, ...prev]);

    // Reduz estoque dos itens vendidos
    for (const item of venda.itens) {
      const prod = produtos.find(p => p.id === item.produtoId);
      if (prod) {
        const updatedProd: ProdutoItem = {
          ...prod,
          estoqueAtual: Math.max(0, prod.estoqueAtual - item.quantidade)
        };
        await produtosRepo.save(updatedProd);
        setProdutos(prev => prev.map(p => p.id === prod.id ? updatedProd : p));
      }
    }

    // Registra receita financeira automática
    const novoFin: LancamentoFinanceiro = {
      id: 'fin-venda-' + venda.numero,
      tipo: 'receita',
      categoria: 'Venda de Balcão',
      descricao: `Venda #${venda.numero} - ${venda.clienteNome}`,
      valor: venda.valorTotal,
      dataVencimento: new Date().toISOString().slice(0, 10),
      dataPagamento: new Date().toISOString().slice(0, 10),
      status: 'pago',
      referenciaTipo: 'venda',
      referenciaId: venda.id,
      referenciaNumero: venda.numero,
      createdAt: new Date().toISOString()
    };
    await financeiroRepo.save(novoFin);
    setFinanceiro(prev => [novoFin, ...prev]);
  };

  const handleCancelarVenda = (id: string) => {
    setConfirmDelete({
      isOpen: true,
      title: 'Cancelar Venda',
      message: 'Tem certeza que deseja cancelar esta venda do histórico?',
      onConfirm: async () => {
        await vendasRepo.remove(id);
        setVendas(prev => prev.filter(v => v.id !== id));
        setConfirmDelete(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // Handlers for Clientes
  const handleSalvarCliente = async (cliente: Cliente) => {
    await clientesRepo.save(cliente);
    setClientes(prev => {
      const idx = prev.findIndex(c => c.id === cliente.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = cliente;
        return copy;
      }
      return [cliente, ...prev];
    });
  };

  const handleExcluirCliente = (id: string) => {
    setConfirmDelete({
      isOpen: true,
      title: 'Excluir Cliente',
      message: 'Tem certeza que deseja excluir o cadastro deste cliente?',
      onConfirm: async () => {
        await clientesRepo.remove(id);
        setClientes(prev => prev.filter(c => c.id !== id));
        setConfirmDelete(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // Handlers for Tecnicos
  const handleSalvarTecnico = async (tecnico: Tecnico) => {
    await tecnicosRepo.save(tecnico);
    setTecnicos(prev => {
      const idx = prev.findIndex(t => t.id === tecnico.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = tecnico;
        return copy;
      }
      return [tecnico, ...prev];
    });
  };

  const handleExcluirTecnico = (id: string) => {
    setConfirmDelete({
      isOpen: true,
      title: 'Excluir Técnico',
      message: 'Tem certeza que deseja remover este técnico?',
      onConfirm: async () => {
        await tecnicosRepo.remove(id);
        setTecnicos(prev => prev.filter(t => t.id !== id));
        setConfirmDelete(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // Handlers for Produtos (Estoque)
  const handleSalvarProduto = async (produto: ProdutoItem) => {
    await produtosRepo.save(produto);
    setProdutos(prev => {
      const idx = prev.findIndex(p => p.id === produto.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = produto;
        return copy;
      }
      return [produto, ...prev];
    });
  };

  const handleExcluirProduto = (id: string) => {
    setConfirmDelete({
      isOpen: true,
      title: 'Excluir Produto',
      message: 'Tem certeza que deseja remover este item do estoque?',
      onConfirm: async () => {
        await produtosRepo.remove(id);
        setProdutos(prev => prev.filter(p => p.id !== id));
        setConfirmDelete(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // Handlers for Servicos
  const handleSalvarServico = async (servico: ServicoItem) => {
    await servicosRepo.save(servico);
    setServicos(prev => {
      const idx = prev.findIndex(s => s.id === servico.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = servico;
        return copy;
      }
      return [servico, ...prev];
    });
  };

  const handleExcluirServico = (id: string) => {
    setConfirmDelete({
      isOpen: true,
      title: 'Excluir Serviço',
      message: 'Tem certeza que deseja remover este serviço do catálogo?',
      onConfirm: async () => {
        await servicosRepo.remove(id);
        setServicos(prev => prev.filter(s => s.id !== id));
        setConfirmDelete(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // Handlers for Financeiro
  const handleSalvarLancamento = async (item: LancamentoFinanceiro) => {
    await financeiroRepo.save(item);
    setFinanceiro(prev => {
      const idx = prev.findIndex(f => f.id === item.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = item;
        return copy;
      }
      return [item, ...prev];
    });
  };

  const handleExcluirLancamento = (id: string) => {
    setConfirmDelete({
      isOpen: true,
      title: 'Excluir Lançamento Financeiro',
      message: 'Tem certeza que deseja remover este registro do caixa?',
      onConfirm: async () => {
        await financeiroRepo.remove(id);
        setFinanceiro(prev => prev.filter(f => f.id !== id));
        setConfirmDelete(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // Handlers for Empresa
  const handleSalvarEmpresa = async (config: ConfiguracaoEmpresa) => {
    await saveEmpresaConfig(config);
    setEmpresa(config);
  };

  // Derived metrics
  const osAtivasCount = ordens.filter(o => !['concluido', 'entregue', 'cancelada'].includes(o.status)).length;
  const estoqueBaixoCount = produtos.filter(p => p.estoqueAtual <= (p.estoqueMinimo || 3)).length;
  
  const faturamentoMes = financeiro
    .filter(f => f.tipo === 'receita' && f.status === 'pago')
    .reduce((acc, curr) => acc + curr.valor, 0);

  const proximoNumeroOS = ordens.length > 0 ? Math.max(...ordens.map(o => o.numero)) + 1 : 1001;
  const proximoNumeroVenda = vendas.length > 0 ? Math.max(...vendas.map(v => v.numero)) + 1 : 2001;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold tracking-wide text-slate-400">Carregando OS Master SaaS...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        onNovaOS={handleNovaOS}
        onNovaVenda={() => setActiveTab('vendas')}
        osAtivasCount={osAtivasCount}
        faturamentoMes={faturamentoMes}
        searchTerm={globalSearch}
        onSearchChange={setGlobalSearch}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto">
        {/* Sidebar */}
        <SidebarMenu
          activeTab={activeTab}
          onTabChange={setActiveTab}
          osBadgeCount={osAtivasCount}
          estoqueBaixoCount={estoqueBaixoCount}
        />

        {/* Dynamic Content View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              ordens={ordens}
              clientes={clientes}
              produtos={produtos}
              vendas={vendas}
              financeiro={financeiro}
              empresa={empresa}
              onNovaOS={handleNovaOS}
              onNovaVenda={() => setActiveTab('vendas')}
              onVerOS={handleEditarOS}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'os_list' && (
            <OSListView
              ordens={ordens}
              tecnicos={tecnicos}
              empresa={empresa}
              onNovaOS={handleNovaOS}
              onEditarOS={handleEditarOS}
              onExcluirOS={handleExcluirOS}
              onAtualizarStatus={handleAtualizarStatusOS}
            />
          )}

          {activeTab === 'kanban' && (
            <KanbanView
              ordens={ordens}
              empresa={empresa}
              onEditarOS={handleEditarOS}
              onNovaOS={handleNovaOS}
              onAtualizarStatus={handleAtualizarStatusOS}
            />
          )}

          {activeTab === 'vendas' && (
            <VendasView
              vendas={vendas}
              produtos={produtos}
              clientes={clientes}
              empresa={empresa}
              proximoNumeroVenda={proximoNumeroVenda}
              onFinalizarVenda={handleFinalizarVenda}
              onCancelarVenda={handleCancelarVenda}
            />
          )}

          {activeTab === 'financeiro' && (
            <LancamentosFinanceirosView
              lancamentos={financeiro}
              onSalvarLancamento={handleSalvarLancamento}
              onExcluirLancamento={handleExcluirLancamento}
            />
          )}

          {activeTab === 'clientes' && (
            <ClientesView
              clientes={clientes}
              ordens={ordens}
              onSalvarCliente={handleSalvarCliente}
              onExcluirCliente={handleExcluirCliente}
            />
          )}

          {activeTab === 'tecnicos' && (
            <TecnicosView
              tecnicos={tecnicos}
              ordens={ordens}
              onSalvarTecnico={handleSalvarTecnico}
              onExcluirTecnico={handleExcluirTecnico}
            />
          )}

          {activeTab === 'estoque' && (
            <EstoqueView
              produtos={produtos}
              onSalvarProduto={handleSalvarProduto}
              onExcluirProduto={handleExcluirProduto}
            />
          )}

          {activeTab === 'servicos' && (
            <ServicosView
              servicos={servicos}
              onSalvarServico={handleSalvarServico}
              onExcluirServico={handleExcluirServico}
            />
          )}

          {activeTab === 'configuracoes' && (
            <ConfiguracoesView
              empresa={empresa}
              onSalvarEmpresa={handleSalvarEmpresa}
            />
          )}
        </main>
      </div>

      {/* Global OS Modal */}
      <OSModal
        isOpen={isOSModalOpen}
        onClose={() => setIsOSModalOpen(false)}
        onSave={handleSalvarOS}
        osParaEditar={osParaEditar}
        clientes={clientes}
        tecnicos={tecnicos}
        servicos={servicos}
        produtos={produtos}
        empresa={empresa}
        proximoNumero={proximoNumeroOS}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        title={confirmDelete.title}
        message={confirmDelete.message}
        onConfirm={confirmDelete.onConfirm}
        onCancel={() => setConfirmDelete(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}

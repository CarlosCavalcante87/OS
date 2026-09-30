import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  onSnapshot 
} from 'firebase/firestore';
import { db, ensureAuth } from '../firebase';
import { Cliente, Tecnico, ServicoItem, ProdutoItem, OrdemServico, ConfiguracaoEmpresa } from '../types/os';
import { Venda } from '../types/venda';
import { LancamentoFinanceiro } from '../types/financeiro';

// Seed initial mock data if database is empty
const INITIAL_CLIENTES: Omit<Cliente, 'id'>[] = [
  {
    nome: 'Carlos Eduardo Mendes',
    telefone: '(11) 98765-4321',
    email: 'carlos.mendes@email.com',
    cpfCnpj: '123.456.789-00',
    endereco: 'Av. Paulista, 1000, Apto 42',
    cidade: 'São Paulo',
    estado: 'SP',
    cep: '01310-100',
    observacoes: 'Cliente preferencial, prefere contato via WhatsApp',
    createdAt: new Date().toISOString()
  },
  {
    nome: 'Mariana Silva Santos',
    telefone: '(11) 99123-8877',
    email: 'mariana.silva@techcorp.com.br',
    cpfCnpj: '28.192.839/0001-92',
    endereco: 'Rua Augusta, 450',
    cidade: 'São Paulo',
    estado: 'SP',
    cep: '01305-000',
    observacoes: 'Nota fiscal em nome da empresa TechCorp',
    createdAt: new Date().toISOString()
  },
  {
    nome: 'Roberto Antunes',
    telefone: '(11) 97654-1122',
    email: 'roberto.antunes@gmail.com',
    cpfCnpj: '321.654.987-11',
    endereco: 'Rua Vergueiro, 1200',
    cidade: 'São Paulo',
    estado: 'SP',
    cep: '04101-000',
    observacoes: 'Indicação do Carlos',
    createdAt: new Date().toISOString()
  }
];

const INITIAL_TECNICOS: Omit<Tecnico, 'id'>[] = [
  {
    nome: 'Lucas Ferreira',
    email: 'lucas.tech@osmaster.com',
    telefone: '(11) 98111-2233',
    especialidade: 'Especialista em Placas Mãe e Solda BGA',
    comissaoPercent: 15,
    status: 'ativo',
    createdAt: new Date().toISOString()
  },
  {
    nome: 'Gabriel Souza',
    email: 'gabriel.s@osmaster.com',
    telefone: '(11) 98222-3344',
    especialidade: 'Smartphones Apple & Android / Troca de Telas',
    comissaoPercent: 12,
    status: 'ativo',
    createdAt: new Date().toISOString()
  },
  {
    nome: 'Ana Beatriz Lima',
    email: 'ana.lima@osmaster.com',
    telefone: '(11) 98333-4455',
    especialidade: 'Notebooks, MacBooks e Otimização de Sistema',
    comissaoPercent: 15,
    status: 'ativo',
    createdAt: new Date().toISOString()
  }
];

const INITIAL_SERVICOS: Omit<ServicoItem, 'id'>[] = [
  {
    nome: 'Formatação e Instalação Windows/Linux com Backup',
    descricao: 'Limpeza de sistema, instalação do SO limpo, drivers oficiais e restauração de dados.',
    preco: 150.00,
    tempoEstimadoMinutos: 120,
    createdAt: new Date().toISOString()
  },
  {
    nome: 'Troca de Tela / Display Notebook 15.6"',
    descricao: 'Substituição cuidadosa com alinhamento e teste de pixels.',
    preco: 180.00,
    tempoEstimadoMinutos: 90,
    createdAt: new Date().toISOString()
  },
  {
    nome: 'Limpeza Preventiva e Troca de Pasta Térmica (Prata)',
    descricao: 'Desmontagem completa, limpeza por ultrassom de ventoinhas e pasta térmica premium Arctic MX-4.',
    preco: 120.00,
    tempoEstimadoMinutos: 60,
    createdAt: new Date().toISOString()
  },
  {
    nome: 'Reparo em Placa Mãe (Curto na Linha de 19V / PMIC)',
    descricao: 'Análise com câmera térmica, identificação de componente em curto e substituição por microsolda.',
    preco: 380.00,
    tempoEstimadoMinutos: 240,
    createdAt: new Date().toISOString()
  },
  {
    nome: 'Troca de Conector de Carga Tipo-C / Micro USB',
    descricao: 'Substituição com solda estanhada reforçada.',
    preco: 110.00,
    tempoEstimadoMinutos: 45,
    createdAt: new Date().toISOString()
  }
];

const INITIAL_PRODUTOS: Omit<ProdutoItem, 'id'>[] = [
  {
    codigo: 'SSD-512-NVME',
    nome: 'SSD NVMe M.2 512GB Kingston NV2 PCIe 4.0',
    categoria: 'Armazenamento',
    precoCusto: 165.00,
    precoVenda: 290.00,
    estoqueAtual: 14,
    estoqueMinimo: 4,
    unidade: 'UN',
    createdAt: new Date().toISOString()
  },
  {
    codigo: 'MEM-DDR4-8GB',
    nome: 'Memória RAM Notebook DDR4 8GB 3200MHz Crucial',
    categoria: 'Memória',
    precoCusto: 95.00,
    precoVenda: 180.00,
    estoqueAtual: 22,
    estoqueMinimo: 5,
    unidade: 'UN',
    createdAt: new Date().toISOString()
  },
  {
    codigo: 'TEL-156-FHD',
    nome: 'Tela LED 15.6" Slim 30 Pinos Full HD',
    categoria: 'Telas',
    precoCusto: 280.00,
    precoVenda: 450.00,
    estoqueAtual: 6,
    estoqueMinimo: 2,
    unidade: 'UN',
    createdAt: new Date().toISOString()
  },
  {
    codigo: 'PAS-MX4-4G',
    nome: 'Pasta Térmica Arctic MX-4 4g Alta Condutividade',
    categoria: 'Insumos',
    precoCusto: 35.00,
    precoVenda: 69.90,
    estoqueAtual: 18,
    estoqueMinimo: 3,
    unidade: 'UN',
    createdAt: new Date().toISOString()
  },
  {
    codigo: 'FON-NOTE-65W',
    nome: 'Carregador / Fonte Universal para Notebook 65W Tipo-C',
    categoria: 'Acessórios',
    precoCusto: 60.00,
    precoVenda: 139.00,
    estoqueAtual: 9,
    estoqueMinimo: 3,
    unidade: 'UN',
    createdAt: new Date().toISOString()
  }
];

const INITIAL_OS: Omit<OrdemServico, 'id'>[] = [
  {
    numero: 1001,
    clienteNome: 'Carlos Eduardo Mendes',
    clienteTelefone: '(11) 98765-4321',
    clienteCpfCnpj: '123.456.789-00',
    tecnicoNome: 'Lucas Ferreira',
    equipamento: 'Notebook Dell Inspiron 15',
    marca: 'Dell',
    modelo: 'Inspiron 5510 Core i7',
    numeroSerie: 'BR-DELL-883921',
    acessorios: 'Acompanha carregador original',
    defeitoRelatado: 'Notebook esquenta muito e desliga sozinho após 10 minutos de uso em jogos ou trabalho pesado.',
    diagnosticoTecnico: 'Pasta térmica completamente ressecada e obstrução de poeira nas aletas do dissipador.',
    solucao: 'Limpeza ultrassônica interna e aplicação de pasta térmica Arctic MX-4.',
    status: 'em_andamento',
    prioridade: 'alta',
    dataAbertura: new Date(Date.now() - 86400000 * 2).toISOString().slice(0, 10),
    previsaoEntrega: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    itensServicos: [
      { id: 'srv-1', nome: 'Limpeza Preventiva e Troca de Pasta Térmica', preco: 120.0, quantidade: 1, tipo: 'servico' }
    ],
    itensPecas: [
      { id: 'peca-1', nome: 'Pasta Térmica Arctic MX-4', preco: 69.90, quantidade: 1, tipo: 'peca' }
    ],
    valorServicos: 120.0,
    valorPecas: 69.90,
    valorDesconto: 0,
    valorTotal: 189.90,
    formaPagamento: 'PIX',
    garantiaDias: 90,
    observacoes: 'Avisar o cliente quando estiver pronto para retirada.',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    numero: 1002,
    clienteNome: 'Mariana Silva Santos',
    clienteTelefone: '(11) 99123-8877',
    clienteCpfCnpj: '28.192.839/0001-92',
    tecnicoNome: 'Gabriel Souza',
    equipamento: 'Smartphone iPhone 13 128GB',
    marca: 'Apple',
    modelo: 'iPhone 13 A2633',
    numeroSerie: 'F2LZX8190N',
    acessorios: 'Sem acessórios',
    defeitoRelatado: 'Queda com quebra da tela frontal. Touch com falha na parte superior.',
    diagnosticoTecnico: 'Necessária troca do módulo display OLED e reprogramação do sensor True Tone.',
    solucao: 'Substituição da tela OLED original com vedação nova IP68.',
    status: 'orcamento_pendente',
    prioridade: 'urgente',
    dataAbertura: new Date(Date.now() - 86400000 * 1).toISOString().slice(0, 10),
    previsaoEntrega: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
    itensServicos: [
      { id: 'srv-2', nome: 'Troca de Módulo Display com Reprogramação TrueTone', preco: 180.0, quantidade: 1, tipo: 'servico' }
    ],
    itensPecas: [
      { id: 'peca-2', nome: 'Módulo Display iPhone 13 OLED Premium', preco: 650.0, quantidade: 1, tipo: 'peca' }
    ],
    valorServicos: 180.0,
    valorPecas: 650.0,
    valorDesconto: 30.0,
    valorTotal: 800.0,
    formaPagamento: 'Cartão de Crédito 3x',
    garantiaDias: 90,
    observacoes: 'Aguardando aprovação via WhatsApp.',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    numero: 1003,
    clienteNome: 'Roberto Antunes',
    clienteTelefone: '(11) 97654-1122',
    clienteCpfCnpj: '321.654.987-11',
    tecnicoNome: 'Ana Beatriz Lima',
    equipamento: 'MacBook Air M1 2020',
    marca: 'Apple',
    modelo: 'MacBook Air A2337',
    numeroSerie: 'C02FR884Q6L4',
    acessorios: 'Carregador USB-C e cabo MagSafe/USB-C',
    defeitoRelatado: 'Lentidão extrema após atualização do macOS e armazenamento acusando quase 100% cheio.',
    diagnosticoTecnico: 'Muitos arquivos temporários corrompidos e snapshots Time Machine ocupando 120GB.',
    solucao: 'Limpeza profunda de dados, desinstalação de bloatware e atualização otimizada.',
    status: 'concluido',
    prioridade: 'normal',
    dataAbertura: new Date(Date.now() - 86400000 * 4).toISOString().slice(0, 10),
    previsaoEntrega: new Date(Date.now() - 86400000 * 1).toISOString().slice(0, 10),
    dataConclusao: new Date(Date.now() - 86400000 * 1).toISOString().slice(0, 10),
    itensServicos: [
      { id: 'srv-3', nome: 'Otimização Avançada de Sistema macOS e Limpeza', preco: 160.0, quantidade: 1, tipo: 'servico' }
    ],
    itensPecas: [],
    valorServicos: 160.0,
    valorPecas: 0,
    valorDesconto: 10.0,
    valorTotal: 150.0,
    formaPagamento: 'PIX',
    garantiaDias: 90,
    observacoes: 'Testado 100% e aprovado.',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const INITIAL_FINANCEIRO: Omit<LancamentoFinanceiro, 'id'>[] = [
  {
    tipo: 'receita',
    categoria: 'Ordem de Serviço',
    descricao: 'OS #1003 - Roberto Antunes (MacBook Air)',
    valor: 150.00,
    dataVencimento: new Date().toISOString().slice(0, 10),
    dataPagamento: new Date().toISOString().slice(0, 10),
    status: 'pago',
    referenciaTipo: 'os',
    referenciaNumero: 1003,
    createdAt: new Date().toISOString()
  },
  {
    tipo: 'despesa',
    categoria: 'Peças e Insumos',
    descricao: 'Reposição Pasta Térmica e Isopropílico',
    valor: 210.00,
    dataVencimento: new Date(Date.now() + 86400000 * 5).toISOString().slice(0, 10),
    status: 'pendente',
    referenciaTipo: 'avulso',
    createdAt: new Date().toISOString()
  },
  {
    tipo: 'despesa',
    categoria: 'Infraestrutura',
    descricao: 'Internet Fibra Óptica 600MB',
    valor: 119.90,
    dataVencimento: new Date(Date.now() + 86400000 * 10).toISOString().slice(0, 10),
    status: 'pendente',
    referenciaTipo: 'avulso',
    createdAt: new Date().toISOString()
  }
];

export const DEFAULT_EMPRESA_CONFIG: ConfiguracaoEmpresa = {
  nomeFantasia: 'OS Master Tech Assistance',
  razaoSocial: 'OS Master Soluções em Informática e Eletrônica LTDA',
  cnpj: '38.452.910/0001-85',
  telefone: '(11) 4002-8922 / WhatsApp (11) 98765-4321',
  email: 'contato@osmaster.com.br',
  endereco: 'Av. Paulista, 1500 - Conjunto 82 - Bela Vista',
  cidade: 'São Paulo',
  estado: 'SP',
  cep: '01310-200',
  diasGarantiaPadrao: 90,
  mensagemTermosOS: '1. A garantia cobre exclusivamente as peças trocadas e serviços executados pelo período de 90 dias a contar da data de retirada.\n2. Equipamentos não retirados em até 90 dias após notificação de conclusão poderão ser destinados para arcar com os custos de estocagem conforme Art. 1.275 do Código Civil.\n3. A loja não se responsabiliza por dados, fotos e softwares instalados sem backup prévio pelo proprietário.'
};

// Generic Firebase Helper with LocalStorage resilient cache
class StorageRepository<T extends { id: string }> {
  private collectionName: string;
  private localKey: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
    this.localKey = `os_master_${collectionName}`;
  }

  getLocal(): T[] {
    try {
      const data = localStorage.getItem(this.localKey);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  setLocal(items: T[]) {
    try {
      localStorage.setItem(this.localKey, JSON.stringify(items));
    } catch (err) {
      console.warn('LocalStorage save error:', err);
    }
  }

  async getAll(): Promise<T[]> {
    await ensureAuth();
    try {
      const colRef = collection(db, this.collectionName);
      const snapshot = await getDocs(colRef);
      if (!snapshot.empty) {
        const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as T));
        this.setLocal(list);
        return list;
      }
    } catch (err) {
      console.warn(`Firestore read fallback for ${this.collectionName}:`, err);
    }
    return this.getLocal();
  }

  async save(item: T): Promise<void> {
    const list = this.getLocal();
    const idx = list.findIndex(i => i.id === item.id);
    if (idx >= 0) {
      list[idx] = item;
    } else {
      list.unshift(item);
    }
    this.setLocal(list);

    await ensureAuth();
    try {
      const docRef = doc(db, this.collectionName, item.id);
      await setDoc(docRef, item, { merge: true });
    } catch (err) {
      console.warn(`Firestore write fallback for ${this.collectionName}:`, err);
    }
  }

  async remove(id: string): Promise<void> {
    const list = this.getLocal().filter(i => i.id !== id);
    this.setLocal(list);

    await ensureAuth();
    try {
      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
    } catch (err) {
      console.warn(`Firestore delete fallback for ${this.collectionName}:`, err);
    }
  }
}

export const clientesRepo = new StorageRepository<Cliente>('clientes');
export const tecnicosRepo = new StorageRepository<Tecnico>('tecnicos');
export const servicosRepo = new StorageRepository<ServicoItem>('servicos');
export const produtosRepo = new StorageRepository<ProdutoItem>('produtos');
export const osRepo = new StorageRepository<OrdemServico>('ordens_servico');
export const vendasRepo = new StorageRepository<Venda>('vendas');
export const financeiroRepo = new StorageRepository<LancamentoFinanceiro>('lancamentos_financeiros');

// Empresa Config Repository
export async function getEmpresaConfig(): Promise<ConfiguracaoEmpresa> {
  try {
    const local = localStorage.getItem('os_master_config_empresa');
    if (local) {
      return JSON.parse(local);
    }
  } catch (e) {}

  await ensureAuth();
  try {
    const docRef = doc(db, 'configuracao_empresa', 'principal');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const val = snap.data() as ConfiguracaoEmpresa;
      localStorage.setItem('os_master_config_empresa', JSON.stringify(val));
      return val;
    }
  } catch (err) {
    console.warn('Could not fetch empresa config from firestore:', err);
  }

  localStorage.setItem('os_master_config_empresa', JSON.stringify(DEFAULT_EMPRESA_CONFIG));
  return DEFAULT_EMPRESA_CONFIG;
}

export async function saveEmpresaConfig(config: ConfiguracaoEmpresa): Promise<void> {
  localStorage.setItem('os_master_config_empresa', JSON.stringify(config));
  await ensureAuth();
  try {
    const docRef = doc(db, 'configuracao_empresa', 'principal');
    await setDoc(docRef, config, { merge: true });
  } catch (err) {
    console.warn('Firestore write config error:', err);
  }
}

// Initial Seeding check
export async function initializeDatabaseIfEmpty() {
  const existingOS = await osRepo.getAll();
  if (existingOS.length === 0) {
    // Seed initial demo data
    for (const c of INITIAL_CLIENTES) {
      const id = 'cli-' + Math.random().toString(36).substring(2, 9);
      await clientesRepo.save({ id, ...c });
    }
    for (const t of INITIAL_TECNICOS) {
      const id = 'tec-' + Math.random().toString(36).substring(2, 9);
      await tecnicosRepo.save({ id, ...t });
    }
    for (const s of INITIAL_SERVICOS) {
      const id = 'srv-' + Math.random().toString(36).substring(2, 9);
      await servicosRepo.save({ id, ...s });
    }
    for (const p of INITIAL_PRODUTOS) {
      const id = 'prod-' + Math.random().toString(36).substring(2, 9);
      await produtosRepo.save({ id, ...p });
    }
    for (const osItem of INITIAL_OS) {
      const id = 'os-' + osItem.numero;
      await osRepo.save({ id, ...osItem });
    }
    for (const fin of INITIAL_FINANCEIRO) {
      const id = 'fin-' + Math.random().toString(36).substring(2, 9);
      await financeiroRepo.save({ id, ...fin });
    }
    await saveEmpresaConfig(DEFAULT_EMPRESA_CONFIG);
  }
}

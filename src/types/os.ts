export type OSStatus = 
  | 'aberta' 
  | 'em_analise' 
  | 'orcamento_pendente' 
  | 'aprovada' 
  | 'em_andamento' 
  | 'aguardando_pecas' 
  | 'concluido' 
  | 'entregue' 
  | 'cancelada';

export type OSPrioridade = 'baixa' | 'normal' | 'alta' | 'urgente';

export interface Cliente {
  id: string;
  nome: string;
  email?: string;
  telefone: string;
  cpfCnpj?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  observacoes?: string;
  createdAt: string;
}

export interface Tecnico {
  id: string;
  nome: string;
  email?: string;
  telefone?: string;
  especialidade?: string;
  comissaoPercent?: number;
  status: 'ativo' | 'inativo';
  createdAt: string;
}

export interface ServicoItem {
  id: string;
  nome: string;
  descricao?: string;
  preco: number;
  tempoEstimadoMinutos?: number;
  createdAt?: string;
}

export interface ProdutoItem {
  id: string;
  codigo?: string;
  nome: string;
  categoria?: string;
  precoCusto?: number;
  precoVenda: number;
  estoqueAtual: number;
  estoqueMinimo?: number;
  unidade?: string;
  createdAt?: string;
}

export interface ItemOS {
  id: string;
  itemId?: string;
  nome: string;
  preco: number;
  quantidade: number;
  tipo: 'servico' | 'peca';
}

export interface HistoricoOS {
  data: string;
  status: OSStatus;
  nota: string;
  autor?: string;
}

export interface OrdemServico {
  id: string;
  numero: number;
  clienteId?: string;
  clienteNome: string;
  clienteTelefone: string;
  clienteCpfCnpj?: string;
  clienteEndereco?: string;
  tecnicoId?: string;
  tecnicoNome?: string;
  equipamento: string;
  marca: string;
  modelo: string;
  numeroSerie?: string;
  acessorios?: string;
  defeitoRelatado: string;
  diagnosticoTecnico?: string;
  solucao?: string;
  status: OSStatus;
  prioridade: OSPrioridade;
  dataAbertura: string;
  previsaoEntrega?: string;
  dataConclusao?: string;
  itensServicos: ItemOS[];
  itensPecas: ItemOS[];
  valorServicos: number;
  valorPecas: number;
  valorDesconto: number;
  valorTotal: number;
  formaPagamento?: string;
  observacoes?: string;
  garantiaDias?: number;
  historico?: HistoricoOS[];
  createdAt: string;
  updatedAt: string;
}

export interface ConfiguracaoEmpresa {
  nomeFantasia: string;
  razaoSocial: string;
  cnpj: string;
  telefone: string;
  email: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  mensagemTermosOS: string;
  diasGarantiaPadrao: number;
}

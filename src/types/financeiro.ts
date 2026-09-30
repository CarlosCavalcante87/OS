export type TipoLancamento = 'receita' | 'despesa';
export type StatusLancamento = 'pendente' | 'pago' | 'atrasado';
export type ReferenciaTipo = 'os' | 'venda' | 'avulso';

export interface LancamentoFinanceiro {
  id: string;
  tipo: TipoLancamento;
  categoria: string;
  descricao: string;
  valor: number;
  dataVencimento: string;
  dataPagamento?: string;
  status: StatusLancamento;
  referenciaTipo?: ReferenciaTipo;
  referenciaId?: string;
  referenciaNumero?: number;
  observacoes?: string;
  createdAt: string;
}

export interface ItemVenda {
  id: string;
  produtoId: string;
  nome: string;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
}

export type FormaPagamento = 
  | 'dinheiro' 
  | 'pix' 
  | 'cartao_credito' 
  | 'cartao_debito' 
  | 'boleto' 
  | 'a_prazo';

export interface Venda {
  id: string;
  numero: number;
  clienteId?: string;
  clienteNome: string;
  clienteTelefone?: string;
  dataVenda: string;
  itens: ItemVenda[];
  valorSubtotal: number;
  valorDesconto: number;
  valorTotal: number;
  formaPagamento: FormaPagamento;
  status: 'finalizada' | 'cancelada';
  observacoes?: string;
  createdAt: string;
}

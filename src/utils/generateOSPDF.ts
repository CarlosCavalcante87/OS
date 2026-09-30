import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { OrdemServico, ConfiguracaoEmpresa } from '../types/os';
import { Venda } from '../types/venda';

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value || 0);
}

export function generateOSPDF(os: OrdemServico, empresa: ConfiguracaoEmpresa) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Header Background bar
  doc.setFillColor(30, 41, 59); // Slate-800
  doc.rect(0, 0, 210, 24, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(empresa.nomeFantasia || 'OS MASTER TECH', 14, 12);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`CNPJ: ${empresa.cnpj || 'Não informado'} | Tel: ${empresa.telefone || ''}`, 14, 18);

  // OS Badge right side
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`ORDEM DE SERVIÇO Nº ${os.numero}`, 140, 14);

  // Reset text color
  doc.setTextColor(30, 41, 59);

  let currentY = 32;

  // Metadata Row (Dates, Status)
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Data Abertura:', 14, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date(os.dataAbertura).toLocaleDateString('pt-BR'), 40, currentY);

  doc.setFont('helvetica', 'bold');
  doc.text('Previsão Entrega:', 80, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(os.previsaoEntrega ? new Date(os.previsaoEntrega).toLocaleDateString('pt-BR') : 'A definir', 112, currentY);

  doc.setFont('helvetica', 'bold');
  doc.text('Status:', 150, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(os.status.toUpperCase().replace('_', ' '), 165, currentY);

  currentY += 8;

  // Box: Dados do Cliente
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, currentY, 182, 22, 2, 2, 'F');
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('DADOS DO CLIENTE', 18, currentY + 6);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nome: ${os.clienteNome}`, 18, currentY + 12);
  doc.text(`Telefone: ${os.clienteTelefone}`, 18, currentY + 18);
  doc.text(`CPF/CNPJ: ${os.clienteCpfCnpj || 'Não informado'}`, 110, currentY + 12);
  doc.text(`Técnico Resp.: ${os.tecnicoNome || 'Não atribuído'}`, 110, currentY + 18);

  currentY += 28;

  // Box: Dados do Equipamento
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, currentY, 182, 36, 2, 2, 'F');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('EQUIPAMENTO & DEFEITO RELATADO', 18, currentY + 6);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`Aparelho: ${os.equipamento} - Marca/Modelo: ${os.marca} ${os.modelo}`, 18, currentY + 12);
  doc.text(`Nº Série: ${os.numeroSerie || 'N/A'} | Acessórios: ${os.acessorios || 'Apenas o aparelho'}`, 18, currentY + 17);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Problema:', 18, currentY + 23);
  doc.setFont('helvetica', 'normal');
  const splitDefeito = doc.splitTextToSize(os.defeitoRelatado, 140);
  doc.text(splitDefeito, 35, currentY + 23);

  if (os.diagnosticoTecnico) {
    doc.setFont('helvetica', 'bold');
    doc.text('Diagnóstico:', 18, currentY + 30);
    doc.setFont('helvetica', 'normal');
    const splitDiag = doc.splitTextToSize(os.diagnosticoTecnico, 140);
    doc.text(splitDiag, 38, currentY + 30);
  }

  currentY += 42;

  // Tabela de Serviços e Peças
  const tableData: any[] = [];
  if (os.itensServicos && os.itensServicos.length > 0) {
    os.itensServicos.forEach(s => {
      tableData.push(['Serviço', s.nome, s.quantidade, formatCurrency(s.preco), formatCurrency(s.preco * s.quantidade)]);
    });
  }
  if (os.itensPecas && os.itensPecas.length > 0) {
    os.itensPecas.forEach(p => {
      tableData.push(['Peça', p.nome, p.quantidade, formatCurrency(p.preco), formatCurrency(p.preco * p.quantidade)]);
    });
  }

  if (tableData.length === 0) {
    tableData.push(['-', 'Aguardando detalhamento de peças/mão de obra', '1', formatCurrency(os.valorTotal), formatCurrency(os.valorTotal)]);
  }

  autoTable(doc, {
    startY: currentY,
    head: [['Tipo', 'Descrição do Item / Serviço', 'Qtd', 'Unitário', 'Subtotal']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [79, 70, 229], // Indigo 600
      textColor: [255, 255, 255],
      fontSize: 8.5
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.5
    },
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 95 },
      2: { cellWidth: 15, halign: 'center' },
      3: { cellWidth: 25, halign: 'right' },
      4: { cellWidth: 25, halign: 'right' }
    }
  });

  const finalY = (doc as any).lastAutoTable.finalY + 6;

  // Totais
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(120, finalY, 76, 24, 2, 2, 'F');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`Serviços: ${formatCurrency(os.valorServicos)}`, 124, finalY + 5);
  doc.text(`Peças: ${formatCurrency(os.valorPecas)}`, 124, finalY + 10);
  if (os.valorDesconto > 0) {
    doc.text(`Desconto: -${formatCurrency(os.valorDesconto)}`, 124, finalY + 15);
  }
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(79, 70, 229);
  doc.text(`TOTAL: ${formatCurrency(os.valorTotal)}`, 124, finalY + 20);

  doc.setTextColor(30, 41, 59);

  // Termos e Condições
  const termsY = finalY + 30;
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('TERMOS DE GARANTIA E CONDIÇÕES:', 14, termsY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  const terms = doc.splitTextToSize(empresa.mensagemTermosOS || 'Garantia de 90 dias conforme artigo 26 do Código de Defesa do Consumidor.', 182);
  doc.text(terms, 14, termsY + 4);

  // Assinaturas
  const signY = termsY + 24;
  doc.setDrawColor(148, 163, 184);
  doc.line(20, signY, 90, signY);
  doc.line(120, signY, 190, signY);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Assinatura do Cliente', 40, signY + 4);
  doc.text('Técnico / Responsável', 140, signY + 4);

  doc.save(`OS_${os.numero}_${os.clienteNome.replace(/\s+/g, '_')}.pdf`);
}

export function generateVendaPDF(venda: Venda, empresa: ConfiguracaoEmpresa) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Header Background bar
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(empresa.nomeFantasia || 'OS MASTER TECH', 14, 12);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`COMPROVANTE DE VENDA Nº ${venda.numero}`, 130, 14);

  doc.setTextColor(30, 41, 59);
  let currentY = 34;

  doc.setFontSize(9);
  doc.text(`Cliente: ${venda.clienteNome}`, 14, currentY);
  doc.text(`Data: ${new Date(venda.dataVenda).toLocaleDateString('pt-BR')}`, 140, currentY);
  currentY += 6;
  doc.text(`Pagamento: ${venda.formaPagamento.toUpperCase()}`, 14, currentY);

  currentY += 8;

  const tableData = venda.itens.map(item => [
    item.nome,
    item.quantidade,
    formatCurrency(item.precoUnitario),
    formatCurrency(item.subtotal)
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [['Produto', 'Qtd', 'Valor Unitário', 'Subtotal']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [16, 185, 129], // Emerald 500
      textColor: [255, 255, 255]
    }
  });

  const finalY = (doc as any).lastAutoTable.finalY + 8;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total da Venda: ${formatCurrency(venda.valorTotal)}`, 130, finalY);

  doc.save(`Venda_${venda.numero}.pdf`);
}

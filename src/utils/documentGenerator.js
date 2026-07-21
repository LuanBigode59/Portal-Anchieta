import { jsPDF } from 'jspdf';

export const generatePDF = async (docObj) => {
  try {
    if (docObj.tipo === 'certificado') {
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      
      // Load the background image
      const imgData = await new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/jpeg'));
        };
        img.onerror = () => reject(new Error('Falha ao carregar o template do certificado'));
        img.src = '/cert-template.jpg';
      });

      pdf.addImage(imgData, 'JPEG', 0, 0, 297, 210);

      const { target_militar_nome, target_militar_id, curso_nome, data, codigo } = docObj.dados;
      const nomeMilitar = target_militar_nome || target_militar_id || 'NOME DO ALUNO';
      const cursoStr = curso_nome || 'CURSO DE ESPECIALIZAÇÃO';
      
      pdf.setFont("helvetica", "bold");
      
      // Nome do militar (top)
      pdf.setTextColor(17, 17, 17);
      pdf.setFontSize(26);
      pdf.text(nomeMilitar.toUpperCase(), 148.5, 96, { align: 'center' });
      
      // Nome do curso (middle)
      pdf.setFontSize(20);
      pdf.text(cursoStr.toUpperCase(), 148.5, 120, { align: 'center' });
      
      // Assinatura do instrutor (left)
      const nomeInstrutor = docObj.dados.instrutor || docObj.assinatura_nome || "NOME DO INSTRUTOR";
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "italic");
      pdf.text(nomeInstrutor, 91.4, 171.5, { align: 'center' });
      
      // Assinatura do Aluno (right)
      pdf.text(nomeMilitar, 207, 171.5, { align: 'center' });

      // Emissão e Validação
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(85, 85, 85);
      const dataStr = data || new Date().toLocaleDateString('pt-BR');
      const codStr = codigo || 'CHQ-000000';
      pdf.text(`Emissão: ${dataStr}\nValidação: ${codStr}`, 287, 200, { align: 'right' });

      pdf.save(`Certificado_${docObj.id.split('-')[0]}.pdf`);
      return;
    }

    // Default Portrait Document Generator
    const pdf = new jsPDF();
    
    // Fundo escuro militar
    pdf.setFillColor(18, 25, 18);
    pdf.rect(0, 0, 210, 297, 'F');
    
    // Borda Gold
    pdf.setDrawColor(201, 168, 76);
    pdf.setLineWidth(1);
    pdf.rect(5, 5, 200, 287);

    // Cabeçalho Oficial
    pdf.setFont("courier", "bold");
    pdf.setTextColor(201, 168, 76);
    pdf.setFontSize(14);
    pdf.text("POLÍCIA MILITAR DO ESTADO DE SÃO PAULO", 105, 25, { align: "center" });
    pdf.setFontSize(11);
    pdf.text("2º BATALHÃO DE POLÍCIA DE CHOQUE - ANCHIETA", 105, 32, { align: "center" });
    
    pdf.setDrawColor(40, 40, 40);
    pdf.line(15, 40, 195, 40);

    // Info Documento
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(15);
    pdf.text(`${docObj.tipo.toUpperCase()}: ${docObj.titulo.toUpperCase()}`, 20, 55);
    
    pdf.setFontSize(9);
    pdf.setFont("courier", "normal");
    pdf.setTextColor(150, 150, 150);
    pdf.text(`CRIADO EM: ${new Date(docObj.data_criacao).toLocaleString('pt-BR')}`, 20, 65);
    pdf.text(`STATUS: ${docObj.status.toUpperCase()}`, 120, 65);

    // Conteúdo Dinâmico com base no Tipo
    pdf.setTextColor(220, 220, 220);
    pdf.setFontSize(10);
    let contentY = 80;

    if (docObj.tipo === 'promocao') {
      const { target_militar_nome, target_militar_id, patente_atual, nova_patente, motivo } = docObj.dados;
      pdf.text(`Militar Alvo: ${target_militar_nome || target_militar_id} (ID: ${target_militar_id})`, 20, contentY);
      pdf.text(`Patente Anterior: ${patente_atual}`, 20, contentY + 7);
      pdf.text(`Nova Patente Designada: ${nova_patente}`, 20, contentY + 14);
      pdf.text(`Motivo da Promoção:`, 20, contentY + 24);
      const splitMotiv = pdf.splitTextToSize(motivo || 'Desempenho operacional destacado.', 170);
      pdf.text(splitMotiv, 20, contentY + 31);
    } else if (docObj.tipo === 'advertencia') {
      const { target_militar_nome, target_militar_id, tipo_advertencia, motivo } = docObj.dados;
      pdf.text(`Militar Punição: ${target_militar_nome || target_militar_id} (ID: ${target_militar_id})`, 20, contentY);
      pdf.text(`Tipo de Advertência: ${tipo_advertencia}`, 20, contentY + 7);
      pdf.text(`Motivação / Fatos:`, 20, contentY + 17);
      const splitMotiv = pdf.splitTextToSize(motivo || 'Infração disciplinar.', 170);
      pdf.text(splitMotiv, 20, contentY + 24);
    } else if (docObj.tipo === 'operacao') {
      const { nome, objetivo, equipe, viaturas } = docObj.dados;
      pdf.text(`Nome da Operação: ${nome}`, 20, contentY);
      pdf.text(`Objetivo/Missão:`, 20, contentY + 10);
      const splitObj = pdf.splitTextToSize(objetivo || 'Policiamento.', 170);
      pdf.text(splitObj, 20, contentY + 17);
      pdf.text(`Equipe: ${equipe?.join(', ') || 'N/A'}`, 20, contentY + 35);
      pdf.text(`Viaturas: ${viaturas?.join(', ') || 'N/A'}`, 20, contentY + 42);
    } else {
      // Boletins / Relatórios
      const splitCont = pdf.splitTextToSize(docObj.dados.conteudo || docObj.conteudo || '', 170);
      pdf.text(splitCont, 20, contentY);
    }

    // Assinatura Militar do Rodapé (se estiver assinado)
    if (docObj.status === 'assinado') {
      pdf.setDrawColor(40, 40, 40);
      pdf.line(15, 200, 195, 200);

      // Caixa de Assinatura Elegante do Coronel Luan Bigode
      pdf.setFont("courier", "bold");
      pdf.setTextColor(201, 168, 76);
      pdf.text("ASSINADO DIGITALMENTE POR:", 20, 210);
      
      pdf.setTextColor(255, 255, 255);
      pdf.text(docObj.assinatura_nome || "Comandante", 20, 220);
      pdf.setFont("courier", "normal");
      pdf.setTextColor(150, 150, 150);
      pdf.text(docObj.assinatura_patente || "Comando Geral", 20, 226);
      pdf.text("2º BP CHOQUE Anchieta", 20, 232);
      
      pdf.setFontSize(8);
      pdf.text(`Data/Hora: ${new Date(docObj.assinatura_data).toLocaleString('pt-BR')}`, 20, 242);
      pdf.text(`Cód. Autenticidade: ${docObj.codigo_autenticidade || 'N/A'}`, 20, 247);
      pdf.text(`Hash: ${docObj.hash_seguranca?.substring(0, 32)}...`, 20, 252);

      // QR Code de Validação (Imagem dinâmica de validação)
      if (docObj.codigo_autenticidade) {
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(docObj.codigo_autenticidade)}`;
        try {
          const qrImgData = await new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            img.onload = () => {
              const canvas = document.createElement('canvas');
              canvas.width = img.width;
              canvas.height = img.height;
              const ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, 0);
              resolve(canvas.toDataURL('image/png'));
            };
            img.onerror = () => reject(new Error('QR falhou'));
            img.src = qrUrl;
          });
          pdf.addImage(qrImgData, 'PNG', 145, 205, 45, 45);
        } catch (e) {
          console.warn('QR falhou no retrato', e);
        }
      }
    }

    // Rodapé
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.text("DOCUMENTO INSTITUCIONAL OFICIAL - ACESSO RESTRITO CHOQUE ANCHIETA", 105, 280, { align: "center" });

    pdf.save(`Documento_Oficial_${docObj.tipo}_${docObj.id.split('-')[0]}.pdf`);
  } catch (err) {
    console.error(err);
    throw new Error("Erro ao gerar PDF do documento.");
  }
};

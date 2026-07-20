import { useState, useEffect } from 'react';
import Topbar from '../../components/layout/Topbar';
import { 
  MdLock, MdLockOpen, MdClose, MdCheck, MdPictureAsPdf, MdStar, 
  MdGavel, MdCampaign, MdDescription, MdMilitaryTech, MdSchool 
} from 'react-icons/md';
import { useNotifications } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';
import { signatureService } from '../../services/signatureService';
import { jsPDF } from 'jspdf';

export default function ManageSignatures() {
  const { user, userRankLevel } = useAuth();
  const { sendNotification } = useNotifications();
  const [pendings, setPendings] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pendentes');

  const loadDocs = async () => {
    setLoading(true);
    try {
      const p = await signatureService.getPendingDocuments();
      const h = await signatureService.getSignedDocuments();
      setPendings(p);
      setHistory(h);
    } catch (err) {
      console.error(err);
      sendNotification("Erro ao buscar documentos assináveis", "erro");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocs();
  }, []);

  const generatePDF = (docObj) => {
    try {
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
        pdf.text(`Militar Alvo: ${target_militar_nome} (ID: ${target_militar_id})`, 20, contentY);
        pdf.text(`Patente Anterior: ${patente_atual}`, 20, contentY + 7);
        pdf.text(`Nova Patente Designada: ${nova_patente}`, 20, contentY + 14);
        pdf.text(`Motivo da Promoção:`, 20, contentY + 24);
        const splitMotiv = pdf.splitTextToSize(motivo || 'Desempenho operacional destacado.', 170);
        pdf.text(splitMotiv, 20, contentY + 31);
      } else if (docObj.tipo === 'advertencia') {
        const { target_militar_nome, target_militar_id, tipo_advertencia, motivo } = docObj.dados;
        pdf.text(`Militar Punição: ${target_militar_nome} (ID: ${target_militar_id})`, 20, contentY);
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
      } else if (docObj.tipo === 'certificado') {
        const { target_militar_nome, target_militar_id, curso_nome } = docObj.dados;
        pdf.text(`O Comando Geral certifica que o militar:`, 20, contentY);
        pdf.setFont("courier", "bold");
        pdf.text(`${target_militar_nome} (ID: ${target_militar_id})`, 20, contentY + 10);
        pdf.setFont("courier", "normal");
        pdf.text(`concluiu com êxito e aproveitamento máximo o curso de especialização:`, 20, contentY + 20);
        pdf.setFont("courier", "bold");
        pdf.setTextColor(201, 168, 76);
        pdf.text(`${curso_nome.toUpperCase()}`, 20, contentY + 30);
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
        pdf.text("Tenente Coronel Luan Bigode", 20, 220);
        pdf.setFont("courier", "normal");
        pdf.setTextColor(150, 150, 150);
        pdf.text("Comando Geral", 20, 226);
        pdf.text("2º BP CHOQUE Anchieta", 20, 232);
        
        pdf.setFontSize(8);
        pdf.text(`Data/Hora: ${new Date(docObj.assinatura_data).toLocaleString('pt-BR')}`, 20, 242);
        pdf.text(`Cód. Autenticidade: ${docObj.codigo_autenticidade}`, 20, 247);
        pdf.text(`Hash: ${docObj.hash_seguranca?.substring(0, 32)}...`, 20, 252);

        // QR Code de Validação (Imagem dinâmica de validação)
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(docObj.codigo_autenticidade)}`;
        pdf.addImage(qrUrl, 'PNG', 145, 205, 45, 45);
      }

      // Rodapé
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text("DOCUMENTO INSTITUCIONAL OFICIAL - ACESSO RESTRITO CHOQUE ANCHIETA", 105, 280, { align: "center" });

      pdf.save(`Documento_Oficial_${docObj.tipo}_${docObj.id.split('-')[0]}.pdf`);
    } catch (err) {
      console.error(err);
      sendNotification("Erro ao gerar PDF do documento.", "erro");
    }
  };

  const handleSign = async (docId) => {
    // Definimos a assinatura padrão do Tenente Coronel Luan Bigode
    const signerData = {
      nome: 'Tenente Coronel Luan Bigode',
      patente: 'Comando Geral'
    };

    try {
      const signed = await signatureService.signDocument(docId, signerData);
      sendNotification("Documento homologado e assinado com sucesso!", "sucesso");
      generatePDF(signed); // Faz o download automático
      loadDocs();
    } catch (err) {
      sendNotification(err.message, "erro");
    }
  };

  const handleReject = async (docId) => {
    if (window.confirm("Deseja rejeitar este documento oficialmente?")) {
      try {
        await signatureService.rejectDocument(docId);
        sendNotification("Documento rejeitado e arquivado.", "sucesso");
        loadDocs();
      } catch (err) {
        sendNotification(err.message, "erro");
      }
    }
  };

  const iconMap = {
    boletim: <MdCampaign className="text-xl text-gold" />,
    promocao: <MdStar className="text-xl text-green-400" />,
    advertencia: <MdGavel className="text-xl text-red-400" />,
    relatorio: <MdDescription className="text-xl text-blue-400" />,
    operacao: <MdMilitaryTech className="text-xl text-gold" />,
    certificado: <MdSchool className="text-xl text-green-400" />
  };

  return (
    <div className="animate-fadeIn pb-10">
      <Topbar title="ASSINATURAS INSTITUCIONAIS" subtitle="Central de Homologação e Assinaturas Digitais do Comando" />

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button 
          onClick={() => setActiveTab('pendentes')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === 'pendentes' ? 'bg-army-green/20 text-army-green-light border border-army-green/40' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          <MdLock className="text-sm" /> Pendentes ({pendings.length})
        </button>
        <button 
          onClick={() => setActiveTab('historico')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === 'historico' ? 'bg-army-green/20 text-army-green-light border border-army-green/40' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          <MdLockOpen className="text-sm" /> Histórico Assinados ({history.length})
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="spinner" /></div>
      ) : (
        <div className="space-y-4">
          {activeTab === 'pendentes' && (
            <>
              {pendings.map(doc => (
                <div key={doc.id} className="hero-card p-5 border border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-mil-black border border-gray-800 rounded-xl flex items-center justify-center flex-shrink-0">
                      {iconMap[doc.tipo] || <MdDescription className="text-xl" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="badge-gold !text-[9px] uppercase">{doc.tipo}</span>
                        <span className="text-[10px] text-gray-500 font-mono">{new Date(doc.data_criacao).toLocaleString('pt-BR')}</span>
                      </div>
                      <h3 className="text-sm font-black text-white mt-1">{doc.titulo}</h3>
                      
                      {/* Subdescrições específicas */}
                      {doc.tipo === 'promocao' && (
                        <p className="text-xs text-gray-400 mt-1 font-mono">Promover {doc.dados.target_militar_nome} para {doc.dados.nova_patente}</p>
                      )}
                      {doc.tipo === 'advertencia' && (
                        <p className="text-xs text-red-400 mt-1 font-mono">Punição: {doc.dados.tipo_advertencia} a {doc.dados.target_militar_nome}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 self-end md:self-center">
                    <button 
                      onClick={() => handleSign(doc.id)}
                      className="btn-green flex items-center gap-1 !py-1.5 !px-3 !text-[10px] shadow-glow-green"
                    >
                      <MdCheck /> Assinar
                    </button>
                    <button 
                      onClick={() => handleReject(doc.id)}
                      className="btn-danger flex items-center gap-1 !py-1.5 !px-3 !text-[10px] !bg-danger/20 !border-danger/40 hover:!bg-danger/40"
                    >
                      <MdClose /> Rejeitar
                    </button>
                  </div>
                </div>
              ))}
              {pendings.length === 0 && (
                <div className="text-center py-20 text-gray-500 bg-mil-black/10 rounded-xl border border-dashed border-gray-800">
                  <MdLockOpen className="text-5xl mx-auto mb-3 text-gray-700" />
                  <p className="text-sm">Nenhum documento pendente de assinatura institucional.</p>
                </div>
              )}
            </>
          )}

          {activeTab === 'historico' && (
            <>
              {history.map(doc => (
                <div key={doc.id} className="hero-card p-5 border border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-mil-black border border-gray-800 rounded-xl flex items-center justify-center flex-shrink-0">
                      {iconMap[doc.tipo] || <MdDescription className="text-xl" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="badge-steel !text-[9px] uppercase">{doc.tipo}</span>
                        <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${doc.status === 'assinado' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>{doc.status}</span>
                        <span className="text-[10px] text-gray-500 font-mono">{new Date(doc.data_criacao).toLocaleString('pt-BR')}</span>
                      </div>
                      <h3 className="text-sm font-black text-white mt-1">{doc.titulo}</h3>
                      {doc.status === 'assinado' && (
                        <p className="text-[9px] text-gray-500 font-mono mt-1">Cód: {doc.codigo_autenticidade} | Assinado por: {doc.assinatura_nome}</p>
                      )}
                    </div>
                  </div>

                  <button 
                    onClick={() => generatePDF(doc)}
                    className="btn-steel flex items-center gap-1.5 !text-[10px] !py-1.5 !px-3 self-end md:self-center"
                  >
                    <MdPictureAsPdf /> Baixar PDF
                  </button>
                </div>
              ))}
              {history.length === 0 && (
                <div className="text-center py-20 text-gray-500">
                  <p>Nenhum histórico de assinaturas encontrado.</p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

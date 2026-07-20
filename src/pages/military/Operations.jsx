import { useState, useEffect } from 'react';
import Topbar from '../../components/layout/Topbar';
import { MdMilitaryTech, MdClose, MdPeople, MdFlag, MdCalendarToday, MdAirportShuttle, MdPictureAsPdf } from 'react-icons/md';
import { useNotifications } from '../../contexts/NotificationContext';
import { operationService } from '../../services/operationService';
import { jsPDF } from 'jspdf';

export default function Operations() {
  const [operations, setOperations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOp, setSelectedOp] = useState(null);
  const { sendNotification } = useNotifications();

  const loadOperations = async () => {
    setLoading(true);
    try {
      const data = await operationService.getOperations();
      setOperations(data);
    } catch (err) {
      console.error(err);
      sendNotification("Erro ao buscar operações", "erro");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOperations();
  }, []);

  const generatePDF = (op) => {
    try {
      const doc = new jsPDF();
      
      // Estilo Militar do PDF
      doc.setFillColor(15, 23, 15); // Verde militar escuro
      doc.rect(0, 0, 210, 297, 'F');
      
      doc.setDrawColor(201, 168, 76); // Gold border
      doc.setLineWidth(1);
      doc.rect(5, 5, 200, 287);

      // Cabeçalho Oficial
      doc.setFont("courier", "bold");
      doc.setTextColor(201, 168, 76);
      doc.setFontSize(14);
      doc.text("POLÍCIA MILITAR DO ESTADO DE SÃO PAULO", 105, 25, { align: "center" });
      doc.setFontSize(12);
      doc.text("2º BATALHÃO DE POLÍCIA DE CHOQUE - ANCHIETA", 105, 32, { align: "center" });
      
      doc.setDrawColor(40, 40, 40);
      doc.line(15, 40, 195, 40);

      // Dados da Operação
      doc.setTextColor(230, 230, 230);
      doc.setFontSize(16);
      doc.text(`RELATÓRIO DE OPERAÇÃO: ${op.nome.toUpperCase()}`, 20, 55);
      
      doc.setFontSize(10);
      doc.setFont("courier", "normal");
      doc.text(`DATA: ${new Date(op.data).toLocaleDateString('pt-BR')}`, 20, 65);
      doc.text(`HORÁRIO: ${op.horario}`, 120, 65);
      doc.text(`RESULTADO GERAL: ${op.resultado || 'N/A'}`, 20, 72);
      doc.text(`STATUS: ${op.status === 'ativa' ? 'ATIVA' : 'CONCLUÍDA'}`, 120, 72);

      // Objetivo
      doc.setTextColor(201, 168, 76);
      doc.text("MISSÃO / OBJETIVO:", 20, 85);
      doc.setTextColor(200, 200, 200);
      const splitObj = doc.splitTextToSize(op.objetivo || 'Nenhum objetivo cadastrado.', 170);
      doc.text(splitObj, 20, 92);

      // Equipe envolvida
      const yOffsetEquipe = 115;
      doc.setTextColor(201, 168, 76);
      doc.text("EFETIVO ENGAJADO:", 20, yOffsetEquipe);
      doc.setTextColor(200, 200, 200);
      const equipeStr = op.equipe?.join(', ') || 'Nenhum militar registrado.';
      const splitEquipe = doc.splitTextToSize(equipeStr, 170);
      doc.text(splitEquipe, 20, yOffsetEquipe + 7);

      // Viaturas
      const yOffsetVtr = 145;
      doc.setTextColor(201, 168, 76);
      doc.text("VIATURAS EMPREGADAS:", 20, yOffsetVtr);
      doc.setTextColor(200, 200, 200);
      const vtrStr = op.viaturas?.join(', ') || 'Nenhuma viatura registrada.';
      const splitVtr = doc.splitTextToSize(vtrStr, 170);
      doc.text(splitVtr, 20, yOffsetVtr + 7);

      // Relatório Completo
      const yOffsetRel = 175;
      doc.setTextColor(201, 168, 76);
      doc.text("RELATÓRIO OPERACIONAL DETALHADO:", 20, yOffsetRel);
      doc.setTextColor(200, 200, 200);
      const splitRel = doc.splitTextToSize(op.relatorio || 'Nenhum relatório detalhado fornecido.', 170);
      doc.text(splitRel, 20, yOffsetRel + 7);

      // Rodapé / Assinatura
      doc.setDrawColor(40, 40, 40);
      doc.line(15, 260, 195, 260);
      
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text("DOCUMENTO OFICIAL PMESP - CHOQUE ANCHIETA - ACESSO RESTRITO", 105, 275, { align: "center" });

      doc.save(`Relatorio_Operacao_${op.nome.replace(/\s+/g, '_')}.pdf`);
      sendNotification("PDF gerado com sucesso!", "sucesso");
    } catch (err) {
      console.error(err);
      sendNotification("Erro ao gerar PDF", "erro");
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="spinner" /></div>;

  return (
    <div className="animate-fadeIn pb-10">
      <Topbar title="OPERAÇÕES" subtitle="Gestão de Operações Táticas" />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Total', value: operations.length, color: 'text-gold' },
          { label: 'Ativas', value: operations.filter(o => o.status === 'ativa').length, color: 'text-army-green-light' },
          { label: 'Concluídas', value: operations.filter(o => o.status === 'concluida').length, color: 'text-gray-400' },
          { label: 'Efetivo Geral', value: operations.reduce((s, o) => s + (o.equipe?.length || 0), 0), color: 'text-choque-yellow' },
        ].map((stat, i) => (
          <div key={i} className="mil-card !p-4 text-center">
            <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
            <p className="text-[9px] text-gray-500 uppercase tracking-widest font-bold mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Operations List */}
      <div className="space-y-4">
        {operations.map((op, i) => (
          <div
            key={op.id}
            onClick={() => setSelectedOp(op)}
            className="hero-card p-5 sm:p-6 group hover:-translate-y-0.5 transition-all duration-300 cursor-pointer border border-gray-800 hover:border-gold/30"
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${
                op.status === 'ativa' ? 'bg-army-green/20 border border-army-green/40 text-army-green-light' : 'bg-gold/10 border border-gold/20 text-gold'
              }`}>
                <MdMilitaryTech />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-base font-black text-gray-100 group-hover:text-gold transition-colors">{op.nome}</h3>
                  {op.status === 'ativa' ? <span className="badge-green !text-[9px]">Ativa</span> : <span className="badge-steel !text-[9px]">Concluída</span>}
                </div>
                <p className="text-xs text-gray-500 mb-3">{op.objetivo}</p>
                <div className="flex flex-wrap items-center gap-4 text-[10px] text-gray-600">
                  <span className="flex items-center gap-1"><MdPeople /> {op.equipe?.length || 0} militares</span>
                  <span className="flex items-center gap-1"><MdAirportShuttle /> {op.viaturas?.length || 0} viaturas</span>
                  <span className="flex items-center gap-1"><MdCalendarToday /> {new Date(op.data).toLocaleDateString('pt-BR')}</span>
                  <span className="flex items-center gap-1"><MdFlag /> {op.resultado || 'Resultado pendente'}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedOp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-mil-dark border border-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-slideUp">
            <div className="flex justify-between items-center p-5 border-b border-gray-800 sticky top-0 bg-mil-dark z-20">
              <h2 className="text-lg font-black text-white flex items-center gap-2"><MdMilitaryTech className="text-gold" /> {selectedOp.nome}</h2>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => generatePDF(selectedOp)}
                  className="btn-gold !py-1.5 !px-3 !text-[10px] flex items-center gap-1"
                >
                  <MdPictureAsPdf /> Gerar PDF
                </button>
                <button onClick={() => setSelectedOp(null)} className="text-gray-500 hover:text-white transition-colors">
                  <MdClose className="text-2xl" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <span className="text-[10px] font-bold text-gold uppercase tracking-widest block mb-1">Objetivo / Missão</span>
                <p className="text-sm text-gray-300 leading-relaxed">{selectedOp.objetivo || 'Sem objetivo descrito.'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs text-gray-400">
                <div className="bg-mil-black/50 p-3 rounded-lg border border-gray-800">
                  <span className="text-gray-500 font-bold block mb-1">Data / Hora</span>
                  <span className="font-bold text-gray-200">{new Date(selectedOp.data).toLocaleDateString('pt-BR')} às {selectedOp.horario}</span>
                </div>
                <div className="bg-mil-black/50 p-3 rounded-lg border border-gray-800">
                  <span className="text-gray-500 font-bold block mb-1">Resultado</span>
                  <span className="font-bold text-gold">{selectedOp.resultado || 'Em andamento'}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-gold uppercase tracking-widest block mb-2">Equipe Integrante</span>
                <div className="flex flex-wrap gap-2">
                  {selectedOp.equipe?.map((e, idx) => (
                    <span key={idx} className="bg-mil-black text-xs text-gray-300 px-3 py-1 rounded-full border border-gray-800">{e}</span>
                  ))}
                  {(!selectedOp.equipe || selectedOp.equipe.length === 0) && <span className="text-xs text-gray-600">Nenhum integrante.</span>}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-gold uppercase tracking-widest block mb-2">Viaturas</span>
                <div className="flex flex-wrap gap-2">
                  {selectedOp.viaturas?.map((v, idx) => (
                    <span key={idx} className="bg-mil-black text-xs text-gray-300 px-3 py-1 rounded-full border border-gray-800 flex items-center gap-1"><MdAirportShuttle /> {v}</span>
                  ))}
                  {(!selectedOp.viaturas || selectedOp.viaturas.length === 0) && <span className="text-xs text-gray-600">Nenhuma viatura.</span>}
                </div>
              </div>

              {selectedOp.fotos && selectedOp.fotos.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-gold uppercase tracking-widest block mb-3">Galeria de Fotos</span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {selectedOp.fotos.map((f, idx) => (
                      <a href={f} target="_blank" rel="noreferrer" key={idx} className="block h-28 bg-cover bg-center rounded-lg border border-gray-800" style={{ backgroundImage: `url(${f})` }} />
                    ))}
                  </div>
                </div>
              )}

              <div>
                <span className="text-[10px] font-bold text-gold uppercase tracking-widest block mb-2">Relatório Operacional Detalhado</span>
                <div className="bg-[#080808] p-4 rounded-xl border border-gray-800 text-xs text-gray-400 font-mono whitespace-pre-wrap leading-relaxed">
                  {selectedOp.relatorio || 'Nenhum relatório detalhado cadastrado.'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

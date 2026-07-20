import { useState, useEffect, useRef } from 'react';
import Topbar from '../../components/layout/Topbar';
import { MdDescription, MdAdd, MdClose, MdPictureAsPdf, MdSave, MdAssignmentTurnedIn, MdContentCopy, MdDelete } from 'react-icons/md';
import { useNotifications } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';
import { signatureService } from '../../services/signatureService';
import { userService } from '../../services/userService';
import { cargoLabels } from '../../data/ranks';
import { jsPDF } from 'jspdf';

export default function Reports() {
  const { user } = useAuth();
  const { sendNotification } = useNotifications();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [users, setUsers] = useState([]);

  const initialFormState = {
    dataServico: '',
    prefixo: '',
    guarnicao: '',
    supervisao: '',
    inicioPatrulhamento: '',
    terminoPatrulhamento: '',
    ilicitos: '',
    bopm: 0,
    abordagens: 0,
    prisoes: 0,
    apoios: 0,
    ocorrencias: 0,
    obsEstatisticas: '',
    obsFinais: ''
  };
  const [formData, setFormData] = useState(initialFormState);

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await signatureService.getSignedDocuments();
      setReports(data.filter(d => d.tipo === 'relatorio' && d.status === 'assinado'));
    } catch (err) {
      console.error(err);
      sendNotification("Erro ao carregar relatórios", "erro");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
    userService.getAllUsers().then(data => {
      setUsers(data.filter(u => u.status !== 'Exonerado'));
    }).catch(console.error);

    // Load cursive font for canvas rendering
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const newDoc = await signatureService.createDocument({
        tipo: 'relatorio',
        titulo: `RSO - Prefixo ${formData.prefixo}`,
        dados: {
          ...formData,
          autor_nome: user.nome
        }
      });
      
      // Assinatura automática para RSO ficar disponível imediatamente
      await signatureService.signDocument(newDoc.id, {
        nome: "Comando do 2º BP Choque",
        patente: "Auto-Homologação do Sistema"
      });

      sendNotification("RSO homologado e publicado com sucesso!", "sucesso");
      setFormData(initialFormState);
      setShowCreateModal(false);
      loadReports();
    } catch (err) {
      sendNotification(err.message, "erro");
    }
  };

  // Helper to draw cursive text to canvas and return Data URL
  const createSignatureImage = (text) => {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 150;
    const ctx = canvas.getContext('2d');
    ctx.font = '700 48px "Dancing Script", cursive';
    ctx.fillStyle = '#C9A84C'; // Gold color
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 300, 75);
    return canvas.toDataURL('image/png');
  };

  const generatePDF = (report) => {
    try {
      const doc = new jsPDF();
      const d = report.dados;
      
      // Papel de Fundo Militar
      doc.setFillColor(20, 20, 20);
      doc.rect(0, 0, 210, 297, 'F');
      
      // Borda Gold
      doc.setDrawColor(201, 168, 76);
      doc.setLineWidth(0.5);
      doc.rect(10, 10, 190, 277);

      // Cabeçalho PMESP
      doc.setFont("helvetica", "bold");
      doc.setTextColor(201, 168, 76);
      doc.setFontSize(14);
      doc.text("RELATÓRIO DE SERVIÇO OPERACIONAL — RSO", 105, 25, { align: "center" });
      doc.setFontSize(11);
      doc.text("2º BATALHÃO DE POLÍCIA DE CHOQUE ANCHIETA — ELITE SP", 105, 32, { align: "center" });
      
      doc.setDrawColor(40, 40, 40);
      doc.line(15, 38, 195, 38);

      // Metadados RSO
      doc.setTextColor(220, 220, 220);
      doc.setFontSize(10);
      doc.text(`RSO Nº ${report.id.substring(0, 6).toUpperCase()}`, 20, 48);
      doc.text(`Data do Serviço: ${d.dataServico || 'N/A'}`, 20, 54);
      doc.text(`Origem: Comando do 2º BP Choque Anchieta`, 20, 60);
      doc.text(`Oficial Responsável: ${d.autor_nome || 'N/A'}`, 20, 66);

      let y = 76;
      const addSection = (title, contentLines) => {
        if (y > 260) { doc.addPage(); doc.setFillColor(20, 20, 20); doc.rect(0, 0, 210, 297, 'F'); doc.setDrawColor(201, 168, 76); doc.setLineWidth(0.5); doc.rect(10, 10, 190, 277); y = 20; }
        doc.setFont("helvetica", "bold");
        doc.setTextColor(201, 168, 76);
        doc.text(title, 20, y);
        y += 6;
        doc.setFont("helvetica", "normal");
        doc.setTextColor(220, 220, 220);
        contentLines.forEach(line => {
          if (y > 270) { doc.addPage(); doc.setFillColor(20, 20, 20); doc.rect(0, 0, 210, 297, 'F'); doc.setDrawColor(201, 168, 76); doc.setLineWidth(0.5); doc.rect(10, 10, 190, 277); y = 20; }
          const split = doc.splitTextToSize(line, 170);
          doc.text(split, 20, y);
          y += (split.length * 5);
        });
        y += 4;
      };

      addSection("I — DADOS DA VIATURA", [
        `Prefixo: ${d.prefixo || 'N/A'}`,
        `Guarnição/Steaves em serviço:`,
        d.guarnicao || 'N/A'
      ]);

      addSection("II — SUPERVISÃO DO PATRULHAMENTO", [
        "Durante o serviço operacional, a equipe realizou patrulhamento preventivo, ostensivo e tático nas áreas determinadas pelo comando, mantendo postura disciplinada, atenção operacional e pronto emprego diante das ocorrências.",
        "",
        "Observações da supervisão:",
        d.supervisao || 'N/A'
      ]);

      addSection("III — INÍCIO E TÉRMINO DO PATRULHAMENTO", [
        `Início do Patrulhamento: ${d.inicioPatrulhamento || 'N/A'}`,
        `Término do Patrulhamento: ${d.terminoPatrulhamento || 'N/A'}`
      ]);

      addSection("IV — ILÍCITOS APREENDIDOS", [
        "Durante o serviço, foram apreendidos os seguintes ilícitos/materiais:",
        "",
        d.ilicitos || 'Nenhum material apreendido.'
      ]);

      addSection("V — BOPMs E ESTATÍSTICAS", [
        `BOPMs registrados: ${d.bopm || 0}`,
        `Abordagens realizadas: ${d.abordagens || 0}`,
        `Prisões efetuadas: ${d.prisoes || 0}`,
        `Apoios prestados: ${d.apoios || 0}`,
        `Ocorrências atendidas: ${d.ocorrencias || 0}`,
        "",
        "Observações estatísticas:",
        d.obsEstatisticas || 'Nenhuma.'
      ]);

      addSection("VI — OBSERVAÇÕES FINAIS", [
        d.obsFinais || 'Nenhuma.'
      ]);

      addSection("VII — ENCERRAMENTO", [
        "O presente Relatório de Serviço Operacional é publicado para registro interno, ciência do comando e controle das atividades operacionais realizadas pela equipe em serviço.",
        "",
        "Quartel do 2º BP Choque Anchieta — Elite SP",
        `Data: ${new Date(report.assinatura_data).toLocaleDateString('pt-BR')}`
      ]);

      // Assinatura Militar do Rodapé
      if (y > 230) {
        doc.addPage(); doc.setFillColor(20, 20, 20); doc.rect(0, 0, 210, 297, 'F'); doc.setDrawColor(201, 168, 76); doc.setLineWidth(0.5); doc.rect(10, 10, 190, 277); y = 30;
      }

      y += 10;
      doc.setFont("helvetica", "bold");
      doc.setTextColor(201, 168, 76);
      doc.text("✯✯✯✯ | Tenente-Coronel PM", 105, y, { align: "center" });
      doc.text("Comandante do 2º BP Choque Anchieta", 105, y + 5, { align: "center" });
      
      // Linha de assinatura
      doc.setDrawColor(100, 100, 100);
      doc.line(60, y + 25, 150, y + 25);
      doc.setTextColor(150, 150, 150);
      doc.text("Assinatura:", 40, y + 25);

      // Gerar assinatura manuscrita em Canvas e adicionar
      const sigData = createSignatureImage(report.assinatura_nome || "Comando Geral");
      doc.addImage(sigData, 'PNG', 65, y + 5, 80, 20);

      // Dados de Validação Digital
      doc.setFontSize(7);
      doc.setTextColor(100, 100, 100);
      doc.setFont("courier", "normal");
      doc.text(`Cód. Autenticidade: ${report.codigo_autenticidade}`, 20, 275);
      doc.text(`Hash: ${report.hash_seguranca?.substring(0, 32)}...`, 20, 279);
      doc.text(`Data/Hora Assinatura: ${new Date(report.assinatura_data).toLocaleString('pt-BR')}`, 20, 283);

      doc.save(`RSO_${report.id.split('-')[0]}.pdf`);
      sendNotification("PDF do RSO baixado!", "sucesso");
    } catch (err) {
      console.error(err);
      sendNotification("Erro ao gerar PDF", "erro");
    }
  };

  const handleCopyText = async (report) => {
    try {
      const d = report.dados;
      const text = `
=== RELATÓRIO DE SERVIÇO OPERACIONAL (RSO) ===
Título: ${report.titulo}

[ DADOS DO SERVIÇO ]
Data: ${d.dataServico || 'N/A'}
Oficial Resp.: ${d.autor_nome || 'N/A'}
Viatura: ${d.viatura || 'N/A'}
Prefixo: ${d.prefixo || 'N/A'}

[ GUARNIÇÃO ]
${d.guarnicao || 'N/A'}

[ ESTATÍSTICAS ]
BOPMs: ${d.bopm || 0}
Abordagens: ${d.abordagens || 0}
Prisões: ${d.prisoes || 0}
Apoios: ${d.apoios || 0}
Ocorrências: ${d.ocorrencias || 0}
Obs. Estatísticas: ${d.obsEstatisticas || 'Nenhuma.'}

[ ILÍCITOS APREENDIDOS ]
${d.ilicitos || 'Nenhum material apreendido.'}

[ SUPERVISÃO ]
${d.supervisao || 'N/A'}

[ INÍCIO/TÉRMINO ]
Início: ${d.inicioPatrulhamento || 'N/A'}
Término: ${d.terminoPatrulhamento || 'N/A'}

[ OBSERVAÇÕES FINAIS ]
${d.obsFinais || 'Nenhuma.'}

[ ASSINATURA E VALIDAÇÃO ]
Assinado por: ${report.assinatura_nome} (${report.assinatura_patente})
Cód. Validação: ${report.codigo_autenticidade}
Data/Hora: ${new Date(report.assinatura_data).toLocaleString('pt-BR')}
Hash: ${report.hash_seguranca}
==============================================
      `.trim();
      
      await navigator.clipboard.writeText(text);
      sendNotification("Texto do RSO copiado para a área de transferência!", "sucesso");
    } catch (err) {
      console.error("Erro ao copiar texto:", err);
      sendNotification("Erro ao copiar texto.", "erro");
    }
  };

  const handleDeleteReport = async (reportId) => {
    if (!window.confirm("ATENÇÃO: Deseja realmente DELETAR este RSO do sistema? Esta ação não pode ser desfeita.")) return;
    try {
      await signatureService.deleteDocument(reportId);
      setReports(reports.filter(r => r.id !== reportId));
      setSelectedReport(null);
      sendNotification("RSO apagado com sucesso.", "sucesso");
    } catch (err) {
      console.error(err);
      sendNotification("Erro ao apagar RSO.", "erro");
    }
  };

  const isComando = user && ['capitao', 'major', 'tenente_coronel', 'coronel'].includes(user.patente?.toLowerCase());

  return (
    <div className="animate-fadeIn pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <Topbar title="RELATÓRIOS OPERACIONAIS (RSO)" subtitle="Gestão de Ocorrências e Atividades Homologadas" />
        <button 
          onClick={() => setShowCreateModal(true)}
          className="btn-green self-start sm:self-auto flex items-center gap-2"
        >
          <MdAdd className="text-xl" /> Preencher RSO
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="spinner" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {reports.map(r => (
            <div 
              key={r.id} 
              onClick={() => setSelectedReport(r)}
              className="hero-card p-5 border border-gray-800 hover:border-gold/30 cursor-pointer flex flex-col group"
            >
              <div className="flex justify-between items-start mb-3">
                <span className="badge-steel !text-[9px]">RSO Homologado</span>
                <span className="text-[10px] text-gray-500 font-mono">{new Date(r.assinatura_data).toLocaleDateString('pt-BR')}</span>
              </div>
              <h3 className="text-sm font-black text-gray-100 group-hover:text-gold transition-colors mb-2">{r.titulo}</h3>
              <div className="grid grid-cols-2 gap-2 mb-4 text-[10px]">
                <div className="bg-mil-black/50 p-2 rounded border border-gray-800">
                  <span className="block text-gray-500">Prisões</span>
                  <span className="text-gold font-bold">{r.dados.prisoes || 0}</span>
                </div>
                <div className="bg-mil-black/50 p-2 rounded border border-gray-800">
                  <span className="block text-gray-500">BOPMs</span>
                  <span className="text-gold font-bold">{r.dados.bopm || 0}</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-auto pt-3 border-t border-gray-800 text-[10px] text-gray-500 font-mono">
                <span>Relator: {r.dados.autor_nome?.split(' ')[0]}</span>
                <span className="text-army-green-light">Assinado por: {r.assinatura_nome?.split(' ')[0]}</span>
              </div>
            </div>
          ))}
          {reports.length === 0 && (
            <div className="col-span-full py-20 text-center text-gray-600 bg-mil-black/20 rounded-xl border border-dashed border-gray-800">
              <MdDescription className="text-5xl mx-auto mb-3 text-gray-700" />
              <p>Nenhum RSO homologado ainda.</p>
            </div>
          )}
        </div>
      )}

      {/* Modal Criar Relatório (RSO) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-mil-dark border border-gray-800 rounded-xl w-full max-w-4xl max-h-[95vh] overflow-y-auto shadow-2xl animate-slideUp">
            <div className="flex justify-between items-center p-5 border-b border-gray-800 sticky top-0 bg-mil-dark z-20">
              <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                <MdDescription className="text-gold" /> Preencher RSO
              </h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-500 hover:text-white transition-colors">
                <MdClose className="text-2xl" />
              </button>
            </div>
            
            <form onSubmit={handleCreate} className="p-5 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-1">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Data do Serviço *</label>
                  <input type="date" value={formData.dataServico} onChange={e => setFormData({ ...formData, dataServico: e.target.value })} required className="mil-input" />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Prefixo da Viatura *</label>
                  <input type="text" value={formData.prefixo} onChange={e => setFormData({ ...formData, prefixo: e.target.value })} required className="mil-input" placeholder="Ex: 92000" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Guarnição / Steaves *</label>
                  <select 
                    className="mil-input mb-2" 
                    onChange={e => {
                      if (!e.target.value) return;
                      const u = users.find(x => x.id === e.target.value);
                      if (u) {
                        const str = `${u.nome} (${cargoLabels[u.cargo] || u.cargo})`;
                        setFormData(prev => ({
                          ...prev,
                          guarnicao: prev.guarnicao ? prev.guarnicao + '\n' + str : str
                        }));
                      }
                      e.target.value = '';
                    }}
                  >
                    <option value="">+ Selecionar policial para adicionar...</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.nome} ({cargoLabels[u.cargo] || u.cargo})</option>
                    ))}
                  </select>
                  <textarea value={formData.guarnicao} onChange={e => setFormData({ ...formData, guarnicao: e.target.value })} required className="mil-textarea" rows="3" placeholder="Você pode digitar manualmente ou selecionar acima..." />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Observações da Supervisão *</label>
                  <textarea value={formData.supervisao} onChange={e => setFormData({ ...formData, supervisao: e.target.value })} required className="mil-textarea" rows="3" placeholder="Detalhes do patrulhamento..." />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Início do Patrulhamento *</label>
                  <input type="time" value={formData.inicioPatrulhamento} onChange={e => setFormData({ ...formData, inicioPatrulhamento: e.target.value })} required className="mil-input" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Término do Patrulhamento *</label>
                  <input type="time" value={formData.terminoPatrulhamento} onChange={e => setFormData({ ...formData, terminoPatrulhamento: e.target.value })} required className="mil-input" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Ilícitos Apreendidos</label>
                <textarea value={formData.ilicitos} onChange={e => setFormData({ ...formData, ilicitos: e.target.value })} className="mil-textarea" rows="3" placeholder="Caso não haja, deixe em branco ou informe 'Nenhum'..." />
              </div>

              <div className="bg-mil-black/30 p-4 rounded-xl border border-gray-800">
                <h3 className="text-gold text-xs font-bold uppercase tracking-widest mb-4">Estatísticas Operacionais</h3>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div>
                    <label className="block text-[9px] text-gray-400 mb-1">BOPMs</label>
                    <input type="number" min="0" value={formData.bopm} onChange={e => setFormData({ ...formData, bopm: e.target.value })} className="mil-input text-center" />
                  </div>
                  <div>
                    <label className="block text-[9px] text-gray-400 mb-1">Abordagens</label>
                    <input type="number" min="0" value={formData.abordagens} onChange={e => setFormData({ ...formData, abordagens: e.target.value })} className="mil-input text-center" />
                  </div>
                  <div>
                    <label className="block text-[9px] text-gray-400 mb-1">Prisões</label>
                    <input type="number" min="0" value={formData.prisoes} onChange={e => setFormData({ ...formData, prisoes: e.target.value })} className="mil-input text-center" />
                  </div>
                  <div>
                    <label className="block text-[9px] text-gray-400 mb-1">Apoios</label>
                    <input type="number" min="0" value={formData.apoios} onChange={e => setFormData({ ...formData, apoios: e.target.value })} className="mil-input text-center" />
                  </div>
                  <div>
                    <label className="block text-[9px] text-gray-400 mb-1">Ocorrências</label>
                    <input type="number" min="0" value={formData.ocorrencias} onChange={e => setFormData({ ...formData, ocorrencias: e.target.value })} className="mil-input text-center" />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-[9px] text-gray-400 mb-1">Observações Estatísticas</label>
                  <input type="text" value={formData.obsEstatisticas} onChange={e => setFormData({ ...formData, obsEstatisticas: e.target.value })} className="mil-input" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Observações Finais</label>
                <textarea value={formData.obsFinais} onChange={e => setFormData({ ...formData, obsFinais: e.target.value })} className="mil-textarea" rows="2" />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-800 sticky bottom-0 bg-mil-dark py-4">
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary !text-xs">Cancelar</button>
                <button type="submit" className="btn-green !text-xs"><MdSave /> Enviar RSO</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detalhes do Relatório */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-mil-dark border border-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-slideUp">
            <div className="flex justify-between items-center p-5 border-b border-gray-800 sticky top-0 bg-mil-dark z-20">
              <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2"><MdDescription className="text-gold" /> {selectedReport.titulo}</h2>
              <div className="flex items-center gap-2">
                {isComando && (
                  <button onClick={() => handleDeleteReport(selectedReport.id)} className="btn-secondary !py-1.5 !px-3 !text-[10px] flex items-center gap-1 hover:!bg-red-500/20 hover:!text-red-500 hover:!border-red-500/30" title="Apagar RSO">
                    <MdDelete /> Apagar
                  </button>
                )}
                <button onClick={() => handleCopyText(selectedReport)} className="btn-secondary !py-1.5 !px-3 !text-[10px] flex items-center gap-1 hover:text-white" title="Copiar Texto">
                  <MdContentCopy /> Copiar Texto
                </button>
                <button onClick={() => generatePDF(selectedReport)} className="btn-gold !py-1.5 !px-3 !text-[10px] flex items-center gap-1">
                  <MdPictureAsPdf /> Baixar RSO
                </button>
                <button onClick={() => setSelectedReport(null)} className="text-gray-500 hover:text-white transition-colors">
                  <MdClose className="text-2xl" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4 text-xs text-gray-300">
              <div className="bg-mil-black/50 p-4 rounded-xl border border-gray-800 grid grid-cols-2 gap-4">
                <div><span className="text-gold font-bold uppercase text-[9px] block">Data do Serviço</span> {selectedReport.dados.dataServico}</div>
                <div><span className="text-gold font-bold uppercase text-[9px] block">Oficial Resp.</span> {selectedReport.dados.autor_nome}</div>
                <div><span className="text-gold font-bold uppercase text-[9px] block">Viatura</span> {selectedReport.dados.viatura}</div>
                <div><span className="text-gold font-bold uppercase text-[9px] block">Prefixo</span> {selectedReport.dados.prefixo}</div>
              </div>

              <div>
                <h4 className="text-gold font-bold uppercase text-[10px] mb-1">Guarnição</h4>
                <div className="bg-mil-black/30 p-3 rounded-lg border border-gray-800 whitespace-pre-wrap">{selectedReport.dados.guarnicao}</div>
              </div>
              
              <div>
                <h4 className="text-gold font-bold uppercase text-[10px] mb-1">Estatísticas</h4>
                <div className="bg-mil-black/30 p-3 rounded-lg border border-gray-800 grid grid-cols-5 gap-2 text-center">
                  <div><div className="text-gray-500 text-[9px]">BOPM</div><div className="font-bold">{selectedReport.dados.bopm}</div></div>
                  <div><div className="text-gray-500 text-[9px]">Abordagens</div><div className="font-bold">{selectedReport.dados.abordagens}</div></div>
                  <div><div className="text-gray-500 text-[9px]">Prisões</div><div className="font-bold">{selectedReport.dados.prisoes}</div></div>
                  <div><div className="text-gray-500 text-[9px]">Apoios</div><div className="font-bold">{selectedReport.dados.apoios}</div></div>
                  <div><div className="text-gray-500 text-[9px]">Ocorrências</div><div className="font-bold">{selectedReport.dados.ocorrencias}</div></div>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-gold uppercase tracking-widest block mb-2">Assinatura de Validação Digital</span>
                <div className="bg-mil-black/30 p-4 rounded-xl border border-gray-800 text-xs text-gray-400 relative">
                  <p className="font-bold text-army-green-light flex items-center gap-1.5"><MdAssignmentTurnedIn /> {selectedReport.assinatura_nome} ({selectedReport.assinatura_patente})</p>
                  <p className="text-[10px] text-gray-500 font-mono mt-2">Cód. Validação: {selectedReport.codigo_autenticidade}</p>
                  <p className="text-[9px] text-gray-600 font-mono truncate mt-1">Hash: {selectedReport.hash_seguranca}</p>
                  
                  {/* Assinatura Visual Cursiva */}
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-70 transform rotate-[-5deg]">
                    <span style={{ fontFamily: "'Dancing Script', cursive", fontSize: '2rem', color: '#C9A84C' }}>
                      {selectedReport.assinatura_nome.split(' ')[0]}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

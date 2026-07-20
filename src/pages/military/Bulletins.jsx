import { useState, useEffect } from 'react';
import Topbar from '../../components/layout/Topbar';
import { MdCampaign, MdAdd, MdClose, MdSave, MdPictureAsPdf, MdAssignmentTurnedIn, MdLock, MdDelete, MdEdit } from 'react-icons/md';
import { useNotifications } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';
import { signatureService } from '../../services/signatureService';
import { jsPDF } from 'jspdf';

export default function Bulletins() {
  const { user, userRankLevel } = useAuth();
  const { sendNotification } = useNotifications();
  const [bulletins, setBulletins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedBulletin, setSelectedBulletin] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    titulo: '',
    conteudo: ''
  });

  const loadBulletins = async () => {
    setLoading(true);
    try {
      const data = await signatureService.getSignedDocuments();
      // Filtrar apenas boletins assinados
      setBulletins(data.filter(d => d.tipo === 'boletim' && d.status === 'assinado'));
    } catch (err) {
      console.error(err);
      sendNotification("Erro ao carregar boletins", "erro");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBulletins();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await signatureService.createDocument({
        tipo: 'boletim',
        titulo: formData.titulo,
        dados: {
          conteudo: formData.conteudo,
          autor_nome: user.nome
        }
      });
      sendNotification("Proposta de boletim enviada para o Comando Geral!", "sucesso");
      setFormData({ titulo: '', conteudo: '' });
      setShowCreateModal(false);
      loadBulletins();
    } catch (err) {
      sendNotification(err.message, "erro");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir este boletim oficial?")) return;
    try {
      await signatureService.deleteDocument(id);
      sendNotification("Boletim excluído com sucesso.", "sucesso");
      setSelectedBulletin(null);
      loadBulletins();
    } catch (err) {
      sendNotification(err.message, "erro");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await signatureService.updateDocument(selectedBulletin.id, {
        titulo: formData.titulo,
        dados: {
          ...selectedBulletin.dados,
          conteudo: formData.conteudo
        }
      });
      sendNotification("Boletim atualizado com sucesso.", "sucesso");
      setIsEditing(false);
      setSelectedBulletin({
        ...selectedBulletin,
        titulo: formData.titulo,
        dados: {
          ...selectedBulletin.dados,
          conteudo: formData.conteudo
        }
      });
      loadBulletins();
    } catch (err) {
      sendNotification(err.message, "erro");
    }
  };

  const generatePDF = (bulletin) => {
    try {
      const doc = new jsPDF();
      
      // Papel de Fundo Militar
      doc.setFillColor(18, 25, 18);
      doc.rect(0, 0, 210, 297, 'F');
      
      // Borda Gold
      doc.setDrawColor(201, 168, 76);
      doc.setLineWidth(1);
      doc.rect(5, 5, 200, 287);

      // Cabeçalho PMESP
      doc.setFont("courier", "bold");
      doc.setTextColor(201, 168, 76);
      doc.setFontSize(14);
      doc.text("POLÍCIA MILITAR DO ESTADO DE SÃO PAULO", 105, 25, { align: "center" });
      doc.setFontSize(11);
      doc.text("2º BATALHÃO DE POLÍCIA DE CHOQUE - ANCHIETA", 105, 32, { align: "center" });
      
      doc.setDrawColor(40, 40, 40);
      doc.line(15, 40, 195, 40);

      // Título
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(15);
      doc.text(bulletin.titulo.toUpperCase(), 20, 55);
      
      // Data e Autor
      doc.setFontSize(9);
      doc.setFont("courier", "normal");
      doc.setTextColor(150, 150, 150);
      doc.text(`PUBLICADO EM: ${new Date(bulletin.assinatura_data).toLocaleDateString('pt-BR')}`, 20, 65);
      doc.text(`AUTOR DA PROPOSTA: ${bulletin.dados.autor_nome || 'Comando'}`, 20, 71);

      // Conteúdo do Boletim
      doc.setTextColor(220, 220, 220);
      doc.setFontSize(10);
      const splitContent = doc.splitTextToSize(bulletin.dados.conteudo || '', 170);
      doc.text(splitContent, 20, 85);

      // Assinatura Militar do Rodapé
      doc.setDrawColor(40, 40, 40);
      doc.line(15, 200, 195, 200);

      // Caixa de Assinatura Elegante do Coronel Luan Bigode
      doc.setFont("courier", "bold");
      doc.setTextColor(201, 168, 76);
      doc.text("ASSINADO DIGITALMENTE POR:", 20, 210);
      
      doc.setTextColor(255, 255, 255);
      doc.text(bulletin.assinatura_nome || "Tenente Coronel Luan Bigode", 20, 220);
      doc.setFont("courier", "normal");
      doc.setTextColor(150, 150, 150);
      doc.text(bulletin.assinatura_patente || "Comando Geral", 20, 226);
      doc.text("2º BP CHOQUE Anchieta", 20, 232);
      
      doc.setFontSize(8);
      doc.text(`Data/Hora: ${new Date(bulletin.assinatura_data).toLocaleString('pt-BR')}`, 20, 242);
      doc.text(`Cód. Autenticidade: ${bulletin.codigo_autenticidade}`, 20, 247);
      doc.text(`Hash: ${bulletin.hash_seguranca?.substring(0, 32)}...`, 20, 252);

      // QR Code de Validação
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(bulletin.codigo_autenticidade)}`;
      doc.addImage(qrUrl, 'PNG', 145, 205, 45, 45);

      // Rodapé
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text("ESTE BOLETIM É DE CARÁTER INTERNO E OBRIGATÓRIO PARA TODO EFETIVO", 105, 280, { align: "center" });

      doc.save(`Boletim_${bulletin.id.split('-')[0]}.pdf`);
      sendNotification("Boletim PDF baixado!", "sucesso");
    } catch (err) {
      console.error(err);
      sendNotification("Erro ao gerar PDF", "erro");
    }
  };

  return (
    <div className="animate-fadeIn pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <Topbar title="MURAL & COMUNICADOS" subtitle="Boletins Internos Homologados" />
        {userRankLevel >= 10 && (
          <button 
            onClick={() => setShowCreateModal(true)}
            className="btn-green self-start sm:self-auto flex items-center gap-2"
          >
            <MdAdd className="text-xl" /> Propor Boletim
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="spinner" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {bulletins.map(b => (
            <div 
              key={b.id} 
              onClick={() => {
                setSelectedBulletin(b);
                setFormData({ titulo: b.titulo, conteudo: b.dados.conteudo });
                setIsEditing(false);
              }}
              className="hero-card p-5 border border-gray-800 hover:border-gold/30 cursor-pointer flex flex-col group"
            >
              <div className="flex justify-between items-start mb-3">
                <span className="badge-gold !text-[9px]">Boletim Oficial</span>
                <span className="text-[10px] text-gray-500 font-mono">{new Date(b.assinatura_data).toLocaleDateString('pt-BR')}</span>
              </div>
              <h3 className="text-sm font-black text-gray-100 group-hover:text-gold transition-colors mb-2">{b.titulo}</h3>
              <p className="text-xs text-gray-400 line-clamp-3 mb-4 leading-relaxed">{b.dados.conteudo}</p>
              
              <div className="flex justify-between items-center mt-auto pt-3 border-t border-gray-800 text-[10px] text-gray-500 font-mono">
                <span>Autor: {b.dados.autor_nome}</span>
                <span className="text-army-green-light">Assinado por: {b.assinatura_nome}</span>
              </div>
            </div>
          ))}
          {bulletins.length === 0 && (
            <div className="col-span-full py-20 text-center text-gray-600 bg-mil-black/20 rounded-xl border border-dashed border-gray-800">
              <MdCampaign className="text-5xl mx-auto mb-3 text-gray-700" />
              <p>Nenhum boletim oficial em vigor no mural.</p>
            </div>
          )}
        </div>
      )}

      {/* Modal Criar Boletim */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-mil-dark border border-gray-800 rounded-xl w-full max-w-lg shadow-2xl animate-slideUp">
            <div className="flex justify-between items-center p-5 border-b border-gray-800 bg-mil-dark z-20">
              <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2"><MdCampaign className="text-gold" /> Propor Novo Boletim</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-500 hover:text-white transition-colors">
                <MdClose className="text-2xl" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Título do Boletim *</label>
                <input type="text" value={formData.titulo} onChange={e => setFormData({ ...formData, titulo: e.target.value })} required className="mil-input" placeholder="Ex: Boletim Geral 023/2026" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Conteúdo / Determinação *</label>
                <textarea value={formData.conteudo} onChange={e => setFormData({ ...formData, conteudo: e.target.value })} required className="mil-textarea" rows="5" placeholder="Escreva a nova instrução ou diretriz..." />
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-gray-800">
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary !text-xs">Cancelar</button>
                <button type="submit" className="btn-green !text-xs"><MdSave /> Enviar Proposta</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detalhes do Boletim */}
      {selectedBulletin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-mil-dark border border-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-slideUp">
            <div className="flex justify-between items-center p-5 border-b border-gray-800 sticky top-0 bg-mil-dark z-20">
              <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2"><MdCampaign className="text-gold" /> {isEditing ? 'Editar Boletim' : 'Detalhes do Boletim'}</h2>
              <div className="flex items-center gap-2">
                {!isEditing && (user.cargo === 'tenente_coronel' || user.cargo === 'major') && (
                  <>
                    <button onClick={() => handleDelete(selectedBulletin.id)} className="btn-danger !py-1.5 !px-3 !text-[10px] flex items-center gap-1" title="Excluir"><MdDelete /></button>
                    <button onClick={() => setIsEditing(true)} className="btn-gold !py-1.5 !px-3 !text-[10px] flex items-center gap-1" title="Editar"><MdEdit /></button>
                  </>
                )}
                {!isEditing && (
                  <button onClick={() => generatePDF(selectedBulletin)} className="btn-gold !py-1.5 !px-3 !text-[10px] flex items-center gap-1">
                    <MdPictureAsPdf /> Gerar PDF
                  </button>
                )}
                <button onClick={() => { setSelectedBulletin(null); setIsEditing(false); }} className="text-gray-500 hover:text-white transition-colors">
                  <MdClose className="text-2xl" />
                </button>
              </div>
            </div>

            {isEditing ? (
              <form onSubmit={handleUpdate} className="p-6 space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Título do Boletim *</label>
                  <input type="text" value={formData.titulo} onChange={e => setFormData({ ...formData, titulo: e.target.value })} required className="mil-input" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Conteúdo / Determinação *</label>
                  <textarea value={formData.conteudo} onChange={e => setFormData({ ...formData, conteudo: e.target.value })} required className="mil-textarea" rows="8" />
                </div>
                <div className="pt-4 flex justify-end gap-3 border-t border-gray-800">
                  <button type="button" onClick={() => setIsEditing(false)} className="btn-secondary !text-xs">Cancelar</button>
                  <button type="submit" className="btn-green !text-xs"><MdSave /> Salvar Edição</button>
                </div>
              </form>
            ) : (
              <div className="p-6 space-y-6">
                <div>
                  <span className="text-[10px] font-bold text-gold uppercase tracking-widest block mb-1">Assunto / Título</span>
                  <h3 className="text-base font-black text-white">{selectedBulletin.titulo}</h3>
                  <span className="text-[10px] text-gray-500 font-mono block mt-1">Homologado em: {new Date(selectedBulletin.assinatura_data).toLocaleString('pt-BR')} por {selectedBulletin.assinatura_nome}</span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-gold uppercase tracking-widest block mb-2">Conteúdo Oficial</span>
                  <div className="bg-mil-black/50 p-4 rounded-xl border border-gray-800 text-xs text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {selectedBulletin.dados.conteudo}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-gold uppercase tracking-widest block mb-2">Assinatura Institucional</span>
                  <div className="bg-mil-black/30 p-4 rounded-xl border border-gray-800 text-xs text-gray-400">
                    <p className="font-bold text-army-green-light flex items-center gap-1.5"><MdAssignmentTurnedIn /> {selectedBulletin.assinatura_nome} ({selectedBulletin.assinatura_patente})</p>
                    <p className="text-[10px] text-gray-500 font-mono mt-2">Cód. Validação: {selectedBulletin.codigo_autenticidade}</p>
                    <p className="text-[9px] text-gray-600 font-mono truncate mt-1">Hash: {selectedBulletin.hash_seguranca}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

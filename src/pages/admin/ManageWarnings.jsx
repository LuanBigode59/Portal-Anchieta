import { useState, useEffect } from 'react';
import Topbar from '../../components/layout/Topbar';
import { userService } from '../../services/userService';
import { signatureService } from '../../services/signatureService';
import { MdGavel, MdAdd, MdClose, MdWarning, MdSave, MdDelete, MdEdit } from 'react-icons/md';
import { WARNING_TYPES } from '../../data/constants';
import { useNotifications } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';
import { getRankById } from '../../data/ranks';

export default function ManageWarnings() {
  const { user, userRankLevel } = useAuth();
  const [users, setUsers] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingWarning, setEditingWarning] = useState(null);
  const { sendNotification } = useNotifications();

  const [formData, setFormData] = useState({
    militar_id: '',
    tipo: 'VERBAL',
    motivo: ''
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [allUsers, allDocs] = await Promise.all([
        userService.getUsers(),
        signatureService.getSignedDocuments()
      ]);
      setUsers(allUsers);
      // Filtrar apenas advertências assinadas e oficiais
      setWarnings(allDocs.filter(d => d.tipo === 'advertencia' && d.status === 'assinado'));
    } catch (err) {
      console.error(err);
      sendNotification("Erro ao carregar dados", "erro");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.militar_id && !editingWarning) {
      sendNotification("Selecione um militar", "aviso");
      return;
    }

    try {
      if (editingWarning) {
        const payload = {
          dados: {
            ...editingWarning.dados,
            tipo_advertencia: WARNING_TYPES[formData.tipo]?.label || formData.tipo,
            motivo: formData.motivo
          }
        };
        await signatureService.updateDocument(editingWarning.id, payload);
        sendNotification("Advertência atualizada com sucesso.", "sucesso");
      } else {
        const selectedUser = users.find(u => u.id === formData.militar_id);
        const payload = {
          tipo: 'advertencia',
          titulo: `Advertência Oficial - ${selectedUser?.nome}`,
          dados: {
            target_militar_id: selectedUser?.id,
            target_militar_nome: selectedUser?.nome,
            tipo_advertencia: WARNING_TYPES[formData.tipo]?.label || formData.tipo,
            motivo: formData.motivo
          }
        };
        await signatureService.createDocument(payload);
        sendNotification("Proposta de advertência enviada para o Comando Geral!", "sucesso");
      }
      
      setShowModal(false);
      setEditingWarning(null);
      setFormData({ militar_id: '', tipo: 'VERBAL', motivo: '' });
      loadData();
    } catch (err) {
      sendNotification(err.message, "erro");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Tem certeza que deseja remover esta advertência?")) return;
    try {
      await signatureService.deleteDocument(id);
      sendNotification("Advertência removida com sucesso.", "sucesso");
      loadData();
    } catch (err) {
      sendNotification(err.message, "erro");
    }
  };

  const openEditModal = (warning) => {
    setEditingWarning(warning);
    const tipoKey = Object.keys(WARNING_TYPES).find(k => WARNING_TYPES[k].label === warning.dados.tipo_advertencia) || 'VERBAL';
    setFormData({
      militar_id: warning.dados.target_militar_id,
      tipo: tipoKey,
      motivo: warning.dados.motivo
    });
    setShowModal(true);
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="spinner" /></div>;

  return (
    <div className="animate-fadeIn pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <Topbar title="GERENCIAR ADVERTÊNCIAS" subtitle="Gerenciar e Aplicar Punições Homologadas" />
        <button onClick={() => { setEditingWarning(null); setFormData({ militar_id: '', tipo: 'VERBAL', motivo: '' }); setShowModal(true); }} className="btn-danger self-start sm:self-auto flex items-center gap-2">
          <MdAdd /> Nova Proposta
        </button>
      </div>

      {/* Legend */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {Object.values(WARNING_TYPES).map(type => (
          <div key={type.id} className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: type.color }} />
            <span className="text-gray-400">{type.label}</span>
          </div>
        ))}
      </div>

      {/* Warnings List */}
      <div className="space-y-3">
        {warnings.map((warning, i) => {
          const typeInfo = WARNING_TYPES[warning.dados.tipo_advertencia?.toUpperCase()] || { color: '#c62828' };
          return (
            <div key={warning.id} className="hero-card p-5 border-l-4 animate-fadeInUp" style={{ borderLeftColor: typeInfo.color, animationDelay: `${i * 0.05}s`, animationFillMode: 'both' }}>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: typeInfo.color + '20', color: typeInfo.color }}>
                  <MdWarning className="text-xl" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-sm font-black text-gray-100">{warning.dados.target_militar_nome}</span>
                    <span className="badge-danger" style={{ fontSize: '9px' }}>{warning.dados.tipo_advertencia}</span>
                  </div>
                  <p className="text-xs text-gray-400 mb-2">{warning.dados.motivo}</p>
                  <div className="flex items-center justify-between text-[10px] text-gray-600 border-t border-gray-800/40 pt-2 mt-2 font-mono">
                    <span>Homologado por: {warning.assinatura_nome}</span>
                    <span>Assinado em: {new Date(warning.assinatura_data).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
                {user.cargo === 'tenente_coronel' && (
                  <div className="flex flex-col gap-2 ml-4">
                    <button onClick={() => openEditModal(warning)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-mil-black border border-gray-800 text-gold hover:bg-gold/10 transition-colors" title="Editar">
                      <MdEdit />
                    </button>
                    <button onClick={() => handleDelete(warning.id)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-mil-black border border-gray-800 text-danger hover:bg-danger/10 transition-colors" title="Excluir">
                      <MdDelete />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {warnings.length === 0 && (
          <div className="text-center py-20 text-gray-500 bg-mil-black/10 rounded-xl border border-dashed border-gray-800">
            <MdWarning className="text-5xl mx-auto mb-3 text-gray-700" />
            <p className="text-sm">Nenhuma advertência assinada ou em vigor no momento.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-mil-dark border border-gray-800 rounded-xl w-full max-w-lg shadow-2xl animate-slideUp">
            <div className="flex items-center justify-between p-5 border-b border-gray-800">
              <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                <MdGavel className="text-danger-light" /> Propor Advertência
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white transition-colors">
                <MdClose size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Policial Alvo *</label>
                <select className="mil-select" value={formData.militar_id} onChange={e => setFormData({ ...formData, militar_id: e.target.value })} required disabled={!!editingWarning}>
                  <option value="">Selecione o militar...</option>
                  {users.map(u => {
                    const uLvl = getRankById(u.patente || u.cargo)?.level || 0;
                    return (
                      <option key={u.id} value={u.id} disabled={uLvl >= userRankLevel}>
                        {u.nome} — {u.patente || u.cargo} {uLvl >= userRankLevel ? '(Sem Acesso)' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>
              
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Grau da Advertência *</label>
                <select className="mil-select" value={formData.tipo} onChange={e => setFormData({ ...formData, tipo: e.target.value })} required>
                  {Object.keys(WARNING_TYPES).map(key => (
                    <option key={key} value={key}>{WARNING_TYPES[key].label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Descrição do Fato / Motivação *</label>
                <textarea className="mil-textarea" value={formData.motivo} onChange={e => setFormData({ ...formData, motivo: e.target.value })} required placeholder="Descreva de forma tática o ocorrido..." rows="4" />
              </div>
              
              <div className="pt-4 flex justify-end gap-3 border-t border-gray-800">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary !text-xs">Cancelar</button>
                <button type="submit" className="btn-green flex items-center gap-1.5 !text-xs"><MdSave /> {editingWarning ? 'Salvar Edição' : 'Enviar Proposta'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

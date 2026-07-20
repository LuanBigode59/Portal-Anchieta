import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Topbar from '../../components/layout/Topbar';
import { MdAdd, MdEdit, MdDelete, MdClose, MdSave, MdWarning } from 'react-icons/md';
import { GiMedal } from 'react-icons/gi';
import { useNotifications } from '../../contexts/NotificationContext';
import { medalService } from '../../services/medalService';
import { useAuth } from '../../contexts/AuthContext';

export default function ManageMedals() {
  const { sendNotification } = useNotifications();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [medals, setMedals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    type: 'operacao',
    icon: '🎖️',
    description: '',
    color: '#FFD700',
    criteria: ''
  });

  const medalTypes = [
    { id: 'operacao', label: 'Operação' },
    { id: 'tempo', label: 'Tempo de Serviço' },
    { id: 'honra', label: 'Honra ao Mérito' },
    { id: 'merito', label: 'Mérito Policial' },
    { id: 'bravura', label: 'Bravura' },
    { id: 'instrutor', label: 'Instrutor' },
    { id: 'melhor_mes', label: 'Destaque do Mês' },
  ];

  // Verificar permissão
  useEffect(() => {
    if (user?.patente) {
      const p = user.patente.toLowerCase();
      if (!['tenente_coronel', 'capitao', 'major'].includes(p)) {
        sendNotification("Acesso restrito.", "erro");
        navigate('/militar/dashboard');
      }
    }
  }, [user]);

  const loadMedals = async () => {
    setLoading(true);
    try {
      const data = await medalService.getMedals();
      setMedals(data);
    } catch (err) {
      sendNotification("Erro ao carregar medalhas", 'erro');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedals();
  }, []);

  const openModal = (medal = null) => {
    if (medal) {
      setEditingId(medal.id);
      setFormData({
        name: medal.name,
        type: medal.type,
        icon: medal.icon || '🎖️',
        description: medal.description || '',
        color: medal.color || '#FFD700',
        criteria: medal.criteria || ''
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        type: 'operacao',
        icon: '🎖️',
        description: '',
        color: '#FFD700',
        criteria: ''
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await medalService.updateMedal(editingId, formData);
        sendNotification("Medalha atualizada com sucesso!", 'sucesso');
      } else {
        await medalService.createMedal(formData);
        sendNotification("Medalha criada com sucesso!", 'sucesso');
      }
      closeModal();
      loadMedals();
    } catch (err) {
      console.error(err);
      sendNotification("Erro ao salvar medalha", 'erro');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja remover esta medalha?')) {
      try {
        await medalService.deleteMedal(id);
        sendNotification("Medalha removida com sucesso!", 'sucesso');
        loadMedals();
      } catch (err) {
        console.error(err);
        sendNotification("Erro ao remover medalha", 'erro');
      }
    }
  };

  return (
    <div className="animate-fadeIn pb-10">
      <Topbar title="GERENCIAR MEDALHAS" subtitle="Administração de Condecorações e Requisitos" />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-xl font-black text-gray-100 uppercase tracking-widest flex items-center gap-2">
            <GiMedal className="text-gold" /> Condecorações Oficiais
          </h2>
          <p className="text-xs text-gray-400 mt-1">Defina as medalhas disponíveis e os requisitos para obtenção.</p>
        </div>
        <button onClick={() => openModal()} className="btn-gold flex items-center gap-2">
          <MdAdd /> Criar Medalha
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <p className="text-gray-400">Carregando...</p>
        ) : medals.length === 0 ? (
          <p className="text-gray-500 italic">Nenhuma medalha encontrada.</p>
        ) : (
          medals.map(medal => (
            <div key={medal.id} className="mil-card flex flex-col h-full border-gray-800 hover:border-gold/30 transition-colors">
              <div className="flex items-start gap-4 mb-4">
                <div 
                  className="w-12 h-12 rounded-lg flex flex-shrink-0 items-center justify-center text-2xl bg-mil-black/50 border border-gray-800"
                  style={{ color: medal.color || '#FFD700', textShadow: `0 0 10px ${medal.color}40` }}
                >
                  {medal.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-200">{medal.name}</h3>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-gold bg-gold/10 px-2 py-0.5 rounded border border-gold/20 inline-block mt-1">
                    {medalTypes.find(t => t.id === medal.type)?.label || medal.type}
                  </span>
                </div>
              </div>
              
              <div className="flex-1">
                <p className="text-xs text-gray-400 mb-3">{medal.description}</p>
                <div className="bg-mil-black/30 p-2 border border-gray-800/50 rounded-lg">
                  <span className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">Critérios:</span>
                  <p className="text-xs text-gray-300 italic">{medal.criteria}</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-800 flex items-center justify-end gap-2">
                <button onClick={() => openModal(medal)} className="btn-secondary !py-1.5 !px-3 !text-xs flex items-center gap-1">
                  <MdEdit /> Editar
                </button>
                <button onClick={() => handleDelete(medal.id)} className="btn-danger !py-1.5 !px-3 !text-xs flex items-center gap-1">
                  <MdDelete />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-mil-dark border border-mil-border rounded-2xl w-full max-w-2xl shadow-2xl animate-scaleIn my-8">
            <div className="flex items-center justify-between p-6 border-b border-mil-border">
              <h3 className="text-lg font-black text-gray-100 uppercase tracking-widest flex items-center gap-2">
                <GiMedal className="text-gold text-2xl" /> 
                {editingId ? 'Editar Medalha' : 'Nova Medalha'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-white transition-colors">
                <MdClose size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Nome da Medalha</label>
                    <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="mil-input" required />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Categoria</label>
                    <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="mil-select" required>
                      {medalTypes.map(t => (
                        <option key={t.id} value={t.id}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Ícone (Emoji ou Símbolo)</label>
                    <input type="text" value={formData.icon} onChange={e => setFormData({...formData, icon: e.target.value})} className="mil-input" placeholder="🎖️, 🥇, ⭐..." required />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Cor Principal (HEX)</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} className="w-10 h-10 rounded cursor-pointer bg-transparent border-0 p-0" />
                      <input type="text" value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} className="mil-input flex-1" placeholder="#FFD700" required />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Descrição</label>
                  <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="mil-textarea" rows="2" required />
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Critérios de Obtenção</label>
                  <textarea value={formData.criteria} onChange={e => setFormData({...formData, criteria: e.target.value})} className="mil-textarea" rows="2" placeholder="Ex: Média 9.0 em todos os cursos" required />
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-800 flex items-center justify-end gap-3">
                <button type="button" onClick={closeModal} className="btn-secondary">Cancelar</button>
                <button type="submit" className="btn-gold flex items-center gap-2">
                  <MdSave /> {editingId ? 'Salvar Alterações' : 'Criar Medalha'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

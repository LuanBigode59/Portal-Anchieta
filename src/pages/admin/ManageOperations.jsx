import { useState, useEffect } from 'react';
import Topbar from '../../components/layout/Topbar';
import { MdMilitaryTech, MdAdd, MdEdit, MdDelete, MdClose, MdSave, MdPeople, MdAirportShuttle } from 'react-icons/md';
import { useNotifications } from '../../contexts/NotificationContext';
import { operationService } from '../../services/operationService';
import { signatureService } from '../../services/signatureService';

export default function ManageOperations() {
  const { sendNotification } = useNotifications();
  const [operations, setOperations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    nome: '',
    objetivo: '',
    equipe: [],
    viaturas: [],
    data: '',
    horario: '',
    resultado: '',
    fotos: [],
    status: 'ativa',
    relatorio: ''
  });

  const [memberInput, setMemberInput] = useState('');
  const [vehicleInput, setVehicleInput] = useState('');
  const [photoInput, setPhotoInput] = useState('');

  const loadOperations = async () => {
    setLoading(true);
    try {
      const data = await operationService.getOperations();
      setOperations(data);
    } catch (err) {
      sendNotification("Erro ao carregar operações", 'erro');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOperations();
  }, []);

  const openModal = (op = null) => {
    if (op) {
      setEditingId(op.id);
      setFormData({
        nome: op.nome,
        objetivo: op.objetivo || '',
        equipe: op.equipe || [],
        viaturas: op.viaturas || [],
        data: op.data,
        horario: op.horario,
        resultado: op.resultado || '',
        fotos: op.fotos || [],
        status: op.status || 'ativa',
        relatorio: op.relatorio || ''
      });
    } else {
      setEditingId(null);
      setFormData({
        nome: '', objetivo: '', equipe: [], viaturas: [],
        data: new Date().toISOString().split('T')[0],
        horario: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        resultado: '', fotos: [], status: 'ativa', relatorio: ''
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addEquipe = () => {
    if (memberInput.trim()) {
      setFormData({ ...formData, equipe: [...formData.equipe, memberInput.trim()] });
      setMemberInput('');
    }
  };

  const removeEquipe = (index) => {
    const newEquipe = [...formData.equipe];
    newEquipe.splice(index, 1);
    setFormData({ ...formData, equipe: newEquipe });
  };

  const addViatura = () => {
    if (vehicleInput.trim()) {
      setFormData({ ...formData, viaturas: [...formData.viaturas, vehicleInput.trim()] });
      setVehicleInput('');
    }
  };

  const removeViatura = (index) => {
    const newVias = [...formData.viaturas];
    newVias.splice(index, 1);
    setFormData({ ...formData, viaturas: newVias });
  };

  const addFoto = () => {
    if (photoInput.trim()) {
      setFormData({ ...formData, fotos: [...formData.fotos, photoInput.trim()] });
      setPhotoInput('');
    }
  };

  const removeFoto = (index) => {
    const newFotos = [...formData.fotos];
    newFotos.splice(index, 1);
    setFormData({ ...formData, fotos: newFotos });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await operationService.updateOperation(editingId, formData);
        sendNotification("Operação atualizada com sucesso!", 'sucesso');
      } else {
        await signatureService.createDocument({
          tipo: 'operacao',
          titulo: `Planejamento Operacional: ${formData.nome}`,
          dados: formData
        });
        sendNotification("Proposta de operação enviada para validação e assinatura do Comando Geral!", 'sucesso');
      }
      closeModal();
      loadOperations();
    } catch (err) {
      sendNotification(err.message, 'erro');
    }
  };

  const handleDelete = async (id, nome) => {
    if (window.confirm(`Tem certeza que deseja excluir a ${nome}?`)) {
      try {
        await operationService.deleteOperation(id);
        sendNotification("Operação excluída.", 'sucesso');
        loadOperations();
      } catch (err) {
        sendNotification(err.message, 'erro');
      }
    }
  };

  return (
    <div className="animate-fadeIn pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <Topbar title="GERENCIAR OPERAÇÕES" subtitle="Cadastrar e Acompanhar Operações" />
        <button 
          onClick={() => openModal()}
          className="btn-green self-start sm:self-auto flex items-center gap-2"
        >
          <MdAdd className="text-xl" /> Nova Operação
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="spinner" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {operations.map(op => (
            <div key={op.id} className="hero-card flex flex-col p-5 border border-gray-800">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold text-2xl">
                    <MdMilitaryTech />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-gray-100">{op.nome}</h3>
                    <p className="text-[10px] text-gray-500 font-mono">{new Date(op.data).toLocaleDateString('pt-BR')} • {op.horario}</p>
                  </div>
                </div>
                <span className={`badge-${op.status === 'ativa' ? 'green' : 'steel'} !text-[9px] !px-2 !py-0.5`}>
                  {op.status === 'ativa' ? 'Ativa' : 'Concluída'}
                </span>
              </div>

              <p className="text-xs text-gray-400 mb-4 line-clamp-2">{op.objetivo}</p>

              <div className="flex gap-4 mb-4 text-[10px] text-gray-500 font-mono">
                <span className="flex items-center gap-1"><MdPeople /> {op.equipe?.length || 0} Militares</span>
                <span className="flex items-center gap-1"><MdAirportShuttle /> {op.viaturas?.length || 0} Vtrs</span>
              </div>

              <div className="flex gap-2 justify-end border-t border-gray-800 pt-3 mt-auto">
                <button 
                  onClick={() => openModal(op)}
                  className="btn-secondary flex items-center gap-1 !text-[10px] !py-1.5 !px-3"
                >
                  <MdEdit /> Editar
                </button>
                <button 
                  onClick={() => handleDelete(op.id, op.nome)}
                  className="btn-danger flex items-center gap-1 !text-[10px] !py-1.5 !px-3 !bg-danger/20 !border-danger/40 hover:!bg-danger/40"
                >
                  <MdDelete /> Excluir
                </button>
              </div>
            </div>
          ))}
          {operations.length === 0 && (
            <div className="col-span-full py-20 text-center text-gray-600 bg-mil-black/20 rounded-xl border border-dashed border-gray-800">
              <MdMilitaryTech className="text-5xl mx-auto mb-3 text-gray-700" />
              <p>Nenhuma operação cadastrada no sistema.</p>
            </div>
          )}
        </div>
      )}

      {/* Modal Criar/Editar Operação */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-mil-dark border border-gray-800 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl animate-slideUp">
            <div className="flex justify-between items-center p-5 border-b border-gray-800 sticky top-0 bg-mil-dark z-20">
              <h2 className="text-lg font-black text-white flex items-center gap-2"><MdMilitaryTech className="text-gold" /> {editingId ? 'Editar Operação' : 'Nova Operação'}</h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-white transition-colors">
                <MdClose className="text-2xl" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Nome da Operação *</label>
                  <input type="text" name="nome" value={formData.nome} onChange={handleInputChange} required className="mil-input" placeholder="Ex: Operação Muro de Ferro" />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Objetivo / Missão</label>
                  <textarea name="objetivo" value={formData.objetivo} onChange={handleInputChange} className="mil-textarea" rows="2" placeholder="Descreva o foco da operação..." />
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Data *</label>
                  <input type="date" name="data" value={formData.data} onChange={handleInputChange} required className="mil-input" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Horário *</label>
                  <input type="text" name="horario" value={formData.horario} onChange={handleInputChange} required className="mil-input" placeholder="Ex: 20:00" />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Resultado Geral</label>
                  <input type="text" name="resultado" value={formData.resultado} onChange={handleInputChange} className="mil-input" placeholder="Ex: Sucesso / Em andamento" />
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Status *</label>
                  <select name="status" value={formData.status} onChange={handleInputChange} className="mil-select">
                    <option value="ativa">Ativa / Planejada</option>
                    <option value="concluida">Concluída</option>
                  </select>
                </div>

                {/* Equipe */}
                <div className="md:col-span-2 bg-[#0c0c0c] p-4 rounded-xl border border-gray-800">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Membros da Equipe</label>
                  <div className="flex gap-2 mb-3">
                    <input type="text" value={memberInput} onChange={(e) => setMemberInput(e.target.value)} className="mil-input flex-1" placeholder="Ex: Sargento Silva" />
                    <button type="button" onClick={addEquipe} className="btn-gold !py-2 !px-4 !text-xs">Adicionar</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.equipe.map((member, idx) => (
                      <span key={idx} className="bg-mil-black text-gray-300 text-xs px-2.5 py-1 rounded-full border border-gray-800 flex items-center gap-1.5">
                        {member}
                        <button type="button" onClick={() => removeEquipe(idx)} className="text-red-500 font-bold">×</button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Viaturas */}
                <div className="md:col-span-2 bg-[#0c0c0c] p-4 rounded-xl border border-gray-800">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Viaturas Escaladas</label>
                  <div className="flex gap-2 mb-3">
                    <input type="text" value={vehicleInput} onChange={(e) => setVehicleInput(e.target.value)} className="mil-input flex-1" placeholder="Ex: CHOQUE 05 (Troller)" />
                    <button type="button" onClick={addViatura} className="btn-gold !py-2 !px-4 !text-xs">Adicionar</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.viaturas.map((vtr, idx) => (
                      <span key={idx} className="bg-mil-black text-gray-300 text-xs px-2.5 py-1 rounded-full border border-gray-800 flex items-center gap-1.5">
                        {vtr}
                        <button type="button" onClick={() => removeViatura(idx)} className="text-red-500 font-bold">×</button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Fotos */}
                <div className="md:col-span-2 bg-[#0c0c0c] p-4 rounded-xl border border-gray-800">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Fotos da Operação (Links das Imagens)</label>
                  <div className="flex gap-2 mb-3">
                    <input type="url" value={photoInput} onChange={(e) => setPhotoInput(e.target.value)} className="mil-input flex-1" placeholder="https://imgur.com/..." />
                    <button type="button" onClick={addFoto} className="btn-gold !py-2 !px-4 !text-xs">Adicionar</button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {formData.fotos.map((foto, idx) => (
                      <div key={idx} className="relative h-20 bg-cover bg-center rounded-lg border border-gray-800 group" style={{ backgroundImage: `url(${foto})` }}>
                        <button type="button" onClick={() => removeFoto(idx)} className="absolute top-1 right-1 bg-black/80 rounded-full w-5 h-5 flex items-center justify-center text-red-500 font-bold text-xs">×</button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Relatório Tático Completo</label>
                  <textarea name="relatorio" value={formData.relatorio} onChange={handleInputChange} className="mil-textarea" rows="4" placeholder="Descreva os incidentes, materiais apreendidos, etc..." />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 sticky bottom-0 bg-mil-dark pb-2 border-t border-gray-800">
                <button type="button" onClick={closeModal} className="btn-secondary !text-xs">Cancelar</button>
                <button type="submit" className="btn-green flex items-center gap-2 !text-xs"><MdSave /> Salvar Operação</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

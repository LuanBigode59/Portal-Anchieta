import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Topbar from '../../components/layout/Topbar';
import { ranks } from '../../data/ranks';
import { userService } from '../../services/userService';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { MdArrowBack, MdSave } from 'react-icons/md';

export default function AddMilitar() {
  const { userRankLevel } = useAuth();
  const navigate = useNavigate();
  const { sendNotification } = useNotifications();

  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    patente: 'soldado_segunda',
    companhia: 'Comando',
    discord: '',
    observacoes: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const novo = await userService.addMilitar({
        ...formData,
        dataIngresso: new Date().toISOString().split('T')[0]
      });
      sendNotification(`Militar ${novo.nome} cadastrado com sucesso!`, 'sucesso');
      navigate('/admin/policiais');
    } catch (err) {
      sendNotification(err.message, 'erro');
    }
  };

  return (
    <div className="animate-fadeIn pb-10">
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => navigate('/admin/policiais')}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-mil-black border border-gray-800 text-gray-400 hover:text-gold hover:border-gold/30 transition-colors"
        >
          <MdArrowBack className="text-xl" />
        </button>
        <Topbar title="CADASTRAR MILITAR" subtitle="Adicionar Efetivo ao Batalhão" />
      </div>

      <div className="mil-card max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Nome de RP (Roleplay)</label>
              <input 
                type="text" 
                required
                value={formData.nome}
                onChange={e => setFormData({...formData, nome: e.target.value})}
                className="mil-input" 
                placeholder="Ex: João Pedro" 
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Passaporte / ID / Matrícula</label>
              <input 
                type="text" 
                required
                value={formData.cpf}
                onChange={e => setFormData({...formData, cpf: e.target.value})}
                className="mil-input" 
                placeholder="Ex: 25256" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Patente Inicial</label>
              <select 
                value={formData.patente}
                onChange={e => setFormData({...formData, patente: e.target.value})}
                className="mil-select"
              >
                {ranks.map(r => (
                  <option 
                    key={r.id} 
                    value={r.id}
                    disabled={r.level >= userRankLevel}
                  >
                    {r.insignia} {r.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Companhia Designada</label>
              <select 
                value={formData.companhia}
                onChange={e => setFormData({...formData, companhia: e.target.value})}
                className="mil-select"
              >
                <option>Comando</option>
                <option>Equipe Guardião</option>
                <option>Rocam</option>
                <option>Operacional</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">WhatsApp *</label>
            <input 
              type="tel" 
              required
              value={formData.discord}
              onChange={e => setFormData({...formData, discord: e.target.value})}
              className="mil-input" 
              placeholder="Ex: (11) 99999-9999" 
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Observações Iniciais</label>
            <textarea 
              value={formData.observacoes}
              onChange={e => setFormData({...formData, observacoes: e.target.value})}
              className="mil-textarea" 
              rows={4} 
              placeholder="Anotações sobre recrutamento, recomendações..."
            />
          </div>

          <div className="pt-4 border-t border-gray-800 flex justify-end gap-4">
            <button type="button" onClick={() => navigate('/admin/policiais')} className="btn-steel">Cancelar</button>
            <button type="submit" className="btn-green flex items-center gap-2">
              <MdSave className="text-xl" /> Concluir Cadastro
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

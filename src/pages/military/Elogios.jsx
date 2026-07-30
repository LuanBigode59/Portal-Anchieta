import React, { useState, useEffect } from 'react';
import Topbar from '../../components/layout/Topbar';
import { MdThumbUp, MdSend, MdPerson } from 'react-icons/md';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { userService } from '../../services/userService';

export default function Elogios() {
  const { user } = useAuth();
  const { sendNotification } = useNotifications();
  const [elogios, setElogios] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    destinatario_id: '',
    mensagem: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [elogiosData, usersData] = await Promise.all([
        supabase.from('elogios').select('*').order('created_at', { ascending: false }),
        userService.getUsers()
      ]);

      if (elogiosData.error) throw elogiosData.error;

      // Note: Because auth.users is not queryable directly by RLS usually, 
      // we might need to join with our public profiles or manually map user names if the join fails.
      // Assuming usersData contains the full list of military personnel.
      
      setUsers(usersData);
      
      // Map names manually if the join didn't work as expected
      const enrichedElogios = (elogiosData.data || []).map(e => {
        const rem = usersData.find(u => u.id === e.remetente_id);
        const dest = usersData.find(u => u.id === e.destinatario_id);
        return {
          ...e,
          remetente_nome: rem ? `${rem.patente} ${rem.nome}` : 'Militar Desconhecido',
          destinatario_nome: dest ? `${dest.patente} ${dest.nome}` : 'Militar Desconhecido',
          remetente_foto: rem?.foto_url,
          destinatario_foto: dest?.foto_url,
        };
      });

      setElogios(enrichedElogios);
    } catch (error) {
      console.error(error);
      sendNotification('Erro ao carregar elogios', 'erro');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.destinatario_id || !formData.mensagem) {
      sendNotification('Preencha todos os campos', 'erro');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.from('elogios').insert([{
        remetente_id: user.id,
        destinatario_id: formData.destinatario_id,
        mensagem: formData.mensagem
      }]);

      if (error) throw error;
      
      sendNotification('Elogio enviado com sucesso!', 'sucesso');
      setFormData({ destinatario_id: '', mensagem: '' });
      loadData();
    } catch (error) {
      console.error(error);
      sendNotification('Erro ao enviar elogio', 'erro');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-fadeIn pb-10">
      <Topbar title="ELOGIOS" subtitle="Mural de Reconhecimento" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Formulário */}
        <div className="lg:col-span-1">
          <div className="mil-card sticky top-6">
            <h3 className="text-sm font-black text-gray-200 uppercase tracking-widest mb-4 flex items-center gap-2">
              <MdThumbUp className="text-gold" /> Enviar Elogio
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Para quem?</label>
                <select 
                  required
                  value={formData.destinatario_id}
                  onChange={(e) => setFormData({...formData, destinatario_id: e.target.value})}
                  className="mil-input"
                >
                  <option value="">Selecione um militar...</option>
                  {users.filter(u => u.id !== user?.id && u.status === 'Ativo').map(u => (
                    <option key={u.id} value={u.id}>{u.patente} {u.nome}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Mensagem</label>
                <textarea 
                  required
                  value={formData.mensagem}
                  onChange={(e) => setFormData({...formData, mensagem: e.target.value})}
                  className="mil-textarea"
                  rows="4"
                  placeholder="Escreva seu elogio aqui..."
                />
              </div>

              <button type="submit" disabled={saving} className="btn-gold w-full flex justify-center items-center gap-2">
                {saving ? 'Enviando...' : <><MdSend /> Publicar Elogio</>}
              </button>
            </form>
          </div>
        </div>

        {/* Mural */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="flex justify-center py-10"><div className="spinner" /></div>
          ) : elogios.length === 0 ? (
            <div className="mil-card text-center py-12 text-gray-500">
              <MdThumbUp className="text-4xl mx-auto mb-3 opacity-50" />
              <p>Nenhum elogio registrado ainda. Seja o primeiro!</p>
            </div>
          ) : (
            elogios.map(elogio => (
              <div key={elogio.id} className="mil-card border border-mil-border hover:border-gold/30 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 relative">
                    {elogio.destinatario_foto ? (
                      <img src={elogio.destinatario_foto} alt="Avatar" className="w-12 h-12 rounded-xl object-cover border border-gold/30" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-mil-black flex items-center justify-center border border-gold/30 text-gold">
                        <MdPerson size={24} />
                      </div>
                    )}
                    <div className="absolute -bottom-2 -right-2 bg-gold text-[#111] w-6 h-6 rounded-full flex items-center justify-center border-2 border-mil-dark">
                      <MdThumbUp size={12} />
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="text-sm font-black text-gray-100">{elogio.destinatario_nome}</h4>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                          Elogiado por {elogio.remetente_nome}
                        </p>
                      </div>
                      <span className="text-[10px] text-gray-600 font-mono">
                        {new Date(elogio.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    
                    <div className="bg-mil-black/50 p-4 rounded-xl border border-mil-border mt-3 relative">
                      <div className="absolute top-0 left-4 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[6px] border-b-mil-border -mt-[6px]"></div>
                      <div className="absolute top-[1px] left-4 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[6px] border-b-mil-black/50 -mt-[5px]"></div>
                      <p className="text-sm text-gray-300 italic">"{elogio.mensagem}"</p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import Topbar from '../../components/layout/Topbar';
import { MdLightbulb, MdSend, MdVisibilityOff } from 'react-icons/md';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { userService } from '../../services/userService';

export default function Sugestoes() {
  const { user, isOfficer } = useAuth();
  const { sendNotification } = useNotifications();
  const [sugestoes, setSugestoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    mensagem: '',
    anonimo: false
  });

  useEffect(() => {
    if (isOfficer) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [isOfficer]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sugestoesData, usersData] = await Promise.all([
        supabase.from('sugestoes').select('*').order('created_at', { ascending: false }),
        userService.getAllUsers()
      ]);

      if (sugestoesData.error) throw sugestoesData.error;
      
      const enriched = (sugestoesData.data || []).map(r => {
        const autor = usersData.find(u => u.id === r.autor_id);
        return {
          ...r,
          autor_nome: autor ? `${autor.patente} ${autor.nome}` : 'Desconhecido'
        };
      });

      setSugestoes(enriched);
    } catch (error) {
      console.error(error);
      sendNotification('Erro ao carregar sugestões', 'erro');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.mensagem) {
      sendNotification('Preencha a mensagem', 'erro');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.from('sugestoes').insert([{
        autor_id: user.id,
        mensagem: formData.anonimo ? '__ANONIMO__' + formData.mensagem : formData.mensagem,
        status: 'pendente'
      }]);

      if (error) throw error;
      
      sendNotification('Sugestão enviada com sucesso!', 'sucesso');
      setFormData({ mensagem: '', anonimo: false });
      if (isOfficer) loadData();
    } catch (error) {
      console.error(error);
      sendNotification('Erro ao enviar sugestão', 'erro');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-fadeIn pb-10">
      <Topbar title="SUGESTÕES" subtitle="Ajude a Melhorar o Batalhão" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
        {/* Formulário */}
        <div>
          <div className="mil-card">
            <h3 className="text-sm font-black text-gray-200 uppercase tracking-widest mb-4 flex items-center gap-2">
              <MdLightbulb className="text-gold" /> Enviar Sugestão
            </h3>
            
            <p className="text-xs text-gray-400 mb-6 leading-relaxed">
              Toda ideia para melhorar nosso Batalhão é bem-vinda. Envie sugestões de novos cursos, melhorias na base ou ideias para operações.
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Sua Ideia</label>
                <textarea 
                  required
                  value={formData.mensagem}
                  onChange={(e) => setFormData({...formData, mensagem: e.target.value})}
                  className="mil-textarea"
                  rows="6"
                  placeholder="Descreva sua sugestão..."
                />
              </div>

              <div className="flex items-center gap-3 bg-mil-black/50 p-4 rounded-xl border border-mil-border">
                <input 
                  type="checkbox" 
                  id="anonimo"
                  checked={formData.anonimo}
                  onChange={(e) => setFormData({...formData, anonimo: e.target.checked})}
                  className="w-4 h-4 rounded border-gray-700 text-gold focus:ring-gold bg-[#111]"
                />
                <label htmlFor="anonimo" className="text-sm font-bold text-gray-300 flex items-center gap-2 cursor-pointer">
                  <MdVisibilityOff /> Enviar Anonimamente
                </label>
              </div>

              <button type="submit" disabled={saving} className="btn-gold w-full flex justify-center items-center gap-2">
                {saving ? 'Enviando...' : <><MdSend /> Enviar Ideia</>}
              </button>
            </form>
          </div>
        </div>

        {/* Lista (Apenas Oficiais) */}
        {isOfficer && (
          <div className="space-y-4">
            <h3 className="text-sm font-black text-gray-200 uppercase tracking-widest mb-4 flex items-center gap-2">
              <MdLightbulb className="text-gray-400" /> Caixa de Sugestões (Acesso Restrito)
            </h3>
            
            {loading ? (
              <div className="flex justify-center py-10"><div className="spinner" /></div>
            ) : sugestoes.length === 0 ? (
              <div className="mil-card text-center py-12 text-gray-500">
                <p>Nenhuma sugestão recebida ainda.</p>
              </div>
            ) : (
              sugestoes.map(sug => (
                <div key={sug.id} className="mil-card border border-mil-border">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gold bg-gold/10 px-2 py-1 rounded border border-gold/20">
                      {sug.mensagem.startsWith('__ANONIMO__') 
                        ? (['tenente_coronel', 'tenente-coronel'].includes(user?.cargo?.toLowerCase()) || ['tenente_coronel', 'tenente-coronel'].includes(user?.patente?.toLowerCase()) 
                            ? `Anônima (${sug.autor_nome})` 
                            : 'Anônima') 
                        : `Identificada (${sug.autor_nome})`}
                    </span>
                    <span className="text-[10px] text-gray-600 font-mono">
                      {new Date(sug.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 whitespace-pre-wrap">{sug.mensagem.replace('__ANONIMO__', '')}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

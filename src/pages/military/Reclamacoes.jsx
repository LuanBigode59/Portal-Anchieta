import React, { useState, useEffect } from 'react';
import Topbar from '../../components/layout/Topbar';
import { MdFeedback, MdSend, MdVisibilityOff } from 'react-icons/md';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { userService } from '../../services/userService';

export default function Reclamacoes() {
  const { user, isOfficer } = useAuth();
  const { sendNotification } = useNotifications();
  const [reclamacoes, setReclamacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    mensagem: '',
    anonimo: true
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
      const [reclamacoesData, usersData] = await Promise.all([
        supabase.from('reclamacoes').select('*').order('created_at', { ascending: false }),
        userService.getAllUsers()
      ]);

      if (reclamacoesData.error) throw reclamacoesData.error;
      
      const enriched = (reclamacoesData.data || []).map(r => {
        const autor = usersData.find(u => u.id === r.autor_id);
        return {
          ...r,
          autor_nome: autor ? `${autor.patente} ${autor.nome}` : 'Desconhecido'
        };
      });

      setReclamacoes(enriched);
    } catch (error) {
      console.error(error);
      sendNotification('Erro ao carregar reclamações', 'erro');
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
      const { error } = await supabase.from('reclamacoes').insert([{
        autor_id: user.id,
        mensagem: formData.anonimo ? '__ANONIMO__' + formData.mensagem : formData.mensagem,
        status: 'pendente'
      }]);

      if (error) throw error;
      
      sendNotification('Reclamação enviada com sucesso!', 'sucesso');
      setFormData({ mensagem: '', anonimo: true });
      if (isOfficer) loadData();
    } catch (error) {
      console.error(error);
      sendNotification('Erro ao enviar reclamação', 'erro');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-fadeIn pb-10">
      <Topbar title="RECLAMAÇÕES" subtitle="Canal de Comunicação" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
        {/* Formulário */}
        <div>
          <div className="mil-card">
            <h3 className="text-sm font-black text-gray-200 uppercase tracking-widest mb-4 flex items-center gap-2">
              <MdFeedback className="text-danger-light" /> Enviar Reclamação
            </h3>
            
            <p className="text-xs text-gray-400 mb-6 leading-relaxed">
              Utilize este espaço para reportar problemas estruturais, comportamentais ou administrativos. As reclamações são enviadas diretamente ao Comando.
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Detalhes da Reclamação</label>
                <textarea 
                  required
                  value={formData.mensagem}
                  onChange={(e) => setFormData({...formData, mensagem: e.target.value})}
                  className="mil-textarea"
                  rows="6"
                  placeholder="Descreva a situação..."
                />
              </div>

              <div className="flex items-center gap-3 bg-mil-black/50 p-4 rounded-xl border border-mil-border">
                <input 
                  type="checkbox" 
                  id="anonimo"
                  checked={formData.anonimo}
                  onChange={(e) => setFormData({...formData, anonimo: e.target.checked})}
                  className="w-4 h-4 rounded border-gray-700 text-danger focus:ring-danger bg-[#111]"
                />
                <label htmlFor="anonimo" className="text-sm font-bold text-gray-300 flex items-center gap-2 cursor-pointer">
                  <MdVisibilityOff /> Enviar Anonimamente
                </label>
              </div>

              <button type="submit" disabled={saving} className="btn-danger w-full flex justify-center items-center gap-2">
                {saving ? 'Enviando...' : <><MdSend /> Enviar ao Comando</>}
              </button>
            </form>
          </div>
        </div>

        {/* Lista (Apenas Oficiais) */}
        {isOfficer && (
          <div className="space-y-4">
            <h3 className="text-sm font-black text-gray-200 uppercase tracking-widest mb-4 flex items-center gap-2">
              <MdFeedback className="text-gray-400" /> Caixa de Reclamações (Acesso Restrito)
            </h3>
            
            {loading ? (
              <div className="flex justify-center py-10"><div className="spinner" /></div>
            ) : reclamacoes.length === 0 ? (
              <div className="mil-card text-center py-12 text-gray-500">
                <p>Nenhuma reclamação recebida.</p>
              </div>
            ) : (
              reclamacoes.map(rec => (
                <div key={rec.id} className="mil-card border border-mil-border">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-danger-light bg-danger/10 px-2 py-1 rounded border border-danger/20">
                      {rec.mensagem.startsWith('__ANONIMO__') 
                        ? (['tenente_coronel', 'tenente-coronel'].includes(user?.cargo?.toLowerCase()) || ['tenente_coronel', 'tenente-coronel'].includes(user?.patente?.toLowerCase()) 
                            ? `Anônima (${rec.autor_nome})` 
                            : 'Anônima') 
                        : `Identificada (${rec.autor_nome})`}
                    </span>
                    <span className="text-[10px] text-gray-600 font-mono">
                      {new Date(rec.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 whitespace-pre-wrap">{rec.mensagem.replace('__ANONIMO__', '')}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../supabaseClient';
import { MdWarning, MdSave, MdPhone } from 'react-icons/md';
import { FaWhatsapp } from 'react-icons/fa';

export default function WhatsAppBanner() {
  const { user } = useAuth();
  const [whatsapp, setWhatsapp] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Não exibe se o usuário já tem WhatsApp cadastrado
  if (!user || user.discord) return null;
  if (saved) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    if (!whatsapp.trim()) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ discord: whatsapp.trim() })
        .eq('id', user.id);

      if (error) throw error;

      // Atualiza o objeto user local para sumir o banner
      user.discord = whatsapp.trim();
      setSaved(true);
    } catch (err) {
      console.error('Erro ao salvar WhatsApp:', err);
      alert('Erro ao salvar o número. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-yellow-500/40 bg-[#0a0a0a] shadow-[0_0_50px_rgba(234,179,8,0.15)]">
        
        {/* Glowing background effects */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-500/5 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-600"></div>

        <div className="relative z-10 p-8 sm:p-10">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-20 h-20 rounded-full bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20 shadow-[0_0_20px_rgba(234,179,8,0.2)] mb-6 relative">
              <div className="absolute inset-0 rounded-full border border-yellow-500/30 animate-ping" style={{ animationDuration: '3s' }}></div>
              <FaWhatsapp className="w-10 h-10 text-green-400 drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
            </div>
            
            <h2 className="text-2xl font-black text-white tracking-tight mb-3">
              Ação Necessária
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              Para continuar utilizando o Portal Oficial, é obrigatório cadastrar o seu número de <strong className="text-green-400">WhatsApp</strong>. Ele será utilizado para comunicados oficiais do Comando.
            </p>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="relative">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 text-left">
                Seu Número de WhatsApp
              </label>
              <div className="relative">
                <MdPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-xl" />
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="(11) 99999-9999"
                  required
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-black/60 border border-white/10 text-white placeholder-gray-600 focus:border-green-500/50 focus:outline-none focus:ring-1 focus:ring-green-500/30 transition-all text-base font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving || !whatsapp.trim()}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-black text-sm uppercase tracking-[0.2em] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] border border-green-400/30"
            >
              {saving ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <MdSave className="text-xl" />
                  Confirmar Número
                </>
              )}
            </button>
          </form>
          
          <div className="mt-6 flex items-start gap-3 p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/10">
            <MdWarning className="text-yellow-500 text-lg flex-shrink-0 mt-0.5" />
            <p className="text-[10px] text-yellow-500/80 leading-relaxed uppercase tracking-wider font-bold">
              O acesso ao sistema está bloqueado até o preenchimento deste campo obrigatório.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

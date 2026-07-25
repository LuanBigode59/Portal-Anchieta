import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { fardamentoService } from '../../services/fardamentoService';
import { cargoLabels, ranks, cargoBadgeClass } from '../../data/ranks';
import { 
  MdAdd, MdContentCopy, MdClose, MdRefresh, MdImage, MdCheck, MdDelete
} from 'react-icons/md';

export default function Fardamentos() {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [fardamentos, setFardamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [patenteSelecionada, setPatenteSelecionada] = useState('');
  const [descricao, setDescricao] = useState('');
  const [foto, setFoto] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);

  // Checks
  const canAddFardamento = user && ['primeiro_tenente', 'capitao', 'major', 'tenente_coronel'].includes(user.cargo);

  const loadFardamentos = async () => {
    try {
      setLoading(true);
      const data = await fardamentoService.obterFardamentos();
      setFardamentos(data);
    } catch (error) {
      console.error(error);
      addNotification('erro', 'Erro ao carregar fardamentos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFardamentos();
  }, []);

  const handleCopy = (descricao) => {
    navigator.clipboard.writeText(descricao)
      .then(() => {
        setToastMessage('Fardamento copiado');
        setTimeout(() => setToastMessage(''), 3000);
      })
      .catch(() => {
        setToastMessage('Erro ao copiar');
        setTimeout(() => setToastMessage(''), 3000);
      });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!patenteSelecionada || !descricao || !foto) {
      addNotification('erro', 'Preencha todos os campos e anexe uma foto.');
      return;
    }

    try {
      setSaving(true);
      // Upload
      const fotoUrl = await fardamentoService.uploadFotoFardamento(foto);
      
      // Save record
      await fardamentoService.adicionarFardamento({
        patente: patenteSelecionada,
        descricao,
        foto_url: fotoUrl,
        created_by: user.id
      });
      
      addNotification('sucesso', 'Fardamento adicionado com sucesso!');
      setIsModalOpen(false);
      
      // Reset form
      setPatenteSelecionada('');
      setDescricao('');
      setFoto(null);
      setFotoPreview(null);
      
      // Refresh
      loadFardamentos();
    } catch (error) {
      console.error(error);
      addNotification('erro', 'Erro ao salvar o fardamento.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, fotoUrl) => {
    if (!window.confirm('Tem certeza que deseja deletar este fardamento?')) return;
    try {
      setLoading(true);
      await fardamentoService.deletarFardamento(id, fotoUrl);
      addNotification('sucesso', 'Fardamento deletado com sucesso.');
      loadFardamentos();
    } catch (error) {
      console.error(error);
      addNotification('erro', 'Erro ao deletar fardamento.');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gold to-yellow-200 tracking-tight mb-2">
            Fardamentos
          </h1>
          <p className="text-gray-400 font-medium tracking-wide">
            Galeria oficial de uniformes do Batalhão
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={loadFardamentos}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-gold hover:border-gold/30 hover:bg-gold/5 transition-all font-bold text-sm uppercase tracking-widest disabled:opacity-50"
          >
            <MdRefresh className={`text-lg ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
          
          {canAddFardamento && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-gold to-yellow-600 text-[#111] font-black tracking-widest uppercase hover:brightness-110 shadow-[0_0_20px_rgba(201,168,76,0.3)] transition-all"
            >
              <MdAdd className="text-xl" />
              Novo
            </button>
          )}
        </div>
      </header>

      {loading && fardamentos.length === 0 ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-16 h-16 border-4 border-gold/30 border-t-gold rounded-full animate-spin"></div>
        </div>
      ) : fardamentos.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] bg-black/40 rounded-[2rem] border border-white/5">
          <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/10">
            <MdImage className="text-4xl text-gray-500" />
          </div>
          <p className="text-xl font-bold text-gray-300">Nenhum fardamento cadastrado</p>
          <p className="text-gray-500 mt-2">Aguarde os oficiais adicionarem os modelos.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {fardamentos.map((f) => {
            const isUserRank = user?.cargo === f.patente;
            
            return (
              <div key={f.id} className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-[2rem] overflow-hidden flex flex-col hover:border-gold/30 transition-all duration-300 group shadow-lg">
                
                {/* Header Rank */}
                <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`${cargoBadgeClass[f.patente] || 'badge-steel'}`}>
                      {cargoLabels[f.patente] || f.patente}
                    </span>
                  </div>
                  {canAddFardamento && (
                    <button
                      onClick={() => handleDelete(f.id, f.foto_url)}
                      className="text-gray-500 hover:text-red-400 transition-colors p-2 rounded-full hover:bg-white/5"
                      title="Deletar Fardamento"
                    >
                      <MdDelete size={18} />
                    </button>
                  )}
                </div>

                {/* Photo */}
                <div className="relative h-[400px] bg-black/80 flex items-center justify-center group-hover:bg-black/50 transition-colors">
                  {f.foto_url ? (
                    <img 
                      src={f.foto_url} 
                      alt={`Fardamento ${cargoLabels[f.patente]}`}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <MdImage className="text-6xl text-gray-600" />
                  )}
                </div>

                {/* Description & Action */}
                <div className="p-6 flex flex-col flex-1 border-t border-white/10">
                  <div className="mt-auto">
                    {isUserRank ? (
                      <button
                        onClick={() => handleCopy(f.descricao)}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-[#111] font-black uppercase tracking-widest hover:brightness-110 shadow-[0_0_15px_rgba(34,197,94,0.3)] transition-all"
                      >
                        <MdContentCopy size={18} />
                        Copiar Fardamento
                      </button>
                    ) : (
                      <div className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-center flex items-center justify-center gap-2 text-gray-500 cursor-not-allowed">
                        <MdCheck size={18} className="text-gray-600" />
                        <span className="text-[10px] uppercase font-bold tracking-widest">
                          Apenas para {cargoLabels[f.patente]}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal Adicionar Fardamento */}
      {isModalOpen && canAddFardamento && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#111] border border-white/10 w-full max-w-xl rounded-[2rem] shadow-2xl flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-black/40 rounded-t-[2rem]">
              <h2 className="text-xl font-black text-gold uppercase tracking-widest">
                Novo Fardamento
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <MdClose />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
              
              {/* Patente */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                  Patente
                </label>
                <select
                  required
                  value={patenteSelecionada}
                  onChange={(e) => setPatenteSelecionada(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-gray-200 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-all appearance-none"
                >
                  <option value="">Selecione uma patente...</option>
                  {ranks.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>

              {/* Foto */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                  Foto do Fardamento
                </label>
                <div className="relative w-full h-40 bg-black/50 border-2 border-dashed border-white/10 rounded-xl flex items-center justify-center overflow-hidden hover:border-gold/30 transition-colors group cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    required
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                  {fotoPreview ? (
                    <img src={fotoPreview} alt="Preview" className="w-full h-full object-contain" />
                  ) : (
                    <div className="text-center">
                      <MdImage className="text-4xl text-gray-600 mx-auto mb-2 group-hover:text-gold/60 transition-colors" />
                      <p className="text-xs text-gray-500 font-medium">Clique para enviar imagem</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                  Texto do Fardamento
                </label>
                <textarea
                  required
                  rows="4"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Cole aqui o texto do fardamento que será copiado..."
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-gray-200 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-all font-mono text-sm resize-none"
                ></textarea>
              </div>

              {/* Submit */}
              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-gold to-yellow-600 text-[#111] font-black tracking-widest uppercase hover:brightness-110 shadow-[0_0_20px_rgba(201,168,76,0.3)] transition-all disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-[#111]/30 border-t-[#111] rounded-full animate-spin"></div>
                      Salvando...
                    </>
                  ) : (
                    'Salvar Fardamento'
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-6 bg-gradient-to-r from-green-500 to-emerald-600 border border-green-400/30 text-[#111] px-6 py-4 rounded-xl shadow-[0_0_30px_rgba(34,197,94,0.4)] z-[9999] animate-fade-in flex items-center gap-3 font-black tracking-wider backdrop-blur-md">
          <div className="w-8 h-8 rounded-full bg-[#111]/20 flex items-center justify-center">
            <MdCheck className="text-xl text-[#111]" />
          </div>
          {toastMessage}
        </div>
      )}

    </div>
  );
}

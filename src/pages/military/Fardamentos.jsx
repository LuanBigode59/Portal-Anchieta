import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { fardamentoService } from '../../services/fardamentoService';
import { cargoLabels, ranks, cargoBadgeClass } from '../../data/ranks';
import { 
  MdAdd, MdContentCopy, MdClose, MdRefresh, MdImage, MdCheck, MdDelete
} from 'react-icons/md';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

export default function Fardamentos() {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [fardamentos, setFardamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // View Image Modal
  const [viewImage, setViewImage] = useState(null);
  
  // Form state
  const [tipoFardamento, setTipoFardamento] = useState('patente');
  const [patenteSelecionada, setPatenteSelecionada] = useState('');
  const [nomeCustomizado, setNomeCustomizado] = useState('');
  const [descricao, setDescricao] = useState('');
  
  const [fotos, setFotos] = useState({
    frente: null,
    ladoDireito: null,
    ladoEsquerdo: null,
    costas: null
  });
  const [fotosPreview, setFotosPreview] = useState({
    frente: null,
    ladoDireito: null,
    ladoEsquerdo: null,
    costas: null
  });

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

  const handleFileChange = (e, key) => {
    const file = e.target.files[0];
    if (file) {
      setFotos(prev => ({ ...prev, [key]: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotosPreview(prev => ({ ...prev, [key]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (tipoFardamento === 'patente' && !patenteSelecionada) {
      addNotification('erro', 'Selecione uma patente.');
      return;
    }
    if (tipoFardamento === 'custom' && !nomeCustomizado) {
      addNotification('erro', 'Digite o nome do fardamento.');
      return;
    }
    if (!descricao) {
      addNotification('erro', 'Preencha a descrição do fardamento.');
      return;
    }
    if (!fotos.frente && !fotos.ladoDireito && !fotos.ladoEsquerdo && !fotos.costas) {
      addNotification('erro', 'Anexe pelo menos uma foto.');
      return;
    }

    try {
      setSaving(true);
      
      // Upload
      const uploadPromises = [
        fotos.frente ? fardamentoService.uploadFotoFardamento(fotos.frente) : Promise.resolve(null),
        fotos.ladoDireito ? fardamentoService.uploadFotoFardamento(fotos.ladoDireito) : Promise.resolve(null),
        fotos.ladoEsquerdo ? fardamentoService.uploadFotoFardamento(fotos.ladoEsquerdo) : Promise.resolve(null),
        fotos.costas ? fardamentoService.uploadFotoFardamento(fotos.costas) : Promise.resolve(null)
      ];
      
      const [urlFrente, urlLadoDireito, urlLadoEsquerdo, urlCostas] = await Promise.all(uploadPromises);
      
      // Save record
      await fardamentoService.adicionarFardamento({
        patente: tipoFardamento === 'patente' ? patenteSelecionada : null,
        nome: tipoFardamento === 'custom' ? nomeCustomizado : null,
        descricao,
        foto_url: urlFrente,
        foto_lado_direito: urlLadoDireito,
        foto_lado_esquerdo: urlLadoEsquerdo,
        foto_costas: urlCostas,
        created_by: user.id
      });
      
      addNotification('sucesso', 'Fardamento adicionado com sucesso!');
      setIsModalOpen(false);
      
      // Reset form
      setTipoFardamento('patente');
      setPatenteSelecionada('');
      setNomeCustomizado('');
      setDescricao('');
      setFotos({ frente: null, ladoDireito: null, ladoEsquerdo: null, costas: null });
      setFotosPreview({ frente: null, ladoDireito: null, ladoEsquerdo: null, costas: null });
      
      // Refresh
      loadFardamentos();
    } catch (error) {
      console.error(error);
      addNotification('erro', 'Erro ao salvar o fardamento.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, f) => {
    if (!window.confirm('Tem certeza que deseja deletar este fardamento?')) return;
    try {
      setLoading(true);
      const allUrls = [f.foto_url, f.foto_lado_direito, f.foto_lado_esquerdo, f.foto_costas].filter(Boolean);
      await fardamentoService.deletarFardamento(id, allUrls);
      addNotification('sucesso', 'Fardamento deletado com sucesso.');
      loadFardamentos();
    } catch (error) {
      console.error(error);
      addNotification('erro', 'Erro ao deletar fardamento.');
      setLoading(false);
    }
  };

  const renderPhotoInput = (key, label) => (
    <div className="flex-1 min-w-[140px]">
      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
        {label}
      </label>
      <div className="relative w-full h-32 bg-black/50 border-2 border-dashed border-white/10 rounded-xl flex items-center justify-center overflow-hidden hover:border-gold/30 transition-colors group cursor-pointer">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleFileChange(e, key)}
          className="absolute inset-0 opacity-0 cursor-pointer z-10"
        />
        {fotosPreview[key] ? (
          <img src={fotosPreview[key]} alt="Preview" className="w-full h-full object-contain" />
        ) : (
          <div className="text-center">
            <MdImage className="text-3xl text-gray-600 mx-auto mb-1 group-hover:text-gold/60 transition-colors" />
            <p className="text-[10px] text-gray-500 font-medium">Upload</p>
          </div>
        )}
      </div>
    </div>
  );

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
        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
          {fardamentos.map((f) => {
            const isCustom = !f.patente && f.nome;
            // Se for custom, todos podem usar/copiar. Se for patente, só quem tem a patente.
            const canUse = isCustom || user?.cargo === f.patente;
            const nomeExibicao = isCustom ? f.nome : (cargoLabels[f.patente] || f.patente);
            
            const cardFotos = [
              { url: f.foto_url, label: 'Frente' },
              { url: f.foto_lado_direito, label: 'Dir.' },
              { url: f.foto_lado_esquerdo, label: 'Esq.' },
              { url: f.foto_costas, label: 'Costas' }
            ].filter(img => img.url);

            return (
              <div key={f.id} className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-[2rem] overflow-hidden flex flex-col hover:border-gold/30 transition-all duration-300 group shadow-lg">
                
                {/* Header Rank/Name */}
                <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isCustom ? (
                      <span className="px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-lg text-sm font-bold uppercase tracking-wider">
                        {nomeExibicao}
                      </span>
                    ) : (
                      <span className={`${cargoBadgeClass[f.patente] || 'badge-steel'}`}>
                        {nomeExibicao}
                      </span>
                    )}
                  </div>
                  {canAddFardamento && (
                    <button
                      onClick={() => handleDelete(f.id, f)}
                      className="text-gray-500 hover:text-red-400 transition-colors p-2 rounded-full hover:bg-white/5"
                      title="Deletar Fardamento"
                    >
                      <MdDelete size={18} />
                    </button>
                  )}
                </div>

                {/* Photos Grid */}
                <div className="bg-black/80 p-4">
                  {cardFotos.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2 h-[350px]">
                      {cardFotos.map((img, idx) => (
                        <div 
                          key={idx} 
                          className="relative bg-white/5 rounded-xl border border-white/10 overflow-hidden cursor-pointer group/img hover:border-gold/50 transition-colors"
                          onClick={() => setViewImage(img.url)}
                          title={`Ampliar ${img.label}`}
                        >
                          <img 
                            src={img.url} 
                            alt={`${nomeExibicao} - ${img.label}`}
                            className="w-full h-full object-contain group-hover/img:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute bottom-0 inset-x-0 bg-black/60 text-center py-1 text-xs text-gray-300 font-bold uppercase tracking-widest backdrop-blur-sm">
                            {img.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-[350px] flex items-center justify-center">
                      <MdImage className="text-6xl text-gray-600" />
                    </div>
                  )}
                </div>

                {/* Description & Action */}
                <div className="p-6 flex flex-col flex-1 border-t border-white/10">
                  <div className="mt-auto">
                    {canUse ? (
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
          <div className="bg-[#111] border border-white/10 w-full max-w-3xl rounded-[2rem] shadow-2xl flex flex-col max-h-[90vh]">
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
              
              {/* Tipo de Fardamento */}
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="tipoFardamento" 
                    value="patente" 
                    checked={tipoFardamento === 'patente'}
                    onChange={(e) => setTipoFardamento(e.target.value)}
                    className="accent-gold"
                  />
                  <span className="text-sm font-bold text-gray-300">Vincular a Patente</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="tipoFardamento" 
                    value="custom" 
                    checked={tipoFardamento === 'custom'}
                    onChange={(e) => setTipoFardamento(e.target.value)}
                    className="accent-gold"
                  />
                  <span className="text-sm font-bold text-gray-300">Nome Customizado</span>
                </label>
              </div>

              {/* Patente ou Nome Customizado */}
              {tipoFardamento === 'patente' ? (
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
              ) : (
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                    Nome do Fardamento
                  </label>
                  <input
                    type="text"
                    required
                    value={nomeCustomizado}
                    onChange={(e) => setNomeCustomizado(e.target.value)}
                    placeholder="Ex: Fardamento Especial BOPE"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-gray-200 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-all"
                  />
                </div>
              )}

              {/* Fotos */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                  Fotos do Fardamento
                </label>
                <div className="flex flex-wrap gap-4">
                  {renderPhotoInput('frente', 'Frente')}
                  {renderPhotoInput('ladoDireito', 'Lado Dir.')}
                  {renderPhotoInput('ladoEsquerdo', 'Lado Esq.')}
                  {renderPhotoInput('costas', 'Costas')}
                </div>
                <p className="text-xs text-gray-500 mt-2">* Pelo menos uma foto é obrigatória.</p>
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

      {/* View Image Modal */}
      {viewImage && (
        <div 
          className="fixed inset-0 bg-black/95 z-[9999] flex items-center justify-center p-4 backdrop-blur-md animate-fade-in"
          onClick={() => setViewImage(null)}
        >
          <button
            onClick={() => setViewImage(null)}
            className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors z-50 shadow-lg"
          >
            <MdClose size={28} />
          </button>
          
          <div onClick={(e) => e.stopPropagation()} className="w-full h-full flex items-center justify-center max-w-[90vw] max-h-[90vh]">
            <TransformWrapper
              initialScale={1}
              minScale={0.5}
              maxScale={5}
              centerOnInit={true}
              wheel={{ step: 0.1 }}
            >
              {({ zoomIn, zoomOut, resetTransform }) => (
                <React.Fragment>
                  <div className="absolute top-6 left-1/2 -translate-x-1/2 flex gap-3 z-50 bg-black/50 p-2 rounded-2xl backdrop-blur-md border border-white/10">
                    <button onClick={() => zoomOut()} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 font-bold text-2xl transition-colors leading-none">-</button>
                    <button onClick={() => resetTransform()} className="px-4 h-10 flex items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 font-bold text-sm transition-colors uppercase tracking-widest">Reset</button>
                    <button onClick={() => zoomIn()} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 font-bold text-2xl transition-colors leading-none">+</button>
                  </div>
                  <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }} contentStyle={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <img 
                      src={viewImage} 
                      alt="Fardamento Ampliado" 
                      className="max-w-full max-h-full object-contain drop-shadow-2xl rounded-xl cursor-grab active:cursor-grabbing"
                    />
                  </TransformComponent>
                </React.Fragment>
              )}
            </TransformWrapper>
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

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Topbar from '../../components/layout/Topbar';
import { userService } from '../../services/userService';
import { ranks, cargoBadgeClass, getRankById } from '../../data/ranks';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { MdSearch, MdPerson, MdFilterList, MdRefresh, MdCheckCircle, MdArrowBack, MdHistory } from 'react-icons/md';

export default function ManageExonerated() {
  const { userRankLevel } = useAuth();
  const navigate = useNavigate();
  const { sendNotification } = useNotifications();

  const [exonerados, setExonerados] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [reintegrando, setReintegrando] = useState(null);

  const loadExonerados = async () => {
    setLoading(true);
    try {
      const data = await userService.getExonerated();
      setExonerados(data);
    } catch (error) {
      console.error(error);
      sendNotification("Erro ao carregar exonerados.", 'erro');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExonerados();
  }, []);

  const handleReintegrar = async (id, nome) => {
    if (userRankLevel < 14) {
      sendNotification('Apenas Comandantes (Ten. Coronel/Major) podem reintegrar.', 'erro');
      return;
    }
    
    if (window.confirm(`Confirma a REINTEGRAÇÃO do militar ${nome} ao 2º BP Choque?\n\nO militar poderá voltar a acessar o sistema.`)) {
      setReintegrando(id);
      try {
        await userService.reintegrateMilitar(id);
        sendNotification(`${nome} foi reintegrado ao Batalhão com sucesso!`, 'sucesso');
        loadExonerados();
      } catch (err) {
        sendNotification(err.message, 'erro');
      } finally {
        setReintegrando(null);
      }
    }
  };

  const filtered = exonerados.filter(m => {
    return m.nome?.toLowerCase().includes(search.toLowerCase()) || m.cpf?.includes(search);
  });

  // Find exoneration date from historico
  const getExonerationDate = (militar) => {
    const entry = militar.historico?.find(h => h.tipo === 'Exoneração');
    if (entry?.data) {
      return new Date(entry.data).toLocaleDateString('pt-BR');
    }
    return 'N/A';
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="spinner" /></div>;

  return (
    <div className="animate-fadeIn pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <Topbar title="EXONERADOS" subtitle="Militares Desligados do Batalhão" />
        <button 
          onClick={() => navigate('/admin/policiais')} 
          className="btn-steel flex items-center justify-center gap-2 self-start sm:self-auto"
        >
          <MdArrowBack className="text-xl" /> Voltar ao Efetivo
        </button>
      </div>

      {/* Alert Banner */}
      <div className="bg-danger/10 border border-danger/30 rounded-2xl p-4 mb-8 flex items-start gap-3">
        <MdHistory className="text-danger-light text-2xl flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-danger-light">Área de Controle de Exonerados</p>
          <p className="text-xs text-gray-400 mt-1">
            Militares exonerados têm o acesso ao sistema <strong className="text-danger-light">bloqueado</strong>. 
            Apenas o Comando pode autorizar a reintegração, que restaura o acesso e retorna o militar ao efetivo ativo.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-mil-black/50 border border-gray-800 rounded-2xl p-4 sm:p-5 mb-8 flex flex-col sm:flex-row gap-4 shadow-sm">
        <div className="relative flex-1">
          <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-xl" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar exonerado por nome ou ID..."
            className="mil-input !pl-12 !bg-[#0f0f0f]"
          />
        </div>
        <button onClick={loadExonerados} className="btn-steel flex items-center gap-2 !px-5">
          <MdRefresh className="text-lg" /> Atualizar
        </button>
      </div>

      <div className="flex items-center justify-between mb-4 px-1">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
          {filtered.length} Militar{filtered.length !== 1 ? 'es' : ''} exonerado{filtered.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Exonerated Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((militar) => {
          const rankData = getRankById(militar.patente);
          const isReintegrando = reintegrando === militar.id;
          
          return (
            <div key={militar.id} className="mil-card flex flex-col !p-0 group overflow-hidden border border-danger/20 hover:border-danger/40 transition-all shadow-sm hover:shadow-[0_5px_15px_rgba(139,26,26,0.2)]">
              {/* Header Card */}
              <div className="p-4 bg-gradient-to-b from-[#1a0a0a] to-[#0f0f0f] border-b border-danger/20">
                <div className="flex justify-between items-start mb-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2a1010] to-[#1a0505] flex items-center justify-center text-danger-light font-black text-lg border border-danger/30 flex-shrink-0 shadow-inner shadow-black/50">
                    {militar.nome.charAt(0)}
                  </div>
                  <span className="badge-danger !text-[9px] !px-2 !py-0.5 animate-pulse">
                    ⛔ EXONERADO
                  </span>
                </div>
                <h3 className="text-[15px] font-black text-gray-100 truncate">{militar.nome}</h3>
                <p className="text-[10px] text-gray-500 font-mono tracking-widest uppercase mt-0.5">ID: {militar.cpf}</p>
              </div>

              {/* Body Card */}
              <div className="p-4 flex-1 flex flex-col gap-2 bg-[#0a0a0a]">
                <div className="flex justify-between items-center bg-[#111] p-2 rounded-lg border border-gray-800/50">
                  <span className="text-[9px] text-gray-500 uppercase font-bold tracking-widest">Patente</span>
                  <span className={`text-[10px] font-bold ${cargoBadgeClass[militar.patente] || 'text-gray-300'}`}>
                    {rankData?.insignia} {rankData?.name || militar.patente}
                  </span>
                </div>
                <div className="flex justify-between items-center bg-[#111] p-2 rounded-lg border border-gray-800/50">
                  <span className="text-[9px] text-gray-500 uppercase font-bold tracking-widest">Cia</span>
                  <span className="text-[10px] font-bold text-gray-400">{militar.companhia}</span>
                </div>
                <div className="flex justify-between items-center bg-[#111] p-2 rounded-lg border border-danger/10">
                  <span className="text-[9px] text-danger-light uppercase font-bold tracking-widest">Exonerado em</span>
                  <span className="text-[10px] font-bold text-danger-light">{getExonerationDate(militar)}</span>
                </div>
              </div>

              {/* Footer Action */}
              {userRankLevel >= 14 && (
                <div className="border-t border-gray-800 bg-[#0d0d0d]">
                  <button 
                    onClick={() => handleReintegrar(militar.id, militar.nome)}
                    disabled={isReintegrando}
                    className="w-full flex items-center justify-center gap-2 p-3.5 text-[10px] font-bold text-army-green-light uppercase tracking-widest bg-army-green/5 hover:bg-army-green/20 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isReintegrando ? (
                      <><div className="spinner !w-4 !h-4" /> Processando...</>
                    ) : (
                      <><MdCheckCircle className="text-sm" /> Reintegrar ao BP</>
                    )}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 text-gray-600 bg-mil-black/30 border border-gray-800/50 rounded-2xl mt-4">
          <MdPerson className="text-5xl mx-auto mb-3 text-gray-700/50" />
          <p className="font-bold uppercase tracking-widest text-xs">Nenhum militar exonerado encontrado.</p>
          <p className="text-[10px] text-gray-600 mt-2">Todos os militares estão em serviço ativo.</p>
        </div>
      )}
    </div>
  );
}

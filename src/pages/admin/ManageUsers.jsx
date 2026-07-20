import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Topbar from '../../components/layout/Topbar';
import { userService } from '../../services/userService';
import { ranks, cargoBadgeClass, getRankById } from '../../data/ranks';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { MdSearch, MdPerson, MdEdit, MdBlock, MdAssignment, MdFilterList, MdAdd } from 'react-icons/md';

export default function ManageUsers() {
  const { user, userRankLevel } = useAuth();
  const navigate = useNavigate();
  const { sendNotification } = useNotifications();

  const [militares, setMilitares] = useState([]);
  const [search, setSearch] = useState('');
  const [filterPatente, setFilterPatente] = useState('');
  const [filterCompanhia, setFilterCompanhia] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const [loading, setLoading] = useState(true);

  const companhias = ['Comando', 'Equipe Guardião', 'Rocam', 'Operacional'];

  const loadMilitares = async () => {
    setLoading(true);
    try {
      const data = await userService.getUsers();
      setMilitares(data);
    } catch (error) {
      console.error(error);
      sendNotification("Erro ao carregar dados do batalhão.", 'erro');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMilitares();
  }, []);

  const handleExonerar = async (id, nome) => {
    if (userRankLevel < 14) {
      sendNotification('Apenas Comandantes (Ten. Coronel/Major) podem exonerar.', 'erro');
      return;
    }
    
    if (window.confirm(`Tem certeza que deseja EXONERAR o militar ${nome}? Esta ação é irreversível.`)) {
      try {
        await userService.registerAction(id, 'Exoneração', { descricao: 'Exonerado do Batalhão a pedido ou por decisão do Comando.' });
        loadMilitares(); // refresh
        sendNotification(`${nome} foi exonerado com sucesso.`, 'sucesso');
      } catch (err) {
        sendNotification(err.message, 'erro');
      }
    }
  };

  const filtered = useMemo(() => {
    return militares.filter(m => {
      const matchSearch = m.nome?.toLowerCase().includes(search.toLowerCase()) || m.cpf?.includes(search);
      const matchPatente = filterPatente ? m.patente === filterPatente : true;
      const matchCompanhia = filterCompanhia ? m.companhia === filterCompanhia : true;
      const matchStatus = filterStatus ? m.status === filterStatus : true;
      return matchSearch && matchPatente && matchCompanhia && matchStatus;
    });
  }, [militares, search, filterPatente, filterCompanhia, filterStatus]);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="spinner" /></div>;

  return (
    <div className="animate-fadeIn pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <Topbar title="GERENCIAR EFETIVO" subtitle="Fichas Militares e Carreira" />
        <button 
          onClick={() => navigate('/admin/policiais/novo')} 
          className="btn-gold flex items-center justify-center gap-2 self-start sm:self-auto shadow-gold-lg"
        >
          <MdAdd className="text-xl" /> Cadastrar Militar
        </button>
      </div>

      {/* Filters */}
      <div className="bg-mil-black/50 border border-gray-800 rounded-2xl p-4 sm:p-5 mb-8 flex flex-col sm:flex-row gap-4 shadow-sm">
        <div className="relative flex-1">
          <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-xl" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nome ou ID..."
            className="mil-input !pl-12 !bg-[#0f0f0f]"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-4 sm:w-2/3">
          <div className="flex-1 relative">
             <MdFilterList className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg pointer-events-none" />
             <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="mil-select !pl-12 !bg-[#0f0f0f]">
               <option value="">Status: Todos</option>
               <option value="Ativo">Ativos</option>
               <option value="Inativo">Inativos</option>
             </select>
          </div>
          <div className="flex-1">
             <select value={filterPatente} onChange={e => setFilterPatente(e.target.value)} className="mil-select !bg-[#0f0f0f]">
               <option value="">Patente: Todas</option>
               {ranks.map(r => <option key={r.id} value={r.id}>{r.insignia} {r.name}</option>)}
             </select>
          </div>
          <div className="flex-1">
             <select value={filterCompanhia} onChange={e => setFilterCompanhia(e.target.value)} className="mil-select !bg-[#0f0f0f]">
               <option value="">Cia: Todas</option>
               {companhias.map(c => <option key={c} value={c}>{c}</option>)}
             </select>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4 px-1">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{filtered.length} Militares encontrados</p>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((militar, i) => {
          const isAtivo = militar.status === 'Ativo';
          const rankData = getRankById(militar.patente);
          
          return (
            <div key={militar.id} className="mil-card flex flex-col !p-0 group overflow-hidden border border-gray-800 hover:border-gold/30 transition-all shadow-sm hover:shadow-[0_5px_15px_rgba(0,0,0,0.5)]">
              {/* Header Card */}
              <div className="p-4 bg-gradient-to-b from-[#151515] to-[#0f0f0f] border-b border-gray-800">
                <div className="flex justify-between items-start mb-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-army-green-dark to-army-green flex items-center justify-center text-white font-black text-lg border border-army-green-light/30 flex-shrink-0 shadow-inner shadow-black/50 overflow-hidden">
                    {militar.foto_url ? (
                      <img src={militar.foto_url} alt={militar.nome} className="w-full h-full object-cover" />
                    ) : (
                      militar.nome.charAt(0)
                    )}
                  </div>
                  <span className={`${isAtivo ? 'badge-green' : 'badge-danger'} !text-[9px] !px-2 !py-0.5`}>
                    {militar.status}
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
                  <span className="text-[10px] font-bold text-army-green-light">{militar.companhia}</span>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="grid grid-cols-2 divide-x divide-gray-800 border-t border-gray-800 bg-[#0d0d0d]">
                <button 
                  onClick={() => navigate(`/admin/policiais/${militar.id}`)}
                  className="flex items-center justify-center gap-2 p-3 text-[10px] font-bold text-gold uppercase tracking-widest hover:bg-gold/10 hover:text-gold-light transition-colors"
                >
                  <MdAssignment className="text-sm" /> Ficha
                </button>
                {userRankLevel > (rankData?.level || 0) || (user?.cpf === '25256' && user?.id === militar.id) ? (
                  <button 
                    onClick={() => navigate(`/admin/policiais/${militar.id}/editar`)}
                    className="flex items-center justify-center gap-2 p-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:bg-white/5 hover:text-white transition-colors"
                  >
                    <MdEdit className="text-sm" /> Editar
                  </button>
                ) : (
                  <div className="flex items-center justify-center gap-2 p-3 text-[10px] font-bold text-gray-600 uppercase tracking-widest cursor-not-allowed" title="Patente superior ou igual à sua">
                    <MdBlock className="text-sm" /> Sem Acesso
                  </div>
                )}
                {userRankLevel >= 14 && userRankLevel > (rankData?.level || 0) && (
                  <button 
                    onClick={() => handleExonerar(militar.id, militar.nome)}
                    className="col-span-2 flex items-center justify-center gap-2 p-2.5 text-[10px] font-bold text-danger uppercase tracking-widest bg-danger/5 hover:bg-danger/20 hover:text-white transition-colors border-t border-gray-800"
                  >
                    <MdBlock className="text-sm" /> Exonerar
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 text-gray-600 bg-mil-black/30 border border-gray-800/50 rounded-2xl mt-4">
          <MdPerson className="text-5xl mx-auto mb-3 text-gray-700/50" />
          <p className="font-bold uppercase tracking-widest text-xs">Nenhum militar encontrado.</p>
        </div>
      )}
    </div>
  );
}

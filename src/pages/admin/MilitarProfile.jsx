import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Topbar from '../../components/layout/Topbar';
import { userService } from '../../services/userService';
import { getRankById } from '../../data/ranks';
import { useAuth } from '../../contexts/AuthContext';
import { 
  MdArrowBack, MdCalendarMonth, MdSchool, MdGavel, MdStar, 
  MdMilitaryTech, MdHistory, MdChat, MdAssignment 
} from 'react-icons/md';
import { GiMedal } from 'react-icons/gi';

export default function MilitarProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userRankLevel } = useAuth();
  
  const [militar, setMilitar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('geral');

  useEffect(() => {
    async function load() {
      try {
        const data = await userService.getUserById(id);
        setMilitar(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="spinner" /></div>;

  if (!militar) {
    return (
      <div className="text-center py-20 animate-fadeIn">
        <h2 className="text-2xl font-black text-gray-300">Militar não encontrado</h2>
        <button onClick={() => navigate('/admin/policiais')} className="btn-steel mt-4">Voltar para listagem</button>
      </div>
    );
  }

  const rankData = getRankById(militar.patente);
  const isAtivo = militar.status === 'Ativo';

  const tabs = [
    { id: 'geral', label: 'Visão Geral', icon: <MdAssignment /> },
    { id: 'cursos', label: 'Cursos', icon: <MdSchool /> },
    { id: 'conduta', label: 'Conduta', icon: <MdGavel /> },
    { id: 'carreira', label: 'Carreira', icon: <MdStar /> },
    { id: 'historico', label: 'Histórico', icon: <MdHistory /> }
  ];

  return (
    <div className="animate-fadeIn pb-10">
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => navigate('/admin/policiais')}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-mil-black border border-gray-800 text-gray-400 hover:text-gold hover:border-gold/30 transition-colors"
        >
          <MdArrowBack className="text-xl" />
        </button>
        <Topbar title="FICHA MILITAR" subtitle="Registro de Assentamentos" />
      </div>

      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl border border-gold/20 bg-gradient-to-br from-[#111] via-[#0a0a0a] to-[#050505] p-6 sm:p-8 mb-6 shadow-lg">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-br from-army-green-dark to-army-green border-2 border-gold flex items-center justify-center text-white font-black text-5xl shadow-gold-lg flex-shrink-0 overflow-hidden">
            {militar.foto_url ? (
              <img src={militar.foto_url} alt={militar.nome} className="w-full h-full object-cover" />
            ) : (
              militar.nome.charAt(0)
            )}
          </div>
          <div className="text-center sm:text-left flex-1 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-2">
              <h2 className="text-2xl sm:text-4xl font-black text-gray-100 uppercase tracking-widest">{militar.nome}</h2>
              <span className={`${isAtivo ? 'badge-green' : 'badge-danger'} !text-[11px] !px-3 !py-1 self-center sm:self-start`}>
                {militar.status}
              </span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Patente</p>
                <p className="text-sm font-bold text-gold">{rankData?.insignia} {rankData?.name || militar.patente}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Companhia</p>
                <p className="text-sm font-bold text-army-green-light">{militar.companhia}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Matrícula</p>
                <p className="text-sm font-mono text-gray-300">{militar.cpf}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Horas de Serviço</p>
                <p className="text-sm font-mono text-gray-300">{militar.horasServico}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto custom-scrollbar border-b border-gray-800 mb-6 pb-2 gap-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold uppercase tracking-widest text-[10px] whitespace-nowrap transition-all ${
              activeTab === tab.id 
                ? 'bg-gold/10 text-gold border border-gold/30' 
                : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
            }`}
          >
            <span className="text-lg">{tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="min-h-[300px]">
        {/* TAB GERAL */}
        {activeTab === 'geral' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
            <div className="mil-card">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-gray-800 pb-2">
                <MdAssignment className="text-gold" /> Dados Cadastrais
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-gray-800/50 pb-2">
                  <span className="text-xs text-gray-500 font-bold uppercase">Data de Ingresso</span>
                  <span className="text-sm text-gray-200 font-mono">{militar.dataIngresso}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-800/50 pb-2">
                  <span className="text-xs text-gray-500 font-bold uppercase">Discord ID</span>
                  <span className="text-sm text-gray-200 font-mono bg-indigo-900/30 px-2 py-0.5 rounded border border-indigo-500/30 text-indigo-300 flex items-center gap-2">
                    <MdChat /> {militar.discord || 'Não informado'}
                  </span>
                </div>
              </div>
            </div>
            <div className="mil-card bg-gradient-to-br from-[#111] to-[#0a0a0a]">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-gray-800 pb-2">
                <MdAssignment className="text-gold" /> Observações do Comando
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed italic">
                "{militar.observacoes || 'Nenhuma observação registrada.'}"
              </p>
            </div>
          </div>
        )}

        {/* TAB CURSOS */}
        {activeTab === 'cursos' && (
          <div className="mil-card animate-fadeIn">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-gray-800 pb-2">
              <MdSchool className="text-army-green-light" /> Formações e Cursos
            </h3>
            {militar.cursos.length === 0 ? (
              <p className="text-sm text-gray-500 py-4 text-center">Nenhum curso registrado.</p>
            ) : (
              <div className="space-y-3">
                {militar.cursos.map((c, i) => (
                  <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-[#0a0a0a] border border-gray-800 hover:border-army-green/30 transition-colors">
                    <span className="text-sm font-bold text-gray-200">{c.nome}</span>
                    <span className="text-xs text-army-green font-mono flex items-center gap-1.5"><MdCalendarMonth/> {c.data}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB CONDUTA */}
        {activeTab === 'conduta' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeIn">
            <div className="mil-card">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-gray-800 pb-2">
                <MdGavel className="text-danger" /> Advertências e Punições
              </h3>
              {militar.advertencias.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 opacity-50">
                   <MdGavel className="text-4xl text-gray-600 mb-2" />
                   <p className="text-sm text-gray-500">Ficha limpa. Nenhuma advertência.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {militar.advertencias.map((a, i) => (
                    <div key={i} className="p-3 bg-danger/5 border border-danger/20 rounded-lg border-l-2 border-l-danger">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-black text-danger uppercase tracking-widest">{a.tipo}</span>
                        <span className="text-[10px] text-gray-500 font-mono">{a.data}</span>
                      </div>
                      <p className="text-sm text-gray-300">{a.motivo}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mil-card">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-gray-800 pb-2">
                <MdStar className="text-gold" /> Elogios
              </h3>
              {militar.elogios.length === 0 ? (
                <p className="text-sm text-gray-500 py-4 text-center">Nenhum elogio registrado.</p>
              ) : (
                <div className="space-y-4">
                  {militar.elogios.map((e, i) => (
                    <div key={i} className="p-3 bg-gold/5 border border-gold/20 rounded-lg">
                      <span className="block text-[10px] text-gold font-mono mb-1">{e.data}</span>
                      <p className="text-sm text-gray-300">{e.descricao}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB CARREIRA */}
        {activeTab === 'carreira' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
             <div className="mil-card">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-gray-800 pb-2">
                <MdMilitaryTech className="text-gold" /> Condecorações
              </h3>
              {militar.condecoracoes.length === 0 ? (
                <p className="text-sm text-gray-500 py-4 text-center">Nenhuma condecoração.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {militar.condecoracoes.map((c, i) => (
                    <div key={i} className="flex flex-col items-center justify-center p-4 bg-[#0a0a0a] border border-gold/20 rounded-xl text-center gap-2">
                       <GiMedal className="text-4xl text-gold drop-shadow-md" />
                       <span className="text-xs font-bold text-gray-200">{c.nome}</span>
                       <span className="text-[9px] text-gray-500 font-mono">{c.data}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mil-card">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-gray-800 pb-2">
                <MdStar className="text-gold" /> Linha de Promoções
              </h3>
              {militar.promocoes.length === 0 ? (
                <p className="text-sm text-gray-500 py-4 text-center">Nenhuma promoção registrada.</p>
              ) : (
                <div className="relative border-l border-gray-800 ml-4 space-y-6 py-2">
                  {militar.promocoes.map((p, i) => {
                    const rAnterior = getRankById(p.patenteAnterior);
                    const rNova = getRankById(p.novaPatente);
                    return (
                      <div key={i} className="relative pl-6">
                        <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-gold shadow-[0_0_8px_rgba(201,168,76,0.8)]" />
                        <span className="text-[10px] text-gray-500 font-mono block mb-1">{p.data}</span>
                        <p className="text-sm font-bold text-gray-200">
                          <span className="text-gray-500 line-through">{rAnterior?.name || p.patenteAnterior}</span>
                          <span className="mx-2 text-gray-600">→</span>
                          <span className="text-gold">{rNova?.name || p.novaPatente}</span>
                        </p>
                        <p className="text-xs text-gray-400 mt-1 italic">"{p.motivo}"</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB HISTORICO */}
        {activeTab === 'historico' && (
          <div className="mil-card animate-fadeIn">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-gray-800 pb-2">
              <MdHistory className="text-gray-300" /> Histórico Completo de Ações
            </h3>
            <div className="space-y-0">
              {militar.historico.map((h, i) => (
                <div key={i} className="flex gap-4 p-4 hover:bg-[#0a0a0a] transition-colors border-b border-gray-800/50 last:border-0 group">
                  <div className="w-32 flex-shrink-0 text-[10px] text-gray-500 font-mono pt-0.5 group-hover:text-gray-400 transition-colors">
                    {new Date(h.data).toLocaleString('pt-BR')}
                  </div>
                  <div>
                    <span className="inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-gray-800 text-gray-300 mb-1">
                      {h.tipo}
                    </span>
                    <p className="text-sm text-gray-300 group-hover:text-gray-100 transition-colors leading-relaxed">{h.descricao}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

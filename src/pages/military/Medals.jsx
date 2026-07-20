import { useState, useEffect } from 'react';
import Topbar from '../../components/layout/Topbar';
import { useAuth } from '../../contexts/AuthContext';
import { userService } from '../../services/userService';
import { medalService } from '../../services/medalService';
import { cargoLabels } from '../../data/ranks';
import { GiMedal } from 'react-icons/gi';
import { MdStar, MdLock, MdCheck, MdVerified, MdMilitaryTech, MdThumbUp } from 'react-icons/md';

// Determines if a military member has earned a given medal
function checkEarned(medal, profile) {
  if (!profile) return false;
  const condecoracoes = profile.condecoracoes || [];
  const cursos = profile.cursos || [];
  const elogios = profile.elogios || [];

  // Check if it's in the profile's condecoracoes array
  if (condecoracoes.some(c =>
    (typeof c === 'string' && c.includes(medal.name)) ||
    (typeof c === 'object' && (c.nome === medal.name || c.id === medal.id))
  )) return true;

  // Auto-criteria
  switch (medal.id) {
    case 'medalha_merito': return cursos.length >= 3;
    case 'medalha_instrutor': return cursos.length >= 5;
    default: return false;
  }
}

export default function Medals() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('medalhas');
  const [selected, setSelected] = useState(null);
  const [medals, setMedals] = useState([]);

  useEffect(() => {
    async function load() {
      if (!user) return;
      try {
        const [userData, medalsData] = await Promise.all([
          userService.getUserById(user.id),
          medalService.getMedals()
        ]);
        setProfile(userData);
        setMedals(medalsData);
      } catch (err) {
        console.error(err);
        setProfile(user);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  const elogios = profile?.elogios || [];
  const condecoracoes = profile?.condecoracoes || [];
  const earnedMedals = medals.filter(m => checkEarned(m, profile));
  const lockedMedals = medals.filter(m => !checkEarned(m, profile));

  return (
    <div className="animate-fadeIn pb-10">
      <Topbar title="MEDALHAS E ELOGIOS" subtitle="Condecorações, Honrarias e Reconhecimentos" />

      {/* Tab Switcher */}
      <div className="flex gap-2 mb-6 border-b border-gray-800 pb-0">
        {[
          { key: 'medalhas', label: 'Medalhas', icon: <GiMedal /> },
          { key: 'elogios', label: 'Elogios', icon: <MdThumbUp /> },
          { key: 'condecoracoes', label: 'Condecorações', icon: <MdVerified /> },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest border-b-2 transition-all ${
              activeTab === tab.key
                ? 'border-gold text-gold'
                : 'border-transparent text-gray-600 hover:text-gray-400'
            }`}
          >
            {tab.icon} {tab.label}
            {tab.key === 'elogios' && elogios.length > 0 && (
              <span className="ml-1 bg-gold/20 text-gold text-[9px] px-1.5 py-0.5 rounded-full">{elogios.length}</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="spinner" /></div>
      ) : (
        <>
          {/* ===== MEDALHAS TAB ===== */}
          {activeTab === 'medalhas' && (
            <>
              {/* Summary Banner */}
              <div className="hero-card p-5 border border-gray-800 mb-6 flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
                    <GiMedal className="text-2xl text-gold" />
                  </div>
                  <div>
                    <p className="text-xl font-black text-gold">{earnedMedals.length}</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">Conquistadas</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center">
                    <MdLock className="text-2xl text-gray-600" />
                  </div>
                  <div>
                    <p className="text-xl font-black text-gray-500">{lockedMedals.length}</p>
                    <p className="text-[10px] text-gray-600 uppercase tracking-widest">Bloqueadas</p>
                  </div>
                </div>
                <div className="flex-1 min-w-[100px]">
                  <div className="flex justify-between text-[10px] text-gray-600 mb-1.5 font-bold uppercase tracking-widest">
                    <span>Progresso</span>
                    <span className="text-gold">{Math.round((earnedMedals.length / medals.length) * 100)}%</span>
                  </div>
                  <div className="h-2 bg-gray-900 rounded-full overflow-hidden border border-gray-800">
                    <div
                      className="h-full bg-gradient-to-r from-army-green to-gold rounded-full transition-all duration-1000"
                      style={{ width: `${(earnedMedals.length / medals.length) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Earned medals */}
              {earnedMedals.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-[10px] font-black text-army-green-light uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <MdCheck /> Conquistadas ({earnedMedals.length})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {earnedMedals.map((medal, i) => (
                      <div
                        key={medal.id}
                        onClick={() => setSelected(selected?.id === medal.id ? null : medal)}
                        className="hero-card p-5 flex items-start gap-4 cursor-pointer border border-army-green/20 hover:border-army-green/40 transition-all group animate-fadeInUp"
                        style={{ animationDelay: `${i * 0.04}s`, animationFillMode: 'both' }}
                      >
                        <div
                          className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl flex-shrink-0 border group-hover:scale-105 transition-transform"
                          style={{ borderColor: medal.color + '60', backgroundColor: medal.color + '15', boxShadow: `0 0 16px ${medal.color}20` }}
                        >
                          {medal.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <p className="text-xs font-black text-white group-hover:text-gold transition-colors truncate">{medal.name}</p>
                            <MdCheck className="text-army-green-light text-xs flex-shrink-0" />
                          </div>
                          <p className="text-[10px] text-gray-500 line-clamp-2 leading-relaxed">{medal.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Locked medals */}
              {lockedMedals.length > 0 && (
                <div>
                  <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <MdLock /> Bloqueadas ({lockedMedals.length})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {lockedMedals.map((medal, i) => (
                      <div
                        key={medal.id}
                        onClick={() => setSelected(selected?.id === medal.id ? null : medal)}
                        className="hero-card p-5 flex items-start gap-4 opacity-40 hover:opacity-60 cursor-pointer border border-gray-800 transition-all"
                      >
                        <div className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl flex-shrink-0 border border-gray-800 bg-gray-900 grayscale">
                          {medal.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <p className="text-xs font-black text-gray-500 truncate">{medal.name}</p>
                            <MdLock className="text-gray-700 text-xs flex-shrink-0" />
                          </div>
                          <p className="text-[10px] text-gray-700 line-clamp-2 leading-relaxed">{medal.criteria}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {medals.length === 0 && <p className="text-center text-gray-600 py-16">Nenhuma medalha cadastrada.</p>}
            </>
          )}

          {/* ===== ELOGIOS TAB ===== */}
          {activeTab === 'elogios' && (
            <div>
              {elogios.length === 0 ? (
                <div className="py-20 text-center border border-dashed border-gray-800 rounded-xl">
                  <MdThumbUp className="text-5xl text-gray-700 mx-auto mb-3" />
                  <p className="text-gray-500">Nenhum elogio registrado ainda.</p>
                  <p className="text-xs text-gray-700 mt-1">Elogios são registrados pelo Comando.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {elogios.map((e, i) => (
                    <div key={i} className="hero-card p-5 border border-gold/10 hover:border-gold/20 transition-colors animate-fadeInUp" style={{ animationDelay: `${i * 0.04}s`, animationFillMode: 'both' }}>
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0">
                          <MdStar className="text-gold text-lg" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <p className="text-sm font-bold text-white">
                              {typeof e === 'string' ? e : (e.motivo || e.descricao || 'Elogio')}
                            </p>
                            {e.data && (
                              <span className="text-[9px] text-gray-600 font-mono flex-shrink-0">
                                {new Date(e.data).toLocaleDateString('pt-BR')}
                              </span>
                            )}
                          </div>
                          {e.tipo && <span className="text-[9px] text-gold uppercase tracking-widest font-bold">{e.tipo}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ===== CONDECORAÇÕES TAB ===== */}
          {activeTab === 'condecoracoes' && (
            <div>
              {condecoracoes.length === 0 ? (
                <div className="py-20 text-center border border-dashed border-gray-800 rounded-xl">
                  <MdVerified className="text-5xl text-gray-700 mx-auto mb-3" />
                  <p className="text-gray-500">Nenhuma condecoração registrada.</p>
                  <p className="text-xs text-gray-700 mt-1">Condecorações são concedidas pelo Comando Geral.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {condecoracoes.map((c, i) => (
                    <div key={i} className="hero-card p-5 border border-gold/20 animate-fadeInUp" style={{ animationDelay: `${i * 0.04}s`, animationFillMode: 'both' }}>
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0">
                          <MdVerified className="text-gold text-lg" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">
                            {typeof c === 'string' ? c : (c.nome || c.descricao || 'Condecoração')}
                          </p>
                          {c.data && <p className="text-[9px] text-gray-500 mt-1 font-mono">{new Date(c.data).toLocaleDateString('pt-BR')}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Medal detail tooltip */}
      {selected && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fadeIn">
          <div
            className="flex items-center gap-3 px-5 py-3 rounded-xl border shadow-2xl backdrop-blur-md"
            style={{ borderColor: selected.color + '40', backgroundColor: '#111111ee' }}
          >
            <span className="text-2xl">{selected.icon}</span>
            <div>
              <p className="text-xs font-black text-white">{selected.name}</p>
              <p className="text-[10px] text-gray-400">{selected.criteria}</p>
            </div>
            <button onClick={() => setSelected(null)} className="ml-2 text-gray-600 hover:text-white text-xs">✕</button>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import Topbar from '../../components/layout/Topbar';
import { userService } from '../../services/userService';
import { cargoLabels } from '../../data/ranks';
import {
  MdLeaderboard, MdStar, MdSchool, MdMilitaryTech,
  MdAccessTime, MdTrendingUp, MdPerson, MdFilterList
} from 'react-icons/md';
import { GiMedal } from 'react-icons/gi';

// Score calculation: weighted rank score
function calcScore(m) {
  const cursos = (m.cursos || []).length;
  const promocoes = (m.promocoes || []).length;
  const elogios = (m.elogios || []).length;
  const advertencias = (m.advertencias || []).length;
  const condecoracoes = (m.condecoracoes || []).length;
  return (cursos * 15) + (promocoes * 20) + (elogios * 10) + (condecoracoes * 25) - (advertencias * 10);
}

const CATEGORY_CONFIG = [
  { key: 'geral', label: 'Ranking Geral', icon: <MdLeaderboard />, color: '#C9A84C' },
  { key: 'cursos', label: 'Mais Cursos', icon: <MdSchool />, color: '#4a8c34' },
  { key: 'elogios', label: 'Mais Elogios', icon: <MdStar />, color: '#C9A84C' },
  { key: 'promocoes', label: 'Mais Promoções', icon: <MdTrendingUp />, color: '#6366f1' },
];

function getPosStyle(pos) {
  if (pos === 1) return { text: 'text-yellow-400', border: 'border-yellow-400/40 bg-yellow-400/10', badge: 'bg-yellow-400/20 text-yellow-400 border-yellow-400/40' };
  if (pos === 2) return { text: 'text-gray-300', border: 'border-gray-400/40 bg-gray-400/10', badge: 'bg-gray-400/10 text-gray-300 border-gray-400/30' };
  if (pos === 3) return { text: 'text-amber-600', border: 'border-amber-700/40 bg-amber-700/10', badge: 'bg-amber-700/10 text-amber-600 border-amber-700/30' };
  return { text: 'text-gray-500', border: 'border-gray-800 bg-transparent', badge: 'bg-gray-900 text-gray-500 border-gray-800' };
}

function getPosEmoji(pos) {
  if (pos === 1) return '🥇';
  if (pos === 2) return '🥈';
  if (pos === 3) return '🥉';
  return `#${pos}`;
}

export default function Ranking() {
  const [militares, setMilitares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('geral');
  const [filterCompanhia, setFilterCompanhia] = useState('');
  const [companhias, setCompanhias] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const data = await userService.getUsers();
        const ativos = data.filter(m => m.status !== 'Exonerado' && m.ativo !== false);
        setMilitares(ativos);
        const uniqueComp = [...new Set(ativos.map(m => m.companhia).filter(Boolean))].sort();
        setCompanhias(uniqueComp);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const getSorted = () => {
    let list = filterCompanhia ? militares.filter(m => m.companhia === filterCompanhia) : [...militares];
    switch (category) {
      case 'cursos': return list.sort((a, b) => (b.cursos?.length || 0) - (a.cursos?.length || 0));
      case 'elogios': return list.sort((a, b) => (b.elogios?.length || 0) - (a.elogios?.length || 0));
      case 'promocoes': return list.sort((a, b) => (b.promocoes?.length || 0) - (a.promocoes?.length || 0));
      default: return list.sort((a, b) => calcScore(b) - calcScore(a));
    }
  };

  const getValue = (m) => {
    switch (category) {
      case 'cursos': return `${m.cursos?.length || 0} cursos`;
      case 'elogios': return `${m.elogios?.length || 0} elogios`;
      case 'promocoes': return `${m.promocoes?.length || 0} promoções`;
      default: return `${calcScore(m)} pts`;
    }
  };

  const sorted = getSorted();
  const top3 = sorted.slice(0, 3);
  const rest = sorted.slice(3);

  // Podium order: 2nd, 1st, 3rd
  const podium = [top3[1], top3[0], top3[2]].filter(Boolean);
  const podiumPos = [2, 1, 3];
  const podiumHeights = ['h-20', 'h-32', 'h-16'];

  return (
    <div className="animate-fadeIn pb-10">
      <Topbar title="RANKING" subtitle="Classificação do Efetivo por Desempenho" />

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORY_CONFIG.map(cat => (
          <button
            key={cat.key}
            onClick={() => setCategory(cat.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-widest border transition-all ${
              category === cat.key
                ? 'bg-gold/20 border-gold/40 text-gold'
                : 'border-gray-800 text-gray-500 hover:border-gray-600 hover:text-gray-300 bg-mil-black/30'
            }`}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center mb-6">
        <MdFilterList className="text-gray-500" />
        <button
          onClick={() => setFilterCompanhia('')}
          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border transition-all ${
            !filterCompanhia ? 'bg-army-green/20 border-army-green/40 text-army-green-light' : 'border-gray-800 text-gray-600 hover:border-gray-700'
          }`}
        >Todas as Companhias</button>
        {companhias.map(c => (
          <button
            key={c}
            onClick={() => setFilterCompanhia(c === filterCompanhia ? '' : c)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border transition-all ${
              filterCompanhia === c ? 'bg-army-green/20 border-army-green/40 text-army-green-light' : 'border-gray-800 text-gray-600 hover:border-gray-700'
            }`}
          >{c}</button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-24"><div className="spinner" /></div>
      ) : sorted.length === 0 ? (
        <div className="py-20 text-center text-gray-600 border border-dashed border-gray-800 rounded-xl">
          <MdLeaderboard className="text-5xl mx-auto mb-3 text-gray-700" />
          <p>Nenhum militar encontrado.</p>
        </div>
      ) : (
        <>
          {/* ===== PODIUM ===== */}
          {top3.length > 0 && (
            <div className="mb-10 max-w-xl mx-auto">
              <div className="flex items-end justify-center gap-4">
                {podium.map((m, i) => {
                  const pos = podiumPos[i];
                  const styles = getPosStyle(pos);
                  return (
                    <div key={m.id} className="flex flex-col items-center" style={{ flex: 1 }}>
                      {/* Avatar */}
                      <div className="text-center mb-3">
                        {m.foto_url ? (
                          <img src={m.foto_url} alt={m.nome} className={`w-14 h-14 rounded-full mx-auto object-cover border-2 ${styles.border}`} />
                        ) : (
                          <div className={`w-14 h-14 rounded-full mx-auto flex items-center justify-center font-black text-xl border-2 ${styles.border} ${styles.text}`}>
                            {m.nome?.charAt(0) || '?'}
                          </div>
                        )}
                        <p className="text-xs font-bold text-gray-300 mt-2 truncate max-w-[90px] mx-auto leading-tight">
                          {m.nome?.split(' ').slice(-1)[0]}
                        </p>
                        <p className={`text-[10px] font-black ${styles.text} mt-0.5`}>{getValue(m)}</p>
                      </div>
                      {/* Pedestal */}
                      <div className={`w-full ${podiumHeights[i]} rounded-t-xl border-t-2 flex items-center justify-center ${styles.border}`}>
                        <span className="text-xl">{getPosEmoji(pos)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ===== FULL TABLE ===== */}
          <div className="hero-card p-0 overflow-hidden border border-gray-800">
            <div className="px-5 py-4 border-b border-gray-800 flex items-center gap-2">
              <MdLeaderboard className="text-gold" />
              <h3 className="text-xs font-black text-white uppercase tracking-widest">Classificação Completa</h3>
              <span className="ml-auto text-[10px] text-gray-600">{sorted.length} militares</span>
            </div>
            <div className="overflow-x-auto">
              <table className="mil-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Militar</th>
                    <th>Patente</th>
                    <th>Companhia</th>
                    <th>Cursos</th>
                    <th>Elogios</th>
                    <th>Promoções</th>
                    <th>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((m, i) => {
                    const pos = i + 1;
                    const styles = getPosStyle(pos);
                    return (
                      <tr key={m.id} className={`transition-colors ${pos <= 3 ? 'bg-gold/3' : ''}`}>
                        <td>
                          <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-black border ${styles.badge}`}>
                            {pos <= 3 ? getPosEmoji(pos) : pos}
                          </span>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            {m.foto_url ? (
                              <img src={m.foto_url} alt={m.nome} className="w-7 h-7 rounded-full object-cover border border-gray-700 flex-shrink-0" />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-mil-black border border-gray-700 flex items-center justify-center text-xs font-bold text-gray-400 flex-shrink-0">
                                {m.nome?.charAt(0)}
                              </div>
                            )}
                            <span className="font-semibold text-gray-200 text-xs truncate max-w-[120px]">{m.nome}</span>
                          </div>
                        </td>
                        <td><span className="text-[10px] text-gray-500">{cargoLabels[m.cargo] || m.cargo || '—'}</span></td>
                        <td><span className="text-[10px] text-gray-500 truncate max-w-[80px] block">{m.companhia || '—'}</span></td>
                        <td><span className="text-xs font-bold text-army-green-light">{m.cursos?.length || 0}</span></td>
                        <td><span className="text-xs font-bold text-gold">{m.elogios?.length || 0}</span></td>
                        <td><span className="text-xs font-bold text-indigo-400">{m.promocoes?.length || 0}</span></td>
                        <td>
                          <span className={`text-xs font-black ${styles.text}`}>{calcScore(m)} pts</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

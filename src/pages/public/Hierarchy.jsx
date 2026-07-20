import { useState, useEffect } from 'react';
import { ranks, getOfficerRanks, getNCORanks, getEnlistedRanks } from '../../data/ranks';
import { MdClose, MdStar, MdPerson, MdArrowForward } from 'react-icons/md';
import { GiMilitaryFort } from 'react-icons/gi';
import { userService } from '../../services/userService';

export default function Hierarchy() {
  const [selectedRank, setSelectedRank] = useState(null);
  const [militares, setMilitares] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await userService.getUsers();
        setMilitares(data.filter(m => m.status !== 'Exonerado' && m.ativo !== false));
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingUsers(false);
      }
    }
    load();
  }, []);

  const officers = getOfficerRanks();
  const ncos = getNCORanks();
  const enlisted = getEnlistedRanks();

  const RankSection = ({ title, subtitle, ranks: sectionRanks, accentColor, badgeStyle }) => (
    <div className="mb-12">
      <div className="flex items-center gap-4 mb-6">
        <div className={`w-1.5 h-10 rounded-full bg-gradient-to-b ${accentColor}`} />
        <div>
          <h2 className="text-xl font-black text-gray-100 tracking-wider uppercase">{title}</h2>
          <p className="text-xs text-gray-500 tracking-widest uppercase mt-0.5">{subtitle}</p>
        </div>
      </div>
      <div className="space-y-2">
        {sectionRanks.map((rank, i) => (
          <button
            key={rank.id}
            onClick={() => setSelectedRank(rank)}
            className={`w-full rank-card ${
              rank.category === 'officer' ? 'officer' : rank.category === 'nco' ? 'nco' : 'enlisted'
            } group`}
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <div className="flex items-center gap-4">
              <div className="w-14 text-right flex-shrink-0">
                <span className="text-lg font-mono" style={{ color: rank.color }}>
                  {rank.insignia}
                </span>
              </div>
              <div className="h-8 w-px bg-mil-border" />
              <div className="flex-1 text-left">
                <p className="text-sm font-black text-gray-200 tracking-wide group-hover:text-gold transition-colors">
                  {rank.name}
                </p>
                <p className="text-[10px] text-gray-600 font-mono uppercase tracking-widest">
                  {rank.abbreviation}
                </p>
              </div>
              <MdArrowForward className="text-gray-600 group-hover:text-gold transition-all group-hover:translate-x-1" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-16 animate-fadeIn">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-mil-dark border-2 border-gold/30 shadow-gold-lg mb-6">
            <img src="/logos/logo.png" alt="Logo" className="w-full h-full object-contain text-gold text-3xl" />
          </div>
          <p className="text-gold text-xs tracking-[6px] uppercase font-bold mb-3">Estrutura de Comando</p>
          <h1 className="text-3xl sm:text-5xl font-black text-white mb-4">
            Hierarquia <span className="text-gold-gradient">Militar</span>
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Conheça cada posto e graduação do 2º Batalhão de Polícia de Choque Anchieta. 
            Clique em uma patente para ver detalhes.
          </p>
        </div>

        {/* Ranks */}
        <div className="animate-fadeInUp">
          <RankSection 
            title="Oficiais" 
            subtitle="Postos do quadro de oficiais"
            ranks={officers}
            accentColor="from-gold to-gold-dark"
            badgeStyle="badge-gold"
          />
          <RankSection 
            title="Graduados" 
            subtitle="Subtenentes e sargentos"
            ranks={ncos}
            accentColor="from-army-green-light to-army-green"
            badgeStyle="badge-green"
          />
          <RankSection 
            title="Praças" 
            subtitle="Cabos e soldados"
            ranks={enlisted}
            accentColor="from-gray-400 to-gray-600"
            badgeStyle="badge-steel"
          />
        </div>
      </div>

      {/* Rank Detail Modal */}
      {selectedRank && (
        <div className="modal-overlay" onClick={() => setSelectedRank(null)}>
          <div className="modal-box !max-w-lg" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-800">
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-mono border"
                  style={{ color: selectedRank.color, borderColor: selectedRank.color + '40', background: selectedRank.color + '15' }}
                >
                  {selectedRank.insignia}
                </div>
                <div>
                  <h2 className="text-lg font-black text-gray-100 tracking-wide">{selectedRank.name}</h2>
                  <p className="text-xs text-gray-500 font-mono uppercase tracking-widest">{selectedRank.abbreviation}</p>
                </div>
              </div>
              <button onClick={() => setSelectedRank(null)} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors">
                <MdClose size={24} />
              </button>
            </div>

            {/* Responsibilidades */}
            <div className="mb-6">
              <h3 className="flex items-center gap-2 text-sm font-bold text-gold uppercase tracking-wider mb-3">
                <MdStar /> Responsabilidades
              </h3>
              <ul className="space-y-2">
                {selectedRank.responsibilities.map((resp, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                    <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: selectedRank.color }} />
                    {resp}
                  </li>
                ))}
              </ul>
            </div>

            {/* Funções */}
            <div className="mb-6">
              <h3 className="flex items-center gap-2 text-sm font-bold text-army-green-light uppercase tracking-wider mb-3">
                <MdPerson /> Funções
              </h3>
              <div className="flex flex-wrap gap-2">
                {selectedRank.functions.map((fn, i) => (
                  <span key={i} className="badge-steel !text-[11px] !px-3 !py-1">
                    {fn}
                  </span>
                ))}
              </div>
            </div>

            {/* Ocupante */}
            <div className="p-4 rounded-xl bg-mil-black/60 border border-mil-border">
              <p className="text-[10px] text-gray-600 uppercase tracking-widest font-bold mb-2">Ocupantes Atuais</p>
              {loadingUsers ? (
                <div className="flex justify-center py-2"><div className="spinner !w-5 !h-5" /></div>
              ) : (
                <div className="space-y-3 mt-3">
                  {militares.filter(m => m.cargo === selectedRank.id).length > 0 ? (
                    militares.filter(m => m.cargo === selectedRank.id).map(m => (
                      <div key={m.id} className="flex items-center gap-3">
                        {m.foto_url ? (
                          <img src={m.foto_url} alt={m.nome} className="w-8 h-8 rounded-full object-cover border border-gray-700" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-mil-dark border border-gray-700 flex items-center justify-center text-xs font-bold text-gray-400">
                            {m.nome?.charAt(0) || '?'}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-bold text-gray-200">{m.nome}</p>
                          <p className="text-[10px] text-gray-500 uppercase tracking-widest">{m.companhia || 'Sem companhia'}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-sm italic">Nenhum militar ocupando esta patente no momento.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


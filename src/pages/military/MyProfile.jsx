import { useAuth } from '../../contexts/AuthContext';
import Topbar from '../../components/layout/Topbar';
import { cargoLabels, cargoBadgeClass, getRankById } from '../../data/ranks';
import { MdPerson, MdStar, MdSchool, MdGavel, MdCalendarMonth, MdMilitaryTech, MdCheckCircle } from 'react-icons/md';
import { GiMedal } from 'react-icons/gi';
import { useState } from 'react';

export default function MyProfile() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('info');

  const formatTime = (totalSegundos) => {
    if (!totalSegundos) return '0h';
    const horas = Math.floor(totalSegundos / 3600);
    const minutos = Math.floor((totalSegundos % 3600) / 60);
    return `${horas}h ${minutos}m`;
  };

  const tabs = [
    { id: 'info', label: 'Informações', icon: <MdPerson /> },
    { id: 'historico', label: 'Histórico', icon: <MdStar /> },
    { id: 'cursos', label: 'Cursos', icon: <MdSchool /> },
    { id: 'medalhas', label: 'Medalhas', icon: <GiMedal /> },
    { id: 'advertencias', label: 'Advertências', icon: <MdGavel /> },
  ];

  const rankData = getRankById(user?.patente || user?.cargo);

  return (
    <div className="animate-fadeIn">
      <Topbar title="MINHA FICHA" subtitle="Ficha Militar Completa" />

      {/* Profile Header */}
      <div className="hero-card p-6 sm:p-8 mb-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-army-green-dark to-army-green flex items-center justify-center text-white font-black text-4xl border-2 border-gold/30 shadow-gold-lg overflow-hidden">
            {user?.foto_url ? (
              <img src={user.foto_url} alt={user.nome} className="w-full h-full object-cover" />
            ) : (
              user?.nome?.charAt(0)
            )}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-2xl font-black text-white tracking-wide">{user?.nome}</h2>
            <p className="text-gold font-mono text-sm mt-1">{rankData?.insignia} {rankData?.name || user?.patente || 'Recruta'}</p>
            <div className="flex items-center gap-3 mt-3 flex-wrap justify-center sm:justify-start">
              <span className={cargoBadgeClass[user?.cargo] || 'badge-steel'}>{cargoLabels[user?.cargo] || user?.cargo}</span>
              <span className="badge-steel">ID: {user?.cpf}</span>
              <span className="badge-green">{user?.status || 'Ativo'}</span>
            </div>
          </div>
          <div className="hidden lg:grid grid-cols-2 gap-4 text-center">
            {[
              { label: 'Companhia', value: user?.companhia || 'Não Designado' },
              { label: 'Ingresso', value: user?.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : '—' },
              { label: 'WhatsApp', value: user?.discord || '—' },
              { label: 'Banco de Horas', value: formatTime(user?.banco_horas) || user?.horas_servico || '0h' },
            ].map((item, i) => (
              <div key={i} className="px-4 py-2 rounded-lg bg-mil-black/40 border border-mil-border">
                <p className="text-[9px] text-gray-600 uppercase tracking-widest font-bold">{item.label}</p>
                <p className="text-sm font-bold text-gray-300 mt-0.5">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto mb-6 pb-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-army-green/20 text-army-green-light border border-army-green/40'
                : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mil-card animate-fadeIn">
        {activeTab === 'info' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gold uppercase tracking-widest mb-4">Dados Pessoais</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Nome RP', value: user?.nome },
                { label: 'Passaporte/ID', value: user?.cpf },
                { label: 'WhatsApp', value: user?.discord || '—' },
                { label: 'Patente Atual', value: rankData ? `${rankData.insignia} ${rankData.name}` : user?.patente },
                { label: 'Companhia', value: user?.companhia || 'Não Designado' },
                { label: 'Data de Ingresso', value: user?.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : '—' },
                { label: 'Status Operacional', value: user?.status || 'Ativo' },
                { label: 'Observações de Comando', value: user?.observacoes || 'Nenhuma observação cadastrada.' }
              ].map((field, i) => (
                <div key={i} className="p-3 rounded-lg bg-mil-black/40 border border-mil-border">
                  <p className="text-[9px] text-gray-600 uppercase tracking-widest font-bold mb-1">{field.label}</p>
                  <p className="text-sm font-bold text-gray-200">{field.value || '—'}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'historico' && (
          <div>
            <h3 className="text-sm font-bold text-gold uppercase tracking-widest mb-4">Histórico de Carreira</h3>
            {user?.historico && user.historico.length > 0 ? (
              <div className="relative border-l border-gray-800 ml-4 space-y-6">
                {user.historico.map((h, idx) => (
                  <div key={idx} className="relative pl-6">
                    <div className="absolute -left-[6px] top-1.5 w-3 h-3 rounded-full bg-army-green border-2 border-mil-dark" />
                    <span className="text-[10px] text-gray-500 font-mono">{new Date(h.data).toLocaleString('pt-BR')}</span>
                    <h4 className="text-xs font-black text-gray-200 uppercase tracking-widest mt-1">{h.tipo}</h4>
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">{h.descricao}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-600">
                <MdStar className="text-4xl mx-auto mb-3 text-gray-700" />
                <p className="text-sm">Nenhum evento registrado no histórico.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'cursos' && (
          <div>
            <h3 className="text-sm font-bold text-gold uppercase tracking-widest mb-4">Cursos Concluídos</h3>
            {user?.cursos && user.cursos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {user.cursos.map((c, idx) => (
                  <div key={idx} className="bg-mil-black/50 p-4 rounded-xl border border-gray-800 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-black text-gray-200 uppercase tracking-widest">{c.nome}</h4>
                      <p className="text-[10px] text-gray-500 font-mono mt-1">Concluído em: {new Date(c.data).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <span className="badge-green flex items-center gap-1 !text-[9px]"><MdCheckCircle /> Certificado</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-600">
                <MdSchool className="text-4xl mx-auto mb-3 text-gray-700" />
                <p className="text-sm">Você ainda não concluiu nenhum curso.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'medalhas' && (
          <div>
            <h3 className="text-sm font-bold text-gold uppercase tracking-widest mb-4">Medalhas e Condecorações</h3>
            {user?.condecoracoes && user.condecoracoes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {user.condecoracoes.map((m, idx) => (
                  <div key={idx} className="bg-mil-black/50 p-4 rounded-xl border border-gray-800 text-center flex flex-col items-center">
                    <GiMedal className="text-3xl text-gold mb-2" />
                    <h4 className="text-xs font-black text-gray-200 uppercase tracking-widest">{m.nome}</h4>
                    <p className="text-[10px] text-gray-500 font-mono mt-1">Concedida em: {new Date(m.data).toLocaleDateString('pt-BR')}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-600">
                <GiMedal className="text-4xl mx-auto mb-3 text-gray-700" />
                <p className="text-sm">Nenhuma medalha registrada.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'advertencias' && (
          <div>
            <h3 className="text-sm font-bold text-gold uppercase tracking-widest mb-4">Advertências Registradas</h3>
            {user?.advertencias && user.advertencias.length > 0 ? (
              <div className="space-y-3">
                {user.advertencias.map((adv, idx) => (
                  <div key={idx} className="bg-danger/5 border border-danger/20 p-4 rounded-xl flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                      <span className="badge-danger !text-[9px]">{adv.tipo}</span>
                      <span className="text-[10px] text-gray-500 font-mono">{new Date(adv.data).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <p className="text-xs text-gray-300 mt-2 font-medium">Motivo: {adv.motivo}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-600">
                <MdGavel className="text-4xl mx-auto mb-3 text-gray-700" />
                <p className="text-sm">Nenhuma advertência registrada. Conduta exemplar! ✅</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

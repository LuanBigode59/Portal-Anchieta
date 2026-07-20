import { useState, useEffect } from 'react';
import { MdAssignment, MdGavel, MdWarning, MdBlock, MdSearch, MdTrendingUp, MdHistory } from 'react-icons/md';
import { GiScales } from 'react-icons/gi';

export default function CorregedoriaPanel() {
  const [stats, setStats] = useState({
    emAndamento: 12,
    concluidos: 45,
    denuncias: 8,
    advertencias: 23
  });

  const [loading, setLoading] = useState(false);

  return (
    <div className="animate-fadeIn pb-10">
      
      {/* Header */}
      <div className="mb-8 border-b border-red-900/30 pb-4">
        <h1 className="text-2xl font-black text-white uppercase tracking-widest flex items-center gap-3">
          <GiScales className="text-red-600" /> Painel Geral
        </h1>
        <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-mono">
          Visão Executiva de Justiça e Disciplina
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Processos em Andamento', value: stats.emAndamento, icon: <MdAssignment />, color: 'text-red-500', border: 'border-red-900/50' },
          { label: 'Denúncias Pendentes', value: stats.denuncias, icon: <MdWarning />, color: 'text-choque-yellow', border: 'border-choque-yellow/50' },
          { label: 'Processos Concluídos', value: stats.concluidos, icon: <MdSearch />, color: 'text-army-green-light', border: 'border-army-green/50' },
          { label: 'Advertências Aplicadas', value: stats.advertencias, icon: <MdGavel />, color: 'text-gray-400', border: 'border-gray-700' },
        ].map((stat, i) => (
          <div key={i} className={`bg-[#0a0a0a] border ${stat.border} p-5 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.5)] animate-fadeInUp`} style={{ animationDelay: `${i * 0.1}s`, animationFillMode: 'both' }}>
            <div className={`text-2xl mb-3 ${stat.color}`}>{stat.icon}</div>
            <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Two columns: Atividades Recentes & Gráficos/Avisos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Atividades Recentes */}
        <div className="lg:col-span-2 bg-[#0a0a0a] border border-gray-800 rounded-xl p-5">
          <h2 className="text-xs font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-gray-800 pb-2">
            <MdHistory className="text-red-600" /> Movimentações Recentes
          </h2>
          
          <div className="space-y-4">
            {[
              { id: 'IPM-2026/04', desc: 'Depoimento adicionado ao processo.', time: 'Há 2 horas', status: 'Em Investigação' },
              { id: 'DEN-2026/12', desc: 'Nova denúncia anônima registrada.', time: 'Há 5 horas', status: 'Triagem' },
              { id: 'SAD-2026/01', desc: 'Processo concluído. Advertência grave aplicada.', time: 'Ontem', status: 'Concluído' },
              { id: 'IPM-2025/89', desc: 'Processo arquivado por falta de provas.', time: 'Ontem', status: 'Arquivado' },
            ].map((mov, i) => (
              <div key={i} className="flex gap-4 items-start border-l-2 border-red-900/50 pl-3">
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-black text-red-400">{mov.id}</span>
                    <span className="text-[9px] text-gray-600 font-mono">{mov.time}</span>
                  </div>
                  <p className="text-[11px] text-gray-300 leading-relaxed">{mov.desc}</p>
                  <span className="inline-block mt-1 text-[8px] uppercase tracking-widest font-bold text-gray-500 bg-gray-900 px-2 py-0.5 rounded border border-gray-800">
                    {mov.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          <button className="w-full mt-5 py-2 border border-red-900/30 text-red-500 text-[10px] uppercase tracking-widest font-bold hover:bg-red-900/10 transition-colors rounded">
            Ver Todo o Histórico
          </button>
        </div>

        {/* Alertas Internos */}
        <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-5">
           <h2 className="text-xs font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-gray-800 pb-2">
            <MdBlock className="text-red-600" /> Alertas Disciplinares
          </h2>

          <div className="space-y-3">
            <div className="bg-red-950/30 border border-red-900/50 p-3 rounded">
              <h3 className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">Prazos Vencendo</h3>
              <p className="text-[10px] text-gray-400">O processo IPM-2026/02 atinge o prazo máximo de instrução em 2 dias.</p>
            </div>
            
            <div className="bg-choque-yellow/10 border border-choque-yellow/30 p-3 rounded">
              <h3 className="text-[10px] font-black text-choque-yellow uppercase tracking-widest mb-1">Acúmulo de Denúncias</h3>
              <p className="text-[10px] text-gray-400">Houve um aumento de 15% nas denúncias de conduta na Rocam neste mês.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

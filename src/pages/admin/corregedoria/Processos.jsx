import { useState } from 'react';
import { MdSearch, MdFilterList, MdAdd, MdAssignment, MdGavel, MdVisibility } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

const mockProcessos = [
  { id: 'IPM-2026/04', tipo: 'Inquérito Policial Militar', militar: 'Sd. Lucas Oliveira', status: 'Em Investigação', data: '2026-07-10', responsavel: 'Maj. Silva' },
  { id: 'SAD-2026/01', tipo: 'Sindicância Administrativa', militar: 'Cb. Mendes', status: 'Concluído', data: '2026-06-15', responsavel: 'Ten Cel. Luan' },
  { id: 'IPM-2025/89', tipo: 'Inquérito Policial Militar', militar: 'Sd. Rafael Costa', status: 'Arquivado', data: '2025-11-20', responsavel: 'Maj. Silva' },
  { id: 'DEN-2026/12', tipo: 'Denúncia de Conduta', militar: 'Em Apuração', status: 'Triagem', data: '2026-07-14', responsavel: 'Aguardando Designação' },
];

export default function ProcessosCorregedoria() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  
  return (
    <div className="animate-fadeIn pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-red-900/30 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-widest flex items-center gap-3">
            <MdAssignment className="text-red-600" /> Processos Disciplinares
          </h1>
          <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-mono">
            Gerenciamento de IPMs, Sindicâncias e Denúncias
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-red-900 text-white text-[10px] font-bold uppercase tracking-widest rounded hover:bg-red-800 transition-colors">
          <MdAdd className="text-lg" /> Novo Processo
        </button>
      </div>

      {/* Filters */}
      <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-4 sm:p-5 mb-8 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-xl" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por número, militar ou responsável..."
            className="w-full pl-12 pr-4 py-3 bg-[#111] border border-gray-800 rounded-lg text-gray-200 text-sm font-medium transition-all duration-300 outline-none focus:border-red-900/50"
          />
        </div>
        <div className="flex gap-4 sm:w-1/3">
          <div className="flex-1 relative">
             <MdFilterList className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg pointer-events-none" />
             <select className="w-full pl-12 pr-8 py-3 bg-[#111] border border-gray-800 rounded-lg text-gray-400 text-sm appearance-none outline-none focus:border-red-900/50">
               <option value="">Status: Todos</option>
               <option value="Em Investigação">Em Investigação</option>
               <option value="Concluído">Concluído</option>
               <option value="Arquivado">Arquivado</option>
             </select>
          </div>
        </div>
      </div>

      {/* Tabela de Processos */}
      <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="bg-[#111] text-gray-500 font-bold text-[10px] uppercase tracking-widest py-4 px-5 border-b border-gray-800">Número</th>
                <th className="bg-[#111] text-gray-500 font-bold text-[10px] uppercase tracking-widest py-4 px-5 border-b border-gray-800">Tipo</th>
                <th className="bg-[#111] text-gray-500 font-bold text-[10px] uppercase tracking-widest py-4 px-5 border-b border-gray-800">Militar/Envolvido</th>
                <th className="bg-[#111] text-gray-500 font-bold text-[10px] uppercase tracking-widest py-4 px-5 border-b border-gray-800">Responsável</th>
                <th className="bg-[#111] text-gray-500 font-bold text-[10px] uppercase tracking-widest py-4 px-5 border-b border-gray-800">Status</th>
                <th className="bg-[#111] text-gray-500 font-bold text-[10px] uppercase tracking-widest py-4 px-5 border-b border-gray-800 text-right">Ação</th>
              </tr>
            </thead>
            <tbody>
              {mockProcessos.map((proc, i) => (
                <tr key={proc.id} className="border-b border-gray-800/50 hover:bg-[#111] transition-colors">
                  <td className="py-4 px-5">
                    <span className="text-xs font-black text-red-400">{proc.id}</span>
                    <br/><span className="text-[9px] text-gray-600 font-mono">{proc.data}</span>
                  </td>
                  <td className="py-4 px-5">
                    <span className="text-xs text-gray-300 font-bold">{proc.tipo}</span>
                  </td>
                  <td className="py-4 px-5">
                    <span className="text-xs text-gray-400">{proc.militar}</span>
                  </td>
                  <td className="py-4 px-5">
                    <span className="text-xs text-gray-400">{proc.responsavel}</span>
                  </td>
                  <td className="py-4 px-5">
                    <span className={`inline-block text-[9px] uppercase tracking-widest font-bold px-2 py-1 rounded border ${
                      proc.status === 'Concluído' ? 'bg-army-green/10 text-army-green border-army-green/30' :
                      proc.status === 'Arquivado' ? 'bg-gray-800 text-gray-400 border-gray-700' :
                      proc.status === 'Triagem' ? 'bg-choque-yellow/10 text-choque-yellow border-choque-yellow/30' :
                      'bg-red-900/20 text-red-400 border-red-900/50'
                    }`}>
                      {proc.status}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-right">
                    <button 
                      onClick={() => navigate(`/corregedoria/processos/${encodeURIComponent(proc.id)}`)}
                      className="inline-flex items-center justify-center p-2 rounded-lg bg-[#1a1a1a] border border-gray-700 text-gray-400 hover:text-white hover:border-red-500 transition-all"
                      title="Visualizar Processo"
                    >
                      <MdVisibility className="text-lg" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  );
}

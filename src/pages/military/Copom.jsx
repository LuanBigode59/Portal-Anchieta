import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import {
  MdRadar, MdWarning, MdSecurity, MdLocationOn, MdDirectionsCar, 
  MdHeadsetMic, MdAddAlert, MdLocalPolice, MdGpsFixed, MdCrisisAlert, MdAssignment
} from 'react-icons/md';
import { GiMilitaryFort, GiRifle } from 'react-icons/gi';

// --- Mock Data ---
const mockEquipes = [
  { id: 'alpha', name: 'Equipe Alpha', status: 'Em Patrulha', via: 'CHQ-01', local: 'Zona Norte', integr: 4, color: 'text-army-green-light', border: 'border-army-green-light' },
  { id: 'bravo', name: 'Equipe Bravo', status: 'Em Acompanhamento', via: 'CHQ-02', local: 'Avenida Principal', integr: 4, color: 'text-choque-yellow', border: 'border-choque-yellow' },
  { id: 'charlie', name: 'Equipe Charlie', status: 'Disponível', via: 'CHQ-05', local: 'Base', integr: 3, color: 'text-gray-400', border: 'border-gray-500' },
  { id: 'delta', name: 'Equipe Delta', status: 'Em Confronto', via: 'CHQ-07', local: 'Comunidade Sul', integr: 5, color: 'text-red-500', border: 'border-red-500' },
];

const mockChamados = [
  { id: 1, type: 'Roubo a Carro Forte', local: 'BR-116 Km 12', time: 'Há 2 min', priority: 'CRÍTICA' },
  { id: 2, type: 'Apoio a Viatura', local: 'Centro Comercial', time: 'Há 5 min', priority: 'ALTA' },
  { id: 3, type: 'Suspeitos Armados', local: 'Praça Central', time: 'Há 12 min', priority: 'MÉDIA' },
];

const mockLogs = [
  { time: '21:30:15', msg: 'Equipe Alpha reporta início de patrulhamento', type: 'info' },
  { time: '21:35:42', msg: 'Copom: QRR Avenida Principal, veículo suspeito em fuga', type: 'alert' },
  { time: '21:36:10', msg: 'Equipe Bravo iniciando acompanhamento tático', type: 'action' },
  { time: '21:40:05', msg: 'Equipe Delta solicitando apoio aéreo imediato', type: 'critical' },
];

export default function Copom() {
  const { user } = useAuth();
  const { sendNotification } = useNotifications();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAction = (action) => {
    sendNotification(`Comando: ${action} inicializada/solicitada.`, 'comunicado');
  };

  return (
    <div className="min-h-screen bg-[#020202] text-gray-300 font-mono overflow-hidden relative pb-10">
      {/* Background HUD Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: 'linear-gradient(rgba(74, 140, 52, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(74, 140, 52, 0.2) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,0.9)] z-10" />

      {/* HEADER BAR */}
      <div className="relative z-20 border-b border-army-green/30 bg-[#050505] p-3 flex justify-between items-center shadow-[0_4px_30px_rgba(74,140,52,0.1)]">
        <div className="flex items-center gap-4">
          <div className="relative flex items-center justify-center w-12 h-12 border border-army-green-light rounded bg-[#0a0f0a]">
            <MdRadar className="text-3xl text-army-green-light animate-spin-slow" />
            <div className="absolute inset-0 border border-army-green animate-ping opacity-50" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-[0.2em] uppercase">C.O.P.O.M.</h1>
            <p className="text-[10px] text-army-green-light tracking-widest">Centro de Operações Militares — 2º BP CHOQUE</p>
          </div>
        </div>
        
        <div className="flex flex-col items-end">
          <p className="text-xl font-black text-gold drop-shadow-[0_0_8px_rgba(201,168,76,0.5)] tracking-widest">
            {currentTime.toLocaleTimeString('pt-BR')}
          </p>
          <p className="text-[10px] text-gray-500 tracking-widest uppercase">
            {currentTime.toLocaleDateString('pt-BR')}
          </p>
        </div>
      </div>

      {/* QUICK ACTIONS ROW */}
      <div className="relative z-20 p-3 bg-[#0a0a0a] border-b border-gray-900 flex gap-2 overflow-x-auto custom-scrollbar">
        {[
          { label: 'NOVA OPERAÇÃO', icon: <MdLocalPolice />, color: 'border-army-green-light text-army-green-light hover:bg-army-green/20' },
          { label: 'NOVO BLOQUEIO', icon: <MdSecurity />, color: 'border-choque-yellow text-choque-yellow hover:bg-choque-yellow/20' },
          { label: 'NOVA PATRULHA', icon: <MdDirectionsCar />, color: 'border-blue-400 text-blue-400 hover:bg-blue-400/20' },
          { label: 'ENVIAR ALERTA', icon: <MdAddAlert />, color: 'border-red-500 text-red-500 hover:bg-red-500/20' },
          { label: 'ENCERRAR OP', icon: <MdCrisisAlert />, color: 'border-gray-500 text-gray-400 hover:bg-gray-800' },
        ].map((btn, i) => (
          <button 
            key={i}
            onClick={() => handleAction(btn.label)}
            className={`flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-widest border bg-[#050505] transition-colors whitespace-nowrap ${btn.color}`}
            style={{ boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)' }}
          >
            {btn.icon} {btn.label}
          </button>
        ))}
      </div>

      {/* MAIN GRID */}
      <div className="relative z-20 p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 auto-rows-min">

        {/* SIDE PANEL: SITUAÇÃO OPERACIONAL (Col span 3) */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          
          {/* Status Geral */}
          <div className="border border-gray-800 bg-[#0a0a0a]/80 backdrop-blur p-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-1 opacity-20"><img src="/logos/logo.png" alt="Logo" className="w-full h-full object-contain text-6xl" /></div>
            <h2 className="text-[10px] text-gray-500 uppercase tracking-widest mb-3 border-b border-gray-800 pb-1">Nível Operacional</h2>
            
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-2xl font-black text-choque-yellow drop-shadow-[0_0_10px_rgba(255,215,0,0.5)] animate-pulse">
                  ATENÇÃO
                </span>
                <span className="text-[9px] text-gray-400 uppercase tracking-widest mt-1">Situação de Risco Moderado</span>
              </div>
              <div className="w-4 h-16 bg-gray-900 border border-gray-700 relative overflow-hidden">
                <div className="absolute bottom-0 w-full h-[60%] bg-choque-yellow" style={{ boxShadow: '0 0 15px #FFD700' }} />
              </div>
            </div>
          </div>

          {/* Equipes */}
          <div className="border border-gray-800 bg-[#0a0a0a]/80 backdrop-blur p-4 flex-1">
            <h2 className="text-[10px] text-gray-500 uppercase tracking-widest mb-3 border-b border-gray-800 pb-1 flex items-center gap-2">
              <MdGpsFixed className="text-army-green" /> Situação das Equipes
            </h2>
            <div className="space-y-3">
              {mockEquipes.map(eq => (
                <div key={eq.id} className={`border-l-4 ${eq.border} bg-[#111] p-3 shadow-inner`}>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className={`text-xs font-black uppercase tracking-widest ${eq.color}`}>{eq.name}</h3>
                    <span className="text-[8px] bg-gray-900 border border-gray-700 px-1.5 py-0.5">{eq.via}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[9px] text-gray-400 uppercase tracking-wider">
                    <div className="flex items-center gap-1"><GiRifle /> {eq.integr} OPERADORES</div>
                    <div className="flex items-center gap-1 truncate"><MdLocationOn /> {eq.local}</div>
                  </div>
                  <div className="mt-2 text-[10px] font-bold text-white border-t border-gray-800 pt-1 flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${eq.status.includes('Confronto') ? 'bg-red-500 animate-ping' : 'bg-current'}`} />
                    {eq.status}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* CENTRAL AREA: OPERAÇÕES & CHAMADOS (Col span 6) */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          
          {/* Mapa Tático / Radar Visual (Placeholder estilizado) */}
          <div className="border border-gray-800 bg-[#0a0a0a]/80 backdrop-blur h-64 lg:h-[400px] relative overflow-hidden flex flex-col">
            <h2 className="text-[10px] text-gray-500 uppercase tracking-widest m-4 mb-0 border-b border-gray-800 pb-1 z-10 bg-[#0a0a0a]">
              Painel Tático — Mapa Operacional
            </h2>
            <div className="flex-1 relative flex items-center justify-center">
              {/* Radar Circles */}
              <div className="absolute w-full h-full border border-army-green/10 rounded-full scale-[2]" />
              <div className="absolute w-64 h-64 border border-army-green/20 rounded-full" />
              <div className="absolute w-32 h-32 border border-army-green/40 rounded-full" />
              {/* Sweeping line */}
              <div className="absolute w-64 h-1 bg-gradient-to-r from-transparent to-army-green origin-left animate-spin-slow" style={{ animationDuration: '4s' }} />
              
              {/* Blips */}
              <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-choque-yellow rounded-full shadow-[0_0_10px_#FFD700] animate-pulse" />
              <div className="absolute bottom-1/3 right-1/4 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_10px_red] animate-ping" />
              <div className="absolute top-1/2 left-2/3 w-2 h-2 bg-army-green-light rounded-full shadow-[0_0_10px_#4a8c34]" />

              {/* Data Overlay */}
              <div className="absolute top-4 right-4 bg-black/60 border border-red-900 p-2 text-[9px] text-red-500 backdrop-blur">
                <p className="font-bold flex items-center gap-1"><MdWarning /> FOCO DE CONFLITO ATIVO</p>
                <p>COORD: -23.5505, -46.6333</p>
              </div>
            </div>
            {/* Grid overlay */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik0wIDM5LjV2MWg0MHYtMXpNMCAtLjV2MWg0MHYtMXoiIGZpbGw9InJnYmEoNzQsIDE0MCwgNTIsIDAuMSkiLz48cGF0aCBkPSJNMzkuNSAwdi0uNWgxdjQxSDM5LjV6TS0uNSAwdi0uNWgxdjQxSC0uNXoiIGZpbGw9InJnYmEoNzQsIDE0MCwgNTIsIDAuMSkiLz48L3N2Zz4=')] opacity-30 pointer-events-none" />
          </div>

          {/* Chamados Prioritários */}
          <div className="border border-red-900/50 bg-[#1a0505]/80 backdrop-blur p-4">
            <h2 className="text-[10px] text-red-500 uppercase tracking-widest mb-3 border-b border-red-900/50 pb-1 flex items-center gap-2">
              <MdWarning className="animate-pulse" /> Despachos Prioritários
            </h2>
            <div className="flex flex-col gap-2">
              {mockChamados.map(cham => (
                <div key={cham.id} className="flex items-center justify-between bg-black/40 border border-red-900/30 p-2 hover:bg-red-900/20 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-red-500 bg-red-950 px-2 py-1">{cham.priority}</span>
                    <div>
                      <p className="text-xs text-white font-bold group-hover:text-red-400 transition-colors">{cham.type}</p>
                      <p className="text-[9px] text-gray-500">{cham.local}</p>
                    </div>
                  </div>
                  <span className="text-[9px] text-red-600 font-bold font-mono">{cham.time}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT PANEL: COMUNICAÇÕES & TIMELINE (Col span 3) */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          
          {/* Comunicações */}
          <div className="border border-gray-800 bg-[#0a0a0a]/80 backdrop-blur p-4 h-48 flex flex-col">
            <h2 className="text-[10px] text-gray-500 uppercase tracking-widest mb-3 border-b border-gray-800 pb-1 flex items-center gap-2">
              <MdHeadsetMic className="text-blue-400" /> Transmissões
            </h2>
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
              <div className="text-[10px] bg-[#111] border border-gray-800 p-2 text-gray-400">
                <span className="text-blue-400 font-bold block mb-1">CMD &gt; TODAS EQUIPES:</span>
                Iniciar operação bloqueio nas vias arteriais. Status de alerta elevado.
              </div>
              <div className="text-[10px] bg-[#111] border border-gray-800 p-2 text-gray-400">
                <span className="text-army-green-light font-bold block mb-1">ALPHA &gt; CMD:</span>
                Ciente. Posicionamento na base norte concluído.
              </div>
            </div>
            <div className="mt-2 flex gap-2">
              <input type="text" placeholder="Transmitir..." className="bg-[#111] border border-gray-700 w-full px-2 py-1 text-[10px] outline-none text-white focus:border-blue-500" />
              <button className="bg-blue-900 text-white px-3 text-[10px] font-bold hover:bg-blue-800">TX</button>
            </div>
          </div>

          {/* Últimas Ocorrências (Timeline) */}
          <div className="border border-gray-800 bg-[#0a0a0a]/80 backdrop-blur p-4 flex-1 flex flex-col">
            <h2 className="text-[10px] text-gray-500 uppercase tracking-widest mb-3 border-b border-gray-800 pb-1 flex items-center gap-2">
              <MdAssignment className="text-gold" /> Log Operacional
            </h2>
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
              {mockLogs.map((log, i) => {
                let colorClass = 'text-gray-400 border-gray-700';
                if (log.type === 'alert') colorClass = 'text-choque-yellow border-choque-yellow';
                if (log.type === 'action') colorClass = 'text-blue-400 border-blue-500';
                if (log.type === 'critical') colorClass = 'text-red-500 border-red-500';

                return (
                  <div key={i} className="flex gap-3 items-start">
                    <span className={`text-[9px] font-bold mt-0.5 ${colorClass.split(' ')[0]}`}>{log.time}</span>
                    <div className={`border-l pl-2 pb-2 ${colorClass.split(' ')[1]}`}>
                      <p className="text-[10px] leading-tight text-gray-300">{log.msg}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

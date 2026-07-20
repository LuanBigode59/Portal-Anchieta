import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  MdSearch, MdNotifications, MdMailOutline, MdSettings, MdPerson,
  MdAdd, MdCheckCircle, MdWarning, MdArrowForward, MdMoreHoriz,
  MdOutlineAssignment, MdOutlineStarBorder, MdOutlineSecurity,
  MdOutlineEmojiEvents, MdOutlineDirectionsCar, MdOutlineSchool,
  MdOutlineGavel, MdOutlinePolicy, MdOutlineAccessTime, MdOutlineCake,
  MdOutlineCloudDone
} from 'react-icons/md';

export default function DashboardComandoGeral() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-[#0f1115] min-h-screen text-[#e0e2e6] font-sans selection:bg-gray-700 pb-12">
      
      {/* 1. BARRA SUPERIOR EXECUTIVA */}
      <div className="sticky top-0 z-50 bg-[#0f1115]/90 backdrop-blur-md border-b border-gray-800/60 px-6 py-3 flex items-center justify-between">
        <div className="flex-1 max-w-md relative">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input 
            type="text" 
            placeholder="Pesquisa global (Cmd + K)"
            className="w-full bg-[#181b21] border border-gray-800/80 rounded-md py-1.5 pl-9 pr-3 text-xs focus:outline-none focus:border-gray-600 transition-colors placeholder:text-gray-600"
          />
        </div>
        
        <div className="flex items-center gap-5 text-gray-400">
          <button className="hover:text-white transition-colors relative">
            <MdMailOutline className="text-xl" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full" />
          </button>
          <button className="hover:text-white transition-colors relative">
            <MdNotifications className="text-xl" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          </button>
          <button className="hover:text-white transition-colors">
            <MdSettings className="text-xl" />
          </button>
          <div className="w-px h-4 bg-gray-800" />
          <button className="flex items-center gap-2 hover:text-white transition-colors">
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center text-[10px] font-bold text-white">
              {user?.nome?.charAt(0) || 'L'}
            </div>
          </button>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 pt-8 space-y-8 animate-fadeIn">
        
        {/* 2. CABEÇALHO DO COMANDO */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b border-gray-800/40">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-[#181b21] border border-gray-800/80 flex items-center justify-center shadow-lg relative">
              {user?.foto ? (
                 <img src={user.foto} alt="Comando" className="w-full h-full object-cover rounded-full" />
              ) : (
                 <MdPerson className="text-4xl text-gray-600" />
              )}
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-[#0f1115]" />
            </div>
            <div>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] mb-1">
                {user?.cargo === 'tenente_coronel' || user?.cargo === 'coronel' ? 'Comando Geral' : 'Oficialato'}
              </p>
              <h1 className="text-2xl font-semibold tracking-tight text-white">Tenente Coronel Luan Bigode</h1>
              <p className="text-sm text-gray-400 mt-1">{user?.patente || 'Tenente Coronel'}</p>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2 text-right">
             <div className="flex items-center gap-2 text-xs font-medium bg-[#181b21] px-3 py-1.5 rounded-md border border-gray-800/80">
               <MdOutlineCloudDone className="text-green-500" />
               <span className="text-gray-400">Sincronizado: <span className="text-gray-200">Agora</span></span>
             </div>
             <p className="text-lg font-medium text-gray-200 tracking-wider">
               {time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute:'2-digit' })}
             </p>
             <p className="text-xs text-gray-500 uppercase tracking-widest">
               {time.toLocaleDateString('pt-BR')}
             </p>
          </div>
        </div>

        {/* 3. BLOCOS INTELIGENTES (BENTO GRID MINIMALISTA) */}
        {/* Usando grid-cols-10 para maior variação de proporções */}
        <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-4">
          
          <div className="col-span-2 bg-[#14171c] border border-gray-800/50 rounded-xl p-5 hover:border-gray-700 transition-colors">
             <MdOutlineSecurity className="text-gray-500 text-lg mb-4" />
             <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mb-1">Efetivo Ativo</p>
             <p className="text-3xl font-semibold text-gray-100">142</p>
          </div>

          <div className="col-span-2 bg-[#14171c] border border-gray-800/50 rounded-xl p-5 hover:border-gray-700 transition-colors relative overflow-hidden">
             <div className="absolute top-0 right-0 p-5"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /></div>
             <MdPerson className="text-gray-500 text-lg mb-4" />
             <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mb-1">Em Serviço (Online)</p>
             <p className="text-3xl font-semibold text-gray-100">48</p>
          </div>

          <div className="col-span-3 bg-[#14171c] border border-gray-800/50 rounded-xl p-5 hover:border-gray-700 transition-colors">
             <MdOutlineAssignment className="text-gray-500 text-lg mb-4" />
             <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mb-1">Operações & Patrulhas</p>
             <div className="flex gap-6 mt-1">
               <div>
                 <p className="text-2xl font-semibold text-gray-200">03</p>
                 <p className="text-[9px] text-gray-600 uppercase tracking-widest mt-1">Ativas</p>
               </div>
               <div>
                 <p className="text-2xl font-semibold text-gray-200">12</p>
                 <p className="text-[9px] text-gray-600 uppercase tracking-widest mt-1">Patrulhas</p>
               </div>
             </div>
          </div>

          <div className="col-span-3 bg-[#14171c] border border-gray-800/50 rounded-xl p-5 hover:border-gray-700 transition-colors">
             <MdOutlineSchool className="text-gray-500 text-lg mb-4" />
             <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mb-1">Cursos & Treinamentos</p>
             <div className="flex gap-6 mt-1">
               <div>
                 <p className="text-2xl font-semibold text-blue-400">05</p>
                 <p className="text-[9px] text-gray-600 uppercase tracking-widest mt-1">Cursos</p>
               </div>
               <div>
                 <p className="text-2xl font-semibold text-gray-200">02</p>
                 <p className="text-[9px] text-gray-600 uppercase tracking-widest mt-1">Em breve</p>
               </div>
             </div>
          </div>

          <div className="col-span-2 bg-[#14171c] border border-gray-800/50 rounded-xl p-5 hover:border-gray-700 transition-colors">
             <MdOutlineDirectionsCar className="text-gray-500 text-lg mb-4" />
             <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mb-1">Viaturas</p>
             <p className="text-3xl font-semibold text-gray-100">18</p>
             <p className="text-[9px] text-gray-600 uppercase tracking-widest mt-2">2 em manutenção</p>
          </div>

          <div className="col-span-2 bg-[#14171c] border border-gray-800/50 rounded-xl p-5 hover:border-gray-700 transition-colors">
             <MdOutlineStarBorder className="text-gray-500 text-lg mb-4" />
             <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mb-1">Promoções</p>
             <p className="text-3xl font-semibold text-gold">04</p>
             <p className="text-[9px] text-gray-600 uppercase tracking-widest mt-2">Aguardando Aval</p>
          </div>

          <div className="col-span-3 bg-[#14171c] border border-gray-800/50 rounded-xl p-5 hover:border-gray-700 transition-colors border-l-2 border-l-red-900/50">
             <MdOutlineGavel className="text-red-900/80 text-lg mb-4" />
             <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mb-1">Corregedoria & Advertências</p>
             <div className="flex gap-6 mt-1">
               <div>
                 <p className="text-2xl font-semibold text-red-400/90">02</p>
                 <p className="text-[9px] text-gray-600 uppercase tracking-widest mt-1">Processos</p>
               </div>
               <div>
                 <p className="text-2xl font-semibold text-gray-200">14</p>
                 <p className="text-[9px] text-gray-600 uppercase tracking-widest mt-1">Advertências Mês</p>
               </div>
             </div>
          </div>

          <div className="col-span-3 bg-[#14171c] border border-gray-800/50 rounded-xl p-5 hover:border-gray-700 transition-colors">
             <MdOutlineEmojiEvents className="text-gray-500 text-lg mb-4" />
             <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mb-1">Qualidade (Score)</p>
             <p className="text-3xl font-semibold text-gray-100">89<span className="text-lg text-gray-500">%</span></p>
             <p className="text-[9px] text-gray-600 uppercase tracking-widest mt-2">+2% em relação ao último mês</p>
          </div>

        </div>

        {/* 4. ÁREA CENTRAL (GRIDS VARIADOS) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
          
          {/* Lado Esquerdo (Col 8) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Timeline Horizontal Inteira */}
            <div className="bg-[#14171c] border border-gray-800/50 rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Log Operacional (Timeline)</h2>
                <button className="text-[10px] text-gray-500 hover:text-gray-300 font-medium">Ver Histórico Completo &rarr;</button>
              </div>
              <div className="relative flex items-center justify-between pb-4">
                <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-800/80 -translate-y-1/2 z-0" />
                {[
                  { time: '08:00', title: 'Troca de Turno', type: 'normal' },
                  { time: '10:30', title: 'Início Op. Visibilidade', type: 'action' },
                  { time: '14:15', title: 'Alerta: QRR Zona Sul', type: 'critical' },
                  { time: '16:00', title: 'Reunião de Comando', type: 'normal' },
                  { time: 'Agora', title: 'Sincronização', type: 'active' },
                ].map((item, i) => (
                  <div key={i} className="relative z-10 flex flex-col items-center gap-3">
                    <div className={`w-3 h-3 rounded-full border-2 border-[#14171c] ${
                      item.type === 'active' ? 'bg-green-500 animate-pulse' :
                      item.type === 'critical' ? 'bg-red-500' :
                      item.type === 'action' ? 'bg-blue-500' : 'bg-gray-600'
                    }`} />
                    <div className="text-center">
                      <p className="text-[10px] font-bold text-gray-200">{item.time}</p>
                      <p className="text-[9px] text-gray-500 mt-1 uppercase tracking-widest whitespace-nowrap">{item.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Painéis Secundários Duplos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Painel Alertas */}
              <div className="bg-[#14171c] border border-red-900/20 rounded-xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl" />
                <h2 className="text-xs font-semibold text-red-500 uppercase tracking-wider mb-5 flex items-center gap-2">
                  <MdWarning /> Alertas Prioritários
                </h2>
                <div className="space-y-4">
                  <div className="group cursor-pointer">
                    <p className="text-xs text-gray-300 font-medium group-hover:text-white transition-colors">Viatura CHQ-04 necessita manutenção urgente no motor.</p>
                    <p className="text-[9px] text-gray-600 mt-1 font-mono">Reportado há 3h</p>
                  </div>
                  <div className="w-full h-px bg-gray-800/50" />
                  <div className="group cursor-pointer">
                    <p className="text-xs text-gray-300 font-medium group-hover:text-white transition-colors">Déficit de efetivo projetado para a escala de Domingo.</p>
                    <p className="text-[9px] text-gray-600 mt-1 font-mono">Sistema Preditivo</p>
                  </div>
                </div>
              </div>

              {/* Assinaturas & Certificados */}
              <div className="bg-[#14171c] border border-gray-800/50 rounded-xl p-6">
                <h2 className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-5 flex items-center gap-2">
                  <MdOutlinePolicy /> Gaveta de Assinaturas
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-[#181b21] border border-gray-800/60 cursor-pointer hover:border-gray-600 transition-colors">
                    <div>
                      <p className="text-[11px] text-gray-200 font-medium">Boletim Interno Semanal #45</p>
                      <p className="text-[9px] text-gray-500 mt-0.5">Aguardando sua assinatura</p>
                    </div>
                    <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-[#181b21] border border-gray-800/60 cursor-pointer hover:border-gray-600 transition-colors">
                    <div>
                      <p className="text-[11px] text-gray-200 font-medium">Lote de Certificados (Tático)</p>
                      <p className="text-[9px] text-gray-500 mt-0.5">24 Certificados retidos</p>
                    </div>
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  </div>
                </div>
              </div>

            </div>
            
            {/* Pessoal e Conquistas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Recém promovidos */}
              <div className="bg-[#14171c] border border-gray-800/50 rounded-xl p-6">
                <h2 className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-5 flex items-center gap-2">
                  <MdOutlineStarBorder /> Recém Promovidos
                </h2>
                <div className="space-y-4">
                  {[
                    { nome: 'Sd. Carlos Silva', de: 'Soldado', para: 'Cabo', data: 'Ontem' },
                    { nome: 'Cb. Mendes', de: 'Cabo', para: 'Sargento', data: 'Há 3 dias' }
                  ].map((p, i) => (
                    <div key={i} className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-[#181b21] border border-gray-800 flex items-center justify-center text-[10px] text-gray-400">{p.nome.charAt(0)}</div>
                       <div>
                         <p className="text-[11px] text-gray-200 font-medium">{p.nome}</p>
                         <p className="text-[9px] text-gray-500">De {p.de} para <span className="text-gold font-semibold">{p.para}</span> &bull; {p.data}</p>
                       </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Aniversariantes e Treinamentos */}
              <div className="bg-[#14171c] border border-gray-800/50 rounded-xl p-6">
                 <h2 className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-5 flex items-center gap-2">
                  <MdOutlineCake /> Aniversários & Treinamentos
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MdOutlineCake className="text-purple-400 mt-0.5" />
                    <div>
                      <p className="text-[11px] text-gray-200 font-medium">Sd. Ferreira</p>
                      <p className="text-[9px] text-gray-500">Faz aniversário hoje (28 anos)</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MdOutlineAccessTime className="text-blue-400 mt-0.5" />
                    <div>
                      <p className="text-[11px] text-gray-200 font-medium">Instrução de Tiro Tático</p>
                      <p className="text-[9px] text-gray-500">Inicia amanhã às 08:00 (Cia Bravo)</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* Lado Direito (Col 4) - Centro de Decisão */}
          <div className="lg:col-span-4">
            <div className="bg-[#14171c] border border-gray-800/50 rounded-xl p-6 sticky top-24">
              <h2 className="text-[11px] font-bold text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                Centro de Decisão
              </h2>
              
              <div className="space-y-3">
                {[
                  { label: 'Nova Operação', icon: <MdOutlineSecurity />, color: 'hover:border-army-green/50 hover:text-army-green-light' },
                  { label: 'Novo Curso / Instrução', icon: <MdOutlineSchool />, color: 'hover:border-blue-500/50 hover:text-blue-400' },
                  { label: 'Aprovar Promoções', icon: <MdOutlineStarBorder />, color: 'hover:border-gold/50 hover:text-gold' },
                  { label: 'Nova Advertência', icon: <MdOutlineGavel />, color: 'hover:border-red-500/50 hover:text-red-400' },
                  { label: 'Emitir Certificado', icon: <MdOutlineEmojiEvents />, color: 'hover:border-gray-500 hover:text-gray-300' },
                  { label: 'Assinar Documentos', icon: <MdOutlinePolicy />, color: 'hover:border-purple-500/50 hover:text-purple-400' },
                  { label: 'Cadastrar Efetivo', icon: <MdPerson />, color: 'hover:border-gray-500 hover:text-gray-300' },
                  { label: 'Cadastrar Viatura', icon: <MdOutlineDirectionsCar />, color: 'hover:border-gray-500 hover:text-gray-300' },
                ].map((btn, i) => (
                  <button key={i} className={`w-full flex items-center justify-between p-3 rounded-lg border border-gray-800/60 bg-[#181b21] text-gray-400 text-xs font-medium transition-all duration-300 group ${btn.color}`}>
                    <span className="flex items-center gap-3">
                      <span className="text-lg opacity-70 group-hover:opacity-100 transition-opacity">{btn.icon}</span>
                      {btn.label}
                    </span>
                    <MdArrowForward className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

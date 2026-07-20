import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { pontoService } from '../../services/pontoService';
import { useNotifications } from '../../contexts/NotificationContext';
import { FiClock, FiPlay, FiSquare, FiList } from 'react-icons/fi';

export default function PontoEletronico() {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [pontoAtual, setPontoAtual] = useState(null);
  const [historico, setHistorico] = useState([]);
  const [bancoHorasLocal, setBancoHorasLocal] = useState(user?.banco_horas || 0);
  const [loading, setLoading] = useState(true);
  const [cronometro, setCronometro] = useState(0); // Em segundos

  // Carrega os dados iniciais
  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  // Efeito do cronômetro
  useEffect(() => {
    let intervalo;
    if (pontoAtual) {
      const dataEntrada = new Date(pontoAtual.entrada);
      
      // Atualiza o cronometro imediatamente
      setCronometro(Math.floor((new Date() - dataEntrada) / 1000));

      intervalo = setInterval(() => {
        setCronometro(Math.floor((new Date() - dataEntrada) / 1000));
      }, 1000);
    } else {
      setCronometro(0);
    }
    return () => clearInterval(intervalo);
  }, [pontoAtual]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [atual, hist, { data: profile }] = await Promise.all([
        pontoService.obterPontoAtual(user.id),
        pontoService.obterHistorico(user.id),
        import('../../supabaseClient').then(m => m.supabase.from('profiles').select('banco_horas').eq('id', user.id).single())
      ]);
      setPontoAtual(atual);
      setHistorico(hist);
      if (profile) setBancoHorasLocal(profile.banco_horas);
    } catch (error) {
      console.error(error);
      addNotification('erro', 'Erro ao carregar dados do ponto.');
    } finally {
      setLoading(false);
    }
  };

  const handleBaterPonto = async () => {
    try {
      if (pontoAtual) {
        // Saída
        await pontoService.baterPontoSaida(pontoAtual.id, user.id);
        addNotification('sucesso', 'Ponto encerrado com sucesso!');
      } else {
        // Entrada
        await pontoService.baterPontoEntrada(user.id);
        addNotification('sucesso', 'Ponto iniciado com sucesso!');
      }
      await loadData();
    } catch (error) {
      console.error(error);
      const errMsg = error.message || error.error_description || JSON.stringify(error);
      alert(`Erro no Ponto Eletrônico:\n${errMsg}\n\n(Tire um print ou avise o programador)`);
      addNotification('erro', `Erro: ${errMsg}`);
    }
  };

  // Formatação do tempo: segundos -> HH:MM:SS
  const formatTime = (totalSegundos) => {
    const horas = Math.floor(totalSegundos / 3600);
    const minutos = Math.floor((totalSegundos % 3600) / 60);
    const segundos = totalSegundos % 60;
    
    return [
      horas.toString().padStart(2, '0'),
      minutos.toString().padStart(2, '0'),
      segundos.toString().padStart(2, '0')
    ].join(':');
  };

  if (loading) {
    return <div className="text-center p-8 text-[var(--text-secondary)]">Carregando ponto eletrônico...</div>;
  }

  // Se bancoHorasLocal for undefined, assumimos 0.
  const bancoHorasAtuais = bancoHorasLocal || 0;
  // Se existir um ponto atual rodando, podemos estimar o total ao vivo ou mostrar apenas o salvo.
  // Vamos mostrar o salvo e o ganho atual separado.
  const bancoGeralFormatado = formatTime(bancoHorasAtuais);

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gold to-yellow-200 tracking-tight mb-2">
            Ponto Eletrônico
          </h1>
          <p className="text-gray-400 font-medium tracking-wide">
            Sistema Oficial de Registro de Horas • 2º Batalhão de Choque
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Card do Cronômetro / Botão */}
        <div className="lg:col-span-7 relative overflow-hidden rounded-[2rem] border border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl shadow-2xl flex flex-col items-center justify-center p-10 min-h-[400px]">
          {/* Decoração de fundo se ativo */}
          {pontoAtual && (
             <div className="absolute inset-0 bg-green-500/5 animate-pulse pointer-events-none z-0"></div>
          )}
          
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold/10 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-army-green/10 rounded-full blur-[100px] pointer-events-none"></div>

          <div className="text-center z-10 w-full mb-10 relative">
            {pontoAtual && (
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-[2px] border-green-500/20 rounded-full animate-[spin_10s_linear_infinite] pointer-events-none"></div>
            )}
            {pontoAtual && (
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 border border-green-500/10 rounded-full animate-[spin_15s_linear_infinite_reverse] pointer-events-none"></div>
            )}

            <h2 className="text-gold uppercase tracking-[0.3em] text-xs font-black mb-6 flex items-center justify-center gap-3">
              <FiClock className="w-4 h-4" /> 
              {pontoAtual ? 'Turno em Andamento' : 'Aguardando Início'}
            </h2>
            
            <div className="relative inline-block">
              <div className={`text-6xl md:text-8xl font-mono font-bold tracking-tighter ${pontoAtual ? 'text-green-400 drop-shadow-[0_0_30px_rgba(74,222,128,0.4)]' : 'text-gray-600'}`}>
                {formatTime(cronometro)}
              </div>
            </div>

            <div className="mt-8">
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest bg-black/50 py-2 px-6 rounded-full inline-block border border-white/5 shadow-inner">
                {pontoAtual 
                  ? `Iniciado às ${new Date(pontoAtual.entrada).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}` 
                  : 'NENHUM TURNO REGISTRADO HOJE'}
              </p>
            </div>
          </div>

          <button
            onClick={handleBaterPonto}
            className={`w-full max-w-md flex items-center justify-center gap-3 px-8 py-5 rounded-2xl font-black text-lg transition-all duration-500 uppercase tracking-[0.2em] z-10 overflow-hidden relative group ${
              pontoAtual 
                ? 'bg-red-950/80 border border-red-500/30 text-red-400 hover:bg-red-900 shadow-[0_0_40px_rgba(220,38,38,0.2)] hover:shadow-[0_0_60px_rgba(220,38,38,0.4)] hover:border-red-500/60'
                : 'bg-green-950/80 border border-green-500/30 text-green-400 hover:bg-green-900 shadow-[0_0_40px_rgba(34,197,94,0.2)] hover:shadow-[0_0_60px_rgba(34,197,94,0.4)] hover:border-green-500/60'
            }`}
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
            {pontoAtual ? (
              <>
                <FiSquare className="w-6 h-6 animate-pulse" /> ENCERRAR PATRULHA
              </>
            ) : (
              <>
                <FiPlay className="w-6 h-6 animate-pulse" /> INICIAR PATRULHA
              </>
            )}
          </button>
        </div>

        {/* Card Resumo */}
        <div className="lg:col-span-5 relative overflow-hidden rounded-[2rem] border border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl shadow-2xl p-8 flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gold/5 rounded-full blur-[80px] pointer-events-none"></div>
          
          <div>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center border border-gold/30 shadow-[0_0_20px_rgba(201,168,76,0.15)] transform -rotate-6">
                <FiList className="w-8 h-8 text-gold transform rotate-6" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white tracking-tight">Banco de Horas</h3>
                <p className="text-sm text-gold-muted font-medium mt-1 uppercase tracking-widest">Geral Acumulado</p>
              </div>
            </div>
            
            <div className="relative">
              <div className="text-5xl md:text-6xl font-mono text-white tracking-tight drop-shadow-md">
                {bancoGeralFormatado}
              </div>
              <div className="text-sm text-gray-500 font-bold uppercase tracking-[0.2em] mt-2">
                Horas Totais
              </div>
            </div>
          </div>

          <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-black to-[#111] border border-white/5 text-sm text-gray-400 leading-relaxed relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gold/50"></div>
            <p className="relative z-10">
              O seu tempo é contabilizado <strong className="text-gold">automaticamente</strong> no banco de horas da sua ficha assim que o turno é encerrado. <br/><br/>
              <span className="text-xs opacity-70">Essas horas são requisito fundamental para aprovação em cursos e promoções futuras.</span>
            </p>
          </div>
        </div>
      </div>

      {/* Histórico */}
      <div className="rounded-[2rem] border border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl shadow-2xl p-8 mt-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
             <FiList className="text-gray-300 w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Histórico de Ponto</h2>
            <p className="text-xs text-gray-500 uppercase tracking-widest mt-0.5">Seus últimos turnos registrados</p>
          </div>
        </div>

        {historico.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center border-2 border-dashed border-white/5 rounded-2xl">
            <FiClock className="w-12 h-12 text-gray-600 mb-4" />
            <p className="text-gray-400 font-medium">Nenhum registro encontrado.</p>
            <p className="text-gray-600 text-sm mt-1">Inicie uma patrulha para gerar o seu primeiro registro.</p>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar pb-4">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-white/10 text-gray-500 text-xs uppercase tracking-widest">
                  <th className="pb-4 pl-4 font-bold">Data</th>
                  <th className="pb-4 font-bold">Entrada</th>
                  <th className="pb-4 font-bold">Saída</th>
                  <th className="pb-4 font-bold">Duração</th>
                  <th className="pb-4 pr-4 font-bold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-white/5">
                {historico.map((registro) => (
                  <tr key={registro.id} className="hover:bg-white/5 transition-colors group">
                    <td className="py-4 pl-4 text-gray-200 font-medium">
                      {new Date(registro.entrada).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-4 text-gray-400 font-mono">
                      {new Date(registro.entrada).toLocaleTimeString('pt-BR')}
                    </td>
                    <td className="py-4 text-gray-400 font-mono">
                      {registro.saida ? new Date(registro.saida).toLocaleTimeString('pt-BR') : '-'}
                    </td>
                    <td className="py-4 font-mono">
                      {registro.status === 'Fechado' ? (
                        <span className="text-white font-bold">{formatTime(registro.tempo_segundos)}</span>
                      ) : (
                        <span className="text-green-400 animate-pulse font-bold flex items-center gap-2">
                           <span className="w-2 h-2 rounded-full bg-green-500"></span> Rodando
                        </span>
                      )}
                    </td>
                    <td className="py-4 pr-4 text-right">
                      <span className={`inline-flex items-center justify-center px-3 py-1 text-[10px] uppercase tracking-widest rounded-full font-bold border ${
                        registro.status === 'Aberto' 
                          ? 'bg-green-500/10 text-green-400 border-green-500/20'
                          : 'bg-white/5 text-gray-400 border-white/10'
                      }`}>
                        {registro.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}

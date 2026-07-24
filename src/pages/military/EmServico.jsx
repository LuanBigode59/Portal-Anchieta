import React, { useState, useEffect, useMemo } from 'react';
import { pontoService } from '../../services/pontoService';
import { useNotifications } from '../../contexts/NotificationContext';
import { cargoLabels, cargoBadgeClass } from '../../data/ranks';
import {
  MdAccessTime, MdSearch, MdFilterList, MdPeople, MdRefresh,
  MdSignalWifiStatusbar4Bar, MdPerson, MdLocationOn
} from 'react-icons/md';
import { FiShield, FiClock, FiUsers, FiActivity } from 'react-icons/fi';
import { GiPoliceBadge } from 'react-icons/gi';

// Formata segundos em HH:MM:SS
function formatDuration(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [
    h.toString().padStart(2, '0'),
    m.toString().padStart(2, '0'),
    s.toString().padStart(2, '0'),
  ].join(':');
}

// Retorna "há X min", "há X h", etc.
function tempoDesde(dataISO) {
  const diff = Math.floor((new Date() - new Date(dataISO)) / 1000);
  if (diff < 60) return 'agora';
  if (diff < 3600) return `há ${Math.floor(diff / 60)} min`;
  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  return `há ${h}h${m > 0 ? `${m.toString().padStart(2, '0')}min` : ''}`;
}

export default function EmServico() {
  const { addNotification } = useNotifications();
  const [militares, setMilitares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCompanhia, setFilterCompanhia] = useState('Todas');
  const [tick, setTick] = useState(0); // Para atualizar cronômetros

  // Carrega dados
  const loadData = async () => {
    try {
      setLoading(true);
      const data = await pontoService.obterMilitaresEmServico();
      setMilitares(data);
    } catch (error) {
      console.error(error);
      addNotification('erro', 'Erro ao carregar efetivo em serviço.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Auto-refresh a cada 30s
    const refreshInterval = setInterval(loadData, 30000);
    return () => clearInterval(refreshInterval);
  }, []);

  // Tick do cronômetro (a cada segundo)
  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // Companhias únicas para filtro
  const companhias = useMemo(() => {
    const set = new Set();
    militares.forEach(m => {
      const comp = m.profiles?.companhia;
      if (comp) set.add(comp);
    });
    return ['Todas', ...Array.from(set).sort()];
  }, [militares]);

  // Filtro e busca
  const filteredMilitares = useMemo(() => {
    return militares.filter(m => {
      const profile = m.profiles;
      if (!profile) return false;

      const matchSearch = search === '' ||
        profile.nome?.toLowerCase().includes(search.toLowerCase()) ||
        (cargoLabels[profile.cargo] || '').toLowerCase().includes(search.toLowerCase());

      const matchCompanhia = filterCompanhia === 'Todas' ||
        profile.companhia === filterCompanhia;

      return matchSearch && matchCompanhia;
    });
  }, [militares, search, filterCompanhia]);

  // Estatísticas
  const totalEmServico = militares.length;
  const horaMediaSegundos = totalEmServico > 0
    ? Math.floor(militares.reduce((acc, m) => {
        return acc + Math.floor((new Date() - new Date(m.entrada)) / 1000);
      }, 0) / totalEmServico)
    : 0;

  if (loading && militares.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gold/30 border-t-gold rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400 font-medium animate-pulse">Carregando efetivo em serviço...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-200 tracking-tight mb-2">
            Em Serviço
          </h1>
          <p className="text-gray-400 font-medium tracking-wide">
            Efetivo em patrulha ativa • Atualização em tempo real
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-green-400 hover:border-green-500/30 hover:bg-green-500/5 transition-all font-bold text-sm uppercase tracking-widest disabled:opacity-50"
        >
          <MdRefresh className={`text-lg ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total em Serviço */}
        <div className="relative overflow-hidden rounded-2xl border border-green-500/20 bg-gradient-to-br from-green-950/50 to-[#0a0a0a]/80 backdrop-blur-xl p-6 shadow-[0_0_30px_rgba(34,197,94,0.08)]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-[60px] pointer-events-none"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center border border-green-500/20 shadow-[0_0_20px_rgba(34,197,94,0.15)]">
              <FiUsers className="w-7 h-7 text-green-400" />
            </div>
            <div>
              <p className="text-xs text-green-400/70 font-bold uppercase tracking-[0.2em]">Em Serviço</p>
              <p className="text-4xl font-black text-green-400 tracking-tight drop-shadow-[0_0_10px_rgba(34,197,94,0.4)]">
                {totalEmServico}
              </p>
            </div>
          </div>
          {/* Pulsing dot */}
          {totalEmServico > 0 && (
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <span className="text-[10px] text-green-400/80 font-bold uppercase tracking-widest">LIVE</span>
            </div>
          )}
        </div>

        {/* Tempo Médio */}
        <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl p-6 shadow-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-[60px] pointer-events-none"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-gold/10 flex items-center justify-center border border-gold/20">
              <FiClock className="w-7 h-7 text-gold" />
            </div>
            <div>
              <p className="text-xs text-gold/60 font-bold uppercase tracking-[0.2em]">Tempo Médio</p>
              <p className="text-3xl font-mono font-bold text-white tracking-tight">
                {formatDuration(horaMediaSegundos)}
              </p>
            </div>
          </div>
        </div>

        {/* Indicador de Prontidão */}
        <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl p-6 shadow-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-[60px] pointer-events-none"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <FiActivity className="w-7 h-7 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-blue-400/60 font-bold uppercase tracking-[0.2em]">Prontidão</p>
              <p className="text-2xl font-black text-white tracking-tight">
                {totalEmServico > 0 ? (
                  <span className="text-green-400">Operacional</span>
                ) : (
                  <span className="text-gray-600">Inativo</span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-xl" />
          <input
            type="text"
            placeholder="Buscar por nome ou patente..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-[#0a0a0a]/80 border border-white/10 text-gray-200 placeholder-gray-600 focus:border-green-500/40 focus:outline-none focus:ring-1 focus:ring-green-500/20 transition-all text-sm font-medium tracking-wide"
          />
        </div>
        <div className="relative">
          <MdFilterList className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-xl" />
          <select
            value={filterCompanhia}
            onChange={e => setFilterCompanhia(e.target.value)}
            className="pl-12 pr-8 py-3.5 rounded-xl bg-[#0a0a0a]/80 border border-white/10 text-gray-200 focus:border-green-500/40 focus:outline-none focus:ring-1 focus:ring-green-500/20 transition-all text-sm font-medium tracking-wide appearance-none cursor-pointer min-w-[200px]"
          >
            {companhias.map(c => (
              <option key={c} value={c}>{c === 'Todas' ? 'Todas as Companhias' : c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista de Militares */}
      <div className="rounded-[2rem] border border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl shadow-2xl overflow-hidden">
        {/* Table Header */}
        <div className="px-8 py-5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center border border-green-500/20">
              <GiPoliceBadge className="text-green-400 w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Efetivo Ativo</h2>
              <p className="text-xs text-gray-500 uppercase tracking-widest mt-0.5">
                {filteredMilitares.length} militar{filteredMilitares.length !== 1 ? 'es' : ''} em serviço
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-[10px] text-gray-500 uppercase tracking-widest font-bold">
            <MdSignalWifiStatusbar4Bar className="text-green-500" />
            Atualização automática
          </div>
        </div>

        {filteredMilitares.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/10">
              <FiShield className="w-10 h-10 text-gray-600" />
            </div>
            <p className="text-gray-400 font-bold text-lg mb-2">
              {search || filterCompanhia !== 'Todas'
                ? 'Nenhum resultado encontrado'
                : 'Nenhum militar em serviço'}
            </p>
            <p className="text-gray-600 text-sm max-w-md">
              {search || filterCompanhia !== 'Todas'
                ? 'Tente alterar os filtros de busca.'
                : 'Nenhum militar do batalhão está com o ponto batido no momento. Quando alguém iniciar um turno, aparecerá aqui.'}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-gray-500 text-[10px] uppercase tracking-[0.2em]">
                    <th className="py-4 pl-8 font-bold">Militar</th>
                    <th className="py-4 font-bold">Patente</th>
                    <th className="py-4 font-bold">Companhia</th>
                    <th className="py-4 font-bold">Entrada</th>
                    <th className="py-4 font-bold">Tempo em Serviço</th>
                    <th className="py-4 pr-8 font-bold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-white/5">
                  {filteredMilitares.map((registro, index) => {
                    const profile = registro.profiles;
                    if (!profile) return null;
                    const segundosAtivos = Math.floor((new Date() - new Date(registro.entrada)) / 1000);

                    return (
                      <tr
                        key={registro.id}
                        className="hover:bg-green-500/5 transition-all duration-300 group"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        {/* Avatar + Nome */}
                        <td className="py-5 pl-8">
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-army-green-dark to-army-green flex items-center justify-center text-white font-black text-sm border border-army-green-light/30 shadow-lg overflow-hidden flex-shrink-0">
                                {profile.foto_url ? (
                                  <img src={profile.foto_url} alt={profile.nome} className="w-full h-full object-cover" />
                                ) : (
                                  profile.nome?.charAt(0) || '?'
                                )}
                              </div>
                              {/* Online indicator */}
                              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-[#0a0a0a] shadow-[0_0_6px_rgba(34,197,94,0.6)]"></div>
                            </div>
                            <div>
                              <p className="font-bold text-gray-100 tracking-wide group-hover:text-green-400 transition-colors">
                                {profile.nome}
                              </p>
                              <p className="text-[10px] text-gray-600 font-mono uppercase tracking-widest mt-0.5">
                                {tempoDesde(registro.entrada)}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Patente */}
                        <td className="py-5">
                          <span className={`${cargoBadgeClass[profile.cargo] || 'badge-steel'} !text-[9px] !px-2.5 !py-1`}>
                            {cargoLabels[profile.cargo] || profile.cargo}
                          </span>
                        </td>

                        {/* Companhia */}
                        <td className="py-5">
                          <span className="text-gray-400 text-sm font-medium">
                            {profile.companhia || '—'}
                          </span>
                        </td>

                        {/* Hora de Entrada */}
                        <td className="py-5">
                          <span className="text-gray-300 font-mono text-sm">
                            {new Date(registro.entrada).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} às {new Date(registro.entrada).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </td>

                        {/* Tempo */}
                        <td className="py-5">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_6px_rgba(34,197,94,0.5)]"></span>
                            <span className="text-green-400 font-mono font-bold text-sm tracking-wider drop-shadow-[0_0_8px_rgba(34,197,94,0.3)]">
                              {formatDuration(segundosAtivos)}
                            </span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-5 pr-8 text-right">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] uppercase tracking-widest rounded-full font-bold border bg-green-500/10 text-green-400 border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.1)]">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                            Em Serviço
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-white/5">
              {filteredMilitares.map((registro, index) => {
                const profile = registro.profiles;
                if (!profile) return null;
                const segundosAtivos = Math.floor((new Date() - new Date(registro.entrada)) / 1000);

                return (
                  <div
                    key={registro.id}
                    className="p-5 hover:bg-green-500/5 transition-all duration-300"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-army-green-dark to-army-green flex items-center justify-center text-white font-black text-sm border border-army-green-light/30 shadow-lg overflow-hidden">
                          {profile.foto_url ? (
                            <img src={profile.foto_url} alt={profile.nome} className="w-full h-full object-cover" />
                          ) : (
                            profile.nome?.charAt(0) || '?'
                          )}
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-[#0a0a0a] shadow-[0_0_6px_rgba(34,197,94,0.6)]"></div>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <p className="font-bold text-gray-100 tracking-wide truncate text-sm">
                            {profile.nome}
                          </p>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] uppercase tracking-widest rounded-full font-bold border bg-green-500/10 text-green-400 border-green-500/20 flex-shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                            Ativo
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mb-3">
                          <span className={`${cargoBadgeClass[profile.cargo] || 'badge-steel'} !text-[8px] !px-2 !py-0.5`}>
                            {cargoLabels[profile.cargo] || profile.cargo}
                          </span>
                          {profile.companhia && (
                            <span className="text-[10px] text-gray-500 font-medium">
                              {profile.companhia}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between bg-black/40 rounded-lg px-3 py-2 border border-white/5">
                          <div className="flex items-center gap-2">
                            <MdAccessTime className="text-gray-500 text-sm" />
                            <span className="text-[11px] text-gray-400 font-medium">
                              Entrada: {new Date(registro.entrada).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} às {new Date(registro.entrada).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="text-green-400 font-mono font-bold text-xs tracking-wider">
                              {formatDuration(segundosAtivos)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Footer info */}
      <div className="text-center">
        <p className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.3em]">
          Os dados são atualizados automaticamente a cada 30 segundos
        </p>
      </div>
    </div>
  );
}

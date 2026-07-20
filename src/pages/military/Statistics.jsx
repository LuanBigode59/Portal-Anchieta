import { useState, useEffect } from 'react';
import Topbar from '../../components/layout/Topbar';
import { userService } from '../../services/userService';
import { supabase } from '../../supabaseClient';
import {
  MdBarChart, MdPeople, MdMilitaryTech, MdSchool,
  MdGavel, MdStar, MdTrendingUp, MdPersonAdd
} from 'react-icons/md';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';

const COLORS = ['#C9A84C', '#4a8c34', '#6366f1', '#e11d48', '#0ea5e9', '#f59e0b'];

const chartTooltipStyle = {
  contentStyle: {
    backgroundColor: '#141414',
    border: '1px solid #2a2a2a',
    borderRadius: '10px',
    color: '#e8e8e8',
    fontSize: '11px',
  },
  cursor: { fill: 'rgba(255,255,255,0.03)' },
};

function StatCard({ icon, label, value, color = 'text-gold', sub }) {
  return (
    <div className="mil-card !p-5 flex items-center gap-4 animate-fadeInUp">
      <div className={`w-12 h-12 rounded-xl bg-mil-black border border-gray-800 flex items-center justify-center text-2xl flex-shrink-0 ${color}`}>
        {icon}
      </div>
      <div>
        <p className={`text-2xl font-black ${color}`}>{value}</p>
        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-0.5">{label}</p>
        {sub && <p className="text-[9px] text-gray-700 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function Statistics() {
  const [militares, setMilitares] = useState([]);
  const [operacoes, setOperacoes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [mData, opData] = await Promise.all([
          userService.getUsers(),
          supabase.from('operacoes').select('*').then(r => r.data || []),
        ]);
        setMilitares(mData);
        setOperacoes(opData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="flex justify-center py-24"><div className="spinner" /></div>;

  // --- Computed Stats ---
  const ativos = militares.filter(m => m.status === 'Ativo' || m.ativo !== false);
  const exonerados = militares.filter(m => m.status === 'Exonerado');
  const inativos = militares.filter(m => m.status === 'Inativo');
  const totalCursos = militares.reduce((acc, m) => acc + (m.cursos?.length || 0), 0);
  const totalElogios = militares.reduce((acc, m) => acc + (m.elogios?.length || 0), 0);
  const totalAdvertencias = militares.reduce((acc, m) => acc + (m.advertencias?.length || 0), 0);
  const totalPromocoes = militares.reduce((acc, m) => acc + (m.promocoes?.length || 0), 0);
  const totalCondecoracoes = militares.reduce((acc, m) => acc + (m.condecoracoes?.length || 0), 0);

  // Rank distribution
  const RANK_GROUPS = {
    'Oficiais': ['tenente_coronel', 'major', 'capitao', 'primeiro_tenente', 'segundo_tenente', 'aspirante'],
    'Graduados': ['subtenente', 'primeiro_sargento', 'segundo_sargento', 'terceiro_sargento', 'aluno_sargento'],
    'Praças': ['cabo', 'soldado_primeira', 'soldado_segunda'],
  };
  const rankDist = Object.entries(RANK_GROUPS).map(([name, cargos], i) => ({
    name,
    value: militares.filter(m => cargos.includes(m.cargo)).length,
    color: COLORS[i],
  }));

  // Company distribution
  const compDist = [...new Set(militares.map(m => m.companhia).filter(Boolean))]
    .map(comp => ({
      name: comp.length > 15 ? comp.substring(0, 12) + '...' : comp,
      fullName: comp,
      militares: militares.filter(m => m.companhia === comp).length,
    }))
    .sort((a, b) => b.militares - a.militares)
    .slice(0, 8);

  // Top performers
  const topCursos = [...militares].sort((a, b) => (b.cursos?.length || 0) - (a.cursos?.length || 0)).slice(0, 5);
  const topElogios = [...militares].sort((a, b) => (b.elogios?.length || 0) - (a.elogios?.length || 0)).slice(0, 5);

  // Status distribution
  const statusDist = [
    { name: 'Ativos', value: ativos.length, color: '#4a8c34' },
    { name: 'Inativos', value: inativos.length, color: '#C9A84C' },
    { name: 'Exonerados', value: exonerados.length, color: '#e11d48' },
  ].filter(s => s.value > 0);

  return (
    <div className="animate-fadeIn pb-12">
      <Topbar title="ESTATÍSTICAS" subtitle="Inteligência Operacional do Batalhão" />

      {/* === KPI CARDS === */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<MdPeople />} label="Efetivo Ativo" value={ativos.length} color="text-army-green-light" />
        <StatCard icon={<MdSchool />} label="Cursos Concluídos" value={totalCursos} color="text-gold" />
        <StatCard icon={<MdMilitaryTech />} label="Operações" value={operacoes.length} color="text-blue-400" />
        <StatCard icon={<MdStar />} label="Promoções Totais" value={totalPromocoes} color="text-indigo-400" />
        <StatCard icon={<MdTrendingUp />} label="Elogios" value={totalElogios} color="text-gold" />
        <StatCard icon={<MdGavel />} label="Advertências" value={totalAdvertencias} color="text-red-400" />
        <StatCard icon={<MdPersonAdd />} label="Condecorados" value={totalCondecoracoes} color="text-amber-400" />
        <StatCard icon={<MdPeople />} label="Total do Efetivo" value={militares.length} color="text-gray-400" />
      </div>

      {/* === CHARTS ROW 1 === */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Rank Distribution Pie */}
        <div className="mil-card">
          <h3 className="text-xs font-black text-white uppercase tracking-widest mb-4 pb-3 border-b border-gray-800 flex items-center gap-2">
            <MdPeople className="text-gold" /> Distribuição por Grupo
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={rankDist} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                {rankDist.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip {...chartTooltipStyle} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '10px', color: '#888' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Status Distribution */}
        <div className="mil-card">
          <h3 className="text-xs font-black text-white uppercase tracking-widest mb-4 pb-3 border-b border-gray-800 flex items-center gap-2">
            <MdBarChart className="text-gold" /> Status do Efetivo
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={statusDist} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                {statusDist.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip {...chartTooltipStyle} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '10px', color: '#888' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* By Company Bar */}
        <div className="mil-card">
          <h3 className="text-xs font-black text-white uppercase tracking-widest mb-4 pb-3 border-b border-gray-800 flex items-center gap-2">
            <MdMilitaryTech className="text-gold" /> Militares por Companhia
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={compDist} layout="vertical" margin={{ left: 0, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#666', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#888', fontSize: 9 }} axisLine={false} tickLine={false} width={80} />
              <Tooltip {...chartTooltipStyle} />
              <Bar dataKey="militares" fill="#C9A84C" radius={[0, 4, 4, 0]} name="Militares" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* === CHARTS ROW 2 === */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top Courses */}
        <div className="mil-card">
          <h3 className="text-xs font-black text-white uppercase tracking-widest mb-4 pb-3 border-b border-gray-800 flex items-center gap-2">
            <MdSchool className="text-gold" /> Top 5 — Mais Cursos
          </h3>
          <div className="space-y-3">
            {topCursos.map((m, i) => (
              <div key={m.id} className="flex items-center gap-3">
                <span className={`text-xs font-black w-5 ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-amber-600' : 'text-gray-600'}`}>
                  #{i + 1}
                </span>
                <div className="w-7 h-7 rounded-full bg-mil-black border border-gray-800 flex items-center justify-center text-xs font-bold text-gray-400 flex-shrink-0">
                  {m.nome?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-200 truncate">{m.nome}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 rounded-full bg-army-green/30" style={{ width: `${Math.max(16, (m.cursos?.length || 0) * 12)}px` }}>
                    <div className="h-full rounded-full bg-army-green" style={{ width: '100%' }} />
                  </div>
                  <span className="text-xs font-black text-army-green-light w-4 text-right">{m.cursos?.length || 0}</span>
                </div>
              </div>
            ))}
            {topCursos.length === 0 && <p className="text-xs text-gray-600 text-center py-4">Nenhum dado disponível</p>}
          </div>
        </div>

        {/* Top Elogios */}
        <div className="mil-card">
          <h3 className="text-xs font-black text-white uppercase tracking-widest mb-4 pb-3 border-b border-gray-800 flex items-center gap-2">
            <MdStar className="text-gold" /> Top 5 — Mais Elogios
          </h3>
          <div className="space-y-3">
            {topElogios.map((m, i) => (
              <div key={m.id} className="flex items-center gap-3">
                <span className={`text-xs font-black w-5 ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-amber-600' : 'text-gray-600'}`}>
                  #{i + 1}
                </span>
                <div className="w-7 h-7 rounded-full bg-mil-black border border-gray-800 flex items-center justify-center text-xs font-bold text-gray-400 flex-shrink-0">
                  {m.nome?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-200 truncate">{m.nome}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 rounded-full bg-gold/20" style={{ width: `${Math.max(16, (m.elogios?.length || 0) * 16)}px` }}>
                    <div className="h-full rounded-full bg-gold" style={{ width: '100%' }} />
                  </div>
                  <span className="text-xs font-black text-gold w-4 text-right">{m.elogios?.length || 0}</span>
                </div>
              </div>
            ))}
            {topElogios.length === 0 && <p className="text-xs text-gray-600 text-center py-4">Nenhum dado disponível</p>}
          </div>
        </div>
      </div>

      {/* Summary footer */}
      <div className="hero-card p-5 border border-gray-800 text-center">
        <p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">
          2º Batalhão de Polícia de Choque Anchieta — Dados em tempo real via Supabase
        </p>
        <p className="text-[9px] text-gray-800 mt-1">
          Última atualização: {new Date().toLocaleString('pt-BR')}
        </p>
      </div>
    </div>
  );
}

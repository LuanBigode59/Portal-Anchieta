import { useState, useEffect } from 'react';
import Topbar from '../../components/layout/Topbar';
import { userService } from '../../services/userService';
import { MdPeople, MdSchool, MdQuiz, MdStar, MdGavel, MdMilitaryTech, MdArrowForward, MdCampaign, MdSettings, MdBlock } from 'react-icons/md';
import { GiMedal } from 'react-icons/gi';
import { useNavigate } from 'react-router-dom';

export default function AdminPanel() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      try {
        const data = await userService.getAllUsers();
        setUsers(data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    fetch();
  }, []);

  const adminActions = [
    { to: '/admin/policiais', label: 'Gerenciar Efetivo', desc: 'Visualizar, editar e exonerar militares', icon: <MdPeople />, color: 'text-army-green-light', border: 'border-army-green/30' },
    { to: '/admin/promocoes', label: 'Promoções', desc: 'Promover e rebaixar militares', icon: <MdStar />, color: 'text-gold', border: 'border-gold/30' },
    { to: '/admin/advertencias', label: 'Advertências', desc: 'Aplicar advertências verbais, escritas e graves', icon: <MdGavel />, color: 'text-danger-light', border: 'border-danger/30' },
    { to: '/admin/cursos', label: 'Gerenciar Cursos', desc: 'Criar e editar cursos de instrução', icon: <MdSchool />, color: 'text-choque-yellow', border: 'border-choque-yellow/30' },
    { to: '/admin/provas', label: 'Gerenciar Provas', desc: 'Criar provas e banco de questões', icon: <MdQuiz />, color: 'text-gold-light', border: 'border-gold-light/30' },
    { to: '/admin/operacoes', label: 'Gerenciar Operações', desc: 'Cadastrar e acompanhar operações', icon: <MdMilitaryTech />, color: 'text-danger-light', border: 'border-danger/30' },
    { to: '/admin/medalhas', label: 'Gerenciar Medalhas', desc: 'Editar medalhas e requisitos', icon: <GiMedal />, color: 'text-gold', border: 'border-gold/30' },
    { to: '/admin/exonerados', label: 'Exonerados', desc: 'Gerenciar militares desligados do batalhão', icon: <MdBlock />, color: 'text-danger', border: 'border-danger/50' },
  ];

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="spinner" /></div>;

  return (
    <div className="animate-fadeIn">
      <Topbar title="PAINEL ADMINISTRATIVO" subtitle="Comando e Controle — Acesso Restrito" />

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Efetivo Ativo', value: users.filter(u => u.status !== 'Exonerado').length, color: 'text-army-green-light' },
          { label: 'Exonerados', value: users.filter(u => u.status === 'Exonerado').length, color: 'text-danger-light' },
          { label: 'Oficiais', value: users.filter(u => u.status !== 'Exonerado' && ['tenente_coronel', 'major', 'capitao'].includes(u.cargo)).length, color: 'text-gold-light' },
          { label: 'Praças', value: users.filter(u => u.status !== 'Exonerado' && !['tenente_coronel', 'major', 'capitao', 'primeiro_tenente', 'segundo_tenente', 'aspirante'].includes(u.cargo)).length, color: 'text-gray-400' },
        ].map((stat, i) => (
          <div key={i} className="mil-card !p-4 text-center">
            <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
            <p className="text-[9px] text-gray-500 uppercase tracking-widest font-bold mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Admin Actions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {adminActions.map((action, i) => (
          <button
            key={i}
            onClick={() => navigate(action.to)}
            className={`hero-card p-6 text-left group hover:-translate-y-1 transition-all duration-300 animate-fadeInUp border-l-4 ${action.border}`}
            style={{ animationDelay: `${i * 0.05}s`, animationFillMode: 'both' }}
          >
            <div className={`text-3xl ${action.color} mb-3 group-hover:scale-110 transition-transform`}>{action.icon}</div>
            <h3 className="text-sm font-black text-gray-100 mb-1 group-hover:text-gold transition-colors tracking-wide">{action.label}</h3>
            <p className="text-xs text-gray-500 leading-relaxed">{action.desc}</p>
            <MdArrowForward className="text-gray-600 group-hover:text-gold mt-3 transition-all group-hover:translate-x-1" />
          </button>
        ))}
      </div>
    </div>
  );
}

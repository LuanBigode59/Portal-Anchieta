import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { cargoBadgeClass, cargoLabels } from '../../data/ranks';
import {
  MdDashboard, MdPeople, MdSchool, MdQuiz, MdAssignment, MdLeaderboard,
  MdAdminPanelSettings, MdLogout, MdMenu, MdClose, MdStar, MdAssessment,
  MdSettings, MdDescription, MdCalendarMonth, MdMilitaryTech, MdCampaign,
  MdChat, MdBarChart, MdNotifications, MdPerson, MdGavel, MdAccessTime
} from 'react-icons/md';
import { GiMilitaryFort, GiMedal } from 'react-icons/gi';
import { useState, useEffect } from 'react';
import NotificationsPanel from './NotificationsPanel';
import { supabase } from '../../supabaseClient';

export default function Sidebar() {
  const { user, logout, isAdmin, isInstrutor, isOfficer, userRankLevel } = useAuth();
  const { unreadCount, sendNotification } = useNotifications();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    if (user && ['capitao', 'major', 'tenente_coronel'].includes(user.patente?.toLowerCase()?.replace('-', '_'))) {
      const channel = supabase.channel('exam-alerts-listener');
      channel.on('broadcast', { event: 'exam_started' }, (payload) => {
        const { militarNome, militarPatente, provaTitulo } = payload.payload;
        sendNotification(`⚠️ ALERTA: ${militarPatente} ${militarNome} iniciou a prova ${provaTitulo}.`, 'info');
      }).subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, sendNotification]);

  const militaryLinks = [
    { to: '/militar/dashboard', icon: <MdDashboard />, label: 'Dashboard' },
    { to: '/militar/ponto', icon: <MdAccessTime />, label: 'Bater Ponto' },
    { to: '/militar/em-servico', icon: <MdPeople />, label: 'Em Serviço' },
    { to: '/militar/ficha', icon: <MdPerson />, label: 'Minha Ficha' },
    { to: '/militar/cursos', icon: <MdSchool />, label: 'Cursos' },
    { to: '/militar/provas', icon: <MdQuiz />, label: 'Provas' },
    { to: '/militar/escalas', icon: <MdCalendarMonth />, label: 'Escalas' },
    { to: '/militar/operacoes', icon: <MdMilitaryTech />, label: 'Operações' },
    { to: '/militar/relatorios', icon: <MdDescription />, label: 'Relatórios' },
    ...(user && ['capitao', 'major', 'tenente_coronel'].includes(user.cargo)
      ? [{ to: '/militar/boletim', icon: <MdAssignment />, label: 'Boletim Promoção' }]
      : []),
    { to: '/militar/boletins', icon: <MdCampaign />, label: 'Mural' },
    { to: '/militar/medalhas', icon: <GiMedal />, label: 'Medalhas' },
    { to: '/militar/ranking', icon: <MdLeaderboard />, label: 'Ranking' },
    { to: '/militar/estatisticas', icon: <MdBarChart />, label: 'Estatísticas' },
    { to: '/militar/chat', icon: <MdChat />, label: 'Chat' },
  ];

  const adminLinks = [
    { to: '/admin', icon: <MdAdminPanelSettings />, label: 'Painel Admin' },
    { to: '/admin/policiais', icon: <MdPeople />, label: 'Gerenciar Efetivo' },
    { to: '/admin/promocoes', icon: <MdStar />, label: 'Promoções' },
    { to: '/admin/advertencias', icon: <MdGavel />, label: 'Advertências' },
    { to: '/admin/cursos', icon: <MdSettings />, label: 'Gerenciar Cursos' },
    { to: '/admin/provas', icon: <MdAssignment />, label: 'Gerenciar Provas' },
    { to: '/admin/resultados-provas', icon: <MdAssignment />, label: 'Resultado de Provas' },
    { to: '/admin/operacoes', icon: <MdAssessment />, label: 'Gerenciar Operações' },
    ...(user && ['capitao', 'major', 'tenente_coronel'].includes(user.patente?.toLowerCase())
      ? [{ to: '/admin/medalhas', icon: <GiMedal />, label: 'Gerenciar Medalhas' }]
      : []),
  ];  const showAdmin = isAdmin || isInstrutor || isOfficer;  const sidebarContent = (
    <div className="flex flex-col h-full bg-mil-black/90 backdrop-blur-md">
      {/* Header / Emblema */}
      <div className="scanline-overlay px-4 pt-8 pb-6 border-b border-gray-800 relative shadow-md">
        <div className="flex items-center justify-center mb-3">
          <div className="relative inline-flex items-center justify-center">
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-[#111] shadow-[0_0_15px_rgba(201,168,76,0.2)] p-1 border border-gold/30 relative z-10">
              <img src="/logos/logo.png" alt="Logo" className="w-full h-full object-contain drop-shadow-[0_0_10px_rgba(201,168,76,0.6)]" />
            </div>
            <div className="absolute inset-0 w-16 h-16 rounded-full border border-gold/20 animate-ping" style={{ animationDuration: '4s' }} />
            <div className="absolute inset-[-4px] rounded-full bg-gold/5 blur-md" />
          </div>
        </div>
        <div className="text-center">
          <h1 className="text-gold font-black text-[11px] tracking-[3px] uppercase drop-shadow-md">Portal Oficial</h1>
          <p className="text-gold-light/60 text-[9px] tracking-[3px] uppercase mt-1">2º Batalhão de Choque</p>

          <p className="text-army-green-light font-black text-[12px] tracking-[4px] drop-shadow-sm">ANCHIETA</p>
        </div>
      </div>

      {/* User Info */}
      <div className="px-5 py-5 border-b border-gray-800 bg-gradient-to-b from-black/20 to-transparent">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-army-green-dark to-army-green flex items-center justify-center text-white font-black text-lg border border-army-green-light/30 shadow-[0_4px_10px_rgba(45,90,30,0.5)] flex-shrink-0 overflow-hidden">
            {user?.foto_url ? (
              <img src={user.foto_url} alt={user.nome} className="w-full h-full object-cover" />
            ) : (
              user?.nome?.charAt(0) || '?'
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-black text-gray-100 truncate tracking-wide">{user?.nome}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`${cargoBadgeClass[user?.cargo] || 'badge-steel'} !text-[9px] !px-2 !py-0.5`}>
                {cargoLabels[user?.cargo] || user?.cargo}
              </span>
            </div>
            <p className="text-[10px] text-gray-500 mt-1.5 font-mono tracking-widest uppercase">ID: {user?.cpf}</p>
          </div>
          <div className="relative">
            <button 
              className="relative focus:outline-none" 
              onClick={() => setShowNotifications(true)}
              title="Notificações"
            >
              <MdNotifications className="text-gold text-2xl hover:text-white transition-colors drop-shadow-md" />
              {unreadCount > 0 && (
                <span className="notification-dot">{unreadCount}</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto custom-scrollbar px-2">
        <p className="px-5 text-[10px] font-black uppercase tracking-[3px] text-gray-600 mb-3">
          Área Militar
        </p>
        <div className="space-y-0.5">
          {militaryLinks.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">{link.icon}</span>
              <span className="tracking-wide text-[13px]">{link.label}</span>
            </NavLink>
          ))}
        </div>

        {showAdmin && (
          <>
            <div className="my-4 mx-5 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
            <p className="px-5 text-[10px] font-black uppercase tracking-[3px] text-gold-muted mb-3">
              Administração
            </p>
            <div className="space-y-0.5">
              {adminLinks.map(link => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                  <span className="nav-icon">{link.icon}</span>
                  <span className="tracking-wide text-[13px]">{link.label}</span>
                </NavLink>
              ))}
            </div>
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-gray-800 bg-black/40">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-3 px-4 py-2.5 w-full rounded-xl text-gray-500 hover:text-gold hover:bg-gold/5 transition-all font-bold text-sm mb-2"
        >
          <img src="/logos/logo.png" alt="Logo" className="w-6 h-6 object-contain" />
          <span className="tracking-wide">Área Pública</span>
        </button>
        
        {/* Bottom Actions */}
        <div className="p-4 border-t border-gray-800 bg-mil-black mt-auto">
          <button onClick={handleLogout} className="btn-danger w-full flex items-center justify-center gap-2 !py-2.5">
            <MdLogout className="text-lg" /> 
            <span className="text-[11px] tracking-widest font-black uppercase">Desconectar</span>
          </button>
        </div>

        {/* Notifications Panel Overlay */}
        {showNotifications && (
          <NotificationsPanel onClose={() => setShowNotifications(false)} />
        )}
        
        <p className="text-center text-[9px] text-gray-600 mt-4 font-bold tracking-widest uppercase">
          © 2026 — 2º BP Choque
        </p>
        <p className="text-center text-[8px] text-gray-700 mt-1 tracking-widest font-mono">
          v2.0.0 — Portal Oficial
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden w-10 h-10 bg-mil-card border border-mil-border rounded-lg flex items-center justify-center text-gray-300 hover:text-army-green-light transition-colors"
      >
        {mobileOpen ? <MdClose className="text-xl" /> : <MdMenu className="text-xl" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen w-[280px] z-40 border-r border-gray-800 overflow-hidden transition-transform duration-500
          bg-[#0a0a0a]
          lg:translate-x-0 shadow-[20px_0_40px_rgba(0,0,0,0.5)]
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {sidebarContent}
      </aside>
    </>
  );
}

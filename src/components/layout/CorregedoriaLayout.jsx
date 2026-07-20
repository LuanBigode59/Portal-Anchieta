import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  MdDashboard, MdGavel, MdAssignment, MdSearch,
  MdWarning, MdBlock, MdArchive, MdArrowBack, MdClose, MdMenu
} from 'react-icons/md';
import { GiScales } from 'react-icons/gi';
import { useState } from 'react';

export default function CorregedoriaLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { to: '/corregedoria', icon: <MdDashboard />, label: 'Painel Geral', end: true },
    { to: '/corregedoria/denuncias', icon: <MdWarning />, label: 'Denúncias' },
    { to: '/corregedoria/processos', icon: <MdAssignment />, label: 'Processos' },
    { to: '/corregedoria/investigacoes', icon: <MdSearch />, label: 'Investigações' },
    { to: '/corregedoria/advertencias', icon: <MdGavel />, label: 'Advertências' },
    { to: '/corregedoria/exoneracoes', icon: <MdBlock />, label: 'Exonerações' },
    { to: '/corregedoria/arquivados', icon: <MdArchive />, label: 'Arquivados' },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0a0a0a] border-r border-red-900/30">
      {/* Header Corregedoria */}
      <div className="p-6 border-b border-red-900/30 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-[#111] border border-red-900/50 flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(153,27,27,0.2)]">
          <GiScales className="text-3xl text-red-600" />
        </div>
        <h1 className="text-xs font-black text-white tracking-[0.3em] uppercase">Corregedoria</h1>
        <p className="text-[9px] text-red-600 tracking-[0.2em] uppercase mt-1 font-bold">Justiça & Disciplina</p>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                isActive
                  ? 'bg-red-900/20 text-red-500 border border-red-900/50 shadow-inner'
                  : 'text-gray-500 hover:bg-white/5 hover:text-gray-300 border border-transparent'
              }`
            }
          >
            <span className="text-xl">{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer Return */}
      <div className="p-4 border-t border-red-900/30">
        <button
          onClick={() => navigate('/militar/dashboard')}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-700 bg-[#111] text-gray-400 text-xs font-bold uppercase tracking-widest hover:bg-gray-800 hover:text-white transition-all"
        >
          <MdArrowBack className="text-lg" /> Voltar ao Portal
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[#050505] text-gray-200 selection:bg-red-900/60 font-sans">
      
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#0a0a0a] border-b border-red-900/30 flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-3">
          <GiScales className="text-2xl text-red-600" />
          <div>
            <h1 className="text-xs font-black text-white tracking-[0.2em] uppercase">Corregedoria</h1>
          </div>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-gray-400 hover:text-white">
          {mobileOpen ? <MdClose className="text-2xl" /> : <MdMenu className="text-2xl" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/80 backdrop-blur-sm" onClick={() => setMobileOpen(false)}>
          <div className="absolute top-16 left-0 bottom-0 w-64 shadow-2xl" onClick={e => e.stopPropagation()}>
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-72 flex-shrink-0 z-30 shadow-2xl">
        {sidebarContent}
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative pt-16 lg:pt-0">
        <div className="absolute inset-0 pointer-events-none opacity-5 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxwYXRoIGQ9Ik0wIDBoOHY4SDB6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTAgMGgxdjFIMHoiIGZpbGw9InJlZCIvPjwvc3ZnPg==')] mix-blend-screen" />
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-8 relative z-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

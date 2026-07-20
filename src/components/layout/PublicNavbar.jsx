import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MdMenu, MdClose } from 'react-icons/md';
import { GiMilitaryFort } from 'react-icons/gi';

export default function PublicNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const links = [
    { to: '/', label: 'Início' },
    { to: '/sobre', label: 'Sobre' },
    { to: '/hierarquia', label: 'Hierarquia' },
    { to: '/galeria', label: 'Galeria' },
    { to: '/recrutamento', label: 'Recrutamento' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-gold/20 bg-mil-black/80 backdrop-blur-xl">
        {/* Top accent bar */}
        <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-gold to-transparent" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-mil-dark border border-gold/30 group-hover:border-gold/60 transition-all shadow-gold">
                <img src="/logos/logo.png" alt="Logo" className="w-full h-full object-contain text-gold text-lg sm:text-xl drop-shadow-[0_0_8px_rgba(201,168,76,0.5)]" />
              </div>
              <div className="hidden sm:block">
                <p className="text-gold font-black text-xs tracking-[3px] uppercase leading-tight">2º BP CHOQUE</p>
                <p className="text-gray-500 text-[9px] tracking-[4px] uppercase">Anchieta</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {links.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-4 py-2 rounded-lg text-sm font-bold tracking-wide transition-all duration-300 ${
                    isActive(link.to)
                      ? 'text-gold bg-gold/10 border border-gold/30'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* CTA + Mobile */}
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="btn-green !py-2 !px-6 !text-xs !tracking-widest uppercase"
              >
                Área Militar
              </Link>
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gold transition-colors rounded-lg hover:bg-white/5"
              >
                {mobileOpen ? <MdClose size={24} /> : <MdMenu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Bottom accent */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-army-green/30 to-transparent" />
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
          <div className="fixed top-[65px] left-0 right-0 z-50 lg:hidden bg-mil-dark/95 backdrop-blur-xl border-b border-mil-border animate-fadeInDown">
            <div className="p-4 space-y-1">
              {links.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                    isActive(link.to)
                      ? 'text-gold bg-gold/10 border border-gold/30'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}

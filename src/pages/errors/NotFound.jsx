import { useNavigate } from 'react-router-dom';
import { MdHome, MdArrowBack } from 'react-icons/md';
import { GiMilitaryFort } from 'react-icons/gi';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-center p-6 relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 military-grid opacity-20" />
      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-army-green/5 rounded-full blur-3xl" />

      <div className="relative z-10 animate-fadeIn">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-mil-dark border border-gold/20 flex items-center justify-center shadow-[0_0_30px_rgba(201,168,76,0.15)]">
            <img src="/logos/logo.png" alt="Logo" className="w-full h-full object-contain text-3xl text-gold" />
          </div>
        </div>

        {/* 404 */}
        <div className="relative mb-4">
          <span className="text-[120px] font-black text-gray-900 leading-none select-none"
            style={{ textShadow: '0 0 60px rgba(201,168,76,0.08)' }}>
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[120px] font-black leading-none bg-gradient-to-b from-gold/30 to-transparent bg-clip-text text-transparent select-none">
              404
            </span>
          </div>
        </div>

        <h1 className="text-xl font-black text-white uppercase tracking-widest mb-2">
          Página Não Encontrada
        </h1>
        <p className="text-sm text-gray-500 max-w-sm mb-2 leading-relaxed">
          A página solicitada não existe ou foi removida do sistema.
        </p>
        <p className="text-[10px] font-mono text-gray-700 uppercase tracking-widest mb-8">
          2º BP CHOQUE ANCHIETA — ERRO DE NAVEGAÇÃO
        </p>

        {/* Divider */}
        <div className="flex items-center gap-3 justify-center mb-8">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-gold/40" />
          <div className="w-1.5 h-1.5 rounded-full bg-gold/40" />
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-gold/40" />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 justify-center flex-wrap">
          <button
            onClick={() => navigate(-1)}
            className="btn-secondary flex items-center gap-2"
          >
            <MdArrowBack /> Voltar
          </button>
          <button
            onClick={() => navigate('/')}
            className="btn-gold flex items-center gap-2"
          >
            <MdHome /> Página Inicial
          </button>
        </div>
      </div>
    </div>
  );
}

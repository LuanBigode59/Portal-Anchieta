import { useNavigate } from 'react-router-dom';
import { MdHome, MdArrowBack, MdBlock } from 'react-icons/md';
import { GiMilitaryFort } from 'react-icons/gi';

export default function AccessDenied() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 military-grid opacity-20" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-900/5 rounded-full blur-3xl" />

      <div className="relative z-10 animate-fadeIn">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-mil-dark border border-red-500/20 flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.1)]">
            <MdBlock className="text-3xl text-red-500" />
          </div>
        </div>

        <div className="relative mb-4">
          <span className="text-[80px] font-black text-gray-900 leading-none select-none">403</span>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[80px] font-black leading-none bg-gradient-to-b from-red-500/30 to-transparent bg-clip-text text-transparent select-none">403</span>
          </div>
        </div>

        <h1 className="text-xl font-black text-white uppercase tracking-widest mb-2">Acesso Negado</h1>
        <p className="text-sm text-gray-500 max-w-sm mb-2 leading-relaxed">
          Você não possui autorização para acessar este recurso do sistema.
        </p>
        <p className="text-[10px] font-mono text-gray-700 uppercase tracking-widest mb-2">
          Nível de acesso insuficiente
        </p>
        <div className="inline-block bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2 mb-8">
          <p className="text-xs text-red-400">
            Contate seu superior hierárquico para solicitar acesso.
          </p>
        </div>

        <div className="flex items-center gap-3 justify-center flex-wrap">
          <button onClick={() => navigate(-1)} className="btn-secondary flex items-center gap-2">
            <MdArrowBack /> Voltar
          </button>
          <button onClick={() => navigate('/militar/dashboard')} className="btn-gold flex items-center gap-2">
            <MdHome /> Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

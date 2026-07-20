import { GiMilitaryFort } from 'react-icons/gi';
import { MdBuildCircle } from 'react-icons/md';

export default function Maintenance() {
  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 military-grid opacity-20" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/5 rounded-full blur-3xl" />

      <div className="relative z-10 animate-fadeIn">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-mil-dark border border-gold/30 flex items-center justify-center shadow-[0_0_40px_rgba(201,168,76,0.2)] animate-pulse">
              <img src="/logos/logo.png" alt="Logo" className="w-full h-full object-contain text-4xl text-gold" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center">
              <MdBuildCircle className="text-gold text-lg" />
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-black text-white uppercase tracking-widest mb-3">
          Sistema em Manutenção
        </h1>

        {/* Progress bar */}
        <div className="w-64 mx-auto mb-6">
          <div className="h-1 bg-gray-900 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-army-green via-gold to-army-green rounded-full animate-pulse" style={{ width: '70%' }} />
          </div>
        </div>

        <p className="text-sm text-gray-400 max-w-sm mb-2 leading-relaxed">
          O Portal Oficial do 2º Batalhão de Polícia de Choque Anchieta está temporariamente 
          indisponível para manutenção programada.
        </p>
        <p className="text-xs text-gray-600 mb-8">
          Retornaremos em breve. Aguarde.
        </p>

        <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/20 rounded-xl px-6 py-3">
          <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
          <span className="text-xs text-gold font-bold uppercase tracking-widest">Operação em andamento</span>
        </div>

        <div className="mt-8 text-[10px] font-mono text-gray-800 uppercase tracking-widest">
          2º BP CHOQUE ANCHIETA — PMESP
        </div>
        <div className="mt-2 text-[9px] text-gray-800 uppercase tracking-[4px]">
          DISCIPLINA • HONRA • CORAGEM • LEALDADE
        </div>
      </div>
    </div>
  );
}

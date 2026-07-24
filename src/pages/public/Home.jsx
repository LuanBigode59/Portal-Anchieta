import { Link } from 'react-router-dom';
import { GiMilitaryFort } from 'react-icons/gi';
import {
  MdSecurity, MdSchool, MdPeople, MdArrowForward,
  MdMilitaryTech, MdGavel, MdStarRate,
} from 'react-icons/md';
import { FaWhatsapp } from 'react-icons/fa';

export default function Home() {
  const actionButtons = [
    { to: '/login', label: 'Área Militar', icon: <MdSecurity />, desc: 'Acesso restrito ao efetivo', style: 'from-army-green to-army-green-dark border-army-green-light/40 hover:shadow-green-lg' },
    { to: '/sobre', label: 'Área Pública', icon: <MdPeople />, desc: 'Conheça o batalhão', style: 'from-mil-card to-mil-dark border-gold/30 hover:shadow-gold-lg' },
    { to: '/recrutamento', label: 'Recrutamento', icon: <MdStarRate />, desc: 'Aliste-se agora', style: 'from-choque-yellow-dark/80 to-gold-dark border-choque-yellow/40 hover:shadow-glow-choque' }
  ];

  const stats = [
    { value: '150+', label: 'Militares Ativos' },
    { value: '50+', label: 'Operações Realizadas' },
    { value: '30+', label: 'Cursos Disponíveis' },
    { value: '98%', label: 'Taxa de Aprovação' },
  ];

  const features = [
    { icon: <MdMilitaryTech className="text-3xl" />, title: 'Dashboard Militar', desc: 'Gerencie sua ficha, medalhas, cursos e promoções em um único lugar.' },
    { icon: <MdSchool className="text-3xl" />, title: 'Sistema de Instrução', desc: 'Cursos completos com vídeos, PDFs, provas e aprovação automática.' },
    { icon: <MdGavel className="text-3xl" />, title: 'Gestão de Efetivo', desc: 'Advertências, promoções, escalas e controle total do batalhão.' },
  ];

  return (
    <div className="min-h-screen bg-mil-black">
      {/* ====== HERO SECTION ====== */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#0d1a0a] to-[#0a0a0a]" />
        <div className="absolute inset-0 military-grid opacity-40" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(45,90,30,0.08)_0%,_transparent_70%)]" />
        
        {/* Ambient glows */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-army-green/8 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-gold/5 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-choque-yellow/3 rounded-full blur-[80px]" />

        {/* Corner decorations */}
        <div className="absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 border-gold/10" />
        <div className="absolute top-0 right-0 w-32 h-32 border-r-2 border-t-2 border-gold/10" />
        <div className="absolute bottom-0 left-0 w-32 h-32 border-l-2 border-b-2 border-gold/10" />
        <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-gold/10" />

        {/* Top gold bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold to-transparent" />

        <div className="relative z-10 text-center px-4 sm:px-6 max-w-5xl mx-auto pt-24 pb-32 w-full">
          {/* Logo emblem */}
          <div className="relative inline-flex items-center justify-center mb-8 animate-fadeIn">
            <div className="w-28 h-28 sm:w-36 sm:h-36 flex items-center justify-center rounded-full bg-mil-dark/60 backdrop-blur-xl border-2 border-gold/30 shadow-gold-lg animate-float">
              <img src="/logos/logo.png" alt="Logo" className="w-full h-full object-contain text-gold text-5xl sm:text-6xl drop-shadow-[0_0_20px_rgba(201,168,76,0.6)]" />
            </div>
            <div className="absolute inset-0 w-28 h-28 sm:w-36 sm:h-36 rounded-full border border-gold/10 animate-ping" style={{ animationDuration: '4s' }} />
            <div className="absolute inset-[-12px] rounded-full bg-gold/5 blur-xl" />
          </div>

          {/* Title */}
          <div className="animate-fadeInUp" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
            <p className="text-gold/80 text-xs sm:text-sm tracking-[6px] sm:tracking-[8px] uppercase font-bold mb-3">
              Polícia Militar do Estado de São Paulo
            </p>
            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black text-white tracking-tight leading-tight mb-2">
              <span className="block">2º Batalhão de Polícia</span>
              <span className="block text-gold-gradient">de Choque</span>
            </h1>
            <div className="flex items-center justify-center gap-4 mt-4 mb-6">
              <div className="h-px w-16 sm:w-24 bg-gradient-to-r from-transparent to-gold/50" />
              <p className="text-army-green-light font-black text-lg sm:text-2xl tracking-[6px] sm:tracking-[10px] uppercase">
                Anchieta
              </p>
              <div className="h-px w-16 sm:w-24 bg-gradient-to-l from-transparent to-gold/50" />
            </div>
          </div>

          {/* Motto */}
          <p className="text-gray-400 text-sm sm:text-base max-w-2xl mx-auto mb-10 leading-relaxed animate-fadeInUp" style={{ animationDelay: '0.4s', animationFillMode: 'both' }}>
            Servindo com honra, disciplina e coragem na defesa da sociedade.
            Portal oficial de gerenciamento operacional e instrução do batalhão.
          </p>

          {/* Action buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 max-w-3xl mx-auto animate-fadeInUp" style={{ animationDelay: '0.6s', animationFillMode: 'both' }}>
            {actionButtons.map((btn, i) => {
              const Wrapper = btn.to ? Link : 'a';
              const props = btn.to ? { to: btn.to } : { href: btn.href, target: btn.href?.startsWith('http') ? '_blank' : undefined };
              return (
                <Wrapper
                  key={i}
                  {...props}
                  className={`group relative overflow-hidden rounded-xl border bg-gradient-to-b ${btn.style} p-4 sm:p-5 text-center transition-all duration-500 hover:-translate-y-1`}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10">
                    <div className="text-2xl sm:text-3xl mb-2 text-white/90 group-hover:scale-110 transition-transform duration-300 flex justify-center">
                      {btn.icon}
                    </div>
                    <p className="text-white font-black text-xs sm:text-sm tracking-wider uppercase mb-1">{btn.label}</p>
                    <p className="text-white/50 text-[10px] sm:text-xs font-medium hidden sm:block">{btn.desc}</p>
                  </div>
                </Wrapper>
              );
            })}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-pulse-slow z-20">
          <p className="text-gray-600 text-[10px] tracking-widest uppercase font-mono">Role para explorar</p>
          <div className="w-5 h-8 rounded-full border-2 border-gray-700 flex items-start justify-center p-1">
            <div className="w-1 h-2 bg-gold rounded-full animate-bounce" style={{ animationDuration: '1.5s' }} />
          </div>
        </div>
      </section>

      {/* ====== STATS SECTION ====== */}
      <section className="relative py-16 sm:py-20 border-y border-gold/10 bg-gradient-to-r from-mil-dark/50 via-mil-black to-mil-dark/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center group" style={{ animationDelay: `${i * 0.1}s` }}>
                <p className="stat-value text-gold group-hover:text-choque-yellow transition-colors">{stat.value}</p>
                <p className="text-gray-500 text-xs uppercase tracking-widest font-bold mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== ABOUT PREVIEW ====== */}
      <section className="relative py-20 sm:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(45,90,30,0.05)_0%,_transparent_60%)]" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-16">
            <p className="text-gold text-xs tracking-[6px] uppercase font-bold mb-3">Conheça o Batalhão</p>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              Portal <span className="text-gold-gradient">Completo</span> de Gestão
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Um sistema interno completo onde o policial consegue fazer praticamente tudo em um único lugar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feat, i) => (
              <div
                key={i}
                className="hero-card p-8 text-center group hover:-translate-y-2 transition-all duration-500"
              >
                <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-army-green/20 to-gold/10 border border-gold/20 flex items-center justify-center text-gold group-hover:scale-110 transition-transform duration-300">
                  {feat.icon}
                </div>
                <h3 className="text-lg font-black text-gray-100 mb-3 tracking-wide">{feat.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== HIERARCHY PREVIEW ====== */}
      <section className="relative py-20 border-t border-mil-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1">
              <p className="text-army-green-light text-xs tracking-[6px] uppercase font-bold mb-3">Estrutura de Comando</p>
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-6">
                Hierarquia <span className="text-choque-gradient">Militar</span>
              </h2>
              <p className="text-gray-500 mb-8 leading-relaxed">
                Do Tenente-Coronel ao Soldado 2ª Classe — conheça cada patente, suas responsabilidades e funções dentro do 2º BP Choque Anchieta.
              </p>
              <Link to="/hierarquia" className="btn-outline-gold inline-flex items-center gap-2">
                Ver Hierarquia Completa <MdArrowForward />
              </Link>
            </div>
            <div className="flex-1 w-full">
              <div className="space-y-2">
                {[
                  { insignia: '★★✩', name: 'Tenente-Coronel PM', cls: 'border-l-gold bg-gold/5' },
                  { insignia: '★✩✩', name: 'Major PM', cls: 'border-l-gold bg-gold/5' },
                  { insignia: '☆☆☆', name: 'Capitão PM', cls: 'border-l-gold/70 bg-gold/3' },
                  { insignia: '>>>>>', name: '1º Sargento PM', cls: 'border-l-army-green-light bg-army-green/5' },
                  { insignia: '>>', name: 'Cabo PM', cls: 'border-l-gray-500 bg-gray-500/5' },
                  { insignia: '›', name: 'Soldado 2ª Classe PM', cls: 'border-l-gray-600 bg-gray-600/5' },
                ].map((rank, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-4 px-5 py-3 rounded-lg border-l-4 ${rank.cls} border border-mil-border/50 hover:border-gold/30 transition-all duration-300 hover:translate-x-2`}
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    <span className="text-gold font-mono text-sm w-16 text-right">{rank.insignia}</span>
                    <span className="text-gray-300 font-bold text-sm tracking-wide">{rank.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====== CTA SECTION ====== */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-army-green-dark/30 via-mil-black to-army-green-dark/30" />
        <div className="absolute inset-0 military-grid opacity-30" />
        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
            Pronto para <span className="text-choque-gradient">Servir</span>?
          </h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">
            Aliste-se no 2º Batalhão de Polícia de Choque Anchieta e faça parte de uma força comprometida com a excelência.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/recrutamento" className="btn-choque !px-10 !py-4 !text-base !tracking-widest uppercase">
              Alistar-se Agora
            </Link>
            <Link to="/sobre" className="btn-outline-gold !px-8 !py-4 flex items-center gap-2">
              Conhecer o Batalhão <MdArrowForward />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

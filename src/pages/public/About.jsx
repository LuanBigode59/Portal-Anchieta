import { GiMilitaryFort } from 'react-icons/gi';
import { MdSecurity, MdGroups, MdFlag, MdVerified, MdMilitaryTech, MdSchool } from 'react-icons/md';
import { useState, useEffect } from 'react';
import { userService } from '../../services/userService';
import { getRankById } from '../../data/ranks';

export default function About() {
  const [commandTeam, setCommandTeam] = useState([]);

  useEffect(() => {
    async function fetchCommand() {
      try {
        const users = await userService.getUsers();
        const team = users
          .filter(u => u.cargo === 'tenente_coronel' || u.cargo === 'major')
          .map(u => {
            const rankData = getRankById(u.cargo);
            return {
              name: u.nome,
              rank: rankData ? rankData.name : u.cargo,
              role: u.cargo === 'tenente_coronel' ? 'Comandante' : 'Subcomandante',
              insignia: rankData ? rankData.insignia : '★★★',
              order: rankData ? rankData.order : 99,
              photo: u.foto_url
            };
          })
          .sort((a, b) => a.order - b.order);
        
        // Se não houver ninguém cadastrado, mostra dados de exemplo ou vazios
        if (team.length === 0) {
          setCommandTeam([
            { name: 'Aguardando Oficial', rank: 'Comando', role: 'Comandante', insignia: '---' }
          ]);
        } else {
          setCommandTeam(team);
        }
      } catch (err) {
        console.error("Erro ao carregar equipe de comando:", err);
      }
    }
    fetchCommand();
  }, []);
  const values = [
    { icon: <MdSecurity className="text-2xl" />, title: 'Disciplina', desc: 'Rigorosa obediência às normas e procedimentos operacionais padrão.' },
    { icon: <MdFlag className="text-2xl" />, title: 'Honra', desc: 'Compromisso com a ética, lealdade e integridade moral.' },
    { icon: <MdGroups className="text-2xl" />, title: 'Espírito de Corpo', desc: 'União e fraternidade entre os integrantes do batalhão.' },
    { icon: <MdVerified className="text-2xl" />, title: 'Excelência', desc: 'Busca constante pela perfeição em todas as missões.' },
    { icon: <MdMilitaryTech className="text-2xl" />, title: 'Coragem', desc: 'Enfrentar situações de risco com bravura e determinação.' },
    { icon: <MdSchool className="text-2xl" />, title: 'Instrução', desc: 'Formação contínua e aprimoramento técnico-profissional.' },
  ];

  const timeline = [
    { year: '2024', title: 'Fundação', desc: 'Criação do 2º Batalhão de Polícia de Choque Anchieta.' },
    { year: '2024', title: 'Primeira Operação', desc: 'Operação Sentinela — primeira grande operação do batalhão.' },
    { year: '2025', title: 'Expansão', desc: 'Crescimento do efetivo e estruturação das companhias.' },
    { year: '2026', title: 'Portal Oficial', desc: 'Lançamento do portal de gestão e instrução digital.' },
  ];

  return (
    <div className="pt-24 pb-16 min-h-screen">
      {/* Hero */}
      <section className="py-16 sm:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(201,168,76,0.05)_0%,_transparent_60%)]" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-mil-dark border-2 border-gold/30 shadow-gold-lg mb-6 animate-float">
            <img src="/logos/logo.png" alt="Logo" className="w-full h-full object-contain text-gold text-3xl" />
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white mb-4 animate-fadeInUp">
            Sobre o <span className="text-gold-gradient">Batalhão</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed animate-fadeInUp" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
            O 2º Batalhão de Polícia de Choque Anchieta é uma unidade de elite especializada em controle de distúrbios, 
            operações táticas especiais e policiamento de choque.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 border-t border-mil-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="hero-card p-8">
              <h2 className="text-xl font-black text-gold tracking-wider uppercase mb-4">Missão</h2>
              <p className="text-gray-400 leading-relaxed">
                Garantir a segurança pública através de operações de choque, controle de distúrbios civis, 
                policiamento ostensivo especializado e apoio tático às demais unidades policiais, 
                atuando com profissionalismo, ética e respeito aos direitos humanos.
              </p>
            </div>
            <div className="hero-card p-8">
              <h2 className="text-xl font-black text-army-green-light tracking-wider uppercase mb-4">Visão</h2>
              <p className="text-gray-400 leading-relaxed">
                Ser referência como batalhão de choque, reconhecido pela excelência operacional, 
                formação técnica de ponta e compromisso inabalável com a proteção da sociedade.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 border-t border-mil-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-gold text-xs tracking-[6px] uppercase font-bold mb-3">Princípios</p>
            <h2 className="text-3xl font-black text-white">Nossos <span className="text-gold-gradient">Valores</span></h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((val, i) => (
              <div key={i} className="hero-card p-6 group hover:-translate-y-1 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold mb-4 group-hover:scale-110 transition-transform">
                  {val.icon}
                </div>
                <h3 className="text-base font-black text-gray-100 tracking-wide mb-2">{val.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 border-t border-mil-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-army-green-light text-xs tracking-[6px] uppercase font-bold mb-3">Trajetória</p>
            <h2 className="text-3xl font-black text-white">Nossa <span className="text-green-gradient">História</span></h2>
          </div>
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-gold via-army-green to-transparent" />
            <div className="space-y-8">
              {timeline.map((item, i) => (
                <div key={i} className="relative pl-16">
                  <div className="absolute left-4 w-5 h-5 rounded-full bg-mil-dark border-2 border-gold flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-gold" />
                  </div>
                  <div className="hero-card p-5">
                    <span className="badge-gold !text-[10px] mb-2 inline-block">{item.year}</span>
                    <h3 className="text-base font-black text-gray-100 mb-1">{item.title}</h3>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Command Team */}
      <section className="py-16 border-t border-mil-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-gold text-xs tracking-[6px] uppercase font-bold mb-3">Liderança</p>
            <h2 className="text-3xl font-black text-white">Equipe de <span className="text-gold-gradient">Comando</span></h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {commandTeam.map((member, i) => (
              <div key={i} className="hero-card p-6 text-center group hover:-translate-y-1 transition-all">
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-army-green-dark to-army-green flex items-center justify-center text-white font-black text-2xl mb-4 border-2 border-gold/30 shadow-gold group-hover:shadow-gold-lg transition-shadow overflow-hidden">
                  {member.photo ? (
                    <img src={member.photo} alt={member.name} className="w-full h-full object-cover" />
                  ) : (
                    member.name.charAt(0)
                  )}
                </div>
                <p className="text-gold font-mono text-lg mb-1">{member.insignia}</p>
                <h3 className="text-base font-black text-gray-100">{member.name}</h3>
                <p className="text-xs text-gray-500 font-mono uppercase tracking-widest mt-1">{member.rank}</p>
                <span className="badge-gold !text-[10px] mt-3 inline-block">{member.role}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

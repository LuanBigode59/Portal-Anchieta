import { Outlet } from 'react-router-dom';
import PublicNavbar from './PublicNavbar';
import { useState, useEffect } from 'react';
import { userService } from '../../services/userService';

export default function PublicLayout() {
  const [commander, setCommander] = useState('Aguardando...');

  useEffect(() => {
    async function fetchCmd() {
      try {
        const users = await userService.getUsers();
        const tc = users.find(u => u.cargo === 'tenente_coronel');
        if (tc) setCommander(`TC ${tc.nome}`);
        else setCommander('Aguardando Oficial');
      } catch (err) {
        setCommander('Comando Não Encontrado');
      }
    }
    fetchCmd();
  }, []);

  return (
    <div className="min-h-screen bg-mil-black">
      <PublicNavbar />
      <main>
        <Outlet />
      </main>
      {/* Footer */}
      <footer className="border-t border-mil-border bg-mil-black/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-gold font-black text-sm tracking-[3px] uppercase mb-4">2º BP CHOQUE</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Batalhão de Polícia de Choque Anchieta — PMESP. 
                Servindo com honra, disciplina e coragem na defesa da sociedade.
              </p>
            </div>
            <div>
              <h4 className="text-gray-300 font-bold text-xs uppercase tracking-widest mb-4">Links Rápidos</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/sobre" className="text-gray-500 hover:text-gold transition-colors">Sobre o Batalhão</a></li>
                <li><a href="/hierarquia" className="text-gray-500 hover:text-gold transition-colors">Hierarquia</a></li>
                <li><a href="/recrutamento" className="text-gray-500 hover:text-gold transition-colors">Recrutamento</a></li>
                <li><a href="/login" className="text-gray-500 hover:text-gold transition-colors">Área Militar</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-gray-300 font-bold text-xs uppercase tracking-widest mb-4">Contato</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li>WhatsApp: 2º BP Choque Anchieta</li>
                <li>Comando: {commander}</li>
                <li>Cidade: Anchieta</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-mil-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[10px] text-gray-600 tracking-widest uppercase font-mono">
              © 2026 — 2º Batalhão de Polícia de Choque Anchieta — PMESP
            </p>
            <p className="text-[9px] text-gray-700 font-mono tracking-wider">
              Portal Oficial v2.0.0
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

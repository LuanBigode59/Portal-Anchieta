import Topbar from '../../components/layout/Topbar';
import { MdSettings, MdSave } from 'react-icons/md';
import { useNotifications } from '../../contexts/NotificationContext';

export default function Config() {
  const { sendNotification } = useNotifications();

  const handleSave = (e) => {
    e.preventDefault();
    sendNotification('Configurações salvas com sucesso (simulação).', 'sucesso');
  };

  return (
    <div className="animate-fadeIn">
      <Topbar title="CONFIGURAÇÕES" subtitle="Preferências do Sistema" />
      
      <div className="mil-card p-6 sm:p-8 max-w-2xl mx-auto">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-800 mb-6">
            <MdSettings className="text-2xl text-gold" />
            <h2 className="text-lg font-black text-gray-100 uppercase tracking-widest">Ajustes da Conta</h2>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Receber Notificações</label>
            <select className="mil-select">
              <option value="all">Todas as notificações</option>
              <option value="important">Apenas importantes</option>
              <option value="none">Nenhuma</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Tema do Sistema</label>
            <select className="mil-select" disabled>
              <option value="dark">Militar Escuro (Padrão)</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Discord ID (Opcional)</label>
            <input type="text" className="mil-input" placeholder="Ex: usuario#1234" defaultValue="luanbigode#0000" />
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-800">
            <button type="submit" className="btn-green flex items-center gap-2">
              <MdSave className="text-lg" />
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

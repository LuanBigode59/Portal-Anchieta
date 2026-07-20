import { MdClose, MdCheckCircle, MdWarning, MdInfo, MdError, MdDeleteSweep, MdDoneAll } from 'react-icons/md';
import { useNotifications } from '../../contexts/NotificationContext';

export default function NotificationsPanel({ onClose }) {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications();

  const getIcon = (type) => {
    switch (type) {
      case 'sucesso': return <MdCheckCircle className="text-green-500" />;
      case 'erro': return <MdError className="text-danger" />;
      case 'aviso': return <MdWarning className="text-gold" />;
      default: return <MdInfo className="text-blue-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end bg-black/50 backdrop-blur-sm animate-fadeIn" onClick={onClose}>
      <div 
        className="w-full max-w-sm h-full bg-mil-dark border-l border-gray-800 shadow-2xl flex flex-col animate-slideLeft"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-5 border-b border-gray-800 flex items-center justify-between bg-mil-black">
          <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
            Notificações 
            {unreadCount > 0 && <span className="bg-danger text-white text-[9px] px-2 py-0.5 rounded-full">{unreadCount}</span>}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <MdClose className="text-xl" />
          </button>
        </div>

        <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-800/50 bg-mil-black/50">
          <button onClick={markAllAsRead} className="text-[10px] text-gray-400 hover:text-gold flex items-center gap-1 transition-colors">
            <MdDoneAll /> Marcar lidas
          </button>
          <div className="flex-1" />
          <button onClick={clearAll} className="text-[10px] text-gray-400 hover:text-danger flex items-center gap-1 transition-colors">
            <MdDeleteSweep /> Limpar
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
          {notifications.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <MdInfo className="text-4xl mx-auto mb-2 opacity-50" />
              <p className="text-xs">Nenhuma notificação no momento.</p>
            </div>
          ) : (
            notifications.map(n => (
              <div 
                key={n.id} 
                onClick={() => !n.read && markAsRead(n.id)}
                className={`p-3 rounded-lg border ${n.read ? 'bg-mil-black/30 border-gray-800/30' : 'bg-mil-black border-gold/30 cursor-pointer hover:bg-mil-black/80'} transition-all flex gap-3`}
              >
                <div className="mt-0.5 text-lg flex-shrink-0">
                  {getIcon(n.type)}
                </div>
                <div>
                  <p className={`text-xs ${n.read ? 'text-gray-400' : 'text-gray-200 font-bold'}`}>{n.text}</p>
                  <span className="text-[9px] text-gray-500 mt-1 block">
                    {new Date(n.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

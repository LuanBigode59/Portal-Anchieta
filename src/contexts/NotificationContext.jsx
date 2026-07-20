import { createContext, useContext, useState, useCallback } from 'react';
import { MdClose, MdCheckCircle, MdWarning, MdInfo, MdError } from 'react-icons/md';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toasts, setToasts] = useState([]);

  const addNotification = useCallback((notification) => {
    const newNotif = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      read: false,
      ...notification,
    };
    setNotifications(prev => [newNotif, ...prev]);
    setUnreadCount(prev => prev + 1);
  }, []);

  const markAsRead = useCallback((id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const sendNotification = useCallback((text, type = 'comunicado') => {
    addNotification({ text, type });

    // Also show a visible toast popup
    const toastId = Date.now() + Math.random();
    const newToast = { id: toastId, text, type };
    setToasts(prev => [...prev, newToast]);

    // Auto-remove after 4 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== toastId));
    }, 4000);
  }, [addNotification]);

  return (
    <NotificationContext.Provider value={{
      notifications, unreadCount,
      addNotification, markAsRead, markAllAsRead, clearAll, sendNotification,
    }}>
      {children}
      {/* Toast Container */}
      <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none" style={{ maxWidth: '420px' }}>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

function ToastItem({ toast, onClose }) {
  const typeConfig = {
    sucesso: { icon: <MdCheckCircle />, bg: 'from-army-green/90 to-army-green-dark/90', border: 'border-army-green-light/50', iconColor: 'text-army-green-light' },
    aviso: { icon: <MdWarning />, bg: 'from-[#3d2e0a]/90 to-[#2a1f06]/90', border: 'border-warn/50', iconColor: 'text-warn-light' },
    erro: { icon: <MdError />, bg: 'from-danger/90 to-[#4a0a0a]/90', border: 'border-danger-light/50', iconColor: 'text-danger-light' },
    comunicado: { icon: <MdInfo />, bg: 'from-[#1a1a2e]/90 to-[#0f0f1a]/90', border: 'border-gold/40', iconColor: 'text-gold' },
  };

  const config = typeConfig[toast.type] || typeConfig.comunicado;

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 px-5 py-4 rounded-xl border ${config.border} bg-gradient-to-r ${config.bg} backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.6)] animate-slideIn`}
      style={{ animation: 'slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}
    >
      <div className={`text-xl mt-0.5 flex-shrink-0 ${config.iconColor}`}>{config.icon}</div>
      <p className="text-sm text-gray-100 font-semibold flex-1 leading-snug">{toast.text}</p>
      <button
        onClick={onClose}
        className="text-gray-500 hover:text-white transition-colors flex-shrink-0 mt-0.5"
      >
        <MdClose className="text-lg" />
      </button>
    </div>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}

export default NotificationContext;

import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import WhatsAppBanner from '../shared/WhatsAppBanner';

export default function MainLayout() {
  return (
    <div className="flex h-screen bg-[#050505] selection:bg-army-green/40 overflow-hidden">
      <Sidebar />
      <main className="flex-1 lg:ml-[280px] p-4 sm:p-6 lg:p-10 military-grid h-screen overflow-y-auto relative custom-scrollbar">
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-army-green/5 via-transparent to-transparent pointer-events-none z-0" />
        <div className="relative z-10 max-w-7xl mx-auto w-full pb-20">
          <WhatsAppBanner />
          <Outlet />
        </div>
      </main>
    </div>
  );
}

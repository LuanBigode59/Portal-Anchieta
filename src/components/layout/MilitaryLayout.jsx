import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function MilitaryLayout() {
  return (
    <div className="flex min-h-screen bg-[#050505] selection:bg-army-green/40">
      <Sidebar />
      <main className="flex-1 lg:ml-[280px] p-4 sm:p-6 lg:p-10 military-grid min-h-screen relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-army-green/5 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

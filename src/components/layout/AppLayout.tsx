import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomTabBar from './BottomTabBar';

import Header from './Header';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-background text-text-primary flex overflow-hidden">
      {/* Desktop Sidebar */}
      <Sidebar className="hidden md:flex" />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen relative">
        <Header />
        <div className="flex-1 overflow-y-auto pb-16 md:pb-0">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Tab Bar */}
      <BottomTabBar className="md:hidden" />
    </div>
  );
}

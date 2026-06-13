import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';
import { LayoutDashboard, Briefcase, MessageSquare, Wallet, User as UserIcon, Settings, LogOut } from 'lucide-react';

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const { logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Projects', path: '/projects', icon: Briefcase },
    { name: 'Messages', path: '/messages', icon: MessageSquare },
    { name: 'Wallet', path: '/wallet', icon: Wallet },
    { name: 'Profile', path: '/profile', icon: UserIcon },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className={cn('w-64 bg-surface border-r border-border-color flex-col p-4', className)}>
      <div className="flex items-center gap-3 px-2 mb-8">
        <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center font-bold text-white">
          T
        </div>
        <span className="font-display font-bold text-xl tracking-tight">TaskLance</span>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors font-medium',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-text-muted hover:text-text-primary hover:bg-surface-2'
              )
            }
          >
            <item.icon className="w-5 h-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto pt-4 border-t border-border-color">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-text-muted hover:text-error hover:bg-error/10 transition-colors font-medium"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  );
}

import { NavLink } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { LayoutDashboard, Briefcase, MessageSquare, Wallet, User as UserIcon } from 'lucide-react';

interface BottomTabBarProps {
  className?: string;
}

export default function BottomTabBar({ className }: BottomTabBarProps) {
  const navItems = [
    { name: 'Home', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Projects', path: '/projects', icon: Briefcase },
    { name: 'Messages', path: '/messages', icon: MessageSquare },
    { name: 'Wallet', path: '/wallet', icon: Wallet },
    { name: 'Profile', path: '/profile', icon: UserIcon },
  ];

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 h-16 bg-surface border-t border-border-color flex items-center justify-around px-2 z-50',
        className
      )}
    >
      {navItems.map((item) => (
        <NavLink
          key={item.name}
          to={item.path}
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center justify-center w-full h-full space-y-1',
              isActive ? 'text-primary' : 'text-text-muted hover:text-text-primary'
            )
          }
        >
          <item.icon className="w-6 h-6" />
          <span className="text-[10px] font-medium">{item.name}</span>
        </NavLink>
      ))}
    </nav>
  );
}

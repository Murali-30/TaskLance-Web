import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Check, Circle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';
import { subscribeToNotifications, markNotificationRead } from '../../lib/db';

export default function Header() {
  const navigate = useNavigate();
  const { user, role } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToNotifications(user.id, role || '', (newNotifs) => {
      setNotifications(newNotifs);
    });
    return () => unsubscribe();
  }, [user, role]);

  const unreadCount = notifications.filter(n => !n.readBy?.includes(user?.id)).length;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const markAsRead = async (id: string) => {
    if (!user) return;
    try {
      await markNotificationRead(id, user.id);
    } catch (err) {
      console.error('Failed to mark read', err);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    for (const n of notifications) {
      if (!n.readBy?.includes(user.id)) {
        await markNotificationRead(n.id, user.id);
      }
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-surface/80 border-b border-border-color px-4 md:px-8 py-3 flex items-center justify-between gap-4">
      
      {/* Search Bar */}
      <div className="flex-1 max-w-xl">
        <form onSubmit={handleSearchSubmit} className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search projects, freelancers, or skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-2 border border-border-color rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-text-muted"
          />
        </form>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4 md:gap-6">
        
        {/* Notifications */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="relative p-2 rounded-full hover:bg-surface-2 transition-colors text-text-muted hover:text-text-primary"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full ring-2 ring-surface"></span>
            )}
          </button>

          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="absolute right-0 mt-2 w-80 md:w-96 bg-surface border border-border-color rounded-2xl shadow-xl overflow-hidden z-50"
              >
                <div className="p-4 border-b border-border-color flex items-center justify-between">
                  <h3 className="font-semibold font-display">Notifications</h3>
                  {unreadCount > 0 && (
                    <button onClick={markAllAsRead} className="text-xs text-primary hover:underline font-medium">
                      Mark all as read
                    </button>
                  )}
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map(notif => {
                      const isRead = notif.readBy?.includes(user?.id);
                      return (
                        <div 
                          key={notif.id} 
                          className={cn(
                            "p-4 border-b border-border-color last:border-0 hover:bg-surface-2 transition-colors cursor-pointer flex gap-3",
                            !isRead && "bg-primary/5"
                          )}
                          onClick={() => markAsRead(notif.id)}
                        >
                          <div className="mt-1 flex-shrink-0">
                            {!isRead ? (
                              <Circle className="w-2.5 h-2.5 fill-primary text-primary" />
                            ) : (
                              <Check className="w-3 h-3 text-text-muted" />
                            )}
                          </div>
                          <div>
                            <p className={cn("text-sm font-medium mb-0.5", !isRead ? "text-text-primary" : "text-text-muted")}>
                              {notif.title}
                            </p>
                            <p className="text-xs text-text-muted line-clamp-2">{notif.message}</p>
                            <span className="text-[10px] text-text-muted font-medium mt-1 inline-block">
                              {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-8 text-center text-text-muted text-sm">
                      No notifications yet
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Avatar (Desktop only to avoid duplication with sidebar) */}
        <div 
          onClick={() => navigate('/profile')}
          className="hidden md:block w-8 h-8 rounded-full overflow-hidden border border-border-color cursor-pointer hover:ring-2 ring-primary transition-all"
        >
          <img 
            src={user?.avatar || "https://i.pravatar.cc/150?u=a042581f4e29026024d"} 
            alt={user?.name || "User"} 
            className="w-full h-full object-cover"
          />
        </div>

      </div>
    </header>
  );
}

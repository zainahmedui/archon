import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, PlusSquare, User, LogOut, Moon, Sun, Bell, Mail, Settings, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const { notifications, messages } = useData();
  const location = useLocation();
  const [isDark, setIsDark] = React.useState(false);

  React.useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const unreadNotifs = user ? notifications.filter(n => n.userId === user.id && !n.isRead).length : 0;
  // Simple unread count for messages (mock logic)
  const unreadMessages = 0; 

  const navItems = [
    { icon: Home, label: 'Feed', path: '/' },
    { icon: Search, label: 'Discover', path: '/search' },
    { icon: Users, label: 'Servers', path: '/communities' },
    { icon: PlusSquare, label: 'Create', path: '/create' },
    { icon: Bell, label: 'Activity', path: '/notifications', count: unreadNotifs },
    { icon: Mail, label: 'Messages', path: '/messages', count: unreadMessages },
    { icon: User, label: 'Profile', path: user ? `/profile/${user.id}` : '/login' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white dark:bg-archon-950 text-archon-900 dark:text-archon-50 transition-colors duration-200">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-archon-200 dark:border-archon-800 p-6 sticky top-0 h-screen justify-between">
        <div>
          <div className="mb-10 pl-2">
            <h1 className="text-3xl font-serif font-bold tracking-tight">Archon</h1>
          </div>
          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative ${
                    isActive 
                      ? 'bg-archon-100 dark:bg-archon-800 font-medium' 
                      : 'hover:bg-archon-50 dark:hover:bg-archon-900 text-archon-600 dark:text-archon-400'
                  }`}
                >
                  <div className="relative">
                    <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                    {item.count ? (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white dark:border-archon-950"></span>
                    ) : null}
                  </div>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        
        {/* User Mini Profile */}
        {user && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-archon-50 dark:bg-archon-900">
                <img src={user.avatarUrl} className="w-10 h-10 rounded-full bg-archon-200" alt="" />
                <div className="min-w-0">
                    <p className="font-bold text-sm truncate">{user.displayName}</p>
                    <p className="text-xs text-archon-500 truncate">@{user.username}</p>
                </div>
            </div>
        )}
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-2xl mx-auto md:border-r border-archon-200 dark:border-archon-800 min-h-screen pb-20 md:pb-0">
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-archon-950 border-t border-archon-200 dark:border-archon-800 px-4 py-3 flex justify-between z-50">
        {navItems.slice(0, 6).map((item) => { // Only show first 6 items on mobile to save space
           const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
           if (item.label === 'Settings') return null; // Hide settings on mobile nav, usually accessed via profile
           return (
             <Link
               key={item.label}
               to={item.path}
               className={`flex flex-col items-center gap-1 min-w-[3rem] relative ${
                 isActive ? 'text-archon-900 dark:text-white' : 'text-archon-400 dark:text-archon-600'
               }`}
             >
               <div className="relative">
                 <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                 {item.count ? (
                     <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-archon-950"></span>
                 ) : null}
               </div>
               <span className="text-[10px] font-medium">{item.label}</span>
             </Link>
           );
        })}
      </nav>
    </div>
  );
};
import React, { useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { VerificationBadge } from '../components/VerificationBadge';
import { Heart, MessageSquare, UserPlus, BellOff, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Notifications: React.FC = () => {
  const { notifications, users, markNotificationsRead } = useData();
  const { user } = useAuth();

  const myNotifications = notifications
    .filter(n => n.userId === user?.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  useEffect(() => {
    if (user) markNotificationsRead(user.id);
  }, [user, notifications.length]);

  if (myNotifications.length === 0) {
    return (
      <div className="min-h-screen p-6 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-archon-100 dark:bg-archon-800 rounded-full flex items-center justify-center mb-6">
          <BellOff className="w-8 h-8 text-archon-400" />
        </div>
        <h2 className="text-xl font-serif font-bold text-archon-900 dark:text-white mb-2">It's quiet here.</h2>
        <p className="text-archon-500 dark:text-archon-400 max-w-sm leading-relaxed">
          We don't send fake alerts to get your attention. You'll only see notifications when a real person interacts with you.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 bg-white dark:bg-archon-950">
      <header className="px-6 py-4 border-b border-archon-100 dark:border-archon-800 sticky top-0 bg-white/90 dark:bg-archon-950/90 backdrop-blur-sm z-10">
        <h1 className="text-2xl font-serif font-bold text-archon-900 dark:text-white">Activity</h1>
      </header>
      
      <div className="divide-y divide-archon-100 dark:divide-archon-800">
        {myNotifications.map(notif => {
          const actor = users.find(u => u.id === notif.actorId);
          
          let Icon = Heart;
          let colorClass = "text-red-500 bg-red-50 dark:bg-red-900/20";
          let text = "liked your post";

          if (notif.type === 'comment') {
            Icon = MessageSquare;
            colorClass = "text-blue-500 bg-blue-50 dark:bg-blue-900/20";
            text = "commented on your post";
          } else if (notif.type === 'follow') {
            Icon = UserPlus;
            colorClass = "text-green-500 bg-green-50 dark:bg-green-900/20";
            text = "started following you";
          } else if (notif.type === 'system') {
             Icon = ShieldCheck;
             colorClass = "text-archon-500 bg-archon-100 dark:bg-archon-800";
             text = "System Notification";
          }

          return (
            <div key={notif.id} className={`p-4 md:p-6 flex gap-4 ${!notif.isRead ? 'bg-archon-50/50 dark:bg-archon-900/20' : ''} hover:bg-archon-50 dark:hover:bg-archon-900/40 transition-colors`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${colorClass}`}>
                <Icon size={20} />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-1 mb-1">
                    <Link to={`/profile/${actor?.id}`} className="font-bold text-archon-900 dark:text-white hover:underline">
                        {actor?.displayName}
                    </Link>
                    {actor && <VerificationBadge level={actor.verificationLevel} />}
                    <span className="text-archon-500 text-sm ml-1">{formatTime(notif.createdAt)}</span>
                </div>
                <p className="text-archon-700 dark:text-archon-300">
                    {text}
                    {notif.message && <span className="text-archon-500 block mt-1 border-l-2 border-archon-200 dark:border-archon-700 pl-2 text-sm italic">"{notif.message}"</span>}
                </p>
              </div>
              
              {notif.type === 'follow' && (
                  <div className="self-center">
                    <Link to={`/profile/${actor?.id}`} className="text-xs font-bold text-archon-900 dark:text-white border border-archon-200 dark:border-archon-700 px-3 py-1.5 rounded-lg hover:bg-archon-50 dark:hover:bg-archon-800">
                        View
                    </Link>
                  </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
};
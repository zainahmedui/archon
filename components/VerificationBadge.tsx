import React from 'react';
import { BadgeCheck, ShieldCheck, CheckCircle } from 'lucide-react';
import { VerificationLevel } from '../types';

interface Props {
  level: VerificationLevel;
  className?: string;
}

export const VerificationBadge: React.FC<Props> = ({ level, className = "w-4 h-4" }) => {
  if (level === 'none') return null;

  const getIcon = () => {
    switch (level) {
      case 'blue':
        return { 
          icon: BadgeCheck, 
          color: 'text-blue-500', 
          label: 'Identity Verified',
          desc: 'Identity verified via government ID and phone.'
        };
      case 'green':
        return { 
          icon: CheckCircle, 
          color: 'text-green-500', 
          label: 'Real Human',
          desc: 'Consistently active, authentic human behavior.'
        };
      case 'purple':
        return { 
          icon: ShieldCheck, 
          color: 'text-purple-500', 
          label: 'Public Figure',
          desc: 'Notable public figure, verified manually.'
        };
      case 'grey':
        return { 
          icon: BadgeCheck, 
          color: 'text-gray-500', 
          label: 'Organization',
          desc: 'Verified organization or company.'
        };
      default:
        return null;
    }
  };

  const data = getIcon();
  if (!data) return null;

  const Icon = data.icon;

  return (
    <div className="group relative inline-flex items-center ml-1 align-middle">
      <Icon className={`${className} ${data.color}`} strokeWidth={2.5} aria-label={data.label} />
      
      {/* Transparency Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-archon-900 dark:bg-white text-white dark:text-archon-900 text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none w-48 text-center shadow-lg z-50">
        <strong className="block mb-1">{data.label}</strong>
        {data.desc}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-archon-900 dark:border-t-white"></div>
      </div>
    </div>
  );
};
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Search, Plus, Hash, Globe, Lock, Users } from 'lucide-react';
import { Button } from '../components/Button';

export const Communities: React.FC = () => {
  const { communities } = useData();
  const [query, setQuery] = useState('');

  const publicCommunities = communities
    .filter(c => c.visibility === 'public')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const filtered = query 
    ? publicCommunities.filter(c => c.name.toLowerCase().includes(query.toLowerCase()) || c.description.toLowerCase().includes(query.toLowerCase()))
    : publicCommunities;

  return (
    <div className="min-h-screen bg-white dark:bg-archon-950 pb-20">
      <header className="px-6 py-4 border-b border-archon-100 dark:border-archon-800 sticky top-0 bg-white/90 dark:bg-archon-950/90 backdrop-blur-sm z-10 flex justify-between items-center">
        <h1 className="text-2xl font-serif font-bold text-archon-900 dark:text-white">Communities</h1>
        <Link to="/communities/create">
            <Button size="sm" className="gap-2">
                <Plus size={18} /> Create
            </Button>
        </Link>
      </header>

      <div className="p-6">
        {/* Search */}
        <div className="relative mb-8">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-archon-400" />
            </div>
            <input
                type="text"
                className="block w-full pl-10 pr-3 py-3 border border-archon-300 dark:border-archon-700 rounded-xl leading-5 bg-white dark:bg-archon-900 placeholder-archon-400 focus:outline-none focus:ring-2 focus:ring-archon-500"
                placeholder="Find a server or group..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
        </div>

        {/* Empty State */}
        {publicCommunities.length === 0 ? (
            <div className="text-center py-20 animate-fade-in">
                <div className="w-20 h-20 bg-archon-100 dark:bg-archon-800 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Hash className="w-10 h-10 text-archon-400" />
                </div>
                <h2 className="text-xl font-bold text-archon-900 dark:text-white mb-2">No communities yet.</h2>
                <p className="text-archon-500 max-w-sm mx-auto mb-6">
                    Archon doesn't use fake servers to look busy. If you want a space to talk about something specific, you have to build it.
                </p>
                <Link to="/communities/create">
                    <Button variant="secondary">Start the First Community</Button>
                </Link>
            </div>
        ) : (
            <div className="grid grid-cols-1 gap-4">
                {filtered.map(c => (
                    <Link 
                        key={c.id} 
                        to={`/communities/${c.id}`}
                        className="group block p-5 rounded-2xl border border-archon-200 dark:border-archon-800 hover:border-archon-300 dark:hover:border-archon-700 bg-white dark:bg-archon-900 transition-all hover:shadow-sm"
                    >
                        <div className="flex items-start gap-4">
                            <div className="w-16 h-16 rounded-xl bg-archon-200 dark:bg-archon-800 flex items-center justify-center shrink-0 overflow-hidden">
                                {c.avatarUrl ? (
                                    <img src={c.avatarUrl} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <Hash className="w-8 h-8 text-archon-400" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-lg text-archon-900 dark:text-white group-hover:underline decoration-2 underline-offset-2">
                                            {c.name}
                                        </h3>
                                        <div className="flex items-center gap-2 text-xs text-archon-500 mt-1">
                                            <span className="capitalize px-1.5 py-0.5 rounded bg-archon-100 dark:bg-archon-800">{c.type}</span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1"><Users size={12} /> {c.members.length} members</span>
                                            <span>•</span>
                                            <span>{c.visibility === 'public' ? 'Public' : 'Private'}</span>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-archon-600 dark:text-archon-400 mt-2 line-clamp-2 text-sm leading-relaxed">
                                    {c.description}
                                </p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};
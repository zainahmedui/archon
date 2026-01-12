import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Search as SearchIcon } from 'lucide-react';

export const Search: React.FC = () => {
  const { users } = useData();
  const [query, setQuery] = useState('');

  // Filter users based on search
  const results = query 
    ? users.filter(u => 
        u.username.toLowerCase().includes(query.toLowerCase()) || 
        u.displayName.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  return (
    <div className="p-4 md:p-6 min-h-screen">
      <h1 className="text-2xl font-serif font-bold mb-6 text-archon-900 dark:text-white">Discover People</h1>
      
      <div className="relative mb-8">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <SearchIcon className="h-5 w-5 text-archon-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-3 border border-archon-300 dark:border-archon-700 rounded-xl leading-5 bg-white dark:bg-archon-900 placeholder-archon-400 focus:outline-none focus:ring-2 focus:ring-archon-500 focus:border-archon-500 sm:text-sm transition duration-150 ease-in-out"
          placeholder="Search for username..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        {query === '' && (
            <div className="text-center py-20 opacity-50">
                <p className="text-archon-500 mb-2">Search for your friends.</p>
                <p className="text-xs text-archon-400">We don't recommend strangers unless you look for them.</p>
            </div>
        )}

        {query !== '' && results.length === 0 && (
            <div className="text-center py-20">
                <p className="text-archon-500">No users found matching "{query}".</p>
            </div>
        )}

        {results.map(user => (
          <Link 
            key={user.id} 
            to={`/profile/${user.id}`}
            className="flex items-center gap-4 p-4 rounded-xl hover:bg-white dark:hover:bg-archon-900 transition-colors border border-transparent hover:border-archon-200 dark:hover:border-archon-800"
          >
            <img 
                src={user.avatarUrl} 
                alt={user.username} 
                className="w-12 h-12 rounded-full bg-archon-200 object-cover" 
            />
            <div>
              <p className="font-semibold text-archon-900 dark:text-white">{user.displayName}</p>
              <p className="text-sm text-archon-500">@{user.username}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

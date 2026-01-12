import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Button } from '../components/Button';
import { Camera, ArrowLeft } from 'lucide-react';

const SERVER_CATEGORIES = [
    'Technology', 'Art & Design', 'Gaming', 'Music', 'Science', 'Literature', 'Lifestyle', 'Local Community', 'Other'
];

export const CreateCommunity: React.FC = () => {
  const { user } = useAuth();
  const { createCommunity } = useData();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [purpose, setPurpose] = useState('');
  const [category, setCategory] = useState('');
  const [rules, setRules] = useState('');
  const [type, setType] = useState<'server' | 'group'>('server');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [avatarUrl, setAvatarUrl] = useState('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAvatarUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    try {
        const id = createCommunity(user.id, {
            name,
            description,
            purpose,
            category,
            rules,
            type,
            visibility,
            avatarUrl,
            ownerId: user.id
        });
        navigate(`/communities/${id}`);
    } catch (err) {
        alert("Could not create community. You may be rate limited.");
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-archon-950 pb-20">
      <header className="px-4 py-3 border-b border-archon-100 dark:border-archon-800 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-archon-50 dark:hover:bg-archon-900 rounded-full">
              <ArrowLeft size={20} className="text-archon-900 dark:text-white" />
          </button>
          <h1 className="text-xl font-serif font-bold text-archon-900 dark:text-white">Create Community</h1>
      </header>

      <form onSubmit={handleSubmit} className="p-6 max-w-lg mx-auto space-y-8 animate-fade-in">
          {/* Avatar */}
          <div className="flex flex-col items-center">
              <div className="relative group cursor-pointer w-24 h-24">
                  <div className={`w-full h-full overflow-hidden bg-archon-100 dark:bg-archon-800 border-2 border-dashed border-archon-300 dark:border-archon-600 flex items-center justify-center ${type === 'server' ? 'rounded-2xl' : 'rounded-full'}`}>
                      {avatarUrl ? (
                          <img src={avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                          <Camera className="text-archon-400" size={32} />
                      )}
                  </div>
                  <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-all cursor-pointer text-white rounded-xl">
                      <span className="text-xs font-bold">Upload</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
              </div>
          </div>

          {/* Type Selection */}
          <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setType('server')}
                className={`p-4 rounded-xl border-2 text-center transition-all ${type === 'server' ? 'border-archon-900 dark:border-white bg-archon-50 dark:bg-archon-900' : 'border-archon-200 dark:border-archon-800'}`}
              >
                  <h3 className="font-bold text-archon-900 dark:text-white">Server</h3>
                  <p className="text-xs text-archon-500 mt-1">Topic-based space</p>
              </button>
              <button
                type="button"
                onClick={() => setType('group')}
                className={`p-4 rounded-xl border-2 text-center transition-all ${type === 'group' ? 'border-archon-900 dark:border-white bg-archon-50 dark:bg-archon-900' : 'border-archon-200 dark:border-archon-800'}`}
              >
                  <h3 className="font-bold text-archon-900 dark:text-white">Group</h3>
                  <p className="text-xs text-archon-500 mt-1">Casual discussion</p>
              </button>
          </div>

          {/* Details */}
          <div className="space-y-4">
              <div>
                  <label className="block text-sm font-medium text-archon-700 dark:text-archon-300 mb-1">Name</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    maxLength={30}
                    className="w-full px-4 py-2 rounded-lg border border-archon-300 dark:border-archon-700 dark:bg-archon-800 focus:ring-2 focus:ring-archon-900 outline-none"
                    placeholder="e.g. Vintage Photography"
                  />
              </div>

              {type === 'server' && (
                  <div>
                    <label className="block text-sm font-medium text-archon-700 dark:text-archon-300 mb-1">Category</label>
                    <select
                        value={category}
                        onChange={e => setCategory(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-archon-300 dark:border-archon-700 dark:bg-archon-800 focus:ring-2 focus:ring-archon-900 outline-none"
                    >
                        <option value="">Select a category</option>
                        {SERVER_CATEGORIES.map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                  </div>
              )}
              
              <div>
                  <label className="block text-sm font-medium text-archon-700 dark:text-archon-300 mb-1">Tagline</label>
                  <textarea 
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    required
                    maxLength={150}
                    className="w-full px-4 py-2 rounded-lg border border-archon-300 dark:border-archon-700 dark:bg-archon-800 focus:ring-2 focus:ring-archon-900 outline-none resize-none h-20"
                    placeholder="Short description for the search page."
                  />
              </div>

              <div>
                  <label className="block text-sm font-medium text-archon-700 dark:text-archon-300 mb-1">Purpose & Goals (Required)</label>
                  <textarea 
                    value={purpose}
                    onChange={e => setPurpose(e.target.value)}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-archon-300 dark:border-archon-700 dark:bg-archon-800 focus:ring-2 focus:ring-archon-900 outline-none resize-none h-24"
                    placeholder="Why does this community exist? What should members expect?"
                  />
                  <p className="text-xs text-archon-500 mt-1">This will be the first thing new members see.</p>
              </div>

              <div>
                  <label className="block text-sm font-medium text-archon-700 dark:text-archon-300 mb-1">Rules (Required)</label>
                  <textarea 
                    value={rules}
                    onChange={e => setRules(e.target.value)}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-archon-300 dark:border-archon-700 dark:bg-archon-800 focus:ring-2 focus:ring-archon-900 outline-none resize-none h-32"
                    placeholder="Set expectations. Authentic communities need boundaries."
                  />
              </div>

              <div>
                  <label className="block text-sm font-medium text-archon-700 dark:text-archon-300 mb-2">Visibility</label>
                  <div className="flex items-center gap-4 p-4 rounded-xl border border-archon-200 dark:border-archon-800">
                     <label className="flex items-center gap-2 cursor-pointer">
                         <input type="radio" name="vis" checked={visibility === 'public'} onChange={() => setVisibility('public')} />
                         <span className="text-sm dark:text-white">Public</span>
                     </label>
                     <label className="flex items-center gap-2 cursor-pointer">
                         <input type="radio" name="vis" checked={visibility === 'private'} onChange={() => setVisibility('private')} />
                         <span className="text-sm dark:text-white">Private (Invite Only)</span>
                     </label>
                  </div>
              </div>
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={!name || !description || !rules || !purpose}>
              Create Community
          </Button>
      </form>
    </div>
  );
};
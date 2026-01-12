import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { checkPostTone } from '../services/geminiService';
import { Sparkles, X, Image as ImageIcon, Video, Globe, Lock, Users, ChevronDown } from 'lucide-react';

type Visibility = 'public' | 'followers' | 'private';

export const CreatePost: React.FC = () => {
  const { user } = useAuth();
  const { createPost } = useData();
  const navigate = useNavigate();
  
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [visibility, setVisibility] = useState<Visibility>('public');
  const [showVisibilityMenu, setShowVisibilityMenu] = useState(false);
  
  const [suggestion, setSuggestion] = useState('');
  const [isChecking, setIsChecking] = useState(false);

  // Auto-resize textarea
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto';
      textAreaRef.current.style.height = textAreaRef.current.scrollHeight + 'px';
    }
  };

  const handleCancel = () => {
    if (content.trim().length > 0 || mediaUrl) {
      if (window.confirm("Discard this post?")) {
        navigate('/');
      }
    } else {
      navigate('/');
    }
  };

  const handleSubmit = () => {
    if (!content.trim() && !mediaUrl) return;
    if (!user) return;
    
    createPost(
      user.id, 
      content, 
      mediaUrl && mediaType ? { type: mediaType, url: mediaUrl } : undefined,
      visibility
    );
    navigate('/');
  };

  const handleToneCheck = async () => {
    setIsChecking(true);
    const result = await checkPostTone(content);
    setSuggestion(result);
    setIsChecking(false);
  };

  const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setMediaUrl(url);
      setMediaType(type);
    }
  };

  const getVisibilityIcon = (v: Visibility) => {
    switch (v) {
      case 'public': return <Globe size={18} />;
      case 'followers': return <Users size={18} />;
      case 'private': return <Lock size={18} />;
    }
  };

  const getVisibilityLabel = (v: Visibility) => {
    switch (v) {
      case 'public': return 'Everyone';
      case 'followers': return 'Followers';
      case 'private': return 'Only Me';
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-archon-950 flex flex-col">
      {/* 1. Header */}
      <header className="px-4 py-3 flex items-center justify-between border-b border-archon-100 dark:border-archon-800 bg-white dark:bg-archon-950 sticky top-0 z-10">
        <button 
          onClick={handleCancel}
          className="text-archon-600 dark:text-archon-400 hover:text-archon-900 dark:hover:text-white transition-colors"
        >
          Cancel
        </button>
        <h1 className="text-lg font-serif font-bold text-archon-900 dark:text-white">Create Post</h1>
        <button
          onClick={handleSubmit}
          disabled={!content.trim() && !mediaUrl}
          className="bg-archon-900 dark:bg-white text-white dark:text-archon-950 px-4 py-1.5 rounded-full font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:bg-archon-800 dark:hover:bg-archon-200 transition-colors"
        >
          Post
        </button>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full p-4 overflow-y-auto">
        {/* User Context */}
        <div className="flex items-center gap-3 mb-4">
          <img 
            src={user?.avatarUrl} 
            alt="Me" 
            className="w-10 h-10 rounded-full object-cover bg-archon-200 dark:bg-archon-800"
          />
          <div>
            <span className="block font-semibold text-archon-900 dark:text-white text-sm">
              {user?.displayName}
            </span>
            
            {/* Visibility Selector */}
            <div className="relative mt-0.5">
              <button 
                onClick={() => setShowVisibilityMenu(!showVisibilityMenu)}
                className="flex items-center gap-1.5 text-xs text-archon-500 hover:text-archon-900 dark:hover:text-archon-300 border border-archon-200 dark:border-archon-700 rounded-md px-2 py-0.5 transition-colors"
              >
                {getVisibilityIcon(visibility)}
                <span>{getVisibilityLabel(visibility)}</span>
                <ChevronDown size={12} />
              </button>
              
              {showVisibilityMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-10 cursor-default" 
                    onClick={() => setShowVisibilityMenu(false)} 
                  />
                  <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-archon-900 rounded-xl shadow-xl border border-archon-100 dark:border-archon-800 z-20 overflow-hidden animate-fade-in">
                    {(['public', 'followers', 'private'] as Visibility[]).map((v) => (
                      <button
                        key={v}
                        onClick={() => { setVisibility(v); setShowVisibilityMenu(false); }}
                        className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-archon-50 dark:hover:bg-archon-800 ${visibility === v ? 'text-archon-900 dark:text-white bg-archon-50 dark:bg-archon-800' : 'text-archon-600 dark:text-archon-400'}`}
                      >
                        {getVisibilityIcon(v)}
                        <span className="text-sm font-medium">{getVisibilityLabel(v)}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 2. Content Input */}
        <textarea
          ref={textAreaRef}
          value={content}
          onChange={handleInput}
          placeholder="What's on your mind?"
          className="w-full min-h-[150px] bg-transparent text-lg md:text-xl text-archon-900 dark:text-white placeholder-archon-400 outline-none resize-none leading-relaxed"
          autoFocus
        />

        {/* 3. Media Preview */}
        {mediaUrl && (
          <div className="relative mt-4 rounded-xl overflow-hidden bg-black/5 dark:bg-white/5">
            {mediaType === 'image' ? (
              <img src={mediaUrl} alt="Preview" className="w-full h-auto max-h-[500px] object-contain" />
            ) : (
              <video src={mediaUrl} controls className="w-full h-auto max-h-[500px]" />
            )}
            <button
              onClick={() => { setMediaUrl(''); setMediaType(null); }}
              className="absolute top-3 right-3 bg-black/60 text-white p-1.5 rounded-full hover:bg-black/80 transition-colors backdrop-blur-sm"
            >
              <X size={20} />
            </button>
          </div>
        )}

        {/* Tone Suggestion Banner */}
        {suggestion && (
          <div className="mt-6 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 p-4 rounded-xl flex gap-3 animate-fade-in">
            <Sparkles className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div className="text-sm text-indigo-900 dark:text-indigo-200">
              <p className="font-medium mb-1">Tone Check:</p>
              <p>{suggestion}</p>
            </div>
            <button 
              onClick={() => setSuggestion('')}
              className="ml-auto text-indigo-400 hover:text-indigo-600 self-start"
            >
              <X size={16} />
            </button>
          </div>
        )}
      </main>

      {/* 4. Bottom Toolbar */}
      <footer className="p-4 border-t border-archon-100 dark:border-archon-800 bg-white dark:bg-archon-950 sticky bottom-0">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div className="flex items-center gap-4">
            <label className="cursor-pointer text-archon-500 hover:text-archon-900 dark:hover:text-white transition-colors p-2 rounded-full hover:bg-archon-50 dark:hover:bg-archon-800">
              <input type="file" accept="image/*" onChange={(e) => handleMediaSelect(e, 'image')} className="hidden" />
              <ImageIcon size={24} />
            </label>
            
            <label className="cursor-pointer text-archon-500 hover:text-archon-900 dark:hover:text-white transition-colors p-2 rounded-full hover:bg-archon-50 dark:hover:bg-archon-800">
              <input type="file" accept="video/*" onChange={(e) => handleMediaSelect(e, 'video')} className="hidden" />
              <Video size={24} />
            </label>

            <button
              onClick={handleToneCheck}
              disabled={!content.trim() || isChecking}
              className={`p-2 rounded-full transition-colors ${
                content.trim() 
                  ? 'text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20' 
                  : 'text-archon-300 cursor-not-allowed'
              }`}
              title="Check Tone"
            >
              {isChecking ? (
                 <span className="block w-6 h-6 rounded-full border-2 border-current border-t-transparent animate-spin" />
              ) : (
                 <Sparkles size={24} />
              )}
            </button>
          </div>

          <div className="text-xs font-medium text-archon-400 tabular-nums">
            {content.length} chars
          </div>
        </div>
      </footer>
    </div>
  );
};
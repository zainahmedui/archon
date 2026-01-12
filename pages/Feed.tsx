import React from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { VerificationBadge } from '../components/VerificationBadge';
import { MessageSquare, Heart, Share2, MoreHorizontal, User as UserIcon, Lock, Users, Globe } from 'lucide-react';

const formatTime = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
  return date.toLocaleDateString();
}

const VisibilityIcon = ({ visibility }: { visibility: 'public' | 'followers' | 'private' }) => {
    switch (visibility) {
        case 'public': return <Globe size={12} />;
        case 'followers': return <Users size={12} />;
        case 'private': return <Lock size={12} />;
        default: return <Globe size={12} />;
    }
}

export const Feed: React.FC = () => {
  const { posts, users, toggleLike } = useData();
  const { user } = useAuth();

  // Filter out community posts (they live in their own servers/groups)
  // Only show posts from people I follow OR my own posts
  const feedPosts = posts.filter(post => 
    !post.communityId && 
    (user?.following.includes(post.authorId) || post.authorId === user?.id)
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Empty State - Crucial for "Authenticity"
  if (feedPosts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center animate-fade-in bg-white dark:bg-archon-950">
        <div className="w-20 h-20 bg-archon-100 dark:bg-archon-800 rounded-full flex items-center justify-center mb-8">
          <div className="relative">
             <div className="absolute inset-0 bg-archon-400 opacity-20 blur-xl rounded-full"></div>
             <MessageSquare className="w-8 h-8 text-archon-600 dark:text-archon-300 relative z-10" strokeWidth={1.5} />
          </div>
        </div>
        
        <h2 className="text-3xl font-serif font-bold mb-4 text-archon-900 dark:text-white">
          A blank canvas.
        </h2>
        
        <p className="text-archon-500 dark:text-archon-400 max-w-md mb-10 leading-relaxed text-lg">
          Your feed is empty because we don't guess what you like. 
          <br className="hidden md:block"/> We wait for you to choose.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
          <Link 
            to="/search" 
            className="flex-1 py-3.5 rounded-xl bg-archon-900 dark:bg-white text-white dark:text-archon-950 font-medium hover:opacity-90 transition-opacity flex items-center justify-center"
          >
            Discover People
          </Link>
          <Link 
            to="/create" 
            className="flex-1 py-3.5 rounded-xl border border-archon-200 dark:border-archon-700 font-medium hover:bg-archon-50 dark:hover:bg-archon-900 transition-colors text-archon-900 dark:text-white flex items-center justify-center"
          >
            Create Post
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 bg-white dark:bg-archon-950">
      {/* Top Nav */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-archon-950/90 backdrop-blur-lg border-b border-archon-100 dark:border-archon-800 transition-colors">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-2xl font-serif font-bold text-archon-900 dark:text-white tracking-tight">
            Archon
          </h1>
          <div className="flex items-center gap-2">
             <Link to={user ? `/profile/${user.id}` : '/login'} className="group">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-archon-100 dark:bg-archon-800 ring-2 ring-transparent group-hover:ring-archon-200 dark:group-hover:ring-archon-700 transition-all">
                    {user?.avatarUrl ? (
                        <img src={user.avatarUrl} alt="Me" className="w-full h-full object-cover" />
                    ) : (
                        <UserIcon className="w-full h-full p-1.5 text-archon-400" />
                    )}
                </div>
             </Link>
          </div>
        </div>
      </header>
      
      {/* Feed Area */}
      <div className="max-w-2xl mx-auto">
        {feedPosts.map(post => {
          const author = users.find(u => u.id === post.authorId);
          const isLiked = post.likes.includes(user?.id || '');
          const likeCount = post.likes.length;
          const commentCount = post.comments.length;

          return (
            <article key={post.id} className="border-b border-archon-100 dark:border-archon-800 last:border-0 hover:bg-archon-50/30 dark:hover:bg-archon-900/10 transition-colors animate-fade-in">
              <div className="p-4 md:p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-3">
                    <div className="flex gap-3">
                        <Link to={`/profile/${author?.id}`} className="shrink-0">
                            <img 
                                src={author?.avatarUrl} 
                                alt={author?.username}
                                className="w-10 h-10 rounded-full bg-archon-200 dark:bg-archon-800 object-cover border border-archon-100 dark:border-archon-800" 
                            />
                        </Link>
                        <div className="flex flex-col leading-tight">
                             <div className="flex items-center gap-1">
                                <Link to={`/profile/${author?.id}`} className="font-semibold text-archon-900 dark:text-white hover:underline decoration-1 underline-offset-2">
                                    {author?.displayName}
                                </Link>
                                {author && <VerificationBadge level={author.verificationLevel} />}
                             </div>
                             <div className="flex items-center gap-2 text-sm text-archon-500 mt-0.5">
                                <span>@{author?.username}</span>
                                <span className="w-0.5 h-0.5 rounded-full bg-archon-400"></span>
                                <span>{formatTime(post.createdAt)}</span>
                                <span className="w-0.5 h-0.5 rounded-full bg-archon-400"></span>
                                <div className="opacity-60 flex items-center" title={post.visibility}>
                                    <VisibilityIcon visibility={post.visibility} />
                                </div>
                             </div>
                        </div>
                    </div>
                    
                    <button className="text-archon-300 hover:text-archon-600 dark:hover:text-archon-400 transition-colors p-1">
                        <MoreHorizontal size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="pl-[52px]"> {/* Align with text start */}
                    <p className="text-base md:text-lg text-archon-800 dark:text-archon-100 leading-relaxed whitespace-pre-wrap font-light">
                        {post.content}
                    </p>

                    {post.imageUrl && (
                        <div className="mt-3 rounded-2xl overflow-hidden border border-archon-100 dark:border-archon-800 bg-archon-50 dark:bg-archon-900">
                            <img src={post.imageUrl} alt="Post attachment" className="w-full h-auto max-h-[500px] object-cover" />
                        </div>
                    )}
                    
                    {post.videoUrl && (
                        <div className="mt-3 rounded-2xl overflow-hidden border border-archon-100 dark:border-archon-800 bg-black">
                            <video src={post.videoUrl} controls className="w-full h-auto max-h-[500px]" />
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-6 mt-4 -ml-2">
                        <button 
                            onClick={() => user && toggleLike(post.id, user.id)}
                            className={`flex items-center gap-2 px-2 py-1 rounded-lg transition-colors duration-200 ${
                                isLiked 
                                    ? 'text-red-500' 
                                    : 'text-archon-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10'
                            }`}
                            aria-label={isLiked ? "Unlike" : "Like"}
                        >
                            <Heart size={20} fill={isLiked ? "currentColor" : "none"} strokeWidth={isLiked ? 0 : 2} />
                            {likeCount > 0 && <span className="text-sm font-medium">{likeCount}</span>}
                        </button>
                        
                        <button className="flex items-center gap-2 px-2 py-1 rounded-lg text-archon-500 hover:text-archon-900 dark:hover:text-white hover:bg-archon-100 dark:hover:bg-archon-800 transition-colors duration-200">
                            <MessageSquare size={20} strokeWidth={2} />
                            {commentCount > 0 && <span className="text-sm font-medium">{commentCount}</span>}
                        </button>

                        <button className="flex items-center gap-2 px-2 py-1 rounded-lg text-archon-500 hover:text-archon-900 dark:hover:text-white hover:bg-archon-100 dark:hover:bg-archon-800 transition-colors duration-200 ml-auto">
                            <Share2 size={20} strokeWidth={2} />
                        </button>
                    </div>
                </div>
              </div>
            </article>
          );
        })}
        
        {/* End of Feed */}
        <div className="py-12 text-center border-t border-archon-100 dark:border-archon-800 mt-4">
            <p className="text-sm text-archon-400 font-medium">You're all caught up.</p>
        </div>
      </div>
    </div>
  );
};
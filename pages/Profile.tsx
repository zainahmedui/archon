import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { VerificationBadge } from '../components/VerificationBadge';
import { Calendar, User as UserIcon, Camera, X, Lock, MoreHorizontal, MessageCircle, Settings } from 'lucide-react';
import { VerificationLevel } from '../types';
import { generateDefaultAvatar } from '../utils/avatarUtils';

export const Profile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getUser, posts, followUser, requestVerification } = useData();
  const { user: currentUser, updateUser } = useAuth();
  
  const profileUser = getUser(id || '');
  const userPosts = posts.filter(p => p.authorId === id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editAvatar, setEditAvatar] = useState('');

  useEffect(() => {
    if (isEditing && currentUser) {
        setEditName(currentUser.displayName);
        setEditBio(currentUser.bio);
        setEditAvatar(currentUser.avatarUrl || '');
    }
  }, [isEditing, currentUser]);

  if (!profileUser) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 bg-archon-100 dark:bg-archon-800 rounded-full flex items-center justify-center mb-4">
                <UserIcon className="w-8 h-8 text-archon-400" />
            </div>
            <h2 className="text-xl font-serif font-bold text-archon-900 dark:text-white">User not found</h2>
            <p className="text-archon-500 mt-2">The link you followed may be broken, or the page may have been removed.</p>
            <Link to="/" className="mt-6 text-archon-900 dark:text-white underline decoration-dotted">Go back home</Link>
        </div>
    );
  }

  const isOwnProfile = currentUser?.id === profileUser.id;
  const isFollowing = currentUser ? profileUser.followers.includes(currentUser.id) : false;
  const isPrivate = profileUser.isPrivate;
  const canViewContent = !isPrivate || isFollowing || isOwnProfile;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (currentUser) {
        updateUser({
            displayName: editName,
            bio: editBio,
            avatarUrl: editAvatar
        });
        setIsEditing(false);
    }
  };

  return (
    <div className="min-h-screen pb-20 bg-white dark:bg-archon-950">
      {/* 1. Header Area */}
      <div className="h-48 bg-gradient-to-b from-archon-200 to-archon-100 dark:from-archon-900 dark:to-archon-950 w-full relative">
        {/* Actions Bar */}
        <div className="absolute top-4 right-4 flex gap-2">
           {isOwnProfile && (
             <Link to="/settings" className="p-2 bg-white/50 dark:bg-black/30 backdrop-blur-md rounded-full text-archon-900 dark:text-white hover:bg-white dark:hover:bg-archon-800 transition-colors">
                 <Settings size={20} />
             </Link>
           )}
           {!isOwnProfile && (
               <button className="p-2 bg-white/50 dark:bg-black/30 backdrop-blur-md rounded-full text-archon-900 dark:text-white hover:bg-white dark:hover:bg-archon-800 transition-colors">
                   <MoreHorizontal size={20} />
               </button>
           )}
        </div>
      </div>
      
      <div className="px-6 -mt-20 mb-8 relative z-10">
         {/* Profile Photo */}
         <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white dark:border-archon-950 bg-white dark:bg-archon-900 overflow-hidden shadow-sm">
            <img 
                src={profileUser.avatarUrl} 
                alt={profileUser.displayName} 
                className="w-full h-full object-cover"
            />
         </div>

         {/* Identity & Actions */}
         <div className="flex flex-col md:flex-row md:items-end justify-between mt-4 gap-4">
             <div>
                 <div className="flex items-center gap-1">
                     <h1 className="text-3xl font-serif font-bold text-archon-900 dark:text-white leading-tight">
                         {profileUser.displayName}
                     </h1>
                     <VerificationBadge level={profileUser.verificationLevel} className="w-6 h-6" />
                 </div>
                 <p className="text-lg text-archon-500 font-medium">@{profileUser.username}</p>
                 
                 {/* Trust Signal: Join Date */}
                 <div className="flex items-center gap-1.5 text-sm text-archon-400 mt-2">
                     <Calendar size={14} />
                     <span>Joined {new Date(profileUser.joinedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                     {isPrivate && (
                         <>
                            <span className="mx-1">•</span>
                            <Lock size={12} />
                            <span>Private Account</span>
                         </>
                     )}
                 </div>
             </div>

             <div className="flex items-center gap-3">
                 {isOwnProfile ? (
                     <Button variant="secondary" onClick={() => setIsEditing(true)}>Edit Profile</Button>
                 ) : (
                     <>
                        <Button 
                            variant={isFollowing ? 'secondary' : 'primary'}
                            onClick={() => currentUser && followUser(currentUser.id, profileUser.id)}
                            className="min-w-[120px]"
                        >
                            {isFollowing ? 'Following' : 'Follow'}
                        </Button>
                        <Link to="/messages">
                            <Button variant="ghost" className="px-3" title="Message">
                                <MessageCircle size={24} />
                            </Button>
                        </Link>
                     </>
                 )}
             </div>
         </div>

         {/* Bio */}
         <div className="mt-6 max-w-lg">
             <p className="text-archon-800 dark:text-archon-200 leading-relaxed whitespace-pre-wrap text-lg">
                 {profileUser.bio || <span className="text-archon-400 italic text-base">No bio added yet.</span>}
             </p>
         </div>

         {/* Stats - Real numbers only */}
         <div className="flex gap-8 mt-6 py-4 border-b border-archon-100 dark:border-archon-800">
             <div className="flex items-center gap-2">
                 <span className="font-bold text-archon-900 dark:text-white text-lg">{profileUser.following.length}</span>
                 <span className="text-archon-500">Following</span>
             </div>
             <div className="flex items-center gap-2">
                 <span className="font-bold text-archon-900 dark:text-white text-lg">{profileUser.followers.length}</span>
                 <span className="text-archon-500">Followers</span>
             </div>
         </div>
      </div>

      {/* 2. Content Section */}
      <div className="max-w-2xl mx-auto px-4 md:px-0">
          {!canViewContent ? (
              <div className="py-20 flex flex-col items-center text-center animate-fade-in">
                  <div className="w-16 h-16 bg-archon-100 dark:bg-archon-800 rounded-full flex items-center justify-center mb-4 text-archon-500">
                      <Lock size={32} />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-archon-900 dark:text-white">This account is private</h3>
                  <p className="text-archon-500 mt-2 max-w-xs">Follow @{profileUser.username} to see their photos and videos.</p>
              </div>
          ) : (
              <>
                <h3 className="px-4 md:px-6 font-bold text-sm text-archon-400 uppercase tracking-wide mb-4">Posts</h3>
                
                {userPosts.length === 0 ? (
                    <div className="py-16 text-center border-2 border-dashed border-archon-100 dark:border-archon-800 rounded-xl mx-4 md:mx-6">
                        {isOwnProfile ? (
                            <div className="space-y-4">
                                <p className="text-archon-500">Your profile is a blank canvas.</p>
                                <Link to="/create">
                                    <Button>Share your first authentic moment</Button>
                                </Link>
                            </div>
                        ) : (
                            <p className="text-archon-400 italic">
                                @{profileUser.username} hasn't posted anything yet.
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="space-y-0">
                        {userPosts.map(post => (
                            <div key={post.id} className="p-4 md:p-6 border-b border-archon-100 dark:border-archon-800 hover:bg-archon-50/50 dark:hover:bg-archon-900/50 transition-colors">
                                <div className="flex gap-4">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-12 h-12 rounded-full overflow-hidden bg-archon-200 flex-shrink-0">
                                            <img src={profileUser.avatarUrl} className="w-full h-full object-cover" />
                                        </div>
                                        {/* Timeline connector line could go here */}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-baseline justify-between mb-1">
                                            <span className="font-bold text-archon-900 dark:text-white">{profileUser.displayName}</span>
                                            <span className="text-xs text-archon-400">{new Date(post.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-archon-800 dark:text-archon-200 leading-relaxed whitespace-pre-wrap mb-3">{post.content}</p>
                                        
                                        {post.imageUrl && (
                                            <div className="rounded-xl overflow-hidden border border-archon-100 dark:border-archon-800 mb-3">
                                                <img src={post.imageUrl} alt="" className="w-full h-auto max-h-[500px] object-cover" />
                                            </div>
                                        )}
                                        {post.videoUrl && (
                                            <div className="rounded-xl overflow-hidden border border-archon-100 dark:border-archon-800 mb-3 bg-black">
                                                <video src={post.videoUrl} controls className="w-full h-auto max-h-[500px]" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
              </>
          )}
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-archon-900 rounded-2xl w-full max-w-md p-6 shadow-2xl border border-archon-200 dark:border-archon-800 transform transition-all scale-100">
                <div className="flex justify-between items-center mb-6 border-b border-archon-100 dark:border-archon-800 pb-4">
                    <h2 className="text-xl font-serif font-bold text-archon-900 dark:text-white">Edit Profile</h2>
                    <button onClick={() => setIsEditing(false)} className="text-archon-400 hover:text-archon-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>
                
                <div className="space-y-6">
                    <div className="flex flex-col items-center">
                        <div className="relative group cursor-pointer w-24 h-24">
                            <img 
                                src={editAvatar || generateDefaultAvatar('placeholder')} 
                                alt="Profile Preview" 
                                className="w-full h-full rounded-full object-cover border-4 border-archon-100 dark:border-archon-800 shadow-inner"
                            />
                            <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-all cursor-pointer text-white">
                                <Camera size={24} />
                                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                            </label>
                        </div>
                        <span className="text-xs text-archon-500 mt-2 font-medium">Change Photo</span>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-archon-500 mb-2">Display Name</label>
                        <input 
                            type="text" 
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-lg border border-archon-300 dark:border-archon-700 bg-white dark:bg-archon-800 text-archon-900 dark:text-white focus:ring-2 focus:ring-archon-900 outline-none transition-shadow"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-archon-500 mb-2">Bio</label>
                        <textarea 
                            value={editBio}
                            onChange={(e) => setEditBio(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-lg border border-archon-300 dark:border-archon-700 bg-white dark:bg-archon-800 text-archon-900 dark:text-white focus:ring-2 focus:ring-archon-900 outline-none resize-none h-28 transition-shadow"
                            maxLength={150}
                        />
                        <div className="text-right text-xs text-archon-400 mt-1">{editBio.length}/150</div>
                    </div>
                    
                    {/* Dev/Demo tool to quickly change verification for testing */}
                    <div className="pt-2 border-t border-archon-100 dark:border-archon-800">
                        <p className="text-xs text-archon-400 mb-2">Developer: Force Verification</p>
                        <div className="flex gap-2">
                             {(['none', 'blue', 'green', 'purple', 'grey'] as VerificationLevel[]).map(lvl => (
                                 <button 
                                    key={lvl} 
                                    onClick={() => requestVerification(currentUser!.id, lvl)}
                                    className="px-2 py-1 text-xs border rounded hover:bg-archon-100 dark:hover:bg-archon-800 dark:border-archon-700 dark:text-white"
                                 >
                                     {lvl}
                                 </button>
                             ))}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button variant="ghost" onClick={() => setIsEditing(false)} className="flex-1">Cancel</Button>
                        <Button variant="primary" onClick={handleSave} className="flex-1 shadow-lg shadow-archon-900/10">Save Changes</Button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
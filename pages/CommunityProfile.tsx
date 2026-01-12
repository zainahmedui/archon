import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { Hash, Lock, Users, MessageSquare, Heart, ShieldAlert, Check, X, Megaphone, Folder, Info, Settings, Plus, Layout, ArrowLeft } from 'lucide-react';
import { VerificationBadge } from '../components/VerificationBadge';
import { ChannelType } from '../types';

const formatTime = (dateStr: string) => new Date(dateStr).toLocaleDateString();

export const CommunityProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { communities, posts, users, joinCommunity, leaveCommunity, createPost, toggleLike, respondToJoinRequest, createChannel } = useData();
  const { user } = useAuth();

  const community = communities.find(c => c.id === id);
  const [activeChannelId, setActiveChannelId] = useState<string>('home');
  const [postContent, setPostContent] = useState('');
  
  // Create Channel State
  const [isCreatingChannel, setIsCreatingChannel] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelDesc, setNewChannelDesc] = useState('');
  const [newChannelType, setNewChannelType] = useState<ChannelType>('discussion');

  if (!community) return <div className="p-10 text-center">Community not found.</div>;

  const isMember = user ? community.members.includes(user.id) : false;
  const role = user ? community.memberRoles[user.id] : null;
  const isOwner = role === 'owner';
  const isAdmin = role === 'admin' || isOwner;
  const isPending = user ? community.joinRequests.includes(user.id) : false;
  const canView = community.visibility === 'public' || isMember;

  // Filter posts by active channel
  const channelPosts = posts
    .filter(p => p.communityId === community.id && (activeChannelId === 'home' ? true : p.channelId === activeChannelId))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // All posts for this community (used in Group view)
  const communityPosts = posts
    .filter(p => p.communityId === community.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handlePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !postContent.trim() || activeChannelId === 'home') return;
    
    // Permission check for announcements
    const activeChannel = community.channels?.find(c => c.id === activeChannelId);
    if (activeChannel?.type === 'announcement' && !isAdmin) {
        alert("Only admins can post in Announcements.");
        return;
    }

    createPost(user.id, postContent, undefined, 'public', community.id, activeChannelId);
    setPostContent('');
  };

  const handleCreateChannel = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newChannelName || !newChannelDesc) return;
      createChannel(community.id, newChannelName, newChannelType, newChannelDesc);
      setIsCreatingChannel(false);
      setNewChannelName('');
  };

  const ChannelIcon = ({ type }: { type: ChannelType }) => {
      switch(type) {
          case 'announcement': return <Megaphone size={16} />;
          case 'discussion': return <MessageSquare size={16} />;
          case 'resources': return <Folder size={16} />;
          case 'chat': return <Hash size={16} />;
      }
  };

  // --- RENDER: JOIN GATE ---
  if (!canView) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-white dark:bg-archon-950">
            <div className="w-20 h-20 bg-archon-100 dark:bg-archon-800 rounded-2xl flex items-center justify-center mb-6 overflow-hidden">
                {community.avatarUrl ? <img src={community.avatarUrl} className="w-full h-full object-cover"/> : <Lock size={32} />}
            </div>
            <h1 className="text-2xl font-bold dark:text-white mb-2">{community.name}</h1>
            <p className="text-archon-500 mb-8 max-w-sm">{community.description}</p>
            
            <div className="bg-archon-50 dark:bg-archon-900 p-6 rounded-xl max-w-md w-full mb-8 text-left border border-archon-200 dark:border-archon-800">
                <h3 className="font-bold text-sm uppercase text-archon-400 mb-2">Community Purpose</h3>
                <p className="text-archon-800 dark:text-archon-200 mb-4 text-sm leading-relaxed">{community.purpose || "No purpose stated."}</p>
                <h3 className="font-bold text-sm uppercase text-archon-400 mb-2">Rules</h3>
                <p className="text-archon-800 dark:text-archon-200 text-sm leading-relaxed whitespace-pre-wrap">{community.rules}</p>
            </div>

            {isPending ? (
                <Button variant="secondary" disabled>Request Pending</Button>
            ) : (
                <Button size="lg" onClick={() => user && joinCommunity(user.id, community.id)}>
                    {community.visibility === 'public' ? 'Join Server' : 'Request to Join'}
                </Button>
            )}
        </div>
      );
  }

  // --- RENDER: GROUP LAYOUT (Simple) ---
  if (community.type === 'group') {
      return (
        <div className="min-h-screen bg-white dark:bg-archon-950 pb-20">
             {/* Simple Header for Groups */}
            <div className="h-40 bg-archon-100 dark:bg-archon-900 relative">
                <div className="absolute -bottom-10 left-6 flex items-end gap-4">
                     <div className="w-24 h-24 rounded-full bg-white dark:bg-archon-800 border-4 border-white dark:border-archon-950 overflow-hidden shadow-sm">
                         {community.avatarUrl ? <img src={community.avatarUrl} className="w-full h-full object-cover" /> : <Hash size={32} className="m-auto mt-6 text-archon-300"/>}
                     </div>
                     <div className="mb-2">
                         <h1 className="text-2xl font-bold dark:text-white">{community.name}</h1>
                         <p className="text-sm text-archon-500">{community.members.length} Members • Group</p>
                     </div>
                </div>
            </div>
            {/* Simple Feed Layout */}
            <div className="max-w-2xl mx-auto px-4 mt-16 space-y-6">
                 {/* Post Input */}
                 <div className="flex gap-4 items-start">
                    <img src={user?.avatarUrl} className="w-10 h-10 rounded-full bg-archon-200" />
                    <form onSubmit={handlePost} className="flex-1">
                        <textarea 
                            value={postContent}
                            onChange={e => setPostContent(e.target.value)}
                            placeholder="Share with the group..."
                            className="w-full bg-transparent border-b border-archon-200 dark:border-archon-800 focus:border-archon-900 dark:focus:border-white outline-none p-2 min-h-[50px] resize-none dark:text-white"
                        />
                        <div className="flex justify-end mt-2">
                            <Button size="sm" disabled={!postContent.trim()}>Post</Button>
                        </div>
                    </form>
                 </div>
                 {/* Posts */}
                 {communityPosts.map(post => (
                     <div key={post.id} className="p-4 border border-archon-100 dark:border-archon-800 rounded-xl">
                         <p className="dark:text-white mb-2">{post.content}</p>
                         <p className="text-xs text-archon-400">by {users.find(u => u.id === post.authorId)?.displayName}</p>
                     </div>
                 ))}
                 {communityPosts.length === 0 && <div className="text-center text-archon-400 py-10">No posts yet.</div>}
            </div>
        </div>
      );
  }

  // --- RENDER: SERVER LAYOUT (Complex) ---
  const activeChannel = community.channels?.find(c => c.id === activeChannelId);

  return (
    <div className="flex min-h-screen bg-white dark:bg-archon-950">
        
        {/* SIDEBAR: CHANNELS */}
        <aside className="w-64 border-r border-archon-100 dark:border-archon-800 flex flex-col h-screen sticky top-0 bg-archon-50/50 dark:bg-archon-900/30">
            {/* Server Header */}
            <div className="p-4 border-b border-archon-100 dark:border-archon-800">
                <h1 className="font-bold text-lg truncate dark:text-white mb-1">{community.name}</h1>
                <div className="flex items-center gap-2 text-xs text-archon-500">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    {community.members.length} Members
                </div>
            </div>

            {/* Channel List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
                <button
                    onClick={() => setActiveChannelId('home')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeChannelId === 'home' ? 'bg-archon-200 dark:bg-archon-800 text-archon-900 dark:text-white' : 'text-archon-600 dark:text-archon-400 hover:bg-archon-100 dark:hover:bg-archon-800/50'}`}
                >
                    <Layout size={18} />
                    Server Home
                </button>

                <div className="mt-6 mb-2 px-3 text-xs font-bold text-archon-400 uppercase tracking-wider flex justify-between items-center">
                    <span>Channels</span>
                    {isAdmin && (
                        <button onClick={() => setIsCreatingChannel(true)} className="hover:text-archon-900 dark:hover:text-white">
                            <Plus size={14} />
                        </button>
                    )}
                </div>

                {community.channels?.map(channel => (
                    <button
                        key={channel.id}
                        onClick={() => setActiveChannelId(channel.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-left group ${activeChannelId === channel.id ? 'bg-archon-200 dark:bg-archon-800 text-archon-900 dark:text-white' : 'text-archon-600 dark:text-archon-400 hover:bg-archon-100 dark:hover:bg-archon-800/50'}`}
                    >
                        <span className={`opacity-70 group-hover:opacity-100 ${activeChannelId === channel.id ? 'text-archon-900 dark:text-white' : ''}`}>
                            <ChannelIcon type={channel.type} />
                        </span>
                        <div className="truncate">
                            <div className="truncate">{channel.name}</div>
                        </div>
                    </button>
                ))}
            </div>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-archon-100 dark:border-archon-800">
                <Button variant="ghost" size="sm" className="w-full justify-start text-red-500" onClick={() => leaveCommunity(user?.id || '', community.id)}>
                    <X size={16} className="mr-2" /> Leave Server
                </Button>
            </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 flex flex-col h-screen overflow-hidden">
            
            {/* Top Bar */}
            <header className="h-16 border-b border-archon-100 dark:border-archon-800 flex items-center justify-between px-6 shrink-0 bg-white dark:bg-archon-950">
                <div>
                    <h2 className="font-bold text-lg dark:text-white flex items-center gap-2">
                        {activeChannelId === 'home' ? (
                            <>Server Overview</>
                        ) : (
                            <>
                                <ChannelIcon type={activeChannel!.type} />
                                {activeChannel!.name}
                            </>
                        )}
                    </h2>
                    {activeChannelId !== 'home' && (
                        <p className="text-xs text-archon-500">{activeChannel!.description}</p>
                    )}
                </div>
                {/* Mobile: Link back to main app nav could go here */}
            </header>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto bg-white dark:bg-archon-950 p-6">
                
                {/* VIEW: SERVER HOME */}
                {activeChannelId === 'home' && (
                    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
                        {/* Purpose Banner */}
                        <div className="bg-archon-50 dark:bg-archon-900 p-8 rounded-2xl border border-archon-100 dark:border-archon-800 text-center">
                            <div className="w-20 h-20 mx-auto bg-white dark:bg-archon-800 rounded-2xl shadow-sm mb-4 overflow-hidden flex items-center justify-center">
                                {community.avatarUrl ? <img src={community.avatarUrl} className="w-full h-full object-cover"/> : <Hash size={32}/>}
                            </div>
                            <h2 className="text-2xl font-serif font-bold dark:text-white mb-2">Welcome to {community.name}</h2>
                            <p className="text-archon-600 dark:text-archon-300 text-lg max-w-lg mx-auto leading-relaxed">
                                {community.purpose}
                            </p>
                        </div>

                        {/* Rules */}
                        <div className="border border-archon-200 dark:border-archon-800 rounded-xl p-6">
                            <h3 className="font-bold text-archon-900 dark:text-white mb-4 flex items-center gap-2">
                                <ShieldAlert size={18} /> Server Rules
                            </h3>
                            <div className="prose dark:prose-invert max-w-none text-archon-600 dark:text-archon-400 whitespace-pre-wrap">
                                {community.rules}
                            </div>
                        </div>

                        {/* Admin Requests Panel */}
                        {isAdmin && community.joinRequests.length > 0 && (
                             <div className="border border-red-200 bg-red-50 dark:bg-red-900/10 p-6 rounded-xl">
                                <h3 className="font-bold text-red-700 dark:text-red-400 mb-4">Pending Requests ({community.joinRequests.length})</h3>
                                <div className="space-y-2">
                                    {community.joinRequests.map(reqId => {
                                        const reqUser = users.find(u => u.id === reqId);
                                        if (!reqUser) return null;
                                        return (
                                            <div key={reqId} className="flex items-center justify-between bg-white dark:bg-archon-950 p-3 rounded-lg border border-red-100 dark:border-red-900/30">
                                                <div className="flex items-center gap-3">
                                                    <img src={reqUser.avatarUrl} className="w-8 h-8 rounded-full" />
                                                    <span className="font-medium dark:text-white">{reqUser.displayName}</span>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button onClick={() => respondToJoinRequest(community.id, reqId, true)} className="text-green-600 p-1 hover:bg-green-50 rounded"><Check size={18}/></button>
                                                    <button onClick={() => respondToJoinRequest(community.id, reqId, false)} className="text-red-600 p-1 hover:bg-red-50 rounded"><X size={18}/></button>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                             </div>
                        )}
                    </div>
                )}

                {/* VIEW: CHANNEL CONTENT */}
                {activeChannel && (
                    <div className="max-w-3xl mx-auto">
                        {/* Channel Input Area */}
                        {activeChannel.type === 'announcement' && !isAdmin ? (
                            <div className="mb-6 p-4 bg-archon-50 dark:bg-archon-900 rounded-xl text-center text-sm text-archon-500 italic">
                                Only moderators can post in this channel.
                            </div>
                        ) : (
                            <div className="mb-8 flex gap-4 items-start">
                                <div className="w-10 h-10 rounded-full bg-archon-200 dark:bg-archon-800 overflow-hidden shrink-0">
                                    <img src={user?.avatarUrl} className="w-full h-full object-cover" />
                                </div>
                                <form onSubmit={handlePost} className="flex-1">
                                    <textarea 
                                        value={postContent}
                                        onChange={e => setPostContent(e.target.value)}
                                        placeholder={`Start a discussion in #${activeChannel.name}...`}
                                        className="w-full bg-transparent border-b border-archon-200 dark:border-archon-800 focus:border-archon-900 dark:focus:border-white outline-none p-2 min-h-[50px] resize-none dark:text-white"
                                    />
                                    <div className="flex justify-end mt-2">
                                        <Button size="sm" disabled={!postContent.trim()}>Post</Button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Channel Posts */}
                        <div className="space-y-4">
                            {channelPosts.length === 0 ? (
                                <div className="text-center py-20 opacity-50">
                                    <MessageSquare size={48} className="mx-auto mb-4 text-archon-300"/>
                                    <p className="text-archon-500">No discussions here yet.</p>
                                </div>
                            ) : (
                                channelPosts.map(post => {
                                    const author = users.find(u => u.id === post.authorId);
                                    const isLiked = post.likes.includes(user?.id || '');
                                    return (
                                        <div key={post.id} className="p-6 bg-white dark:bg-archon-900 border border-archon-100 dark:border-archon-800 rounded-xl hover:border-archon-200 dark:hover:border-archon-700 transition-colors">
                                            <div className="flex items-center gap-3 mb-3">
                                                <img src={author?.avatarUrl} className="w-8 h-8 rounded-full bg-archon-200 object-cover" />
                                                <span className="font-bold text-sm dark:text-white">{author?.displayName}</span>
                                                <span className="text-xs text-archon-400">{formatTime(post.createdAt)}</span>
                                                {/* Role Badge if applicable */}
                                                {community.memberRoles[post.authorId] === 'owner' && <span className="text-[10px] bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded">Owner</span>}
                                            </div>
                                            <h3 className="text-archon-900 dark:text-white leading-relaxed whitespace-pre-wrap">{post.content}</h3>
                                            
                                            <div className="mt-4 flex gap-4 pt-4 border-t border-archon-50 dark:border-archon-800/50">
                                                 <button 
                                                    onClick={() => user && toggleLike(post.id, user.id)}
                                                    className={`flex items-center gap-1.5 text-sm ${isLiked ? 'text-red-500' : 'text-archon-500 hover:text-archon-900 dark:hover:text-white'}`}
                                                >
                                                    <Heart size={16} fill={isLiked ? "currentColor" : "none"} /> {post.likes.length > 0 && post.likes.length}
                                                </button>
                                                <button className="flex items-center gap-1.5 text-sm text-archon-500">
                                                    <MessageSquare size={16} /> {post.comments.length > 0 && post.comments.length}
                                                </button>
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </div>
                )}
            </div>
        </main>

        {/* Create Channel Modal */}
        {isCreatingChannel && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <div className="bg-white dark:bg-archon-900 rounded-xl max-w-md w-full p-6">
                    <h3 className="font-bold text-lg mb-4 dark:text-white">Create New Channel</h3>
                    <form onSubmit={handleCreateChannel} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-archon-500 uppercase mb-1">Name</label>
                            <input 
                                value={newChannelName}
                                onChange={e => setNewChannelName(e.target.value)}
                                className="w-full border border-archon-300 dark:border-archon-700 dark:bg-archon-800 rounded-lg p-2 dark:text-white"
                                placeholder="e.g. photography-tips"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-archon-500 uppercase mb-1">Type</label>
                            <select 
                                value={newChannelType} 
                                onChange={e => setNewChannelType(e.target.value as any)}
                                className="w-full border border-archon-300 dark:border-archon-700 dark:bg-archon-800 rounded-lg p-2 dark:text-white"
                            >
                                <option value="discussion">Discussion (Threaded)</option>
                                <option value="announcement">Announcement (Read-only)</option>
                                <option value="resources">Resources</option>
                                <option value="chat">Live Chat</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-archon-500 uppercase mb-1">Description</label>
                            <input 
                                value={newChannelDesc}
                                onChange={e => setNewChannelDesc(e.target.value)}
                                className="w-full border border-archon-300 dark:border-archon-700 dark:bg-archon-800 rounded-lg p-2 dark:text-white"
                                placeholder="What is this channel for?"
                            />
                        </div>
                        <div className="flex gap-2 pt-2">
                            <Button type="button" variant="ghost" className="flex-1" onClick={() => setIsCreatingChannel(false)}>Cancel</Button>
                            <Button type="submit" className="flex-1">Create</Button>
                        </div>
                    </form>
                </div>
            </div>
        )}
    </div>
  );
};
import React, { useState, useRef, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { VerificationBadge } from '../components/VerificationBadge';
import { Mail, Send, ChevronLeft, Mic, StopCircle, Play, Pause, Users, Plus, Hash, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Message, User } from '../types';

// --- SUB-COMPONENT: VOICE PLAYER ---
const VoicePlayer: React.FC<{ url: string; duration: number }> = ({ url, duration }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    return (
        <div className="flex items-center gap-2 bg-archon-200 dark:bg-archon-800 rounded-full px-3 py-1.5 min-w-[120px]">
            <button onClick={togglePlay} className="text-archon-900 dark:text-white">
                {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
            </button>
            <div className="flex-1 h-8 flex items-center gap-0.5">
                 {/* Fake Waveform Visual */}
                 {[...Array(15)].map((_, i) => (
                     <div key={i} className={`w-1 rounded-full bg-archon-500 ${isPlaying ? 'animate-pulse' : ''}`} style={{ height: `${Math.random() * 100}%` }}></div>
                 ))}
            </div>
            <span className="text-[10px] text-archon-600 dark:text-archon-400 font-mono">{duration}s</span>
            <audio ref={audioRef} src={url} onEnded={() => setIsPlaying(false)} className="hidden" />
        </div>
    );
};

// --- SUB-COMPONENT: VOICE RECORDER ---
const VoiceRecorder: React.FC<{ onSend: (blob: Blob, duration: number) => void }> = ({ onSend }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [duration, setDuration] = useState(0);
    const mediaRecorder = useRef<MediaRecorder | null>(null);
    const chunks = useRef<Blob[]>([]);
    const timerRef = useRef<number>();

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder.current = new MediaRecorder(stream);
            chunks.current = [];
            
            mediaRecorder.current.ondataavailable = (e) => chunks.current.push(e.data);
            mediaRecorder.current.onstop = () => {
                const blob = new Blob(chunks.current, { type: 'audio/ogg; codecs=opus' });
                onSend(blob, duration);
                stream.getTracks().forEach(track => track.stop());
                setDuration(0);
            };

            mediaRecorder.current.start();
            setIsRecording(true);
            timerRef.current = window.setInterval(() => setDuration(d => d + 1), 1000);
        } catch (err) {
            console.error("Mic access denied", err);
            alert("Microphone access needed for voice messages.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorder.current && isRecording) {
            mediaRecorder.current.stop();
            setIsRecording(false);
            clearInterval(timerRef.current);
        }
    };

    return (
        <button 
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            className={`p-2 rounded-full transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-archon-100 dark:bg-archon-800 text-archon-600 dark:text-archon-400'}`}
        >
            {isRecording ? <StopCircle size={20} /> : <Mic size={20} />}
        </button>
    );
};

export const Messages: React.FC = () => {
  const { messages, conversations, users, sendMessage, sendVoiceMessage, createGroupConversation } = useData();
  const { user } = useAuth();
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  
  // Group Creation State
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  // Filter conversations involving current user
  const myConversations = conversations
    .filter(c => c.participants.includes(user?.id || ''))
    .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());

  const activeConversation = conversations.find(c => c.id === activeConversationId);
  
  // Logic to find "Partner" details for DMs, or Group details
  const getConvoMeta = (c: typeof conversations[0]) => {
      if (c.type === 'direct') {
          const otherId = c.participants.find(p => p !== user?.id);
          const u = users.find(user => user.id === otherId);
          return { name: u?.displayName || 'Unknown', avatar: u?.avatarUrl, isVerified: u?.verificationLevel };
      } else {
          return { name: c.name || 'Group Chat', avatar: c.avatarUrl, isVerified: 'none' as const, isGroup: true };
      }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !activeConversationId) return;
    sendMessage({
        senderId: user.id,
        content: newMessage,
        conversationId: activeConversationId,
        type: 'text'
    });
    setNewMessage('');
  };

  const handleVoiceSend = (blob: Blob, duration: number) => {
      if (!user || !activeConversationId) return;
      sendVoiceMessage({
          senderId: user.id,
          conversationId: activeConversationId,
      }, blob, duration);
  };

  const createGroup = () => {
      if (!user || !groupName || selectedMembers.length === 0) return;
      const id = createGroupConversation(user.id, groupName, selectedMembers);
      setIsCreatingGroup(false);
      setActiveConversationId(id);
      setGroupName('');
      setSelectedMembers([]);
  };

  if (!user) return null;

  // --- VIEW: CREATE GROUP MODAL ---
  if (isCreatingGroup) {
      return (
          <div className="p-6 min-h-screen bg-white dark:bg-archon-950 animate-fade-in">
              <div className="max-w-md mx-auto">
                  <h2 className="text-2xl font-serif font-bold mb-6 dark:text-white">New Group</h2>
                  <div className="space-y-4">
                      <input 
                        placeholder="Group Name" 
                        value={groupName} 
                        onChange={e => setGroupName(e.target.value)}
                        className="w-full p-3 rounded-xl border border-archon-200 dark:border-archon-700 bg-transparent dark:text-white outline-none focus:border-archon-900"
                      />
                      <div className="border border-archon-200 dark:border-archon-700 rounded-xl max-h-60 overflow-y-auto">
                          {users.filter(u => u.id !== user.id && user.following.includes(u.id)).map(u => (
                              <label key={u.id} className="flex items-center gap-3 p-3 hover:bg-archon-50 dark:hover:bg-archon-900 cursor-pointer">
                                  <input 
                                    type="checkbox" 
                                    checked={selectedMembers.includes(u.id)}
                                    onChange={(e) => {
                                        if (e.target.checked) setSelectedMembers([...selectedMembers, u.id]);
                                        else setSelectedMembers(selectedMembers.filter(id => id !== u.id));
                                    }}
                                    className="accent-archon-900"
                                  />
                                  <img src={u.avatarUrl} className="w-8 h-8 rounded-full" />
                                  <span className="dark:text-white">{u.displayName}</span>
                              </label>
                          ))}
                          {users.filter(u => user.following.includes(u.id)).length === 0 && (
                              <div className="p-4 text-center text-archon-500 text-sm">You need to follow people to add them.</div>
                          )}
                      </div>
                      <div className="flex gap-2">
                          <button onClick={() => setIsCreatingGroup(false)} className="flex-1 py-3 text-archon-600">Cancel</button>
                          <button 
                            onClick={createGroup}
                            disabled={!groupName || selectedMembers.length === 0}
                            className="flex-1 py-3 bg-archon-900 dark:bg-white text-white dark:text-archon-950 rounded-xl font-bold disabled:opacity-50"
                          >
                              Create Group
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      );
  }

  // --- VIEW: CONVERSATION ---
  if (activeConversationId) {
    const meta = activeConversation ? getConvoMeta(activeConversation) : { name: 'Chat', avatar: '', isVerified: 'none' };
    const chatMessages = messages
        .filter(m => m.conversationId === activeConversationId)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    return (
      <div className="flex flex-col h-screen bg-white dark:bg-archon-950 pb-20 md:pb-0">
         <header className="px-4 py-3 border-b border-archon-100 dark:border-archon-800 flex items-center gap-3 sticky top-0 bg-white/90 dark:bg-archon-950/90 backdrop-blur-sm z-10">
            <button onClick={() => setActiveConversationId(null)} className="p-1 hover:bg-archon-100 dark:hover:bg-archon-800 rounded-full">
                <ChevronLeft size={24} className="text-archon-900 dark:text-white" />
            </button>
            <div className="w-8 h-8 rounded-full bg-archon-200 overflow-hidden flex items-center justify-center">
                {meta.isGroup && !meta.avatar ? <Users size={16} className="text-archon-500"/> : <img src={meta.avatar} className="w-full h-full object-cover" />}
            </div>
            <div className="flex items-center gap-1">
                <span className="font-bold text-archon-900 dark:text-white">{meta.name}</span>
                {meta.isVerified !== 'none' && <VerificationBadge level={meta.isVerified as any} />}
            </div>
         </header>

         {/* Chat Area */}
         <div className="flex-1 overflow-y-auto p-4 space-y-4">
             {chatMessages.length === 0 && (
                 <div className="text-center py-10 opacity-50">
                     <p className="text-sm">This is the start of your conversation with {meta.name}.</p>
                 </div>
             )}
             {chatMessages.map(msg => {
                 const isMe = msg.senderId === user.id;
                 const sender = users.find(u => u.id === msg.senderId);
                 return (
                     <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-1`}>
                         {!isMe && activeConversation?.type === 'group' && (
                             <img src={sender?.avatarUrl} className="w-6 h-6 rounded-full mr-2 self-end mb-1" title={sender?.displayName} />
                         )}
                         <div className={`max-w-[75%] px-4 py-2 rounded-2xl ${
                             isMe 
                                ? 'bg-archon-900 dark:bg-white text-white dark:text-archon-950 rounded-br-none' 
                                : 'bg-archon-100 dark:bg-archon-800 text-archon-900 dark:text-white rounded-bl-none'
                         }`}>
                             {msg.type === 'voice' ? (
                                 <VoicePlayer url={msg.mediaUrl!} duration={msg.duration || 0} />
                             ) : (
                                 <p className="whitespace-pre-wrap">{msg.content}</p>
                             )}
                             <span className={`text-[10px] opacity-70 block text-right mt-1`}>
                                 {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                             </span>
                         </div>
                     </div>
                 )
             })}
         </div>

         {/* Input Area */}
         <form onSubmit={handleSend} className="p-4 border-t border-archon-100 dark:border-archon-800 flex gap-2 items-end bg-white dark:bg-archon-950">
             <input 
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder="Write a message..."
                className="flex-1 bg-archon-50 dark:bg-archon-900 border border-archon-200 dark:border-archon-700 rounded-2xl px-4 py-3 text-archon-900 dark:text-white focus:ring-2 focus:ring-archon-500 outline-none max-h-32"
             />
             <div className="flex gap-2">
                 {!newMessage && <VoiceRecorder onSend={handleVoiceSend} />}
                 {newMessage && (
                    <button type="submit" className="p-3 bg-archon-900 dark:bg-white text-white dark:text-archon-950 rounded-full">
                        <Send size={20} />
                    </button>
                 )}
             </div>
         </form>
      </div>
    );
  }

  // --- VIEW: LIST ---
  return (
    <div className="min-h-screen pb-20 bg-white dark:bg-archon-950">
      <header className="px-6 py-4 border-b border-archon-100 dark:border-archon-800 sticky top-0 bg-white/90 dark:bg-archon-950/90 backdrop-blur-sm z-10 flex justify-between items-center">
        <h1 className="text-2xl font-serif font-bold text-archon-900 dark:text-white">Messages</h1>
        <button onClick={() => setIsCreatingGroup(true)} className="p-2 hover:bg-archon-100 dark:hover:bg-archon-800 rounded-full text-archon-900 dark:text-white" title="New Group">
            <Plus size={24} />
        </button>
      </header>

      {myConversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
             <div className="w-16 h-16 bg-archon-100 dark:bg-archon-800 rounded-full flex items-center justify-center mb-6">
                <Mail className="w-8 h-8 text-archon-400" />
            </div>
            <h2 className="text-xl font-serif font-bold text-archon-900 dark:text-white mb-2">Real conversations start here.</h2>
            <p className="text-archon-500 dark:text-archon-400 max-w-sm leading-relaxed mb-8">
                Connect directly with people you follow. No automated spam filters hiding real messages.
            </p>
            <Link to="/search" className="bg-archon-900 dark:bg-white text-white dark:text-archon-950 px-6 py-3 rounded-xl font-medium">
                Find someone to message
            </Link>
        </div>
      ) : (
        <div className="divide-y divide-archon-100 dark:divide-archon-800">
            {myConversations.map(conv => {
                const meta = getConvoMeta(conv);
                // Get last message logic
                const lastMsg = messages
                    .filter(m => m.conversationId === conv.id)
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

                return (
                    <button 
                        key={conv.id} 
                        onClick={() => setActiveConversationId(conv.id)}
                        className="w-full text-left p-4 md:p-6 flex gap-4 hover:bg-archon-50 dark:hover:bg-archon-900/50 transition-colors"
                    >
                        <div className="w-12 h-12 rounded-full bg-archon-200 overflow-hidden flex items-center justify-center shrink-0">
                            {meta.isGroup && !meta.avatar ? <Users size={20} className="text-archon-500"/> : <img src={meta.avatar} className="w-full h-full object-cover" />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline mb-1">
                                <div className="flex items-center gap-1">
                                    <span className="font-bold text-archon-900 dark:text-white truncate">{meta.name}</span>
                                    {meta.isVerified !== 'none' && <VerificationBadge level={meta.isVerified as any} />}
                                </div>
                                {lastMsg && (
                                    <span className="text-xs text-archon-400 whitespace-nowrap ml-2">
                                        {new Date(lastMsg.createdAt).toLocaleDateString()}
                                    </span>
                                )}
                            </div>
                            <p className="text-archon-600 dark:text-archon-400 truncate text-sm">
                                {lastMsg ? (
                                    <>
                                        {lastMsg.senderId === user.id && "You: "}
                                        {lastMsg.type === 'voice' ? <span className="italic flex items-center gap-1"><Mic size={10}/> Voice Message</span> : lastMsg.content}
                                    </>
                                ) : (
                                    <span className="italic text-archon-400">No messages yet</span>
                                )}
                            </p>
                        </div>
                    </button>
                );
            })}
        </div>
      )}
    </div>
  );
};
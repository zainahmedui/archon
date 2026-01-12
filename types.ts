export type VerificationLevel = 'none' | 'blue' | 'green' | 'purple' | 'grey';
export type AccountStatus = 'active' | 'limited' | 'suspended' | 'banned';
export type ServerRole = 'owner' | 'admin' | 'moderator' | 'member';
export type ChannelType = 'announcement' | 'discussion' | 'chat' | 'resources';
export type MessageType = 'text' | 'voice' | 'system';

export interface UserSettings {
  privacy: {
    profileVisibility: 'public' | 'private';
    allowMessages: 'everyone' | 'followers' | 'none';
    allowServerInvites: 'everyone' | 'following' | 'none';
    showOnlineStatus: boolean;
    allowSearch: boolean;
  };
  notifications: {
    emailUpdates: boolean;
    pushLikes: boolean;
    pushComments: boolean;
    pushFollows: boolean;
    pushMentions: boolean;
    pushMessages: boolean;
    serverActivity: boolean;
  };
  content: {
    sensitiveFilter: 'strict' | 'standard' | 'off';
    language: string;
    autoplayVideos: boolean;
  };
  security: {
    twoFactorEnabled: boolean;
    loginAlerts: boolean;
  };
}

export interface User {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  avatarUrl?: string;
  
  // Auth Data
  email?: string;
  phoneNumber?: string;
  countryCode?: string;
  
  // Authenticity & Verification
  joinedAt: string;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  verificationLevel: VerificationLevel;
  trustScore: number; // Internal 0-100
  
  // Status
  accountStatus: AccountStatus;
  statusReason?: string;
  suspensionEndsAt?: string;

  // Real Metrics (Aggregated by System)
  stats: {
    followersCount: number;
    followingCount: number;
    postCount: number;
  };

  // Relationships
  followers: string[]; 
  following: string[]; 

  hasCompletedOnboarding?: boolean;
  isPrivate?: boolean; 
  
  // Preferences
  settings: UserSettings;
  trustedDevices: string[];
}

export interface Channel {
  id: string;
  name: string;
  type: ChannelType;
  description?: string;
  isLocked?: boolean;
}

export interface Community {
  id: string;
  type: 'server' | 'group';
  name: string;
  description: string;
  purpose?: string; 
  category?: string;
  rules: string;
  ownerId: string;
  visibility: 'public' | 'private';
  avatarUrl?: string;
  createdAt: string;
  
  // Structure
  channels: Channel[]; // Only for servers
  
  // Members & Roles
  members: string[];
  memberRoles: Record<string, ServerRole>; // userId -> role
  joinRequests: string[];
}

// For 1:1 and Ad-hoc Groups outside of Servers
export interface Conversation {
  id: string;
  type: 'direct' | 'group';
  name?: string; // For groups
  avatarUrl?: string; // For groups
  participants: string[];
  ownerId?: string; // For groups
  admins?: string[]; // For groups
  createdAt: string;
  lastMessageAt: string;
}

export interface Post {
  id: string;
  authorId: string;
  communityId?: string; 
  channelId?: string; 
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  visibility: 'public' | 'followers' | 'private';
  createdAt: string;
  
  stats: {
    likeCount: number;
    commentCount: number;
  };

  contentHash?: string;
  isFlagged?: boolean;
  likes: string[]; 
  comments: Comment[];
}

export interface Comment {
  id: string;
  authorId: string;
  content: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'like' | 'comment' | 'follow' | 'system' | 'community_invite' | 'community_request';
  actorId?: string;
  postId?: string;
  communityId?: string;
  message?: string;
  isRead: boolean;
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId?: string; // For DMs
  conversationId?: string; // For Group Chats
  communityId?: string; // For Server Chats
  channelId?: string; // For Server Chats
  
  type: MessageType;
  content: string; // Empty if voice, or text transcript
  mediaUrl?: string; // For Voice Messages or Images
  duration?: number; // Voice message duration in seconds
  
  createdAt: string;
  isRead: boolean;
  replyToId?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
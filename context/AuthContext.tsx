import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState, UserSettings } from '../types';
import { useData } from './DataContext';
import { generateDefaultAvatar } from '../utils/avatarUtils';

interface SignupData {
  email: string;
  fullName: string;
  username: string;
  bio?: string;
}

interface AuthContextType extends AuthState {
  login: (identifier: string, passwordStub: string) => boolean;
  signup: (data: SignupData) => void;
  logout: () => void;
  updateUser: (updatedData: Partial<User>) => void;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  completeOnboarding: () => void;
  
  // 2FA
  enable2FA: () => Promise<string>; // Returns a "secret" (mock)
  verify2FA: (code: string) => boolean;
  disable2FA: () => void;
  is2FARequired: () => boolean;
}

const DEFAULT_SETTINGS: UserSettings = {
  privacy: {
    profileVisibility: 'public',
    allowMessages: 'followers',
    allowServerInvites: 'following',
    showOnlineStatus: true,
    allowSearch: true,
  },
  notifications: {
    emailUpdates: true,
    pushLikes: false,
    pushComments: true,
    pushFollows: false,
    pushMentions: true,
    pushMessages: true,
    serverActivity: false,
  },
  content: {
    sensitiveFilter: 'standard',
    language: 'en',
    autoplayVideos: false,
  },
  security: {
    twoFactorEnabled: false,
    loginAlerts: true,
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { users, registerUser, updateUserProfile } = useData();
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Mock server-side secret state for 2FA setup
  const [temp2FASecret, setTemp2FASecret] = useState<string | null>(null);
  
  useEffect(() => {
    // Check for existing session
    const storedUserId = localStorage.getItem('archon_current_user_id');
    if (storedUserId) {
      const allUsers = JSON.parse(localStorage.getItem('archon_users') || '[]');
      const foundUser = allUsers.find((u: User) => u.id === storedUserId);
      if (foundUser) {
        if (!foundUser.settings) foundUser.settings = DEFAULT_SETTINGS;
        setState({ user: foundUser, isAuthenticated: true, isLoading: false });
      } else {
        setState({ user: null, isAuthenticated: false, isLoading: false });
      }
    } else {
      setState({ user: null, isAuthenticated: false, isLoading: false });
    }
  }, []);

  const login = (identifier: string, passwordStub: string): boolean => {
    const foundUser = users.find(u => 
        u.username.toLowerCase() === identifier.toLowerCase() || 
        u.email?.toLowerCase() === identifier.toLowerCase()
    );

    if (foundUser) {
      localStorage.setItem('archon_current_user_id', foundUser.id);
      if (!foundUser.settings) foundUser.settings = DEFAULT_SETTINGS;
      setState({ user: foundUser, isAuthenticated: true, isLoading: false });
      return true;
    }
    return false;
  };

  const signup = (data: SignupData) => {
    if (users.some(u => u.username === data.username)) throw new Error("Username already taken");
    if (users.some(u => u.email === data.email)) throw new Error("Email already registered");

    const newUser: User = {
      id: Date.now().toString(),
      username: data.username,
      displayName: data.fullName,
      email: data.email,
      bio: data.bio || '',
      joinedAt: new Date().toISOString(),
      followers: [],
      following: [],
      avatarUrl: generateDefaultAvatar(data.username),
      hasCompletedOnboarding: false,
      isPrivate: false,
      verificationLevel: 'none',
      trustScore: 50,
      accountStatus: 'active',
      stats: { followersCount: 0, followingCount: 0, postCount: 0 },
      settings: DEFAULT_SETTINGS,
      trustedDevices: ['Current Browser']
    };

    registerUser(newUser);
    localStorage.setItem('archon_current_user_id', newUser.id);
    setState({ user: newUser, isAuthenticated: true, isLoading: false });
  };

  const logout = () => {
    localStorage.removeItem('archon_current_user_id');
    setState({ user: null, isAuthenticated: false, isLoading: false });
  };

  const updateUser = (updatedData: Partial<User>) => {
    if (!state.user) return;
    updateUserProfile(state.user.id, updatedData);
    setState(prev => ({ ...prev, user: { ...prev.user!, ...updatedData } }));
  };

  const updateSettings = (newSettings: Partial<UserSettings>) => {
      if (!state.user) return;
      const mergedSettings = { ...state.user.settings, ...newSettings };
      let topLevelUpdates: Partial<User> = { settings: mergedSettings };
      if (newSettings.privacy && newSettings.privacy.profileVisibility) {
          topLevelUpdates.isPrivate = newSettings.privacy.profileVisibility === 'private';
      }
      updateUser(topLevelUpdates);
  };

  const completeOnboarding = () => updateUser({ hasCompletedOnboarding: true });

  // --- 2FA LOGIC ---
  const enable2FA = async (): Promise<string> => {
      // Simulate generating a secret
      const secret = "ARCHON-SECURE-" + Math.random().toString(36).substr(2, 6).toUpperCase();
      setTemp2FASecret(secret);
      return secret;
  };

  const verify2FA = (code: string): boolean => {
      // For demo, we accept any 6-digit code if the secret is set, OR if 2FA is already active
      // In real life, this validates against TOTP
      if (code.length === 6 && /^\d+$/.test(code)) {
          if (temp2FASecret) {
               updateSettings({ security: { ...state.user!.settings.security, twoFactorEnabled: true } });
               setTemp2FASecret(null);
          }
          return true;
      }
      return false;
  };

  const disable2FA = () => {
      updateSettings({ security: { ...state.user!.settings.security, twoFactorEnabled: false } });
  };

  const is2FARequired = () => {
      return state.user?.settings.security.twoFactorEnabled || false;
  };

  return (
    <AuthContext.Provider value={{ 
        ...state, login, signup, logout, updateUser, updateSettings, completeOnboarding,
        enable2FA, verify2FA, disable2FA, is2FARequired
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { 
    User, Lock, Bell, Shield, Smartphone, Globe, Eye, 
    LogOut, Trash2, ChevronRight, AlertTriangle, Download, 
    Moon, Sun, Laptop, Hash, ShieldCheck, QrCode
} from 'lucide-react';
import { VerificationBadge } from '../components/VerificationBadge';

type SettingsTab = 'account' | 'privacy' | 'security' | 'notifications' | 'data';

export const Settings: React.FC = () => {
  const { user, logout, updateSettings, enable2FA, verify2FA, disable2FA } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>('account');
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));
  
  // 2FA Setup State
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [qrCodeSecret, setQrCodeSecret] = useState('');
  const [otpInput, setOtpInput] = useState('');

  if (!user) return null;

  const toggleTheme = () => {
    const newVal = !isDark;
    setIsDark(newVal);
    if (newVal) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  const start2FA = async () => {
      const secret = await enable2FA();
      setQrCodeSecret(secret);
      setShow2FASetup(true);
  };

  const confirm2FA = () => {
      if (verify2FA(otpInput)) {
          setShow2FASetup(false);
          setQrCodeSecret('');
          setOtpInput('');
          alert("2FA Enabled Successfully");
      } else {
          alert("Invalid Code");
      }
  };

  const MenuLink = ({ id, icon: Icon, label, danger = false }: { id: SettingsTab; icon: any; label: string; danger?: boolean }) => (
      <button 
        onClick={() => setActiveTab(id)}
        className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${activeTab === id ? 'bg-archon-100 dark:bg-archon-800' : 'hover:bg-archon-50 dark:hover:bg-archon-900'}`}
      >
          <div className="flex items-center gap-3">
              <Icon size={20} className={danger ? 'text-red-500' : 'text-archon-600 dark:text-archon-300'} />
              <span className={`font-medium ${danger ? 'text-red-600' : 'text-archon-900 dark:text-white'}`}>{label}</span>
          </div>
          <ChevronRight size={16} className="text-archon-300" />
      </button>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-archon-950 pb-20 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-80 border-r border-archon-100 dark:border-archon-800 md:h-screen md:sticky md:top-0 bg-white dark:bg-archon-950">
          <div className="p-6 border-b border-archon-100 dark:border-archon-800">
              <h1 className="text-2xl font-serif font-bold text-archon-900 dark:text-white">Settings</h1>
          </div>
          <div className="p-4 space-y-1">
              <MenuLink id="account" icon={User} label="Account" />
              <MenuLink id="privacy" icon={Lock} label="Privacy" />
              <MenuLink id="security" icon={Shield} label="Security" />
              <MenuLink id="notifications" icon={Bell} label="Notifications" />
              <MenuLink id="data" icon={Download} label="Data & Transparency" />
          </div>
          <div className="p-4 border-t border-archon-100 dark:border-archon-800 mt-auto">
              <div className="flex items-center justify-between p-3">
                   <span className="text-sm font-medium dark:text-white flex items-center gap-2">
                       {isDark ? <Moon size={16}/> : <Sun size={16}/>} Dark Mode
                   </span>
                   <button 
                        onClick={toggleTheme}
                        className={`w-10 h-5 rounded-full p-0.5 transition-colors ${isDark ? 'bg-archon-900' : 'bg-archon-300'}`}
                    >
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${isDark ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
              </div>
              <button onClick={logout} className="w-full flex items-center gap-2 p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-colors">
                  <LogOut size={20} />
                  <span className="font-medium">Sign Out</span>
              </button>
          </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 max-w-2xl mx-auto md:mx-0 w-full animate-fade-in">
          
          {/* --- ACCOUNT TAB --- */}
          {activeTab === 'account' && (
              <div className="space-y-8">
                  <header>
                      <h2 className="text-xl font-bold dark:text-white mb-1">Account Information</h2>
                      <p className="text-archon-500 text-sm">Manage your personal details and contact info.</p>
                  </header>

                  <section className="space-y-6">
                      <div className="grid gap-4">
                          <div className="p-4 rounded-xl border border-archon-200 dark:border-archon-800">
                              <label className="text-xs font-bold text-archon-500 uppercase">Username</label>
                              <div className="flex justify-between items-center mt-1">
                                  <span className="dark:text-white">@{user.username}</span>
                                  <Button variant="ghost" size="sm">Change</Button>
                              </div>
                          </div>
                          <div className="p-4 rounded-xl border border-archon-200 dark:border-archon-800">
                              <label className="text-xs font-bold text-archon-500 uppercase">Email</label>
                              <div className="flex justify-between items-center mt-1">
                                  <span className="dark:text-white">{user.email || 'Not set'}</span>
                                  <Button variant="ghost" size="sm">Update</Button>
                              </div>
                          </div>
                      </div>
                  </section>
              </div>
          )}

          {/* --- PRIVACY TAB --- */}
          {activeTab === 'privacy' && (
              <div className="space-y-8">
                  <header>
                      <h2 className="text-xl font-bold dark:text-white mb-1">Privacy Controls</h2>
                      <p className="text-archon-500 text-sm">You control who sees your authentic self.</p>
                  </header>

                  <div className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-archon-50 dark:bg-archon-900 rounded-xl">
                          <div>
                              <div className="font-bold dark:text-white">Private Account</div>
                              <div className="text-sm text-archon-500">Only approved followers can see your posts.</div>
                          </div>
                          <button 
                            onClick={() => updateSettings({ privacy: { ...user.settings.privacy, profileVisibility: user.settings.privacy.profileVisibility === 'public' ? 'private' : 'public' } })}
                            className={`w-12 h-6 rounded-full p-1 transition-colors ${user.settings.privacy.profileVisibility === 'private' ? 'bg-green-500' : 'bg-archon-300'}`}
                        >
                            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${user.settings.privacy.profileVisibility === 'private' ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                      </div>
                  </div>
              </div>
          )}

          {/* --- SECURITY TAB --- */}
          {activeTab === 'security' && (
              <div className="space-y-8">
                  <header>
                      <h2 className="text-xl font-bold dark:text-white mb-1">Security</h2>
                      <p className="text-archon-500 text-sm">Protect your account and sessions.</p>
                  </header>

                  <div className="space-y-4">
                       <div className="p-4 border border-archon-200 dark:border-archon-800 rounded-xl">
                          <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                  <ShieldCheck className={user.settings.security.twoFactorEnabled ? "text-green-500" : "text-archon-400"} />
                                  <div>
                                      <div className="font-bold dark:text-white">Two-Factor Authentication</div>
                                      <div className="text-sm text-archon-500">Require a code from an authenticator app.</div>
                                  </div>
                              </div>
                              <button 
                                onClick={() => user.settings.security.twoFactorEnabled ? disable2FA() : start2FA()}
                                className={`w-12 h-6 rounded-full p-1 transition-colors ${user.settings.security.twoFactorEnabled ? 'bg-green-500' : 'bg-archon-300'}`}
                            >
                                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${user.settings.security.twoFactorEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                            </button>
                          </div>

                          {/* 2FA SETUP UI */}
                          {show2FASetup && (
                              <div className="bg-archon-50 dark:bg-archon-900 p-4 rounded-lg animate-fade-in border border-archon-200 dark:border-archon-700">
                                  <div className="flex flex-col items-center gap-4 text-center">
                                      <div className="w-32 h-32 bg-white p-2 rounded flex items-center justify-center">
                                          {/* Mock QR Code */}
                                          <QrCode size={100} className="text-black" />
                                      </div>
                                      <div className="text-sm">
                                          <p className="font-mono bg-archon-200 dark:bg-archon-800 p-2 rounded mb-2 select-all">{qrCodeSecret}</p>
                                          <p className="text-archon-500">Scan with Google Authenticator or enter code above.</p>
                                      </div>
                                      <div className="flex gap-2 w-full max-w-xs">
                                          <input 
                                            value={otpInput}
                                            onChange={e => setOtpInput(e.target.value)}
                                            placeholder="Enter 6-digit code"
                                            className="flex-1 p-2 rounded border border-archon-300 dark:bg-archon-800 dark:border-archon-600 dark:text-white"
                                            maxLength={6}
                                          />
                                          <Button onClick={confirm2FA}>Verify</Button>
                                      </div>
                                  </div>
                              </div>
                          )}
                      </div>

                      <div className="p-4 border border-archon-200 dark:border-archon-800 rounded-xl">
                          <h3 className="font-bold dark:text-white mb-4 flex items-center gap-2">
                              <Laptop size={18}/> Active Sessions
                          </h3>
                          <div className="space-y-3">
                              {user.trustedDevices.map((device, i) => (
                                  <div key={i} className="flex justify-between items-center text-sm">
                                      <span className="text-archon-700 dark:text-archon-300">{device}</span>
                                      <span className="text-green-500 text-xs font-medium">Active Now</span>
                                  </div>
                              ))}
                          </div>
                      </div>
                  </div>
              </div>
          )}

           {/* --- NOTIFICATIONS TAB --- */}
           {activeTab === 'notifications' && (
              <div className="space-y-8">
                  <header>
                      <h2 className="text-xl font-bold dark:text-white mb-1">Notifications</h2>
                      <p className="text-archon-500 text-sm">Calm by default. You choose what interrupts you.</p>
                  </header>
                  
                  <div className="space-y-1">
                      {[
                          { id: 'pushLikes', label: 'Likes', desc: 'When someone likes your post.' },
                          { id: 'pushMessages', label: 'Messages', desc: 'Direct messages from users.' },
                      ].map(setting => (
                          <div key={setting.id} className="flex items-center justify-between p-4 hover:bg-archon-50 dark:hover:bg-archon-900 rounded-xl transition-colors">
                              <div>
                                  <div className="font-medium dark:text-white">{setting.label}</div>
                                  <div className="text-xs text-archon-500">{setting.desc}</div>
                              </div>
                              <button 
                                onClick={() => updateSettings({ notifications: { ...user.settings.notifications, [setting.id]: !(user.settings.notifications as any)[setting.id] } })}
                                className={`w-10 h-5 rounded-full p-0.5 transition-colors ${(user.settings.notifications as any)[setting.id] ? 'bg-archon-900 dark:bg-white' : 'bg-archon-300'}`}
                            >
                                <div className={`w-4 h-4 rounded-full transition-transform transform ${ (user.settings.notifications as any)[setting.id] ? 'translate-x-5 bg-white dark:bg-archon-900' : 'translate-x-0 bg-white' }`} />
                            </button>
                          </div>
                      ))}
                  </div>
              </div>
          )}

           {/* --- DATA TAB --- */}
           {activeTab === 'data' && (
              <div className="space-y-8">
                  <header>
                      <h2 className="text-xl font-bold dark:text-white mb-1">Data & Transparency</h2>
                      <p className="text-archon-500 text-sm">See what we know. It's not much.</p>
                  </header>

                  <div className="grid gap-4 md:grid-cols-2">
                      <div className="p-6 bg-archon-50 dark:bg-archon-900 rounded-xl border border-archon-200 dark:border-archon-800">
                          <h3 className="font-bold dark:text-white text-lg mb-1">Trust Score</h3>
                          <div className="text-3xl font-serif font-bold text-green-600 dark:text-green-400">{user.trustScore}/100</div>
                          <p className="text-xs text-archon-500 mt-2">Based on authentic behavior, account age, and community interactions.</p>
                      </div>
                  </div>
              </div>
          )}

      </main>
    </div>
  );
};
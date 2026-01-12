import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { Camera, Shield, Lock, Globe, ArrowRight, Check } from 'lucide-react';

export const Onboarding: React.FC = () => {
  const { user, updateUser, completeOnboarding } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  // Step 2 State (Profile)
  const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl || '');
  const [bio, setBio] = useState(user?.bio || '');

  // Step 3 State (Privacy)
  const [isPrivate, setIsPrivate] = useState(false);

  if (!user) return null;

  const handleNext = () => setStep(p => p + 1);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const finishOnboarding = (destination: string) => {
    // Save all collected data
    updateUser({
      avatarUrl: avatarPreview,
      bio: bio,
      isPrivate: isPrivate
    });
    
    // Mark as complete
    completeOnboarding();
    
    // Navigate
    navigate(destination);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-archon-950 flex flex-col items-center justify-center p-6 transition-colors">
      <div className="w-full max-w-lg">
        
        {/* Progress Indicator */}
        <div className="flex gap-2 mb-12 justify-center">
          {[1, 2, 3, 4].map(i => (
            <div 
              key={i} 
              className={`h-1 rounded-full transition-all duration-300 ${
                i <= step ? 'w-8 bg-archon-900 dark:bg-white' : 'w-2 bg-archon-200 dark:bg-archon-800'
              }`} 
            />
          ))}
        </div>

        {/* STEP 1: The Manifesto */}
        {step === 1 && (
          <div className="text-center animate-fade-in space-y-8">
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-archon-900 dark:text-white">
              Welcome to Archon.
            </h1>
            <div className="space-y-6 text-lg text-archon-600 dark:text-archon-300 leading-relaxed max-w-md mx-auto">
              <p>We believe social media has become too noisy.</p>
              <ul className="text-left space-y-4 bg-archon-50 dark:bg-archon-900 p-6 rounded-2xl border border-archon-100 dark:border-archon-800">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                  <span><strong>Real Humans Only.</strong> No bots. No fake influencers.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                  <span><strong>Honest Numbers.</strong> We never inflate likes or followers to keep you scrolling.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                  <span><strong>Your Choice.</strong> No algorithms deciding what you see.</span>
                </li>
              </ul>
            </div>
            <div className="pt-4">
              <Button size="lg" onClick={handleNext} className="w-full md:w-auto min-w-[200px]">
                I Agree
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: Identity */}
        {step === 2 && (
          <div className="animate-fade-in space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-serif font-bold mb-2 dark:text-white">Who are you?</h2>
              <p className="text-archon-500">Authenticity starts with a real face and a real story.</p>
            </div>

            <div className="flex flex-col items-center gap-6">
              <div className="relative group cursor-pointer">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-archon-100 dark:border-archon-800">
                  <img 
                    src={avatarPreview} 
                    alt="Avatar" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
                  <Camera size={32} />
                  <span className="text-xs font-medium mt-1">Upload</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                </label>
              </div>
              
              <div className="w-full">
                <label className="block text-sm font-medium text-archon-700 dark:text-archon-300 mb-2">
                  Your Bio (Optional)
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us a little about yourself..."
                  className="w-full h-24 p-4 rounded-xl border border-archon-300 dark:border-archon-700 bg-transparent dark:text-white focus:ring-2 focus:ring-archon-900 outline-none resize-none"
                  maxLength={150}
                />
                <div className="flex justify-between text-xs text-archon-400 mt-2">
                  <span>Keep it authentic.</span>
                  <span>{bio.length}/150</span>
                </div>
              </div>
            </div>

            <Button size="lg" onClick={handleNext} className="w-full">
              Looks Good
            </Button>
          </div>
        )}

        {/* STEP 3: Privacy */}
        {step === 3 && (
          <div className="animate-fade-in space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-serif font-bold mb-2 dark:text-white">Your Privacy</h2>
              <p className="text-archon-500">Control who sees your authentic self.</p>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => setIsPrivate(false)}
                className={`w-full flex items-center gap-4 p-5 rounded-xl border-2 transition-all ${
                  !isPrivate 
                    ? 'border-archon-900 bg-archon-50 dark:bg-archon-900 dark:border-white' 
                    : 'border-archon-200 dark:border-archon-800 hover:border-archon-300'
                }`}
              >
                <div className={`p-3 rounded-full ${!isPrivate ? 'bg-archon-200 dark:bg-archon-700' : 'bg-archon-100 dark:bg-archon-800'}`}>
                  <Globe className="w-6 h-6 text-archon-900 dark:text-white" />
                </div>
                <div className="text-left flex-1">
                  <h3 className="font-bold text-archon-900 dark:text-white">Public Profile</h3>
                  <p className="text-sm text-archon-500">Anyone can see your posts and follow you. Best for connecting with new people.</p>
                </div>
                {!isPrivate && <Check className="w-6 h-6 text-archon-900 dark:text-white" />}
              </button>

              <button
                onClick={() => setIsPrivate(true)}
                className={`w-full flex items-center gap-4 p-5 rounded-xl border-2 transition-all ${
                  isPrivate 
                    ? 'border-archon-900 bg-archon-50 dark:bg-archon-900 dark:border-white' 
                    : 'border-archon-200 dark:border-archon-800 hover:border-archon-300'
                }`}
              >
                <div className={`p-3 rounded-full ${isPrivate ? 'bg-archon-200 dark:bg-archon-700' : 'bg-archon-100 dark:bg-archon-800'}`}>
                  <Lock className="w-6 h-6 text-archon-900 dark:text-white" />
                </div>
                <div className="text-left flex-1">
                  <h3 className="font-bold text-archon-900 dark:text-white">Private Profile</h3>
                  <p className="text-sm text-archon-500">Only approved followers can see your posts. Best for close circles.</p>
                </div>
                {isPrivate && <Check className="w-6 h-6 text-archon-900 dark:text-white" />}
              </button>
            </div>

            <Button size="lg" onClick={handleNext} className="w-full">
              Confirm Privacy
            </Button>
          </div>
        )}

        {/* STEP 4: First Action */}
        {step === 4 && (
          <div className="animate-fade-in text-center space-y-8">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto text-green-600 dark:text-green-400">
              <Shield size={40} />
            </div>
            
            <div>
              <h2 className="text-3xl font-serif font-bold mb-4 dark:text-white">You're ready.</h2>
              <p className="text-archon-500 dark:text-archon-300 max-w-md mx-auto">
                Your profile is set up. Archon is a blank canvas—we don't fill it for you. How would you like to start?
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button 
                onClick={() => finishOnboarding('/search')}
                className="group flex flex-col items-center justify-center p-6 rounded-2xl border border-archon-200 dark:border-archon-700 hover:border-archon-400 dark:hover:border-archon-500 hover:bg-archon-50 dark:hover:bg-archon-900 transition-all"
              >
                <span className="text-4xl mb-3">🔍</span>
                <h3 className="font-bold text-lg text-archon-900 dark:text-white mb-1">Discover</h3>
                <p className="text-sm text-archon-500">Find real people to follow</p>
              </button>

              <button 
                onClick={() => finishOnboarding('/create')}
                className="group flex flex-col items-center justify-center p-6 rounded-2xl bg-archon-900 dark:bg-white text-white dark:text-archon-950 shadow-lg hover:shadow-xl transition-all"
              >
                <span className="text-4xl mb-3">✍️</span>
                <h3 className="font-bold text-lg mb-1">Create</h3>
                <p className="text-sm opacity-80">Share your first thought</p>
              </button>
            </div>
            
            <button 
                onClick={() => finishOnboarding('/')}
                className="text-sm text-archon-400 hover:text-archon-600 dark:hover:text-archon-300 mt-4 underline decoration-dotted"
            >
                Just take me to my feed
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
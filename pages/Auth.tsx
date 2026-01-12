import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { Mail, User, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { validateEmail, validateUsername, validatePassword, getPasswordStrength } from '../utils/validationUtils';

export const Auth: React.FC = () => {
  const { login, signup } = useAuth();
  
  // State
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Form Fields
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Handlers
  const resetForm = () => {
    setError('');
    setEmail('');
    setFullName('');
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    resetForm();
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError("Please enter your credentials.");
      return;
    }

    const success = login(email, password);
    if (!success) {
      setError("Invalid credentials. Please check your username/email and password.");
    }
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 1. Validate Email
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    // 2. Validate Name
    if (fullName.length < 2 || fullName.length > 50) {
      setError("Name must be between 2 and 50 characters.");
      return;
    }

    // 3. Validate Username
    if (!validateUsername(username)) {
      setError("Username must be lowercase letters, numbers, and underscores only.");
      return;
    }

    // 4. Validate Password
    if (!validatePassword(password)) {
      setError("Password must be at least 8 characters with 1 letter and 1 number.");
      return;
    }

    // 5. Confirm Password
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      signup({ email, fullName, username });
    } catch (err: any) {
      setError(err.message || "Something went wrong during account creation.");
    }
  };

  const handleForgotPassword = () => {
    const emailInput = prompt("Enter your email address to reset password:");
    if (emailInput && validateEmail(emailInput)) {
        alert(`If an account exists for ${emailInput}, we have sent a reset link.`);
    } else if (emailInput) {
        alert("Invalid email address.");
    }
  };

  const pwdStrength = isLogin ? { score: 0, label: '', color: '' } : getPasswordStrength(password);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-archon-50 dark:bg-archon-950 px-4 py-10">
      <div className="w-full max-w-md">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif font-bold mb-2 dark:text-white">Archon</h1>
          <p className="text-archon-500">Simple. Authentic. Yours.</p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-archon-900 p-8 rounded-2xl shadow-sm border border-archon-200 dark:border-archon-800 transition-all">
           
           {/* Toggle Tabs */}
           <div className="flex gap-4 mb-8 border-b border-archon-100 dark:border-archon-800 pb-1">
            <button 
              className={`flex-1 pb-3 font-medium transition-colors ${isLogin ? 'text-archon-900 dark:text-white border-b-2 border-archon-900 dark:border-white' : 'text-archon-400'}`}
              onClick={isLogin ? undefined : toggleMode}
            >
              Log In
            </button>
            <button 
              className={`flex-1 pb-3 font-medium transition-colors ${!isLogin ? 'text-archon-900 dark:text-white border-b-2 border-archon-900 dark:border-white' : 'text-archon-400'}`}
              onClick={!isLogin ? undefined : toggleMode}
            >
              Sign Up
            </button>
          </div>

          {/* Error Banner */}
          {error && (
             <div className="mb-6 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 p-3 rounded-lg text-sm flex items-start gap-2">
                 <AlertCircle size={16} className="mt-0.5 shrink-0" />
                 <span>{error}</span>
             </div>
          )}

          {/* LOGIN FORM */}
          {isLogin && (
             <form onSubmit={handleLogin} className="space-y-4 animate-fade-in">
                 <div>
                    <label className="block text-sm font-bold text-archon-700 dark:text-archon-300 mb-1">Email or Username</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-3.5 text-archon-400" size={18} />
                        <input 
                            type="text" 
                            value={email} // Reusing 'email' state for login identifier
                            onChange={e => setEmail(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-archon-300 dark:border-archon-700 dark:bg-archon-800 focus:ring-2 focus:ring-archon-900 outline-none"
                            placeholder="you@example.com"
                            autoFocus
                        />
                    </div>
                 </div>
                 
                 <div>
                    <label className="block text-sm font-bold text-archon-700 dark:text-archon-300 mb-1">Password</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3.5 text-archon-400" size={18} />
                        <input 
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full pl-10 pr-10 py-3 rounded-xl border border-archon-300 dark:border-archon-700 dark:bg-archon-800 focus:ring-2 focus:ring-archon-900 outline-none"
                            placeholder="••••••••"
                        />
                        <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3.5 text-archon-400 hover:text-archon-600"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    <div className="text-right mt-2">
                        <button type="button" onClick={handleForgotPassword} className="text-xs text-archon-500 hover:text-archon-900 dark:hover:text-white underline">
                            Forgot password?
                        </button>
                    </div>
                 </div>

                 <Button size="lg" className="w-full mt-4">Log In</Button>
             </form>
          )}

          {/* SIGNUP FORM */}
          {!isLogin && (
             <form onSubmit={handleSignup} className="space-y-4 animate-fade-in">
                 {/* Email */}
                 <div>
                    <label className="block text-sm font-bold text-archon-700 dark:text-archon-300 mb-1">Email Address</label>
                    <input 
                        type="email" 
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-archon-300 dark:border-archon-700 dark:bg-archon-800 focus:ring-2 focus:ring-archon-900 outline-none"
                        placeholder="you@example.com"
                        required
                    />
                 </div>

                 {/* Name */}
                 <div>
                    <label className="block text-sm font-bold text-archon-700 dark:text-archon-300 mb-1">Full Name</label>
                    <input 
                        type="text" 
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-archon-300 dark:border-archon-700 dark:bg-archon-800 focus:ring-2 focus:ring-archon-900 outline-none"
                        placeholder="Jane Doe"
                        required
                    />
                 </div>

                 {/* Username */}
                 <div>
                    <label className="block text-sm font-bold text-archon-700 dark:text-archon-300 mb-1">Username</label>
                    <div className="relative">
                        <span className="absolute left-4 top-3.5 text-archon-400 font-bold">@</span>
                        <input 
                            type="text" 
                            value={username}
                            onChange={e => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
                            className="w-full pl-8 pr-4 py-3 rounded-xl border border-archon-300 dark:border-archon-700 dark:bg-archon-800 focus:ring-2 focus:ring-archon-900 outline-none"
                            placeholder="username"
                            required
                        />
                    </div>
                    <p className="text-[10px] text-archon-400 mt-1">Lowercase, numbers, and underscores only.</p>
                 </div>

                 {/* Password */}
                 <div>
                    <label className="block text-sm font-bold text-archon-700 dark:text-archon-300 mb-1">Password</label>
                    <div className="relative">
                        <input 
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-archon-300 dark:border-archon-700 dark:bg-archon-800 focus:ring-2 focus:ring-archon-900 outline-none"
                            placeholder="Create password"
                        />
                        <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3.5 text-archon-400 hover:text-archon-600"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    {/* Strength Indicator */}
                    {password && (
                        <div className="mt-1 flex items-center gap-2">
                             <div className="flex-1 h-1 bg-archon-100 dark:bg-archon-800 rounded-full overflow-hidden">
                                 <div className={`h-full transition-all duration-300 ${pwdStrength.color}`} style={{ width: `${(pwdStrength.score / 4) * 100}%` }}></div>
                             </div>
                             <span className="text-[10px] text-archon-500">{pwdStrength.label}</span>
                        </div>
                    )}
                 </div>

                 {/* Confirm Password */}
                 <div>
                    <label className="block text-sm font-bold text-archon-700 dark:text-archon-300 mb-1">Confirm Password</label>
                    <input 
                        type="password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        className={`w-full px-4 py-3 rounded-xl border focus:ring-2 outline-none ${confirmPassword && confirmPassword !== password ? 'border-red-300 focus:ring-red-200' : 'border-archon-300 dark:border-archon-700 dark:bg-archon-800 focus:ring-archon-900'}`}
                        placeholder="Repeat password"
                    />
                 </div>

                 <Button size="lg" className="w-full mt-2">Create Account</Button>
                 
                 <p className="text-xs text-center text-archon-400 pt-2">
                    By joining, you agree to our anti-bot policy. <br/>
                    Authentic interactions only.
                 </p>
             </form>
          )}

        </div>
      </div>
    </div>
  );
};
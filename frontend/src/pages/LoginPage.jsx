import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import Button from '../components/Button';
import { LogIn, UserPlus, Eye, EyeOff, ShieldCheck, Mail, Lock, User, Phone, Briefcase } from 'lucide-react';
import { MEDIA, DARK_OVERLAY, GRADIENT_FALLBACKS } from '../theme/media';

export default function LoginPage() {
  const { login, signup, isAuthenticated, loading: authLoading } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  
  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Signup Form State
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupRole, setSignupRole] = useState('Owner');
  const [signupDivision, setSignupDivision] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Already logged in — redirect to dashboard
  if (!authLoading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const validateLogin = () => {
    const errs = {};
    if (!loginEmail.trim()) errs.loginEmail = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(loginEmail)) errs.loginEmail = 'Please enter a valid email';
    if (!loginPassword) errs.loginPassword = 'Password is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateSignup = () => {
    const errs = {};
    if (!signupName.trim()) errs.signupName = 'Full Name is required';
    if (!signupEmail.trim()) errs.signupEmail = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(signupEmail)) errs.signupEmail = 'Please enter a valid email';
    if (signupPhone && !/^\d{10}$/.test(signupPhone.replace(/[\s+-]/g, ''))) {
      errs.signupPhone = 'Please enter a valid 10-digit phone number';
    }
    if (!signupPassword) errs.signupPassword = 'Password is required';
    else if (signupPassword.length < 6) errs.signupPassword = 'Password must be at least 6 characters';
    if (signupPassword !== signupConfirmPassword) {
      errs.signupConfirmPassword = 'Passwords do not match';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!validateLogin()) return;

    setLoading(true);
    try {
      await login(loginEmail, loginPassword);
      toast.success('Signed in successfully! Welcome back.');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid email or password.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (!validateSignup()) return;

    setLoading(true);
    try {
      await signup({
        name: signupName,
        email: signupEmail,
        phone: signupPhone || undefined,
        role: signupRole,
        businessDivision: signupDivision || null,
        password: signupPassword,
      });
      toast.success(`Account created! Welcome to JM Business Hub, ${signupName}.`);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create account. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{
        backgroundImage: `${DARK_OVERLAY}, url("${MEDIA.heroHome}"), ${GRADIENT_FALLBACKS.home}`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <Helmet>
        <title>{mode === 'login' ? 'Sign In' : 'Create Account'} — JM Business Hub</title>
      </Helmet>

      <div className="w-full max-w-md">
        {/* Branding Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-xl shadow-amber-600/30 mb-4 border border-amber-400/40">
            <span className="text-2xl font-black font-display text-navy-950 tracking-wider">JM</span>
          </div>
          <h1 className="text-2xl font-bold font-display text-white tracking-tight">JM Business Hub</h1>
          <p className="text-sm text-slate-400 mt-1">Unified Business Management Platform</p>
        </div>

        {/* Auth Card */}
        <div className="glass-card rounded-2xl p-6 sm:p-8 border border-slate-700/60 shadow-2xl backdrop-blur-xl">
          
          {/* Mode Switcher Tabs */}
          <div className="flex rounded-xl bg-navy-950/80 p-1 mb-6 border border-slate-800">
            <button
              type="button"
              onClick={() => { setMode('login'); setErrors({}); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setErrors({}); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-all ${
                mode === 'signup'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              Create Account
            </button>
          </div>

          {/* SIGN IN FORM */}
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    autoComplete="email"
                    value={loginEmail}
                    onChange={(e) => {
                      setLoginEmail(e.target.value);
                      setErrors((prev) => ({ ...prev, loginEmail: null }));
                    }}
                    className={`w-full pl-10 pr-4 py-2.5 text-sm bg-navy-950/90 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-all ${
                      errors.loginEmail ? 'border-red-500' : 'border-slate-700/80 focus:border-amber-500/60'
                    }`}
                    placeholder="Enter your email"
                  />
                </div>
                {errors.loginEmail && <p className="text-xs text-red-400 mt-1">{errors.loginEmail}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={loginPassword}
                    onChange={(e) => {
                      setLoginPassword(e.target.value);
                      setErrors((prev) => ({ ...prev, loginPassword: null }));
                    }}
                    className={`w-full pl-10 pr-10 py-2.5 text-sm bg-navy-950/90 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-all ${
                      errors.loginPassword ? 'border-red-500' : 'border-slate-700/80 focus:border-amber-500/60'
                    }`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                    aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.loginPassword && <p className="text-xs text-red-400 mt-1">{errors.loginPassword}</p>}
              </div>

              {/* Submit */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                icon={LogIn}
                className="w-full mt-3 font-bold"
              >
                Sign In to Dashboard
              </Button>

              <div className="text-center pt-2">
                <p className="text-xs text-slate-400">
                  Don't have an account yet?{' '}
                  <button
                    type="button"
                    onClick={() => { setMode('signup'); setErrors({}); }}
                    className="text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-2"
                  >
                    Create one now
                  </button>
                </p>
              </div>
            </form>
          ) : (
            /* CREATE ACCOUNT FORM */
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={signupName}
                    onChange={(e) => {
                      setSignupName(e.target.value);
                      setErrors((prev) => ({ ...prev, signupName: null }));
                    }}
                    className={`w-full pl-10 pr-4 py-2.5 text-sm bg-navy-950/90 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-all ${
                      errors.signupName ? 'border-red-500' : 'border-slate-700/80 focus:border-amber-500/60'
                    }`}
                    placeholder="e.g. Darshan Patil"
                  />
                </div>
                {errors.signupName && <p className="text-xs text-red-400 mt-1">{errors.signupName}</p>}
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    autoComplete="email"
                    value={signupEmail}
                    onChange={(e) => {
                      setSignupEmail(e.target.value);
                      setErrors((prev) => ({ ...prev, signupEmail: null }));
                    }}
                    className={`w-full pl-10 pr-4 py-2.5 text-sm bg-navy-950/90 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-all ${
                      errors.signupEmail ? 'border-red-500' : 'border-slate-700/80 focus:border-amber-500/60'
                    }`}
                    placeholder="name@example.com"
                  />
                </div>
                {errors.signupEmail && <p className="text-xs text-red-400 mt-1">{errors.signupEmail}</p>}
              </div>

              {/* Phone & Role Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Phone */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Phone (Optional)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="tel"
                      value={signupPhone}
                      onChange={(e) => {
                        setSignupPhone(e.target.value);
                        setErrors((prev) => ({ ...prev, signupPhone: null }));
                      }}
                      className={`w-full pl-10 pr-3 py-2.5 text-sm bg-navy-950/90 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-all ${
                        errors.signupPhone ? 'border-red-500' : 'border-slate-700/80 focus:border-amber-500/60'
                      }`}
                      placeholder="10-digit number"
                    />
                  </div>
                  {errors.signupPhone && <p className="text-xs text-red-400 mt-1">{errors.signupPhone}</p>}
                </div>

                {/* Role */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Account Role
                  </label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      value={signupRole}
                      onChange={(e) => setSignupRole(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 text-sm bg-navy-950/90 border border-slate-700/80 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60"
                    >
                      <option value="Owner">Owner (Full Admin)</option>
                      <option value="Manager">Manager</option>
                      <option value="Accountant">Accountant</option>
                      <option value="Employee">Employee</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showSignupPassword ? 'text' : 'password'}
                    value={signupPassword}
                    onChange={(e) => {
                      setSignupPassword(e.target.value);
                      setErrors((prev) => ({ ...prev, signupPassword: null }));
                    }}
                    className={`w-full pl-10 pr-10 py-2.5 text-sm bg-navy-950/90 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-all ${
                      errors.signupPassword ? 'border-red-500' : 'border-slate-700/80 focus:border-amber-500/60'
                    }`}
                    placeholder="At least 6 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignupPassword(!showSignupPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.signupPassword && <p className="text-xs text-red-400 mt-1">{errors.signupPassword}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showSignupPassword ? 'text' : 'password'}
                    value={signupConfirmPassword}
                    onChange={(e) => {
                      setSignupConfirmPassword(e.target.value);
                      setErrors((prev) => ({ ...prev, signupConfirmPassword: null }));
                    }}
                    className={`w-full pl-10 pr-4 py-2.5 text-sm bg-navy-950/90 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-all ${
                      errors.signupConfirmPassword ? 'border-red-500' : 'border-slate-700/80 focus:border-amber-500/60'
                    }`}
                    placeholder="Repeat your password"
                  />
                </div>
                {errors.signupConfirmPassword && <p className="text-xs text-red-400 mt-1">{errors.signupConfirmPassword}</p>}
              </div>

              {/* Submit */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                icon={UserPlus}
                className="w-full mt-3 font-bold"
              >
                Register & Sign In
              </Button>

              <div className="text-center pt-2">
                <p className="text-xs text-slate-400">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setErrors({}); }}
                    className="text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-2"
                  >
                    Sign In instead
                  </button>
                </p>
              </div>
            </form>
          )}

          <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-slate-800/80 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-amber-500/70" />
            <span>Encrypted Session • Secure RBAC Access</span>
          </div>

        </div>
      </div>
    </div>
  );
}

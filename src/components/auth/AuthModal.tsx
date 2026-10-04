import React, { useState } from 'react';
import {
  signInWithEmail,
  signUpWithEmail,
  requestPasswordReset,
} from '../../services/authService';
import { Mail, Lock, User, ArrowRight, CheckCircle2, AlertCircle, Sparkles, X } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
  initialMode?: 'signin' | 'signup';
  canDismiss?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signin',
  canDismiss = true,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (password.length < 6) {
          setError('Password must be at least 6 characters long.');
          setLoading(false);
          return;
        }
        await signUpWithEmail(email, password, displayName);
        if (onClose) onClose();
      } else if (mode === 'signin') {
        await signInWithEmail(email, password);
        if (onClose) onClose();
      } else if (mode === 'forgot') {
        await requestPasswordReset(email);
        setResetSent(true);
      }
    } catch (err: any) {
      console.error('Authentication error:', err);
      const code = err?.code || '';
      if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
        setError('Invalid email or password. Please verify and try again.');
      } else if (code === 'auth/email-already-in-use') {
        setError('An account with this email address already exists. Please sign in instead.');
      } else if (code === 'auth/weak-password') {
        setError('Password is too weak. Please use at least 6 characters.');
      } else if (code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else {
        setError(err?.message || 'Authentication failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-md overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 pt-6 pb-4 border-b border-neutral-100 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-neutral-900 inline-block" />
              <h2 className="text-base font-bold text-neutral-900 tracking-tight">
                MusiOrg Cloud Account
              </h2>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Multi-device synchronised timetable &amp; database
            </p>
          </div>

          {canDismiss && onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Mode Selector Tabs */}
        {mode !== 'forgot' && (
          <div className="flex border-b border-neutral-100 px-6 pt-2 bg-neutral-50/50 text-xs font-semibold">
            <button
              onClick={() => {
                setMode('signin');
                setError(null);
              }}
              className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
                mode === 'signin'
                  ? 'border-neutral-900 text-neutral-900'
                  : 'border-transparent text-neutral-400 hover:text-neutral-700'
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => {
                setMode('signup');
                setError(null);
              }}
              className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
                mode === 'signup'
                  ? 'border-neutral-900 text-neutral-900'
                  : 'border-transparent text-neutral-400 hover:text-neutral-700'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Form Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>{error}</div>
            </div>
          )}

          {resetSent ? (
            <div className="text-center py-4 space-y-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-neutral-900">Password Reset Email Sent</h3>
              <p className="text-xs text-neutral-600 max-w-xs mx-auto">
                We sent a password reset link to <strong>{email}</strong>. Please check your inbox and spam folder.
              </p>
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setResetSent(false);
                }}
                className="mt-2 text-xs font-semibold text-neutral-900 underline hover:text-neutral-700 cursor-pointer"
              >
                Back to Log In
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              {mode === 'signup' && (
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                    Your Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Eleanor Vance"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
                  <input
                    type="email"
                    required
                    placeholder="teacher@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
                  />
                </div>
              </div>

              {mode !== 'forgot' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-semibold text-neutral-700">
                      Password
                    </label>
                    {mode === 'signin' && (
                      <button
                        type="button"
                        onClick={() => {
                          setMode('forgot');
                          setError(null);
                        }}
                        className="text-[10.5px] text-neutral-500 hover:text-neutral-900 underline cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
                    />
                  </div>
                  {mode === 'signup' && (
                    <span className="block text-[10px] text-neutral-400 mt-1">
                      Minimum 6 characters. Passwords are encrypted and never stored in plain text.
                    </span>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-2 px-4 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
              >
                <span>
                  {loading
                    ? 'Processing...'
                    : mode === 'signup'
                    ? 'Create My Account'
                    : mode === 'forgot'
                    ? 'Send Password Reset Email'
                    : 'Log In to MusiOrg'}
                </span>
                {!loading && <ArrowRight className="w-3.5 h-3.5" />}
              </button>

              {mode === 'forgot' && (
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setError(null);
                  }}
                  className="w-full py-1 text-center text-xs text-neutral-500 hover:text-neutral-900 cursor-pointer"
                >
                  Cancel and return to Log In
                </button>
              )}
            </form>
          )}

          {/* Privacy & Clean Account Guarantee */}
          <div className="mt-5 pt-4 border-t border-neutral-100 text-[11px] text-neutral-500 space-y-1.5">
            <div className="flex items-center gap-1.5 font-medium text-neutral-700">
              <Sparkles className="w-3 h-3 text-indigo-600" />
              <span>Private Database Guarantee</span>
            </div>
            <p className="leading-relaxed">
              New accounts start completely clean with private cloud isolation. Data is synchronized in real time across all your mobile phones, laptops, and tablets.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

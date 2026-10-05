import React, { useState, useEffect } from 'react';
import {
  signInWithEmail,
  signUpWithEmail,
  requestPasswordReset,
} from '../../services/authService';
import {
  getLockoutStatus,
  recordFailedAttempt,
  resetFailedAttempts,
  formatRemainingTime,
  LockoutStatus,
} from '../../utils/authProtection';
import { Mail, Lock, User, ArrowRight, CheckCircle2, AlertCircle, Sparkles, X, ShieldAlert, Clock } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
  initialMode?: 'signin' | 'signup';
  canDismiss?: boolean;
  onAuthSuccess?: (email: string, isNewUser?: boolean, mailingConsent?: boolean) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signin',
  canDismiss = true,
  onAuthSuccess,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [mailingConsent, setMailingConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);
  const [lockout, setLockout] = useState<LockoutStatus>(getLockoutStatus());

  // Check and countdown lockout status
  useEffect(() => {
    setLockout(getLockoutStatus());
    const interval = setInterval(() => {
      const current = getLockoutStatus();
      setLockout(current);
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Prevent submission if currently locked out
    const currentLockout = getLockoutStatus();
    if (currentLockout.isLocked) {
      setError(
        `Login attempts temporarily locked. Please try again in ${formatRemainingTime(currentLockout.remainingSeconds)}.`
      );
      return;
    }

    setLoading(true);

    try {
      if (mode === 'signup') {
        if (password.length < 6) {
          setError('Password must be at least 6 characters long.');
          setLoading(false);
          return;
        }
        await signUpWithEmail(email, password, displayName);
        resetFailedAttempts();
        setLockout(getLockoutStatus());
        if (onAuthSuccess) {
          onAuthSuccess(email, true, mailingConsent);
        }
        if (onClose) onClose();
      } else if (mode === 'signin') {
        await signInWithEmail(email, password);
        resetFailedAttempts();
        setLockout(getLockoutStatus());
        if (onAuthSuccess) {
          onAuthSuccess(email, false);
        }
        if (onClose) onClose();
      } else if (mode === 'forgot') {
        await requestPasswordReset(email);
        setResetSent(true);
      }
    } catch (err: any) {
      console.error('Authentication error:', err);
      const code = err?.code || '';

      if (mode === 'signin') {
        // Record failed attempt for brute-force protection
        const updatedLockout = recordFailedAttempt();
        setLockout(updatedLockout);

        if (updatedLockout.isLocked) {
          setError(
            `Too many failed login attempts. For security, login is locked for 5 minutes (unlocks at ${updatedLockout.lockoutExpiryTime || '5m'}).`
          );
        } else if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
          // Do not expose whether the email exists
          const attemptsLeft = updatedLockout.remainingAttempts;
          setError(
            `Invalid email or password. Please verify and try again. (${attemptsLeft} attempt${attemptsLeft === 1 ? '' : 's'} remaining before temporary lock)`
          );
        } else if (code === 'auth/too-many-requests') {
          setError('Access temporarily disabled by Firebase security due to multiple failed attempts. Please try again later or reset password.');
        } else {
          setError('Invalid credentials. Please verify your email and password and try again.');
        }
      } else {
        if (code === 'auth/email-already-in-use') {
          setError('An account with this email address already exists. Please log in instead.');
        } else if (code === 'auth/weak-password') {
          setError('Password is too weak. Please use at least 6 characters.');
        } else if (code === 'auth/invalid-email') {
          setError('Please enter a valid email address.');
        } else {
          setError(err?.message || 'Authentication failed. Please try again.');
        }
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
                MusiOrg Timetable
              </h2>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Peripatetic music teacher scheduling &amp; cloud sync
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

        {/* Lockout Warning Banner if Locked */}
        {lockout.isLocked && (
          <div className="bg-rose-50 border-b border-rose-200 px-6 py-3 text-xs text-rose-900 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-rose-950">Login Temporarily Locked</div>
              <div className="text-rose-700 mt-0.5 flex items-center gap-1">
                <Clock className="w-3 h-3 text-rose-500" />
                <span>You can try again in <strong className="tabular-nums font-mono">{formatRemainingTime(lockout.remainingSeconds)}</strong></span>
              </div>
            </div>
          </div>
        )}

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
            <div className="text-center py-6 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-neutral-900">Password Reset Email Sent</h3>
              <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                Check your inbox for a link to reset your password. If it doesn't appear within a few minutes, check your spam folder.
              </p>
              <button
                type="button"
                onClick={() => {
                  setResetSent(false);
                  setMode('signin');
                }}
                className="mt-4 inline-flex items-center text-xs font-medium text-neutral-900 hover:underline cursor-pointer"
              >
                Back to Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Your Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder="Jane Smith"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full text-xs pl-9 pr-3 py-2 border border-neutral-300 rounded-lg bg-white text-neutral-900 focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    placeholder="teacher@school.org"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-2 border border-neutral-300 rounded-lg bg-white text-neutral-900 focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
                  />
                </div>
              </div>

              {mode !== 'forgot' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium text-neutral-700">
                      Password
                    </label>
                    {mode === 'signin' && (
                      <button
                        type="button"
                        onClick={() => {
                          setMode('forgot');
                          setError(null);
                        }}
                        className="text-[11px] text-neutral-500 hover:text-neutral-900 cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={lockout.isLocked}
                      className="w-full text-xs pl-9 pr-3 py-2 border border-neutral-300 rounded-lg bg-white text-neutral-900 focus:outline-hidden focus:ring-1 focus:ring-neutral-900 disabled:bg-neutral-100 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              )}

              {/* Mailing List Opt-In (Sign Up Mode) */}
              {mode === 'signup' && (
                <div className="pt-1">
                  <label className="flex items-start gap-2.5 text-xs text-neutral-600 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={mailingConsent}
                      onChange={(e) => setMailingConsent(e.target.checked)}
                      className="mt-0.5 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                    />
                    <span>
                      I would like to receive peripatetic teaching updates, timetable tips, and product announcements (optional).
                    </span>
                  </label>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || (mode === 'signin' && lockout.isLocked)}
                className="w-full py-2.5 px-4 bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-300 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span>Processing...</span>
                ) : mode === 'signin' ? (
                  lockout.isLocked ? (
                    <span>Locked ({formatRemainingTime(lockout.remainingSeconds)})</span>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )
                ) : mode === 'signup' ? (
                  <>
                    <span>Create MusiOrg Account</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                ) : (
                  <span>Send Reset Email</span>
                )}
              </button>

              {mode === 'forgot' && (
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setError(null);
                  }}
                  className="w-full text-center text-xs text-neutral-500 hover:text-neutral-900 cursor-pointer pt-2"
                >
                  Cancel and return to sign in
                </button>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

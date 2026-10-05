import React, { useState } from 'react';
import { UserAccount } from '../../types';
import { requestPasswordReset } from '../../services/authService';
import { updateMailingListConsent } from '../../services/dbService';
import {
  User as UserIcon,
  Mail,
  Shield,
  Calendar,
  LogOut,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowLeft,
  Crown,
} from 'lucide-react';

interface AccountPageProps {
  userAccount: UserAccount;
  onLogOut: () => void;
  onBackToApp?: () => void;
  onUpdateAccount?: (updated: UserAccount) => void;
}

export const AccountPage: React.FC<AccountPageProps> = ({
  userAccount,
  onLogOut,
  onBackToApp,
  onUpdateAccount,
}) => {
  const [mailingConsent, setMailingConsent] = useState<boolean>(userAccount.mailingListConsent);
  const [savingConsent, setSavingConsent] = useState<boolean>(false);
  const [consentSuccess, setConsentSuccess] = useState<boolean>(false);

  const [resetSending, setResetSending] = useState<boolean>(false);
  const [resetSuccess, setResetSuccess] = useState<boolean>(false);
  const [resetError, setResetError] = useState<string | null>(null);

  // Format date helper
  const formatDate = (isoString?: string | null) => {
    if (!isoString) return 'Not available';
    try {
      return new Date(isoString).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  const handleToggleMailing = async (checked: boolean) => {
    setMailingConsent(checked);
    setSavingConsent(true);
    setConsentSuccess(false);
    try {
      await updateMailingListConsent(userAccount.uid, checked);
      setConsentSuccess(true);
      if (onUpdateAccount) {
        onUpdateAccount({
          ...userAccount,
          mailingListConsent: checked,
          mailingListConsentDate: checked ? new Date().toISOString() : null,
        });
      }
      setTimeout(() => setConsentSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update mailing consent:', err);
    } finally {
      setSavingConsent(false);
    }
  };

  const handleSendPasswordReset = async () => {
    setResetSending(true);
    setResetError(null);
    setResetSuccess(false);
    try {
      await requestPasswordReset(userAccount.email);
      setResetSuccess(true);
    } catch (err: any) {
      console.error('Failed to send password reset:', err);
      setResetError(err?.message || 'Failed to send password reset email.');
    } finally {
      setResetSending(false);
    }
  };

  const isSubscribed = userAccount.subscriptionStatus === 'active' || userAccount.role === 'admin';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-150">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {onBackToApp && (
              <button
                onClick={onBackToApp}
                className="text-xs text-neutral-500 hover:text-neutral-900 flex items-center gap-1 cursor-pointer mr-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            )}
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
              Account &amp; Settings
            </h1>
          </div>
          <p className="text-xs text-neutral-500">
            Manage your personal profile, access entitlement, and security settings
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onLogOut}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {/* Grid of Settings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Account Information */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-neutral-100">
            <div className="p-2 rounded-lg bg-neutral-100 text-neutral-800">
              <UserIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-neutral-900">Account Profile</h2>
              <p className="text-[11px] text-neutral-500">Identity and contact details</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-neutral-500 block text-[11px] mb-0.5">Display Name</span>
              <span className="font-medium text-neutral-900 text-sm">
                {userAccount.displayName || 'Music Teacher'}
              </span>
            </div>

            <div>
              <span className="text-neutral-500 block text-[11px] mb-0.5">Email Address</span>
              <span className="font-mono text-neutral-900 text-xs">
                {userAccount.email}
              </span>
            </div>

            <div>
              <span className="text-neutral-500 block text-[11px] mb-0.5">Account Role</span>
              <div className="flex items-center gap-2 mt-0.5">
                {userAccount.role === 'admin' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-800 border border-purple-200">
                    <Crown className="w-3 h-3 text-purple-600" />
                    <span>Administrator</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800 border border-neutral-200">
                    <span>Peripatetic Teacher</span>
                  </span>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-neutral-100 text-[11px] text-neutral-500 flex items-center justify-between">
              <span>Member since:</span>
              <span className="font-medium text-neutral-700">{formatDate(userAccount.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* 2. Subscription & Access Status */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-neutral-100">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-100">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-neutral-900">Subscription &amp; Entitlement</h2>
              <p className="text-[11px] text-neutral-500">Current tier and access status</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-neutral-500 block text-[11px] mb-0.5">Access Status</span>
              <div className="flex items-center gap-2 mt-0.5">
                {isSubscribed ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block" />
                    <span>Active Subscription</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600 inline-block" />
                    <span>Inactive / Subscription Required</span>
                  </span>
                )}
              </div>
            </div>

            <div>
              <span className="text-neutral-500 block text-[11px] mb-0.5">Plan Type</span>
              <span className="font-medium text-neutral-900 capitalize">
                {userAccount.role === 'admin'
                  ? 'Administrator Full Access'
                  : userAccount.subscriptionPlan === 'none'
                  ? 'No Active Plan'
                  : `${userAccount.subscriptionPlan} Tier`}
              </span>
            </div>

            {userAccount.subscriptionStartDate && (
              <div>
                <span className="text-neutral-500 block text-[11px] mb-0.5">Current Period Start</span>
                <span className="text-neutral-800 font-medium">
                  {formatDate(userAccount.subscriptionStartDate)}
                </span>
              </div>
            )}

            <div className="pt-2 border-t border-neutral-100">
              <p className="text-[11px] text-neutral-500">
                {isSubscribed
                  ? 'Your timetable and schedule features are fully unlocked.'
                  : 'Subscribe to activate timetables, student matrices, and multi-school optimization.'}
              </p>
            </div>
          </div>
        </div>

        {/* 3. Mailing Preferences */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-neutral-100">
            <div className="p-2 rounded-lg bg-neutral-100 text-neutral-800">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-neutral-900">Mailing &amp; Communications</h2>
              <p className="text-[11px] text-neutral-500">Updates, teaching tips, and announcements</p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <label className="flex items-start gap-3 p-3 rounded-xl border border-neutral-200 hover:bg-neutral-50/50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={mailingConsent}
                disabled={savingConsent}
                onChange={(e) => handleToggleMailing(e.target.checked)}
                className="mt-0.5 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
              />
              <div className="flex-1">
                <span className="font-medium text-neutral-900 block">
                  Peripatetic Teaching Newsletter &amp; Product Updates
                </span>
                <span className="text-[11px] text-neutral-500 block mt-0.5 leading-relaxed">
                  Receive curated scheduling tips, timetable best practices, and new MusiOrg features. We never share your email with third parties.
                </span>
              </div>
            </label>

            {consentSuccess && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mailing preference saved successfully.</span>
              </div>
            )}

            {userAccount.mailingListConsentDate && (
              <div className="text-[11px] text-neutral-400">
                Consent recorded on {formatDate(userAccount.mailingListConsentDate)}
              </div>
            )}
          </div>
        </div>

        {/* 4. Security & Authentication */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-neutral-100">
            <div className="p-2 rounded-lg bg-neutral-100 text-neutral-800">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-neutral-900">Security</h2>
              <p className="text-[11px] text-neutral-500">Authentication &amp; credentials</p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <h3 className="font-medium text-neutral-900 mb-1">Password</h3>
              <p className="text-[11px] text-neutral-500 mb-3 leading-relaxed">
                Send a secure password reset link to your registered email address ({userAccount.email}) via Firebase Authentication.
              </p>

              {resetSuccess && (
                <div className="mb-3 flex items-start gap-2 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    A password reset link has been dispatched to <strong>{userAccount.email}</strong>. Check your inbox and spam folder.
                  </div>
                </div>
              )}

              {resetError && (
                <div className="mb-3 flex items-start gap-2 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>{resetError}</div>
                </div>
              )}

              <button
                type="button"
                onClick={handleSendPasswordReset}
                disabled={resetSending}
                className="px-3.5 py-2 bg-neutral-100 hover:bg-neutral-200/80 text-neutral-800 rounded-lg text-xs font-semibold border border-neutral-200 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>{resetSending ? 'Sending reset link...' : 'Send Password Reset Email'}</span>
              </button>
            </div>

            <div className="pt-3 border-t border-neutral-100">
              <span className="text-[11px] text-neutral-500 block mb-2">End Session</span>
              <button
                onClick={onLogOut}
                className="px-3.5 py-1.5 text-xs text-rose-600 hover:text-rose-700 font-medium hover:underline cursor-pointer flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log out of MusiOrg Timetable on this browser</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { UserAccount } from '../../types';
import { Shield, Sparkles, Check, ArrowRight, Lock, LogOut, User, Mail, School, Calendar, Clock } from 'lucide-react';

interface PaywallViewProps {
  userAccount: UserAccount | null;
  onOpenAccount: () => void;
  onLogOut: () => void;
  onRefreshStatus?: () => void;
}

export const PaywallView: React.FC<PaywallViewProps> = ({
  userAccount,
  onOpenAccount,
  onLogOut,
  onRefreshStatus,
}) => {
  const [requestSent, setRequestSent] = useState(false);
  const [requestNotes, setRequestNotes] = useState('');
  const [showRequestForm, setShowRequestForm] = useState(false);

  const handleSendRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setRequestSent(true);
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col justify-between selection:bg-neutral-200">
      {/* Top Navbar */}
      <header className="border-b border-neutral-200 bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-neutral-900 inline-block" />
            <span className="font-bold text-base tracking-tight text-neutral-900">MusiOrg Timetable</span>
            <span className="ml-2 px-2 py-0.5 rounded text-[11px] font-medium bg-neutral-100 text-neutral-600 border border-neutral-200">
              Access Protected
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenAccount}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:text-neutral-950 bg-neutral-100 hover:bg-neutral-200/70 rounded-lg transition-colors cursor-pointer"
            >
              <User className="w-3.5 h-3.5" />
              <span>{userAccount?.email || 'My Account'}</span>
            </button>
            <button
              onClick={onLogOut}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Paywall Container */}
      <main className="max-w-4xl mx-auto px-4 py-12 sm:py-16 flex-1 flex flex-col items-center justify-center">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium mb-4">
            <Lock className="w-3.5 h-3.5 text-amber-600" />
            <span>Subscription Required</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 leading-tight">
            Peripatetic Music Teacher Access
          </h1>

          <p className="mt-3 text-sm text-neutral-600 leading-relaxed">
            Welcome to MusiOrg Timetable, <strong>{userAccount?.displayName || userAccount?.email}</strong>.
            Your account is currently in <em>{userAccount?.subscriptionStatus || 'inactive'}</em> status.
            An active subscription or access grant is required to schedule and optimize lessons across schools.
          </p>
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl mb-10">
          {/* Monthly Plan Card */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-7 shadow-xs hover:border-neutral-300 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-neutral-900">Peripatetic Monthly</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 font-medium">
                  Flexible
                </span>
              </div>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-bold tracking-tight text-neutral-900">£9</span>
                <span className="text-xs text-neutral-500">/ month</span>
              </div>
              <p className="text-xs text-neutral-500 mt-2">
                Ideal for peripatetic teachers looking for monthly flexibility without commitment.
              </p>

              <div className="mt-6 space-y-2.5 text-xs text-neutral-600">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Unlimited schools &amp; teaching days</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Independent Week A/B &amp; 1/2 cycle sync</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Day-specific school availability hours</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Conflict detection &amp; smart optimizer</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Instant real-time multi-device cloud sync</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowRequestForm(true)}
              className="mt-8 w-full py-2.5 px-4 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <span>Request Monthly Access</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Annual Plan Card */}
          <div className="bg-white border-2 border-neutral-900 rounded-2xl p-6 sm:p-7 shadow-md relative flex flex-col justify-between">
            <div className="absolute -top-3 right-6 bg-neutral-900 text-white text-[10px] font-bold tracking-wide uppercase px-2.5 py-0.5 rounded-full">
              Best Value · Save 18%
            </div>

            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-neutral-900">Peripatetic Annual</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium">
                  Annual Pass
                </span>
              </div>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-bold tracking-tight text-neutral-900">£89</span>
                <span className="text-xs text-neutral-500">/ academic year</span>
              </div>
              <p className="text-xs text-neutral-500 mt-2">
                Full school-year timetable management with priority features and ongoing updates.
              </p>

              <div className="mt-6 space-y-2.5 text-xs text-neutral-600">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Everything in Monthly plan</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>2 months free compared to monthly</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Print &amp; PDF lesson schedule exports</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Student availability constraint matrix</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Direct teacher support</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowRequestForm(true)}
              className="mt-8 w-full py-2.5 px-4 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <span>Request Annual Access</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Teacher Access Request Box / Confirmation */}
        {requestSent ? (
          <div className="w-full max-w-xl bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center text-xs text-emerald-900 space-y-2">
            <div className="font-semibold text-sm">Access Request Received</div>
            <p className="text-emerald-700">
              Your request for account <strong>{userAccount?.email}</strong> has been logged. The administrator will activate your access. Once activated, refreshing this page will open your timetable.
            </p>
            {onRefreshStatus && (
              <button
                onClick={onRefreshStatus}
                className="mt-2 px-3 py-1.5 rounded-lg bg-emerald-700 text-white font-medium hover:bg-emerald-800 transition-colors cursor-pointer"
              >
                Check Access Status
              </button>
            )}
          </div>
        ) : showRequestForm ? (
          <div className="w-full max-w-xl bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
            <h4 className="text-sm font-semibold text-neutral-900 mb-1">Request Teacher Access</h4>
            <p className="text-xs text-neutral-500 mb-4">
              Enter details about your teaching schedule or school organisation to request access.
            </p>
            <form onSubmit={handleSendRequest} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Schools / Instruments Taught
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Piano and violin across St Mary's and Oakwood High School..."
                  value={requestNotes}
                  onChange={(e) => setRequestNotes(e.target.value)}
                  className="w-full text-xs p-2.5 border border-neutral-300 rounded-lg bg-white text-neutral-900 focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowRequestForm(false)}
                  className="px-3 py-1.5 text-xs text-neutral-600 hover:text-neutral-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-neutral-900 text-white rounded-lg text-xs font-semibold hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="text-center text-xs text-neutral-500">
            <span>Are you the administrator? </span>
            <button
              onClick={onOpenAccount}
              className="text-neutral-900 font-medium hover:underline cursor-pointer"
            >
              Sign into administrator account
            </button>
            <span> or view </span>
            <button
              onClick={onOpenAccount}
              className="text-neutral-900 font-medium hover:underline cursor-pointer"
            >
              Account Details
            </button>
            .
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 py-6 text-center text-xs text-neutral-400">
        MusiOrg Timetable · Calm scheduling for peripatetic music teachers
      </footer>
    </div>
  );
};

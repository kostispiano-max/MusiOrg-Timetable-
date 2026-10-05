import React, { useState, useEffect } from 'react';
import { UserAccount, SubscriptionStatus, SubscriptionPlan } from '../../types';
import { adminGetAllUsers, adminUpdateUserSubscription } from '../../services/dbService';
import {
  Users,
  ShieldCheck,
  Mail,
  Download,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  AlertCircle,
  Crown,
  RefreshCw,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';

interface AdminDashboardProps {
  currentAdminEmail: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentAdminEmail }) => {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'subscribers' | 'mailing' | 'stats'>('subscribers');

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Updating user state
  const [updatingUid, setUpdatingUid] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const all = await adminGetAllUsers();
      // Sort newest first
      all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setUsers(all);
    } catch (err: any) {
      console.error('Failed to load admin user data:', err);
      setError(
        err?.code === 'permission-denied'
          ? 'Access denied by Firestore Security Rules. Only authenticated administrators may access user documents.'
          : err?.message || 'Failed to fetch user accounts.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleSubscription = async (u: UserAccount) => {
    setUpdatingUid(u.uid);
    try {
      const nextStatus: SubscriptionStatus = u.subscriptionStatus === 'active' ? 'inactive' : 'active';
      const nextPlan: SubscriptionPlan = nextStatus === 'active' ? (u.subscriptionPlan === 'none' ? 'annual' : u.subscriptionPlan) : 'none';
      await adminUpdateUserSubscription(u.uid, nextStatus, nextPlan);

      setUsers((prev) =>
        prev.map((item) =>
          item.uid === u.uid
            ? { ...item, subscriptionStatus: nextStatus, subscriptionPlan: nextPlan }
            : item
        )
      );
    } catch (err: any) {
      alert(`Failed to update subscription: ${err.message}`);
    } finally {
      setUpdatingUid(null);
    }
  };

  const handleExportMailingCsv = () => {
    const optedIn = users.filter((u) => u.mailingListConsent);
    if (optedIn.length === 0) {
      alert('No users currently opted into the mailing list.');
      return;
    }

    const headers = ['Email', 'Display Name', 'Consent Status', 'Consent Date', 'Registered Date'];
    const rows = optedIn.map((u) => [
      `"${u.email.replace(/"/g, '""')}"`,
      `"${(u.displayName || '').replace(/"/g, '""')}"`,
      '"Opted In"',
      `"${u.mailingListConsentDate || u.createdAt}"`,
      `"${u.createdAt}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `musiorg_mailing_list_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Stats calculation
  const totalUsers = users.length;
  const activeSubscribers = users.filter((u) => u.subscriptionStatus === 'active' || u.role === 'admin').length;
  const inactiveUsers = totalUsers - activeSubscribers;
  const mailingCount = users.filter((u) => u.mailingListConsent).length;

  const nowMs = Date.now();
  const sevenDaysAgoMs = nowMs - 7 * 24 * 60 * 60 * 1000;
  const thirtyDaysAgoMs = nowMs - 30 * 24 * 60 * 60 * 1000;

  const newLast7Days = users.filter((u) => new Date(u.createdAt).getTime() >= sevenDaysAgoMs).length;
  const newLast30Days = users.filter((u) => new Date(u.createdAt).getTime() >= thirtyDaysAgoMs).length;

  // Filtered users for table
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.displayName && u.displayName.toLowerCase().includes(searchTerm.toLowerCase()));

    const isSub = u.subscriptionStatus === 'active' || u.role === 'admin';
    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'active'
        ? isSub
        : !isSub;

    return matchesSearch && matchesStatus;
  });

  const mailingUsers = users.filter((u) => u.mailingListConsent);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-150">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-purple-100 text-purple-800">
              <Crown className="w-4 h-4" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
              Owner Administration
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-800 border border-purple-200">
              Admin Only
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Logged in as <strong>{currentAdminEmail}</strong>. Protected by Firestore security rules.
          </p>
        </div>

        <button
          onClick={fetchUsers}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-700 bg-white hover:bg-neutral-50 border border-neutral-200 rounded-lg shadow-2xs transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {error ? (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-sm">Security Verification</div>
            <div className="mt-1">{error}</div>
          </div>
        </div>
      ) : (
        <>
          {/* High-Level Statistics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-2xs">
              <span className="text-[11px] font-medium text-neutral-500 block">Total Users</span>
              <div className="text-2xl font-bold text-neutral-900 mt-1 tabular-nums">
                {totalUsers}
              </div>
              <span className="text-[10px] text-neutral-400 block mt-0.5">Registered accounts</span>
            </div>

            <div className="bg-white border border-emerald-200 bg-emerald-50/20 rounded-xl p-4 shadow-2xs">
              <span className="text-[11px] font-medium text-emerald-800 block">Active Subscribers</span>
              <div className="text-2xl font-bold text-emerald-700 mt-1 tabular-nums">
                {activeSubscribers}
              </div>
              <span className="text-[10px] text-emerald-600 block mt-0.5">Full app access</span>
            </div>

            <div className="bg-white border border-amber-200 bg-amber-50/20 rounded-xl p-4 shadow-2xs">
              <span className="text-[11px] font-medium text-amber-800 block">Inactive Users</span>
              <div className="text-2xl font-bold text-amber-700 mt-1 tabular-nums">
                {inactiveUsers}
              </div>
              <span className="text-[10px] text-amber-600 block mt-0.5">Paywall restricted</span>
            </div>

            <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-2xs">
              <span className="text-[11px] font-medium text-neutral-500 block">New (Last 7 Days)</span>
              <div className="text-2xl font-bold text-neutral-900 mt-1 tabular-nums">
                {newLast7Days}
              </div>
              <span className="text-[10px] text-neutral-400 block mt-0.5">Recent signups</span>
            </div>

            <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-2xs">
              <span className="text-[11px] font-medium text-neutral-500 block">New (Last 30 Days)</span>
              <div className="text-2xl font-bold text-neutral-900 mt-1 tabular-nums">
                {newLast30Days}
              </div>
              <span className="text-[10px] text-neutral-400 block mt-0.5">Monthly registrations</span>
            </div>

            <div className="bg-white border border-indigo-200 bg-indigo-50/20 rounded-xl p-4 shadow-2xs">
              <span className="text-[11px] font-medium text-indigo-800 block">Mailing List</span>
              <div className="text-2xl font-bold text-indigo-700 mt-1 tabular-nums">
                {mailingCount}
              </div>
              <span className="text-[10px] text-indigo-600 block mt-0.5">Opted-in teachers</span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-neutral-200 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('subscribers')}
              className={`pb-3 px-4 border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
                activeTab === 'subscribers'
                  ? 'border-neutral-900 text-neutral-900'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Subscribers &amp; Access</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-neutral-100 text-neutral-700 font-mono">
                {users.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('mailing')}
              className={`pb-3 px-4 border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
                activeTab === 'mailing'
                  ? 'border-neutral-900 text-neutral-900'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Mailing List</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-100 text-indigo-800 font-mono">
                {mailingCount}
              </span>
            </button>
          </div>

          {/* Tab 1: Subscribers & Access Control */}
          {activeTab === 'subscribers' && (
            <div className="space-y-4">
              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 border border-neutral-200 rounded-xl">
                <div className="relative w-full sm:w-72">
                  <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search by email or name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full text-xs pl-8 pr-3 py-1.5 border border-neutral-200 rounded-lg bg-neutral-50/50 text-neutral-900 focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-xs text-neutral-500">Filter:</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="text-xs border border-neutral-200 rounded-lg px-2.5 py-1.5 bg-white text-neutral-800 font-medium"
                  >
                    <option value="all">All Users ({users.length})</option>
                    <option value="active">Active ({activeSubscribers})</option>
                    <option value="inactive">Inactive ({inactiveUsers})</option>
                  </select>
                </div>
              </div>

              {/* Users Table */}
              <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs divide-y divide-neutral-200">
                    <thead className="bg-neutral-50 text-[11px] font-semibold text-neutral-600 uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3">Teacher / Account</th>
                        <th className="px-4 py-3">Role</th>
                        <th className="px-4 py-3">Plan</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Registered</th>
                        <th className="px-4 py-3 text-right">Access Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 font-medium">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-neutral-500">
                            No registered users match your criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((u) => {
                          const isSub = u.subscriptionStatus === 'active' || u.role === 'admin';
                          const isSelf = u.email === currentAdminEmail;

                          return (
                            <tr key={u.uid} className="hover:bg-neutral-50/60 transition-colors">
                              <td className="px-4 py-3">
                                <div className="font-semibold text-neutral-900">
                                  {u.displayName || 'Music Teacher'}
                                </div>
                                <div className="text-[11px] font-mono text-neutral-500">{u.email}</div>
                              </td>

                              <td className="px-4 py-3">
                                {u.role === 'admin' ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
                                    <Crown className="w-3 h-3" />
                                    <span>Admin</span>
                                  </span>
                                ) : (
                                  <span className="text-neutral-600">Teacher</span>
                                )}
                              </td>

                              <td className="px-4 py-3 capitalize text-neutral-700">
                                {u.role === 'admin' ? 'Owner Plan' : u.subscriptionPlan}
                              </td>

                              <td className="px-4 py-3">
                                {isSub ? (
                                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                                    <span>Active</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                                    <span>Inactive</span>
                                  </span>
                                )}
                              </td>

                              <td className="px-4 py-3 text-neutral-500 font-mono text-[11px]">
                                {new Date(u.createdAt).toLocaleDateString()}
                              </td>

                              <td className="px-4 py-3 text-right">
                                {isSelf ? (
                                  <span className="text-[11px] text-neutral-400 italic">Self Account</span>
                                ) : (
                                  <button
                                    onClick={() => handleToggleSubscription(u)}
                                    disabled={updatingUid === u.uid}
                                    className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer border ${
                                      isSub
                                        ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                                        : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                                    }`}
                                  >
                                    {updatingUid === u.uid
                                      ? 'Saving...'
                                      : isSub
                                      ? 'Revoke Access'
                                      : 'Grant Access'}
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Mailing List & CSV Export */}
          {activeTab === 'mailing' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 border border-neutral-200 rounded-xl">
                <div>
                  <h3 className="text-sm font-semibold text-neutral-900">
                    Opted-In Newsletter &amp; Communications
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Only users who gave explicit consent during registration or in their Account settings appear here.
                  </p>
                </div>

                <button
                  onClick={handleExportMailingCsv}
                  disabled={mailingUsers.length === 0}
                  className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-300 rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Mailing List (CSV)</span>
                </button>
              </div>

              {/* Mailing Table */}
              <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs divide-y divide-neutral-200">
                  <thead className="bg-neutral-50 text-[11px] font-semibold text-neutral-600 uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Email Address</th>
                      <th className="px-4 py-3">Teacher Name</th>
                      <th className="px-4 py-3">Consent Status</th>
                      <th className="px-4 py-3">Consent Timestamp</th>
                      <th className="px-4 py-3">Account Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 font-medium">
                    {mailingUsers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-neutral-500">
                          No users have opted into the mailing list yet.
                        </td>
                      </tr>
                    ) : (
                      mailingUsers.map((u) => (
                        <tr key={u.uid} className="hover:bg-neutral-50/60 transition-colors">
                          <td className="px-4 py-3 font-mono text-neutral-900">{u.email}</td>
                          <td className="px-4 py-3 text-neutral-700">{u.displayName || '—'}</td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Consent Confirmed</span>
                            </span>
                          </td>
                          <td className="px-4 py-3 font-mono text-[11px] text-neutral-500">
                            {u.mailingListConsentDate
                              ? new Date(u.mailingListConsentDate).toLocaleString()
                              : 'At registration'}
                          </td>
                          <td className="px-4 py-3 font-mono text-[11px] text-neutral-500">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

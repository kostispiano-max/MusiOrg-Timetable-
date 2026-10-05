import React from 'react';
import {
  Calendar,
  Wand2,
  Printer,
  Sparkles,
  Cloud,
  LogOut,
  LogIn,
  User as UserIcon,
  Crown,
  ShieldCheck,
} from 'lucide-react';
import { CycleTerminology, WeekCycle, UserAccount } from '../../types';
import { User } from 'firebase/auth';

export type AppNavTab =
  | 'timetable'
  | 'dashboard'
  | 'schools'
  | 'students'
  | 'settings'
  | 'account'
  | 'admin';

interface HeaderProps {
  activeTab: AppNavTab;
  setActiveTab: (tab: AppNavTab) => void;
  activeCycle: WeekCycle;
  setActiveCycle: (cycle: WeekCycle) => void;
  cycleTerminology: CycleTerminology;
  onOpenOptimizer: () => void;
  onOpenPrint: () => void;
  onOpenWhatIf: () => void;
  onOpenSchoolCycles?: () => void;
  user?: User | null;
  userAccount?: UserAccount | null;
  onOpenAuth?: () => void;
  onLogOut?: () => void;
  isSyncing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  activeCycle,
  setActiveCycle,
  cycleTerminology,
  onOpenOptimizer,
  onOpenPrint,
  onOpenWhatIf,
  onOpenSchoolCycles,
  user,
  userAccount,
  onOpenAuth,
  onLogOut,
  isSyncing = false,
}) => {
  const weekLabelA = cycleTerminology === 'week_12' ? 'Week 1' : 'Week A';
  const weekLabelB = cycleTerminology === 'week_12' ? 'Week 2' : 'Week B';
  const isAdmin = userAccount?.role === 'admin';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-4 sm:gap-6">
            <button
              onClick={() => setActiveTab('timetable')}
              className="text-lg font-bold tracking-tight text-neutral-900 hover:text-neutral-700 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-neutral-900 inline-block" />
              MusiOrg Timetable
            </button>

            {/* Quick School Cycles Trigger in Header */}
            {onOpenSchoolCycles && (
              <button
                type="button"
                onClick={onOpenSchoolCycles}
                className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-neutral-600 hover:text-neutral-950 bg-neutral-100 hover:bg-neutral-200/80 rounded-md border border-neutral-200 transition-colors cursor-pointer"
                title="Manage independent week cycles for each school"
              >
                <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                <span>School Cycles</span>
              </button>
            )}

            {/* Real-time Cloud Sync Indicator */}
            {user && (
              <div
                className="hidden xl:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/80"
                title="All changes synchronize instantly across all your devices"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isSyncing ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'}`} />
                <Cloud className="w-3 h-3 text-emerald-600" />
                <span>{isSyncing ? 'Syncing...' : 'Cloud Synced'}</span>
              </div>
            )}
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <button
              onClick={() => setActiveTab('timetable')}
              className={`transition-colors whitespace-nowrap py-1 border-b-2 cursor-pointer ${
                activeTab === 'timetable'
                  ? 'border-neutral-900 text-neutral-950 font-semibold'
                  : 'border-transparent text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Timetable
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`transition-colors whitespace-nowrap py-1 border-b-2 cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'border-neutral-900 text-neutral-950 font-semibold'
                  : 'border-transparent text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('schools')}
              className={`transition-colors whitespace-nowrap py-1 border-b-2 cursor-pointer ${
                activeTab === 'schools'
                  ? 'border-neutral-900 text-neutral-950 font-semibold'
                  : 'border-transparent text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Schools
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`transition-colors whitespace-nowrap py-1 border-b-2 cursor-pointer ${
                activeTab === 'students'
                  ? 'border-neutral-900 text-neutral-950 font-semibold'
                  : 'border-transparent text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Students
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`transition-colors whitespace-nowrap py-1 border-b-2 cursor-pointer ${
                activeTab === 'settings'
                  ? 'border-neutral-900 text-neutral-950 font-semibold'
                  : 'border-transparent text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Teacher Settings
            </button>

            {/* Admin Dashboard Tab (Protected to Admin Role) */}
            {isAdmin && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`transition-colors whitespace-nowrap py-1 border-b-2 flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'admin'
                    ? 'border-purple-700 text-purple-900 font-bold'
                    : 'border-transparent text-purple-700 hover:text-purple-900'
                }`}
              >
                <Crown className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
            )}
          </nav>

          {/* Zone 3: Actions & Account User Area */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Week A/B or 1/2 Cycle Toggle */}
            <div className="flex items-center bg-neutral-100 p-0.5 rounded-lg border border-neutral-200">
              <button
                onClick={() => setActiveCycle('A')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  activeCycle === 'A'
                    ? 'bg-white text-neutral-900 shadow-2xs'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                {weekLabelA}
              </button>
              <button
                onClick={() => setActiveCycle('B')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  activeCycle === 'B'
                    ? 'bg-white text-neutral-900 shadow-2xs'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                {weekLabelB}
              </button>
            </div>

            {/* Action Buttons */}
            <button
              type="button"
              onClick={onOpenOptimizer}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:text-neutral-950 bg-neutral-100 hover:bg-neutral-200/80 rounded-md transition-colors cursor-pointer"
              title="Intelligent schedule optimizer"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>Optimize</span>
            </button>

            <button
              type="button"
              onClick={onOpenPrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:text-neutral-950 bg-neutral-100 hover:bg-neutral-200/80 rounded-md transition-colors cursor-pointer"
              title="Print timetable view"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print</span>
            </button>

            {/* Account & Log Out Area */}
            {user ? (
              <div className="flex items-center gap-1.5 pl-2 ml-1 border-l border-neutral-200">
                <button
                  type="button"
                  onClick={() => setActiveTab('account')}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                    activeTab === 'account'
                      ? 'bg-neutral-900 text-white border-neutral-900'
                      : 'bg-neutral-100 text-neutral-800 border-neutral-200 hover:bg-neutral-200/80'
                  }`}
                  title="View Account, Subscription & Settings"
                >
                  <UserIcon className="w-3.5 h-3.5 text-neutral-500" />
                  <span className="hidden xl:inline truncate max-w-[120px]">
                    {userAccount?.displayName || user.displayName || user.email?.split('@')[0]}
                  </span>
                  <span className="xl:hidden">Account</span>
                </button>

                <button
                  type="button"
                  onClick={onLogOut}
                  className="p-1.5 text-neutral-500 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Log out of MusiOrg Timetable"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="pl-2 ml-1 border-l border-neutral-200">
                <button
                  type="button"
                  onClick={onOpenAuth}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-neutral-800 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors cursor-pointer"
                  title="Sign in or create account"
                >
                  <LogIn className="w-3.5 h-3.5 text-neutral-600" />
                  <span>Log In</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden items-center justify-between py-2 border-t border-neutral-100 overflow-x-auto text-xs gap-3">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('timetable')}
              className={`py-1 cursor-pointer ${activeTab === 'timetable' ? 'font-bold text-neutral-950' : 'text-neutral-500'}`}
            >
              Timetable
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-1 cursor-pointer ${activeTab === 'dashboard' ? 'font-bold text-neutral-950' : 'text-neutral-500'}`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('schools')}
              className={`py-1 cursor-pointer ${activeTab === 'schools' ? 'font-bold text-neutral-950' : 'text-neutral-500'}`}
            >
              Schools
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`py-1 cursor-pointer ${activeTab === 'students' ? 'font-bold text-neutral-950' : 'text-neutral-500'}`}
            >
              Students
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-1 cursor-pointer ${activeTab === 'settings' ? 'font-bold text-neutral-950' : 'text-neutral-500'}`}
            >
              Settings
            </button>
            <button
              onClick={() => setActiveTab('account')}
              className={`py-1 cursor-pointer ${activeTab === 'account' ? 'font-bold text-neutral-950' : 'text-neutral-500'}`}
            >
              Account
            </button>
            {isAdmin && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`py-1 font-bold text-purple-700 cursor-pointer ${activeTab === 'admin' ? 'underline' : ''}`}
              >
                Admin
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

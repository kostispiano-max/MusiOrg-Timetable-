import React from 'react';
import { Calendar, Wand2, Printer, Sparkles, Cloud, LogOut, LogIn, User as UserIcon } from 'lucide-react';
import { CycleTerminology, WeekCycle } from '../../types';
import { User } from 'firebase/auth';

interface HeaderProps {
  activeTab: 'timetable' | 'dashboard' | 'schools' | 'students' | 'settings';
  setActiveTab: (tab: 'timetable' | 'dashboard' | 'schools' | 'students' | 'settings') => void;
  activeCycle: WeekCycle;
  setActiveCycle: (cycle: WeekCycle) => void;
  cycleTerminology: CycleTerminology;
  onOpenOptimizer: () => void;
  onOpenPrint: () => void;
  onOpenWhatIf: () => void;
  onOpenSchoolCycles?: () => void;
  user?: User | null;
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
  onOpenAuth,
  onLogOut,
  isSyncing = false,
}) => {
  const weekLabelA = cycleTerminology === 'week_12' ? 'Week 1' : 'Week A';
  const weekLabelB = cycleTerminology === 'week_12' ? 'Week 2' : 'Week B';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Brand Wordmark (Single text element) */}
          <div className="flex items-center gap-4 sm:gap-6">
            <button
              onClick={() => setActiveTab('timetable')}
              className="text-lg font-bold tracking-tight text-neutral-900 hover:text-neutral-700 transition-colors flex items-center gap-2"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-neutral-900 inline-block" />
              MusiOrg Timetable
            </button>

            {/* Quick School Cycles Trigger in Header */}
            {onOpenSchoolCycles && (
              <button
                type="button"
                onClick={onOpenSchoolCycles}
                className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-neutral-600 hover:text-neutral-950 bg-neutral-100 hover:bg-neutral-200/80 rounded-md border border-neutral-200 transition-colors"
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
              className={`transition-colors whitespace-nowrap py-1 border-b-2 ${
                activeTab === 'timetable'
                  ? 'border-neutral-900 text-neutral-950 font-semibold'
                  : 'border-transparent text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Timetable
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`transition-colors whitespace-nowrap py-1 border-b-2 ${
                activeTab === 'dashboard'
                  ? 'border-neutral-900 text-neutral-950 font-semibold'
                  : 'border-transparent text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('schools')}
              className={`transition-colors whitespace-nowrap py-1 border-b-2 ${
                activeTab === 'schools'
                  ? 'border-neutral-900 text-neutral-950 font-semibold'
                  : 'border-transparent text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Schools & Restrictions
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`transition-colors whitespace-nowrap py-1 border-b-2 ${
                activeTab === 'students'
                  ? 'border-neutral-900 text-neutral-950 font-semibold'
                  : 'border-transparent text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Students
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`transition-colors whitespace-nowrap py-1 border-b-2 ${
                activeTab === 'settings'
                  ? 'border-neutral-900 text-neutral-950 font-semibold'
                  : 'border-transparent text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Settings
            </button>
          </nav>

          {/* Zone 3: Primary Actions & User Account */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenWhatIf}
              title="Test a change and see affected lessons"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md hover:bg-neutral-50 hover:text-neutral-950 transition-colors whitespace-nowrap cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-neutral-500" />
              <span>What If?</span>
            </button>

            <button
              onClick={onOpenPrint}
              title="Print clean timetable for music room door or records"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md hover:bg-neutral-50 hover:text-neutral-950 transition-colors whitespace-nowrap cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-neutral-500" />
              <span className="hidden sm:inline">Print / Export</span>
            </button>

            <button
              onClick={onOpenOptimizer}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-neutral-900 rounded-md hover:bg-neutral-800 transition-colors shadow-xs whitespace-nowrap cursor-pointer"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>Optimise</span>
            </button>

            {/* User Account Controls */}
            {user ? (
              <div className="flex items-center gap-1.5 pl-2 ml-1 border-l border-neutral-200">
                <div
                  className="hidden md:flex flex-col text-right text-xs max-w-[130px] truncate"
                  title={user.email || 'Authenticated Teacher'}
                >
                  <span className="font-semibold text-neutral-900 truncate">
                    {user.displayName || user.email?.split('@')[0]}
                  </span>
                  <span className="text-[10px] text-neutral-400 truncate">
                    {user.email}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={onLogOut}
                  className="p-1.5 text-neutral-500 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Sign out of MusiOrg"
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
                  title="Sign in or create account for multi-device sync"
                >
                  <LogIn className="w-3.5 h-3.5 text-neutral-600" />
                  <span>Log In / Sign Up</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden items-center justify-between py-2 border-t border-neutral-100 overflow-x-auto text-xs">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('timetable')}
              className={`py-1 ${activeTab === 'timetable' ? 'font-bold text-neutral-950' : 'text-neutral-500'}`}
            >
              Timetable
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-1 ${activeTab === 'dashboard' ? 'font-bold text-neutral-950' : 'text-neutral-500'}`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('schools')}
              className={`py-1 ${activeTab === 'schools' ? 'font-bold text-neutral-950' : 'text-neutral-500'}`}
            >
              Schools
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`py-1 ${activeTab === 'students' ? 'font-bold text-neutral-950' : 'text-neutral-500'}`}
            >
              Students
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-1 ${activeTab === 'settings' ? 'font-bold text-neutral-950' : 'text-neutral-500'}`}
            >
              Settings
            </button>
          </div>

          <div className="inline-flex sm:hidden items-center bg-neutral-100 p-0.5 rounded text-[11px]">
            <button
              onClick={() => setActiveCycle('A')}
              className={`px-2 py-0.5 font-medium rounded ${activeCycle === 'A' ? 'bg-white text-neutral-900' : 'text-neutral-500'}`}
            >
              {weekLabelA}
            </button>
            <button
              onClick={() => setActiveCycle('B')}
              className={`px-2 py-0.5 font-medium rounded ${activeCycle === 'B' ? 'bg-white text-neutral-900' : 'text-neutral-500'}`}
            >
              {weekLabelB}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

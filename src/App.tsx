import React, { useState, useEffect, useRef } from 'react';
import {
  AppState,
  loadInitialState,
  saveStateToStorage,
} from './utils/storage';
import {
  WeekCycle,
  DayOfWeek,
  TimetableSlot,
  School,
  Student,
  YearGroup,
  YearSubgroup,
  Restriction,
  TemporaryException,
  TeacherProfile,
  SchedulingIssue,
  ConflictAlternative,
  UserAccount,
} from './types';
import { ValidationContext } from './utils/constraintChecker';
import { Header, AppNavTab } from './components/common/Header';
import { TimetableMain } from './components/timetable/TimetableMain';
import { Dashboard } from './components/dashboard/Dashboard';
import { SchoolsManager } from './components/schools/SchoolsManager';
import { StudentsManager } from './components/students/StudentsManager';
import { TeacherSettings } from './components/settings/TeacherSettings';
import { OptimizerModal } from './components/timetable/OptimizerModal';
import { WhatIfModal } from './components/timetable/WhatIfModal';
import { ConflictModal } from './components/timetable/ConflictModal';
import { PrintTimetableModal } from './components/timetable/PrintTimetableModal';
import { SchoolCyclesModal } from './components/timetable/SchoolCyclesModal';
import { AuthModal } from './components/auth/AuthModal';
import { PaywallView } from './components/paywall/PaywallView';
import { LandingView } from './components/landing/LandingView';
import { AccountPage } from './components/account/AccountPage';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { subscribeToAuthState, logOutUser } from './services/authService';
import {
  ensureUserInitialized,
  subscribeToUserAccount,
  subscribeToUserTimetableData,
  saveDbSchools,
  saveDbStudents,
  saveDbYearGroups,
  saveDbSubgroups,
  saveDbRestrictions,
  saveDbExceptions,
  saveDbTimetableSlots,
  saveDbTeacherProfile,
  populateUserDemoData,
  clearUserAccountData,
  importLocalPrototypeData,
  normalizeSchoolDayHours,
} from './services/dbService';
import { User } from 'firebase/auth';
import { Cloud, Sparkles, Plus, AlertCircle, X } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userAccount, setUserAccount] = useState<UserAccount | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const [appState, setAppState] = useState<AppState>(() => loadInitialState());
  const [activeTab, setActiveTab] = useState<AppNavTab>('timetable');
  const [activeCycle, setActiveCycle] = useState<WeekCycle>('A');

  // Dismissable banner for brand new empty accounts
  const [hideEmptyNotice, setHideEmptyNotice] = useState<boolean>(false);

  // Modals
  const [showOptimizerModal, setShowOptimizerModal] = useState<boolean>(false);
  const [showWhatIfModal, setShowWhatIfModal] = useState<boolean>(false);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [showSchoolCyclesModal, setShowSchoolCyclesModal] = useState<boolean>(false);
  const [activeConflictIssues, setActiveConflictIssues] = useState<SchedulingIssue[] | null>(null);

  // Avoid saving to localStorage when user is signed into cloud database
  const currentUserRef = useRef<User | null>(null);
  currentUserRef.current = currentUser;

  // Track auth state across sessions
  useEffect(() => {
    let unsubscribeDb: (() => void) | null = null;
    let unsubscribeAccount: (() => void) | null = null;

    const unsubscribeAuth = subscribeToAuthState(async (user) => {
      setCurrentUser(user);

      if (unsubscribeDb) {
        unsubscribeDb();
        unsubscribeDb = null;
      }
      if (unsubscribeAccount) {
        unsubscribeAccount();
        unsubscribeAccount = null;
      }

      if (user) {
        try {
          setIsSyncing(true);
          const initialAccount = await ensureUserInitialized(
            user.uid,
            user.email || '',
            user.displayName || undefined
          );
          setUserAccount(initialAccount);

          // Real-time listener for user account status & role changes
          unsubscribeAccount = subscribeToUserAccount(user.uid, (acc) => {
            if (acc) {
              setUserAccount(acc);
            }
          });

          // Subscribe to private timetable collections
          unsubscribeDb = subscribeToUserTimetableData(
            user.uid,
            (remoteData) => {
              // Ensure all schools loaded have day-specific hours normalized
              const normalizedData: AppState = {
                ...remoteData,
                schools: remoteData.schools.map((s) => normalizeSchoolDayHours(s)),
              };
              setAppState(normalizedData);
              setIsSyncing(false);
            },
            (error) => {
              console.error('Firestore real-time sync error:', error);
              setIsSyncing(false);
            }
          );
        } catch (err) {
          console.error('Failed to initialize user data:', err);
          setIsSyncing(false);
        }
      } else {
        setUserAccount(null);
        setAppState(loadInitialState());
      }
      setAuthLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeDb) unsubscribeDb();
      if (unsubscribeAccount) unsubscribeAccount();
    };
  }, []);

  // Save to localStorage ONLY when offline / logged out
  useEffect(() => {
    if (!currentUserRef.current) {
      saveStateToStorage(appState);
    }
  }, [appState]);

  // Handle Logout
  const handleLogOut = async () => {
    try {
      await logOutUser();
    } catch (e) {
      console.error('Error logging out:', e);
    }
    setCurrentUser(null);
    setUserAccount(null);
    setAppState(loadInitialState());
    setActiveTab('timetable');
  };

  // Context bundle passed to validators and optimizers
  const validationContext: ValidationContext = {
    schools: appState.schools,
    students: appState.students,
    yearGroups: appState.yearGroups,
    subgroups: appState.subgroups,
    restrictions: appState.restrictions,
    temporaryExceptions: appState.temporaryExceptions,
    timetableSlots: appState.timetableSlots,
    teacherProfile: appState.teacherProfile,
  };

  const notifySync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 800);
  };

  // Updaters with Firestore synchronization
  const handleUpdateSlots = (newSlots: TimetableSlot[]) => {
    setAppState((prev) => ({ ...prev, timetableSlots: newSlots }));
    if (currentUser) {
      notifySync();
      saveDbTimetableSlots(currentUser.uid, newSlots).catch(console.error);
    }
  };

  const handleUpdateSchools = (newSchools: School[]) => {
    const normalized = newSchools.map((s) => normalizeSchoolDayHours(s));
    setAppState((prev) => ({ ...prev, schools: normalized }));
    if (currentUser) {
      notifySync();
      saveDbSchools(currentUser.uid, normalized).catch(console.error);
    }
  };

  const handleUpdateStudents = (newStudents: Student[]) => {
    setAppState((prev) => ({ ...prev, students: newStudents }));
    if (currentUser) {
      notifySync();
      saveDbStudents(currentUser.uid, newStudents).catch(console.error);
    }
  };

  const handleUpdateYearGroups = (newYGs: YearGroup[]) => {
    setAppState((prev) => ({ ...prev, yearGroups: newYGs }));
    if (currentUser) {
      notifySync();
      saveDbYearGroups(currentUser.uid, newYGs).catch(console.error);
    }
  };

  const handleUpdateSubgroups = (newSGs: YearSubgroup[]) => {
    setAppState((prev) => ({ ...prev, subgroups: newSGs }));
    if (currentUser) {
      notifySync();
      saveDbSubgroups(currentUser.uid, newSGs).catch(console.error);
    }
  };

  const handleUpdateRestrictions = (newRests: Restriction[]) => {
    setAppState((prev) => ({ ...prev, restrictions: newRests }));
    if (currentUser) {
      notifySync();
      saveDbRestrictions(currentUser.uid, newRests).catch(console.error);
    }
  };

  const handleUpdateTeacherProfile = (newProfile: TeacherProfile) => {
    setAppState((prev) => ({ ...prev, teacherProfile: newProfile }));
    if (currentUser) {
      notifySync();
      saveDbTeacherProfile(currentUser.uid, newProfile).catch(console.error);
    }
  };

  const handleUpdateSchoolCycle = (schoolId: string, nextCycle: WeekCycle, notes?: string) => {
    const updated = appState.schools.map((sc) => {
      if (sc.id === schoolId) {
        return {
          ...sc,
          currentWeekCycle: nextCycle,
          cycleNotes: notes !== undefined ? notes : sc.cycleNotes,
        };
      }
      return sc;
    });
    handleUpdateSchools(updated);
  };

  const handleSyncAllSchools = (targetCycle: WeekCycle) => {
    const updated = appState.schools.map((sc) => ({
      ...sc,
      currentWeekCycle: targetCycle,
    }));
    handleUpdateSchools(updated);
  };

  const handleApplyConflictAlternative = (issue: SchedulingIssue, alternative: ConflictAlternative) => {
    const student = appState.students.find((s) => s.id === issue.studentId);
    if (!student) return;

    const existingSlot = appState.timetableSlots.find(
      (s) => s.studentId === issue.studentId && s.weekCycle === activeCycle
    );

    if (existingSlot) {
      const updated = appState.timetableSlots.map((s) =>
        s.id === existingSlot.id
          ? { ...s, day: alternative.day, startTime: alternative.startTime, endTime: alternative.endTime }
          : s
      );
      handleUpdateSlots(updated);
    } else {
      const newSlot: TimetableSlot = {
        id: `slot_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        weekCycle: activeCycle,
        schoolId: issue.schoolId,
        studentId: issue.studentId,
        day: alternative.day,
        startTime: alternative.startTime,
        endTime: alternative.endTime,
        duration: student.lessonDuration,
      };
      handleUpdateSlots([...appState.timetableSlots, newSlot]);
    }
  };

  const handlePopulateDemoData = async () => {
    if (!currentUser) return;
    try {
      setIsSyncing(true);
      await populateUserDemoData(currentUser.uid);
      setHideEmptyNotice(true);
    } catch (err) {
      console.error('Failed to populate demo data:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleClearAccountData = async () => {
    if (!currentUser) return;
    try {
      setIsSyncing(true);
      await clearUserAccountData(currentUser.uid);
    } catch (err) {
      console.error('Failed to clear account data:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleImportLocalStorage = async () => {
    if (!currentUser) return;
    try {
      setIsSyncing(true);
      const localData = loadInitialState();
      await importLocalPrototypeData(currentUser.uid, localData);
      setHideEmptyNotice(true);
    } catch (err) {
      console.error('Failed to import local prototype data:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // 1. Loading screen while Firebase Auth initializes
  if (authLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center selection:bg-neutral-200">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 rounded-full border-2 border-neutral-900 border-t-transparent animate-spin" />
          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-700">
            <span className="w-2 h-2 rounded-full bg-neutral-900 inline-block" />
            <span>MusiOrg Timetable</span>
          </div>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated user: Show Landing Screen
  if (!currentUser) {
    return (
      <>
        <LandingView
          onOpenSignIn={() => {
            setAuthModalMode('signin');
            setShowAuthModal(true);
          }}
          onOpenSignUp={() => {
            setAuthModalMode('signup');
            setShowAuthModal(true);
          }}
        />
        <AuthModal
          isOpen={showAuthModal}
          initialMode={authModalMode}
          onClose={() => setShowAuthModal(false)}
        />
      </>
    );
  }

  // 3. Authenticated user without active subscription / access entitlement
  const hasAccessEntitlement =
    userAccount?.role === 'admin' || userAccount?.subscriptionStatus === 'active';

  if (!hasAccessEntitlement) {
    if (activeTab === 'account' && userAccount) {
      return (
        <div className="min-h-screen bg-neutral-50 overflow-y-auto">
          <AccountPage
            userAccount={userAccount}
            onLogOut={handleLogOut}
            onBackToApp={() => setActiveTab('timetable')}
            onUpdateAccount={(updated) => setUserAccount(updated)}
          />
        </div>
      );
    }

    return (
      <PaywallView
        userAccount={userAccount}
        onOpenAccount={() => setActiveTab('account')}
        onLogOut={handleLogOut}
      />
    );
  }

  // 4. Authenticated with active entitlement: Main Application
  const isBrandNewEmptyAccount =
    currentUser &&
    appState.schools.length === 0 &&
    appState.students.length === 0 &&
    !hideEmptyNotice;

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900 font-sans selection:bg-neutral-200">
      {/* Header with Navigation and User Menu */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeCycle={activeCycle}
        setActiveCycle={setActiveCycle}
        cycleTerminology={appState.teacherProfile.cycleTerminology}
        onOpenOptimizer={() => setShowOptimizerModal(true)}
        onOpenPrint={() => setShowPrintModal(true)}
        onOpenWhatIf={() => setShowWhatIfModal(true)}
        onOpenSchoolCycles={() => setShowSchoolCyclesModal(true)}
        user={currentUser}
        userAccount={userAccount}
        onOpenAuth={() => setShowAuthModal(true)}
        onLogOut={handleLogOut}
        isSyncing={isSyncing}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Brand New Account Welcome Banner */}
        {isBrandNewEmptyAccount && (
          <div className="bg-neutral-900 text-white px-4 py-3 text-xs flex flex-wrap items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>Welcome, {currentUser.displayName || currentUser.email}!</strong> Your timetable is ready for your schools.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePopulateDemoData}
                className="px-3 py-1 bg-white text-neutral-900 font-semibold rounded-md hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                Load Sample Teaching Data
              </button>
              <button
                onClick={handleImportLocalStorage}
                className="px-3 py-1 bg-neutral-800 text-neutral-200 font-medium rounded-md hover:bg-neutral-700 transition-colors cursor-pointer"
              >
                Import Local Draft
              </button>
              <button
                onClick={() => setHideEmptyNotice(true)}
                className="p-1 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Tab 1: Timetable */}
        {activeTab === 'timetable' && (
          <TimetableMain
            context={validationContext}
            activeCycle={activeCycle}
            setActiveCycle={setActiveCycle}
            onUpdateSlots={handleUpdateSlots}
            onUpdateSchools={handleUpdateSchools}
            onUpdateStudents={handleUpdateStudents}
            onUpdateRestrictions={handleUpdateRestrictions}
            onAddSchool={(sc, ygs) => {
              handleUpdateSchools([...appState.schools, sc]);
              handleUpdateYearGroups([...appState.yearGroups, ...ygs]);
            }}
            onAddException={(ex) => {
              setAppState((prev) => ({
                ...prev,
                temporaryExceptions: [...prev.temporaryExceptions, ex],
              }));
              if (currentUser) {
                saveDbExceptions(currentUser.uid, [...appState.temporaryExceptions, ex]).catch(console.error);
              }
            }}
            onOpenOptimizer={() => setShowOptimizerModal(true)}
            onOpenConflicts={() => setShowOptimizerModal(true)}
          />
        )}

        {/* Tab 2: Dashboard */}
        {activeTab === 'dashboard' && (
          <Dashboard
            context={validationContext}
            activeCycle={activeCycle}
            cycleTerminology={appState.teacherProfile.cycleTerminology}
            onNavigateToTimetable={() => setActiveTab('timetable')}
            onOpenOptimizer={() => setShowOptimizerModal(true)}
            onOpenConflicts={() => setShowOptimizerModal(true)}
            onUpdateSchools={handleUpdateSchools}
          />
        )}

        {/* Tab 3: Schools Manager */}
        {activeTab === 'schools' && (
          <SchoolsManager
            schools={appState.schools}
            yearGroups={appState.yearGroups}
            subgroups={appState.subgroups}
            restrictions={appState.restrictions}
            onUpdateSchools={handleUpdateSchools}
            onUpdateYearGroups={handleUpdateYearGroups}
            onUpdateSubgroups={handleUpdateSubgroups}
            onUpdateRestrictions={handleUpdateRestrictions}
          />
        )}

        {/* Tab 4: Students Manager */}
        {activeTab === 'students' && (
          <StudentsManager
            students={appState.students}
            schools={appState.schools}
            yearGroups={appState.yearGroups}
            subgroups={appState.subgroups}
            timetableSlots={appState.timetableSlots}
            restrictions={appState.restrictions}
            onUpdateStudents={handleUpdateStudents}
            onUpdateSlots={handleUpdateSlots}
            onUpdateRestrictions={handleUpdateRestrictions}
          />
        )}

        {/* Tab 5: Settings */}
        {activeTab === 'settings' && (
          <TeacherSettings
            teacherProfile={appState.teacherProfile}
            appState={appState}
            onUpdateTeacherProfile={handleUpdateTeacherProfile}
            onRestoreState={(restored) => {
              setAppState(restored);
              if (currentUser) {
                importLocalPrototypeData(currentUser.uid, restored).catch(console.error);
              }
            }}
            user={currentUser}
            onOpenAuth={() => setShowAuthModal(true)}
            onPopulateDemoData={handlePopulateDemoData}
            onClearData={handleClearAccountData}
            onImportLocalStorage={handleImportLocalStorage}
          />
        )}

        {/* Tab 6: Account Page */}
        {activeTab === 'account' && userAccount && (
          <AccountPage
            userAccount={userAccount}
            onLogOut={handleLogOut}
            onBackToApp={() => setActiveTab('timetable')}
            onUpdateAccount={(updated) => setUserAccount(updated)}
          />
        )}

        {/* Tab 7: Admin Dashboard (Protected to Admin Role) */}
        {activeTab === 'admin' && userAccount?.role === 'admin' && (
          <AdminDashboard currentAdminEmail={userAccount.email} />
        )}
      </main>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={showAuthModal}
        initialMode={authModalMode}
        onClose={() => setShowAuthModal(false)}
      />

      {/* School Week Cycles & Irregular Notes Modal */}
      {showSchoolCyclesModal && (
        <SchoolCyclesModal
          schools={appState.schools}
          onUpdateSchoolCycle={handleUpdateSchoolCycle}
          onSyncAllSchools={handleSyncAllSchools}
          onClose={() => setShowSchoolCyclesModal(false)}
        />
      )}

      {/* Optimizer Modal */}
      {showOptimizerModal && (
        <OptimizerModal
          context={validationContext}
          activeCycle={activeCycle}
          onClose={() => setShowOptimizerModal(false)}
          onApplyOptimization={(newSlots) => handleUpdateSlots(newSlots)}
          onOpenConflicts={(issues) => setActiveConflictIssues(issues)}
        />
      )}

      {/* "What If?" Scenario Modal */}
      {showWhatIfModal && (
        <WhatIfModal
          context={validationContext}
          activeCycle={activeCycle}
          onClose={() => setShowWhatIfModal(false)}
          onApplyOptimizedSlots={(newSlots) => handleUpdateSlots(newSlots)}
        />
      )}

      {/* Conflict Resolution Modal */}
      {activeConflictIssues && (
        <ConflictModal
          issues={activeConflictIssues}
          activeCycle={activeCycle}
          onClose={() => setActiveConflictIssues(null)}
          onApplyAlternative={handleApplyConflictAlternative}
        />
      )}

      {/* Print / Export Clean Door Timetable Modal */}
      {showPrintModal && (
        <PrintTimetableModal
          context={validationContext}
          activeCycle={activeCycle}
          cycleTerminology={appState.teacherProfile.cycleTerminology}
          onClose={() => setShowPrintModal(false)}
        />
      )}
    </div>
  );
}

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
} from './types';
import { ValidationContext } from './utils/constraintChecker';
import { Header } from './components/common/Header';
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
import { subscribeToAuthState, logOutUser } from './services/authService';
import {
  ensureUserInitialized,
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
} from './services/dbService';
import { User } from 'firebase/auth';
import { Cloud, Sparkles, Plus, AlertCircle, X } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const [appState, setAppState] = useState<AppState>(() => loadInitialState());
  const [activeTab, setActiveTab] = useState<'timetable' | 'dashboard' | 'schools' | 'students' | 'settings'>('timetable');
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

    const unsubscribeAuth = subscribeToAuthState(async (user) => {
      setCurrentUser(user);
      setAuthLoading(false);

      if (unsubscribeDb) {
        unsubscribeDb();
        unsubscribeDb = null;
      }

      if (user) {
        try {
          setIsSyncing(true);
          await ensureUserInitialized(user.uid, user.email || '', user.displayName || undefined);
          unsubscribeDb = subscribeToUserTimetableData(
            user.uid,
            (remoteData) => {
              setAppState(remoteData);
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
        // Fallback to local storage when logged out
        setAppState(loadInitialState());
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeDb) unsubscribeDb();
    };
  }, []);

  // Save to localStorage ONLY when in offline / logged-out mode
  useEffect(() => {
    if (!currentUserRef.current) {
      saveStateToStorage(appState);
    }
  }, [appState]);

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

  const handleUpdateSlots = (newSlots: TimetableSlot[]) => {
    setAppState((prev) => ({
      ...prev,
      timetableSlots: newSlots,
    }));
    if (currentUser) {
      notifySync();
      saveDbTimetableSlots(currentUser.uid, newSlots).catch(console.error);
    }
  };

  const handleUpdateSchools = (newSchools: School[]) => {
    setAppState((prev) => ({
      ...prev,
      schools: newSchools,
    }));
    if (currentUser) {
      notifySync();
      saveDbSchools(currentUser.uid, newSchools).catch(console.error);
    }
  };

  const handleUpdateStudents = (newStudents: Student[]) => {
    setAppState((prev) => ({
      ...prev,
      students: newStudents,
    }));
    if (currentUser) {
      notifySync();
      saveDbStudents(currentUser.uid, newStudents).catch(console.error);
    }
  };

  const handleUpdateRestrictions = (newRestrictions: Restriction[]) => {
    setAppState((prev) => ({
      ...prev,
      restrictions: newRestrictions,
    }));
    if (currentUser) {
      notifySync();
      saveDbRestrictions(currentUser.uid, newRestrictions).catch(console.error);
    }
  };

  const handleUpdateYearGroups = (newYearGroups: YearGroup[]) => {
    setAppState((prev) => ({
      ...prev,
      yearGroups: newYearGroups,
    }));
    if (currentUser) {
      notifySync();
      saveDbYearGroups(currentUser.uid, newYearGroups).catch(console.error);
    }
  };

  const handleUpdateSubgroups = (newSubgroups: YearSubgroup[]) => {
    setAppState((prev) => ({
      ...prev,
      subgroups: newSubgroups,
    }));
    if (currentUser) {
      notifySync();
      saveDbSubgroups(currentUser.uid, newSubgroups).catch(console.error);
    }
  };

  const handleAddException = (newEx: TemporaryException) => {
    const updated = [...appState.temporaryExceptions, newEx];
    setAppState((prev) => ({
      ...prev,
      temporaryExceptions: updated,
    }));
    if (currentUser) {
      notifySync();
      saveDbExceptions(currentUser.uid, updated).catch(console.error);
    }
  };

  const handleUpdateTeacherProfile = (newProfile: TeacherProfile) => {
    setAppState((prev) => ({
      ...prev,
      teacherProfile: newProfile,
    }));
    if (currentUser) {
      notifySync();
      saveDbTeacherProfile(currentUser.uid, newProfile).catch(console.error);
    }
  };

  const handleUpdateSchoolCycle = (
    schoolId: string,
    cycle: WeekCycle,
    notes?: string,
    terminology?: any
  ) => {
    const updated = appState.schools.map((sc) => {
      if (sc.id === schoolId) {
        return {
          ...sc,
          currentWeekCycle: cycle,
          cycleNotes: notes !== undefined ? notes : sc.cycleNotes,
          cycleTerminology: terminology || sc.cycleTerminology,
        };
      }
      return sc;
    });
    handleUpdateSchools(updated);
  };

  const handleSyncAllSchools = (cycle: WeekCycle) => {
    const updated = appState.schools.map((sc) => ({
      ...sc,
      currentWeekCycle: cycle,
      cycleNotes: `Synced to Week ${cycle}`,
    }));
    handleUpdateSchools(updated);
  };

  const handleAddSchoolWithYearGroups = (newSchool: School, newYearGroups: YearGroup[]) => {
    const updatedSchools = [...appState.schools, newSchool];
    const updatedYears = [...appState.yearGroups, ...newYearGroups];
    setAppState((prev) => ({
      ...prev,
      schools: updatedSchools,
      yearGroups: updatedYears,
    }));
    if (currentUser) {
      notifySync();
      saveDbSchools(currentUser.uid, updatedSchools).catch(console.error);
      saveDbYearGroups(currentUser.uid, updatedYears).catch(console.error);
    }
  };

  const handlePopulateDemoData = async () => {
    if (!currentUser) return;
    setIsSyncing(true);
    try {
      await populateUserDemoData(currentUser.uid);
      setIsSyncing(false);
    } catch (err) {
      console.error('Failed to populate sample data:', err);
      setIsSyncing(false);
    }
  };

  const handleClearAccountData = async () => {
    if (!currentUser) return;
    setIsSyncing(true);
    try {
      await clearUserAccountData(currentUser.uid);
      setIsSyncing(false);
    } catch (err) {
      console.error('Failed to clear data:', err);
      setIsSyncing(false);
    }
  };

  const handleImportLocalStorage = async () => {
    if (!currentUser) return;
    setIsSyncing(true);
    try {
      const local = loadInitialState();
      await importLocalPrototypeData(currentUser.uid, local);
      setIsSyncing(false);
      alert('Local prototype data successfully migrated to your cloud database!');
    } catch (err) {
      console.error('Failed to import local data:', err);
      setIsSyncing(false);
    }
  };

  const handleApplyConflictAlternative = (
    issue: SchedulingIssue,
    alternative: ConflictAlternative
  ) => {
    const student = appState.students.find((s) => s.id === issue.studentId);
    const duration = student?.lessonDuration || 30;

    const existingSlotIndex = appState.timetableSlots.findIndex(
      (s) => s.weekCycle === issue.weekCycle && s.studentId === issue.studentId
    );

    let updatedSlots: TimetableSlot[];

    if (existingSlotIndex >= 0) {
      updatedSlots = appState.timetableSlots.map((s, idx) => {
        if (idx === existingSlotIndex) {
          return {
            ...s,
            day: alternative.day,
            startTime: alternative.startTime,
            endTime: alternative.endTime,
            duration,
            isManualOverride: true,
          };
        }
        return s;
      });
    } else {
      const newSlot: TimetableSlot = {
        id: `slot_${issue.weekCycle}_${issue.studentId}_${Date.now()}`,
        weekCycle: issue.weekCycle,
        schoolId: issue.schoolId,
        studentId: issue.studentId,
        day: alternative.day,
        startTime: alternative.startTime,
        endTime: alternative.endTime,
        duration,
        isManualOverride: true,
      };
      updatedSlots = [...appState.timetableSlots, newSlot];
    }

    handleUpdateSlots(updatedSlots);

    // Remove resolved issue from conflict list
    if (activeConflictIssues) {
      const remaining = activeConflictIssues.filter((i) => i.id !== issue.id);
      if (remaining.length === 0) {
        setActiveConflictIssues(null);
      } else {
        setActiveConflictIssues(remaining);
      }
    }
  };

  const isBrandNewEmptyAccount = currentUser && appState.schools.length === 0 && !hideEmptyNotice;

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900 font-sans selection:bg-neutral-200">
      {/* SaaS Top Navigation Header */}
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
        onOpenAuth={() => setShowAuthModal(true)}
        onLogOut={() => logOutUser().catch(console.error)}
        isSyncing={isSyncing}
      />

      {/* Clean Account Onboarding Banner for newly created accounts */}
      {isBrandNewEmptyAccount && (
        <div className="bg-indigo-50 border-b border-indigo-100 px-4 py-2.5 text-xs text-indigo-950">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>
                <strong>Welcome to MusiOrg!</strong> Your cloud account is ready and isolated. You start with a clean timetable. You can begin adding your schools or load sample demo data to test.
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handlePopulateDemoData}
                className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md shadow-2xs cursor-pointer transition-colors"
              >
                Load Sample Data
              </button>
              <button
                type="button"
                onClick={() => setHideEmptyNotice(true)}
                className="p-1 text-indigo-500 hover:text-indigo-800 rounded cursor-pointer"
                title="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content View Switcher */}
      <main className="flex-1 flex flex-col">
        {activeTab === 'timetable' && (
          <TimetableMain
            context={validationContext}
            activeCycle={activeCycle}
            setActiveCycle={setActiveCycle}
            onUpdateSlots={handleUpdateSlots}
            onUpdateSchools={handleUpdateSchools}
            onUpdateStudents={handleUpdateStudents}
            onUpdateRestrictions={handleUpdateRestrictions}
            onAddSchool={handleAddSchoolWithYearGroups}
            onAddException={handleAddException}
            onOpenOptimizer={() => setShowOptimizerModal(true)}
            onOpenConflicts={() => setActiveConflictIssues([])}
          />
        )}

        {activeTab === 'dashboard' && (
          <Dashboard
            context={validationContext}
            activeCycle={activeCycle}
            cycleTerminology={appState.teacherProfile.cycleTerminology}
            onNavigateToTimetable={(schoolId, day) => {
              setActiveTab('timetable');
            }}
            onOpenOptimizer={() => setShowOptimizerModal(true)}
            onOpenConflicts={() => setActiveConflictIssues([])}
            onUpdateSchools={handleUpdateSchools}
          />
        )}

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
      </main>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={showAuthModal}
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

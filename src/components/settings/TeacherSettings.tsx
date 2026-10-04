import React, { useState } from 'react';
import { TeacherProfile, CycleTerminology, DayOfWeek, DAYS_OF_WEEK } from '../../types';
import { AppState, clearSavedState } from '../../utils/storage';
import {
  Save,
  RotateCcw,
  Download,
  Upload,
  ShieldCheck,
  ArrowRight,
  User,
  Cloud,
  Database,
  Sparkles,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';

interface TeacherSettingsProps {
  teacherProfile: TeacherProfile;
  appState: AppState;
  onUpdateTeacherProfile: (profile: TeacherProfile) => void;
  onRestoreState: (state: AppState) => void;
  user?: FirebaseUser | null;
  onOpenAuth?: () => void;
  onPopulateDemoData?: () => void;
  onClearData?: () => void;
  onImportLocalStorage?: () => void;
}

export const TeacherSettings: React.FC<TeacherSettingsProps> = ({
  teacherProfile,
  appState,
  onUpdateTeacherProfile,
  onRestoreState,
  user,
  onOpenAuth,
  onPopulateDemoData,
  onClearData,
  onImportLocalStorage,
}) => {
  const [name, setName] = useState<string>(teacherProfile.name);
  const [email, setEmail] = useState<string>(teacherProfile.email);
  const [startHour, setStartHour] = useState<string>(teacherProfile.startHour);
  const [finishHour, setFinishHour] = useState<string>(teacherProfile.finishHour);
  const [cycleTerminology, setCycleTerminology] = useState<CycleTerminology>(
    teacherProfile.cycleTerminology
  );
  const [minimizeGaps, setMinimizeGaps] = useState<boolean>(
    teacherProfile.minimizeGapsPreference
  );
  const [keepConsistent, setKeepConsistent] = useState<boolean>(
    teacherProfile.keepConsistentBetweenWeeksPreference
  );
  const [keepNormalDay, setKeepNormalDay] = useState<boolean>(
    teacherProfile.keepNormalDayPreference
  );

  const [savedNotice, setSavedNotice] = useState<boolean>(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateTeacherProfile({
      ...teacherProfile,
      name,
      email,
      startHour,
      finishHour,
      cycleTerminology,
      minimizeGapsPreference: minimizeGaps,
      keepConsistentBetweenWeeksPreference: keepConsistent,
      keepNormalDayPreference: keepNormalDay,
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(appState, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `musiorg_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.schools && parsed.students && parsed.timetableSlots) {
          onRestoreState(parsed);
          alert('Timetable database successfully imported!');
        } else {
          alert('Invalid MusiOrg data file structure.');
        }
      } catch (err) {
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-neutral-900">
          Teacher Profile &amp; Cloud Database Settings
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Configure your personal teaching hours, multi-device cloud synchronization, and database isolation.
        </p>
      </div>

      {/* Cloud Account & Database Status Card */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <div className="flex items-center gap-2">
            <Cloud className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-semibold text-neutral-900">
              Cloud Database &amp; Multi-Device Sync
            </h2>
          </div>
          {user ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Connected
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Local Mode (Sign In for Cloud Sync)
            </span>
          )}
        </div>

        {user ? (
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-neutral-50 rounded-lg border border-neutral-200">
              <div>
                <span className="text-[11px] text-neutral-500 block">Authenticated Account:</span>
                <strong className="text-neutral-900 font-semibold">{user.email}</strong>
              </div>
              <div>
                <span className="text-[11px] text-neutral-500 block">Account UID:</span>
                <span className="font-mono text-[10px] text-neutral-600 break-all">{user.uid}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              {onPopulateDemoData && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Load realistic sample schools, students, and timetable into your account? Existing data will be replaced.')) {
                      onPopulateDemoData();
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Load Realistic Sample Data</span>
                </button>
              )}

              {onImportLocalStorage && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Copy your local prototype data from this device into your authenticated cloud account?')) {
                      onImportLocalStorage();
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 rounded-lg transition-colors cursor-pointer"
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>Migrate Local Prototype to Cloud</span>
                </button>
              )}

              {onClearData && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Clear all schools, students, and timetable data from this account to start completely fresh? This cannot be undone.')) {
                      onClearData();
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer ml-auto"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All Account Data</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 text-xs space-y-3">
            <p className="text-neutral-600">
              You are currently viewing data stored only in this browser. To synchronize across your phones, tablets, and laptops with private zero-trust database isolation, create or log in to your MusiOrg cloud account.
            </p>
            {onOpenAuth && (
              <button
                type="button"
                onClick={onOpenAuth}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors shadow-xs cursor-pointer"
              >
                <Cloud className="w-3.5 h-3.5" />
                <span>Log In / Create Free Account</span>
              </button>
            )}
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Card */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-semibold text-neutral-900 border-b border-neutral-100 pb-3 flex items-center gap-2">
            <User className="w-4 h-4 text-neutral-600" />
            <span>Teacher Profile &amp; Identification</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-medium text-neutral-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-neutral-900 font-medium"
              />
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-neutral-900"
              />
            </div>
          </div>
        </div>

        {/* Global Cycle Terminology Card */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-xs space-y-3">
          <h2 className="text-sm font-semibold text-neutral-900 border-b border-neutral-100 pb-3">
            Default Cycle Terminology
          </h2>
          <p className="text-xs text-neutral-500">
            Choose whether your default terminology displays as Week A / Week B or Week 1 / Week 2. Each school can also independently override this setting.
          </p>

          <div className="flex gap-4 text-xs">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="terminology"
                value="week_ab"
                checked={cycleTerminology === 'week_ab'}
                onChange={() => setCycleTerminology('week_ab')}
                className="text-neutral-900"
              />
              <span className="font-semibold text-neutral-900">Week A / Week B</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="terminology"
                value="week_12"
                checked={cycleTerminology === 'week_12'}
                onChange={() => setCycleTerminology('week_12')}
                className="text-neutral-900"
              />
              <span className="font-semibold text-neutral-900">Week 1 / Week 2</span>
            </label>
          </div>
        </div>

        {/* Working Hours Card */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-semibold text-neutral-900 border-b border-neutral-100 pb-3">
            Overall Preferred Working Hours
          </h2>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-medium text-neutral-700 mb-1">
                Preferred Earliest Start
              </label>
              <input
                type="time"
                value={startHour}
                onChange={(e) => setStartHour(e.target.value)}
                className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-neutral-900 tabular-nums font-medium"
              />
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">
                Preferred Latest Finish
              </label>
              <input
                type="time"
                value={finishHour}
                onChange={(e) => setFinishHour(e.target.value)}
                className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-neutral-900 tabular-nums font-medium"
              />
            </div>
          </div>
        </div>

        {/* Optimisation Preferences Card */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-semibold text-neutral-900 border-b border-neutral-100 pb-3">
            Automatic Generator Preferences
          </h2>

          <div className="space-y-3 text-xs">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={keepNormalDay}
                onChange={(e) => setKeepNormalDay(e.target.checked)}
                className="rounded border-neutral-300 text-neutral-900 mt-0.5 cursor-pointer"
              />
              <div>
                <span className="font-medium text-neutral-900 block">
                  Strongly favour keeping students on established teaching day
                </span>
                <span className="text-neutral-500 text-[11px]">
                  Avoids moving Monday pupils to Wednesday unless strictly necessary.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={keepConsistent}
                onChange={(e) => setKeepConsistent(e.target.checked)}
                className="rounded border-neutral-300 text-neutral-900 mt-0.5 cursor-pointer"
              />
              <div>
                <span className="font-medium text-neutral-900 block">
                  Synchronize lesson times between Week A and Week B where possible
                </span>
                <span className="text-neutral-500 text-[11px]">
                  Helps students and class teachers remember the regular timetable slot.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={minimizeGaps}
                onChange={(e) => setMinimizeGaps(e.target.checked)}
                className="rounded border-neutral-300 text-neutral-900 mt-0.5 cursor-pointer"
              />
              <div>
                <span className="font-medium text-neutral-900 block">
                  Pack lessons to avoid awkward 15–30 min dead gaps
                </span>
                <span className="text-neutral-500 text-[11px]">
                  Allows compact teaching blocks before and after breaks.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Save button */}
        <div className="flex items-center justify-between">
          <div>
            {savedNotice && (
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-md border border-emerald-200">
                Settings saved successfully!
              </span>
            )}
          </div>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors shadow-xs cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>

      {/* JSON File Backup & Restore */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-semibold text-neutral-900 border-b border-neutral-100 pb-3">
          Local File Backup (JSON)
        </h2>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleExportJSON}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-neutral-800 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-neutral-600" />
            <span>Export Backup (JSON)</span>
          </button>

          <label className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-neutral-800 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer">
            <Upload className="w-3.5 h-3.5 text-neutral-600" />
            <span>Import Backup</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportJSON}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </div>
  );
};

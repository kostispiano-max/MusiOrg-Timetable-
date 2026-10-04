import React, { useState } from 'react';
import {
  Student,
  School,
  Restriction,
  DayOfWeek,
  WeekPattern,
  StudentAllowedWindow,
  DAYS_OF_WEEK,
} from '../../types';
import {
  X,
  Plus,
  Clock,
  Ban,
  CheckCircle2,
  Trash2,
  Sparkles,
  AlertTriangle,
  Calendar,
} from 'lucide-react';
import { minutesToTime, timeToMinutes } from '../../utils/timeUtils';
import { getSchoolTheme } from '../../utils/themeUtils';

interface StudentLimitationsModalProps {
  student: Student | null;
  school?: School;
  isOpen: boolean;
  onClose: () => void;
  restrictions: Restriction[];
  onUpdateStudent: (updatedStudent: Student) => void;
  onUpdateRestrictions: (restrictions: Restriction[]) => void;
}

export const StudentLimitationsModal: React.FC<StudentLimitationsModalProps> = ({
  student,
  school,
  isOpen,
  onClose,
  restrictions,
  onUpdateStudent,
  onUpdateRestrictions,
}) => {
  const [activeTab, setActiveTab] = useState<'allowed' | 'blocked'>('allowed');

  // New Allowed Window Form State
  const [allowedWeek, setAllowedWeek] = useState<WeekPattern>('week_a');
  const [allowedDay, setAllowedDay] = useState<DayOfWeek>(student?.normalTeachingDay || 'Monday');
  const [allowedStart, setAllowedStart] = useState<string>('09:00');
  const [allowedEnd, setAllowedEnd] = useState<string>('10:00');
  const [allowedNote, setAllowedNote] = useState<string>('');

  // New Blocked Time Form State
  const [blockedReason, setBlockedReason] = useState<string>('Sports');
  const [blockedWeek, setBlockedWeek] = useState<WeekPattern>('week_b');
  const [blockedDay, setBlockedDay] = useState<DayOfWeek>(student?.normalTeachingDay || 'Monday');
  const [blockedStart, setBlockedStart] = useState<string>('09:00');
  const [blockedEnd, setBlockedEnd] = useState<string>('10:00');
  const [blockedType, setBlockedType] = useState<'hard' | 'soft'>('hard');

  if (!isOpen || !student) return null;

  const schoolTheme = getSchoolTheme(school?.colorTheme);
  const cycleTerminology = school?.cycleTerminology || 'week_ab';
  const labelA = cycleTerminology === 'week_12' ? 'Week 1' : 'Week A';
  const labelB = cycleTerminology === 'week_12' ? 'Week 2' : 'Week B';

  // Get current student-level restrictions
  const studentRestrictions = restrictions.filter(
    (r) => r.scope === 'student' && r.targetId === student.id
  );

  const studentAllowedWindows = student.allowedWindows || [];

  // Generate 15-min options for time pickers (08:30 - 16:00)
  const timeOptions: string[] = [];
  for (let m = 8 * 60 + 30; m <= 16 * 60; m += 15) {
    timeOptions.push(minutesToTime(m));
  }

  // Handlers for Allowed Windows
  const handleAddAllowedWindow = (e: React.FormEvent) => {
    e.preventDefault();
    if (timeToMinutes(allowedStart) >= timeToMinutes(allowedEnd)) {
      alert('Start time must be before end time');
      return;
    }

    const newWindow: StudentAllowedWindow = {
      id: `win_${student.id}_${Date.now()}`,
      weekPattern: allowedWeek,
      dayOfWeek: allowedDay,
      startTime: allowedStart,
      endTime: allowedEnd,
      notes: allowedNote.trim() || undefined,
    };

    const updated = {
      ...student,
      allowedWindows: [...studentAllowedWindows, newWindow],
    };

    onUpdateStudent(updated);
    setAllowedNote('');
  };

  const handleDeleteAllowedWindow = (winId: string) => {
    const updated = {
      ...student,
      allowedWindows: studentAllowedWindows.filter((w) => w.id !== winId),
    };
    onUpdateStudent(updated);
  };

  // Handlers for Blocked Restrictions
  const handleAddBlockedTime = (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockedReason.trim()) return;
    if (timeToMinutes(blockedStart) >= timeToMinutes(blockedEnd)) {
      alert('Start time must be before end time');
      return;
    }

    const newRestriction: Restriction = {
      id: `rest_stu_${student.id}_${Date.now()}`,
      scope: 'student',
      targetId: student.id,
      schoolId: student.schoolId,
      type: blockedType,
      weekPattern: blockedWeek,
      dayOfWeek: blockedDay,
      startTime: blockedStart,
      endTime: blockedEnd,
      reason: blockedReason.trim(),
    };

    onUpdateRestrictions([...restrictions, newRestriction]);
    setBlockedReason('Sports');
  };

  const handleDeleteBlockedTime = (restId: string) => {
    onUpdateRestrictions(restrictions.filter((r) => r.id !== restId));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-xs animate-in fade-in duration-100">
      <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-start justify-between bg-neutral-50/70">
          <div>
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${schoolTheme.dotColor}`} />
              <h2 className="text-base font-bold text-neutral-900 tracking-tight">
                Timetable Limitations & Specific Availability
              </h2>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Configure student-specific time windows and blocked periods for{' '}
              <strong className="text-neutral-800 font-semibold">{student.name}</strong> (
              {student.instrument} · {school?.name})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-neutral-200 px-6 bg-white gap-6">
          <button
            onClick={() => setActiveTab('allowed')}
            className={`py-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'allowed'
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>&quot;Must Only / Can Only Do&quot; Windows</span>
            <span className="text-[10px] tabular-nums font-semibold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800">
              {studentAllowedWindows.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('blocked')}
            className={`py-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'blocked'
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <Ban className="w-3.5 h-3.5 text-rose-500" />
            <span>Busy Times &amp; Blocked Limitations</span>
            <span className="text-[10px] tabular-nums font-semibold px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-800">
              {studentRestrictions.length}
            </span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: MUST ONLY / CAN ONLY DO WINDOWS */}
          {activeTab === 'allowed' && (
            <div className="space-y-5">
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-xs text-emerald-950 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold block text-emerald-900">
                    Restricted Availability Windows
                  </strong>
                  Use this when a student is strictly restricted to certain hours (e.g.{' '}
                  <em>Leo can only do 9–10 on {labelA} and only 10–11 on {labelB}</em>). Lessons
                  placed outside these windows will trigger an unresolved conflict alert on the
                  timetable.
                </div>
              </div>

              {/* Active Allowed Windows List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                  Active Allowed Windows ({studentAllowedWindows.length})
                </h4>

                {studentAllowedWindows.length === 0 ? (
                  <div className="p-4 rounded-xl border border-dashed border-neutral-200 text-center text-xs text-neutral-400 bg-neutral-50/50">
                    No specific &quot;can only do&quot; windows set. {student.name} is available
                    throughout standard school teaching hours.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {studentAllowedWindows.map((win) => {
                      const cycleText =
                        win.weekPattern === 'all'
                          ? 'All Weeks'
                          : win.weekPattern === 'week_a'
                          ? labelA
                          : labelB;

                      return (
                        <div
                          key={win.id}
                          className="flex items-center justify-between p-3 rounded-xl border border-emerald-200/80 bg-emerald-50/40 text-xs hover:border-emerald-300 transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              {cycleText}
                            </span>
                            <div>
                              <div className="font-semibold text-neutral-900 tabular-nums">
                                {win.dayOfWeek}: {win.startTime} – {win.endTime}
                              </div>
                              {win.notes && (
                                <div className="text-[11px] text-neutral-500 mt-0.5">
                                  {win.notes}
                                </div>
                              )}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDeleteAllowedWindow(win.id)}
                            className="p-1.5 text-neutral-400 hover:text-rose-600 rounded-lg hover:bg-white transition-colors"
                            title="Remove allowed window"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Add New Allowed Window Form */}
              <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/60 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-800">
                  <Plus className="w-3.5 h-3.5 text-neutral-600" />
                  <span>Add &quot;Can Only Do&quot; Window</span>
                </div>

                <form onSubmit={handleAddAllowedWindow} className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                        Cycle
                      </label>
                      <select
                        value={allowedWeek}
                        onChange={(e) => setAllowedWeek(e.target.value as WeekPattern)}
                        className="w-full bg-white border border-neutral-300 rounded-lg px-2.5 py-1.5 text-neutral-900 font-medium"
                      >
                        <option value="week_a">{labelA} only</option>
                        <option value="week_b">{labelB} only</option>
                        <option value="all">Both {labelA} &amp; {labelB}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                        Day
                      </label>
                      <select
                        value={allowedDay}
                        onChange={(e) => setAllowedDay(e.target.value as DayOfWeek)}
                        className="w-full bg-white border border-neutral-300 rounded-lg px-2.5 py-1.5 text-neutral-900 font-medium"
                      >
                        {DAYS_OF_WEEK.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                        From
                      </label>
                      <select
                        value={allowedStart}
                        onChange={(e) => setAllowedStart(e.target.value)}
                        className="w-full bg-white border border-neutral-300 rounded-lg px-2.5 py-1.5 text-neutral-900 tabular-nums font-medium"
                      >
                        {timeOptions.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                        To
                      </label>
                      <select
                        value={allowedEnd}
                        onChange={(e) => setAllowedEnd(e.target.value)}
                        className="w-full bg-white border border-neutral-300 rounded-lg px-2.5 py-1.5 text-neutral-900 tabular-nums font-medium"
                      >
                        {timeOptions.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                      Reason / Note (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Free study period / music rotation"
                      value={allowedNote}
                      onChange={(e) => setAllowedNote(e.target.value)}
                      className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-1.5 text-neutral-900"
                    />
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 text-xs font-semibold cursor-pointer shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Allowed Window</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB 2: BUSY TIMES & BLOCKED LIMITATIONS */}
          {activeTab === 'blocked' && (
            <div className="space-y-5">
              <div className="p-3.5 bg-rose-50/70 border border-rose-200/80 rounded-xl text-xs text-rose-950 flex items-start gap-2.5">
                <Ban className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold block text-rose-900">
                    Unavailable Times &amp; Class Limitations
                  </strong>
                  Specify periods when this student cannot take music lessons (e.g.{' '}
                  <em>John has sports at 9am to 10am on {labelB}</em>, swimming, drama, assemblies,
                  or specialist academic subjects).
                </div>
              </div>

              {/* Active Blocked List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                  Active Limitations ({studentRestrictions.length})
                </h4>

                {studentRestrictions.length === 0 ? (
                  <div className="p-4 rounded-xl border border-dashed border-neutral-200 text-center text-xs text-neutral-400 bg-neutral-50/50">
                    No busy or blocked times registered for {student.name}.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {studentRestrictions.map((r) => {
                      const cycleText =
                        r.weekPattern === 'all'
                          ? 'All Weeks'
                          : r.weekPattern === 'week_a'
                          ? labelA
                          : labelB;

                      return (
                        <div
                          key={r.id}
                          className="flex items-center justify-between p-3 rounded-xl border border-rose-200/80 bg-rose-50/40 text-xs hover:border-rose-300 transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                                r.type === 'hard'
                                  ? 'bg-rose-100 text-rose-800 border-rose-300'
                                  : 'bg-amber-100 text-amber-800 border-amber-300'
                              }`}
                            >
                              {cycleText}
                            </span>
                            <div>
                              <div className="font-bold text-neutral-900 flex items-center gap-1.5">
                                <span>{r.reason}</span>
                                <span className="text-[11px] font-normal text-neutral-500 tabular-nums">
                                  ({r.dayOfWeek} {r.startTime} – {r.endTime})
                                </span>
                              </div>
                              <div className="text-[11px] text-neutral-500">
                                {r.type === 'hard' ? 'Hard conflict (strict)' : 'Soft preference warning'}
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDeleteBlockedTime(r.id)}
                            className="p-1.5 text-neutral-400 hover:text-rose-600 rounded-lg hover:bg-white transition-colors"
                            title="Remove limitation"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Add New Blocked Time Form */}
              <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/60 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-800">
                  <Plus className="w-3.5 h-3.5 text-neutral-600" />
                  <span>Add Busy Time / Limitation</span>
                </div>

                <form onSubmit={handleAddBlockedTime} className="space-y-3 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                        Activity / Reason
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Sports, PE, Swimming, Drama, Therapy"
                        value={blockedReason}
                        onChange={(e) => setBlockedReason(e.target.value)}
                        className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-1.5 text-neutral-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                        Constraint Severity
                      </label>
                      <select
                        value={blockedType}
                        onChange={(e) => setBlockedType(e.target.value as 'hard' | 'soft')}
                        className="w-full bg-white border border-neutral-300 rounded-lg px-2.5 py-1.5 text-neutral-900 font-medium"
                      >
                        <option value="hard">Hard Conflict (Strictly cannot do)</option>
                        <option value="soft">Soft Warning (Prefers to avoid)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                        Cycle
                      </label>
                      <select
                        value={blockedWeek}
                        onChange={(e) => setBlockedWeek(e.target.value as WeekPattern)}
                        className="w-full bg-white border border-neutral-300 rounded-lg px-2.5 py-1.5 text-neutral-900 font-medium"
                      >
                        <option value="week_b">{labelB} only</option>
                        <option value="week_a">{labelA} only</option>
                        <option value="all">All Weeks</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                        Day
                      </label>
                      <select
                        value={blockedDay}
                        onChange={(e) => setBlockedDay(e.target.value as DayOfWeek)}
                        className="w-full bg-white border border-neutral-300 rounded-lg px-2.5 py-1.5 text-neutral-900 font-medium"
                      >
                        {DAYS_OF_WEEK.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                        From
                      </label>
                      <select
                        value={blockedStart}
                        onChange={(e) => setBlockedStart(e.target.value)}
                        className="w-full bg-white border border-neutral-300 rounded-lg px-2.5 py-1.5 text-neutral-900 tabular-nums font-medium"
                      >
                        {timeOptions.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                        To
                      </label>
                      <select
                        value={blockedEnd}
                        onChange={(e) => setBlockedEnd(e.target.value)}
                        className="w-full bg-white border border-neutral-300 rounded-lg px-2.5 py-1.5 text-neutral-900 tabular-nums font-medium"
                      >
                        {timeOptions.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 text-xs font-semibold cursor-pointer shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Limitation</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-neutral-200 bg-neutral-50/70 flex items-center justify-between">
          <div className="text-[11px] text-neutral-500 font-medium">
            Changes apply immediately to timetable conflict checking
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-900 text-white text-xs font-semibold rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

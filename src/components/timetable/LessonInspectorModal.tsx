import React, { useState, useMemo } from 'react';
import {
  TimetableSlot,
  Student,
  School,
  DayOfWeek,
  WeekCycle,
  WeekPattern,
  StudentAllowedWindow,
  Restriction,
  DAYS_OF_WEEK,
} from '../../types';
import { ValidationContext, validateSlot } from '../../utils/constraintChecker';
import { formatTimeDisplay, addMinutes, timeToMinutes, minutesToTime } from '../../utils/timeUtils';
import {
  X,
  Check,
  AlertTriangle,
  AlertCircle,
  ArrowLeftRight,
  Clock,
  Trash2,
  Calendar,
  CheckCircle2,
  Ban,
  SlidersHorizontal,
  Edit2,
  Plus,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { getSchoolTheme } from '../../utils/themeUtils';

interface LessonInspectorModalProps {
  slot: TimetableSlot;
  context: ValidationContext;
  onClose: () => void;
  onUpdateSlot: (updatedSlot: TimetableSlot) => void;
  onSwapStudents: (slotAId: string, slotBId: string) => void;
  onDeleteSlot: (slotId: string) => void;
  onAddTemporaryException: (studentId: string, reason: string, type: 'absence' | 'trip' | 'exam') => void;
  onEditLimitations?: (student: Student) => void;
  onUpdateStudent?: (updatedStudent: Student) => void;
  onUpdateRestrictions?: (restrictions: Restriction[]) => void;
}

export const LessonInspectorModal: React.FC<LessonInspectorModalProps> = ({
  slot,
  context,
  onClose,
  onUpdateSlot,
  onSwapStudents,
  onDeleteSlot,
  onAddTemporaryException,
  onEditLimitations,
  onUpdateStudent,
  onUpdateRestrictions,
}) => {
  const student = context.students.find((s) => s.id === slot.studentId);
  const school = context.schools.find((s) => s.id === slot.schoolId);
  const yearGroup = context.yearGroups.find((y) => y.id === student?.yearGroupId);
  const subgroup = context.subgroups.find((sg) => sg.id === student?.subgroupId);

  const [activeTab, setActiveTab] = useState<'move' | 'swap' | 'exception' | 'limitations'>('move');

  // Form states for moving
  const [targetDay, setTargetDay] = useState<DayOfWeek>(slot.day);
  const [targetStartTime, setTargetStartTime] = useState<string>(slot.startTime);
  const [targetDuration, setTargetDuration] = useState<number>(slot.duration);

  // Form states for swapping
  const [swapTargetSlotId, setSwapTargetSlotId] = useState<string>('');

  // Form state for temporary exception
  const [exceptionReason, setExceptionReason] = useState<string>('Pupil Absent');
  const [exceptionType, setExceptionType] = useState<'absence' | 'trip' | 'exam'>('absence');

  // Form states for inline limitations tab
  const [limSubTab, setLimSubTab] = useState<'allowed' | 'blocked'>('allowed');
  const [newAllowedWeek, setNewAllowedWeek] = useState<WeekPattern>('week_a');
  const [newAllowedDay, setNewAllowedDay] = useState<DayOfWeek>(student?.normalTeachingDay || slot.day);
  const [newAllowedStart, setNewAllowedStart] = useState<string>('09:00');
  const [newAllowedEnd, setNewAllowedEnd] = useState<string>('10:00');
  const [newAllowedNote, setNewAllowedNote] = useState<string>('');

  const [newBlockedReason, setNewBlockedReason] = useState<string>('Sports');
  const [newBlockedWeek, setNewBlockedWeek] = useState<WeekPattern>('week_b');
  const [newBlockedDay, setNewBlockedDay] = useState<DayOfWeek>(student?.normalTeachingDay || slot.day);
  const [newBlockedStart, setNewBlockedStart] = useState<string>('09:00');
  const [newBlockedEnd, setNewBlockedEnd] = useState<string>('10:00');
  const [newBlockedType, setNewBlockedType] = useState<'hard' | 'soft'>('hard');

  const cycleTerminology = school?.cycleTerminology || 'week_ab';
  const labelA = cycleTerminology === 'week_12' ? 'Week 1' : 'Week A';
  const labelB = cycleTerminology === 'week_12' ? 'Week 2' : 'Week B';

  // Compute live validation feedback for the moved position
  const targetEndTime = useMemo(() => {
    return addMinutes(targetStartTime, targetDuration);
  }, [targetStartTime, targetDuration]);

  const validation = useMemo(() => {
    if (!student || !school) {
      return { valid: false, severity: 'hard_violation' as const, hardViolations: ['Invalid student or school'], softWarnings: [] };
    }
    return validateSlot(
      student.id,
      school.id,
      targetDay,
      targetStartTime,
      targetEndTime,
      slot.weekCycle,
      context,
      slot.id // exclude current slot from clash calculation
    );
  }, [student, school, targetDay, targetStartTime, targetEndTime, slot.weekCycle, slot.id, context]);

  // Candidates for swapping on the same day/school
  const swapCandidates = useMemo(() => {
    return context.timetableSlots
      .filter((s) => s.weekCycle === slot.weekCycle && s.schoolId === slot.schoolId && s.id !== slot.id)
      .map((s) => {
        const otherStu = context.students.find((st) => st.id === s.studentId);
        return {
          slot: s,
          student: otherStu,
        };
      });
  }, [context.timetableSlots, context.students, slot]);

  // 15-min options for time pickers (08:30 - 16:00)
  const timeOptions: string[] = useMemo(() => {
    const list: string[] = [];
    for (let m = 8 * 60 + 30; m <= 16 * 60; m += 15) {
      list.push(minutesToTime(m));
    }
    return list;
  }, []);

  const studentRestrictions = useMemo(() => {
    if (!student) return [];
    return context.restrictions.filter(
      (r) => r.scope === 'student' && r.targetId === student.id
    );
  }, [context.restrictions, student]);

  const studentAllowedWindows = student?.allowedWindows || [];

  const handleApplyMove = () => {
    onUpdateSlot({
      ...slot,
      day: targetDay,
      startTime: targetStartTime,
      endTime: targetEndTime,
      duration: targetDuration,
      isManualOverride: true,
    });
    onClose();
  };

  const handleApplySwap = () => {
    if (swapTargetSlotId) {
      onSwapStudents(slot.id, swapTargetSlotId);
      onClose();
    }
  };

  const handleApplyException = () => {
    if (student) {
      onAddTemporaryException(student.id, exceptionReason, exceptionType);
      onClose();
    }
  };

  // Handlers for Allowed Windows
  const handleAddAllowedWindow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!student || !onUpdateStudent) return;
    if (timeToMinutes(newAllowedStart) >= timeToMinutes(newAllowedEnd)) {
      return;
    }

    const currentWindows = student.allowedWindows || [];
    const newWindow: StudentAllowedWindow = {
      id: `win_${student.id}_${Date.now()}`,
      weekPattern: newAllowedWeek,
      dayOfWeek: newAllowedDay,
      startTime: newAllowedStart,
      endTime: newAllowedEnd,
      notes: newAllowedNote.trim() || undefined,
    };

    onUpdateStudent({
      ...student,
      allowedWindows: [...currentWindows, newWindow],
    });
    setNewAllowedNote('');
  };

  const handleDeleteAllowedWindow = (winId: string) => {
    if (!student || !onUpdateStudent) return;
    const currentWindows = student.allowedWindows || [];
    onUpdateStudent({
      ...student,
      allowedWindows: currentWindows.filter((w) => w.id !== winId),
    });
  };

  // Handlers for Blocked Restrictions
  const handleAddBlockedTime = (e: React.FormEvent) => {
    e.preventDefault();
    if (!student || !onUpdateRestrictions) return;
    if (!newBlockedReason.trim()) return;
    if (timeToMinutes(newBlockedStart) >= timeToMinutes(newBlockedEnd)) {
      return;
    }

    const newRestriction: Restriction = {
      id: `rest_stu_${student.id}_${Date.now()}`,
      scope: 'student',
      targetId: student.id,
      schoolId: student.schoolId,
      type: newBlockedType,
      weekPattern: newBlockedWeek,
      dayOfWeek: newBlockedDay,
      startTime: newBlockedStart,
      endTime: newBlockedEnd,
      reason: newBlockedReason.trim(),
    };

    onUpdateRestrictions([...context.restrictions, newRestriction]);
    setNewBlockedReason('Sports');
  };

  const handleDeleteBlockedTime = (restId: string) => {
    if (!onUpdateRestrictions) return;
    onUpdateRestrictions(context.restrictions.filter((r) => r.id !== restId));
  };

  const totalRulesCount = studentAllowedWindows.length + studentRestrictions.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl border border-neutral-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        {/* Header with School Pastel Tint */}
        {(() => {
          const schoolTheme = getSchoolTheme(school?.colorTheme);
          return (
            <div className={`flex items-center justify-between px-6 py-4 border-b border-neutral-200/80 transition-colors ${schoolTheme.headerBg}`}>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`w-2.5 h-2.5 rounded-full ${schoolTheme.dotColor}`} />
                  <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                    <span>{student?.name || 'Lesson Details'}</span>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${schoolTheme.softBadge}`}>
                      {student?.instrument}
                    </span>
                  </h3>
                  {student && (
                    <button
                      type="button"
                      onClick={() => {
                        if (onEditLimitations) {
                          onEditLimitations(student);
                        } else {
                          setActiveTab('limitations');
                        }
                      }}
                      className="ml-1 inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-md bg-white/90 hover:bg-neutral-900 hover:text-white text-neutral-700 border border-neutral-300 shadow-2xs transition-colors cursor-pointer"
                      title={`Edit timetable limitations & allowed windows for ${student.name}`}
                    >
                      <SlidersHorizontal className="w-3 h-3 text-indigo-600 group-hover:text-white" />
                      <span>Edit Limitations</span>
                    </button>
                  )}
                </div>
                <p className="text-xs text-neutral-700 mt-1 font-medium">
                  {school?.name} · {yearGroup?.name}
                  {subgroup ? ` (${subgroup.name})` : ''} · Normal day: {student?.normalTeachingDay}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-md text-neutral-500 hover:text-neutral-800 hover:bg-black/5 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          );
        })()}

        {/* Student Specific Limitations & Availability Windows Banner */}
        {student && totalRulesCount > 0 ? (
          <div className="mx-6 mt-3 p-3 rounded-xl bg-neutral-50/80 border border-neutral-200 text-xs space-y-1.5 shrink-0">
            <div className="flex items-center justify-between">
              <div className="font-semibold text-neutral-800 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                <span>Student Timetable Rules:</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (onEditLimitations) {
                    onEditLimitations(student);
                  } else {
                    setActiveTab('limitations');
                  }
                }}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer underline underline-offset-2"
              >
                <Edit2 className="w-3 h-3" />
                <span>Edit Rules</span>
              </button>
            </div>

            {studentAllowedWindows.map((w) => (
              <div
                key={w.id}
                className="text-[11px] text-emerald-800 flex items-center gap-1.5 font-medium"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>
                  Must only do (
                  {w.weekPattern === 'all'
                    ? 'All Weeks'
                    : w.weekPattern === 'week_a'
                    ? labelA
                    : labelB}
                  ): {w.dayOfWeek} {w.startTime}–{w.endTime}
                  {w.notes ? ` (${w.notes})` : ''}
                </span>
              </div>
            ))}
            {studentRestrictions.map((r) => (
              <div
                key={r.id}
                className="text-[11px] text-rose-800 flex items-center gap-1.5 font-medium"
              >
                <Ban className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span>
                  Blocked (
                  {r.weekPattern === 'all'
                    ? 'All Weeks'
                    : r.weekPattern === 'week_a'
                    ? labelA
                    : labelB}
                  ): {r.dayOfWeek} {r.startTime}–{r.endTime} — {r.reason}
                </span>
              </div>
            ))}
          </div>
        ) : (
          student && (
            <div className="mx-6 mt-3 px-3.5 py-2 rounded-xl bg-neutral-50/70 border border-neutral-200 text-xs flex items-center justify-between shrink-0">
              <span className="text-neutral-500 text-[11px]">
                No custom limitations set for {student.name}.
              </span>
              <button
                type="button"
                onClick={() => {
                  if (onEditLimitations) {
                    onEditLimitations(student);
                  } else {
                    setActiveTab('limitations');
                  }
                }}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
              >
                <SlidersHorizontal className="w-3 h-3" />
                <span>+ Add Limitations</span>
              </button>
            </div>
          )
        )}

        {/* Action Tabs */}
        <div className="flex border-b border-neutral-200 px-6 pt-2 bg-neutral-50/30 text-xs font-medium shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('move')}
            className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'move'
                ? 'border-neutral-900 text-neutral-900 font-semibold'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Move / Adjust Slot</span>
          </button>
          <button
            onClick={() => setActiveTab('swap')}
            className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'swap'
                ? 'border-neutral-900 text-neutral-900 font-semibold'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Swap Student</span>
          </button>
          <button
            onClick={() => setActiveTab('exception')}
            className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'exception'
                ? 'border-neutral-900 text-neutral-900 font-semibold'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Temporary Exception</span>
          </button>
          <button
            onClick={() => setActiveTab('limitations')}
            className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'limitations'
                ? 'border-neutral-900 text-neutral-900 font-semibold'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />
            <span>Limitations &amp; Rules</span>
            {totalRulesCount > 0 && (
              <span className="text-[10px] tabular-nums font-semibold px-1.5 py-0.2 rounded-full bg-neutral-200 text-neutral-700">
                {totalRulesCount}
              </span>
            )}
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'move' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Teaching Day
                  </label>
                  <select
                    value={targetDay}
                    onChange={(e) => setTargetDay(e.target.value as DayOfWeek)}
                    className="w-full text-xs border border-neutral-300 rounded-lg px-3 py-2 bg-white text-neutral-900 focus:outline-hidden focus:ring-1 focus:ring-neutral-400"
                  >
                    {school?.teachingDays.map((d) => (
                      <option key={d} value={d}>
                        {d} {d === student?.normalTeachingDay ? '(Normal Day)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={targetStartTime}
                    onChange={(e) => setTargetStartTime(e.target.value)}
                    className="w-full text-xs border border-neutral-300 rounded-lg px-3 py-2 bg-white text-neutral-900 tabular-nums focus:outline-hidden focus:ring-1 focus:ring-neutral-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Duration
                  </label>
                  <select
                    value={targetDuration}
                    onChange={(e) => setTargetDuration(parseInt(e.target.value, 10))}
                    className="w-full text-xs border border-neutral-300 rounded-lg px-3 py-2 bg-white text-neutral-900 tabular-nums focus:outline-hidden focus:ring-1 focus:ring-neutral-400"
                  >
                    <option value={20}>20 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>60 minutes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Calculated End Time
                  </label>
                  <div className="text-xs font-semibold px-3 py-2 border border-neutral-200 rounded-lg bg-neutral-50 text-neutral-800 tabular-nums">
                    {targetEndTime}
                  </div>
                </div>
              </div>

              {/* Validation Preview */}
              <div className="mt-4 pt-3 border-t border-neutral-100">
                <div className="text-xs font-semibold text-neutral-700 mb-2">
                  Validation at Proposed Time:
                </div>
                {validation.severity === 'valid' && (
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Free of clashes and restrictions!</span>
                  </div>
                )}

                {validation.severity === 'hard_violation' && (
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-rose-700">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>Clash Detected (Cannot Move Here):</span>
                    </div>
                    {validation.hardViolations.map((v, i) => (
                      <div key={i} className="pl-5 text-[11px] text-rose-800">
                        • {v}
                      </div>
                    ))}
                  </div>
                )}

                {validation.severity === 'soft_warning' && (
                  <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-amber-800">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Notice / Preference Warning:</span>
                    </div>
                    {validation.softWarnings.map((w, i) => (
                      <div key={i} className="pl-5 text-[11px] text-amber-800">
                        • {w}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'swap' && (
            <div className="space-y-4">
              <p className="text-xs text-neutral-600">
                Swap {student?.name}&apos;s slot ({slot.day} {slot.startTime}–{slot.endTime}) with another student at {school?.name}:
              </p>

              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {swapCandidates.length === 0 ? (
                  <div className="text-xs text-neutral-400 py-4 text-center">
                    No other scheduled students found at this school in this week cycle.
                  </div>
                ) : (
                  swapCandidates.map(({ slot: otherSlot, student: otherStu }) => {
                    const isSelected = swapTargetSlotId === otherSlot.id;
                    return (
                      <button
                        key={otherSlot.id}
                        type="button"
                        onClick={() => setSwapTargetSlotId(otherSlot.id)}
                        className={`w-full text-left p-3 rounded-lg border text-xs transition-colors flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'border-neutral-900 bg-neutral-50 ring-1 ring-neutral-900'
                            : 'border-neutral-200 hover:border-neutral-300'
                        }`}
                      >
                        <div>
                          <div className="font-semibold text-neutral-900">
                            {otherStu?.name} ({otherStu?.instrument})
                          </div>
                          <div className="text-neutral-500 tabular-nums mt-0.5">
                            {otherSlot.day} · {otherSlot.startTime}–{otherSlot.endTime} ({otherSlot.duration}m)
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-neutral-900" />}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {activeTab === 'exception' && (
            <div className="space-y-3">
              <p className="text-xs text-neutral-600">
                Record a one-off temporary exception (e.g. absence, trip, exam) without changing {student?.name}&apos;s permanent recurring timetable:
              </p>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Exception Type
                </label>
                <select
                  value={exceptionType}
                  onChange={(e) => setExceptionType(e.target.value as any)}
                  className="w-full text-xs border border-neutral-300 rounded-lg px-3 py-2 bg-white text-neutral-900"
                >
                  <option value="absence">Pupil Absence / Illness</option>
                  <option value="trip">School Trip / Excursion</option>
                  <option value="exam">Academic Exam / Test</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Reason / Notes
                </label>
                <input
                  type="text"
                  value={exceptionReason}
                  onChange={(e) => setExceptionReason(e.target.value)}
                  placeholder="e.g. Swimming gala, orthodontist appointment"
                  className="w-full text-xs border border-neutral-300 rounded-lg px-3 py-2 text-neutral-900"
                />
              </div>
            </div>
          )}

          {/* TAB 4: LIMITATIONS & AVAILABILITY RULES */}
          {activeTab === 'limitations' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setLimSubTab('allowed')}
                    className={`px-2.5 py-1 text-xs rounded-md font-semibold transition-colors cursor-pointer ${
                      limSubTab === 'allowed'
                        ? 'bg-emerald-100 text-emerald-900'
                        : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100'
                    }`}
                  >
                    Must Only / Can Only Do ({studentAllowedWindows.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setLimSubTab('blocked')}
                    className={`px-2.5 py-1 text-xs rounded-md font-semibold transition-colors cursor-pointer ${
                      limSubTab === 'blocked'
                        ? 'bg-rose-100 text-rose-900'
                        : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100'
                    }`}
                  >
                    Blocked Times ({studentRestrictions.length})
                  </button>
                </div>

                {onEditLimitations && student && (
                  <button
                    type="button"
                    onClick={() => onEditLimitations(student)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                    title="Open full dedicated modal"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Full Editor</span>
                  </button>
                )}
              </div>

              {/* Sub-tab 1: Allowed Windows ("Can only do") */}
              {limSubTab === 'allowed' && (
                <div className="space-y-3">
                  <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-xs text-emerald-950 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-semibold block text-emerald-900">
                        Strict Availability Windows
                      </strong>
                      Specify exact hours {student?.name} is allowed to have lessons (e.g.{' '}
                      <em>Leo can only do 9–10 on {labelA} and only 10–11 on {labelB}</em>).
                    </div>
                  </div>

                  {/* List of current allowed windows */}
                  {studentAllowedWindows.length === 0 ? (
                    <div className="p-3 rounded-lg border border-dashed border-neutral-200 text-center text-xs text-neutral-400 bg-neutral-50/50">
                      No specific windows set. Available throughout normal school hours.
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
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
                            className="flex items-center justify-between p-2 rounded-lg border border-emerald-200/80 bg-emerald-50/40 text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                {cycleText}
                              </span>
                              <span className="font-semibold text-neutral-900 tabular-nums">
                                {win.dayOfWeek}: {win.startTime}–{win.endTime}
                              </span>
                              {win.notes && (
                                <span className="text-neutral-500 text-[11px] truncate max-w-[120px]">
                                  ({win.notes})
                                </span>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeleteAllowedWindow(win.id)}
                              className="p-1 text-neutral-400 hover:text-rose-600 transition-colors cursor-pointer"
                              title="Delete window"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Add form */}
                  <form onSubmit={handleAddAllowedWindow} className="p-3 rounded-xl border border-neutral-200 bg-neutral-50/80 space-y-2.5">
                    <div className="text-xs font-bold text-neutral-800 flex items-center gap-1">
                      <Plus className="w-3.5 h-3.5 text-neutral-600" />
                      <span>Add &quot;Can Only Do&quot; Window</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-medium text-neutral-600 mb-0.5">
                          Cycle
                        </label>
                        <select
                          value={newAllowedWeek}
                          onChange={(e) => setNewAllowedWeek(e.target.value as WeekPattern)}
                          className="w-full bg-white border border-neutral-300 rounded px-2 py-1 text-xs text-neutral-900"
                        >
                          <option value="week_a">{labelA} only</option>
                          <option value="week_b">{labelB} only</option>
                          <option value="all">Both {labelA} &amp; {labelB}</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-neutral-600 mb-0.5">
                          Day
                        </label>
                        <select
                          value={newAllowedDay}
                          onChange={(e) => setNewAllowedDay(e.target.value as DayOfWeek)}
                          className="w-full bg-white border border-neutral-300 rounded px-2 py-1 text-xs text-neutral-900"
                        >
                          {DAYS_OF_WEEK.map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-medium text-neutral-600 mb-0.5">
                          From
                        </label>
                        <select
                          value={newAllowedStart}
                          onChange={(e) => setNewAllowedStart(e.target.value)}
                          className="w-full bg-white border border-neutral-300 rounded px-2 py-1 text-xs text-neutral-900 tabular-nums"
                        >
                          {timeOptions.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-neutral-600 mb-0.5">
                          To
                        </label>
                        <select
                          value={newAllowedEnd}
                          onChange={(e) => setNewAllowedEnd(e.target.value)}
                          className="w-full bg-white border border-neutral-300 rounded px-2 py-1 text-xs text-neutral-900 tabular-nums"
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
                      <input
                        type="text"
                        placeholder="Optional note (e.g. Free period, study hall)"
                        value={newAllowedNote}
                        onChange={(e) => setNewAllowedNote(e.target.value)}
                        className="w-full bg-white border border-neutral-300 rounded px-2.5 py-1 text-xs text-neutral-900"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-1.5 text-xs font-semibold rounded bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer shadow-xs"
                    >
                      Save Allowed Window
                    </button>
                  </form>
                </div>
              )}

              {/* Sub-tab 2: Blocked Times (e.g. Sports on Week B) */}
              {limSubTab === 'blocked' && (
                <div className="space-y-3">
                  <div className="p-3 bg-rose-50/70 border border-rose-200/80 rounded-xl text-xs text-rose-950 flex items-start gap-2">
                    <Ban className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-semibold block text-rose-900">
                        Blocked Times &amp; Sports Clashes
                      </strong>
                      Specify when {student?.name} is busy (e.g.{' '}
                      <em>John has sports at 9am to 10am on {labelB}</em>).
                    </div>
                  </div>

                  {/* List of current blocked times */}
                  {studentRestrictions.length === 0 ? (
                    <div className="p-3 rounded-lg border border-dashed border-neutral-200 text-center text-xs text-neutral-400 bg-neutral-50/50">
                      No blocked times set for {student?.name}.
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
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
                            className="flex items-center justify-between p-2 rounded-lg border border-rose-200/80 bg-rose-50/40 text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-rose-100 text-rose-800 border border-rose-300">
                                {cycleText}
                              </span>
                              <span className="font-semibold text-neutral-900 tabular-nums">
                                {r.dayOfWeek}: {r.startTime}–{r.endTime}
                              </span>
                              <span className="text-rose-700 font-medium text-[11px] truncate max-w-[120px]">
                                ({r.reason})
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeleteBlockedTime(r.id)}
                              className="p-1 text-neutral-400 hover:text-rose-600 transition-colors cursor-pointer"
                              title="Delete blocked time"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Add form */}
                  <form onSubmit={handleAddBlockedTime} className="p-3 rounded-xl border border-neutral-200 bg-neutral-50/80 space-y-2.5">
                    <div className="text-xs font-bold text-neutral-800 flex items-center gap-1">
                      <Plus className="w-3.5 h-3.5 text-neutral-600" />
                      <span>Add Blocked Time / Commitment</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-medium text-neutral-600 mb-0.5">
                          Reason / Activity
                        </label>
                        <input
                          type="text"
                          required
                          value={newBlockedReason}
                          onChange={(e) => setNewBlockedReason(e.target.value)}
                          placeholder="e.g. Sports, Swimming, PE"
                          className="w-full bg-white border border-neutral-300 rounded px-2 py-1 text-xs text-neutral-900"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-neutral-600 mb-0.5">
                          Cycle
                        </label>
                        <select
                          value={newBlockedWeek}
                          onChange={(e) => setNewBlockedWeek(e.target.value as WeekPattern)}
                          className="w-full bg-white border border-neutral-300 rounded px-2 py-1 text-xs text-neutral-900"
                        >
                          <option value="week_b">{labelB} only</option>
                          <option value="week_a">{labelA} only</option>
                          <option value="all">Both {labelA} &amp; {labelB}</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[11px] font-medium text-neutral-600 mb-0.5">
                          Day
                        </label>
                        <select
                          value={newBlockedDay}
                          onChange={(e) => setNewBlockedDay(e.target.value as DayOfWeek)}
                          className="w-full bg-white border border-neutral-300 rounded px-2 py-1 text-xs text-neutral-900"
                        >
                          {DAYS_OF_WEEK.map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-neutral-600 mb-0.5">
                          From
                        </label>
                        <select
                          value={newBlockedStart}
                          onChange={(e) => setNewBlockedStart(e.target.value)}
                          className="w-full bg-white border border-neutral-300 rounded px-2 py-1 text-xs text-neutral-900 tabular-nums"
                        >
                          {timeOptions.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-neutral-600 mb-0.5">
                          To
                        </label>
                        <select
                          value={newBlockedEnd}
                          onChange={(e) => setNewBlockedEnd(e.target.value)}
                          className="w-full bg-white border border-neutral-300 rounded px-2 py-1 text-xs text-neutral-900 tabular-nums"
                        >
                          {timeOptions.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-1.5 text-xs font-semibold rounded bg-rose-700 hover:bg-rose-800 text-white cursor-pointer shadow-xs"
                    >
                      Save Blocked Time
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-100 bg-neutral-50/50 shrink-0">
          <button
            type="button"
            onClick={() => {
              onDeleteSlot(slot.id);
              onClose();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-700 hover:text-rose-900 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Unschedule</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-900 bg-white border border-neutral-200 rounded-md hover:bg-neutral-50 cursor-pointer"
            >
              {activeTab === 'limitations' ? 'Done' : 'Cancel'}
            </button>

            {activeTab === 'move' && (
              <button
                type="button"
                onClick={handleApplyMove}
                disabled={validation.severity === 'hard_violation'}
                className={`px-4 py-1.5 text-xs font-semibold text-white rounded-md transition-all cursor-pointer ${
                  validation.severity === 'hard_violation'
                    ? 'bg-neutral-400 cursor-not-allowed'
                    : 'bg-neutral-900 hover:bg-neutral-800 shadow-xs'
                }`}
              >
                Apply Move
              </button>
            )}

            {activeTab === 'swap' && (
              <button
                type="button"
                onClick={handleApplySwap}
                disabled={!swapTargetSlotId}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-md disabled:bg-neutral-400 disabled:cursor-not-allowed shadow-xs cursor-pointer"
              >
                Confirm Swap
              </button>
            )}

            {activeTab === 'exception' && (
              <button
                type="button"
                onClick={handleApplyException}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-md shadow-xs cursor-pointer"
              >
                Save Exception
              </button>
            )}

            {activeTab === 'limitations' && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-md shadow-xs cursor-pointer"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

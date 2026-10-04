import React, { useState, useMemo } from 'react';
import {
  DayOfWeek,
  WeekCycle,
  School,
  Student,
  TimetableSlot,
} from '../../types';
import { ValidationContext, validateSlot } from '../../utils/constraintChecker';
import { addMinutes } from '../../utils/timeUtils';
import { X, Check, AlertTriangle, AlertCircle, Plus } from 'lucide-react';
import { getSchoolTheme } from '../../utils/themeUtils';

interface AddLessonModalProps {
  initialDay?: DayOfWeek;
  initialStartTime?: string;
  initialSchoolId?: string;
  weekCycle: WeekCycle;
  context: ValidationContext;
  onClose: () => void;
  onAddSlot: (slot: TimetableSlot) => void;
}

export const AddLessonModal: React.FC<AddLessonModalProps> = ({
  initialDay,
  initialStartTime,
  initialSchoolId,
  weekCycle,
  context,
  onClose,
  onAddSlot,
}) => {
  const defaultSchool = context.schools.find((s) => s.id === initialSchoolId) || context.schools[0];
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>(defaultSchool?.id || '');

  const school = context.schools.find((s) => s.id === selectedSchoolId) || context.schools[0];

  const defaultDay = initialDay && school?.teachingDays.includes(initialDay)
    ? initialDay
    : school?.teachingDays[0] || 'Monday';

  const [day, setDay] = useState<DayOfWeek>(defaultDay);
  const [startTime, setStartTime] = useState<string>(initialStartTime || '09:00');
  const [duration, setDuration] = useState<number>(30);

  // Filter students from this school
  const schoolStudents = useMemo(() => {
    return context.students.filter((s) => s.schoolId === selectedSchoolId);
  }, [context.students, selectedSchoolId]);

  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    schoolStudents[0]?.id || ''
  );

  const selectedStudent = context.students.find((s) => s.id === selectedStudentId);

  const endTime = useMemo(() => {
    return addMinutes(startTime, duration);
  }, [startTime, duration]);

  const validation = useMemo(() => {
    if (!selectedStudent || !school) {
      return { valid: false, severity: 'hard_violation' as const, hardViolations: ['Please select a student.'], softWarnings: [] };
    }
    return validateSlot(
      selectedStudent.id,
      school.id,
      day,
      startTime,
      endTime,
      weekCycle,
      context
    );
  }, [selectedStudent, school, day, startTime, endTime, weekCycle, context]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !school) return;

    const newSlot: TimetableSlot = {
      id: `slot_${weekCycle}_${selectedStudent.id}_${Date.now()}`,
      weekCycle,
      schoolId: school.id,
      studentId: selectedStudent.id,
      day,
      startTime,
      endTime,
      duration,
      isManualOverride: true,
    };

    onAddSlot(newSlot);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl border border-neutral-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {(() => {
          const schoolTheme = getSchoolTheme(school?.colorTheme);
          return (
            <div className={`flex items-center justify-between px-6 py-4 border-b border-neutral-200/80 transition-colors ${schoolTheme.headerBg}`}>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${schoolTheme.dotColor}`} />
                  <h3 className="text-base font-bold text-neutral-900">
                    Schedule Music Lesson
                  </h3>
                  <span className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md border ${schoolTheme.softBadge}`}>
                    Week {weekCycle}
                  </span>
                </div>
                <p className="text-xs text-neutral-600 mt-0.5 font-medium">
                  {school?.name} · {day}
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              School
            </label>
            <select
              value={selectedSchoolId}
              onChange={(e) => {
                setSelectedSchoolId(e.target.value);
                const newSchool = context.schools.find((s) => s.id === e.target.value);
                if (newSchool && !newSchool.teachingDays.includes(day)) {
                  setDay(newSchool.teachingDays[0] || 'Monday');
                }
              }}
              className="w-full text-xs border border-neutral-300 rounded-lg px-3 py-2 bg-white text-neutral-900"
            >
              {context.schools.map((sc) => (
                <option key={sc.id} value={sc.id}>
                  {sc.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              Student
            </label>
            <select
              value={selectedStudentId}
              onChange={(e) => {
                setSelectedStudentId(e.target.value);
                const stu = context.students.find((s) => s.id === e.target.value);
                if (stu) {
                  setDuration(stu.lessonDuration || 30);
                  if (school?.teachingDays.includes(stu.normalTeachingDay)) {
                    setDay(stu.normalTeachingDay);
                  }
                }
              }}
              className="w-full text-xs border border-neutral-300 rounded-lg px-3 py-2 bg-white text-neutral-900"
            >
              {schoolStudents.map((stu) => {
                const isScheduledThisWeek = context.timetableSlots.some(
                  (s) => s.weekCycle === weekCycle && s.studentId === stu.id
                );
                return (
                  <option key={stu.id} value={stu.id}>
                    {stu.name} · {stu.instrument} ({stu.normalTeachingDay}
                    {isScheduledThisWeek ? ' - Already Scheduled' : ''})
                  </option>
                );
              })}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Day
              </label>
              <select
                value={day}
                onChange={(e) => setDay(e.target.value as DayOfWeek)}
                className="w-full text-xs border border-neutral-300 rounded-lg px-3 py-2 bg-white text-neutral-900"
              >
                {school?.teachingDays.map((d) => (
                  <option key={d} value={d}>
                    {d}
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
                value={startTime}
                step="300"
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full text-xs border border-neutral-300 rounded-lg px-3 py-2 bg-white text-neutral-900 font-mono tabular-nums"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Duration (min)
              </label>
              <div className="grid grid-cols-4 gap-1">
                {[20, 30, 45, 60].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDuration(d)}
                    className={`py-1.5 text-xs font-medium rounded border ${
                      duration === d
                        ? 'bg-neutral-900 text-white border-neutral-900'
                        : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                End Time
              </label>
              <div className="text-xs font-mono tabular-nums bg-neutral-100 border border-neutral-200 rounded-lg px-3 py-2 text-neutral-700">
                {endTime}
              </div>
            </div>
          </div>

          {/* Validation Feedback */}
          <div className="pt-2">
            {validation.severity === 'valid' && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Valid slot: No clashes or restrictions.</span>
              </div>
            )}
            {validation.severity === 'soft_warning' && (
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold">Soft warning:</div>
                  <div className="text-amber-800 text-[11px]">{validation.softWarnings[0]}</div>
                </div>
              </div>
            )}
            {validation.severity === 'hard_violation' && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-900 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold">Hard violation:</div>
                  <div className="text-rose-800 text-[11px]">{validation.hardViolations[0]}</div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-900 bg-white border border-neutral-200 rounded-md hover:bg-neutral-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={validation.severity === 'hard_violation'}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-md disabled:bg-neutral-400 disabled:cursor-not-allowed shadow-xs"
            >
              Add Lesson
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

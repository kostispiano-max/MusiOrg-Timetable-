import React, { useMemo } from 'react';
import { ValidationContext, validateSlot } from '../../utils/constraintChecker';
import { WeekCycle, CycleTerminology, DayOfWeek, DAYS_OF_WEEK } from '../../types';
import { formatTimeRange } from '../../utils/timeUtils';
import { Calendar, AlertCircle, AlertTriangle, Wand2, ArrowRight, Clock, School, Users, CheckCircle2 } from 'lucide-react';
import { getSchoolTheme } from '../../utils/themeUtils';

interface DashboardProps {
  context: ValidationContext;
  activeCycle: WeekCycle;
  cycleTerminology: CycleTerminology;
  onNavigateToTimetable: (schoolId?: string, day?: DayOfWeek) => void;
  onOpenOptimizer: () => void;
  onOpenConflicts: () => void;
  onUpdateSchools?: (schools: any[]) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  context,
  activeCycle,
  cycleTerminology,
  onNavigateToTimetable,
  onOpenOptimizer,
  onOpenConflicts,
  onUpdateSchools,
}) => {
  const weekLabel = cycleTerminology === 'week_12'
    ? (activeCycle === 'A' ? 'Week 1' : 'Week 2')
    : `Week ${activeCycle}`;

  const handleToggleSchoolCycle = (schoolId: string) => {
    if (!onUpdateSchools) return;
    const updated = context.schools.map((sc) => {
      if (sc.id === schoolId) {
        return {
          ...sc,
          currentWeekCycle: (sc.currentWeekCycle === 'A' ? 'B' : 'A') as WeekCycle,
        };
      }
      return sc;
    });
    onUpdateSchools(updated);
  };

  // Analyze all current slots in activeCycle for issues
  const analysis = useMemo(() => {
    const hardIssues: { slotId: string; studentName: string; day: DayOfWeek; error: string }[] = [];
    const softIssues: { slotId: string; studentName: string; day: DayOfWeek; warning: string }[] = [];

    const activeSlots = context.timetableSlots.filter((s) => s.weekCycle === activeCycle);

    for (const slot of activeSlots) {
      const student = context.students.find((s) => s.id === slot.studentId);
      const res = validateSlot(
        slot.studentId,
        slot.schoolId,
        slot.day,
        slot.startTime,
        slot.endTime,
        activeCycle,
        context,
        slot.id
      );

      if (res.hardViolations.length > 0) {
        hardIssues.push({
          slotId: slot.id,
          studentName: student?.name || 'Student',
          day: slot.day,
          error: res.hardViolations[0],
        });
      } else if (res.softWarnings.length > 0) {
        softIssues.push({
          slotId: slot.id,
          studentName: student?.name || 'Student',
          day: slot.day,
          warning: res.softWarnings[0],
        });
      }
    }

    // Check unscheduled students
    const unscheduled = context.students.filter((st) => {
      if (st.frequency === 'week_a_only' && activeCycle !== 'A') return false;
      if (st.frequency === 'week_b_only' && activeCycle !== 'B') return false;
      return !activeSlots.some((s) => s.studentId === st.id);
    });

    return {
      hardIssues,
      softIssues,
      unscheduled,
      activeSlotCount: activeSlots.length,
    };
  }, [context, activeCycle]);

  // Statistics for Week A vs Week B
  const weekAStats = useMemo(() => {
    const slots = context.timetableSlots.filter((s) => s.weekCycle === 'A');
    const totalMin = slots.reduce((acc, s) => acc + s.duration, 0);
    return { count: slots.length, hours: (totalMin / 60).toFixed(1) };
  }, [context.timetableSlots]);

  const weekBStats = useMemo(() => {
    const slots = context.timetableSlots.filter((s) => s.weekCycle === 'B');
    const totalMin = slots.reduce((acc, s) => acc + s.duration, 0);
    return { count: slots.length, hours: (totalMin / 60).toFixed(1) };
  }, [context.timetableSlots]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900">
            Timetable Overview & Health
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Active view: <span className="font-semibold text-neutral-900">{weekLabel}</span> · Coordinated peripatetic teaching schedule
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateToTimetable()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
          >
            <span>Open Timetable</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onOpenOptimizer}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors shadow-xs"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Optimise Timetable</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs space-y-1">
          <div className="text-xs font-medium text-neutral-500 flex items-center justify-between">
            <span>Scheduled Lessons</span>
            <Users className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-neutral-900 tabular-nums">
            {analysis.activeSlotCount}
          </div>
          <div className="text-[11px] text-neutral-500">
            Across {context.schools.length} partner schools
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs space-y-1">
          <div className="text-xs font-medium text-neutral-500 flex items-center justify-between">
            <span>Two-Week Coordination</span>
            <Clock className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-sm font-semibold text-neutral-900 mt-2 flex items-center gap-3 tabular-nums">
            <span>Week A: <strong>{weekAStats.count}</strong> ({weekAStats.hours}h)</span>
            <span className="text-neutral-300">|</span>
            <span>Week B: <strong>{weekBStats.count}</strong> ({weekBStats.hours}h)</span>
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">
            Global cycle synchronised across all schools
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs space-y-1">
          <div className="text-xs font-medium text-neutral-500 flex items-center justify-between">
            <span>Timetable Conflicts</span>
            {analysis.hardIssues.length > 0 ? (
              <AlertCircle className="w-4 h-4 text-rose-500" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            )}
          </div>
          <div className={`text-2xl font-bold tracking-tight tabular-nums ${analysis.hardIssues.length > 0 ? 'text-rose-600' : 'text-neutral-900'}`}>
            {analysis.hardIssues.length}
          </div>
          <div className="text-[11px] text-neutral-500">
            {analysis.hardIssues.length > 0
              ? 'Hard violations requiring adjustment'
              : 'Zero clashing lessons or restrictions'}
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs space-y-1">
          <div className="text-xs font-medium text-neutral-500 flex items-center justify-between">
            <span>Preference Warnings</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-neutral-900 tabular-nums">
            {analysis.softIssues.length}
          </div>
          <div className="text-[11px] text-neutral-500">
            Off-normal day or off-preference slots
          </div>
        </div>
      </div>

      {/* Main Content: Schools Grid & Attention Items */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: School Schedule Breakdowns */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-neutral-900">
              Teaching Allocations by School
            </h2>
            <span className="text-xs text-neutral-400">
              {weekLabel} teaching assignments
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {context.schools.map((school) => {
              const effectiveCycle = school.currentWeekCycle || 'A';
              const schoolSlots = context.timetableSlots.filter(
                (s) => s.schoolId === school.id && s.weekCycle === effectiveCycle
              );
              const studentCount = new Set(schoolSlots.map((s) => s.studentId)).size;
              const term = school.cycleTerminology || 'week_ab';
              const cycleLabel = term === 'week_12'
                ? (effectiveCycle === 'A' ? 'Week 1' : 'Week 2')
                : `Week ${effectiveCycle}`;
              const schoolTheme = getSchoolTheme(school.colorTheme);

              return (
                <div
                  key={school.id}
                  className={`rounded-xl border p-5 shadow-2xs space-y-3 transition-all ${schoolTheme.cardSection} hover:shadow-xs`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2.5 h-2.5 rounded-full ${schoolTheme.dotColor}`} />
                        <h3 className="font-semibold text-sm text-neutral-900">
                          {school.name}
                        </h3>
                      </div>
                      <div className="text-xs text-neutral-600 mt-1 flex items-center gap-1">
                        <span>Teaching:</span>
                        <span className="font-semibold text-neutral-800">{school.teachingDays.join(', ')}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleToggleSchoolCycle(school.id)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white hover:bg-neutral-900 hover:text-white border border-neutral-200 text-[11px] font-mono font-semibold transition-colors shadow-2xs cursor-pointer"
                        title="Click to flip this school's active week"
                      >
                        <span>{cycleLabel}</span>
                      </button>
                      <button
                        onClick={() => onNavigateToTimetable(school.id)}
                        className="text-xs text-neutral-500 hover:text-neutral-900 p-1 cursor-pointer"
                        title="View school timetable"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {school.cycleNotes && (
                    <div className="text-[11px] text-amber-800 bg-amber-50/80 px-2 py-1 rounded border border-amber-200/60 font-medium">
                      {school.cycleNotes}
                    </div>
                  )}

                  <div className="pt-2 border-t border-neutral-900/10 flex items-center justify-between text-xs">
                    <span className="text-neutral-700 font-mono tabular-nums">
                      <strong>{schoolSlots.length}</strong> lessons ({cycleLabel})
                    </span>
                    <span className="text-neutral-500 font-medium">
                      {studentCount} students
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {school.teachingDays.map((d) => {
                      const countOnDay = schoolSlots.filter((s) => s.day === d).length;
                      return (
                        <span
                          key={d}
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${schoolTheme.softBadge}`}
                        >
                          {d.slice(0, 3)}: {countOnDay}
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Attention Items & Exceptions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-neutral-900">
              Action Items & Exceptions
            </h2>
            {analysis.hardIssues.length > 0 && (
              <button
                onClick={onOpenConflicts}
                className="text-xs text-rose-600 font-semibold hover:underline"
              >
                Resolve Clashes
              </button>
            )}
          </div>

          <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs space-y-3">
            {analysis.hardIssues.length === 0 && analysis.unscheduled.length === 0 && context.temporaryExceptions.length === 0 ? (
              <div className="text-center py-6 text-xs text-neutral-400">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1.5" />
                <span>Everything is running smoothly!</span>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Hard issues */}
                {analysis.hardIssues.map((issue) => (
                  <div
                    key={issue.slotId}
                    className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-1"
                  >
                    <div className="font-semibold flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <span>{issue.studentName} ({issue.day})</span>
                    </div>
                    <div className="text-[11px] text-rose-800">{issue.error}</div>
                  </div>
                ))}

                {/* Temporary exceptions */}
                {context.temporaryExceptions.map((ex) => (
                  <div
                    key={ex.id}
                    className="p-3 rounded-lg bg-neutral-50 border border-neutral-200 text-xs text-neutral-800 space-y-1"
                  >
                    <div className="font-semibold flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                      <span>{ex.title}</span>
                    </div>
                    <div className="text-[11px] text-neutral-600">
                      {ex.reason} · Week {ex.weekCycle} ({ex.day})
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

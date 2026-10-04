import React, { useRef } from 'react';
import { ValidationContext } from '../../utils/constraintChecker';
import { WeekCycle, CycleTerminology, DayOfWeek, DAYS_OF_WEEK } from '../../types';
import { formatTimeRange } from '../../utils/timeUtils';
import { Printer, Download, X } from 'lucide-react';

interface PrintTimetableModalProps {
  context: ValidationContext;
  activeCycle: WeekCycle;
  cycleTerminology: CycleTerminology;
  onClose: () => void;
}

export const PrintTimetableModal: React.FC<PrintTimetableModalProps> = ({
  context,
  activeCycle,
  cycleTerminology,
  onClose,
}) => {
  const [selectedSchoolId, setSelectedSchoolId] = React.useState<string>('all');
  const [printCycleMode, setPrintCycleMode] = React.useState<'active_schools' | 'force_a' | 'force_b'>('active_schools');
  const printAreaRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(context, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `musiorg_timetable_${activeCycle}_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Filter schools to display
  const schoolsToPrint =
    selectedSchoolId === 'all'
      ? context.schools
      : context.schools.filter((s) => s.id === selectedSchoolId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-neutral-300 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header toolbar (Hidden during print) */}
        <div className="no-print flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-neutral-200 bg-neutral-50">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-base font-semibold text-neutral-900">
              Print / Export Timetable
            </h3>
            <select
              value={selectedSchoolId}
              onChange={(e) => setSelectedSchoolId(e.target.value)}
              className="text-xs border border-neutral-300 rounded px-2.5 py-1 bg-white text-neutral-800"
            >
              <option value="all">All Schools Combined</option>
              {context.schools.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            <select
              value={printCycleMode}
              onChange={(e) => setPrintCycleMode(e.target.value as any)}
              className="text-xs border border-neutral-300 rounded px-2.5 py-1 bg-white text-neutral-800"
            >
              <option value="active_schools">Independent Active School Cycles</option>
              <option value="force_a">Force All Week A / 1</option>
              <option value="force_b">Force All Week B / 2</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJSON}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md hover:bg-neutral-100 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-neutral-900 rounded-md hover:bg-neutral-800 transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Page</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-neutral-400 hover:text-neutral-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Canvas */}
        <div ref={printAreaRef} className="print-page p-8 overflow-y-auto flex-1 bg-white text-neutral-900 font-sans">
          {/* Print Header */}
          <div className="border-b-2 border-neutral-900 pb-4 mb-6 flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
                Instrumental Music Timetable
              </h1>
              <div className="text-xs text-neutral-600 mt-1 flex flex-wrap items-center gap-2">
                <span>Teacher: {context.teacherProfile.name}</span>
                <span>·</span>
                <span className="font-semibold text-neutral-900">
                  {printCycleMode === 'active_schools' ? 'Active School Term Schedule' : printCycleMode === 'force_a' ? 'Week A / 1 Schedule' : 'Week B / 2 Schedule'}
                </span>
                <span>·</span>
                <span>Term Schedule</span>
              </div>
            </div>
            <div className="text-right text-xs text-neutral-500 font-mono">
              <div>MusiOrg Timetable</div>
              <div>Door & Office Copy</div>
            </div>
          </div>

          {/* School Schedule Sections */}
          <div className="space-y-8">
            {schoolsToPrint.map((school) => {
              const effectiveCycle = printCycleMode === 'force_a' ? 'A' : printCycleMode === 'force_b' ? 'B' : (school.currentWeekCycle || 'A');
              const term = school.cycleTerminology || 'week_ab';
              const schoolCycleLabel = term === 'week_12' ? (effectiveCycle === 'A' ? 'Week 1' : 'Week 2') : `Week ${effectiveCycle}`;

              // Get slots for this school and its effective cycle
              const schoolSlots = context.timetableSlots.filter(
                (s) => s.schoolId === school.id && s.weekCycle === effectiveCycle
              );

              return (
                <div key={school.id} className="print-break-inside-avoid space-y-3">
                  <div className="flex items-center justify-between border-b border-neutral-300 pb-1">
                    <div>
                      <h2 className="text-base font-bold text-neutral-900">
                        {school.name}
                      </h2>
                      {school.cycleNotes && (
                        <div className="text-[11px] text-neutral-500 italic">
                          Cycle Note: {school.cycleNotes}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-300">
                        {schoolCycleLabel}
                      </span>
                      <div className="text-[11px] text-neutral-600 mt-0.5">
                        Teaching: {school.teachingDays.join(', ')}
                      </div>
                    </div>
                  </div>

                  {/* Day tables */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {school.teachingDays.map((day) => {
                      const daySlots = schoolSlots
                        .filter((s) => s.day === day)
                        .sort((a, b) => a.startTime.localeCompare(b.startTime));

                      const dayBreaks = school.breaks
                        .filter((b) => b.day === day)
                        .sort((a, b) => a.startTime.localeCompare(b.startTime));

                      // Merge lessons and breaks into a unified chronological agenda
                      type AgendaItem =
                        | { type: 'lesson'; slot: typeof daySlots[0] }
                        | { type: 'break'; brk: typeof dayBreaks[0] };

                      const agenda: AgendaItem[] = [
                        ...daySlots.map((slot) => ({ type: 'lesson' as const, slot })),
                        ...dayBreaks.map((brk) => ({ type: 'break' as const, brk })),
                      ].sort((a, b) => {
                        const timeA = a.type === 'lesson' ? a.slot.startTime : a.brk.startTime;
                        const timeB = b.type === 'lesson' ? b.slot.startTime : b.brk.startTime;
                        return timeA.localeCompare(timeB);
                      });

                      return (
                        <div key={day} className="border border-neutral-300 rounded overflow-hidden">
                          <div className="bg-neutral-100 px-3 py-1.5 text-xs font-bold text-neutral-900 border-b border-neutral-300 flex justify-between">
                            <span>{day}</span>
                            <span className="font-normal text-neutral-600 font-mono">
                              {school.dayHours[day]?.startTime}–{school.dayHours[day]?.endTime}
                            </span>
                          </div>

                          <table className="w-full text-xs text-left">
                            <thead className="bg-neutral-50 text-neutral-500 font-medium border-b border-neutral-200">
                              <tr>
                                <th className="px-3 py-1 font-mono text-[11px]">Time</th>
                                <th className="px-3 py-1">Student</th>
                                <th className="px-3 py-1">Instrument</th>
                                <th className="px-3 py-1">Year</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200">
                              {agenda.length === 0 ? (
                                <tr>
                                  <td colSpan={4} className="px-3 py-3 text-center text-neutral-400 italic">
                                    No lessons scheduled
                                  </td>
                                </tr>
                              ) : (
                                agenda.map((item, idx) => {
                                  if (item.type === 'break') {
                                    return (
                                      <tr key={`brk_${idx}`} className="bg-neutral-50 font-medium text-neutral-600">
                                        <td className="px-3 py-1 font-mono text-[11px]">
                                          {formatTimeRange(item.brk.startTime, item.brk.endTime)}
                                        </td>
                                        <td colSpan={3} className="px-3 py-1 italic">
                                          {item.brk.title}
                                        </td>
                                      </tr>
                                    );
                                  }

                                  const student = context.students.find((s) => s.id === item.slot.studentId);
                                  const yg = context.yearGroups.find((y) => y.id === student?.yearGroupId);
                                  const sg = context.subgroups.find((s) => s.id === student?.subgroupId);

                                  return (
                                    <tr key={item.slot.id} className="hover:bg-neutral-50">
                                      <td className="px-3 py-1.5 font-mono text-neutral-700 font-medium">
                                        {formatTimeRange(item.slot.startTime, item.slot.endTime)}
                                      </td>
                                      <td className="px-3 py-1.5 font-semibold text-neutral-900">
                                        {student?.name || 'Student'}
                                      </td>
                                      <td className="px-3 py-1.5 text-neutral-600">
                                        {student?.instrument}
                                      </td>
                                      <td className="px-3 py-1.5 text-neutral-600">
                                        {yg?.name}
                                        {sg ? `.${sg.name.split('.').pop()}` : ''}
                                      </td>
                                    </tr>
                                  );
                                })
                              )}
                            </tbody>
                          </table>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Print Footer note */}
          <div className="mt-8 pt-4 border-t border-neutral-300 text-[11px] text-neutral-500 flex justify-between">
            <span>Please report any attendance issues or clashing school events in advance.</span>
            <span>Generated via MusiOrg Timetable</span>
          </div>
        </div>
      </div>
    </div>
  );
};

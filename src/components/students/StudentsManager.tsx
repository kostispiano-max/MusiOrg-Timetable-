import React, { useState, useMemo } from 'react';
import {
  Student,
  School,
  YearGroup,
  YearSubgroup,
  TimetableSlot,
  Restriction,
  DayOfWeek,
  LessonFrequency,
  PreferredTimeOfDay,
  DAYS_OF_WEEK,
} from '../../types';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Clock,
  Ban,
  CheckCircle2,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react';
import { formatTimeRange } from '../../utils/timeUtils';
import { getSchoolTheme } from '../../utils/themeUtils';
import { StudentLimitationsModal } from './StudentLimitationsModal';

interface StudentsManagerProps {
  students: Student[];
  schools: School[];
  yearGroups: YearGroup[];
  subgroups: YearSubgroup[];
  timetableSlots: TimetableSlot[];
  restrictions: Restriction[];
  onUpdateStudents: (students: Student[]) => void;
  onUpdateSlots: (slots: TimetableSlot[]) => void;
  onUpdateRestrictions: (restrictions: Restriction[]) => void;
}

export const StudentsManager: React.FC<StudentsManagerProps> = ({
  students,
  schools,
  yearGroups,
  subgroups,
  timetableSlots,
  restrictions,
  onUpdateStudents,
  onUpdateSlots,
  onUpdateRestrictions,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [schoolFilter, setSchoolFilter] = useState<string>('all');
  const [instrumentFilter, setInstrumentFilter] = useState<string>('all');
  const [limitationFilter, setLimitationFilter] = useState<'all' | 'restricted' | 'standard'>('all');

  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isNewStudent, setIsNewStudent] = useState<boolean>(false);

  // Dedicated modal for editing student's specific time limitations / allowed windows
  const [limitationsStudent, setLimitationsStudent] = useState<Student | null>(null);

  // Form states
  const [formName, setFormName] = useState<string>('');
  const [formSchoolId, setFormSchoolId] = useState<string>(schools[0]?.id || '');
  const [formYearGroupId, setFormYearGroupId] = useState<string>('');
  const [formSubgroupId, setFormSubgroupId] = useState<string>('');
  const [formInstrument, setFormInstrument] = useState<string>('Piano');
  const [formDuration, setFormDuration] = useState<number>(30);
  const [formNormalDay, setFormNormalDay] = useState<DayOfWeek>('Monday');
  const [formFrequency, setFormFrequency] = useState<LessonFrequency>('weekly');
  const [formPreferredTime, setFormPreferredTime] = useState<PreferredTimeOfDay>('any');
  const [formNotes, setFormNotes] = useState<string>('');

  // Instruments list
  const availableInstruments = useMemo(() => {
    const list = Array.from(new Set(students.map((s) => s.instrument))).filter(Boolean);
    return list.sort();
  }, [students]);

  // Filtered students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      if (schoolFilter !== 'all' && s.schoolId !== schoolFilter) return false;
      if (instrumentFilter !== 'all' && s.instrument !== instrumentFilter) return false;

      const hasAllowed = (s.allowedWindows || []).length > 0;
      const hasRestrictions = restrictions.some(
        (r) => r.scope === 'student' && r.targetId === s.id
      );
      const isRestricted = hasAllowed || hasRestrictions;

      if (limitationFilter === 'restricted' && !isRestricted) return false;
      if (limitationFilter === 'standard' && isRestricted) return false;

      if (searchTerm.trim() !== '') {
        const q = searchTerm.toLowerCase();
        return (
          s.name.toLowerCase().includes(q) ||
          s.instrument.toLowerCase().includes(q) ||
          s.normalTeachingDay.toLowerCase().includes(q) ||
          (s.notes || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [students, schoolFilter, instrumentFilter, limitationFilter, searchTerm, restrictions]);

  const openAddModal = () => {
    const initialSchool = schools[0];
    const initialYears = yearGroups.filter((yg) => yg.schoolId === initialSchool?.id);
    const initialSubgroups = subgroups.filter((sg) => sg.yearGroupId === initialYears[0]?.id);

    setIsNewStudent(true);
    setFormName('');
    setFormSchoolId(initialSchool?.id || '');
    setFormYearGroupId(initialYears[0]?.id || '');
    setFormSubgroupId(initialSubgroups[0]?.id || '');
    setFormInstrument('Piano');
    setFormDuration(30);
    setFormNormalDay(initialSchool?.teachingDays[0] || 'Monday');
    setFormFrequency('weekly');
    setFormPreferredTime('any');
    setFormNotes('');
    setEditingStudent({} as any);
  };

  const openEditModal = (stu: Student) => {
    setIsNewStudent(false);
    setFormName(stu.name);
    setFormSchoolId(stu.schoolId);
    setFormYearGroupId(stu.yearGroupId);
    setFormSubgroupId(stu.subgroupId || '');
    setFormInstrument(stu.instrument);
    setFormDuration(stu.lessonDuration);
    setFormNormalDay(stu.normalTeachingDay);
    setFormFrequency(stu.frequency);
    setFormPreferredTime(stu.preferredTime || 'any');
    setFormNotes(stu.notes || '');
    setEditingStudent(stu);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName) return;

    if (isNewStudent) {
      const newStu: Student = {
        id: `stu_${Date.now()}`,
        schoolId: formSchoolId,
        yearGroupId: formYearGroupId,
        subgroupId: formSubgroupId || undefined,
        name: formName,
        instrument: formInstrument,
        lessonDuration: formDuration,
        normalTeachingDay: formNormalDay,
        frequency: formFrequency,
        preferredTime: formPreferredTime,
        notes: formNotes,
        allowedWindows: [],
      };
      onUpdateStudents([...students, newStu]);
    } else if (editingStudent) {
      const updatedList = students.map((s) => {
        if (s.id === editingStudent.id) {
          return {
            ...s,
            name: formName,
            schoolId: formSchoolId,
            yearGroupId: formYearGroupId,
            subgroupId: formSubgroupId || undefined,
            instrument: formInstrument,
            lessonDuration: formDuration,
            normalTeachingDay: formNormalDay,
            frequency: formFrequency,
            preferredTime: formPreferredTime,
            notes: formNotes,
          };
        }
        return s;
      });
      onUpdateStudents(updatedList);
    }
    setEditingStudent(null);
  };

  const handleDeleteStudent = (id: string) => {
    if (confirm('Are you sure you want to remove this student and their timetable slots?')) {
      onUpdateStudents(students.filter((s) => s.id !== id));
      onUpdateSlots(timetableSlots.filter((s) => s.studentId !== id));
      onUpdateRestrictions(restrictions.filter((r) => r.targetId !== id));
    }
  };

  const handleUpdateSingleStudent = (updatedStudent: Student) => {
    const updatedList = students.map((s) => (s.id === updatedStudent.id ? updatedStudent : s));
    onUpdateStudents(updatedList);
    if (limitationsStudent && limitationsStudent.id === updatedStudent.id) {
      setLimitationsStudent(updatedStudent);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header & Search/Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900">
            Student Directory &amp; Timetable Limitations
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Manage instruments, timetable restrictions (sports, swimming, specialist lessons), and &quot;must only do&quot; availability windows in Week A/1 &amp; Week B/2.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const target = students.find((s) => (s.allowedWindows || []).length > 0) || students[0];
              if (target) setLimitationsStudent(target);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-neutral-800 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors shadow-2xs cursor-pointer"
            title="Configure student timetable limitations & specific availability"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />
            <span>Manage Limitations</span>
          </button>

          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-neutral-200 shadow-2xs">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search box */}
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search student, instrument, day..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-1.5 border border-neutral-200 rounded-lg bg-neutral-50/50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-neutral-400"
            />
          </div>

          {/* School filter */}
          <select
            value={schoolFilter}
            onChange={(e) => setSchoolFilter(e.target.value)}
            className="text-xs border border-neutral-200 rounded-lg px-3 py-1.5 bg-white text-neutral-800 font-medium"
          >
            <option value="all">All Schools</option>
            {schools.map((sc) => (
              <option key={sc.id} value={sc.id}>
                {sc.name}
              </option>
            ))}
          </select>

          {/* Instrument filter */}
          <select
            value={instrumentFilter}
            onChange={(e) => setInstrumentFilter(e.target.value)}
            className="text-xs border border-neutral-200 rounded-lg px-3 py-1.5 bg-white text-neutral-800 font-medium"
          >
            <option value="all">All Instruments</option>
            {availableInstruments.map((inst) => (
              <option key={inst} value={inst}>
                {inst}
              </option>
            ))}
          </select>

          {/* Limitations filter */}
          <select
            value={limitationFilter}
            onChange={(e) => setLimitationFilter(e.target.value as any)}
            className="text-xs border border-neutral-200 rounded-lg px-3 py-1.5 bg-white text-neutral-800 font-medium"
          >
            <option value="all">All Availability Types</option>
            <option value="restricted">With Limitations / Specific Windows</option>
            <option value="standard">Standard Availability Only</option>
          </select>
        </div>

        <div className="text-xs text-neutral-500 font-medium tabular-nums">
          Showing {filteredStudents.length} of {students.length} students
        </div>
      </div>

      {/* Students Data Grid */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-neutral-50/80 text-neutral-500 font-semibold border-b border-neutral-200">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">School</th>
                <th className="py-3 px-4">Year / Subgroup</th>
                <th className="py-3 px-4">Instrument</th>
                <th className="py-3 px-4">Normal Day</th>
                <th className="py-3 px-4">Timetable Limitations &amp; Windows</th>
                <th className="py-3 px-4">Current Slots</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-neutral-400 italic">
                    No matching students found.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((stu) => {
                  const school = schools.find((s) => s.id === stu.schoolId);
                  const schoolTheme = getSchoolTheme(school?.colorTheme);
                  const yg = yearGroups.find((y) => y.id === stu.yearGroupId);
                  const sg = subgroups.find((s) => s.id === stu.subgroupId);

                  const slotA = timetableSlots.find(
                    (s) => s.weekCycle === 'A' && s.studentId === stu.id
                  );
                  const slotB = timetableSlots.find(
                    (s) => s.weekCycle === 'B' && s.studentId === stu.id
                  );

                  // Student limitations & allowed windows
                  const stuRestrictions = restrictions.filter(
                    (r) => r.scope === 'student' && r.targetId === stu.id
                  );
                  const stuWindows = stu.allowedWindows || [];
                  const hasLimitations = stuRestrictions.length > 0 || stuWindows.length > 0;

                  const cycleTerminology = school?.cycleTerminology || 'week_ab';
                  const labelA = cycleTerminology === 'week_12' ? 'Wk 1' : 'Wk A';
                  const labelB = cycleTerminology === 'week_12' ? 'Wk 2' : 'Wk B';

                  return (
                    <tr key={stu.id} className="hover:bg-neutral-50/70 transition-colors">
                      <td className="py-3 px-4 font-semibold text-neutral-900">
                        <div>{stu.name}</div>
                        {stu.notes && (
                          <div className="text-[11px] text-neutral-400 font-normal truncate max-w-xs">
                            {stu.notes}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {school ? (
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-semibold ${schoolTheme.pillBg} ${schoolTheme.pillText} ${schoolTheme.pillBorder} border shadow-2xs`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${schoolTheme.dotColor}`} />
                            <span className="truncate max-w-[130px]">{school.name}</span>
                          </span>
                        ) : (
                          <span className="text-neutral-400">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-neutral-600 font-medium">
                        {yg?.name || '—'}
                        {sg ? ` (${sg.name})` : ''}
                      </td>
                      <td className="py-3 px-4 text-neutral-800 font-semibold">
                        {stu.instrument} ({stu.lessonDuration}m)
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-neutral-900">
                          {stu.normalTeachingDay}
                        </span>
                      </td>

                      {/* Timetable Limitations & Availability Windows Column */}
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1 max-w-[260px]">
                          {/* Allowed Windows */}
                          {stuWindows.map((win) => {
                            const winCycle =
                              win.weekPattern === 'all'
                                ? 'All'
                                : win.weekPattern === 'week_a'
                                ? labelA
                                : labelB;
                            return (
                              <div
                                key={win.id}
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10.5px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/90 truncate"
                                title={`Must only do: ${winCycle} ${win.startTime}–${win.endTime} (${win.notes || 'Allowed window'})`}
                              >
                                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                                <span className="font-bold">{winCycle}:</span>
                                <span className="tabular-nums font-semibold">
                                  {win.startTime}–{win.endTime}
                                </span>
                                {win.notes && (
                                  <span className="text-emerald-700/70 truncate text-[10px]">
                                    ({win.notes})
                                  </span>
                                )}
                              </div>
                            );
                          })}

                          {/* Blocked Times (e.g. Sports at 9am-10am on week B) */}
                          {stuRestrictions.map((r) => {
                            const restCycle =
                              r.weekPattern === 'all'
                                ? 'All'
                                : r.weekPattern === 'week_a'
                                ? labelA
                                : labelB;
                            return (
                              <div
                                key={r.id}
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10.5px] font-semibold bg-rose-50 text-rose-800 border border-rose-200/90 truncate"
                                title={`Blocked: ${restCycle} ${r.startTime}–${r.endTime} (${r.reason})`}
                              >
                                <Ban className="w-2.5 h-2.5 text-rose-600 shrink-0" />
                                <span className="font-bold">{restCycle}:</span>
                                <span className="tabular-nums font-semibold">
                                  {r.startTime}–{r.endTime}
                                </span>
                                <span className="text-rose-700/80 truncate text-[10px]">
                                  ({r.reason})
                                </span>
                              </div>
                            );
                          })}

                          {!hasLimitations && (
                            <span className="text-neutral-400 text-[11px] font-normal italic">
                              Standard school hours
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => setLimitationsStudent(stu)}
                            className="inline-flex items-center gap-1 text-[11px] text-neutral-600 hover:text-neutral-950 font-semibold mt-0.5 cursor-pointer underline underline-offset-2 decoration-neutral-300 hover:decoration-neutral-900"
                          >
                            <SlidersHorizontal className="w-3 h-3" />
                            <span>
                              {hasLimitations ? 'Edit Limitations' : '+ Add Limitations / Windows'}
                            </span>
                          </button>
                        </div>
                      </td>

                      {/* Current Scheduled Slots */}
                      <td className="py-3 px-4 tabular-nums text-neutral-600">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-[11px]">
                            <span className="font-semibold text-neutral-500 w-9">{labelA}:</span>
                            {slotA ? (
                              <span className="font-semibold text-neutral-800">
                                {slotA.day.slice(0, 3)} {slotA.startTime}–{slotA.endTime}
                              </span>
                            ) : (
                              <span className="text-neutral-400 italic">None</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-[11px]">
                            <span className="font-semibold text-neutral-500 w-9">{labelB}:</span>
                            {slotB ? (
                              <span className="font-semibold text-neutral-800">
                                {slotB.day.slice(0, 3)} {slotB.startTime}–{slotB.endTime}
                              </span>
                            ) : (
                              <span className="text-neutral-400 italic">None</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Row Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => setLimitationsStudent(stu)}
                            className="p-1.5 text-neutral-500 hover:text-neutral-900 rounded-md hover:bg-neutral-100 transition-colors"
                            title="Edit timetable limitations & availability windows"
                          >
                            <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />
                          </button>
                          <button
                            onClick={() => openEditModal(stu)}
                            className="p-1.5 text-neutral-400 hover:text-neutral-900 rounded-md hover:bg-neutral-100 transition-colors"
                            title="Edit student details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(stu.id)}
                            className="p-1.5 text-neutral-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors"
                            title="Delete student"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Add Basic Student Modal */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-neutral-200 w-full max-w-lg p-6 space-y-4">
            <h3 className="text-base font-semibold text-neutral-900">
              {isNewStudent ? 'Add New Music Student' : `Edit Student: ${formName}`}
            </h3>

            <form onSubmit={handleSaveStudent} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">
                    Student Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Emma Wood"
                    className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-neutral-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-medium text-neutral-700 mb-1">
                    Instrument
                  </label>
                  <input
                    type="text"
                    required
                    value={formInstrument}
                    onChange={(e) => setFormInstrument(e.target.value)}
                    placeholder="e.g. Piano, Violin, Flute"
                    className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-neutral-900 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">
                    School
                  </label>
                  <select
                    value={formSchoolId}
                    onChange={(e) => {
                      setFormSchoolId(e.target.value);
                      const relevantYears = yearGroups.filter((y) => y.schoolId === e.target.value);
                      setFormYearGroupId(relevantYears[0]?.id || '');
                    }}
                    className="w-full border border-neutral-300 rounded-lg px-2.5 py-2 bg-white text-neutral-900 font-medium"
                  >
                    {schools.map((sc) => (
                      <option key={sc.id} value={sc.id}>
                        {sc.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-neutral-700 mb-1">
                    Year Group
                  </label>
                  <select
                    value={formYearGroupId}
                    onChange={(e) => {
                      setFormYearGroupId(e.target.value);
                      const relevantSubs = subgroups.filter((s) => s.yearGroupId === e.target.value);
                      setFormSubgroupId(relevantSubs[0]?.id || '');
                    }}
                    className="w-full border border-neutral-300 rounded-lg px-2.5 py-2 bg-white text-neutral-900 font-medium"
                  >
                    {yearGroups
                      .filter((y) => y.schoolId === formSchoolId)
                      .map((yg) => (
                        <option key={yg.id} value={yg.id}>
                          {yg.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-neutral-700 mb-1">
                    Subgroup (Optional)
                  </label>
                  <select
                    value={formSubgroupId}
                    onChange={(e) => setFormSubgroupId(e.target.value)}
                    className="w-full border border-neutral-300 rounded-lg px-2.5 py-2 bg-white text-neutral-900 font-medium"
                  >
                    <option value="">None (Whole year)</option>
                    {subgroups
                      .filter((s) => s.yearGroupId === formYearGroupId)
                      .map((sg) => (
                        <option key={sg.id} value={sg.id}>
                          {sg.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">
                    Normal Teaching Day
                  </label>
                  <select
                    value={formNormalDay}
                    onChange={(e) => setFormNormalDay(e.target.value as DayOfWeek)}
                    className="w-full border border-neutral-300 rounded-lg px-2.5 py-2 bg-white text-neutral-900 font-medium"
                  >
                    {schools
                      .find((s) => s.id === formSchoolId)
                      ?.teachingDays.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-neutral-700 mb-1">
                    Duration
                  </label>
                  <select
                    value={formDuration}
                    onChange={(e) => setFormDuration(parseInt(e.target.value, 10))}
                    className="w-full border border-neutral-300 rounded-lg px-2.5 py-2 bg-white text-neutral-900 tabular-nums font-medium"
                  >
                    <option value={20}>20 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={40}>40 minutes</option>
                    {![20, 30, 40].includes(formDuration) && (
                      <option value={formDuration}>{formDuration} minutes (Legacy)</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-neutral-700 mb-1">
                    Frequency
                  </label>
                  <select
                    value={formFrequency}
                    onChange={(e) => setFormFrequency(e.target.value as LessonFrequency)}
                    className="w-full border border-neutral-300 rounded-lg px-2.5 py-2 bg-white text-neutral-900 font-medium"
                  >
                    <option value="weekly">Every Week</option>
                    <option value="week_a_only">Week A only</option>
                    <option value="week_b_only">Week B only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">
                  General Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sibling close together, Grade 3 exam, etc."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-neutral-900"
                />
              </div>

              {/* Quick shortcut to limitations modal for this student */}
              {!isNewStudent && editingStudent && (
                <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 flex items-center justify-between">
                  <div className="text-[11px] text-neutral-600">
                    <strong className="block text-neutral-900 font-semibold">
                      Timetable Limitations &amp; Specific Windows
                    </strong>
                    {(editingStudent.allowedWindows || []).length} allowed windows ·{' '}
                    {restrictions.filter((r) => r.scope === 'student' && r.targetId === editingStudent.id).length}{' '}
                    busy limitations
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setLimitationsStudent(editingStudent);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-white border border-neutral-300 hover:border-neutral-400 rounded-md text-neutral-800 transition-colors shadow-2xs cursor-pointer"
                  >
                    <SlidersHorizontal className="w-3 h-3 text-indigo-600" />
                    <span>Configure Times</span>
                  </button>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-3 py-1.5 text-neutral-600 hover:bg-neutral-100 rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-semibold text-white bg-neutral-900 rounded hover:bg-neutral-800 cursor-pointer shadow-xs"
                >
                  Save Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dedicated Timetable Limitations & Specific Time Windows Modal */}
      {limitationsStudent && (
        <StudentLimitationsModal
          student={limitationsStudent}
          school={schools.find((s) => s.id === limitationsStudent.schoolId)}
          isOpen={true}
          onClose={() => setLimitationsStudent(null)}
          restrictions={restrictions}
          onUpdateStudent={handleUpdateSingleStudent}
          onUpdateRestrictions={onUpdateRestrictions}
        />
      )}
    </div>
  );
};

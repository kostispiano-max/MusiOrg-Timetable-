import React, { useState } from 'react';
import {
  School,
  YearGroup,
  DayOfWeek,
  DAYS_OF_WEEK,
  WeekCycle,
  CycleTerminology,
  SchoolColorTheme,
  BreakPeriod,
  DayHours,
  STANDARD_LESSON_DURATIONS,
} from '../../types';
import { X, Plus, School as SchoolIcon, Check, Calendar, Clock } from 'lucide-react';
import { COLOR_OPTIONS } from '../../utils/themeUtils';

interface AddSchoolModalProps {
  onClose: () => void;
  onAddSchool: (school: School, yearGroups: YearGroup[]) => void;
}

export const AddSchoolModal: React.FC<AddSchoolModalProps> = ({ onClose, onAddSchool }) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [teachingDays, setTeachingDays] = useState<DayOfWeek[]>(['Monday', 'Wednesday']);

  // Independent Day Hours configuration for each day
  const [daySchedule, setDaySchedule] = useState<Record<DayOfWeek, DayHours>>({
    Monday: { startTime: '09:00', endTime: '15:00', standardLessonDuration: 30 },
    Tuesday: { startTime: '09:00', endTime: '16:00', standardLessonDuration: 30 },
    Wednesday: { startTime: '10:00', endTime: '14:30', standardLessonDuration: 30 },
    Thursday: { startTime: '13:30', endTime: '16:30', standardLessonDuration: 30 },
    Friday: { startTime: '09:00', endTime: '12:30', standardLessonDuration: 30 },
  });

  const [globalStandardDuration, setGlobalStandardDuration] = useState<number>(30);
  const [weekCycle, setWeekCycle] = useState<WeekCycle>('A');
  const [terminology, setTerminology] = useState<CycleTerminology>('week_ab');
  const [theme, setTheme] = useState<SchoolColorTheme>('lavender');
  const [yearsInput, setYearsInput] = useState('Y3, Y4, Y5, Y6');
  const [address, setAddress] = useState('');
  const [travelNotes, setTravelNotes] = useState('');

  const toggleDayTeaching = (day: DayOfWeek) => {
    if (teachingDays.includes(day)) {
      setTeachingDays(teachingDays.filter((d) => d !== day));
    } else {
      setTeachingDays([...teachingDays, day]);
    }
  };

  const updateDayTime = (day: DayOfWeek, field: 'startTime' | 'endTime', val: string) => {
    setDaySchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: val,
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || teachingDays.length === 0) return;

    const schoolId = `school_${Date.now()}`;
    const schoolCode = code.trim() || name.trim().replace(/[^a-zA-Z0-9]/g, '_').toUpperCase();

    // Generate dayHours with day-specific start and end times
    const dayHours: Record<DayOfWeek, DayHours> = {
      Monday: { ...daySchedule.Monday, standardLessonDuration: globalStandardDuration },
      Tuesday: { ...daySchedule.Tuesday, standardLessonDuration: globalStandardDuration },
      Wednesday: { ...daySchedule.Wednesday, standardLessonDuration: globalStandardDuration },
      Thursday: { ...daySchedule.Thursday, standardLessonDuration: globalStandardDuration },
      Friday: { ...daySchedule.Friday, standardLessonDuration: globalStandardDuration },
    };

    // Auto-create default breaks for teaching days
    const breaks: BreakPeriod[] = [];
    teachingDays.forEach((day, idx) => {
      breaks.push(
        {
          id: `brk_${schoolId}_m_${idx}`,
          schoolId,
          title: 'Morning Break',
          day,
          startTime: '10:30',
          endTime: '10:50',
        },
        {
          id: `brk_${schoolId}_l_${idx}`,
          schoolId,
          title: 'Lunch',
          day,
          startTime: '12:15',
          endTime: '13:15',
        }
      );
    });

    const newSchool: School = {
      id: schoolId,
      name: name.trim(),
      code: schoolCode,
      teachingDays,
      dayHours,
      breaks,
      currentWeekCycle: weekCycle,
      cycleTerminology: terminology,
      colorTheme: theme,
      address: address.trim() || undefined,
      travelNotes: travelNotes.trim() || undefined,
      cycleNotes: `Starts on ${terminology === 'week_12' ? (weekCycle === 'A' ? 'Week 1' : 'Week 2') : `Week ${weekCycle}`}`,
    };

    const yearNames = yearsInput
      .split(',')
      .map((y) => y.trim())
      .filter(Boolean);

    const newYearGroups: YearGroup[] = yearNames.map((yName, i) => ({
      id: `yg_${schoolId}_${i}`,
      schoolId,
      name: yName,
    }));

    onAddSchool(newSchool, newYearGroups);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl border border-neutral-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-neutral-200/60 text-neutral-800">
              <SchoolIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-neutral-900">Add New School</h3>
              <p className="text-xs text-neutral-500">
                Configure day-specific teaching hours, independent cycle, and colour theme
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-neutral-700 mb-1">School Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. St Peter's Academy"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-neutral-900 bg-neutral-50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-neutral-400 font-medium"
              />
            </div>
            <div>
              <label className="block font-semibold text-neutral-700 mb-1">School Code</label>
              <input
                type="text"
                placeholder="e.g. SPA"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-neutral-900 bg-neutral-50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-neutral-400 font-mono"
              />
            </div>
          </div>

          {/* School Pastel Theme Picker */}
          <div>
            <label className="block font-semibold text-neutral-700 mb-1.5">Colour Theme</label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {COLOR_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setTheme(opt.id)}
                  className={`p-2 rounded-lg border text-left flex items-center gap-2 transition-all cursor-pointer ${
                    theme === opt.id
                      ? 'border-neutral-900 bg-neutral-50 shadow-2xs font-semibold'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <span className={`w-3.5 h-3.5 rounded-full ${opt.swatch} shrink-0`} />
                  <span className="text-[11px] truncate text-neutral-800">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Independent Week Cycle & Terminology */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-neutral-50/70 border border-neutral-200 rounded-xl">
            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                Cycle Terminology
              </label>
              <select
                value={terminology}
                onChange={(e) => setTerminology(e.target.value as CycleTerminology)}
                className="w-full border border-neutral-200 rounded-lg px-2.5 py-1.5 text-neutral-900 bg-white"
              >
                <option value="week_ab">Week A / Week B</option>
                <option value="week_12">Week 1 / Week 2</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                Starting Week
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setWeekCycle('A')}
                  className={`py-1.5 text-xs font-semibold rounded-lg border text-center transition-colors cursor-pointer ${
                    weekCycle === 'A'
                      ? 'bg-neutral-900 text-white border-neutral-900'
                      : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
                  }`}
                >
                  {terminology === 'week_12' ? 'Week 1' : 'Week A'}
                </button>
                <button
                  type="button"
                  onClick={() => setWeekCycle('B')}
                  className={`py-1.5 text-xs font-semibold rounded-lg border text-center transition-colors cursor-pointer ${
                    weekCycle === 'B'
                      ? 'bg-neutral-900 text-white border-neutral-900'
                      : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
                  }`}
                >
                  {terminology === 'week_12' ? 'Week 2' : 'Week B'}
                </button>
              </div>
            </div>
          </div>

          {/* Day-Specific Teaching Hours Table */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block font-semibold text-neutral-800">
                Day-Specific Availability Hours
              </label>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-neutral-500">Standard Duration:</span>
                <select
                  value={globalStandardDuration}
                  onChange={(e) => setGlobalStandardDuration(Number(e.target.value))}
                  className="border border-neutral-200 rounded px-1.5 py-0.5 text-xs bg-white text-neutral-800 font-medium"
                >
                  {STANDARD_LESSON_DURATIONS.map((dur) => (
                    <option key={dur} value={dur}>{dur} mins</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="border border-neutral-200 rounded-xl overflow-hidden bg-white shadow-2xs">
              <table className="w-full text-left text-xs divide-y divide-neutral-200">
                <thead className="bg-neutral-50 text-[11px] font-semibold text-neutral-600">
                  <tr>
                    <th className="px-3 py-2">Day</th>
                    <th className="px-3 py-2 text-center">Teaching</th>
                    <th className="px-3 py-2">Start Time</th>
                    <th className="px-3 py-2">Finish Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {DAYS_OF_WEEK.map((day) => {
                    const isTeaching = teachingDays.includes(day);
                    const schedule = daySchedule[day];

                    return (
                      <tr key={day} className={isTeaching ? 'bg-white' : 'bg-neutral-50/50 text-neutral-400'}>
                        <td className="px-3 py-2 font-medium">
                          <span className={isTeaching ? 'text-neutral-900' : 'text-neutral-400'}>{day}</span>
                        </td>
                        <td className="px-3 py-2 text-center">
                          <input
                            type="checkbox"
                            checked={isTeaching}
                            onChange={() => toggleDayTeaching(day)}
                            className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 cursor-pointer"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="time"
                            step="300"
                            disabled={!isTeaching}
                            value={schedule.startTime}
                            onChange={(e) => updateDayTime(day, 'startTime', e.target.value)}
                            className="border border-neutral-200 rounded px-2 py-1 font-mono text-xs text-neutral-900 disabled:text-neutral-400 disabled:bg-neutral-100"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="time"
                            step="300"
                            disabled={!isTeaching}
                            value={schedule.endTime}
                            onChange={(e) => updateDayTime(day, 'endTime', e.target.value)}
                            className="border border-neutral-200 rounded px-2 py-1 font-mono text-xs text-neutral-900 disabled:text-neutral-400 disabled:bg-neutral-100"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-neutral-500">
              Each day has independent availability windows. Lessons will never be scheduled outside these day hours.
            </p>
          </div>

          {/* Initial Year Groups */}
          <div>
            <label className="block font-semibold text-neutral-700 mb-1">
              Initial Year Groups (comma-separated)
            </label>
            <input
              type="text"
              placeholder="e.g. Y3, Y4, Y5, Y6"
              value={yearsInput}
              onChange={(e) => setYearsInput(e.target.value)}
              className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-neutral-900 bg-neutral-50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-neutral-400"
            />
          </div>

          {/* Travel & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-neutral-700 mb-1">Address / Location</label>
              <input
                type="text"
                placeholder="High St, Town..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full border border-neutral-200 rounded-lg px-3 py-1.5 text-neutral-900 bg-neutral-50 focus:bg-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-neutral-700 mb-1">Travel Notes</label>
              <input
                type="text"
                placeholder="Parking permit at reception..."
                value={travelNotes}
                onChange={(e) => setTravelNotes(e.target.value)}
                className="w-full border border-neutral-200 rounded-lg px-3 py-1.5 text-neutral-900 bg-neutral-50 focus:bg-white"
              />
            </div>
          </div>

          {/* Footer Submit */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-neutral-700 bg-white border border-neutral-200 rounded-md hover:bg-neutral-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-md shadow-xs transition-colors cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Create School Profile</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

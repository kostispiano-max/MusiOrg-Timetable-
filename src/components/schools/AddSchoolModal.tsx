import React, { useState } from 'react';
import { School, YearGroup, DayOfWeek, DAYS_OF_WEEK, WeekCycle, CycleTerminology, SchoolColorTheme, BreakPeriod } from '../../types';
import { X, Plus, School as SchoolIcon, Check, Calendar, Sparkles } from 'lucide-react';
import { COLOR_OPTIONS } from '../../utils/themeUtils';

interface AddSchoolModalProps {
  onClose: () => void;
  onAddSchool: (school: School, yearGroups: YearGroup[]) => void;
}

export const AddSchoolModal: React.FC<AddSchoolModalProps> = ({ onClose, onAddSchool }) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [teachingDays, setTeachingDays] = useState<DayOfWeek[]>(['Monday', 'Wednesday']);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('15:30');
  const [standardDuration, setStandardDuration] = useState<number>(30);
  const [weekCycle, setWeekCycle] = useState<WeekCycle>('A');
  const [terminology, setTerminology] = useState<CycleTerminology>('week_ab');
  const [theme, setTheme] = useState<SchoolColorTheme>('lavender');
  const [yearsInput, setYearsInput] = useState('Y3, Y4, Y5, Y6');
  const [address, setAddress] = useState('');
  const [travelNotes, setTravelNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || teachingDays.length === 0) return;

    const schoolId = `school_${Date.now()}`;
    const schoolCode = code.trim() || name.trim().replace(/[^a-zA-Z0-9]/g, '_').toUpperCase();

    // Generate day hours
    const dayHours: Record<DayOfWeek, { startTime: string; endTime: string; standardLessonDuration: number }> = {
      Monday: { startTime, endTime, standardLessonDuration: standardDuration },
      Tuesday: { startTime, endTime, standardLessonDuration: standardDuration },
      Wednesday: { startTime, endTime, standardLessonDuration: standardDuration },
      Thursday: { startTime, endTime, standardLessonDuration: standardDuration },
      Friday: { startTime, endTime, standardLessonDuration: standardDuration },
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
      <div className="bg-white rounded-xl shadow-xl border border-neutral-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-neutral-200/60 text-neutral-800">
              <SchoolIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-neutral-900">Add New School</h3>
              <p className="text-xs text-neutral-500">
                Configure teaching schedule, independent week cycle, and gentle pastel color
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                School Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. St Peter's Academy"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!code) {
                    setCode(e.target.value.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase());
                  }
                }}
                className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-neutral-900 font-medium bg-neutral-50 focus:bg-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                Short Code
              </label>
              <input
                type="text"
                placeholder="e.g. ST_PETER"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-neutral-900 font-mono bg-neutral-50 focus:bg-white focus:outline-hidden"
              />
            </div>
          </div>

          {/* Established Teaching Days */}
          <div>
            <label className="block font-semibold text-neutral-700 mb-1.5">
              Attending Teaching Days *
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {DAYS_OF_WEEK.map((d) => {
                const isSelected = teachingDays.includes(d);
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        if (teachingDays.length > 1) {
                          setTeachingDays(teachingDays.filter((day) => day !== d));
                        }
                      } else {
                        setTeachingDays([...teachingDays, d]);
                      }
                    }}
                    className={`py-1.5 text-xs font-semibold rounded-md border transition-all text-center ${
                      isSelected
                        ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                        : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
                    }`}
                  >
                    {d.slice(0, 3)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Gentle Pastel Color Theme */}
          <div>
            <label className="block font-semibold text-neutral-700 mb-1.5">
              Gentle Pastel Color-Coding
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {COLOR_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setTheme(opt.id)}
                  className={`flex items-center gap-1.5 p-2 rounded-lg border text-left text-xs transition-all ${
                    theme === opt.id
                      ? 'border-neutral-900 bg-neutral-50 ring-1 ring-neutral-900 font-semibold'
                      : 'border-neutral-200 hover:bg-neutral-50'
                  }`}
                >
                  <span className={`w-3 h-3 rounded-full ${opt.swatch}`} />
                  <span className="truncate">{opt.label.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Independent Week Cycle & Terminology */}
          <div className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50/60 space-y-3">
            <div className="font-semibold text-neutral-900 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-neutral-600" />
              <span>Independent School Week Cycle</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-neutral-600 mb-1">
                  Cycle Terminology
                </label>
                <select
                  value={terminology}
                  onChange={(e) => setTerminology(e.target.value as CycleTerminology)}
                  className="w-full text-xs border border-neutral-200 rounded-lg px-2.5 py-1.5 bg-white text-neutral-800"
                >
                  <option value="week_ab">Week A / Week B</option>
                  <option value="week_12">Week 1 / Week 2</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-neutral-600 mb-1">
                  Starting Cycle
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setWeekCycle('A')}
                    className={`py-1.5 px-2 rounded-md border text-xs font-semibold transition-all ${
                      weekCycle === 'A'
                        ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                        : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
                    }`}
                  >
                    {terminology === 'week_12' ? 'Week 1' : 'Week A'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setWeekCycle('B')}
                    className={`py-1.5 px-2 rounded-md border text-xs font-semibold transition-all ${
                      weekCycle === 'B'
                        ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                        : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
                    }`}
                  >
                    {terminology === 'week_12' ? 'Week 2' : 'Week B'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* School Hours & Standard Duration */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                Start Time
              </label>
              <input
                type="time"
                step="300"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full border border-neutral-200 rounded-lg px-2.5 py-2 font-mono text-neutral-900 bg-neutral-50 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                Finish Time
              </label>
              <input
                type="time"
                step="300"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full border border-neutral-200 rounded-lg px-2.5 py-2 font-mono text-neutral-900 bg-neutral-50 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                Lesson Length
              </label>
              <select
                value={standardDuration}
                onChange={(e) => setStandardDuration(Number(e.target.value))}
                className="w-full border border-neutral-200 rounded-lg px-2.5 py-2 text-neutral-900 bg-neutral-50 focus:bg-white"
              >
                <option value={20}>20 mins</option>
                <option value={30}>30 mins</option>
                <option value={45}>45 mins</option>
                <option value={60}>60 mins</option>
              </select>
            </div>
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
              className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-neutral-900 bg-neutral-50 focus:bg-white"
            />
          </div>

          {/* Footer Submit */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-neutral-700 bg-white border border-neutral-200 rounded-md hover:bg-neutral-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-md shadow-xs transition-colors"
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

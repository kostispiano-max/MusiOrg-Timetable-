import React, { useState } from 'react';
import {
  DayOfWeek,
  WeekCycle,
  CycleTerminology,
  School,
  DAYS_OF_WEEK,
} from '../../types';
import {
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Plus,
  Calendar,
  ArrowLeftRight,
  Settings2,
  Edit2,
  Check,
  X,
  Coffee,
} from 'lucide-react';
import { getSchoolTheme } from '../../utils/themeUtils';

export type TimetableViewMode = 'whole_week' | 'by_school' | 'by_day';
export type CycleDisplayMode = 'active_schools' | 'force_a' | 'force_b';

interface TimetableControlsProps {
  viewMode: TimetableViewMode;
  setViewMode: (mode: TimetableViewMode) => void;
  selectedSchoolId: string;
  setSelectedSchoolId: (id: string) => void;
  selectedDay: DayOfWeek;
  setSelectedDay: (day: DayOfWeek) => void;
  cycleDisplayMode: CycleDisplayMode;
  setCycleDisplayMode: (mode: CycleDisplayMode) => void;
  schools: School[];
  onToggleSchoolCycle: (schoolId: string) => void;
  onOpenSchoolCyclesModal: () => void;
  totalScheduledLessons: number;
  totalConflicts: number;
  onAddLesson: () => void;
  onUpdateSchools?: (schools: School[]) => void;
  onAddSchoolClick?: () => void;
  onAddBreakClick?: () => void;
}

export const TimetableControls: React.FC<TimetableControlsProps> = ({
  viewMode,
  setViewMode,
  selectedSchoolId,
  setSelectedSchoolId,
  selectedDay,
  setSelectedDay,
  cycleDisplayMode,
  setCycleDisplayMode,
  schools,
  onToggleSchoolCycle,
  onOpenSchoolCyclesModal,
  totalScheduledLessons,
  totalConflicts,
  onAddLesson,
  onUpdateSchools,
  onAddSchoolClick,
  onAddBreakClick,
}) => {
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editingTabName, setEditingTabName] = useState<string>('');

  const currentDayIndex = DAYS_OF_WEEK.indexOf(selectedDay);

  const handlePrevDay = () => {
    const prev = (currentDayIndex - 1 + DAYS_OF_WEEK.length) % DAYS_OF_WEEK.length;
    setSelectedDay(DAYS_OF_WEEK[prev]);
  };

  const handleNextDay = () => {
    const next = (currentDayIndex + 1) % DAYS_OF_WEEK.length;
    setSelectedDay(DAYS_OF_WEEK[next]);
  };

  const handleSaveTabRename = (schoolId: string) => {
    if (!editingTabName.trim() || !onUpdateSchools) {
      setEditingTabId(null);
      return;
    }
    const updated = schools.map((s) =>
      s.id === schoolId ? { ...s, name: editingTabName.trim() } : s
    );
    onUpdateSchools(updated);
    setEditingTabId(null);
  };

  return (
    <div className="bg-white border-b border-neutral-200">
      {/* Top Bar: View Modes & Filters */}
      <div className="py-2.5 px-4 sm:px-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        {/* Left: View Mode Buttons & Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* View Mode Buttons */}
          <div className="inline-flex items-center rounded-lg bg-neutral-100 p-0.5 border border-neutral-200 text-xs">
            <button
              onClick={() => setViewMode('whole_week')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                viewMode === 'whole_week'
                  ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Whole Week
            </button>
            <button
              onClick={() => setViewMode('by_school')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                viewMode === 'by_school'
                  ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              By School
            </button>
            <button
              onClick={() => setViewMode('by_day')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                viewMode === 'by_day'
                  ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Single Day
            </button>
          </div>

          {/* EDITABLE SCHOOL TABS & ADD SCHOOL (When in By School view) */}
          {viewMode === 'by_school' && (
            <div className="flex flex-wrap items-center gap-1.5 bg-neutral-100/90 p-0.5 rounded-lg border border-neutral-200">
              {schools.map((sc) => {
                const isSelected = selectedSchoolId === sc.id;
                const isEditingThisTab = editingTabId === sc.id;
                const theme = getSchoolTheme(sc.colorTheme);
                const cycle = sc.currentWeekCycle || 'A';
                const cycleBadge = sc.cycleTerminology === 'week_12' ? (cycle === 'A' ? 'W1' : 'W2') : `W${cycle}`;

                if (isEditingThisTab) {
                  return (
                    <form
                      key={sc.id}
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSaveTabRename(sc.id);
                      }}
                      className="inline-flex items-center gap-1 bg-white px-2 py-1 rounded-md shadow-xs border border-neutral-400"
                    >
                      <input
                        type="text"
                        value={editingTabName}
                        autoFocus
                        onChange={(e) => setEditingTabName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Escape') setEditingTabId(null);
                        }}
                        className="text-xs font-semibold text-neutral-900 bg-transparent outline-hidden w-28"
                      />
                      <button
                        type="submit"
                        className="text-emerald-700 hover:text-emerald-900 p-0.5 cursor-pointer"
                        title="Save name"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingTabId(null)}
                        className="text-neutral-400 hover:text-neutral-600 p-0.5 cursor-pointer"
                        title="Cancel"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  );
                }

                return (
                  <div
                    key={sc.id}
                    className={`group inline-flex items-center rounded-md transition-all ${
                      isSelected
                        ? `${theme.tabActive} shadow-xs`
                        : 'text-neutral-700 hover:text-neutral-950 hover:bg-white/60'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedSchoolId(sc.id)}
                      onDoubleClick={() => {
                        setEditingTabId(sc.id);
                        setEditingTabName(sc.name);
                      }}
                      className="px-2.5 py-1 text-xs font-semibold whitespace-nowrap cursor-pointer flex items-center gap-1.5"
                      title="Click to view timetable for this school. Double-click to rename."
                    >
                      <span className={`w-2 h-2 rounded-full ${theme.dotColor}`} />
                      <span>{sc.name}</span>
                      <span className="text-[10px] font-semibold tabular-nums px-1 py-0.2 rounded bg-black/5 text-neutral-700">
                        {cycleBadge}
                      </span>
                    </button>

                    {isSelected && onUpdateSchools && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingTabId(sc.id);
                          setEditingTabName(sc.name);
                        }}
                        className="p-1 pr-1.5 text-neutral-400 hover:text-neutral-900 transition-colors cursor-pointer"
                        title="Rename school tab"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })}

              {/* Dedicated Add School Tab Button */}
              {onAddSchoolClick && (
                <button
                  type="button"
                  onClick={onAddSchoolClick}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md text-neutral-700 hover:text-neutral-950 bg-white/70 hover:bg-white transition-all border border-dashed border-neutral-300 hover:border-neutral-400 shadow-2xs cursor-pointer"
                  title="Add a new school profile"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add School</span>
                </button>
              )}
            </div>
          )}

          {/* Day Selector (if by_day) */}
          {viewMode === 'by_day' && (
            <div className="inline-flex items-center gap-1">
              <button
                onClick={handlePrevDay}
                className="p-1 rounded-md hover:bg-neutral-100 text-neutral-600 cursor-pointer"
                title="Previous Day"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value as DayOfWeek)}
                className="text-xs bg-white border border-neutral-200 rounded-lg px-2.5 py-1.5 text-neutral-800 font-semibold focus:outline-hidden cursor-pointer"
              >
                {DAYS_OF_WEEK.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <button
                onClick={handleNextDay}
                className="p-1 rounded-md hover:bg-neutral-100 text-neutral-600 cursor-pointer"
                title="Next Day"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Blueprint Mode Selector (Whole Week view) */}
          {viewMode === 'whole_week' && (
            <div className="inline-flex items-center rounded-lg bg-neutral-100 p-0.5 border border-neutral-200 text-xs">
              <button
                onClick={() => setCycleDisplayMode('active_schools')}
                className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap cursor-pointer ${
                  cycleDisplayMode === 'active_schools'
                    ? 'bg-neutral-900 text-white font-semibold shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900 font-medium'
                }`}
                title="Display each day using that specific school's active Week cycle"
              >
                Independent School Weeks
              </button>
              <button
                onClick={() => setCycleDisplayMode('force_a')}
                className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap cursor-pointer ${
                  cycleDisplayMode === 'force_a'
                    ? 'bg-neutral-900 text-white font-semibold shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
                title="Preview all schools in Week A / 1"
              >
                All A / 1
              </button>
              <button
                onClick={() => setCycleDisplayMode('force_b')}
                className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap cursor-pointer ${
                  cycleDisplayMode === 'force_b'
                    ? 'bg-neutral-900 text-white font-semibold shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
                title="Preview all schools in Week B / 2"
              >
                All B / 2
              </button>
            </div>
          )}
        </div>

        {/* Right: Metrics & Actions (Add Break & Add Slot) */}
        <div className="flex items-center gap-2.5 justify-between sm:justify-end">
          <div className="flex items-center gap-2 text-xs text-neutral-600 font-medium tabular-nums">
            <span>{totalScheduledLessons} lessons</span>
            {totalConflicts > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-rose-600 font-semibold">{totalConflicts} issues</span>
              </>
            )}
          </div>

          {/* Quick Add Break Button */}
          {onAddBreakClick && (
            <button
              onClick={onAddBreakClick}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 rounded-md transition-colors shadow-2xs cursor-pointer"
              title="Add a break or lunch period to the timetable"
            >
              <Coffee className="w-3.5 h-3.5 text-amber-700" />
              <span>Add Break</span>
            </button>
          )}

          <button
            onClick={onAddLesson}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Slot</span>
          </button>
        </div>
      </div>

      {/* Secondary Bar: School Cycles Visibility & Fast Click-to-Edit */}
      <div className="bg-neutral-50/80 px-4 sm:px-6 py-2 border-t border-neutral-200/80 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-neutral-500 font-medium flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-neutral-400" />
            <span>School Cycles:</span>
          </span>

          {schools.map((school) => {
            const isSelected = viewMode === 'by_school' && selectedSchoolId === school.id;
            const cycle = school.currentWeekCycle || 'A';
            const term = school.cycleTerminology || 'week_ab';
            const labelA = term === 'week_12' ? 'Week 1' : 'Week A';
            const labelB = term === 'week_12' ? 'Week 2' : 'Week B';
            const currentLabel = cycle === 'A' ? labelA : labelB;
            const otherCycle: WeekCycle = cycle === 'A' ? 'B' : 'A';
            const otherLabel = cycle === 'A' ? labelB : labelA;
            const theme = getSchoolTheme(school.colorTheme);

            return (
              <div
                key={school.id}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs transition-colors ${
                  isSelected
                    ? `${theme.tabActive} shadow-2xs`
                    : `${theme.pillBg} ${theme.pillBorder} text-neutral-800`
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${theme.dotColor}`} />
                <span className="font-semibold truncate max-w-[150px]">{school.name}:</span>
                
                {/* Clickable cycle badge with instant toggle */}
                <button
                  type="button"
                  onClick={() => onToggleSchoolCycle(school.id)}
                  title={`Click to flip ${school.name} to ${otherLabel}`}
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/90 hover:bg-neutral-900 hover:text-white border border-neutral-200 transition-colors tabular-nums font-semibold text-[11px] cursor-pointer"
                >
                  <span>{currentLabel}</span>
                  <ArrowLeftRight className="w-2.5 h-2.5 opacity-60" />
                </button>

                {school.cycleNotes && (
                  <span
                    className="text-[10px] text-amber-800/90 font-medium truncate max-w-[130px] hidden md:inline"
                    title={school.cycleNotes}
                  >
                    ({school.cycleNotes})
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onOpenSchoolCyclesModal}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-neutral-600 hover:text-neutral-950 hover:underline transition-colors cursor-pointer"
        >
          <Settings2 className="w-3.5 h-3.5" />
          <span>Edit Cycles & Irregular Notes</span>
        </button>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  School,
  YearGroup,
  YearSubgroup,
  Restriction,
  DayOfWeek,
  DAYS_OF_WEEK,
  RestrictionScope,
  WeekPattern,
  WeekCycle,
  CycleTerminology,
  BreakPeriod,
  SchoolColorTheme,
  DayHours,
  STANDARD_LESSON_DURATIONS,
} from '../../types';
import { normalizeSchoolDayHours } from '../../services/dbService';
import {
  Plus,
  Trash2,
  Edit2,
  Clock,
  Calendar,
  ShieldAlert,
  ChevronRight,
  School as SchoolIcon,
  Layers,
  Check,
  X,
  Settings,
  Coffee,
} from 'lucide-react';
import { getSchoolTheme, COLOR_OPTIONS } from '../../utils/themeUtils';

interface SchoolsManagerProps {
  schools: School[];
  yearGroups: YearGroup[];
  subgroups: YearSubgroup[];
  restrictions: Restriction[];
  onUpdateSchools: (schools: School[]) => void;
  onUpdateYearGroups: (ygs: YearGroup[]) => void;
  onUpdateSubgroups: (sgs: YearSubgroup[]) => void;
  onUpdateRestrictions: (rests: Restriction[]) => void;
}

export const SchoolsManager: React.FC<SchoolsManagerProps> = ({
  schools,
  yearGroups,
  subgroups,
  restrictions,
  onUpdateSchools,
  onUpdateYearGroups,
  onUpdateSubgroups,
  onUpdateRestrictions,
}) => {
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>(schools[0]?.id || '');
  const activeSchool = schools.find((s) => s.id === selectedSchoolId) || schools[0];
  const activeTheme = getSchoolTheme(activeSchool?.colorTheme);

  // Inline tab rename states
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editingTabName, setEditingTabName] = useState<string>('');

  // Modals
  const [showAddSchoolModal, setShowAddSchoolModal] = useState<boolean>(false);
  const [showEditSchoolModal, setShowEditSchoolModal] = useState<boolean>(false);
  const [showBreakModal, setShowBreakModal] = useState<boolean>(false);
  const [editingBreakId, setEditingBreakId] = useState<string | null>(null);
  const [showAddRestrictionModal, setShowAddRestrictionModal] = useState<boolean>(false);
  const [showAddSubgroupModal, setShowAddSubgroupModal] = useState<boolean>(false);
  const [selectedYearGroupIdForSubgroup, setSelectedYearGroupIdForSubgroup] = useState<string>('');

  // Form state for adding new school
  const [newSchoolName, setNewSchoolName] = useState<string>('');
  const [newSchoolCode, setNewSchoolCode] = useState<string>('');
  const [newSchoolDays, setNewSchoolDays] = useState<DayOfWeek[]>(['Monday', 'Wednesday']);
  const [newSchoolStart, setNewSchoolStart] = useState<string>('09:00');
  const [newSchoolEnd, setNewSchoolEnd] = useState<string>('15:30');
  const [newSchoolDuration, setNewSchoolDuration] = useState<number>(30);
  const [newSchoolWeekCycle, setNewSchoolWeekCycle] = useState<WeekCycle>('A');
  const [newSchoolTerminology, setNewSchoolTerminology] = useState<CycleTerminology>('week_ab');
  const [newSchoolTheme, setNewSchoolTheme] = useState<SchoolColorTheme>('lavender');
  const [newSchoolYears, setNewSchoolYears] = useState<string>('Y3, Y4, Y5, Y6');
  const [newSchoolAddress, setNewSchoolAddress] = useState<string>('');
  const [newSchoolTravelNotes, setNewSchoolTravelNotes] = useState<string>('');

  // Form state for editing active school full details
  const [editSchoolName, setEditSchoolName] = useState<string>('');
  const [editSchoolCode, setEditSchoolCode] = useState<string>('');
  const [editSchoolDays, setEditSchoolDays] = useState<DayOfWeek[]>([]);
  const [editDaySchedule, setEditDaySchedule] = useState<Record<DayOfWeek, DayHours>>({
    Monday: { startTime: '09:00', endTime: '15:00', standardLessonDuration: 30 },
    Tuesday: { startTime: '09:00', endTime: '16:00', standardLessonDuration: 30 },
    Wednesday: { startTime: '10:00', endTime: '14:30', standardLessonDuration: 30 },
    Thursday: { startTime: '13:30', endTime: '16:30', standardLessonDuration: 30 },
    Friday: { startTime: '09:00', endTime: '12:30', standardLessonDuration: 30 },
  });
  const [editSchoolDuration, setEditSchoolDuration] = useState<number>(30);
  const [editSchoolTheme, setEditSchoolTheme] = useState<SchoolColorTheme>('sage');
  const [editSchoolAddress, setEditSchoolAddress] = useState<string>('');
  const [editSchoolTravelNotes, setEditSchoolTravelNotes] = useState<string>('');

  // Form state for adding / editing a break interval
  const [breakTitle, setBreakTitle] = useState<string>('Morning Break');
  const [breakDay, setBreakDay] = useState<DayOfWeek>('Monday');
  const [breakStartTime, setBreakStartTime] = useState<string>('10:30');
  const [breakEndTime, setBreakEndTime] = useState<string>('10:50');
  const [breakApplyAllDays, setBreakApplyAllDays] = useState<boolean>(false);

  // Form state for adding restriction
  const [newResScope, setNewResScope] = useState<RestrictionScope>('subgroup');
  const [newResTargetId, setNewResTargetId] = useState<string>('');
  const [newResDay, setNewResDay] = useState<DayOfWeek>('Monday');
  const [newResStart, setNewResStart] = useState<string>('09:00');
  const [newResEnd, setNewResEnd] = useState<string>('10:00');
  const [newResReason, setNewResReason] = useState<string>('');
  const [newResWeekPattern, setNewResWeekPattern] = useState<WeekPattern>('all');
  const [newResType, setNewResType] = useState<'hard' | 'soft'>('hard');

  // Form state for adding subgroup
  const [newSubgroupName, setNewSubgroupName] = useState<string>('');

  // Year groups for active school
  const schoolYearGroups = yearGroups.filter((yg) => yg.schoolId === activeSchool?.id);

  // Subgroups for active school
  const schoolSubgroups = subgroups.filter((sg) => sg.schoolId === activeSchool?.id);

  // Restrictions for active school
  const schoolRestrictions = restrictions.filter((r) => {
    if (r.schoolId === activeSchool?.id) return true;
    if (r.scope === 'school' && r.targetId === activeSchool?.id) return true;
    if (schoolYearGroups.some((yg) => yg.id === r.targetId)) return true;
    if (schoolSubgroups.some((sg) => sg.id === r.targetId)) return true;
    return false;
  });

  // Handle inline tab renaming
  const handleSaveTabRename = (schoolId: string) => {
    if (!editingTabName.trim()) {
      setEditingTabId(null);
      return;
    }
    const updated = schools.map((s) =>
      s.id === schoolId ? { ...s, name: editingTabName.trim() } : s
    );
    onUpdateSchools(updated);
    setEditingTabId(null);
  };

  // Open Full Edit School Modal
  const openEditSchoolModal = (school: School) => {
    const normalized = normalizeSchoolDayHours(school);
    const firstDay = school.teachingDays[0] || 'Monday';
    const firstDuration = normalized.dayHours[firstDay]?.standardLessonDuration || 30;

    setEditSchoolName(school.name);
    setEditSchoolCode(school.code || '');
    setEditSchoolDays([...school.teachingDays]);
    setEditDaySchedule(normalized.dayHours);
    setEditSchoolDuration(firstDuration);
    setEditSchoolTheme(school.colorTheme || 'sage');
    setEditSchoolAddress(school.address || '');
    setEditSchoolTravelNotes(school.travelNotes || '');
    setShowEditSchoolModal(true);
  };

  // Save Full Edit School Details
  const handleSaveEditSchool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSchool || !editSchoolName.trim() || editSchoolDays.length === 0) return;

    const updatedDayHours: Record<DayOfWeek, DayHours> = {
      ...editDaySchedule,
    };

    // Propagate standard lesson duration to enabled teaching days
    editSchoolDays.forEach((d) => {
      if (updatedDayHours[d]) {
        updatedDayHours[d] = {
          ...updatedDayHours[d],
          standardLessonDuration: editSchoolDuration,
        };
      }
    });

    const updatedSchools = schools.map((s) => {
      if (s.id === activeSchool.id) {
        return {
          ...s,
          name: editSchoolName.trim(),
          code: editSchoolCode.trim() || editSchoolName.trim().replace(/\s+/g, '_').toUpperCase(),
          teachingDays: editSchoolDays,
          dayHours: updatedDayHours,
          colorTheme: editSchoolTheme,
          address: editSchoolAddress.trim() || undefined,
          travelNotes: editSchoolTravelNotes.trim() || undefined,
        };
      }
      return s;
    });

    onUpdateSchools(updatedSchools);
    setShowEditSchoolModal(false);
  };

  // Delete School
  const handleDeleteSchool = (schoolId: string) => {
    if (schools.length <= 1) {
      alert('You must keep at least one school profile in the timetable.');
      return;
    }
    if (confirm(`Are you sure you want to delete ${activeSchool?.name}? Associated restrictions and subgroups will also be cleared.`)) {
      const remainingSchools = schools.filter((s) => s.id !== schoolId);
      onUpdateSchools(remainingSchools);
      onUpdateYearGroups(yearGroups.filter((yg) => yg.schoolId !== schoolId));
      onUpdateSubgroups(subgroups.filter((sg) => sg.schoolId !== schoolId));
      onUpdateRestrictions(restrictions.filter((r) => r.schoolId !== schoolId));
      setSelectedSchoolId(remainingSchools[0]?.id || '');
      setShowEditSchoolModal(false);
    }
  };

  // Create New School
  const handleCreateSchool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchoolName.trim() || newSchoolDays.length === 0) return;

    const newId = `school_${Date.now()}`;
    const code = newSchoolCode.trim() || newSchoolName.trim().replace(/[^a-zA-Z0-9]/g, '_').toUpperCase();

    // Generate day hours
    const dayHours: Record<DayOfWeek, { startTime: string; endTime: string; standardLessonDuration: number }> = {
      Monday: { startTime: newSchoolStart, endTime: newSchoolEnd, standardLessonDuration: newSchoolDuration },
      Tuesday: { startTime: newSchoolStart, endTime: newSchoolEnd, standardLessonDuration: newSchoolDuration },
      Wednesday: { startTime: newSchoolStart, endTime: newSchoolEnd, standardLessonDuration: newSchoolDuration },
      Thursday: { startTime: newSchoolStart, endTime: newSchoolEnd, standardLessonDuration: newSchoolDuration },
      Friday: { startTime: newSchoolStart, endTime: newSchoolEnd, standardLessonDuration: newSchoolDuration },
    };

    // Default breaks for each teaching day
    const breaks: BreakPeriod[] = [];
    newSchoolDays.forEach((day, idx) => {
      breaks.push(
        { id: `brk_${newId}_m_${idx}`, schoolId: newId, title: 'Morning Break', day, startTime: '10:30', endTime: '10:50' },
        { id: `brk_${newId}_l_${idx}`, schoolId: newId, title: 'Lunch', day, startTime: '12:15', endTime: '13:15' }
      );
    });

    const newSchool: School = {
      id: newId,
      name: newSchoolName.trim(),
      code,
      teachingDays: newSchoolDays,
      dayHours,
      breaks,
      currentWeekCycle: newSchoolWeekCycle,
      cycleTerminology: newSchoolTerminology,
      colorTheme: newSchoolTheme,
      travelNotes: newSchoolTravelNotes.trim() || undefined,
      address: newSchoolAddress.trim() || undefined,
    };

    // Generate Year Groups from input (e.g. "Y3, Y4, Y5, Y6")
    const yearNames = newSchoolYears
      .split(',')
      .map((y) => y.trim())
      .filter(Boolean);
    const newYearGroups: YearGroup[] = yearNames.map((name, i) => ({
      id: `yg_${newId}_${i}`,
      schoolId: newId,
      name,
    }));

    onUpdateSchools([...schools, newSchool]);
    if (newYearGroups.length > 0) {
      onUpdateYearGroups([...yearGroups, ...newYearGroups]);
    }

    // Select the newly added school
    setSelectedSchoolId(newId);
    setShowAddSchoolModal(false);

    // Reset form
    setNewSchoolName('');
    setNewSchoolCode('');
    setNewSchoolDays(['Monday', 'Wednesday']);
    setNewSchoolAddress('');
    setNewSchoolTravelNotes('');
  };

  // BREAKS & LUNCH EDITING HANDLERS
  const openAddBreakModal = () => {
    setEditingBreakId(null);
    setBreakTitle('Morning Break');
    setBreakDay(activeSchool.teachingDays[0] || 'Monday');
    setBreakStartTime('10:30');
    setBreakEndTime('10:50');
    setBreakApplyAllDays(false);
    setShowBreakModal(true);
  };

  const openEditBreakModal = (brk: BreakPeriod) => {
    setEditingBreakId(brk.id);
    setBreakTitle(brk.title);
    setBreakDay(brk.day);
    setBreakStartTime(brk.startTime);
    setBreakEndTime(brk.endTime);
    setBreakApplyAllDays(false);
    setShowBreakModal(true);
  };

  const handleSaveBreak = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSchool || !breakTitle.trim()) return;

    let updatedBreaks: BreakPeriod[] = [...activeSchool.breaks];

    if (editingBreakId) {
      // Update existing single break
      updatedBreaks = updatedBreaks.map((b) => {
        if (b.id === editingBreakId) {
          return {
            ...b,
            title: breakTitle.trim(),
            day: breakDay,
            startTime: breakStartTime,
            endTime: breakEndTime,
          };
        }
        return b;
      });
    } else {
      // Adding new break
      if (breakApplyAllDays) {
        // Add for each teaching day
        activeSchool.teachingDays.forEach((d, idx) => {
          updatedBreaks.push({
            id: `brk_${activeSchool.id}_${Date.now()}_${idx}`,
            schoolId: activeSchool.id,
            title: breakTitle.trim(),
            day: d,
            startTime: breakStartTime,
            endTime: breakEndTime,
          });
        });
      } else {
        updatedBreaks.push({
          id: `brk_${activeSchool.id}_${Date.now()}`,
          schoolId: activeSchool.id,
          title: breakTitle.trim(),
          day: breakDay,
          startTime: breakStartTime,
          endTime: breakEndTime,
        });
      }
    }

    const updatedSchools = schools.map((s) =>
      s.id === activeSchool.id ? { ...s, breaks: updatedBreaks } : s
    );
    onUpdateSchools(updatedSchools);
    setShowBreakModal(false);
  };

  const handleDeleteBreak = (breakId: string) => {
    if (!activeSchool) return;
    const updatedBreaks = activeSchool.breaks.filter((b) => b.id !== breakId);
    const updatedSchools = schools.map((s) =>
      s.id === activeSchool.id ? { ...s, breaks: updatedBreaks } : s
    );
    onUpdateSchools(updatedSchools);
  };

  const handleDeleteRestriction = (id: string) => {
    onUpdateRestrictions(restrictions.filter((r) => r.id !== id));
  };

  const handleSaveRestriction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResReason || !newResTargetId || !activeSchool) return;

    const newRes: Restriction = {
      id: `rest_${Date.now()}`,
      scope: newResScope,
      targetId: newResTargetId,
      schoolId: activeSchool.id,
      type: newResType,
      weekPattern: newResWeekPattern,
      dayOfWeek: newResDay,
      startTime: newResStart,
      endTime: newResEnd,
      reason: newResReason,
    };

    onUpdateRestrictions([...restrictions, newRes]);
    setShowAddRestrictionModal(false);
    setNewResReason('');
  };

  const handleCreateSubgroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubgroupName || !selectedYearGroupIdForSubgroup || !activeSchool) return;

    const newSg: YearSubgroup = {
      id: `sub_${Date.now()}`,
      schoolId: activeSchool.id,
      yearGroupId: selectedYearGroupIdForSubgroup,
      name: newSubgroupName,
    };

    onUpdateSubgroups([...subgroups, newSg]);
    setShowAddSubgroupModal(false);
    setNewSubgroupName('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Title & Editable School Tabs Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900">
            School Profiles & Multi-Level Restrictions
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Configure school hours, independent week cycles, breaks, year groups, and schedule constraints
          </p>
        </div>

        {/* EDITABLE SCHOOL TABS & ADD SCHOOL TAB */}
        <div className="flex flex-wrap items-center gap-1.5 bg-neutral-100 p-1 rounded-lg border border-neutral-200">
          {schools.map((sc) => {
            const isActive = sc.id === activeSchool?.id;
            const isEditingThisTab = editingTabId === sc.id;
            const theme = getSchoolTheme(sc.colorTheme);

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
                    className="text-xs font-semibold text-neutral-900 bg-transparent outline-hidden w-28 sm:w-36"
                  />
                  <button
                    type="submit"
                    className="text-emerald-700 hover:text-emerald-900 p-0.5"
                    title="Save name"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingTabId(null)}
                    className="text-neutral-400 hover:text-neutral-600 p-0.5"
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
                  isActive
                    ? `${theme.tabActive} shadow-xs`
                    : 'text-neutral-700 hover:text-neutral-950 hover:bg-neutral-200/60'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setSelectedSchoolId(sc.id)}
                  onDoubleClick={() => {
                    setEditingTabId(sc.id);
                    setEditingTabName(sc.name);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold whitespace-nowrap cursor-pointer flex items-center gap-1.5"
                  title="Click to select school profile. Double-click to rename."
                >
                  <span className={`w-2 h-2 rounded-full ${theme.dotColor}`} />
                  <span>{sc.name}</span>
                  <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-black/5 text-neutral-600 font-medium">
                    {sc.cycleTerminology === 'week_12' ? (sc.currentWeekCycle === 'A' ? 'W1' : 'W2') : `W${sc.currentWeekCycle || 'A'}`}
                  </span>
                </button>

                {isActive && (
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

          {/* Dedicated + Add School Tab */}
          <button
            type="button"
            onClick={() => setShowAddSchoolModal(true)}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-md text-neutral-700 hover:text-neutral-950 bg-white/80 hover:bg-white transition-all border border-dashed border-neutral-300 hover:border-neutral-400 shadow-2xs cursor-pointer"
            title="Add a new school profile"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add School</span>
          </button>
        </div>
      </div>

      {activeSchool && (
        <>
          {/* Active School Pastel Banner */}
          <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs transition-all ${activeTheme.cardSection}`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm border shadow-2xs ${activeTheme.pillBg} ${activeTheme.pillText} ${activeTheme.pillBorder}`}>
                <SchoolIcon className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${activeTheme.dotColor}`} />
                  <h2 className="text-base font-bold text-neutral-900">{activeSchool.name}</h2>
                  <span className="text-[11px] font-mono text-neutral-600 bg-white/80 border border-neutral-200/80 px-1.5 py-0.5 rounded font-semibold">
                    {activeSchool.code}
                  </span>
                  <span className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md border ${activeTheme.softBadge}`}>
                    {activeSchool.cycleTerminology === 'week_12'
                      ? (activeSchool.currentWeekCycle === 'A' ? 'Week 1' : 'Week 2')
                      : `Week ${activeSchool.currentWeekCycle}`}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-neutral-600 mt-1">
                  <span>Established Teaching Days:</span>
                  <div className="flex items-center gap-1 font-semibold text-neutral-900">
                    {activeSchool.teachingDays.join(', ')}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Color Theme Switcher */}
              <div className="flex items-center gap-1 bg-white/90 p-1 rounded-lg border border-neutral-200/80 shadow-2xs">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      const updated = schools.map((s) =>
                        s.id === activeSchool.id ? { ...s, colorTheme: c.id } : s
                      );
                      onUpdateSchools(updated);
                    }}
                    title={`Change color theme to ${c.label}`}
                    className={`p-1 rounded-md transition-all cursor-pointer ${
                      activeSchool.colorTheme === c.id
                        ? 'bg-neutral-900/10 ring-1 ring-neutral-900/30 scale-110'
                        : 'hover:bg-neutral-100 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded-full block ${c.swatch}`} />
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => openEditSchoolModal(activeSchool)}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-neutral-800 bg-white hover:bg-neutral-50 border border-neutral-200 rounded-lg shadow-2xs transition-colors cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: School Profile, Week Cycle & Hours */}
          <div className="space-y-6">
            {/* Independent School Week Cycle Card */}
            <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
                  <Calendar className="w-4 h-4 text-neutral-700" />
                  <span>School Week Cycle</span>
                </div>
                <span className="text-[11px] font-mono text-neutral-500 font-semibold">
                  {activeSchool.currentWeekCycle === 'A'
                    ? (activeSchool.cycleTerminology === 'week_12' ? 'Week 1' : 'Week A')
                    : (activeSchool.cycleTerminology === 'week_12' ? 'Week 2' : 'Week B')}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-neutral-600 font-medium mb-1.5">
                    Current Active Week for {activeSchool.name}:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const updated = schools.map((s) =>
                          s.id === activeSchool.id ? { ...s, currentWeekCycle: 'A' as WeekCycle } : s
                        );
                        onUpdateSchools(updated);
                      }}
                      className={`py-2 px-3 rounded-lg border font-semibold text-xs transition-all ${
                        activeSchool.currentWeekCycle === 'A'
                          ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                          : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
                      }`}
                    >
                      {activeSchool.cycleTerminology === 'week_12' ? 'Week 1' : 'Week A'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = schools.map((s) =>
                          s.id === activeSchool.id ? { ...s, currentWeekCycle: 'B' as WeekCycle } : s
                        );
                        onUpdateSchools(updated);
                      }}
                      className={`py-2 px-3 rounded-lg border font-semibold text-xs transition-all ${
                        activeSchool.currentWeekCycle === 'B'
                          ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                          : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
                      }`}
                    >
                      {activeSchool.cycleTerminology === 'week_12' ? 'Week 2' : 'Week B'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                      Cycle Terminology
                    </label>
                    <select
                      value={activeSchool.cycleTerminology || 'week_ab'}
                      onChange={(e) => {
                        const updated = schools.map((s) =>
                          s.id === activeSchool.id
                            ? { ...s, cycleTerminology: e.target.value as any }
                            : s
                        );
                        onUpdateSchools(updated);
                      }}
                      className="w-full text-xs border border-neutral-200 rounded-lg px-2.5 py-1.5 bg-neutral-50 text-neutral-800"
                    >
                      <option value="week_ab">Week A / Week B</option>
                      <option value="week_12">Week 1 / Week 2</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                      Quick Toggle
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const nextCycle: WeekCycle = activeSchool.currentWeekCycle === 'A' ? 'B' : 'A';
                        const updated = schools.map((s) =>
                          s.id === activeSchool.id ? { ...s, currentWeekCycle: nextCycle } : s
                        );
                        onUpdateSchools(updated);
                      }}
                      className="w-full text-xs py-1.5 px-2.5 bg-neutral-100 hover:bg-neutral-200 rounded-lg font-medium text-neutral-800 transition-colors"
                    >
                      Flip (A ↔ B)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                    Irregular Cycle Notes (e.g. Inset day offset)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Term started 1 week late; out of sync with other schools"
                    value={activeSchool.cycleNotes || ''}
                    onChange={(e) => {
                      const updated = schools.map((s) =>
                        s.id === activeSchool.id ? { ...s, cycleNotes: e.target.value } : s
                      );
                      onUpdateSchools(updated);
                    }}
                    className="w-full text-xs border border-neutral-200 rounded-lg px-2.5 py-1.5 bg-neutral-50 text-neutral-800"
                  />
                </div>
              </div>
            </div>

            {/* School Profile & Hours Card */}
            <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
                  <SchoolIcon className="w-4 h-4 text-neutral-700" />
                  <span>Teaching Schedule & Hours</span>
                </div>
                <button
                  type="button"
                  onClick={() => openEditSchoolModal(activeSchool)}
                  className="inline-flex items-center gap-1 text-xs text-neutral-600 hover:text-neutral-950 font-semibold px-2 py-0.5 rounded border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 transition-colors"
                  title="Edit school teaching days, hours, and notes"
                >
                  <Settings className="w-3 h-3" />
                  <span>Edit Details</span>
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="text-xs font-medium text-neutral-500">Established Teaching Days:</div>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {activeSchool.teachingDays.map((d) => (
                      <span
                        key={d}
                        className={`text-xs font-semibold px-2 py-0.5 rounded border ${activeTheme.pillBg} ${activeTheme.pillText} ${activeTheme.pillBorder}`}
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-xs space-y-2 pt-2">
                  {activeSchool.teachingDays.map((d) => {
                    const h = activeSchool.dayHours[d];
                    return (
                      <div
                        key={d}
                        className="flex items-center justify-between p-2 rounded bg-neutral-50/60 border border-neutral-100"
                      >
                        <span className="font-semibold text-neutral-900">{d}</span>
                        <span className="font-mono text-neutral-600">
                          {h?.startTime}–{h?.endTime} ({h?.standardLessonDuration}m lessons)
                        </span>
                      </div>
                    );
                  })}
                </div>

                {activeSchool.address && (
                  <div className="pt-1 text-xs text-neutral-600">
                    <span className="font-medium text-neutral-800">Address: </span>
                    {activeSchool.address}
                  </div>
                )}

                {activeSchool.travelNotes && (
                  <div className="pt-1 text-xs text-neutral-600">
                    <span className="font-medium text-neutral-800">Travel & Access: </span>
                    {activeSchool.travelNotes}
                  </div>
                )}
              </div>
            </div>

            {/* EDITABLE BREAKS & LUNCH INTERVALS CARD */}
            <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
                  <Coffee className="w-4 h-4 text-neutral-700" />
                  <span>Breaks & Lunch Intervals</span>
                </div>
                <button
                  type="button"
                  onClick={openAddBreakModal}
                  className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-800 transition-colors"
                  title="Add a break or lunch period"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Break</span>
                </button>
              </div>

              <div className="space-y-2">
                {activeSchool.breaks.length === 0 ? (
                  <div className="text-xs text-neutral-400 italic py-2 text-center">
                    No breaks scheduled for this school.
                  </div>
                ) : (
                  activeSchool.breaks.map((b) => (
                    <div
                      key={b.id}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-amber-50/70 border border-amber-200/80 text-xs hover:border-amber-300 transition-colors shadow-2xs"
                    >
                      <div className="flex items-center gap-2">
                        <Coffee className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                        <div>
                          <div className="font-semibold text-neutral-900">{b.title}</div>
                          <div className="text-amber-800/80 font-mono text-[11px] mt-0.5">
                            {b.day} · {b.startTime}–{b.endTime}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openEditBreakModal(b)}
                          className="p-1 text-neutral-500 hover:text-neutral-900 rounded hover:bg-amber-100 transition-colors cursor-pointer"
                          title="Edit break"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteBreak(b.id)}
                          className="p-1 text-neutral-500 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete break"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Column 2: Year Groups & Subgroups */}
          <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
                <Layers className="w-4 h-4 text-neutral-700" />
                <span>Year Groups & Subgroups</span>
              </div>
              <span className="text-[11px] text-neutral-400">
                {schoolYearGroups.length} years · {schoolSubgroups.length} subgroups
              </span>
            </div>

            <p className="text-xs text-neutral-500">
              Subgroups allow restrictions (like swimming or PE) to apply to specific classes (e.g. Y7.1) without blocking other subgroups (e.g. Y7.4).
            </p>

            <div className="space-y-3">
              {schoolYearGroups.map((yg) => {
                const yearSubgroups = schoolSubgroups.filter((sg) => sg.yearGroupId === yg.id);

                return (
                  <div
                    key={yg.id}
                    className="p-3 rounded-lg border border-neutral-200 bg-neutral-50/40 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-sm text-neutral-900 flex items-center gap-1.5">
                        <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                        <span>Year {yg.name}</span>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedYearGroupIdForSubgroup(yg.id);
                          setShowAddSubgroupModal(true);
                        }}
                        className="text-[11px] font-medium text-neutral-700 hover:text-neutral-950 px-2 py-0.5 rounded bg-white border border-neutral-200 hover:bg-neutral-100 transition-colors"
                      >
                        + Add Subgroup
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pl-5">
                      {yearSubgroups.length === 0 ? (
                        <span className="text-[11px] text-neutral-400 italic">
                          No subgroups (entire year group applies)
                        </span>
                      ) : (
                        yearSubgroups.map((sg) => (
                          <span
                            key={sg.id}
                            className="inline-flex items-center text-xs font-mono bg-white border border-neutral-300 rounded px-2 py-0.5 text-neutral-800"
                          >
                            {sg.name}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Column 3: Multi-Level Restrictions */}
          <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
                <ShieldAlert className="w-4 h-4 text-neutral-700" />
                <span>Active Restrictions</span>
              </div>
              <button
                onClick={() => {
                  setNewResTargetId(activeSchool.id);
                  setNewResDay(activeSchool.teachingDays[0] || 'Monday');
                  setShowAddRestrictionModal(true);
                }}
                className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded bg-neutral-900 text-white hover:bg-neutral-800 transition-colors shadow-xs"
              >
                <Plus className="w-3 h-3" />
                <span>Add Restriction</span>
              </button>
            </div>

            <p className="text-xs text-neutral-500">
              Applied constraints prevent lessons from being booked during swimming, PE, assembly, or school events.
            </p>

            <div className="space-y-2.5">
              {schoolRestrictions.length === 0 ? (
                <div className="p-4 text-center text-xs text-neutral-400 italic bg-neutral-50 rounded-lg">
                  No restrictions defined for {activeSchool.name}.
                </div>
              ) : (
                schoolRestrictions.map((r) => {
                  let targetLabel = activeSchool.name;
                  if (r.scope === 'year') {
                    const yg = yearGroups.find((y) => y.id === r.targetId);
                    targetLabel = yg ? `Year ${yg.name}` : 'Year Group';
                  } else if (r.scope === 'subgroup') {
                    const sg = subgroups.find((s) => s.id === r.targetId);
                    targetLabel = sg ? `Subgroup ${sg.name}` : 'Subgroup';
                  }

                  return (
                    <div
                      key={r.id}
                      className="p-3 rounded-lg border border-neutral-200 bg-white shadow-2xs space-y-1.5 text-xs"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="font-semibold text-neutral-900">
                            {r.reason}
                          </span>
                          <span className="text-[11px] text-neutral-500 block">
                            Target: <span className="font-medium text-neutral-700">{targetLabel}</span>
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeleteRestriction(r.id)}
                          className="p-1 text-neutral-400 hover:text-rose-600 rounded transition-colors"
                          title="Delete restriction"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-mono tabular-nums text-neutral-600 pt-1 border-t border-neutral-100">
                        <span>
                          {r.dayOfWeek} · {r.startTime}–{r.endTime}
                        </span>
                        <span className="text-neutral-500">
                          {r.weekPattern === 'all'
                            ? 'All Weeks'
                            : r.weekPattern === 'week_a'
                            ? 'Week A only'
                            : 'Week B only'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </>
    )}

      {/* MODAL: ADD / EDIT BREAK INTERVAL */}
      {showBreakModal && activeSchool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-neutral-200 w-full max-w-sm p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
                <Coffee className="w-4 h-4 text-neutral-700" />
                <span>{editingBreakId ? 'Edit Break / Lunch' : 'Add Break / Lunch Interval'}</span>
              </h3>
              <button
                onClick={() => setShowBreakModal(false)}
                className="p-1 text-neutral-400 hover:text-neutral-700 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBreak} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-neutral-700 mb-1">
                  Break Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Morning Break, Lunch, Afternoon Break"
                  value={breakTitle}
                  onChange={(e) => setBreakTitle(e.target.value)}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-neutral-900"
                />
              </div>

              {!editingBreakId && (
                <div className="pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={breakApplyAllDays}
                      onChange={(e) => setBreakApplyAllDays(e.target.checked)}
                      className="rounded border-neutral-300 text-neutral-900"
                    />
                    <span className="text-neutral-700 font-medium">
                      Apply to all teaching days of {activeSchool.name}
                    </span>
                  </label>
                </div>
              )}

              {(!breakApplyAllDays || editingBreakId) && (
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">
                    Day of Week
                  </label>
                  <select
                    value={breakDay}
                    onChange={(e) => setBreakDay(e.target.value as DayOfWeek)}
                    className="w-full border border-neutral-300 rounded-lg px-3 py-2 bg-white text-neutral-900"
                  >
                    {activeSchool.teachingDays.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    required
                    value={breakStartTime}
                    step="300"
                    onChange={(e) => setBreakStartTime(e.target.value)}
                    className="w-full border border-neutral-300 rounded-lg px-3 py-2 font-mono text-neutral-900"
                  />
                </div>

                <div>
                  <label className="block font-medium text-neutral-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    required
                    value={breakEndTime}
                    step="300"
                    onChange={(e) => setBreakEndTime(e.target.value)}
                    className="w-full border border-neutral-300 rounded-lg px-3 py-2 font-mono text-neutral-900"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowBreakModal(false)}
                  className="px-3 py-1.5 text-neutral-600 hover:bg-neutral-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded shadow-xs"
                >
                  Save Break
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD NEW SCHOOL */}
      {showAddSchoolModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-neutral-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-50/50">
              <div>
                <h3 className="text-base font-semibold text-neutral-900">
                  Add New School Profile
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Create a school with teaching days, hours, standard lesson lengths, and week cycle
                </p>
              </div>
              <button
                onClick={() => setShowAddSchoolModal(false)}
                className="p-1 rounded-md text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSchool} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">
                    School Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. St Peter's Academy"
                    value={newSchoolName}
                    onChange={(e) => {
                      setNewSchoolName(e.target.value);
                      if (!newSchoolCode) {
                        setNewSchoolCode(e.target.value.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase());
                      }
                    }}
                    className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-neutral-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-medium text-neutral-700 mb-1">
                    School Code (Short ID)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ST_PETERS"
                    value={newSchoolCode}
                    onChange={(e) => setNewSchoolCode(e.target.value)}
                    className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-neutral-900 font-mono"
                  />
                </div>
              </div>

              {/* Teaching Days Selection */}
              <div>
                <label className="block font-medium text-neutral-700 mb-1.5">
                  Teaching Days * (Select attending days)
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {DAYS_OF_WEEK.map((d) => {
                    const isSelected = newSchoolDays.includes(d);
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            if (newSchoolDays.length > 1) {
                              setNewSchoolDays(newSchoolDays.filter((day) => day !== d));
                            }
                          } else {
                            setNewSchoolDays([...newSchoolDays, d]);
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

              {/* Color Theme Selector */}
              <div>
                <label className="block font-medium text-neutral-700 mb-1.5">
                  Gentle Pastel Color Theme
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {COLOR_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setNewSchoolTheme(opt.id)}
                      className={`flex items-center gap-1.5 p-2 rounded-lg border text-left text-xs transition-all ${
                        newSchoolTheme === opt.id
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

              {/* Hours and Lesson Duration */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={newSchoolStart}
                    step="300"
                    onChange={(e) => setNewSchoolStart(e.target.value)}
                    className="w-full border border-neutral-300 rounded-lg px-2.5 py-2 font-mono text-neutral-900"
                  />
                </div>

                <div>
                  <label className="block font-medium text-neutral-700 mb-1">
                    Finish Time
                  </label>
                  <input
                    type="time"
                    value={newSchoolEnd}
                    step="300"
                    onChange={(e) => setNewSchoolEnd(e.target.value)}
                    className="w-full border border-neutral-300 rounded-lg px-2.5 py-2 font-mono text-neutral-900"
                  />
                </div>

                <div>
                  <label className="block font-medium text-neutral-700 mb-1">
                    Lesson Duration
                  </label>
                  <select
                    value={newSchoolDuration}
                    onChange={(e) => setNewSchoolDuration(parseInt(e.target.value, 10))}
                    className="w-full border border-neutral-300 rounded-lg px-2.5 py-2 bg-white text-neutral-900"
                  >
                    <option value={20}>20 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={40}>40 minutes</option>
                  </select>
                </div>
              </div>

              {/* Week Cycle and Terminology */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">
                    Current Active Week
                  </label>
                  <select
                    value={newSchoolWeekCycle}
                    onChange={(e) => setNewSchoolWeekCycle(e.target.value as WeekCycle)}
                    className="w-full border border-neutral-300 rounded-lg px-2.5 py-2 bg-white text-neutral-900"
                  >
                    <option value="A">Week A (or 1)</option>
                    <option value="B">Week B (or 2)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-neutral-700 mb-1">
                    Terminology Preference
                  </label>
                  <select
                    value={newSchoolTerminology}
                    onChange={(e) => setNewSchoolTerminology(e.target.value as CycleTerminology)}
                    className="w-full border border-neutral-300 rounded-lg px-2.5 py-2 bg-white text-neutral-900"
                  >
                    <option value="week_ab">Week A / Week B</option>
                    <option value="week_12">Week 1 / Week 2</option>
                  </select>
                </div>
              </div>

              {/* Initial Year Groups */}
              <div>
                <label className="block font-medium text-neutral-700 mb-1">
                  Initial Year Groups (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Y3, Y4, Y5, Y6"
                  value={newSchoolYears}
                  onChange={(e) => setNewSchoolYears(e.target.value)}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-neutral-900"
                />
              </div>

              {/* Address / Travel Notes */}
              <div>
                <label className="block font-medium text-neutral-700 mb-1">
                  Access & Travel Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dedicated music room, park in staff car park"
                  value={newSchoolTravelNotes}
                  onChange={(e) => setNewSchoolTravelNotes(e.target.value)}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-neutral-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowAddSchoolModal(false)}
                  className="px-3 py-1.5 text-neutral-600 hover:bg-neutral-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-md shadow-xs"
                >
                  Create School Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT ACTIVE SCHOOL FULL DETAILS */}
      {showEditSchoolModal && activeSchool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-neutral-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-50/50">
              <div>
                <h3 className="text-base font-semibold text-neutral-900">
                  Edit School Details: {activeSchool.name}
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Update teaching days, hours, standard lesson lengths, color theme, and access details
                </p>
              </div>
              <button
                onClick={() => setShowEditSchoolModal(false)}
                className="p-1 rounded-md text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditSchool} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">
                    School Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editSchoolName}
                    onChange={(e) => setEditSchoolName(e.target.value)}
                    className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-neutral-900 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-medium text-neutral-700 mb-1">
                    School Code
                  </label>
                  <input
                    type="text"
                    value={editSchoolCode}
                    onChange={(e) => setEditSchoolCode(e.target.value)}
                    className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-neutral-900 font-mono"
                  />
                </div>
              </div>

              {/* Teaching Days Selection */}
              <div>
                <label className="block font-medium text-neutral-700 mb-1.5">
                  Teaching Days *
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {DAYS_OF_WEEK.map((d) => {
                    const isSelected = editSchoolDays.includes(d);
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            if (editSchoolDays.length > 1) {
                              setEditSchoolDays(editSchoolDays.filter((day) => day !== d));
                            }
                          } else {
                            setEditSchoolDays([...editSchoolDays, d]);
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

              {/* Color Theme Selector */}
              <div>
                <label className="block font-medium text-neutral-700 mb-1.5">
                  Gentle Pastel Color Theme
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {COLOR_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setEditSchoolTheme(opt.id)}
                      className={`flex items-center gap-1.5 p-2 rounded-lg border text-left text-xs transition-all ${
                        editSchoolTheme === opt.id
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

              {/* Day-Specific Availability Hours */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-medium text-neutral-800 text-xs">
                    Day-Specific Teaching Hours
                  </label>
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-neutral-500">Standard Lesson:</span>
                    <select
                      value={editSchoolDuration}
                      onChange={(e) => setEditSchoolDuration(parseInt(e.target.value, 10))}
                      className="border border-neutral-300 rounded px-2 py-1 text-xs bg-white text-neutral-800 font-medium"
                    >
                      <option value={20}>20 minutes</option>
                      <option value={30}>30 minutes</option>
                      <option value={40}>40 minutes</option>
                      {![20, 30, 40].includes(editSchoolDuration) && (
                        <option value={editSchoolDuration}>{editSchoolDuration} minutes (Legacy)</option>
                      )}
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
                        const isTeaching = editSchoolDays.includes(day);
                        const schedule = editDaySchedule[day] || { startTime: '09:00', endTime: '15:30', standardLessonDuration: 30 };

                        return (
                          <tr key={day} className={isTeaching ? 'bg-white' : 'bg-neutral-50/50 text-neutral-400'}>
                            <td className="px-3 py-2 font-medium">
                              <span className={isTeaching ? 'text-neutral-900 font-semibold' : 'text-neutral-400'}>{day}</span>
                            </td>
                            <td className="px-3 py-2 text-center">
                              <input
                                type="checkbox"
                                checked={isTeaching}
                                onChange={() => {
                                  if (isTeaching) {
                                    setEditSchoolDays(editSchoolDays.filter((d) => d !== day));
                                  } else {
                                    setEditSchoolDays([...editSchoolDays, day]);
                                  }
                                }}
                                className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 cursor-pointer"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="time"
                                step="300"
                                disabled={!isTeaching}
                                value={schedule.startTime}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setEditDaySchedule((prev) => ({
                                    ...prev,
                                    [day]: { ...prev[day], startTime: val },
                                  }));
                                }}
                                className="border border-neutral-200 rounded px-2 py-1 font-mono text-xs text-neutral-900 disabled:text-neutral-400 disabled:bg-neutral-100"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="time"
                                step="300"
                                disabled={!isTeaching}
                                value={schedule.endTime}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setEditDaySchedule((prev) => ({
                                    ...prev,
                                    [day]: { ...prev[day], endTime: val },
                                  }));
                                }}
                                className="border border-neutral-200 rounded px-2 py-1 font-mono text-xs text-neutral-900 disabled:text-neutral-400 disabled:bg-neutral-100"
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. Church Lane"
                  value={editSchoolAddress}
                  onChange={(e) => setEditSchoolAddress(e.target.value)}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-neutral-900"
                />
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">
                  Access & Travel Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Practice room 3 in Arts block, park in bay 4"
                  value={editSchoolTravelNotes}
                  onChange={(e) => setEditSchoolTravelNotes(e.target.value)}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-neutral-900"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => handleDeleteSchool(activeSchool.id)}
                  disabled={schools.length <= 1}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete School</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowEditSchoolModal(false)}
                    className="px-3 py-1.5 text-neutral-600 hover:bg-neutral-100 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-md shadow-xs"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Subgroup */}
      {showAddSubgroupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-neutral-200 w-full max-w-sm p-6 space-y-4">
            <h3 className="text-sm font-semibold text-neutral-900">
              Add Subgroup to {yearGroups.find((y) => y.id === selectedYearGroupIdForSubgroup)?.name}
            </h3>
            <form onSubmit={handleCreateSubgroup} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Subgroup Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Y7.3 or 7B"
                  value={newSubgroupName}
                  onChange={(e) => setNewSubgroupName(e.target.value)}
                  className="w-full text-xs border border-neutral-300 rounded-lg px-3 py-2 text-neutral-900"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddSubgroupModal(false)}
                  className="px-3 py-1.5 text-xs text-neutral-600 hover:bg-neutral-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-neutral-900 rounded hover:bg-neutral-800"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Multi-Level Restriction */}
      {showAddRestrictionModal && activeSchool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-neutral-200 w-full max-w-md p-6 space-y-4">
            <h3 className="text-sm font-semibold text-neutral-900">
              Add Timetable Restriction
            </h3>
            <form onSubmit={handleSaveRestriction} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-neutral-700 mb-1">
                  Scope Level
                </label>
                <select
                  value={newResScope}
                  onChange={(e) => {
                    const sc = e.target.value as RestrictionScope;
                    setNewResScope(sc);
                    if (sc === 'school') setNewResTargetId(activeSchool.id);
                    else if (sc === 'year') setNewResTargetId(schoolYearGroups[0]?.id || '');
                    else if (sc === 'subgroup') setNewResTargetId(schoolSubgroups[0]?.id || '');
                  }}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 bg-white text-neutral-900"
                >
                  <option value="subgroup">Year Subgroup (e.g. Y7.1 only)</option>
                  <option value="year">Entire Year Group (e.g. all of Y6)</option>
                  <option value="school">School-Wide (all pupils)</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">
                  Target Entity
                </label>
                {newResScope === 'school' && (
                  <div className="p-2 rounded bg-neutral-100 text-neutral-800 font-medium">
                    {activeSchool.name}
                  </div>
                )}
                {newResScope === 'year' && (
                  <select
                    value={newResTargetId}
                    onChange={(e) => setNewResTargetId(e.target.value)}
                    className="w-full border border-neutral-300 rounded-lg px-3 py-2 bg-white text-neutral-900"
                  >
                    {schoolYearGroups.map((yg) => (
                      <option key={yg.id} value={yg.id}>
                        Year {yg.name}
                      </option>
                    ))}
                  </select>
                )}
                {newResScope === 'subgroup' && (
                  <select
                    value={newResTargetId}
                    onChange={(e) => setNewResTargetId(e.target.value)}
                    className="w-full border border-neutral-300 rounded-lg px-3 py-2 bg-white text-neutral-900"
                  >
                    {schoolSubgroups.map((sg) => (
                      <option key={sg.id} value={sg.id}>
                        Subgroup {sg.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">
                  Reason / Activity
                </label>
                <input
                  type="text"
                  placeholder="e.g. Swimming, PE, Choir, Assembly"
                  value={newResReason}
                  onChange={(e) => setNewResReason(e.target.value)}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-neutral-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">
                    Day of Week
                  </label>
                  <select
                    value={newResDay}
                    onChange={(e) => setNewResDay(e.target.value as DayOfWeek)}
                    className="w-full border border-neutral-300 rounded-lg px-3 py-2 bg-white text-neutral-900"
                  >
                    {activeSchool.teachingDays.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-neutral-700 mb-1">
                    Week Cycle
                  </label>
                  <select
                    value={newResWeekPattern}
                    onChange={(e) => setNewResWeekPattern(e.target.value as WeekPattern)}
                    className="w-full border border-neutral-300 rounded-lg px-3 py-2 bg-white text-neutral-900"
                  >
                    <option value="all">Every Week (A & B)</option>
                    <option value="week_a">Week A Only</option>
                    <option value="week_b">Week B Only</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={newResStart}
                    step="300"
                    onChange={(e) => setNewResStart(e.target.value)}
                    className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-neutral-900 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block font-medium text-neutral-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={newResEnd}
                    step="300"
                    onChange={(e) => setNewResEnd(e.target.value)}
                    className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-neutral-900 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowAddRestrictionModal(false)}
                  className="px-3 py-1.5 text-neutral-600 hover:bg-neutral-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-semibold text-white bg-neutral-900 rounded hover:bg-neutral-800"
                >
                  Save Restriction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import {
  DayOfWeek,
  WeekCycle,
  TimetableSlot,
  School,
  Student,
  YearGroup,
  YearSubgroup,
  Restriction,
  TemporaryException,
  TeacherProfile,
  SchedulingIssue,
  ConflictAlternative,
  BreakPeriod,
} from '../../types';
import { ValidationContext, validateSlot } from '../../utils/constraintChecker';
import { TimetableControls, TimetableViewMode, CycleDisplayMode } from './TimetableControls';
import { TimetableGrid } from './TimetableGrid';
import { LessonInspectorModal } from './LessonInspectorModal';
import { AddLessonModal } from './AddLessonModal';
import { SchoolCyclesModal } from './SchoolCyclesModal';
import { BreakEditorModal } from './BreakEditorModal';
import { AddSchoolModal } from '../schools/AddSchoolModal';
import { StudentLimitationsModal } from '../students/StudentLimitationsModal';
import { addMinutes } from '../../utils/timeUtils';

interface TimetableMainProps {
  context: ValidationContext;
  activeCycle: WeekCycle;
  setActiveCycle: (cycle: WeekCycle) => void;
  onUpdateSlots: (slots: TimetableSlot[]) => void;
  onUpdateSchools: (schools: School[]) => void;
  onUpdateStudents?: (students: Student[]) => void;
  onUpdateRestrictions?: (restrictions: Restriction[]) => void;
  onAddSchool?: (school: School, yearGroups: YearGroup[]) => void;
  onAddException: (ex: TemporaryException) => void;
  onOpenOptimizer: () => void;
  onOpenConflicts: () => void;
}

export const TimetableMain: React.FC<TimetableMainProps> = ({
  context,
  activeCycle,
  setActiveCycle,
  onUpdateSlots,
  onUpdateSchools,
  onUpdateStudents,
  onUpdateRestrictions,
  onAddSchool,
  onAddException,
  onOpenOptimizer,
  onOpenConflicts,
}) => {
  const [viewMode, setViewMode] = useState<TimetableViewMode>('whole_week');
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>(context.schools[0]?.id || '');
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('Monday');
  const [cycleDisplayMode, setCycleDisplayMode] = useState<CycleDisplayMode>('active_schools');

  // Inspector and Add modals
  const [inspectedSlot, setInspectedSlot] = useState<TimetableSlot | null>(null);
  const [limitationsStudent, setLimitationsStudent] = useState<Student | null>(null);
  const [emptySlotInfo, setEmptySlotInfo] = useState<{ day: DayOfWeek; time: string; schoolId: string; weekCycle: WeekCycle } | null>(null);
  const [showSchoolCyclesModal, setShowSchoolCyclesModal] = useState<boolean>(false);
  const [showAddSchoolModal, setShowAddSchoolModal] = useState<boolean>(false);
  const [showNewBreakModal, setShowNewBreakModal] = useState<boolean>(false);
  const [editingBreak, setEditingBreak] = useState<{ brk: BreakPeriod; school: School } | null>(null);

  // Toggle school's independent active week cycle
  const handleToggleSchoolCycle = (schoolId: string) => {
    const updated = context.schools.map((sc) => {
      if (sc.id === schoolId) {
        const nextCycle: WeekCycle = sc.currentWeekCycle === 'A' ? 'B' : 'A';
        return {
          ...sc,
          currentWeekCycle: nextCycle,
        };
      }
      return sc;
    });
    onUpdateSchools(updated);
  };

  const handleUpdateSchoolCycle = (
    schoolId: string,
    cycle: WeekCycle,
    notes?: string,
    terminology?: any
  ) => {
    const updated = context.schools.map((sc) => {
      if (sc.id === schoolId) {
        return {
          ...sc,
          currentWeekCycle: cycle,
          cycleNotes: notes !== undefined ? notes : sc.cycleNotes,
          cycleTerminology: terminology || sc.cycleTerminology,
        };
      }
      return sc;
    });
    onUpdateSchools(updated);
  };

  const handleSyncAllSchools = (cycle: WeekCycle) => {
    const updated = context.schools.map((sc) => ({
      ...sc,
      currentWeekCycle: cycle,
      cycleNotes: `Synced to Week ${cycle}`,
    }));
    onUpdateSchools(updated);
  };

  // Count conflicts
  const activeConflictCount = context.timetableSlots.filter((slot) => {
    const school = context.schools.find((s) => s.id === slot.schoolId);
    if (!school) return false;
    // Check if slot corresponds to this school's active cycle
    if (slot.weekCycle !== school.currentWeekCycle) return false;

    const val = validateSlot(
      slot.studentId,
      slot.schoolId,
      slot.day,
      slot.startTime,
      slot.endTime,
      slot.weekCycle,
      context,
      slot.id
    );
    return val.severity === 'hard_violation';
  }).length;

  // Handlers for slot changes
  const handleUpdateSlot = (updatedSlot: TimetableSlot) => {
    const updated = context.timetableSlots.map((s) =>
      s.id === updatedSlot.id ? updatedSlot : s
    );
    onUpdateSlots(updated);
  };

  const handleSwapStudents = (slotAId: string, slotBId: string) => {
    const slotA = context.timetableSlots.find((s) => s.id === slotAId);
    const slotB = context.timetableSlots.find((s) => s.id === slotBId);
    if (!slotA || !slotB) return;

    const updated = context.timetableSlots.map((s) => {
      if (s.id === slotAId) {
        const dur = slotB.duration;
        return {
          ...s,
          studentId: slotB.studentId,
          duration: dur,
          endTime: addMinutes(s.startTime, dur),
          isManualOverride: true,
        };
      }
      if (s.id === slotBId) {
        const dur = slotA.duration;
        return {
          ...s,
          studentId: slotA.studentId,
          duration: dur,
          endTime: addMinutes(s.startTime, dur),
          isManualOverride: true,
        };
      }
      return s;
    });
    onUpdateSlots(updated);
  };

  const handleDeleteSlot = (slotId: string) => {
    onUpdateSlots(context.timetableSlots.filter((s) => s.id !== slotId));
  };

  const handleAddSlot = (newSlot: TimetableSlot) => {
    onUpdateSlots([...context.timetableSlots, newSlot]);
  };

  const handleDropSlot = (
    slotId: string,
    targetDay: DayOfWeek,
    targetStartTime: string,
    targetSchoolId: string,
    weekCycle: WeekCycle
  ) => {
    const slot = context.timetableSlots.find((s) => s.id === slotId);
    if (!slot) return;

    const targetEndTime = addMinutes(targetStartTime, slot.duration);

    // Update slot position and cycle to match target school's cycle
    const updated = context.timetableSlots.map((s) => {
      if (s.id === slotId) {
        return {
          ...s,
          day: targetDay,
          startTime: targetStartTime,
          endTime: targetEndTime,
          schoolId: targetSchoolId,
          weekCycle: weekCycle,
          isManualOverride: true,
        };
      }
      return s;
    });
    onUpdateSlots(updated);
  };

  const handleAddTemporaryException = (
    studentId: string,
    reason: string,
    type: 'absence' | 'trip' | 'exam'
  ) => {
    const student = context.students.find((s) => s.id === studentId);
    const school = context.schools.find((s) => s.id === student?.schoolId);
    const cycle = school?.currentWeekCycle || 'A';

    const newEx: TemporaryException = {
      id: `ex_${Date.now()}`,
      targetScope: 'student',
      targetId: studentId,
      title: `${student?.name || 'Student'} · ${reason}`,
      date: new Date().toISOString().split('T')[0],
      weekCycle: cycle,
      day: selectedDay,
      type,
      reason,
    };
    onAddException(newEx);
  };

  // Breaks Management Handlers
  const handleSaveBreak = (updatedBreak: BreakPeriod, applyAllDays: boolean) => {
    const school = context.schools.find((s) => s.id === updatedBreak.schoolId);
    if (!school) return;

    let newBreaks = [...school.breaks];
    const existingIdx = newBreaks.findIndex((b) => b.id === updatedBreak.id);

    if (applyAllDays) {
      // Filter out existing break with this ID or title and create for all teaching days
      newBreaks = newBreaks.filter((b) => b.id !== updatedBreak.id && b.title !== updatedBreak.title);
      school.teachingDays.forEach((d, idx) => {
        newBreaks.push({
          id: `brk_${school.id}_${Date.now()}_${idx}`,
          schoolId: school.id,
          title: updatedBreak.title,
          day: d,
          startTime: updatedBreak.startTime,
          endTime: updatedBreak.endTime,
        });
      });
    } else {
      if (existingIdx >= 0) {
        newBreaks[existingIdx] = updatedBreak;
      } else {
        newBreaks.push(updatedBreak);
      }
    }

    const updatedSchools = context.schools.map((s) =>
      s.id === school.id ? { ...s, breaks: newBreaks } : s
    );
    onUpdateSchools(updatedSchools);
  };

  const handleDeleteBreak = (breakId: string) => {
    const updatedSchools = context.schools.map((s) => ({
      ...s,
      breaks: s.breaks.filter((b) => b.id !== breakId),
    }));
    onUpdateSchools(updatedSchools);
  };

  const handleAddSchoolInternal = (newSchool: School, newYearGroups: YearGroup[]) => {
    if (onAddSchool) {
      onAddSchool(newSchool, newYearGroups);
    } else {
      onUpdateSchools([...context.schools, newSchool]);
    }
    setSelectedSchoolId(newSchool.id);
  };

  const handleUpdateSingleStudent = (updatedStudent: Student) => {
    if (onUpdateStudents) {
      const updatedList = context.students.map((s) =>
        s.id === updatedStudent.id ? updatedStudent : s
      );
      onUpdateStudents(updatedList);
    }
    if (limitationsStudent && limitationsStudent.id === updatedStudent.id) {
      setLimitationsStudent(updatedStudent);
    }
  };

  const focusedSchool =
    context.schools.find((s) => s.id === selectedSchoolId) || context.schools[0];

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Timetable Sub-header Controls */}
      <TimetableControls
        viewMode={viewMode}
        setViewMode={setViewMode}
        selectedSchoolId={selectedSchoolId}
        setSelectedSchoolId={setSelectedSchoolId}
        selectedDay={selectedDay}
        setSelectedDay={setSelectedDay}
        cycleDisplayMode={cycleDisplayMode}
        setCycleDisplayMode={setCycleDisplayMode}
        schools={context.schools}
        onToggleSchoolCycle={handleToggleSchoolCycle}
        onOpenSchoolCyclesModal={() => setShowSchoolCyclesModal(true)}
        totalScheduledLessons={context.timetableSlots.length}
        totalConflicts={activeConflictCount}
        onAddLesson={() => {
          const firstSchool = context.schools[0];
          setEmptySlotInfo({
            day: selectedDay,
            time: '09:00',
            schoolId: firstSchool?.id || '',
            weekCycle: firstSchool?.currentWeekCycle || 'A',
          });
        }}
        onUpdateSchools={onUpdateSchools}
        onAddSchoolClick={() => setShowAddSchoolModal(true)}
        onAddBreakClick={() => setShowNewBreakModal(true)}
      />

      {/* Main Timetable Visual Canvas */}
      <TimetableGrid
        viewMode={viewMode}
        selectedSchoolId={selectedSchoolId}
        selectedDay={selectedDay}
        cycleDisplayMode={cycleDisplayMode}
        context={context}
        onSlotClick={(slot) => setInspectedSlot(slot)}
        onEditLimitations={(student) => setLimitationsStudent(student)}
        onEmptySlotClick={(day, time, schoolId, weekCycle) => {
          setEmptySlotInfo({ day, time, schoolId, weekCycle });
        }}
        onDropSlot={handleDropSlot}
        onSwapSlots={handleSwapStudents}
        onToggleSchoolCycle={handleToggleSchoolCycle}
        onBreakClick={(brk, school) => setEditingBreak({ brk, school })}
      />

      {/* Lesson Inspector Modal (Manual Edit / Move / Swap / Exception / Limitations) */}
      {inspectedSlot && (
        <LessonInspectorModal
          slot={inspectedSlot}
          context={context}
          onClose={() => setInspectedSlot(null)}
          onUpdateSlot={handleUpdateSlot}
          onSwapStudents={handleSwapStudents}
          onDeleteSlot={handleDeleteSlot}
          onAddTemporaryException={handleAddTemporaryException}
          onEditLimitations={(student) => setLimitationsStudent(student)}
          onUpdateStudent={handleUpdateSingleStudent}
          onUpdateRestrictions={onUpdateRestrictions}
        />
      )}

      {/* Student Timetable Limitations Modal */}
      {limitationsStudent && (
        <StudentLimitationsModal
          student={limitationsStudent}
          school={context.schools.find((s) => s.id === limitationsStudent.schoolId)}
          isOpen={true}
          onClose={() => setLimitationsStudent(null)}
          restrictions={context.restrictions}
          onUpdateStudent={handleUpdateSingleStudent}
          onUpdateRestrictions={(newRestrictions) => {
            if (onUpdateRestrictions) {
              onUpdateRestrictions(newRestrictions);
            }
          }}
        />
      )}

      {/* Add Lesson Modal */}
      {emptySlotInfo && (
        <AddLessonModal
          initialDay={emptySlotInfo.day}
          initialStartTime={emptySlotInfo.time}
          initialSchoolId={emptySlotInfo.schoolId}
          weekCycle={emptySlotInfo.weekCycle}
          context={context}
          onClose={() => setEmptySlotInfo(null)}
          onAddSlot={handleAddSlot}
        />
      )}

      {/* Edit Existing Break Modal */}
      {editingBreak && (
        <BreakEditorModal
          breakPeriod={editingBreak.brk}
          school={editingBreak.school}
          onClose={() => setEditingBreak(null)}
          onSave={handleSaveBreak}
          onDelete={handleDeleteBreak}
        />
      )}

      {/* Add New Break Modal */}
      {showNewBreakModal && focusedSchool && (
        <BreakEditorModal
          breakPeriod={null}
          school={focusedSchool}
          initialDay={selectedDay}
          initialStartTime="10:30"
          onClose={() => setShowNewBreakModal(false)}
          onSave={handleSaveBreak}
        />
      )}

      {/* Add School Modal */}
      {showAddSchoolModal && (
        <AddSchoolModal
          onClose={() => setShowAddSchoolModal(false)}
          onAddSchool={handleAddSchoolInternal}
        />
      )}

      {/* School Week Cycles & Irregular Notes Modal */}
      {showSchoolCyclesModal && (
        <SchoolCyclesModal
          schools={context.schools}
          onUpdateSchoolCycle={handleUpdateSchoolCycle}
          onSyncAllSchools={handleSyncAllSchools}
          onClose={() => setShowSchoolCyclesModal(false)}
        />
      )}
    </div>
  );
};

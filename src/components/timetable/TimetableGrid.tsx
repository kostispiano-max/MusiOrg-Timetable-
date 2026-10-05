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
  DAYS_OF_WEEK,
} from '../../types';
import { ValidationContext, validateSlot } from '../../utils/constraintChecker';
import { timeToMinutes, minutesToTime, addMinutes } from '../../utils/timeUtils';
import { TimetableViewMode, CycleDisplayMode } from './TimetableControls';
import {
  AlertCircle,
  AlertTriangle,
  Coffee,
  Sparkles,
  UserX,
  ArrowLeftRight,
  GripVertical,
  SlidersHorizontal,
  Edit2,
} from 'lucide-react';
import { getSchoolTheme } from '../../utils/themeUtils';
import { BreakPeriod } from '../../types';

interface TimetableGridProps {
  viewMode: TimetableViewMode;
  selectedSchoolId: string;
  selectedDay: DayOfWeek;
  cycleDisplayMode: CycleDisplayMode;
  context: ValidationContext;
  onSlotClick: (slot: TimetableSlot) => void;
  onEditLimitations?: (student: Student) => void;
  onEmptySlotClick: (day: DayOfWeek, startTime: string, schoolId: string, weekCycle: WeekCycle) => void;
  onDropSlot: (slotId: string, targetDay: DayOfWeek, targetStartTime: string, targetSchoolId: string, weekCycle: WeekCycle) => void;
  onSwapSlots?: (slotAId: string, slotBId: string) => void;
  onToggleSchoolCycle: (schoolId: string) => void;
  onBreakClick?: (brk: BreakPeriod, school: School) => void;
}

type DragOverTarget =
  | {
      type: 'empty';
      day: DayOfWeek;
      time: string;
      schoolId: string;
      weekCycle: WeekCycle;
    }
  | {
      type: 'swap';
      targetSlotId: string;
      day: DayOfWeek;
      schoolId: string;
      weekCycle: WeekCycle;
    };

export const TimetableGrid: React.FC<TimetableGridProps> = ({
  viewMode,
  selectedSchoolId,
  selectedDay,
  cycleDisplayMode,
  context,
  onSlotClick,
  onEditLimitations,
  onEmptySlotClick,
  onDropSlot,
  onSwapSlots,
  onToggleSchoolCycle,
  onBreakClick,
}) => {
  // Drag and drop state
  const [draggedSlotId, setDraggedSlotId] = useState<string | null>(null);
  const [dragOverTarget, setDragOverTarget] = useState<DragOverTarget | null>(null);

  // Find dragged slot and student for preview
  const draggedSlot = context.timetableSlots.find((s) => s.id === draggedSlotId);
  const draggedStudent = context.students.find((s) => s.id === draggedSlot?.studentId);

  // Determine which days and schools to render
  const daysToRender: DayOfWeek[] =
    viewMode === 'by_day' ? [selectedDay] : DAYS_OF_WEEK;

  // Filter schools for this column or view
  const getSchoolsForDay = (day: DayOfWeek): School[] => {
    return context.schools.filter((sc) => {
      if (selectedSchoolId !== 'all' && viewMode === 'by_school') {
        return sc.id === selectedSchoolId && sc.teachingDays.includes(day);
      }
      return sc.teachingDays.includes(day);
    });
  };

  // Helper to determine active week cycle for a school / day
  const getEffectiveCycle = (school?: School): WeekCycle => {
    if (cycleDisplayMode === 'force_a') return 'A';
    if (cycleDisplayMode === 'force_b') return 'B';
    return school?.currentWeekCycle || 'A';
  };

  // Find school open/close range for the time scale dynamically
  let earliestMin = 8 * 60 + 30; // 08:30 default
  let latestMin = 16 * 60; // 16:00 default

  context.schools.forEach((sc) => {
    DAYS_OF_WEEK.forEach((d) => {
      if (sc.teachingDays.includes(d) && sc.dayHours?.[d]) {
        const sM = timeToMinutes(sc.dayHours[d].startTime);
        const eM = timeToMinutes(sc.dayHours[d].endTime);
        if (sM < earliestMin) earliestMin = Math.floor(sM / 30) * 30;
        if (eM > latestMin) latestMin = Math.ceil(eM / 30) * 30;
      }
    });
  });

  const globalStartMin = Math.min(8 * 60 + 30, earliestMin);
  const globalEndMin = Math.max(16 * 60, latestMin);
  const stepMin = 30; // 30-min grid intervals

  const timeRows: string[] = [];
  for (let m = globalStartMin; m <= globalEndMin; m += stepMin) {
    timeRows.push(minutesToTime(m));
  }

  // Position helper: calculates top and height in px
  const getPosition = (startStr: string, endStr: string) => {
    const startM = timeToMinutes(startStr);
    const endM = timeToMinutes(endStr);
    const clampedStart = Math.max(startM, globalStartMin);
    const clampedEnd = Math.min(endM, globalEndMin);

    const topPx = ((clampedStart - globalStartMin) / 30) * 48;
    const heightPx = Math.max(((clampedEnd - clampedStart) / 30) * 48, 26);

    return { top: `${topPx}px`, height: `${heightPx}px` };
  };

  return (
    <div className="flex-1 overflow-x-auto bg-neutral-50/50 p-4 sm:p-6">
      <div className="min-w-[760px] bg-white border border-neutral-200 rounded-xl shadow-xs overflow-hidden">
        {/* Table Header: Days with Independent School Week Indicators */}
        <div
          className="grid border-b border-neutral-200 divide-x divide-neutral-200 bg-neutral-50/70"
          style={{ gridTemplateColumns: `72px repeat(${daysToRender.length}, minmax(0, 1fr))` }}
        >
          {/* Top-left corner time label */}
          <div className="p-3 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider text-center flex items-center justify-center">
            Time
          </div>

          {daysToRender.map((day) => {
            const schoolsOnDay = getSchoolsForDay(day);
            const activeSchool = schoolsOnDay[0];
            const effectiveCycle = getEffectiveCycle(activeSchool);
            const term = activeSchool?.cycleTerminology || 'week_ab';
            const cycleLabel =
              term === 'week_12'
                ? effectiveCycle === 'A'
                  ? 'Week 1'
                  : 'Week 2'
                : `Week ${effectiveCycle}`;
            const dayTheme = activeSchool ? getSchoolTheme(activeSchool.colorTheme) : null;

            return (
              <div
                key={day}
                className={`p-2.5 text-center flex flex-col items-center justify-between transition-colors ${
                  dayTheme ? dayTheme.headerBg : 'bg-neutral-50/70'
                }`}
              >
                <div>
                  <div className="text-sm font-semibold text-neutral-900 flex items-center justify-center gap-1.5">
                    {dayTheme && <span className={`w-2 h-2 rounded-full ${dayTheme.dotColor}`} />}
                    <span>{day}</span>
                  </div>
                  <div className="text-[11px] text-neutral-600 truncate max-w-[170px] mt-0.5 font-medium">
                    {schoolsOnDay.length > 0
                      ? schoolsOnDay.map((s) => s.name).join(', ')
                      : 'No teaching scheduled'}
                  </div>
                  {activeSchool?.dayHours?.[day] && schoolsOnDay.length > 0 && (
                    <div className="text-[10px] text-neutral-500 font-mono mt-0.5">
                      {activeSchool.dayHours[day].startTime}–{activeSchool.dayHours[day].endTime}
                    </div>
                  )}
                </div>

                {activeSchool && (
                  <div className="mt-1.5 flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => onToggleSchoolCycle(activeSchool.id)}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white hover:bg-neutral-900 hover:text-white border border-neutral-200/90 text-[11px] tabular-nums font-semibold transition-all shadow-2xs cursor-pointer text-neutral-800"
                      title={`Click to flip ${activeSchool.name} week cycle (currently ${cycleLabel})`}
                    >
                      <span>{cycleLabel}</span>
                      <ArrowLeftRight className="w-2.5 h-2.5 opacity-60" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Timetable Body Grid */}
        <div className="relative">
          {/* Background Grid Lines */}
          <div className="divide-y divide-neutral-100">
            {timeRows.map((timeStr) => (
              <div
                key={timeStr}
                className="grid divide-x divide-neutral-100 min-h-[48px]"
                style={{ gridTemplateColumns: `72px repeat(${daysToRender.length}, minmax(0, 1fr))` }}
              >
                {/* Time Axis Column */}
                <div className="py-2.5 px-2 text-right text-xs font-semibold tabular-nums text-neutral-400 select-none bg-neutral-50/40 tracking-tight">
                  {timeStr}
                </div>

                {/* Day Columns - Clickable slots */}
                {daysToRender.map((day) => {
                  const schoolsOnDay = getSchoolsForDay(day);
                  const activeSchool = schoolsOnDay[0];
                  const effectiveCycle = getEffectiveCycle(activeSchool);
                  const dayTheme = activeSchool ? getSchoolTheme(activeSchool.colorTheme) : null;

                  return (
                    <div
                      key={`${day}_${timeStr}`}
                      onClick={() => {
                        if (activeSchool) {
                          onEmptySlotClick(day, timeStr, activeSchool.id, effectiveCycle);
                        }
                      }}
                      className={`relative group transition-colors min-h-[48px] ${
                        !activeSchool
                          ? 'bg-neutral-50/40 cursor-not-allowed'
                          : `${dayTheme ? dayTheme.bgTint : 'bg-white'} hover:bg-neutral-50/90 cursor-pointer`
                      }`}
                    >
                      {activeSchool && (
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-center pointer-events-none transition-opacity">
                          <span className="text-[11px] text-neutral-400 font-semibold tabular-nums">
                            + {timeStr}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* OVERLAY LAYER: Breaks, Restrictions, and Lessons */}
          <div
            className="absolute inset-0 grid divide-x divide-transparent pointer-events-none"
            style={{ gridTemplateColumns: `72px repeat(${daysToRender.length}, minmax(0, 1fr))` }}
          >
            {/* Blank placeholder for time gutter */}
            <div />

            {/* Overlays for each day column */}
            {daysToRender.map((day) => {
              const schoolsOnDay = getSchoolsForDay(day);
              const activeSchool = schoolsOnDay[0];
              const effectiveCycle = getEffectiveCycle(activeSchool);

              // Collect breaks for this day
              const breaksOnDay = schoolsOnDay.flatMap((sc) =>
                sc.breaks.filter((b) => b.day === day)
              );

              // Collect restrictions for this day matching effectiveCycle
              const restrictionsOnDay = context.restrictions.filter((r) => {
                if (r.dayOfWeek !== day) return false;
                if (r.weekPattern === 'week_a' && effectiveCycle !== 'A') return false;
                if (r.weekPattern === 'week_b' && effectiveCycle !== 'B') return false;
                return true;
              });

              // Collect temporary exceptions for this day matching effectiveCycle
              const exceptionsOnDay = context.temporaryExceptions.filter(
                (ex) => ex.day === day && ex.weekCycle === effectiveCycle
              );

              // Collect lessons scheduled on this day matching effectiveCycle
              const slotsOnDay = context.timetableSlots.filter(
                (s) => s.day === day && s.weekCycle === effectiveCycle && schoolsOnDay.some((sc) => sc.id === s.schoolId)
              );

              return (
                <div
                  key={day}
                  className="relative h-full pointer-events-auto"
                  onDragOver={(e) => {
                    if (!draggedSlotId || !activeSchool) return;
                    e.preventDefault();

                    // Snap to 15-minute intervals based on cursor Y relative to column
                    const rect = e.currentTarget.getBoundingClientRect();
                    const offsetY = e.clientY - rect.top;
                    const snappedIntervals = Math.round(offsetY / 24); // 24px = 15 minutes
                    const targetMinutes = Math.max(
                      globalStartMin,
                      Math.min(globalEndMin - 30, globalStartMin + snappedIntervals * 15)
                    );
                    const snappedTime = minutesToTime(targetMinutes);

                    // Only set as empty target if not hovering an existing slot
                    if (dragOverTarget?.type !== 'swap') {
                      setDragOverTarget({
                        type: 'empty',
                        day,
                        time: snappedTime,
                        schoolId: activeSchool.id,
                        weekCycle: effectiveCycle,
                      });
                    }
                  }}
                  onDragLeave={(e) => {
                    if (e.currentTarget === e.target) {
                      setDragOverTarget(null);
                    }
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (draggedSlotId && dragOverTarget && dragOverTarget.type === 'empty' && activeSchool) {
                      onDropSlot(
                        draggedSlotId,
                        dragOverTarget.day,
                        dragOverTarget.time,
                        dragOverTarget.schoolId,
                        dragOverTarget.weekCycle
                      );
                    }
                    setDraggedSlotId(null);
                    setDragOverTarget(null);
                  }}
                >
                  {/* GHOST DROP PREVIEW FOR REARRANGING LESSONS */}
                  {draggedSlot &&
                    dragOverTarget?.type === 'empty' &&
                    dragOverTarget.day === day && (
                      <div
                        style={{
                          ...getPosition(
                            dragOverTarget.time,
                            addMinutes(dragOverTarget.time, draggedSlot.duration)
                          ),
                        }}
                        className="absolute inset-x-2 z-35 rounded-lg border-2 border-dashed border-indigo-400 bg-indigo-50/80 px-2.5 py-1.5 pointer-events-none flex items-center justify-between text-indigo-950 shadow-sm animate-pulse"
                      >
                        <div className="flex items-center gap-1.5 font-bold text-xs truncate">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <span className="truncate">Move {draggedStudent?.name || 'Lesson'}</span>
                        </div>
                        <span className="text-[11px] font-semibold tabular-nums text-indigo-700 shrink-0">
                          {dragOverTarget.time} ({draggedSlot.duration}m)
                        </span>
                      </div>
                    )}

                  {/* Render Breaks (Clickable, Concise, Never Overlapping) */}
                  {breaksOnDay.map((brk) => {
                    const pos = getPosition(brk.startTime, brk.endTime);
                    const brkSchool = context.schools.find((s) => s.id === brk.schoolId) || activeSchool;

                    return (
                      <div
                        key={brk.id}
                        style={{
                          top: `${parseInt(pos.top, 10) + 1}px`,
                          height: `${Math.max(parseInt(pos.height, 10) - 2, 22)}px`,
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onBreakClick && brkSchool) {
                            onBreakClick(brk, brkSchool);
                          }
                        }}
                        className="absolute inset-x-2 z-10 rounded-md border border-dashed border-amber-300/80 bg-amber-50/75 hover:bg-amber-100 hover:border-amber-400 text-amber-950 px-2 flex items-center justify-between pointer-events-auto cursor-pointer transition-all shadow-2xs group"
                        title={`${brk.title} (${brk.startTime}–${brk.endTime}) · Click to edit`}
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Coffee className="w-3 h-3 text-amber-700/80 shrink-0" />
                          <span className="text-xs font-semibold text-amber-950 truncate tracking-tight">
                            {brk.title}
                          </span>
                          <span className="text-[11px] text-amber-800/70 tabular-nums font-medium shrink-0">
                            ({brk.startTime}–{brk.endTime})
                          </span>
                        </div>
                        <span className="opacity-0 group-hover:opacity-100 text-[10px] font-semibold text-amber-800 hover:underline shrink-0 transition-opacity">
                          Edit
                        </span>
                      </div>
                    );
                  })}

                  {/* Render Multi-level Restrictions Notice */}
                  {restrictionsOnDay.map((res) => {
                    const pos = getPosition(res.startTime, res.endTime);
                    let targetName = 'All';
                    if (res.scope === 'year') {
                      const yg = context.yearGroups.find((y) => y.id === res.targetId);
                      targetName = yg?.name || 'Year';
                    } else if (res.scope === 'subgroup') {
                      const sg = context.subgroups.find((s) => s.id === res.targetId);
                      targetName = sg?.name || 'Subgroup';
                    } else if (res.scope === 'student') {
                      const stu = context.students.find((s) => s.id === res.targetId);
                      targetName = stu?.name || 'Student';
                    } else if (res.scope === 'teacher') {
                      targetName = 'Teacher';
                    }

                    return (
                      <div
                        key={res.id}
                        style={{ top: pos.top, height: pos.height }}
                        className="absolute right-1.5 w-1 z-15 bg-neutral-300 rounded-full"
                        title={`Restriction: [${targetName}] ${res.reason} (${res.startTime}–${res.endTime})`}
                      />
                    );
                  })}

                  {/* Render Lessons (Concise 2-Line Layout, Easy Drag & Drop + Swap) */}
                  {slotsOnDay.map((slot) => {
                    const student = context.students.find((s) => s.id === slot.studentId);
                    const yearGroup = context.yearGroups.find((y) => y.id === student?.yearGroupId);
                    const subgroup = context.subgroups.find((sg) => sg.id === student?.subgroupId);
                    const pos = getPosition(slot.startTime, slot.endTime);
                    const slotSchool = context.schools.find((s) => s.id === slot.schoolId);
                    const schoolTheme = getSchoolTheme(slotSchool?.colorTheme);

                    // Validate slot dynamically to show warning/conflict indicators
                    const validation = validateSlot(
                      slot.studentId,
                      slot.schoolId,
                      slot.day,
                      slot.startTime,
                      slot.endTime,
                      slot.weekCycle,
                      context,
                      slot.id
                    );

                    // Check if this student has a temporary exception
                    const stuException = exceptionsOnDay.find((ex) => ex.targetId === student?.id);

                    const isAlternating =
                      student?.frequency === 'week_a_only' || student?.frequency === 'week_b_only';
                    const isLowInGrid = timeToMinutes(slot.startTime) >= 12 * 60 + 30;
                    const isLeftSide = day === 'Monday' || day === 'Tuesday';

                    const isBeingDragged = draggedSlotId === slot.id;
                    const isSwapTarget =
                      dragOverTarget?.type === 'swap' && dragOverTarget.targetSlotId === slot.id;

                    return (
                      <div
                        key={slot.id}
                        draggable
                        onDragStart={(e) => {
                          setDraggedSlotId(slot.id);
                          e.dataTransfer.effectAllowed = 'move';
                          e.dataTransfer.setData('text/plain', slot.id);
                        }}
                        onDragEnd={() => {
                          setDraggedSlotId(null);
                          setDragOverTarget(null);
                        }}
                        onDragOver={(e) => {
                          if (!draggedSlotId || draggedSlotId === slot.id) return;
                          e.preventDefault();
                          e.stopPropagation();
                          setDragOverTarget({
                            type: 'swap',
                            targetSlotId: slot.id,
                            day,
                            schoolId: slot.schoolId,
                            weekCycle: slot.weekCycle,
                          });
                        }}
                        onDrop={(e) => {
                          if (!draggedSlotId || draggedSlotId === slot.id) return;
                          e.preventDefault();
                          e.stopPropagation();
                          if (onSwapSlots) {
                            onSwapSlots(draggedSlotId, slot.id);
                          }
                          setDraggedSlotId(null);
                          setDragOverTarget(null);
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSlotClick(slot);
                        }}
                        style={{
                          top: `${parseInt(pos.top, 10) + 1}px`,
                          height: `${Math.max(parseInt(pos.height, 10) - 2, 44)}px`,
                        }}
                        className={`absolute inset-x-1.5 z-20 hover:z-30 rounded-lg px-2.5 py-1.5 transition-all cursor-grab active:cursor-grabbing pointer-events-auto border flex flex-col justify-between overflow-visible shadow-2xs hover:shadow-md select-none group/card ${
                          isBeingDragged
                            ? 'opacity-25 scale-95 border-dashed border-indigo-400'
                            : isSwapTarget
                            ? 'ring-2 ring-indigo-500 bg-indigo-50 border-indigo-400'
                            : validation.severity === 'hard_violation'
                            ? 'bg-rose-50/90 border-rose-300 text-rose-950 ring-1 ring-rose-400/80 border-l-4 border-l-rose-500'
                            : validation.severity === 'soft_warning'
                            ? 'bg-amber-50/90 border-amber-300 text-amber-950 ring-1 ring-amber-300'
                            : stuException
                            ? 'bg-neutral-100 border-neutral-300 text-neutral-700 opacity-80'
                            : `${schoolTheme.lessonCard} ${schoolTheme.lessonCardAccent}`
                        }`}
                        title="Drag to rearrange or swap with another lesson. Click to inspect."
                      >
                        {/* Overlay when this slot is hovered as swap target */}
                        {isSwapTarget && (
                          <div className="absolute inset-0 z-40 rounded-lg bg-indigo-600/95 text-white px-2 py-1 flex items-center justify-center gap-1.5 text-xs font-semibold shadow-md animate-in fade-in zoom-in-95 duration-75">
                            <ArrowLeftRight className="w-3.5 h-3.5 text-indigo-200 shrink-0" />
                            <span className="truncate">Swap with {student?.name}</span>
                          </div>
                        )}

                        {/* Line 1: Student Name, Grip handle & Indicators */}
                        <div className="flex items-center justify-between gap-1 min-w-0">
                          <div className="flex items-center gap-1 min-w-0">
                            <GripVertical className="w-3 h-3 text-neutral-400 group-hover/card:text-neutral-700 shrink-0 opacity-40 group-hover/card:opacity-100 transition-opacity" />
                            <span className="text-xs font-bold text-neutral-900 truncate tracking-tight">
                              {student?.name || 'Unknown Student'}
                            </span>
                          </div>

                          <div className="shrink-0 flex items-center gap-1">
                            {/* Quick edit limitations button */}
                            {onEditLimitations && student && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEditLimitations(student);
                                }}
                                className="opacity-0 group-hover/card:opacity-100 p-0.5 rounded text-neutral-500 hover:text-neutral-900 hover:bg-black/10 transition-all cursor-pointer"
                                title={`Edit limitations & rules for ${student.name}`}
                              >
                                <Edit2 className="w-2.5 h-2.5" />
                              </button>
                            )}

                            {stuException && (
                              <span
                                className="text-[10px] text-neutral-600 bg-neutral-200/80 px-1 py-0.2 rounded font-medium flex items-center gap-0.5"
                                title={`Exception: ${stuException.title}`}
                              >
                                <UserX className="w-2.5 h-2.5" />
                                <span>Absent</span>
                              </span>
                            )}

                            {isAlternating && (
                              <span className="text-[10px] text-neutral-600 font-semibold px-1 py-0.2 rounded bg-black/5">
                                {effectiveCycle}
                              </span>
                            )}

                            {/* SUBTLE RED ALERT INDICATOR WITH HOVER SUMMARY */}
                            {validation.severity === 'hard_violation' && (
                              <div className="relative group/conflict shrink-0 cursor-help">
                                <div
                                  className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-300 shadow-2xs hover:bg-rose-200 transition-colors"
                                  title="Unresolved Conflict · Hover for quick summary"
                                >
                                  <span className="relative flex h-1.5 w-1.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-600"></span>
                                  </span>
                                  <AlertCircle className="w-2.5 h-2.5 text-rose-600" />
                                  <span>Conflict</span>
                                </div>

                                {/* Quick Summary Hover Popover */}
                                <div
                                  className={`absolute ${
                                    isLeftSide ? 'left-0' : 'right-0'
                                  } ${
                                    isLowInGrid ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
                                  } w-64 p-3 bg-neutral-900/95 backdrop-blur-md text-white text-xs rounded-xl shadow-xl border border-neutral-700/80 pointer-events-none opacity-0 group-hover/conflict:opacity-100 transition-all duration-150 z-50`}
                                >
                                  <div className="flex items-center justify-between pb-1.5 border-b border-neutral-800">
                                    <div className="flex items-center gap-1.5 font-bold text-rose-300">
                                      <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                                      <span>Schedule Conflict</span>
                                    </div>
                                    <span className="text-[10px] tabular-nums text-rose-400 font-semibold px-1 rounded bg-rose-950/80 border border-rose-800">
                                      {validation.hardViolations.length} issue
                                      {validation.hardViolations.length > 1 ? 's' : ''}
                                    </span>
                                  </div>

                                  <div className="mt-2 space-y-1.5">
                                    {validation.hardViolations.map((err, i) => (
                                      <div
                                        key={i}
                                        className="flex items-start gap-1.5 text-[11px] text-neutral-200 leading-tight"
                                      >
                                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1 shrink-0" />
                                        <span>{err}</span>
                                      </div>
                                    ))}
                                  </div>

                                  <div className="mt-2.5 pt-2 border-t border-neutral-800 text-[10px] text-neutral-400 flex items-center justify-between">
                                    <span>Click or drag slot to rearrange</span>
                                    <span className="text-neutral-500 font-semibold">MusiOrg</span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* PREFERENCE WARNING INDICATOR WITH HOVER SUMMARY */}
                            {validation.severity === 'soft_warning' && (
                              <div className="relative group/warning shrink-0 cursor-help">
                                <div
                                  className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[10px] font-semibold bg-amber-100/90 text-amber-800 border border-amber-300 shadow-2xs hover:bg-amber-200 transition-colors"
                                  title="Preference Warning · Hover for quick summary"
                                >
                                  <AlertTriangle className="w-2.5 h-2.5 text-amber-600" />
                                  <span>Notice</span>
                                </div>

                                {/* Quick Summary Hover Popover */}
                                <div
                                  className={`absolute ${
                                    isLeftSide ? 'left-0' : 'right-0'
                                  } ${
                                    isLowInGrid ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
                                  } w-60 p-2.5 bg-neutral-900/95 backdrop-blur-md text-white text-xs rounded-xl shadow-xl border border-neutral-700/80 pointer-events-none opacity-0 group-hover/warning:opacity-100 transition-all duration-150 z-50`}
                                >
                                  <div className="flex items-center gap-1.5 font-bold text-amber-300 pb-1 border-b border-neutral-800">
                                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                    <span>Preference Warning</span>
                                  </div>
                                  <div className="mt-1.5 space-y-1">
                                    {validation.softWarnings.map((warn, i) => (
                                      <div
                                        key={i}
                                        className="flex items-start gap-1.5 text-[11px] text-neutral-200 leading-tight"
                                      >
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1 shrink-0" />
                                        <span>{warn}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Line 2: Concise Details (Instrument · Year Group · Time) */}
                        <div className="flex items-center justify-between text-[11px] text-neutral-600 tabular-nums min-w-0 pt-0.5">
                          <div className="truncate font-medium flex items-center gap-1 min-w-0">
                            <span className="text-neutral-800 font-semibold shrink-0">
                              {student?.instrument}
                            </span>
                            <span aria-hidden="true" className="text-neutral-400 font-normal">
                              ·
                            </span>
                            <span className="text-neutral-500 truncate">
                              {yearGroup?.name}
                              {subgroup ? ` (${subgroup.name})` : ''}
                            </span>
                          </div>

                          <span className="text-neutral-500 font-semibold text-[10.5px] tabular-nums shrink-0 ml-1.5">
                            {slot.startTime}–{slot.endTime}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

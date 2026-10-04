import {
  DayOfWeek,
  WeekCycle,
  School,
  Student,
  YearGroup,
  YearSubgroup,
  Restriction,
  TemporaryException,
  TimetableSlot,
  TeacherProfile,
  SlotValidation,
} from '../types';
import { timeToMinutes, minutesToTime, timesOverlap } from './timeUtils';

export interface ValidationContext {
  schools: School[];
  students: Student[];
  yearGroups: YearGroup[];
  subgroups: YearSubgroup[];
  restrictions: Restriction[];
  temporaryExceptions: TemporaryException[];
  timetableSlots: TimetableSlot[];
  teacherProfile: TeacherProfile;
}

/**
 * Validates a proposed lesson slot for a specific student
 * Returns whether it's valid, along with any hard violations and soft warnings.
 */
export function validateSlot(
  studentId: string,
  schoolId: string,
  day: DayOfWeek,
  startTime: string,
  endTime: string,
  weekCycle: WeekCycle,
  context: ValidationContext,
  excludeSlotId?: string // slot currently being moved or edited
): SlotValidation {
  const hardViolations: string[] = [];
  const softWarnings: string[] = [];

  const student = context.students.find((s) => s.id === studentId);
  const school = context.schools.find((sc) => sc.id === schoolId);

  if (!student) {
    return {
      valid: false,
      severity: 'hard_violation',
      hardViolations: ['Student not found.'],
      softWarnings: [],
    };
  }

  if (!school) {
    return {
      valid: false,
      severity: 'hard_violation',
      hardViolations: ['School not found.'],
      softWarnings: [],
    };
  }

  // 1. Check if school teaches on this day
  if (!school.teachingDays.includes(day)) {
    hardViolations.push(`${school.name} is not scheduled for teaching on ${day}.`);
  }

  // 2. Check school opening hours
  const dayHours = school.dayHours[day];
  if (dayHours) {
    const slotStartMin = timeToMinutes(startTime);
    const slotEndMin = timeToMinutes(endTime);
    const openMin = timeToMinutes(dayHours.startTime);
    const closeMin = timeToMinutes(dayHours.endTime);

    if (slotStartMin < openMin || slotEndMin > closeMin) {
      hardViolations.push(
        `Time ${startTime}–${endTime} is outside ${school.name}'s hours on ${day} (${dayHours.startTime}–${dayHours.endTime}).`
      );
    }
  }

  // 3. Check school breaks (lunch, morning break, etc.)
  const schoolBreaks = school.breaks.filter((b) => b.day === day);
  for (const brk of schoolBreaks) {
    if (timesOverlap(startTime, endTime, brk.startTime, brk.endTime)) {
      hardViolations.push(
        `Overlaps with scheduled school break: ${brk.title} (${brk.startTime}–${brk.endTime}).`
      );
    }
  }

  // 4. Check teacher availability
  if (!context.teacherProfile.workingDays.includes(day)) {
    hardViolations.push(`Teacher does not work on ${day}.`);
  } else {
    const slotStartMin = timeToMinutes(startTime);
    const slotEndMin = timeToMinutes(endTime);
    const teacherStart = timeToMinutes(context.teacherProfile.startHour);
    const teacherFinish = timeToMinutes(context.teacherProfile.finishHour);

    if (slotStartMin < teacherStart || slotEndMin > teacherFinish) {
      softWarnings.push(
        `Slot is outside teacher's preferred working hours (${context.teacherProfile.startHour}–${context.teacherProfile.finishHour}).`
      );
    }
  }

  // 5. Multi-level Restrictions
  // Filter restrictions active for this weekCycle and day
  const relevantRestrictions = context.restrictions.filter((r) => {
    if (r.dayOfWeek !== day) return false;
    if (r.weekPattern === 'week_a' && weekCycle !== 'A') return false;
    if (r.weekPattern === 'week_b' && weekCycle !== 'B') return false;
    return true;
  });

  for (const r of relevantRestrictions) {
    if (!timesOverlap(startTime, endTime, r.startTime, r.endTime)) {
      continue;
    }

    let applies = false;
    let targetLabel = '';

    if (r.scope === 'school' && r.targetId === schoolId) {
      applies = true;
      targetLabel = `School restriction`;
    } else if (r.scope === 'year' && r.targetId === student.yearGroupId) {
      const year = context.yearGroups.find((y) => y.id === student.yearGroupId);
      applies = true;
      targetLabel = `${year?.name || 'Year group'} restriction`;
    } else if (
      r.scope === 'subgroup' &&
      student.subgroupId &&
      r.targetId === student.subgroupId
    ) {
      const sub = context.subgroups.find((sg) => sg.id === student.subgroupId);
      applies = true;
      targetLabel = `${sub?.name || 'Subgroup'} restriction`;
    } else if (r.scope === 'student' && r.targetId === student.id) {
      applies = true;
      targetLabel = `Individual student restriction`;
    } else if (r.scope === 'teacher') {
      applies = true;
      targetLabel = `Teacher personal commitment`;
    }

    if (applies) {
      const msg = `${targetLabel} (${r.reason} from ${r.startTime}–${r.endTime}).`;
      if (r.type === 'hard') {
        hardViolations.push(msg);
      } else {
        softWarnings.push(msg);
      }
    }
  }

  // 5b. Specific Allowed Time Windows ("Must Only / Can Only Do" in Week A/1 and Week B/2)
  if (student.allowedWindows && student.allowedWindows.length > 0) {
    const matchingCycleWindows = student.allowedWindows.filter((w) => {
      if (w.weekPattern === 'week_a' && weekCycle !== 'A') return false;
      if (w.weekPattern === 'week_b' && weekCycle !== 'B') return false;
      return true;
    });

    if (matchingCycleWindows.length > 0) {
      const slotStartMin = timeToMinutes(startTime);
      const slotEndMin = timeToMinutes(endTime);

      const matchingDayWindows = matchingCycleWindows.filter((w) => w.dayOfWeek === day);

      if (matchingDayWindows.length === 0) {
        const allowedDays = Array.from(new Set(matchingCycleWindows.map((w) => w.dayOfWeek))).join(', ');
        hardViolations.push(
          `${student.name} can only do lessons on ${allowedDays} in Week ${weekCycle}. Currently scheduled on ${day}.`
        );
      } else {
        const fitsInWindow = matchingDayWindows.some((w) => {
          const winStart = timeToMinutes(w.startTime);
          const winEnd = timeToMinutes(w.endTime);
          return slotStartMin >= winStart && slotEndMin <= winEnd;
        });

        if (!fitsInWindow) {
          const windowsStr = matchingDayWindows
            .map((w) => `${w.startTime}–${w.endTime}${w.notes ? ` (${w.notes})` : ''}`)
            .join(' or ');
          hardViolations.push(
            `${student.name} can only do lessons during: ${windowsStr} on ${day} (Week ${weekCycle}). Currently scheduled at ${startTime}–${endTime}.`
          );
        }
      }
    }
  }

  // 6. Temporary exceptions
  const activeExceptions = context.temporaryExceptions.filter((ex) => {
    if (ex.weekCycle !== weekCycle) return false;
    if (ex.day !== day) return false;
    if (ex.targetScope === 'student' && ex.targetId === student.id) return true;
    if (ex.targetScope === 'subgroup' && student.subgroupId && ex.targetId === student.subgroupId) return true;
    if (ex.targetScope === 'year' && ex.targetId === student.yearGroupId) return true;
    if (ex.targetScope === 'school' && ex.targetId === schoolId) return true;
    return false;
  });

  for (const ex of activeExceptions) {
    if (ex.startTime && ex.endTime) {
      if (timesOverlap(startTime, endTime, ex.startTime, ex.endTime)) {
        hardViolations.push(`Temporary Exception: ${ex.title} (${ex.reason || ex.type}).`);
      }
    } else {
      // Whole day exception (e.g. pupil absent, school trip)
      hardViolations.push(`Temporary Exception: ${ex.title} (${ex.reason || ex.type}).`);
    }
  }

  // 7. Check Timetable Collisions (Teacher busy with another student)
  const existingSlots = context.timetableSlots.filter(
    (slot) =>
      slot.weekCycle === weekCycle &&
      slot.day === day &&
      slot.id !== excludeSlotId
  );

  for (const slot of existingSlots) {
    if (timesOverlap(startTime, endTime, slot.startTime, slot.endTime)) {
      if (slot.studentId === student.id) {
        hardViolations.push(`Student is already scheduled at ${slot.startTime}–${slot.endTime}.`);
      } else {
        const otherStudent = context.students.find((s) => s.id === slot.studentId);
        hardViolations.push(
          `Clashes with existing lesson: ${otherStudent?.name || 'Another student'} (${slot.startTime}–${slot.endTime}).`
        );
      }
    }
  }

  // 8. Soft Preferences
  // Normal teaching day check
  if (student.normalTeachingDay && student.normalTeachingDay !== day) {
    softWarnings.push(
      `Student normally has lessons on ${student.normalTeachingDay} (currently placing on ${day}).`
    );
  }

  // Preferred time of day
  if (student.preferredTime && student.preferredTime !== 'any') {
    const noon = 12 * 60;
    const startMin = timeToMinutes(startTime);

    if (student.preferredTime === 'morning' && startMin >= noon) {
      softWarnings.push(`Student prefers morning lessons.`);
    } else if (student.preferredTime === 'afternoon' && startMin < noon) {
      softWarnings.push(`Student prefers afternoon lessons.`);
    }
  }

  // Frequency checks
  if (student.frequency === 'week_a_only' && weekCycle === 'B') {
    softWarnings.push(`${student.name} is configured for Week A only.`);
  } else if (student.frequency === 'week_b_only' && weekCycle === 'A') {
    softWarnings.push(`${student.name} is configured for Week B only.`);
  }

  const isValid = hardViolations.length === 0;
  const severity = !isValid
    ? 'hard_violation'
    : softWarnings.length > 0
    ? 'soft_warning'
    : 'valid';

  return {
    valid: isValid,
    severity,
    hardViolations,
    softWarnings,
  };
}

/**
 * Finds available slots on a given day at a school for a specified duration
 */
export function findAvailableSlotsForStudent(
  studentId: string,
  schoolId: string,
  day: DayOfWeek,
  durationMinutes: number,
  weekCycle: WeekCycle,
  context: ValidationContext,
  stepMinutes: number = 15
): { startTime: string; endTime: string; quality: 'perfect' | 'minor_soft_warning'; warnings: string[] }[] {
  const school = context.schools.find((s) => s.id === schoolId);
  if (!school || !school.dayHours[day]) return [];

  const dayHours = school.dayHours[day];
  const startMin = timeToMinutes(dayHours.startTime);
  const endMin = timeToMinutes(dayHours.endTime);

  const available: { startTime: string; endTime: string; quality: 'perfect' | 'minor_soft_warning'; warnings: string[] }[] = [];

  for (let current = startMin; current + durationMinutes <= endMin; current += stepMinutes) {
    const slotStart = minutesToTime(current);
    const slotEnd = minutesToTime(current + durationMinutes);

    const validation = validateSlot(
      studentId,
      schoolId,
      day,
      slotStart,
      slotEnd,
      weekCycle,
      context
    );

    if (validation.valid) {
      available.push({
        startTime: slotStart,
        endTime: slotEnd,
        quality: validation.softWarnings.length === 0 ? 'perfect' : 'minor_soft_warning',
        warnings: validation.softWarnings,
      });
    }
  }

  return available;
}

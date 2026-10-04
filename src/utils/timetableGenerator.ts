import {
  DayOfWeek,
  WeekCycle,
  TimetableSlot,
  Student,
  SchedulingIssue,
  ConflictAlternative,
} from '../types';
import { ValidationContext, validateSlot, findAvailableSlotsForStudent } from './constraintChecker';
import { timeToMinutes, addMinutes } from './timeUtils';

export interface GenerationResult {
  slots: TimetableSlot[];
  issues: SchedulingIssue[];
  stats: {
    totalStudents: number;
    scheduledCount: number;
    unresolvedCount: number;
    changedCount: number;
    consistentWeeksCount: number;
  };
}

export interface OptimizationOptions {
  weekCycle?: WeekCycle; // if specified, optimize only Week A or Week B, or both if undefined
  reoptimizeOnlyAffected?: boolean;
  affectedStudentIds?: string[];
  preserveManualOverrides?: boolean;
}

/**
 * Calculates a preference score for assigning a student to a slot.
 * Higher score = better placement.
 */
function scoreSlot(
  student: Student,
  day: DayOfWeek,
  startTime: string,
  endTime: string,
  weekCycle: WeekCycle,
  context: ValidationContext,
  existingSlot?: TimetableSlot,
  pairedWeekSlot?: TimetableSlot
): number {
  let score = 100;

  // 1. Same as established normal teaching day (+50)
  if (student.normalTeachingDay === day) {
    score += 50;
  } else {
    score -= 40;
  }

  // 2. Consistency with previous existing slot (+40)
  if (existingSlot && existingSlot.day === day && existingSlot.startTime === startTime) {
    score += 40;
  }

  // 3. Consistency between Week A and Week B (+30)
  if (
    context.teacherProfile.keepConsistentBetweenWeeksPreference &&
    pairedWeekSlot &&
    pairedWeekSlot.day === day &&
    pairedWeekSlot.startTime === startTime
  ) {
    score += 30;
  }

  // 4. Preferred time of day
  const startMin = timeToMinutes(startTime);
  const noon = 12 * 60;
  if (student.preferredTime === 'morning') {
    score += startMin < noon ? 20 : -10;
  } else if (student.preferredTime === 'afternoon') {
    score += startMin >= noon ? 20 : -10;
  }

  // 5. Preferred specific time
  if (student.preferredSpecificTime && student.preferredSpecificTime === startTime) {
    score += 35;
  }

  // 6. Proximity to siblings (if any sibling is scheduled adjacent)
  if (student.siblingStudentIds && student.siblingStudentIds.length > 0) {
    const siblingSlots = context.timetableSlots.filter(
      (s) =>
        s.weekCycle === weekCycle &&
        s.day === day &&
        student.siblingStudentIds?.includes(s.studentId)
    );
    for (const sibSlot of siblingSlots) {
      if (sibSlot.endTime === startTime || sibSlot.startTime === endTime) {
        score += 25; // Back-to-back sibling bonus!
      }
    }
  }

  return score;
}

/**
 * Optimizes or re-optimizes the timetable.
 */
export function generateTimetable(
  context: ValidationContext,
  options: OptimizationOptions = {}
): GenerationResult {
  const weekCycles: WeekCycle[] = options.weekCycle
    ? [options.weekCycle]
    : ['A', 'B'];

  let currentSlots: TimetableSlot[] = [...context.timetableSlots];
  const issues: SchedulingIssue[] = [];
  let changedCount = 0;

  for (const cycle of weekCycles) {
    // Determine students needing scheduling in this cycle
    const eligibleStudents = context.students.filter((student) => {
      if (student.frequency === 'week_a_only' && cycle !== 'A') return false;
      if (student.frequency === 'week_b_only' && cycle !== 'B') return false;

      // If re-optimizing only affected students
      if (options.reoptimizeOnlyAffected && options.affectedStudentIds) {
        return options.affectedStudentIds.includes(student.id);
      }
      return true;
    });

    // Remove slots for eligible students that will be re-placed
    // Keep unaffected slots locked
    const unaffectedSlots = currentSlots.filter((slot) => {
      if (slot.weekCycle !== cycle) return true;
      if (options.preserveManualOverrides && slot.isManualOverride) return true;
      const isBeingRescheduled = eligibleStudents.some((s) => s.id === slot.studentId);
      return !isBeingRescheduled;
    });

    let runningSlots = [...unaffectedSlots];

    // Sort students by constraint difficulty (most restricted first):
    // Students with subgroup restrictions or specific days come first
    const sortedStudents = [...eligibleStudents].sort((a, b) => {
      // Students with individual restrictions or subgroups first
      const aSub = a.subgroupId ? 1 : 0;
      const bSub = b.subgroupId ? 1 : 0;
      return bSub - aSub;
    });

    for (const student of sortedStudents) {
      const school = context.schools.find((s) => s.id === student.schoolId);
      if (!school) continue;

      const duration = student.lessonDuration || 30;
      const priorSlot = context.timetableSlots.find(
        (s) => s.weekCycle === cycle && s.studentId === student.id
      );
      const pairedCycle: WeekCycle = cycle === 'A' ? 'B' : 'A';
      const pairedWeekSlot = context.timetableSlots.find(
        (s) => s.weekCycle === pairedCycle && s.studentId === student.id
      );

      // Prioritize days: start with normalTeachingDay, then other teaching days at this school
      const targetDays: DayOfWeek[] = [
        student.normalTeachingDay,
        ...school.teachingDays.filter((d) => d !== student.normalTeachingDay),
      ].filter((d, i, arr) => arr.indexOf(d) === i && school.teachingDays.includes(d));

      interface CandidateSlot {
        day: DayOfWeek;
        startTime: string;
        endTime: string;
        score: number;
        validationWarnings: string[];
      }

      const candidates: CandidateSlot[] = [];

      for (const day of targetDays) {
        const dayHours = school.dayHours[day];
        if (!dayHours) continue;

        const startMin = timeToMinutes(dayHours.startTime);
        const endMin = timeToMinutes(dayHours.endTime);
        const step = 15; // 15-minute search increments for maximum packing flexibility

        for (let t = startMin; t + duration <= endMin; t += step) {
          const startTime = `${Math.floor(t / 60).toString().padStart(2, '0')}:${(t % 60).toString().padStart(2, '0')}`;
          const endTime = addMinutes(startTime, duration);

          // Test validation with currently placed running slots
          const tempContext: ValidationContext = {
            ...context,
            timetableSlots: runningSlots,
          };

          const validation = validateSlot(
            student.id,
            school.id,
            day,
            startTime,
            endTime,
            cycle,
            tempContext
          );

          if (validation.valid) {
            const score = scoreSlot(
              student,
              day,
              startTime,
              endTime,
              cycle,
              tempContext,
              priorSlot,
              pairedWeekSlot
            );

            candidates.push({
              day,
              startTime,
              endTime,
              score,
              validationWarnings: validation.softWarnings,
            });
          }
        }
      }

      // Sort candidates by score descending
      candidates.sort((a, b) => b.score - a.score);

      if (candidates.length > 0) {
        const best = candidates[0];
        const newSlot: TimetableSlot = {
          id: priorSlot ? priorSlot.id : `slot_${cycle}_${student.id}_${Date.now()}`,
          weekCycle: cycle,
          schoolId: school.id,
          studentId: student.id,
          day: best.day,
          startTime: best.startTime,
          endTime: best.endTime,
          duration,
          isManualOverride: false,
        };

        if (
          !priorSlot ||
          priorSlot.day !== newSlot.day ||
          priorSlot.startTime !== newSlot.startTime
        ) {
          changedCount++;
        }

        runningSlots.push(newSlot);
      } else {
        // Could NOT place student without hard violation! Formulate informative conflict explanation
        const fallbackAlternatives = findAlternativeSlots(
          student,
          school.id,
          cycle,
          {
            ...context,
            timetableSlots: runningSlots,
          }
        );

        // Find specific reason why normal slot was blocked
        let reason = `No clash-free slot found within ${school.name} hours on normal day (${student.normalTeachingDay}).`;
        if (priorSlot) {
          const checkPrior = validateSlot(
            student.id,
            school.id,
            priorSlot.day,
            priorSlot.startTime,
            priorSlot.endTime,
            cycle,
            { ...context, timetableSlots: runningSlots }
          );
          if (checkPrior.hardViolations.length > 0) {
            reason = checkPrior.hardViolations.join('; ');
          }
        }

        issues.push({
          id: `issue_${cycle}_${student.id}`,
          studentId: student.id,
          studentName: student.name,
          weekCycle: cycle,
          schoolId: school.id,
          day: student.normalTeachingDay,
          desiredTime: priorSlot?.startTime,
          reason,
          severity: 'hard',
          alternatives: fallbackAlternatives,
        });
      }
    }

    currentSlots = runningSlots;
  }

  // Calculate statistics
  const totalStudents = context.students.length;
  const scheduledCount = currentSlots.length;
  const unresolvedCount = issues.length;

  let consistentWeeksCount = 0;
  for (const student of context.students) {
    const slotA = currentSlots.find((s) => s.weekCycle === 'A' && s.studentId === student.id);
    const slotB = currentSlots.find((s) => s.weekCycle === 'B' && s.studentId === student.id);
    if (slotA && slotB && slotA.day === slotB.day && slotA.startTime === slotB.startTime) {
      consistentWeeksCount++;
    }
  }

  return {
    slots: currentSlots,
    issues,
    stats: {
      totalStudents,
      scheduledCount,
      unresolvedCount,
      changedCount,
      consistentWeeksCount,
    },
  };
}

/**
 * Searches for viable alternatives for an unscheduled student
 */
function findAlternativeSlots(
  student: Student,
  schoolId: string,
  weekCycle: WeekCycle,
  context: ValidationContext
): ConflictAlternative[] {
  const school = context.schools.find((s) => s.id === schoolId);
  if (!school) return [];

  const duration = student.lessonDuration || 30;
  const alternatives: ConflictAlternative[] = [];

  for (const day of school.teachingDays) {
    const dayHours = school.dayHours[day];
    if (!dayHours) continue;

    const available = findAvailableSlotsForStudent(
      student.id,
      schoolId,
      day,
      duration,
      weekCycle,
      context,
      30
    );

    for (const slot of available.slice(0, 3)) {
      alternatives.push({
        day,
        startTime: slot.startTime,
        endTime: slot.endTime,
        quality: slot.quality,
        notes: slot.warnings.length > 0 ? slot.warnings[0] : undefined,
      });
    }
  }

  return alternatives.slice(0, 4);
}

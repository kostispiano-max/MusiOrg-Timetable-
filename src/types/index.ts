export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';

export const DAYS_OF_WEEK: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

// Standard lesson duration options (strictly 20, 30, 40 minutes)
export const STANDARD_LESSON_DURATIONS = [20, 30, 40] as const;
export type StandardLessonDuration = typeof STANDARD_LESSON_DURATIONS[number];

export type UserRole = 'admin' | 'teacher';
export type SubscriptionStatus = 'active' | 'inactive' | 'trial' | 'cancelled';
export type SubscriptionPlan = 'monthly' | 'annual' | 'trial' | 'comp' | 'none';

export interface UserAccount {
  uid: string;
  email: string;
  displayName?: string;
  role: UserRole;
  subscriptionStatus: SubscriptionStatus;
  subscriptionPlan: SubscriptionPlan;
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  mailingListConsent: boolean;
  mailingListConsentDate?: string | null;
  createdAt: string;
  lastLoginAt?: string;
}

export type WeekCycle = 'A' | 'B';

export type CycleTerminology = 'week_ab' | 'week_12';

export interface BreakPeriod {
  id: string;
  schoolId: string;
  title: string;
  day: DayOfWeek;
  startTime: string; // "10:30"
  endTime: string;   // "10:50"
}

export interface DayHours {
  startTime: string; // "09:00"
  endTime: string;   // "15:30"
  standardLessonDuration: number; // in minutes, e.g. 30
}

export type SchoolColorTheme = 'sage' | 'sky' | 'warm' | 'lavender' | 'rose' | 'teal';

export interface School {
  id: string;
  name: string;
  code: string;
  teachingDays: DayOfWeek[];
  dayHours: Record<DayOfWeek, DayHours>;
  breaks: BreakPeriod[];
  travelNotes?: string;
  address?: string;
  currentWeekCycle: WeekCycle; // Independent Week A/B or 1/2 cycle for this school
  cycleTerminology?: CycleTerminology; // School's preferred terminology ('week_ab' or 'week_12')
  cycleNotes?: string; // Notes on irregular changes, e.g. "Flipped week after Inset Day"
  colorTheme?: SchoolColorTheme; // Friendly gentle pastel color coding
}

export interface YearGroup {
  id: string;
  schoolId: string;
  name: string; // "Y3", "Y4", "Y7"
}

export interface YearSubgroup {
  id: string;
  schoolId: string;
  yearGroupId: string;
  name: string; // "Y7.1", "Y7.2"
}

export type RestrictionScope = 'school' | 'year' | 'subgroup' | 'student' | 'teacher';
export type RestrictionType = 'hard' | 'soft';
export type WeekPattern = 'all' | 'week_a' | 'week_b';

export interface Restriction {
  id: string;
  scope: RestrictionScope;
  targetId: string; // schoolId, yearGroupId, subgroupId, studentId, or 'teacher'
  schoolId?: string;
  type: RestrictionType;
  weekPattern: WeekPattern;
  dayOfWeek: DayOfWeek;
  startTime: string; // "09:00"
  endTime: string;   // "10:00"
  reason: string;    // "Swimming", "PE", "Assembly", "Orchestra"
  isTemporary?: boolean;
  specificDate?: string; // "2026-10-14"
}

export type LessonFrequency = 'weekly' | 'week_a_only' | 'week_b_only' | 'alternating_time';
export type PreferredTimeOfDay = 'any' | 'morning' | 'afternoon' | 'before_lunch' | 'after_lunch';

export interface StudentAllowedWindow {
  id: string;
  weekPattern: WeekPattern; // 'all' | 'week_a' | 'week_b'
  dayOfWeek: DayOfWeek;
  startTime: string; // e.g. "09:00"
  endTime: string;   // e.g. "10:00"
  notes?: string;    // e.g. "Study hall rotation / only free slot"
}

export interface Student {
  id: string;
  schoolId: string;
  yearGroupId: string;
  subgroupId?: string;
  name: string;
  instrument: string;
  lessonDuration: number; // minutes: 20, 30, 45, 60
  normalTeachingDay: DayOfWeek;
  frequency: LessonFrequency;
  preferredTime?: PreferredTimeOfDay;
  preferredSpecificTime?: string; // e.g. "09:30"
  allowedWindows?: StudentAllowedWindow[]; // "Must only / can only do" allowed time windows in Week A/1 and B/2
  siblingStudentIds?: string[];
  notes?: string;
  // Specific scheduled lessons for Week A and Week B
  weekALesson?: {
    day: DayOfWeek;
    startTime: string;
    duration: number;
  };
  weekBLesson?: {
    day: DayOfWeek;
    startTime: string;
    duration: number;
  };
}

export interface TemporaryException {
  id: string;
  targetScope: 'student' | 'subgroup' | 'year' | 'school' | 'teacher';
  targetId: string;
  title: string;
  date: string; // YYYY-MM-DD
  weekCycle: WeekCycle;
  day: DayOfWeek;
  type: 'absence' | 'trip' | 'exam' | 'event' | 'reschedule';
  startTime?: string;
  endTime?: string;
  details?: string;
  reason?: string;
}

export interface TimetableSlot {
  id: string;
  weekCycle: WeekCycle;
  schoolId: string;
  studentId: string;
  day: DayOfWeek;
  startTime: string; // "09:30"
  endTime: string;   // "10:00"
  duration: number;
  isManualOverride?: boolean;
}

export interface TeacherProfile {
  name: string;
  email: string;
  instruments: string[];
  workingDays: DayOfWeek[];
  startHour: string; // "08:30"
  finishHour: string; // "16:00"
  maxHoursPerDay: number;
  cycleTerminology: CycleTerminology;
  travelTimesMinutes: Record<string, number>; // "schoolId1_schoolId2": 25
  minimizeGapsPreference: boolean;
  keepConsistentBetweenWeeksPreference: boolean;
  keepNormalDayPreference: boolean;
}

export interface ConflictAlternative {
  day: DayOfWeek;
  startTime: string;
  endTime: string;
  quality: 'perfect' | 'minor_soft_warning';
  notes?: string;
}

export interface SchedulingIssue {
  id: string;
  studentId: string;
  studentName: string;
  weekCycle: WeekCycle;
  schoolId: string;
  day: DayOfWeek;
  desiredTime?: string;
  reason: string;
  severity: 'hard' | 'warning';
  alternatives: ConflictAlternative[];
}

export interface SlotValidation {
  valid: boolean;
  severity: 'valid' | 'soft_warning' | 'hard_violation';
  hardViolations: string[];
  softWarnings: string[];
}

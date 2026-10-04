import {
  School,
  YearGroup,
  YearSubgroup,
  Student,
  Restriction,
  TemporaryException,
  TimetableSlot,
  TeacherProfile,
} from '../types';
import {
  initialSchools,
  initialYearGroups,
  initialYearSubgroups,
  initialStudents,
  initialRestrictions,
  initialTemporaryExceptions,
  initialTimetableSlots,
  initialTeacherProfile,
} from '../data/initialData';

const STORAGE_KEY = 'musiorg_timetable_v1';

export interface AppState {
  teacherProfile: TeacherProfile;
  schools: School[];
  yearGroups: YearGroup[];
  subgroups: YearSubgroup[];
  students: Student[];
  restrictions: Restriction[];
  temporaryExceptions: TemporaryException[];
  timetableSlots: TimetableSlot[];
}

export function loadInitialState(): AppState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.schools && parsed.students && parsed.timetableSlots) {
        // Ensure every school has currentWeekCycle and colorTheme
        const themeList: ('sage' | 'sky' | 'warm' | 'lavender' | 'rose' | 'teal')[] = ['sage', 'sky', 'warm', 'lavender', 'rose', 'teal'];
        const updatedSchools = parsed.schools.map((sc: School, idx: number) => {
          const initial = initialSchools.find((is) => is.id === sc.id);
          return {
            ...sc,
            currentWeekCycle: sc.currentWeekCycle || (initial ? initial.currentWeekCycle : (idx % 2 === 1 ? 'B' : 'A')),
            cycleTerminology: sc.cycleTerminology || initial?.cycleTerminology || 'week_ab',
            colorTheme: sc.colorTheme || initial?.colorTheme || themeList[idx % themeList.length],
          };
        });

        // Merge initial students if any missing, and ensure allowedWindows is initialized
        const existingStudentIds = new Set(parsed.students.map((s: Student) => s.id));
        const mergedStudents = [
          ...parsed.students.map((s: Student) => {
            const initial = initialStudents.find((is) => is.id === s.id);
            return {
              ...s,
              allowedWindows: s.allowedWindows || (initial?.allowedWindows || []),
            };
          }),
          ...initialStudents.filter((is) => !existingStudentIds.has(is.id)),
        ];

        // Merge initial restrictions if missing
        const existingRestrictionIds = new Set((parsed.restrictions || []).map((r: Restriction) => r.id));
        const mergedRestrictions = [
          ...(parsed.restrictions || []),
          ...initialRestrictions.filter((ir) => !existingRestrictionIds.has(ir.id)),
        ];

        return {
          ...parsed,
          schools: updatedSchools,
          students: mergedStudents,
          restrictions: mergedRestrictions,
        };
      }
    }
  } catch (err) {
    console.error('Failed to load saved state from localStorage:', err);
  }

  return {
    teacherProfile: initialTeacherProfile,
    schools: initialSchools,
    yearGroups: initialYearGroups,
    subgroups: initialYearSubgroups,
    students: initialStudents,
    restrictions: initialRestrictions,
    temporaryExceptions: initialTemporaryExceptions,
    timetableSlots: initialTimetableSlots,
  };
}

export function saveStateToStorage(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save state to localStorage:', err);
  }
}

export function clearSavedState(): AppState {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear state from localStorage:', err);
  }
  return {
    teacherProfile: initialTeacherProfile,
    schools: initialSchools,
    yearGroups: initialYearGroups,
    subgroups: initialYearSubgroups,
    students: initialStudents,
    restrictions: initialRestrictions,
    temporaryExceptions: initialTemporaryExceptions,
    timetableSlots: initialTimetableSlots,
  };
}

import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  getDoc,
  writeBatch,
  onSnapshot,
} from 'firebase/firestore';
import { db } from './firebase';
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
import { AppState } from '../utils/storage';
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

/**
 * Strips undefined properties recursively so Firestore does not reject writes.
 */
function cleanForFirestore<T extends Record<string, any>>(obj: T): T {
  const result: any = Array.isArray(obj) ? [] : {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) continue;
    if (value !== null && typeof value === 'object' && !(value instanceof Date)) {
      result[key] = cleanForFirestore(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

/**
 * Creates default clean teacher profile for a brand new user (starts completely empty)
 */
export function createCleanTeacherProfile(userId: string, email: string, name?: string): TeacherProfile {
  return {
    ...initialTeacherProfile,
    name: name || email.split('@')[0] || 'Music Teacher',
  };
}

/**
 * Subscribes to the authenticated user's private dataset with real-time updates.
 */
export function subscribeToUserTimetableData(
  userId: string,
  onData: (state: AppState) => void,
  onError: (error: Error) => void
): () => void {
  // Collection references
  const userRef = doc(db, 'users', userId);
  const schoolsCol = collection(db, 'users', userId, 'schools');
  const yearGroupsCol = collection(db, 'users', userId, 'yearGroups');
  const subgroupsCol = collection(db, 'users', userId, 'subgroups');
  const studentsCol = collection(db, 'users', userId, 'students');
  const restrictionsCol = collection(db, 'users', userId, 'restrictions');
  const exceptionsCol = collection(db, 'users', userId, 'temporaryExceptions');
  const slotsCol = collection(db, 'users', userId, 'timetableSlots');

  // Local accumulator
  let currentProfile: TeacherProfile = initialTeacherProfile;
  let currentSchools: School[] = [];
  let currentYearGroups: YearGroup[] = [];
  let currentSubgroups: YearSubgroup[] = [];
  let currentStudents: Student[] = [];
  let currentRestrictions: Restriction[] = [];
  let currentExceptions: TemporaryException[] = [];
  let currentSlots: TimetableSlot[] = [];

  let isInitialized = false;
  let pendingSnapshots = 8;

  const emitIfReady = () => {
    if (pendingSnapshots > 0) return;
    onData({
      teacherProfile: currentProfile,
      schools: currentSchools,
      yearGroups: currentYearGroups,
      subgroups: currentSubgroups,
      students: currentStudents,
      restrictions: currentRestrictions,
      temporaryExceptions: currentExceptions,
      timetableSlots: currentSlots,
    });
  };

  const decrementPending = () => {
    if (!isInitialized) {
      pendingSnapshots = Math.max(0, pendingSnapshots - 1);
      if (pendingSnapshots === 0) {
        isInitialized = true;
      }
    }
    emitIfReady();
  };

  // 1. Profile
  const unsubProfile = onSnapshot(
    userRef,
    (snap) => {
      if (snap.exists()) {
        currentProfile = { ...initialTeacherProfile, ...(snap.data() as TeacherProfile) };
      }
      decrementPending();
    },
    onError
  );

  // 2. Schools
  const unsubSchools = onSnapshot(
    schoolsCol,
    (snap) => {
      currentSchools = snap.docs.map((d) => d.data() as School);
      decrementPending();
    },
    onError
  );

  // 3. Year groups
  const unsubYearGroups = onSnapshot(
    yearGroupsCol,
    (snap) => {
      currentYearGroups = snap.docs.map((d) => d.data() as YearGroup);
      decrementPending();
    },
    onError
  );

  // 4. Subgroups
  const unsubSubgroups = onSnapshot(
    subgroupsCol,
    (snap) => {
      currentSubgroups = snap.docs.map((d) => d.data() as YearSubgroup);
      decrementPending();
    },
    onError
  );

  // 5. Students
  const unsubStudents = onSnapshot(
    studentsCol,
    (snap) => {
      currentStudents = snap.docs.map((d) => d.data() as Student);
      decrementPending();
    },
    onError
  );

  // 6. Restrictions
  const unsubRestrictions = onSnapshot(
    restrictionsCol,
    (snap) => {
      currentRestrictions = snap.docs.map((d) => d.data() as Restriction);
      decrementPending();
    },
    onError
  );

  // 7. Exceptions
  const unsubExceptions = onSnapshot(
    exceptionsCol,
    (snap) => {
      currentExceptions = snap.docs.map((d) => d.data() as TemporaryException);
      decrementPending();
    },
    onError
  );

  // 8. Timetable Slots
  const unsubSlots = onSnapshot(
    slotsCol,
    (snap) => {
      currentSlots = snap.docs.map((d) => d.data() as TimetableSlot);
      decrementPending();
    },
    onError
  );

  return () => {
    unsubProfile();
    unsubSchools();
    unsubYearGroups();
    unsubSubgroups();
    unsubStudents();
    unsubRestrictions();
    unsubExceptions();
    unsubSlots();
  };
}

/**
 * Checks if user has an existing database profile. If not, creates a clean empty account.
 */
export async function ensureUserInitialized(userId: string, email: string, name?: string): Promise<boolean> {
  const userRef = doc(db, 'users', userId);
  const snap = await getDoc(userRef);
  if (!snap.exists()) {
    const cleanProfile = createCleanTeacherProfile(userId, email, name);
    await setDoc(userRef, cleanForFirestore(cleanProfile));
    return true; // was newly created
  }
  return false;
}

/**
 * Save / Update Teacher Profile
 */
export async function saveDbTeacherProfile(userId: string, profile: TeacherProfile): Promise<void> {
  const userRef = doc(db, 'users', userId);
  await setDoc(userRef, cleanForFirestore(profile), { merge: true });
}

/**
 * Save single school
 */
export async function saveDbSchool(userId: string, school: School): Promise<void> {
  const schoolRef = doc(db, 'users', userId, 'schools', school.id);
  await setDoc(schoolRef, cleanForFirestore(school), { merge: true });
}

/**
 * Save all schools (batch)
 */
export async function saveDbSchools(userId: string, schools: School[]): Promise<void> {
  const batch = writeBatch(db);
  // Get existing to find deletions
  const colRef = collection(db, 'users', userId, 'schools');
  const snap = await getDocs(colRef);
  const newIds = new Set(schools.map((s) => s.id));

  // Delete removed schools
  snap.docs.forEach((d) => {
    if (!newIds.has(d.id)) {
      batch.delete(d.ref);
    }
  });

  // Upsert new/updated schools
  schools.forEach((sc) => {
    batch.set(doc(db, 'users', userId, 'schools', sc.id), cleanForFirestore(sc), { merge: true });
  });

  await batch.commit();
}

/**
 * Delete a school
 */
export async function deleteDbSchool(userId: string, schoolId: string): Promise<void> {
  await deleteDoc(doc(db, 'users', userId, 'schools', schoolId));
}

/**
 * Save Year Groups
 */
export async function saveDbYearGroups(userId: string, yearGroups: YearGroup[]): Promise<void> {
  const batch = writeBatch(db);
  const colRef = collection(db, 'users', userId, 'yearGroups');
  const snap = await getDocs(colRef);
  const newIds = new Set(yearGroups.map((y) => y.id));

  snap.docs.forEach((d) => {
    if (!newIds.has(d.id)) {
      batch.delete(d.ref);
    }
  });

  yearGroups.forEach((yg) => {
    batch.set(doc(db, 'users', userId, 'yearGroups', yg.id), cleanForFirestore(yg), { merge: true });
  });

  await batch.commit();
}

/**
 * Save Subgroups
 */
export async function saveDbSubgroups(userId: string, subgroups: YearSubgroup[]): Promise<void> {
  const batch = writeBatch(db);
  const colRef = collection(db, 'users', userId, 'subgroups');
  const snap = await getDocs(colRef);
  const newIds = new Set(subgroups.map((s) => s.id));

  snap.docs.forEach((d) => {
    if (!newIds.has(d.id)) {
      batch.delete(d.ref);
    }
  });

  subgroups.forEach((sg) => {
    batch.set(doc(db, 'users', userId, 'subgroups', sg.id), cleanForFirestore(sg), { merge: true });
  });

  await batch.commit();
}

/**
 * Save single student
 */
export async function saveDbStudent(userId: string, student: Student): Promise<void> {
  const stuRef = doc(db, 'users', userId, 'students', student.id);
  await setDoc(stuRef, cleanForFirestore(student), { merge: true });
}

/**
 * Save all students (batch)
 */
export async function saveDbStudents(userId: string, students: Student[]): Promise<void> {
  const batch = writeBatch(db);
  const colRef = collection(db, 'users', userId, 'students');
  const snap = await getDocs(colRef);
  const newIds = new Set(students.map((s) => s.id));

  snap.docs.forEach((d) => {
    if (!newIds.has(d.id)) {
      batch.delete(d.ref);
    }
  });

  students.forEach((stu) => {
    batch.set(doc(db, 'users', userId, 'students', stu.id), cleanForFirestore(stu), { merge: true });
  });

  await batch.commit();
}

/**
 * Delete a student
 */
export async function deleteDbStudent(userId: string, studentId: string): Promise<void> {
  await deleteDoc(doc(db, 'users', userId, 'students', studentId));
}

/**
 * Save all timetable slots (batch)
 */
export async function saveDbTimetableSlots(userId: string, slots: TimetableSlot[]): Promise<void> {
  const batch = writeBatch(db);
  const colRef = collection(db, 'users', userId, 'timetableSlots');
  const snap = await getDocs(colRef);
  const newIds = new Set(slots.map((s) => s.id));

  snap.docs.forEach((d) => {
    if (!newIds.has(d.id)) {
      batch.delete(d.ref);
    }
  });

  slots.forEach((slot) => {
    batch.set(doc(db, 'users', userId, 'timetableSlots', slot.id), cleanForFirestore(slot), { merge: true });
  });

  await batch.commit();
}

/**
 * Save restrictions (batch)
 */
export async function saveDbRestrictions(userId: string, restrictions: Restriction[]): Promise<void> {
  const batch = writeBatch(db);
  const colRef = collection(db, 'users', userId, 'restrictions');
  const snap = await getDocs(colRef);
  const newIds = new Set(restrictions.map((r) => r.id));

  snap.docs.forEach((d) => {
    if (!newIds.has(d.id)) {
      batch.delete(d.ref);
    }
  });

  restrictions.forEach((r) => {
    batch.set(doc(db, 'users', userId, 'restrictions', r.id), cleanForFirestore(r), { merge: true });
  });

  await batch.commit();
}

/**
 * Save temporary exceptions (batch)
 */
export async function saveDbExceptions(userId: string, exceptions: TemporaryException[]): Promise<void> {
  const batch = writeBatch(db);
  const colRef = collection(db, 'users', userId, 'temporaryExceptions');
  const snap = await getDocs(colRef);
  const newIds = new Set(exceptions.map((e) => e.id));

  snap.docs.forEach((d) => {
    if (!newIds.has(d.id)) {
      batch.delete(d.ref);
    }
  });

  exceptions.forEach((ex) => {
    batch.set(doc(db, 'users', userId, 'temporaryExceptions', ex.id), cleanForFirestore(ex), { merge: true });
  });

  await batch.commit();
}

/**
 * Populates sample/demo data into the user's account if requested by user
 */
export async function populateUserDemoData(userId: string): Promise<void> {
  await saveDbSchools(userId, initialSchools);
  await saveDbYearGroups(userId, initialYearGroups);
  await saveDbSubgroups(userId, initialYearSubgroups);
  await saveDbStudents(userId, initialStudents);
  await saveDbRestrictions(userId, initialRestrictions);
  await saveDbExceptions(userId, initialTemporaryExceptions);
  await saveDbTimetableSlots(userId, initialTimetableSlots);
}

/**
 * Clears all data in user's account (resets to completely empty state)
 */
export async function clearUserAccountData(userId: string): Promise<void> {
  await saveDbSchools(userId, []);
  await saveDbYearGroups(userId, []);
  await saveDbSubgroups(userId, []);
  await saveDbStudents(userId, []);
  await saveDbRestrictions(userId, []);
  await saveDbExceptions(userId, []);
  await saveDbTimetableSlots(userId, []);
}

/**
 * Imports existing localStorage state into Firestore for the current user
 */
export async function importLocalPrototypeData(userId: string, localState: AppState): Promise<void> {
  await saveDbTeacherProfile(userId, localState.teacherProfile);
  await saveDbSchools(userId, localState.schools);
  await saveDbYearGroups(userId, localState.yearGroups);
  await saveDbSubgroups(userId, localState.subgroups);
  await saveDbStudents(userId, localState.students);
  await saveDbRestrictions(userId, localState.restrictions);
  await saveDbExceptions(userId, localState.temporaryExceptions);
  await saveDbTimetableSlots(userId, localState.timetableSlots);
}

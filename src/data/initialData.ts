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

export const initialTeacherProfile: TeacherProfile = {
  name: 'Kostis Piano',
  email: 'kostis@musiorg.com',
  instruments: ['Piano', 'Violin', 'Cello', 'Flute', 'Clarinet', 'Guitar'],
  workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  startHour: '08:30',
  finishHour: '16:00',
  maxHoursPerDay: 7,
  cycleTerminology: 'week_ab',
  travelTimesMinutes: {
    'school_st_marys_school_oakwood': 25,
    'school_oakwood_school_highfield': 20,
  },
  minimizeGapsPreference: true,
  keepConsistentBetweenWeeksPreference: true,
  keepNormalDayPreference: true,
};

export const initialSchools: School[] = [
  {
    id: 'school_st_marys',
    name: "St Mary's Primary",
    code: 'ST_MARY',
    teachingDays: ['Monday', 'Wednesday'],
    address: 'Church Lane, St Marys',
    travelNotes: 'Dedicated music room next to main hall. Park in staff car park bay 4.',
    currentWeekCycle: 'A',
    cycleTerminology: 'week_ab',
    cycleNotes: 'Follows normal standard Week A/B cycle.',
    colorTheme: 'sage',
    dayHours: {
      Monday: { startTime: '09:00', endTime: '15:30', standardLessonDuration: 30 },
      Tuesday: { startTime: '09:00', endTime: '15:30', standardLessonDuration: 30 },
      Wednesday: { startTime: '09:00', endTime: '15:30', standardLessonDuration: 30 },
      Thursday: { startTime: '09:00', endTime: '15:30', standardLessonDuration: 30 },
      Friday: { startTime: '09:00', endTime: '15:30', standardLessonDuration: 30 },
    },
    breaks: [
      { id: 'sm_b1_mon', schoolId: 'school_st_marys', title: 'Morning Break', day: 'Monday', startTime: '10:30', endTime: '10:50' },
      { id: 'sm_b2_mon', schoolId: 'school_st_marys', title: 'Lunch', day: 'Monday', startTime: '12:15', endTime: '13:15' },
      { id: 'sm_b1_wed', schoolId: 'school_st_marys', title: 'Morning Break', day: 'Wednesday', startTime: '10:30', endTime: '10:50' },
      { id: 'sm_b2_wed', schoolId: 'school_st_marys', title: 'Lunch', day: 'Wednesday', startTime: '12:15', endTime: '13:15' },
    ],
  },
  {
    id: 'school_oakwood',
    name: 'Oakwood Grammar School',
    code: 'OAKWOOD',
    teachingDays: ['Tuesday', 'Thursday'],
    address: 'Oakwood Avenue',
    travelNotes: 'Practice Room 3 in Performing Arts block. Key fob from main reception.',
    currentWeekCycle: 'B',
    cycleTerminology: 'week_ab',
    cycleNotes: 'Currently on Week B (school calendar is one week offset from St Marys due to late term start).',
    colorTheme: 'sky',
    dayHours: {
      Monday: { startTime: '08:45', endTime: '15:15', standardLessonDuration: 30 },
      Tuesday: { startTime: '08:45', endTime: '15:15', standardLessonDuration: 30 },
      Wednesday: { startTime: '08:45', endTime: '15:15', standardLessonDuration: 30 },
      Thursday: { startTime: '08:45', endTime: '15:15', standardLessonDuration: 30 },
      Friday: { startTime: '08:45', endTime: '15:15', standardLessonDuration: 30 },
    },
    breaks: [
      { id: 'oak_b1_tue', schoolId: 'school_oakwood', title: 'Morning Break', day: 'Tuesday', startTime: '10:45', endTime: '11:05' },
      { id: 'oak_b2_tue', schoolId: 'school_oakwood', title: 'Lunch', day: 'Tuesday', startTime: '12:35', endTime: '13:25' },
      { id: 'oak_b1_thu', schoolId: 'school_oakwood', title: 'Morning Break', day: 'Thursday', startTime: '10:45', endTime: '11:05' },
      { id: 'oak_b2_thu', schoolId: 'school_oakwood', title: 'Lunch', day: 'Thursday', startTime: '12:35', endTime: '13:25' },
    ],
  },
  {
    id: 'school_highfield',
    name: 'Highfield Academy',
    code: 'HIGHFIELD',
    teachingDays: ['Friday'],
    address: 'Highfield Road',
    travelNotes: 'Piano in Year 5 resource room. Sign in via visitor tablet.',
    currentWeekCycle: 'A',
    cycleTerminology: 'week_12',
    cycleNotes: 'Highfield refers to cycles as Week 1 and Week 2.',
    colorTheme: 'warm',
    dayHours: {
      Monday: { startTime: '09:00', endTime: '15:00', standardLessonDuration: 30 },
      Tuesday: { startTime: '09:00', endTime: '15:00', standardLessonDuration: 30 },
      Wednesday: { startTime: '09:00', endTime: '15:00', standardLessonDuration: 30 },
      Thursday: { startTime: '09:00', endTime: '15:00', standardLessonDuration: 30 },
      Friday: { startTime: '09:00', endTime: '15:00', standardLessonDuration: 30 },
    },
    breaks: [
      { id: 'hf_b1_fri', schoolId: 'school_highfield', title: 'Morning Break', day: 'Friday', startTime: '10:30', endTime: '10:50' },
      { id: 'hf_b2_fri', schoolId: 'school_highfield', title: 'Lunch', day: 'Friday', startTime: '12:00', endTime: '13:00' },
    ],
  },
];

export const initialYearGroups: YearGroup[] = [
  // St Mary's
  { id: 'yg_sm_y3', schoolId: 'school_st_marys', name: 'Y3' },
  { id: 'yg_sm_y4', schoolId: 'school_st_marys', name: 'Y4' },
  { id: 'yg_sm_y5', schoolId: 'school_st_marys', name: 'Y5' },
  { id: 'yg_sm_y6', schoolId: 'school_st_marys', name: 'Y6' },

  // Oakwood
  { id: 'yg_oak_y7', schoolId: 'school_oakwood', name: 'Y7' },
  { id: 'yg_oak_y8', schoolId: 'school_oakwood', name: 'Y8' },
  { id: 'yg_oak_y9', schoolId: 'school_oakwood', name: 'Y9' },

  // Highfield
  { id: 'yg_hf_y3', schoolId: 'school_highfield', name: 'Y3' },
  { id: 'yg_hf_y4', schoolId: 'school_highfield', name: 'Y4' },
  { id: 'yg_hf_y5', schoolId: 'school_highfield', name: 'Y5' },
  { id: 'yg_hf_y6', schoolId: 'school_highfield', name: 'Y6' },
];

export const initialYearSubgroups: YearSubgroup[] = [
  // St Mary's Y4
  { id: 'sub_sm_y4_1', schoolId: 'school_st_marys', yearGroupId: 'yg_sm_y4', name: 'Y4.1' },
  { id: 'sub_sm_y4_2', schoolId: 'school_st_marys', yearGroupId: 'yg_sm_y4', name: 'Y4.2' },

  // Oakwood Y7
  { id: 'sub_oak_y7_1', schoolId: 'school_oakwood', yearGroupId: 'yg_oak_y7', name: 'Y7.1' },
  { id: 'sub_oak_y7_2', schoolId: 'school_oakwood', yearGroupId: 'yg_oak_y7', name: 'Y7.2' },
  { id: 'sub_oak_y7_3', schoolId: 'school_oakwood', yearGroupId: 'yg_oak_y7', name: 'Y7.3' },
  { id: 'sub_oak_y7_4', schoolId: 'school_oakwood', yearGroupId: 'yg_oak_y7', name: 'Y7.4' },

  // Oakwood Y8
  { id: 'sub_oak_y8_1', schoolId: 'school_oakwood', yearGroupId: 'yg_oak_y8', name: 'Y8.1' },
  { id: 'sub_oak_y8_2', schoolId: 'school_oakwood', yearGroupId: 'yg_oak_y8', name: 'Y8.2' },
];

export const initialRestrictions: Restriction[] = [
  // St Mary's - Y4.1 Swimming (Monday 9:00-10:00)
  {
    id: 'rest_sm_y4_1_swim',
    scope: 'subgroup',
    targetId: 'sub_sm_y4_1',
    schoolId: 'school_st_marys',
    type: 'hard',
    weekPattern: 'all',
    dayOfWeek: 'Monday',
    startTime: '09:00',
    endTime: '10:00',
    reason: 'Swimming (at town leisure centre)',
  },
  // St Mary's - Y6 Assembly (Wednesday 11:00-11:30)
  {
    id: 'rest_sm_y6_assembly',
    scope: 'year',
    targetId: 'yg_sm_y6',
    schoolId: 'school_st_marys',
    type: 'hard',
    weekPattern: 'all',
    dayOfWeek: 'Wednesday',
    startTime: '11:00',
    endTime: '11:30',
    reason: 'Key Stage 2 Assembly',
  },
  // Oakwood - Y7.1 PE (Tuesday 10:00-11:00)
  {
    id: 'rest_oak_y7_1_pe',
    scope: 'subgroup',
    targetId: 'sub_oak_y7_1',
    schoolId: 'school_oakwood',
    type: 'hard',
    weekPattern: 'all',
    dayOfWeek: 'Tuesday',
    startTime: '10:00',
    endTime: '11:00',
    reason: 'PE / Games field',
  },
  // Oakwood - Y7.2 Drama (Tuesday 14:00-15:00)
  {
    id: 'rest_oak_y7_2_drama',
    scope: 'subgroup',
    targetId: 'sub_oak_y7_2',
    schoolId: 'school_oakwood',
    type: 'hard',
    weekPattern: 'all',
    dayOfWeek: 'Tuesday',
    startTime: '14:00',
    endTime: '15:00',
    reason: 'Drama Performance Workshop',
  },
  // Highfield - Whole School Hymn Practice (Friday 9:00-9:30)
  {
    id: 'rest_hf_school_hymn',
    scope: 'school',
    targetId: 'school_highfield',
    schoolId: 'school_highfield',
    type: 'hard',
    weekPattern: 'all',
    dayOfWeek: 'Friday',
    startTime: '09:00',
    endTime: '09:30',
    reason: 'Whole School Hymn Practice',
  },
  // John Edwards - Sports (Tuesday 09:00-10:00 on Week B)
  {
    id: 'rest_stu_john_sports',
    scope: 'student',
    targetId: 'stu_john_edwards',
    schoolId: 'school_oakwood',
    type: 'hard',
    weekPattern: 'week_b',
    dayOfWeek: 'Tuesday',
    startTime: '09:00',
    endTime: '10:00',
    reason: 'Sports',
  },
];

export const initialTemporaryExceptions: TemporaryException[] = [
  {
    id: 'ex_1',
    targetScope: 'student',
    targetId: 'stu_emma_wood',
    title: 'Emma Wood · Dental Appointment',
    date: '2026-10-14',
    weekCycle: 'B',
    day: 'Tuesday',
    type: 'absence',
    reason: 'Specialist orthodontist appointment',
  },
];

export const initialStudents: Student[] = [
  // --- St Mary's Monday Students ---
  {
    id: 'stu_lucas_davies',
    schoolId: 'school_st_marys',
    yearGroupId: 'yg_sm_y4',
    subgroupId: 'sub_sm_y4_2', // Y4.2 - Available during 9:00-10:00!
    name: 'Lucas Davies',
    instrument: 'Cello',
    lessonDuration: 30,
    normalTeachingDay: 'Monday',
    frequency: 'weekly',
    preferredTime: 'morning',
    notes: 'Grade 2 Cello exam in Summer term.',
  },
  {
    id: 'stu_sophia_chen',
    schoolId: 'school_st_marys',
    yearGroupId: 'yg_sm_y4',
    subgroupId: 'sub_sm_y4_1', // Y4.1 - has swimming 9:00-10:00
    name: 'Sophia Chen',
    instrument: 'Piano',
    lessonDuration: 30,
    normalTeachingDay: 'Monday',
    frequency: 'weekly',
    preferredTime: 'morning',
    notes: 'Cannot do 9:00-10:00 due to swimming.',
  },
  {
    id: 'stu_leo_miller',
    schoolId: 'school_st_marys',
    yearGroupId: 'yg_sm_y5',
    name: 'Leo Miller',
    instrument: 'Piano',
    lessonDuration: 30,
    normalTeachingDay: 'Monday',
    frequency: 'weekly',
    preferredTime: 'morning',
    siblingStudentIds: ['stu_maya_miller'],
    allowedWindows: [
      {
        id: 'win_leo_wk1',
        weekPattern: 'week_a',
        dayOfWeek: 'Monday',
        startTime: '09:00',
        endTime: '10:00',
        notes: 'Only free 9:00–10:00 in Week 1',
      },
      {
        id: 'win_leo_wk2',
        weekPattern: 'week_b',
        dayOfWeek: 'Monday',
        startTime: '10:00',
        endTime: '11:00',
        notes: 'Only free 10:00–11:00 in Week 2',
      },
    ],
  },
  {
    id: 'stu_john_edwards',
    schoolId: 'school_oakwood',
    yearGroupId: 'yg_oak_y8',
    subgroupId: 'sub_oak_y8_1',
    name: 'John Edwards',
    instrument: 'Trumpet',
    lessonDuration: 30,
    normalTeachingDay: 'Tuesday',
    frequency: 'weekly',
    preferredTime: 'morning',
    notes: 'Sports 9am-10am on Week B.',
  },
  {
    id: 'stu_maya_miller',
    schoolId: 'school_st_marys',
    yearGroupId: 'yg_sm_y3',
    name: 'Maya Miller',
    instrument: 'Violin',
    lessonDuration: 30,
    normalTeachingDay: 'Monday',
    frequency: 'weekly',
    preferredTime: 'morning',
    siblingStudentIds: ['stu_leo_miller'],
  },
  {
    id: 'stu_oscar_brown',
    schoolId: 'school_st_marys',
    yearGroupId: 'yg_sm_y6',
    name: 'Oscar Brown',
    instrument: 'Flute',
    lessonDuration: 30,
    normalTeachingDay: 'Monday',
    frequency: 'weekly',
    preferredTime: 'afternoon',
  },
  {
    id: 'stu_charlotte_evans',
    schoolId: 'school_st_marys',
    yearGroupId: 'yg_sm_y5',
    name: 'Charlotte Evans',
    instrument: 'Piano',
    lessonDuration: 30,
    normalTeachingDay: 'Monday',
    frequency: 'weekly',
    preferredTime: 'afternoon',
  },
  {
    id: 'stu_george_clark',
    schoolId: 'school_st_marys',
    yearGroupId: 'yg_sm_y3',
    name: 'George Clark',
    instrument: 'Violin',
    lessonDuration: 30,
    normalTeachingDay: 'Monday',
    frequency: 'weekly',
    preferredTime: 'afternoon',
  },
  // Alternating students on Monday
  {
    id: 'stu_hannah_white',
    schoolId: 'school_st_marys',
    yearGroupId: 'yg_sm_y4',
    subgroupId: 'sub_sm_y4_2',
    name: 'Hannah White',
    instrument: 'Clarinet',
    lessonDuration: 30,
    normalTeachingDay: 'Monday',
    frequency: 'week_a_only',
    preferredTime: 'afternoon',
    notes: 'Shares slot with James Taylor fortnightly.',
  },
  {
    id: 'stu_james_taylor',
    schoolId: 'school_st_marys',
    yearGroupId: 'yg_sm_y4',
    subgroupId: 'sub_sm_y4_2',
    name: 'James Taylor',
    instrument: 'Clarinet',
    lessonDuration: 30,
    normalTeachingDay: 'Monday',
    frequency: 'week_b_only',
    preferredTime: 'afternoon',
    notes: 'Fortnightly lesson on Week B.',
  },

  // --- St Mary's Wednesday Students ---
  {
    id: 'stu_isla_hughes',
    schoolId: 'school_st_marys',
    yearGroupId: 'yg_sm_y3',
    name: 'Isla Hughes',
    instrument: 'Violin',
    lessonDuration: 30,
    normalTeachingDay: 'Wednesday',
    frequency: 'weekly',
    preferredTime: 'morning',
  },
  {
    id: 'stu_harry_williams',
    schoolId: 'school_st_marys',
    yearGroupId: 'yg_sm_y4',
    subgroupId: 'sub_sm_y4_1',
    name: 'Harry Williams',
    instrument: 'Piano',
    lessonDuration: 30,
    normalTeachingDay: 'Wednesday',
    frequency: 'weekly',
    preferredTime: 'morning',
  },
  {
    id: 'stu_freya_morris',
    schoolId: 'school_st_marys',
    yearGroupId: 'yg_sm_y6',
    name: 'Freya Morris',
    instrument: 'Violin',
    lessonDuration: 30,
    normalTeachingDay: 'Wednesday',
    frequency: 'weekly',
    preferredTime: 'afternoon',
    notes: 'Cannot clash with Y6 Assembly at 11:00.',
  },
  {
    id: 'stu_arthur_lewis',
    schoolId: 'school_st_marys',
    yearGroupId: 'yg_sm_y5',
    name: 'Arthur Lewis',
    instrument: 'Cello',
    lessonDuration: 30,
    normalTeachingDay: 'Wednesday',
    frequency: 'weekly',
    preferredTime: 'afternoon',
  },
  {
    id: 'stu_chloe_king',
    schoolId: 'school_st_marys',
    yearGroupId: 'yg_sm_y6',
    name: 'Chloe King',
    instrument: 'Flute',
    lessonDuration: 30,
    normalTeachingDay: 'Wednesday',
    frequency: 'weekly',
    preferredTime: 'afternoon',
  },

  // --- Oakwood Tuesday Students ---
  {
    id: 'stu_emma_wood',
    schoolId: 'school_oakwood',
    yearGroupId: 'yg_oak_y7',
    subgroupId: 'sub_oak_y7_1', // Y7.1 (PE at 10:00-11:00)
    name: 'Emma Wood',
    instrument: 'Flute',
    lessonDuration: 30,
    normalTeachingDay: 'Tuesday',
    frequency: 'weekly',
    preferredTime: 'morning',
    notes: 'Week A 9:30, Week B 10:00 (outside PE on Week A, adjusted on Week B).',
  },
  {
    id: 'stu_oliver_smith',
    schoolId: 'school_oakwood',
    yearGroupId: 'yg_oak_y7',
    subgroupId: 'sub_oak_y7_1', // Y7.1
    name: 'Oliver Smith',
    instrument: 'Violin',
    lessonDuration: 30,
    normalTeachingDay: 'Tuesday',
    frequency: 'weekly',
    preferredTime: 'morning',
    notes: 'Y7.1 PE at 10:00-11:00. Must not clash with PE.',
  },
  {
    id: 'stu_thomas_baker',
    schoolId: 'school_oakwood',
    yearGroupId: 'yg_oak_y7',
    subgroupId: 'sub_oak_y7_4', // Y7.4 - Available during 10:00-11:00!
    name: 'Thomas Baker',
    instrument: 'Clarinet',
    lessonDuration: 30,
    normalTeachingDay: 'Tuesday',
    frequency: 'weekly',
    preferredTime: 'morning',
    notes: 'Y7.4 does NOT have PE at 10:00; available during this period.',
  },
  {
    id: 'stu_grace_wilson',
    schoolId: 'school_oakwood',
    yearGroupId: 'yg_oak_y8',
    subgroupId: 'sub_oak_y8_1',
    name: 'Grace Wilson',
    instrument: 'Piano',
    lessonDuration: 30,
    normalTeachingDay: 'Tuesday',
    frequency: 'weekly',
    preferredTime: 'morning',
  },
  {
    id: 'stu_alex_cooper',
    schoolId: 'school_oakwood',
    yearGroupId: 'yg_oak_y9',
    name: 'Alex Cooper',
    instrument: 'Violin',
    lessonDuration: 30,
    normalTeachingDay: 'Tuesday',
    frequency: 'weekly',
    preferredTime: 'afternoon',
  },
  {
    id: 'stu_mia_turner',
    schoolId: 'school_oakwood',
    yearGroupId: 'yg_oak_y7',
    subgroupId: 'sub_oak_y7_2', // Y7.2 Drama at 14:00
    name: 'Mia Turner',
    instrument: 'Piano',
    lessonDuration: 30,
    normalTeachingDay: 'Tuesday',
    frequency: 'weekly',
    preferredTime: 'afternoon',
    notes: 'Cannot do 14:00-15:00 due to Drama workshop.',
  },
  {
    id: 'stu_noah_harris',
    schoolId: 'school_oakwood',
    yearGroupId: 'yg_oak_y8',
    subgroupId: 'sub_oak_y8_2',
    name: 'Noah Harris',
    instrument: 'Cello',
    lessonDuration: 30,
    normalTeachingDay: 'Tuesday',
    frequency: 'weekly',
    preferredTime: 'afternoon',
  },

  // --- Oakwood Thursday Students ---
  {
    id: 'stu_zoe_parker',
    schoolId: 'school_oakwood',
    yearGroupId: 'yg_oak_y8',
    subgroupId: 'sub_oak_y8_1',
    name: 'Zoe Parker',
    instrument: 'Flute',
    lessonDuration: 30,
    normalTeachingDay: 'Thursday',
    frequency: 'weekly',
    preferredTime: 'morning',
  },
  {
    id: 'stu_ethan_bell',
    schoolId: 'school_oakwood',
    yearGroupId: 'yg_oak_y7',
    subgroupId: 'sub_oak_y7_3',
    name: 'Ethan Bell',
    instrument: 'Violin',
    lessonDuration: 30,
    normalTeachingDay: 'Thursday',
    frequency: 'weekly',
    preferredTime: 'morning',
  },
  {
    id: 'stu_ava_richardson',
    schoolId: 'school_oakwood',
    yearGroupId: 'yg_oak_y9',
    name: 'Ava Richardson',
    instrument: 'Piano',
    lessonDuration: 45, // 45m lesson
    normalTeachingDay: 'Thursday',
    frequency: 'weekly',
    preferredTime: 'morning',
  },
  {
    id: 'stu_benjamin_scott',
    schoolId: 'school_oakwood',
    yearGroupId: 'yg_oak_y8',
    subgroupId: 'sub_oak_y8_2',
    name: 'Benjamin Scott',
    instrument: 'Clarinet',
    lessonDuration: 30,
    normalTeachingDay: 'Thursday',
    frequency: 'weekly',
    preferredTime: 'afternoon',
  },
  {
    id: 'stu_lily_green',
    schoolId: 'school_oakwood',
    yearGroupId: 'yg_oak_y7',
    subgroupId: 'sub_oak_y7_2',
    name: 'Lily Green',
    instrument: 'Violin',
    lessonDuration: 30,
    normalTeachingDay: 'Thursday',
    frequency: 'weekly',
    preferredTime: 'afternoon',
  },

  // --- Highfield Friday Students ---
  {
    id: 'stu_samuel_adams',
    schoolId: 'school_highfield',
    yearGroupId: 'yg_hf_y4',
    name: 'Samuel Adams',
    instrument: 'Piano',
    lessonDuration: 30,
    normalTeachingDay: 'Friday',
    frequency: 'weekly',
    preferredTime: 'morning',
    notes: 'After school hymn practice (from 9:30).',
  },
  {
    id: 'stu_ella_wright',
    schoolId: 'school_highfield',
    yearGroupId: 'yg_hf_y5',
    name: 'Ella Wright',
    instrument: 'Violin',
    lessonDuration: 30,
    normalTeachingDay: 'Friday',
    frequency: 'weekly',
    preferredTime: 'morning',
  },
  {
    id: 'stu_daniel_hill',
    schoolId: 'school_highfield',
    yearGroupId: 'yg_hf_y6',
    name: 'Daniel Hill',
    instrument: 'Flute',
    lessonDuration: 30,
    normalTeachingDay: 'Friday',
    frequency: 'weekly',
    preferredTime: 'afternoon',
  },
  {
    id: 'stu_poppy_ward',
    schoolId: 'school_highfield',
    yearGroupId: 'yg_hf_y3',
    name: 'Poppy Ward',
    instrument: 'Violin',
    lessonDuration: 30,
    normalTeachingDay: 'Friday',
    frequency: 'weekly',
    preferredTime: 'afternoon',
  },
  {
    id: 'stu_jack_fletcher',
    schoolId: 'school_highfield',
    yearGroupId: 'yg_hf_y5',
    name: 'Jack Fletcher',
    instrument: 'Piano',
    lessonDuration: 30,
    normalTeachingDay: 'Friday',
    frequency: 'weekly',
    preferredTime: 'afternoon',
  },
];

export const initialTimetableSlots: TimetableSlot[] = [
  // ===================== WEEK A SLOTS =====================
  // St Mary's - Monday (Week A)
  // 9:00 Lucas Davies (Y4.2 - swimming is Y4.1 only!)
  { id: 'slot_a_sm_1', weekCycle: 'A', schoolId: 'school_st_marys', studentId: 'stu_lucas_davies', day: 'Monday', startTime: '09:00', endTime: '09:30', duration: 30 },
  // 9:30 Maya Miller (Y3)
  { id: 'slot_a_sm_2', weekCycle: 'A', schoolId: 'school_st_marys', studentId: 'stu_maya_miller', day: 'Monday', startTime: '09:30', endTime: '10:00', duration: 30 },
  // 10:00 Leo Miller (Y5 - sibling back to back)
  { id: 'slot_a_sm_3', weekCycle: 'A', schoolId: 'school_st_marys', studentId: 'stu_leo_miller', day: 'Monday', startTime: '10:00', endTime: '10:30', duration: 30 },
  // 10:30-10:50 Morning Break
  // 10:50 Sophia Chen (Y4.1 - after swimming finished)
  { id: 'slot_a_sm_4', weekCycle: 'A', schoolId: 'school_st_marys', studentId: 'stu_sophia_chen', day: 'Monday', startTime: '10:50', endTime: '11:20', duration: 30 },
  // 11:20 Oscar Brown (Y6)
  { id: 'slot_a_sm_5', weekCycle: 'A', schoolId: 'school_st_marys', studentId: 'stu_oscar_brown', day: 'Monday', startTime: '11:20', endTime: '11:50', duration: 30 },
  // 11:50 Charlotte Evans (Y5)
  { id: 'slot_a_sm_6', weekCycle: 'A', schoolId: 'school_st_marys', studentId: 'stu_charlotte_evans', day: 'Monday', startTime: '11:50', endTime: '12:20', duration: 30 },
  // 12:15-13:15 Lunch
  // 13:20 George Clark (Y3)
  { id: 'slot_a_sm_7', weekCycle: 'A', schoolId: 'school_st_marys', studentId: 'stu_george_clark', day: 'Monday', startTime: '13:20', endTime: '13:50', duration: 30 },
  // 13:50 Hannah White (Week A only)
  { id: 'slot_a_sm_8', weekCycle: 'A', schoolId: 'school_st_marys', studentId: 'stu_hannah_white', day: 'Monday', startTime: '13:50', endTime: '14:20', duration: 30 },

  // St Mary's - Wednesday (Week A)
  { id: 'slot_a_sm_w1', weekCycle: 'A', schoolId: 'school_st_marys', studentId: 'stu_isla_hughes', day: 'Wednesday', startTime: '09:00', endTime: '09:30', duration: 30 },
  { id: 'slot_a_sm_w2', weekCycle: 'A', schoolId: 'school_st_marys', studentId: 'stu_harry_williams', day: 'Wednesday', startTime: '09:30', endTime: '10:00', duration: 30 },
  // 10:30-10:50 Break
  // (11:00-11:30 is Y6 assembly, so Freya is placed at 11:35)
  { id: 'slot_a_sm_w3', weekCycle: 'A', schoolId: 'school_st_marys', studentId: 'stu_freya_morris', day: 'Wednesday', startTime: '11:35', endTime: '12:05', duration: 30 },
  // Lunch 12:15-13:15
  { id: 'slot_a_sm_w4', weekCycle: 'A', schoolId: 'school_st_marys', studentId: 'stu_arthur_lewis', day: 'Wednesday', startTime: '13:20', endTime: '13:50', duration: 30 },
  { id: 'slot_a_sm_w5', weekCycle: 'A', schoolId: 'school_st_marys', studentId: 'stu_chloe_king', day: 'Wednesday', startTime: '13:50', endTime: '14:20', duration: 30 },

  // Oakwood - Tuesday (Week A)
  // 8:45 Grace Wilson
  { id: 'slot_a_oak_t1', weekCycle: 'A', schoolId: 'school_oakwood', studentId: 'stu_grace_wilson', day: 'Tuesday', startTime: '08:45', endTime: '09:15', duration: 30 },
  // 9:15 Oliver Smith (Y7.1 - before PE at 10:00)
  { id: 'slot_a_oak_t2', weekCycle: 'A', schoolId: 'school_oakwood', studentId: 'stu_oliver_smith', day: 'Tuesday', startTime: '09:15', endTime: '09:45', duration: 30 },
  // 9:45 Emma Wood (Week A: 9:45)
  { id: 'slot_a_oak_t3', weekCycle: 'A', schoolId: 'school_oakwood', studentId: 'stu_emma_wood', day: 'Tuesday', startTime: '09:45', endTime: '10:15', duration: 30 },
  // 10:15 Thomas Baker (Y7.4 - PE restriction does NOT apply to Y7.4!)
  { id: 'slot_a_oak_t4', weekCycle: 'A', schoolId: 'school_oakwood', studentId: 'stu_thomas_baker', day: 'Tuesday', startTime: '10:15', endTime: '10:45', duration: 30 },
  // 10:45-11:05 Break
  { id: 'slot_a_oak_t5', weekCycle: 'A', schoolId: 'school_oakwood', studentId: 'stu_alex_cooper', day: 'Tuesday', startTime: '11:10', endTime: '11:40', duration: 30 },
  { id: 'slot_a_oak_t6', weekCycle: 'A', schoolId: 'school_oakwood', studentId: 'stu_noah_harris', day: 'Tuesday', startTime: '11:40', endTime: '12:10', duration: 30 },
  // Lunch 12:35-13:25
  // Mia Turner (Y7.2 - Drama at 14:00, so placed at 13:30)
  { id: 'slot_a_oak_t7', weekCycle: 'A', schoolId: 'school_oakwood', studentId: 'stu_mia_turner', day: 'Tuesday', startTime: '13:30', endTime: '14:00', duration: 30 },

  // Oakwood - Thursday (Week A)
  { id: 'slot_a_oak_th1', weekCycle: 'A', schoolId: 'school_oakwood', studentId: 'stu_zoe_parker', day: 'Thursday', startTime: '09:00', endTime: '09:30', duration: 30 },
  { id: 'slot_a_oak_th2', weekCycle: 'A', schoolId: 'school_oakwood', studentId: 'stu_ethan_bell', day: 'Thursday', startTime: '09:30', endTime: '10:00', duration: 30 },
  { id: 'slot_a_oak_th3', weekCycle: 'A', schoolId: 'school_oakwood', studentId: 'stu_ava_richardson', day: 'Thursday', startTime: '10:00', endTime: '10:45', duration: 45 },
  // Break 10:45-11:05
  { id: 'slot_a_oak_th4', weekCycle: 'A', schoolId: 'school_oakwood', studentId: 'stu_benjamin_scott', day: 'Thursday', startTime: '11:10', endTime: '11:40', duration: 30 },
  { id: 'slot_a_oak_th5', weekCycle: 'A', schoolId: 'school_oakwood', studentId: 'stu_lily_green', day: 'Thursday', startTime: '11:40', endTime: '12:10', duration: 30 },

  // Highfield - Friday (Week A)
  // (9:00-9:30 Hymn Practice)
  { id: 'slot_a_hf_f1', weekCycle: 'A', schoolId: 'school_highfield', studentId: 'stu_samuel_adams', day: 'Friday', startTime: '09:30', endTime: '10:00', duration: 30 },
  { id: 'slot_a_hf_f2', weekCycle: 'A', schoolId: 'school_highfield', studentId: 'stu_ella_wright', day: 'Friday', startTime: '10:00', endTime: '10:30', duration: 30 },
  // Break 10:30-10:50
  { id: 'slot_a_hf_f3', weekCycle: 'A', schoolId: 'school_highfield', studentId: 'stu_daniel_hill', day: 'Friday', startTime: '10:50', endTime: '11:20', duration: 30 },
  { id: 'slot_a_hf_f4', weekCycle: 'A', schoolId: 'school_highfield', studentId: 'stu_poppy_ward', day: 'Friday', startTime: '11:20', endTime: '11:50', duration: 30 },
  // Lunch 12:00-13:00
  { id: 'slot_a_hf_f5', weekCycle: 'A', schoolId: 'school_highfield', studentId: 'stu_jack_fletcher', day: 'Friday', startTime: '13:05', endTime: '13:35', duration: 30 },

  // ===================== WEEK B SLOTS =====================
  // Demonstrating Week B differences while keeping school day coordination:
  // St Mary's - Monday (Week B)
  { id: 'slot_b_sm_1', weekCycle: 'B', schoolId: 'school_st_marys', studentId: 'stu_lucas_davies', day: 'Monday', startTime: '09:00', endTime: '09:30', duration: 30 },
  { id: 'slot_b_sm_2', weekCycle: 'B', schoolId: 'school_st_marys', studentId: 'stu_maya_miller', day: 'Monday', startTime: '09:30', endTime: '10:00', duration: 30 },
  { id: 'slot_b_sm_3', weekCycle: 'B', schoolId: 'school_st_marys', studentId: 'stu_leo_miller', day: 'Monday', startTime: '10:00', endTime: '10:30', duration: 30 },
  { id: 'slot_b_sm_4', weekCycle: 'B', schoolId: 'school_st_marys', studentId: 'stu_sophia_chen', day: 'Monday', startTime: '10:50', endTime: '11:20', duration: 30 },
  { id: 'slot_b_sm_5', weekCycle: 'B', schoolId: 'school_st_marys', studentId: 'stu_oscar_brown', day: 'Monday', startTime: '11:20', endTime: '11:50', duration: 30 },
  { id: 'slot_b_sm_6', weekCycle: 'B', schoolId: 'school_st_marys', studentId: 'stu_charlotte_evans', day: 'Monday', startTime: '11:50', endTime: '12:20', duration: 30 },
  { id: 'slot_b_sm_7', weekCycle: 'B', schoolId: 'school_st_marys', studentId: 'stu_george_clark', day: 'Monday', startTime: '13:20', endTime: '13:50', duration: 30 },
  // Week B: James Taylor takes the alternating 13:50 slot instead of Hannah White
  { id: 'slot_b_sm_8', weekCycle: 'B', schoolId: 'school_st_marys', studentId: 'stu_james_taylor', day: 'Monday', startTime: '13:50', endTime: '14:20', duration: 30 },

  // St Mary's - Wednesday (Week B)
  { id: 'slot_b_sm_w1', weekCycle: 'B', schoolId: 'school_st_marys', studentId: 'stu_isla_hughes', day: 'Wednesday', startTime: '09:00', endTime: '09:30', duration: 30 },
  { id: 'slot_b_sm_w2', weekCycle: 'B', schoolId: 'school_st_marys', studentId: 'stu_harry_williams', day: 'Wednesday', startTime: '09:30', endTime: '10:00', duration: 30 },
  { id: 'slot_b_sm_w3', weekCycle: 'B', schoolId: 'school_st_marys', studentId: 'stu_freya_morris', day: 'Wednesday', startTime: '11:35', endTime: '12:05', duration: 30 },
  { id: 'slot_b_sm_w4', weekCycle: 'B', schoolId: 'school_st_marys', studentId: 'stu_arthur_lewis', day: 'Wednesday', startTime: '13:20', endTime: '13:50', duration: 30 },
  { id: 'slot_b_sm_w5', weekCycle: 'B', schoolId: 'school_st_marys', studentId: 'stu_chloe_king', day: 'Wednesday', startTime: '13:50', endTime: '14:20', duration: 30 },

  // Oakwood - Tuesday (Week B)
  // Emma Wood rotated to 10:00 or 11:10, Oliver adjusted
  { id: 'slot_b_oak_t1', weekCycle: 'B', schoolId: 'school_oakwood', studentId: 'stu_grace_wilson', day: 'Tuesday', startTime: '08:45', endTime: '09:15', duration: 30 },
  { id: 'slot_b_oak_t2', weekCycle: 'B', schoolId: 'school_oakwood', studentId: 'stu_oliver_smith', day: 'Tuesday', startTime: '09:15', endTime: '09:45', duration: 30 },
  { id: 'slot_b_oak_t3', weekCycle: 'B', schoolId: 'school_oakwood', studentId: 'stu_thomas_baker', day: 'Tuesday', startTime: '10:15', endTime: '10:45', duration: 30 },
  // Emma Wood has 11:10 slot on Week B!
  { id: 'slot_b_oak_t4', weekCycle: 'B', schoolId: 'school_oakwood', studentId: 'stu_emma_wood', day: 'Tuesday', startTime: '11:10', endTime: '11:40', duration: 30 },
  { id: 'slot_b_oak_t5', weekCycle: 'B', schoolId: 'school_oakwood', studentId: 'stu_alex_cooper', day: 'Tuesday', startTime: '11:40', endTime: '12:10', duration: 30 },
  { id: 'slot_b_oak_t6', weekCycle: 'B', schoolId: 'school_oakwood', studentId: 'stu_noah_harris', day: 'Tuesday', startTime: '13:30', endTime: '14:00', duration: 30 },
  { id: 'slot_b_oak_t7', weekCycle: 'B', schoolId: 'school_oakwood', studentId: 'stu_mia_turner', day: 'Tuesday', startTime: '14:35', endTime: '15:05', duration: 30 },

  // Oakwood - Thursday (Week B)
  { id: 'slot_b_oak_th1', weekCycle: 'B', schoolId: 'school_oakwood', studentId: 'stu_zoe_parker', day: 'Thursday', startTime: '09:00', endTime: '09:30', duration: 30 },
  { id: 'slot_b_oak_th2', weekCycle: 'B', schoolId: 'school_oakwood', studentId: 'stu_ethan_bell', day: 'Thursday', startTime: '09:30', endTime: '10:00', duration: 30 },
  { id: 'slot_b_oak_th3', weekCycle: 'B', schoolId: 'school_oakwood', studentId: 'stu_ava_richardson', day: 'Thursday', startTime: '10:00', endTime: '10:45', duration: 45 },
  { id: 'slot_b_oak_th4', weekCycle: 'B', schoolId: 'school_oakwood', studentId: 'stu_benjamin_scott', day: 'Thursday', startTime: '11:10', endTime: '11:40', duration: 30 },
  { id: 'slot_b_oak_th5', weekCycle: 'B', schoolId: 'school_oakwood', studentId: 'stu_lily_green', day: 'Thursday', startTime: '11:40', endTime: '12:10', duration: 30 },

  // Highfield - Friday (Week B)
  { id: 'slot_b_hf_f1', weekCycle: 'B', schoolId: 'school_highfield', studentId: 'stu_samuel_adams', day: 'Friday', startTime: '09:30', endTime: '10:00', duration: 30 },
  { id: 'slot_b_hf_f2', weekCycle: 'B', schoolId: 'school_highfield', studentId: 'stu_ella_wright', day: 'Friday', startTime: '10:00', endTime: '10:30', duration: 30 },
  { id: 'slot_b_hf_f3', weekCycle: 'B', schoolId: 'school_highfield', studentId: 'stu_daniel_hill', day: 'Friday', startTime: '10:50', endTime: '11:20', duration: 30 },
  { id: 'slot_b_hf_f4', weekCycle: 'B', schoolId: 'school_highfield', studentId: 'stu_poppy_ward', day: 'Friday', startTime: '11:20', endTime: '11:50', duration: 30 },
  { id: 'slot_b_hf_f5', weekCycle: 'B', schoolId: 'school_highfield', studentId: 'stu_jack_fletcher', day: 'Friday', startTime: '13:05', endTime: '13:35', duration: 30 },
];

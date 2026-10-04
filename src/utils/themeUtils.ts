import { SchoolColorTheme } from '../types';

export interface ThemeStyles {
  name: string;
  dotColor: string;
  bgTint: string;        // Very soft background tint for day columns & sections
  bgSubtle: string;      // Subtle card background tint
  pillBg: string;        // Pill background
  pillText: string;      // Pill text
  pillBorder: string;    // Pill border
  headerBg: string;      // Column / card header background
  headerBorder: string;  // Header border
  lessonCard: string;    // Lesson entry card styling
  lessonCardAccent: string; // Left accent border
  accentBar: string;     // Accent bar color
  softBadge: string;     // Soft badge styling for tags
  tabActive: string;     // Active tab styling
  cardSection: string;   // Container card section styling
}

export const THEME_STYLES: Record<SchoolColorTheme, ThemeStyles> = {
  sage: {
    name: 'Sage Mint',
    dotColor: 'bg-emerald-500',
    bgTint: 'bg-emerald-50/20',
    bgSubtle: 'bg-emerald-50/40',
    pillBg: 'bg-emerald-50/90',
    pillText: 'text-emerald-900',
    pillBorder: 'border-emerald-200',
    headerBg: 'bg-emerald-50/70',
    headerBorder: 'border-emerald-200/80',
    lessonCard: 'bg-emerald-50/85 border-emerald-200/90 text-emerald-950 hover:border-emerald-400 hover:bg-emerald-50',
    lessonCardAccent: 'border-l-4 border-l-emerald-400',
    accentBar: 'bg-emerald-400',
    softBadge: 'bg-emerald-100/75 text-emerald-800 border border-emerald-200/60',
    tabActive: 'bg-emerald-50 border-emerald-300 text-emerald-950 font-semibold shadow-2xs',
    cardSection: 'bg-emerald-50/30 border border-emerald-200/70',
  },
  sky: {
    name: 'Periwinkle Sky',
    dotColor: 'bg-sky-500',
    bgTint: 'bg-sky-50/20',
    bgSubtle: 'bg-sky-50/40',
    pillBg: 'bg-sky-50/90',
    pillText: 'text-sky-900',
    pillBorder: 'border-sky-200',
    headerBg: 'bg-sky-50/70',
    headerBorder: 'border-sky-200/80',
    lessonCard: 'bg-sky-50/85 border-sky-200/90 text-sky-950 hover:border-sky-400 hover:bg-sky-50',
    lessonCardAccent: 'border-l-4 border-l-sky-400',
    accentBar: 'bg-sky-400',
    softBadge: 'bg-sky-100/75 text-sky-800 border border-sky-200/60',
    tabActive: 'bg-sky-50 border-sky-300 text-sky-950 font-semibold shadow-2xs',
    cardSection: 'bg-sky-50/30 border border-sky-200/70',
  },
  warm: {
    name: 'Warm Sand',
    dotColor: 'bg-amber-500',
    bgTint: 'bg-amber-50/20',
    bgSubtle: 'bg-amber-50/40',
    pillBg: 'bg-amber-50/90',
    pillText: 'text-amber-900',
    pillBorder: 'border-amber-200',
    headerBg: 'bg-amber-50/70',
    headerBorder: 'border-amber-200/80',
    lessonCard: 'bg-amber-50/85 border-amber-200/90 text-amber-950 hover:border-amber-400 hover:bg-amber-50',
    lessonCardAccent: 'border-l-4 border-l-amber-400',
    accentBar: 'bg-amber-400',
    softBadge: 'bg-amber-100/75 text-amber-800 border border-amber-200/60',
    tabActive: 'bg-amber-50 border-amber-300 text-amber-950 font-semibold shadow-2xs',
    cardSection: 'bg-amber-50/30 border border-amber-200/70',
  },
  lavender: {
    name: 'Soft Lavender',
    dotColor: 'bg-violet-500',
    bgTint: 'bg-violet-50/20',
    bgSubtle: 'bg-violet-50/40',
    pillBg: 'bg-violet-50/90',
    pillText: 'text-violet-900',
    pillBorder: 'border-violet-200',
    headerBg: 'bg-violet-50/70',
    headerBorder: 'border-violet-200/80',
    lessonCard: 'bg-violet-50/85 border-violet-200/90 text-violet-950 hover:border-violet-400 hover:bg-violet-50',
    lessonCardAccent: 'border-l-4 border-l-violet-400',
    accentBar: 'bg-violet-400',
    softBadge: 'bg-violet-100/75 text-violet-800 border border-violet-200/60',
    tabActive: 'bg-violet-50 border-violet-300 text-violet-950 font-semibold shadow-2xs',
    cardSection: 'bg-violet-50/30 border border-violet-200/70',
  },
  rose: {
    name: 'Blush Rose',
    dotColor: 'bg-rose-500',
    bgTint: 'bg-rose-50/20',
    bgSubtle: 'bg-rose-50/40',
    pillBg: 'bg-rose-50/90',
    pillText: 'text-rose-900',
    pillBorder: 'border-rose-200',
    headerBg: 'bg-rose-50/70',
    headerBorder: 'border-rose-200/80',
    lessonCard: 'bg-rose-50/85 border-rose-200/90 text-rose-950 hover:border-rose-400 hover:bg-rose-50',
    lessonCardAccent: 'border-l-4 border-l-rose-400',
    accentBar: 'bg-rose-400',
    softBadge: 'bg-rose-100/75 text-rose-800 border border-rose-200/60',
    tabActive: 'bg-rose-50 border-rose-300 text-rose-950 font-semibold shadow-2xs',
    cardSection: 'bg-rose-50/30 border border-rose-200/70',
  },
  teal: {
    name: 'Ocean Teal',
    dotColor: 'bg-teal-500',
    bgTint: 'bg-teal-50/20',
    bgSubtle: 'bg-teal-50/40',
    pillBg: 'bg-teal-50/90',
    pillText: 'text-teal-900',
    pillBorder: 'border-teal-200',
    headerBg: 'bg-teal-50/70',
    headerBorder: 'border-teal-200/80',
    lessonCard: 'bg-teal-50/85 border-teal-200/90 text-teal-950 hover:border-teal-400 hover:bg-teal-50',
    lessonCardAccent: 'border-l-4 border-l-teal-400',
    accentBar: 'bg-teal-400',
    softBadge: 'bg-teal-100/75 text-teal-800 border border-teal-200/60',
    tabActive: 'bg-teal-50 border-teal-300 text-teal-950 font-semibold shadow-2xs',
    cardSection: 'bg-teal-50/30 border border-teal-200/70',
  },
};

export const COLOR_OPTIONS: { id: SchoolColorTheme; label: string; swatch: string }[] = [
  { id: 'sage', label: 'Sage Mint', swatch: 'bg-emerald-300' },
  { id: 'sky', label: 'Periwinkle Sky', swatch: 'bg-sky-300' },
  { id: 'warm', label: 'Warm Sand', swatch: 'bg-amber-300' },
  { id: 'lavender', label: 'Soft Lavender', swatch: 'bg-violet-300' },
  { id: 'rose', label: 'Blush Rose', swatch: 'bg-rose-300' },
  { id: 'teal', label: 'Ocean Teal', swatch: 'bg-teal-300' },
];

export function getSchoolTheme(theme?: SchoolColorTheme, indexFallback: number = 0): ThemeStyles {
  if (theme && THEME_STYLES[theme]) {
    return THEME_STYLES[theme];
  }
  const keys: SchoolColorTheme[] = ['sage', 'sky', 'warm', 'lavender', 'rose', 'teal'];
  const chosenKey = keys[indexFallback % keys.length];
  return THEME_STYLES[chosenKey];
}

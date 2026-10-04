import { DayOfWeek } from '../types';

/**
 * Converts "HH:MM" (e.g. "09:30") to total minutes from midnight (570)
 */
export function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const parts = timeStr.split(':');
  const h = parseInt(parts[0] || '0', 10);
  const m = parseInt(parts[1] || '0', 10);
  return h * 60 + m;
}

/**
 * Converts total minutes from midnight to "HH:MM" format
 */
export function minutesToTime(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

/**
 * Adds minutes to an "HH:MM" string
 */
export function addMinutes(timeStr: string, minutesToAdd: number): string {
  const mins = timeToMinutes(timeStr) + minutesToAdd;
  return minutesToTime(mins);
}

/**
 * Calculates duration in minutes between start and end times
 */
export function getDurationMinutes(startTime: string, endTime: string): number {
  return timeToMinutes(endTime) - timeToMinutes(startTime);
}

/**
 * Checks if two time ranges overlap.
 * Strictly overlapping: max(start1, start2) < min(end1, end2)
 */
export function timesOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  const s1 = timeToMinutes(start1);
  const e1 = timeToMinutes(end1);
  const s2 = timeToMinutes(start2);
  const e2 = timeToMinutes(end2);
  return Math.max(s1, s2) < Math.min(e1, e2);
}

/**
 * Generates an array of time intervals between startTime and endTime
 */
export function generateTimeGrid(
  startTime: string,
  endTime: string,
  stepMinutes: number = 30
): string[] {
  const times: string[] = [];
  let current = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);

  while (current <= end) {
    times.push(minutesToTime(current));
    current += stepMinutes;
  }
  return times;
}

/**
 * Formats time cleanly (e.g. "9:30 am" or "09:30")
 */
export function formatTimeDisplay(timeStr: string): string {
  if (!timeStr) return '';
  const [hStr, mStr] = timeStr.split(':');
  const h = parseInt(hStr, 10);
  const m = mStr || '00';
  const ampm = h >= 12 ? 'pm' : 'am';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${m} ${ampm}`;
}

/**
 * Formats time range concisely: "9:30–10:00"
 */
export function formatTimeRange(start: string, end: string): string {
  return `${start}–${end}`;
}

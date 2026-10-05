/**
 * MusiOrg Timetable - Failed Authentication & Brute-force Lockout Guard
 * Tracks failed login attempts, enforces temporary lockout after 3 consecutive failures,
 * and maintains a countdown timer.
 */

const STORAGE_KEY = 'musiorg_auth_guard';
export const MAX_FAILED_ATTEMPTS = 3;
export const LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 minutes

interface GuardState {
  attempts: number;
  lockedUntil: number | null; // epoch ms
  lastAttemptAt: number;
}

function loadState(): GuardState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { attempts: 0, lockedUntil: null, lastAttemptAt: 0 };
    const parsed = JSON.parse(raw);
    return {
      attempts: typeof parsed.attempts === 'number' ? parsed.attempts : 0,
      lockedUntil: typeof parsed.lockedUntil === 'number' ? parsed.lockedUntil : null,
      lastAttemptAt: typeof parsed.lastAttemptAt === 'number' ? parsed.lastAttemptAt : 0,
    };
  } catch {
    return { attempts: 0, lockedUntil: null, lastAttemptAt: 0 };
  }
}

function saveState(state: GuardState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Non-fatal if localStorage is restricted
  }
}

export interface LockoutStatus {
  isLocked: boolean;
  remainingSeconds: number;
  remainingAttempts: number;
  totalAttempts: number;
  lockoutExpiryTime: string | null;
}

export function getLockoutStatus(): LockoutStatus {
  const state = loadState();
  const now = Date.now();

  if (state.lockedUntil && state.lockedUntil > now) {
    const remainingSeconds = Math.ceil((state.lockedUntil - now) / 1000);
    const dateObj = new Date(state.lockedUntil);
    const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return {
      isLocked: true,
      remainingSeconds,
      remainingAttempts: 0,
      totalAttempts: state.attempts,
      lockoutExpiryTime: timeStr,
    };
  }

  // Lockout expired or not locked
  if (state.lockedUntil && state.lockedUntil <= now) {
    // Reset state after lockout period elapsed
    resetFailedAttempts();
    return {
      isLocked: false,
      remainingSeconds: 0,
      remainingAttempts: MAX_FAILED_ATTEMPTS,
      totalAttempts: 0,
      lockoutExpiryTime: null,
    };
  }

  const remainingAttempts = Math.max(0, MAX_FAILED_ATTEMPTS - state.attempts);
  return {
    isLocked: false,
    remainingSeconds: 0,
    remainingAttempts,
    totalAttempts: state.attempts,
    lockoutExpiryTime: null,
  };
}

export function recordFailedAttempt(): LockoutStatus {
  const state = loadState();
  const now = Date.now();

  const newAttempts = state.attempts + 1;
  let lockedUntil: number | null = null;

  if (newAttempts >= MAX_FAILED_ATTEMPTS) {
    lockedUntil = now + LOCKOUT_DURATION_MS;
  }

  const updated: GuardState = {
    attempts: newAttempts,
    lockedUntil,
    lastAttemptAt: now,
  };

  saveState(updated);
  return getLockoutStatus();
}

export function resetFailedAttempts(): void {
  saveState({ attempts: 0, lockedUntil: null, lastAttemptAt: 0 });
}

export function formatRemainingTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m > 0) {
    return `${m}m ${s < 10 ? '0' : ''}${s}s`;
  }
  return `${s}s`;
}

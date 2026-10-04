import React, { useState, useEffect } from 'react';
import { BreakPeriod, School, DayOfWeek, DAYS_OF_WEEK } from '../../types';
import { X, Coffee, Clock, Trash2, Check, Calendar, AlertCircle } from 'lucide-react';
import { timeToMinutes, minutesToTime } from '../../utils/timeUtils';

interface BreakEditorModalProps {
  breakPeriod: BreakPeriod | null; // null if creating a new break
  school: School;
  initialDay?: DayOfWeek;
  initialStartTime?: string;
  onClose: () => void;
  onSave: (updatedBreak: BreakPeriod, applyAllDays: boolean) => void;
  onDelete?: (breakId: string) => void;
}

export const BreakEditorModal: React.FC<BreakEditorModalProps> = ({
  breakPeriod,
  school,
  initialDay = 'Monday',
  initialStartTime = '10:30',
  onClose,
  onSave,
  onDelete,
}) => {
  const isEditing = Boolean(breakPeriod);

  const [title, setTitle] = useState(breakPeriod?.title || 'Morning Break');
  const [day, setDay] = useState<DayOfWeek>(breakPeriod?.day || initialDay);
  const [startTime, setStartTime] = useState(breakPeriod?.startTime || initialStartTime);
  const [endTime, setEndTime] = useState(
    breakPeriod?.endTime || minutesToTime(timeToMinutes(initialStartTime) + 20)
  );
  const [applyAllDays, setApplyAllDays] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Quick preset titles
  const presets = ['Morning Break', 'Lunch', 'Afternoon Break', 'Staff Briefing', 'Tutor Period'];

  const durationMin = Math.max(0, timeToMinutes(endTime) - timeToMinutes(startTime));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please enter a title for this break or lunch interval.');
      return;
    }

    if (timeToMinutes(startTime) >= timeToMinutes(endTime)) {
      setError('End time must be later than start time.');
      return;
    }

    const breakItem: BreakPeriod = {
      id: breakPeriod?.id || `brk_${school.id}_${Date.now()}`,
      schoolId: school.id,
      title: title.trim(),
      day,
      startTime,
      endTime,
    };

    onSave(breakItem, applyAllDays);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl border border-neutral-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 bg-amber-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-800">
              <Coffee className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-neutral-900">
                {isEditing ? 'Edit Break / Lunch Interval' : 'Add Break / Lunch Interval'}
              </h3>
              <p className="text-xs text-neutral-500">{school.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title & Presets */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Interval Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setError(null);
              }}
              placeholder="e.g. Morning Break or Lunch"
              className="w-full text-xs border border-neutral-200 rounded-lg px-3 py-2 bg-neutral-50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-neutral-400 text-neutral-900"
            />
            {/* Quick Presets */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {presets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setTitle(preset)}
                  className={`px-2 py-0.5 text-[11px] rounded-md border transition-colors ${
                    title === preset
                      ? 'bg-amber-100 border-amber-300 text-amber-900 font-semibold'
                      : 'bg-neutral-100 hover:bg-neutral-200 border-neutral-200 text-neutral-700'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Day of Week */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Day of Week
            </label>
            <select
              value={day}
              onChange={(e) => setDay(e.target.value as DayOfWeek)}
              className="w-full text-xs border border-neutral-200 rounded-lg px-3 py-2 bg-neutral-50 text-neutral-800 focus:bg-white"
            >
              {school.teachingDays.map((d) => (
                <option key={d} value={d}>
                  {d} (Teaching Day)
                </option>
              ))}
              {DAYS_OF_WEEK.filter((d) => !school.teachingDays.includes(d)).map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Start Time
              </label>
              <input
                type="time"
                step="300"
                value={startTime}
                onChange={(e) => {
                  setStartTime(e.target.value);
                  setError(null);
                }}
                className="w-full text-xs border border-neutral-200 rounded-lg px-3 py-2 bg-neutral-50 focus:bg-white text-neutral-900 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                End Time
              </label>
              <input
                type="time"
                step="300"
                value={endTime}
                onChange={(e) => {
                  setEndTime(e.target.value);
                  setError(null);
                }}
                className="w-full text-xs border border-neutral-200 rounded-lg px-3 py-2 bg-neutral-50 focus:bg-white text-neutral-900 font-mono"
              />
            </div>
          </div>

          {/* Duration Indicator */}
          <div className="text-[11px] text-neutral-500 font-mono flex items-center justify-between px-1">
            <span>Duration:</span>
            <span className="font-semibold text-neutral-800">{durationMin} minutes</span>
          </div>

          {/* Apply to all teaching days */}
          <div className="pt-2 border-t border-neutral-100">
            <label className="flex items-start gap-2 cursor-pointer text-xs text-neutral-700">
              <input
                type="checkbox"
                checked={applyAllDays}
                onChange={(e) => setApplyAllDays(e.target.checked)}
                className="mt-0.5 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-500"
              />
              <div>
                <span className="font-medium">Apply to all teaching days at {school.name}</span>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  Automatically sync this interval to: {school.teachingDays.join(', ')}
                </p>
              </div>
            </label>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
            {isEditing && onDelete && breakPeriod ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Remove "${breakPeriod.title}"?`)) {
                    onDelete(breakPeriod.id);
                    onClose();
                  }
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-rose-700 hover:text-rose-900 hover:bg-rose-50 rounded-md transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-200 rounded-md hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-md shadow-xs transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Interval</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

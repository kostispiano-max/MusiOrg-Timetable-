import React, { useState } from 'react';
import { ValidationContext } from '../../utils/constraintChecker';
import { generateTimetable, GenerationResult } from '../../utils/timetableGenerator';
import { TimetableSlot, WeekCycle } from '../../types';
import { Wand2, X, Check, RefreshCw, AlertCircle } from 'lucide-react';

interface OptimizerModalProps {
  context: ValidationContext;
  activeCycle: WeekCycle;
  onClose: () => void;
  onApplyOptimization: (newSlots: TimetableSlot[]) => void;
  onOpenConflicts: (issues: GenerationResult['issues']) => void;
}

export const OptimizerModal: React.FC<OptimizerModalProps> = ({
  context,
  activeCycle,
  onClose,
  onApplyOptimization,
  onOpenConflicts,
}) => {
  const [scope, setScope] = useState<'both' | 'current'>('both');
  const [preserveOverrides, setPreserveOverrides] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [result, setResult] = useState<GenerationResult | null>(null);

  const handleRun = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const genResult = generateTimetable(context, {
        weekCycle: scope === 'current' ? activeCycle : undefined,
        preserveManualOverrides: preserveOverrides,
      });
      setResult(genResult);
      setIsGenerating(false);
    }, 200);
  };

  const handleApply = () => {
    if (result) {
      onApplyOptimization(result.slots);
      if (result.issues.length > 0) {
        onOpenConflicts(result.issues);
      }
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl border border-neutral-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-50/50">
          <div>
            <h3 className="text-base font-semibold text-neutral-900 flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-neutral-800" />
              <span>Optimise School Timetable</span>
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Constraint-based automatic placement for peripatetic teaching
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Generation Target
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setScope('both')}
                className={`p-2.5 rounded-lg border text-left font-medium transition-colors ${
                  scope === 'both'
                    ? 'border-neutral-900 bg-neutral-50 ring-1 ring-neutral-900 text-neutral-900'
                    : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
                }`}
              >
                <div>Coordinated 2-Week Cycle</div>
                <div className="text-[11px] text-neutral-400 font-normal mt-0.5">
                  Synchronize Week A and Week B
                </div>
              </button>

              <button
                type="button"
                onClick={() => setScope('current')}
                className={`p-2.5 rounded-lg border text-left font-medium transition-colors ${
                  scope === 'current'
                    ? 'border-neutral-900 bg-neutral-50 ring-1 ring-neutral-900 text-neutral-900'
                    : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
                }`}
              >
                <div>Week {activeCycle} Only</div>
                <div className="text-[11px] text-neutral-400 font-normal mt-0.5">
                  Only optimize the active week
                </div>
              </button>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-neutral-100 text-xs">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={preserveOverrides}
                onChange={(e) => setPreserveOverrides(e.target.checked)}
                className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
              />
              <span className="text-neutral-700 font-medium">
                Preserve manually pinned / edited slots
              </span>
            </label>
          </div>

          {/* Results Summary */}
          {result && (
            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2 animate-in fade-in duration-150">
              <div className="text-xs font-semibold text-neutral-900 flex items-center justify-between">
                <span>Optimisation Result</span>
                <span className="font-mono text-emerald-700">
                  {result.stats.scheduledCount} lessons scheduled
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div className="p-2 bg-white rounded border border-neutral-200">
                  <div className="text-neutral-500 text-[11px]">Unresolved Issues</div>
                  <div className={`font-semibold ${result.issues.length > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                    {result.issues.length} {result.issues.length === 1 ? 'conflict' : 'conflicts'}
                  </div>
                </div>

                <div className="p-2 bg-white rounded border border-neutral-200">
                  <div className="text-neutral-500 text-[11px]">Two-Week Consistency</div>
                  <div className="font-semibold text-neutral-900">
                    {result.stats.consistentWeeksCount} aligned
                  </div>
                </div>
              </div>

              {result.issues.length > 0 && (
                <div className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded border border-amber-200 flex items-start gap-1.5 mt-2">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                  <span>
                    {result.issues[0].studentName}: {result.issues[0].reason}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-100 bg-neutral-50/50">
          <button
            type="button"
            onClick={handleRun}
            disabled={isGenerating}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors"
          >
            {isGenerating ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Wand2 className="w-3.5 h-3.5" />
            )}
            <span>{result ? 'Re-calculate' : 'Run Optimiser'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-200 rounded-md hover:bg-neutral-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={!result}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-md disabled:bg-neutral-300 disabled:cursor-not-allowed shadow-xs"
            >
              Apply to Timetable
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

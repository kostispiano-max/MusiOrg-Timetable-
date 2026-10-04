import React from 'react';
import { SchedulingIssue, ConflictAlternative, WeekCycle } from '../../types';
import { X, AlertTriangle, AlertCircle, ArrowRight, Check } from 'lucide-react';

interface ConflictModalProps {
  issues: SchedulingIssue[];
  activeCycle: WeekCycle;
  onClose: () => void;
  onApplyAlternative: (issue: SchedulingIssue, alternative: ConflictAlternative) => void;
}

export const ConflictModal: React.FC<ConflictModalProps> = ({
  issues,
  activeCycle,
  onClose,
  onApplyAlternative,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl border border-neutral-200 w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-50/50">
          <div>
            <h3 className="text-base font-semibold text-neutral-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <span>Timetable Conflict & Alternative Suggestions</span>
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Week {activeCycle} · {issues.length} {issues.length === 1 ? 'student requires attention' : 'students require attention'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of issues and alternative options */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {issues.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2">
                <Check className="w-5 h-5" />
              </div>
              <p className="text-sm font-semibold text-neutral-900">All Lessons Scheduled Cleanly</p>
              <p className="text-xs text-neutral-500 mt-1">No unresolvable conflicts or clashes detected in this week cycle.</p>
            </div>
          ) : (
            issues.map((issue) => (
              <div
                key={issue.id}
                className="p-4 rounded-xl border border-neutral-200 bg-white shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
                      <span>⚠️ {issue.studentName}</span>
                      {issue.desiredTime && (
                        <span className="text-xs font-mono text-neutral-500 font-normal">
                          (normally {issue.day} at {issue.desiredTime})
                        </span>
                      )}
                    </h4>
                    <div className="mt-1 text-xs text-neutral-600">
                      <span className="font-medium text-neutral-800">Reason: </span>
                      {issue.reason}
                    </div>
                  </div>
                </div>

                {/* Alternatives List */}
                <div className="pt-2 border-t border-neutral-100">
                  <div className="text-xs font-medium text-neutral-700 mb-2">
                    Possible Alternatives:
                  </div>

                  {issue.alternatives.length === 0 ? (
                    <p className="text-xs text-neutral-400 italic">
                      No open slots on normal school days. Consider opening additional school hours or adjusting breaks.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {issue.alternatives.map((alt, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2.5 rounded-lg border border-neutral-200 hover:border-neutral-300 bg-neutral-50/50 hover:bg-neutral-50 transition-colors"
                        >
                          <div>
                            <div className="text-xs font-semibold text-neutral-900 font-mono">
                              {alt.day} {alt.startTime}–{alt.endTime}
                            </div>
                            {alt.notes && (
                              <div className="text-[11px] text-amber-700 mt-0.5 truncate">
                                {alt.notes}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => onApplyAlternative(issue, alt)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded transition-colors whitespace-nowrap shadow-xs"
                          >
                            <span>Choose</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-neutral-100 bg-neutral-50/50">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-200 rounded-md hover:bg-neutral-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

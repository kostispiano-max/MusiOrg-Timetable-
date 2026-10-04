import React, { useState } from 'react';
import { School, WeekCycle, CycleTerminology } from '../../types';
import { X, Calendar, RotateCcw, Check, Sparkles, AlertCircle, Info } from 'lucide-react';

interface SchoolCyclesModalProps {
  schools: School[];
  onUpdateSchoolCycle: (schoolId: string, cycle: WeekCycle, notes?: string, terminology?: CycleTerminology) => void;
  onSyncAllSchools: (cycle: WeekCycle) => void;
  onClose: () => void;
}

export const SchoolCyclesModal: React.FC<SchoolCyclesModalProps> = ({
  schools,
  onUpdateSchoolCycle,
  onSyncAllSchools,
  onClose,
}) => {
  const [localSchools, setLocalSchools] = useState<School[]>([...schools]);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const handleToggleCycle = (schoolId: string) => {
    setLocalSchools((prev) =>
      prev.map((s) => {
        if (s.id === schoolId) {
          const nextCycle: WeekCycle = s.currentWeekCycle === 'A' ? 'B' : 'A';
          return { ...s, currentWeekCycle: nextCycle };
        }
        return s;
      })
    );
  };

  const handleTerminologyChange = (schoolId: string, terminology: CycleTerminology) => {
    setLocalSchools((prev) =>
      prev.map((s) => {
        if (s.id === schoolId) {
          return { ...s, cycleTerminology: terminology };
        }
        return s;
      })
    );
  };

  const handleNotesChange = (schoolId: string, notes: string) => {
    setLocalSchools((prev) =>
      prev.map((s) => {
        if (s.id === schoolId) {
          return { ...s, cycleNotes: notes };
        }
        return s;
      })
    );
  };

  const handleSaveAll = () => {
    localSchools.forEach((s) => {
      onUpdateSchoolCycle(s.id, s.currentWeekCycle, s.cycleNotes, s.cycleTerminology);
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 400);
  };

  const handleQuickSync = (cycle: WeekCycle) => {
    setLocalSchools((prev) =>
      prev.map((s) => ({
        ...s,
        currentWeekCycle: cycle,
        cycleNotes: `Globally synced to Week ${cycle}`,
      }))
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl border border-neutral-200 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-50/50">
          <div>
            <h3 className="text-base font-semibold text-neutral-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-neutral-800" />
              <span>Independent School Week Cycles (Week A/B or 1/2)</span>
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Each school operates on its own cycle schedule and can be adjusted irregularly through the year
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Information box */}
          <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg text-xs text-neutral-600 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-neutral-900">Why independent cycles matter:</span>
              <p className="mt-0.5 text-neutral-600">
                School term dates, inset days, and bank holidays often cause schools to drift out of sync.
                One school may be on Week A while another is on Week B or Week 2. You can freely change each school&apos;s active cycle below at any point during the term.
              </p>
            </div>
          </div>

          {/* Quick sync options */}
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="font-medium text-neutral-700">Quick Global Overrides:</span>
            <div className="inline-flex gap-2">
              <button
                type="button"
                onClick={() => handleQuickSync('A')}
                className="px-2.5 py-1 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded border border-neutral-200 transition-colors"
              >
                Set All to Week A / 1
              </button>
              <button
                type="button"
                onClick={() => handleQuickSync('B')}
                className="px-2.5 py-1 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded border border-neutral-200 transition-colors"
              >
                Set All to Week B / 2
              </button>
            </div>
          </div>

          {/* Schools List */}
          <div className="space-y-4">
            {localSchools.map((school) => {
              const term = school.cycleTerminology || 'week_ab';
              const labelA = term === 'week_12' ? 'Week 1' : 'Week A';
              const labelB = term === 'week_12' ? 'Week 2' : 'Week B';
              const activeLabel = school.currentWeekCycle === 'A' ? labelA : labelB;

              return (
                <div
                  key={school.id}
                  className="p-4 rounded-xl border border-neutral-200 bg-white shadow-2xs space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 pb-2.5">
                    <div>
                      <h4 className="text-sm font-semibold text-neutral-900">
                        {school.name}
                      </h4>
                      <p className="text-xs text-neutral-500">
                        Teaching days: {school.teachingDays.join(', ')}
                      </p>
                    </div>

                    {/* Cycle Toggle Button */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-neutral-500">Current cycle:</span>
                      <div className="inline-flex items-center p-0.5 rounded-lg bg-neutral-100 border border-neutral-200 text-xs">
                        <button
                          type="button"
                          onClick={() => {
                            setLocalSchools((prev) =>
                              prev.map((s) => s.id === school.id ? { ...s, currentWeekCycle: 'A' } : s)
                            );
                          }}
                          className={`px-3 py-1 font-semibold rounded-md transition-all ${
                            school.currentWeekCycle === 'A'
                              ? 'bg-neutral-900 text-white shadow-xs'
                              : 'text-neutral-600 hover:text-neutral-900'
                          }`}
                        >
                          {labelA}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setLocalSchools((prev) =>
                              prev.map((s) => s.id === school.id ? { ...s, currentWeekCycle: 'B' } : s)
                            );
                          }}
                          className={`px-3 py-1 font-semibold rounded-md transition-all ${
                            school.currentWeekCycle === 'B'
                              ? 'bg-neutral-900 text-white shadow-xs'
                              : 'text-neutral-600 hover:text-neutral-900'
                          }`}
                        >
                          {labelB}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Settings row: Terminology and Notes */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                        School Terminology
                      </label>
                      <select
                        value={school.cycleTerminology || 'week_ab'}
                        onChange={(e) => handleTerminologyChange(school.id, e.target.value as CycleTerminology)}
                        className="w-full text-xs border border-neutral-200 rounded-lg px-2.5 py-1.5 bg-neutral-50 text-neutral-800"
                      >
                        <option value="week_ab">Week A / Week B</option>
                        <option value="week_12">Week 1 / Week 2</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                        Adjustment Reason / Notes (e.g. Inset day, bank holiday)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Swapped cycle after 14 Oct Inset day"
                        value={school.cycleNotes || ''}
                        onChange={(e) => handleNotesChange(school.id, e.target.value)}
                        className="w-full text-xs border border-neutral-200 rounded-lg px-2.5 py-1.5 bg-neutral-50 text-neutral-800"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-100 bg-neutral-50/50">
          <div>
            {savedSuccess && (
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                School week cycles updated!
              </span>
            )}
          </div>
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
              onClick={handleSaveAll}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-md shadow-xs"
            >
              Apply Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { ValidationContext } from '../../utils/constraintChecker';
import { generateTimetable, GenerationResult } from '../../utils/timetableGenerator';
import { Restriction, Student, TimetableSlot, WeekCycle } from '../../types';
import { Sparkles, X, ArrowRight, Check, AlertCircle, Play } from 'lucide-react';

interface WhatIfModalProps {
  context: ValidationContext;
  activeCycle: WeekCycle;
  onClose: () => void;
  onApplyOptimizedSlots: (newSlots: TimetableSlot[]) => void;
}

export const WhatIfModal: React.FC<WhatIfModalProps> = ({
  context,
  activeCycle,
  onClose,
  onApplyOptimizedSlots,
}) => {
  const [selectedScenario, setSelectedScenario] = useState<string>('scenario_y4_swimming');
  const [simulationResult, setSimulationResult] = useState<GenerationResult | null>(null);
  const [affectedStudentsDescription, setAffectedStudentsDescription] = useState<string>('');
  const [hasRun, setHasRun] = useState<boolean>(false);

  const scenarios = [
    {
      id: 'scenario_y4_swimming',
      title: 'Y4 Swimming moved from 9:00 to 10:00',
      description: 'St Marys Y4 swimming rescheduled to 10:00–11:00 on Monday. Only Y4 students (like Sophia Chen) need re-placing.',
      applyMockChange: (ctx: ValidationContext) => {
        // Find Y4.1 swimming restriction and change time to 10:00-11:00
        const updatedRestrictions = ctx.restrictions.map((r) => {
          if (r.id === 'rest_sm_y4_1_swim') {
            return { ...r, startTime: '10:00', endTime: '11:00' };
          }
          return r;
        });
        const y4Students = ctx.students
          .filter((s) => s.schoolId === 'school_st_marys' && s.yearGroupId === 'yg_sm_y4')
          .map((s) => s.id);
        return {
          modifiedContext: { ...ctx, restrictions: updatedRestrictions },
          affectedStudentIds: y4Students,
          desc: 'Y4 students (Sophia Chen, Lucas Davies) re-optimized; other students untouched.',
        };
      },
    },
    {
      id: 'scenario_y7_pe',
      title: 'Y7.1 PE added on Tuesday 9:00–10:00',
      description: 'Oakwood moves Y7.1 PE to 9:00–10:00. Oliver Smith and Emma Wood must be moved away from this slot.',
      applyMockChange: (ctx: ValidationContext) => {
        const updatedRestrictions: Restriction[] = [
          ...ctx.restrictions,
          {
            id: 'rest_sim_y7_1',
            scope: 'subgroup',
            targetId: 'sub_oak_y7_1',
            schoolId: 'school_oakwood',
            type: 'hard',
            weekPattern: 'all',
            dayOfWeek: 'Tuesday',
            startTime: '09:00',
            endTime: '10:00',
            reason: 'PE moved to early morning',
          },
        ];
        const y71Students = ctx.students
          .filter((s) => s.subgroupId === 'sub_oak_y7_1')
          .map((s) => s.id);
        return {
          modifiedContext: { ...ctx, restrictions: updatedRestrictions },
          affectedStudentIds: y71Students,
          desc: 'Y7.1 students (Oliver Smith, Emma Wood) rescheduled; Y7.4 (Thomas Baker) remains in place.',
        };
      },
    },
    {
      id: 'scenario_new_student',
      title: 'Add a new 30-minute student to Monday',
      description: 'New violin pupil "Zack Taylor" starts at St Marys on Monday morning. Fit him in with minimum disruption.',
      applyMockChange: (ctx: ValidationContext) => {
        const newStudent: Student = {
          id: 'stu_new_zack',
          schoolId: 'school_st_marys',
          yearGroupId: 'yg_sm_y3',
          name: 'Zack Taylor',
          instrument: 'Violin',
          lessonDuration: 30,
          normalTeachingDay: 'Monday',
          frequency: 'weekly',
          preferredTime: 'morning',
        };
        return {
          modifiedContext: {
            ...ctx,
            students: [...ctx.students, newStudent],
          },
          affectedStudentIds: ['stu_new_zack'],
          desc: 'New pupil placed into available Monday morning slot with zero impact on other students.',
        };
      },
    },
  ];

  const handleRunSimulation = () => {
    const sc = scenarios.find((s) => s.id === selectedScenario);
    if (!sc) return;

    const { modifiedContext, affectedStudentIds, desc } = sc.applyMockChange(context);
    setAffectedStudentsDescription(desc);

    const result = generateTimetable(modifiedContext, {
      weekCycle: activeCycle,
      reoptimizeOnlyAffected: true,
      affectedStudentIds,
      preserveManualOverrides: true,
    });

    setSimulationResult(result);
    setHasRun(true);
  };

  const handleApply = () => {
    if (simulationResult) {
      onApplyOptimizedSlots(simulationResult.slots);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl border border-neutral-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-50/50">
          <div>
            <h3 className="text-base font-semibold text-neutral-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-neutral-800" />
              <span>&ldquo;What If?&rdquo; Re-optimisation Simulator</span>
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Test schedule adjustments and re-optimise only the affected lessons
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Scenario Selector */}
          <div>
            <label className="block text-xs font-semibold text-neutral-800 mb-2">
              Select or simulate a timetable change:
            </label>
            <div className="space-y-2">
              {scenarios.map((sc) => {
                const isSelected = selectedScenario === sc.id;
                return (
                  <div
                    key={sc.id}
                    onClick={() => {
                      setSelectedScenario(sc.id);
                      setHasRun(false);
                      setSimulationResult(null);
                    }}
                    className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'border-neutral-900 bg-neutral-50 ring-1 ring-neutral-900'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <div className="text-xs font-semibold text-neutral-900">
                      {sc.title}
                    </div>
                    <div className="text-[11px] text-neutral-500 mt-0.5">
                      {sc.description}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={handleRunSimulation}
            className="w-full inline-flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-neutral-900 text-white text-xs font-semibold hover:bg-neutral-800 transition-colors shadow-xs"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Simulate & Re-optimise Affected Lessons</span>
          </button>

          {/* Simulation Output */}
          {hasRun && simulationResult && (
            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-900">
                  Simulation Outcome
                </span>
                <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Minimal Changes: {simulationResult.stats.changedCount} modified
                </span>
              </div>

              <p className="text-xs text-neutral-600">
                {affectedStudentsDescription}
              </p>

              {simulationResult.issues.length > 0 && (
                <div className="p-2.5 rounded bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Unresolved conflict:</span>
                    <div>{simulationResult.issues[0].reason}</div>
                  </div>
                </div>
              )}

              {simulationResult.issues.length === 0 && (
                <div className="p-2.5 rounded bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Success: All affected lessons accommodated cleanly with zero collisions.</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-neutral-100 bg-neutral-50/50">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-200 rounded-md hover:bg-neutral-50"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={!hasRun || !simulationResult}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-md disabled:bg-neutral-300 disabled:cursor-not-allowed shadow-xs"
          >
            Apply to Active Timetable
          </button>
        </div>
      </div>
    </div>
  );
};

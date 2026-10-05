import React from 'react';
import { Calendar, School, Clock, Sparkles, Check, ArrowRight, ShieldCheck, Layers, Coffee } from 'lucide-react';

interface LandingViewProps {
  onOpenSignIn: () => void;
  onOpenSignUp: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onOpenSignIn, onOpenSignUp }) => {
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col justify-between selection:bg-neutral-200">
      {/* Navbar */}
      <header className="border-b border-neutral-200 bg-white/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-neutral-900 inline-block" />
            <span className="font-bold text-base tracking-tight text-neutral-900">
              MusiOrg Timetable
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenSignIn}
              className="px-3.5 py-1.5 text-xs font-semibold text-neutral-700 hover:text-neutral-950 transition-colors cursor-pointer"
            >
              Log In
            </button>
            <button
              onClick={onOpenSignUp}
              className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24 flex-1 flex flex-col items-center justify-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-700 text-xs font-medium mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>Built exclusively for peripatetic music teachers</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-neutral-900 max-w-3xl leading-[1.15]">
          A calm, intelligent timetable across all your schools.
        </h1>

        <p className="mt-6 text-base sm:text-lg text-neutral-600 max-w-2xl leading-relaxed">
          Manage multiple schools with independent Week A/B cycles, day-specific teaching hours, break preservation, and hard/soft pupil constraint checks.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={onOpenSignUp}
            className="w-full sm:w-auto px-6 py-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-sm font-semibold shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Create Teacher Account</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenSignIn}
            className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-neutral-100 text-neutral-800 border border-neutral-300 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
          >
            Sign In to Timetable
          </button>
        </div>

        {/* Feature Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 text-left w-full max-w-4xl">
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-neutral-900">
              Independent Week A/B &amp; 1/2 Cycles
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Schools switch week cycles independently. MusiOrg synchronizes Week A/B and 1/2 rhythms per school without manual spreadsheet recalculations.
            </p>
          </div>

          <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-neutral-900">
              Day-Specific Teaching Hours
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Every day at each school can have independent start and finish hours (e.g., Monday 09:00–15:00, Thursday 13:30–16:30).
            </p>
          </div>

          <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-neutral-900">
              Hard &amp; Soft Conflict Guard
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Automatically respects PE, assemblies, lunch periods, teacher travel times, and student limitation windows.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 py-6 text-center text-xs text-neutral-400">
        MusiOrg Timetable · Designed for Peripatetic Music Specialists
      </footer>
    </div>
  );
};

// frontend/src/components/WorkoutSelection.jsx
import React, { useState, useEffect } from 'react';
import { ChevronLeft, Dumbbell, Play, Sparkles, Layers, Activity, Target, ShieldCheck, Flame } from 'lucide-react';
import MuscleMap, { MUSCLE_REGIONS } from './MuscleMap';

export default function WorkoutSelection({ userId, workoutExercises, setView, onSelectExercise }) {
  const [exercisesData, setExercisesData] = useState(null);
  const [selectedMuscle, setSelectedMuscle] = useState(null);
  const [selectedAnatomicalMuscle, setSelectedAnatomicalMuscle] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/workout/exercises`);
        if (!res.ok) throw new Error('Failed to fetch exercises definition');
        const json = await res.json();
        setExercisesData(json);
      } catch (err) {
        setError(err.message || 'Could not load exercises.');
      } finally {
        setLoading(false);
      }
    };
    fetchExercises();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505] text-[#F7F7F5]">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-2 border-[#B7F52A] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-display font-bold tracking-widest text-[#6F7075] uppercase">LOADING PROTOCOL LIBRARY...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505] text-[#F7F7F5] px-4">
        <div className="bg-[#101012] border border-[#FF4D4F]/30 p-8 rounded-[8px] text-center max-w-md">
          <p className="text-xs font-display font-bold text-[#FF4D4F] mb-6 tracking-wide">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 bg-[#B7F52A] text-[#050505] font-display font-bold rounded-[4px] text-xs uppercase tracking-wider hover:bg-[#c7ff47] transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const cleanMuscleName = (name) => {
    if (name === 'Arms_Forearms') return 'Arms & Forearms';
    return name;
  };

  const formatExerciseName = (name) => {
    return name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  const muscleGroups = Object.keys(exercisesData || {});

  return (
    <div className="min-h-screen bg-[#050505] text-[#F7F7F5] pb-20 px-4 md:px-8 relative select-none">
      <div className="max-w-7xl mx-auto pt-8 space-y-8 relative z-10 animate-fade-in-up">
        
        {/* HEADER BAR */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            {selectedMuscle && (
              <button 
                onClick={() => setSelectedMuscle(null)}
                className="w-9 h-9 rounded-[6px] bg-[#101012] hover:bg-[#151517] border border-white/15 flex items-center justify-center text-white transition-colors"
                title="Back to All Categories"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-[#B7F52A] shadow-[0_0_8px_rgba(183,245,42,0.8)]"></span>
                <span className="text-[10px] font-display font-black text-[#6F7075] tracking-widest uppercase">
                  KINEMATIC PROTOCOLS LAB
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-display font-black tracking-tight text-white uppercase">
                {selectedMuscle ? `${cleanMuscleName(selectedMuscle)} Protocols` : 'Workout Library & Protocols'}
              </h1>
            </div>
          </div>
          
          <button 
            onClick={() => setView('dashboard')}
            className="px-4 py-2.5 bg-[#101012] border border-white/15 hover:border-white/30 text-white font-display font-bold rounded-[6px] text-xs flex items-center gap-2 self-start md:self-auto transition-all uppercase tracking-wider"
          >
            ← Return to Dashboard
          </button>
        </div>

        {/* TACTICAL CATEGORY CHIPS */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => {
              setSelectedMuscle(null);
              setSelectedAnatomicalMuscle(null);
            }}
            className={`px-3.5 py-1.5 rounded-[4px] text-xs font-display font-bold uppercase tracking-wider whitespace-nowrap transition-all border ${
              selectedMuscle === null && selectedAnatomicalMuscle === null
                ? 'bg-[#B7F52A] text-[#050505] border-[#B7F52A] shadow-[0_0_15px_rgba(183,245,42,0.3)]'
                : 'bg-[#101012] text-[#6F7075] border-white/10 hover:text-white hover:border-white/20'
            }`}
          >
            All Protocols ({Object.values(exercisesData || {}).reduce((acc, m) => acc + Object.keys(m).length, 0)})
          </button>
          {muscleGroups.map((muscle) => {
            const count = Object.keys(exercisesData[muscle] || {}).length;
            const isSelected = selectedMuscle === muscle && !selectedAnatomicalMuscle;
            return (
              <button
                key={muscle}
                onClick={() => {
                  setSelectedMuscle(muscle);
                  setSelectedAnatomicalMuscle(null);
                }}
                className={`px-3.5 py-1.5 rounded-[4px] text-xs font-display font-bold uppercase tracking-wider whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-[#B7F52A] text-[#050505] border-[#B7F52A] shadow-[0_0_15px_rgba(183,245,42,0.3)]'
                    : 'bg-[#101012] text-[#6F7075] border-white/10 hover:text-white hover:border-white/20'
                }`}
              >
                {cleanMuscleName(muscle)} ({count})
              </button>
            );
          })}
        </div>

        {/* 1. VISUAL DISCOVERY: INTERACTIVE MUSCLE MAP */}
        <MuscleMap
          selectedMuscle={selectedAnatomicalMuscle}
          onSelectMuscle={(muscleId) => {
            setSelectedAnatomicalMuscle(muscleId);
            if (muscleId && MUSCLE_REGIONS[muscleId]) {
              setSelectedMuscle(MUSCLE_REGIONS[muscleId].category);
            } else {
              setSelectedMuscle(null);
            }
          }}
          exercisesData={exercisesData}
          onSelectExercise={onSelectExercise}
        />

        {/* TODAY'S SCHEDULED SESSION (If not filtering by specific muscle) */}
        {!selectedMuscle && workoutExercises && workoutExercises.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-display font-black text-[#B7F52A] tracking-widest uppercase flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#B7F52A]" />
                Today's Target Routine
              </h2>
              <span className="text-[10px] font-mono text-[#6F7075]">{workoutExercises.length} Movements Scheduled</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {workoutExercises.map((ex, idx) => {
                const exKey = ex[0];
                const cleanName = ex[1] || formatExerciseName(exKey);
                return (
                  <div 
                    key={idx} 
                    className="bg-[#101012] border border-[#B7F52A]/30 p-4 rounded-[8px] flex items-center justify-between hover:border-[#B7F52A] transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-[4px] bg-[#B7F52A]/10 border border-[#B7F52A]/30 text-[#B7F52A] font-display font-black text-xs flex items-center justify-center">
                        {String(idx + 1).padStart(2, '0')}
                      </div>
                      <div>
                        <span className="font-display font-bold text-sm block capitalize text-white group-hover:text-[#B7F52A] transition-colors">{cleanName}</span>
                        <span className="text-[9px] font-mono text-[#6F7075] uppercase block">AI Pose-Tracked</span>
                      </div>
                    </div>
                    <button
                      onClick={() => onSelectExercise(exKey, cleanName)}
                      className="px-3 py-1.5 bg-[#B7F52A] text-[#050505] font-display font-black text-xs uppercase tracking-wider rounded-[4px] flex items-center gap-1.5 hover:bg-[#c7ff47] active:scale-95 transition-all shadow-[0_0_12px_rgba(183,245,42,0.3)]"
                    >
                      <Play className="w-3 h-3 fill-current" /> START
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PROTOCOLS GRID */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-display font-black text-[#6F7075] tracking-widest uppercase flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-[#B7F52A]" />
              {selectedMuscle ? `${cleanMuscleName(selectedMuscle).toUpperCase()} MOVEMENTS` : 'COMPLETE MOVEMENT DIRECTORY'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {(selectedMuscle ? [selectedMuscle] : muscleGroups).flatMap((mGroup) => 
              Object.keys(exercisesData[mGroup] || {}).map((exKey) => {
                const exData = exercisesData[mGroup][exKey];
                const cleanExName = formatExerciseName(exKey);
                return (
                  <div 
                    key={exKey}
                    className="bg-[#101012] border border-white/10 hover:border-[#B7F52A]/60 p-5 rounded-[8px] flex flex-col justify-between min-h-[210px] transition-all group hover:bg-[#151517] relative"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <span className="px-2 py-0.5 bg-white/5 border border-white/10 text-[9px] font-display font-black text-[#6F7075] uppercase tracking-wider rounded-[3px]">
                          {cleanMuscleName(mGroup)}
                        </span>
                        <span className="px-2 py-0.5 bg-[#B7F52A]/10 border border-[#B7F52A]/30 text-[9px] font-display font-black text-[#B7F52A] uppercase tracking-wider rounded-[3px]">
                          Joint: {exData.joint}
                        </span>
                      </div>

                      <h3 className="text-base font-display font-bold text-white group-hover:text-[#B7F52A] transition-colors leading-snug">
                        {cleanExName}
                      </h3>

                      <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/5">
                        <div className="bg-[#0A0A0A] p-2 rounded-[4px] border border-white/5">
                          <span className="text-[9px] font-display font-bold text-[#6F7075] uppercase block">Posture</span>
                          <span className="text-[11px] font-display font-bold text-white capitalize truncate block mt-0.5">{exData.posture.replace(/_/g, ' ')}</span>
                        </div>
                        <div className="bg-[#0A0A0A] p-2 rounded-[4px] border border-white/5">
                          <span className="text-[9px] font-display font-bold text-[#6F7075] uppercase block">Flexion</span>
                          <span className="text-[11px] font-mono font-bold text-[#B7F52A] block mt-0.5">{exData.down}°</span>
                        </div>
                        <div className="bg-[#0A0A0A] p-2 rounded-[4px] border border-white/5">
                          <span className="text-[9px] font-display font-bold text-[#6F7075] uppercase block">Extension</span>
                          <span className="text-[11px] font-mono font-bold text-white block mt-0.5">{exData.up}°</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onSelectExercise(exKey, cleanExName)}
                      className="w-full mt-4 py-2.5 bg-transparent hover:bg-[#B7F52A] border border-[#B7F52A]/40 hover:border-[#B7F52A] text-white hover:text-[#050505] text-xs font-display font-black tracking-wider uppercase rounded-[4px] flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" /> INITIALIZE TRACKER
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

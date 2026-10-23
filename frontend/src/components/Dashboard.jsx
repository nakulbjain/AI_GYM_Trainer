// frontend/src/components/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { 
  Flame, Calendar, Trophy, ChevronRight, Droplet, Dumbbell, 
  Apple, History, Image, Star, Plus, 
  BedDouble, UserCheck, ShieldCheck, HeartPulse, Activity, Zap
} from 'lucide-react';

export default function Dashboard({ userId, userName, setView, onStartWorkout, data, setData, fetchDashboardData }) {
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState('');
  
  // Readiness Checklist Modal State
  const [showReadinessModal, setShowReadinessModal] = useState(false);
  const [sleepInput, setSleepInput] = useState(7.5);
  const [sorenessInput, setSorenessInput] = useState(3);
  const [energyInput, setEnergyInput] = useState(8);
  const [readinessResult, setReadinessResult] = useState(null);
  const [calculatingReadiness, setCalculatingReadiness] = useState(false);

  // Quick Logs Local State
  const [addingWater, setAddingWater] = useState(false);
  const [addingProtein, setAddingProtein] = useState(false);
  const [addingCal, setAddingCal] = useState(false);
  const [showWorkoutsModal, setShowWorkoutsModal] = useState(false);
  
  // Weekly Diet State
  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const currentDayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const [activeDietDay, setActiveDietDay] = useState(daysOfWeek.includes(currentDayName) ? currentDayName : "Monday");

  const loadData = async () => {
    try {
      if (fetchDashboardData) {
        await fetchDashboardData();
      }
    } catch (err) {
      setError(err.message || 'Connection to API failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!data) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [userId, data]);

  const handleQuickLog = async (type, amount) => {
    try {
      const payload = {};
      if (type === 'water') {
        setAddingWater(true);
        payload.water_liters = amount;
      }
      if (type === 'protein') {
        setAddingProtein(true);
        payload.protein_grams = amount;
      }
      if (type === 'calories') {
        setAddingCal(true);
        payload.calories_kcal = amount;
      }

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/intake/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error('Quick log failed');
      const intake = await res.json();
      
      // Update local dashboard state
      setData(prev => ({
        ...prev,
        intake_today: {
          calories: intake.calories_kcal,
          protein: intake.protein_grams,
          water: intake.water_liters
        }
      }));
    } catch (e) {
      alert(e.message);
    } finally {
      setAddingWater(false);
      setAddingProtein(false);
      setAddingCal(false);
    }
  };

  const handleReadinessCheck = async () => {
    setCalculatingReadiness(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/readiness/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sleep_hours: parseFloat(sleepInput),
          soreness_level: parseInt(sorenessInput),
          energy_level: parseInt(energyInput)
        })
      });
      if (!res.ok) throw new Error('Readiness calculation failed');
      const result = await res.json();
      setReadinessResult(result);
    } catch (e) {
      alert(e.message);
    } finally {
      setCalculatingReadiness(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505] text-[#F7F7F5]">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-2 border-[#B7F52A] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-display font-bold tracking-widest text-[#6F7075] uppercase">FETCHING TELEMETRY SUMMARY...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505] text-[#F7F7F5] px-4">
        <div className="bg-[#101012] border border-[#FF4D4F]/30 p-8 rounded-[10px] text-center max-w-md">
          <ShieldCheck className="w-12 h-12 text-[#FF4D4F] mx-auto mb-4" />
          <h2 className="text-xl font-display font-bold text-white mb-2 uppercase">Sync Connection Error</h2>
          <p className="text-xs text-[#6F7075] mb-6 leading-relaxed">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 bg-[#B7F52A] text-[#050505] font-display font-bold rounded-[6px] text-xs uppercase tracking-wider"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const {
    metrics, goals, intake_today, workout_streak,
    workout_completion, today_workout_name, today_exercises,
    workout_details, diet_meals, diet_macros_target,
    completed_today
  } = data;

  const currentDayMeals = diet_meals && diet_meals[activeDietDay] ? diet_meals[activeDietDay] : (diet_meals || {});

  const waterPercent = Math.min(100, Math.round((intake_today.water / (goals.water_target || 3.5)) * 100));
  const proteinPercent = Math.min(100, Math.round((intake_today.protein / (goals.protein_target || 140)) * 100));
  const caloriesPercent = Math.min(100, Math.round((intake_today.calories / (goals.calories_target || 2400)) * 100));

  return (
    <div className="min-h-screen bg-[#050505] text-[#F7F7F5] pb-20 px-4 md:px-8 relative select-none">
      <div className="max-w-7xl mx-auto pt-8 space-y-8 relative z-10 animate-fade-in-up">
        
        {/* ATHLETIC HERO BANNER */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#B7F52A] shadow-[0_0_8px_rgba(183,245,42,0.8)]"></span>
              <span className="text-[10px] font-display font-black text-[#6F7075] tracking-widest uppercase">
                ATHLETIC PERFORMANCE HUB
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-black tracking-tight text-white uppercase">
              READY TO TRAIN, <span className="text-[#B7F52A]">{userName || 'ATHLETE'}</span>?
            </h1>
            <p className="text-[#6F7075] text-xs md:text-sm tracking-wide mt-1 font-medium">
              Real-time computer vision pose analysis active. Optimize range of motion and prevent biomechanical faults.
            </p>
          </div>
          
          {/* Quick Readiness Score Module */}
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <button 
              onClick={() => setShowReadinessModal(true)}
              className="bg-[#101012] hover:bg-[#151517] border border-white/15 hover:border-[#B7F52A]/40 p-4 rounded-[8px] flex items-center gap-3.5 transition-all text-left w-full lg:w-auto group"
            >
              <div className="w-10 h-10 rounded-[6px] bg-[#B7F52A]/10 border border-[#B7F52A]/30 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <HeartPulse className="w-5 h-5 text-[#B7F52A]" />
              </div>
              <div>
                <span className="text-[9px] font-display font-bold text-[#6F7075] uppercase tracking-wider block">Bio-Readiness Score</span>
                <span className="text-base font-display font-black text-white group-hover:text-[#B7F52A] transition-colors">
                  {readinessResult ? `${readinessResult.score}% OPTIMAL` : 'CHECK RECOVERY STATUS →'}
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* 4-COLUMN KINETIC METRIC TILES */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#101012] border border-white/10 p-5 rounded-[8px] hover:border-[#B7F52A]/30 transition-all">
            <span className="text-[10px] font-display font-black text-[#6F7075] tracking-widest uppercase block mb-1">Workout Streak</span>
            <span className="text-3xl font-display font-black text-white">{workout_streak} <span className="text-xs font-display text-[#6F7075]">DAYS</span></span>
            <span className="text-[10px] font-mono text-[#B7F52A] block mt-1">{workout_completion}% Program Consistency</span>
          </div>

          <div className="bg-[#101012] border border-white/10 p-5 rounded-[8px] hover:border-[#B7F52A]/30 transition-all">
            <span className="text-[10px] font-display font-black text-[#6F7075] tracking-widest uppercase block mb-1">Water Hydration</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-display font-black text-white">{intake_today.water}</span>
              <span className="text-xs font-display text-[#6F7075]">/ {goals.water_target || 3.5}L</span>
            </div>
            <div className="w-full bg-white/5 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-[#B7F52A] h-full rounded-full transition-all duration-500" style={{ width: `${waterPercent}%` }}></div>
            </div>
          </div>

          <div className="bg-[#101012] border border-white/10 p-5 rounded-[8px] hover:border-[#B7F52A]/30 transition-all">
            <span className="text-[10px] font-display font-black text-[#6F7075] tracking-widest uppercase block mb-1">Protein Synthesis</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-display font-black text-white">{intake_today.protein}</span>
              <span className="text-xs font-display text-[#6F7075]">/ {goals.protein_target || 140}g</span>
            </div>
            <div className="w-full bg-white/5 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-[#B7F52A] h-full rounded-full transition-all duration-500" style={{ width: `${proteinPercent}%` }}></div>
            </div>
          </div>

          <div className="bg-[#101012] border border-white/10 p-5 rounded-[8px] hover:border-[#B7F52A]/30 transition-all">
            <span className="text-[10px] font-display font-black text-[#6F7075] tracking-widest uppercase block mb-1">Caloric Target</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-display font-black text-white">{intake_today.calories}</span>
              <span className="text-xs font-display text-[#6F7075]">/ {goals.calories_target || 2400}kcal</span>
            </div>
            <div className="w-full bg-white/5 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-[#FFB020] h-full rounded-full transition-all duration-500" style={{ width: `${caloriesPercent}%` }}></div>
            </div>
          </div>
        </div>

        {/* QUICK FUEL LOGGING BAR */}
        <div className="bg-[#101012] border border-white/10 p-4 rounded-[8px] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#B7F52A]" />
            <span className="text-xs font-display font-bold text-white uppercase tracking-wider">Quick Intake Logging:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleQuickLog('water', 0.25)}
              disabled={addingWater}
              className="px-3 py-1.5 bg-[#0A0A0A] hover:bg-white/5 border border-white/10 text-xs font-display font-bold text-white rounded-[4px] transition-all active:scale-95 flex items-center gap-1.5"
            >
              <Droplet className="w-3.5 h-3.5 text-[#B7F52A]" /> +250ml Water
            </button>
            <button
              onClick={() => handleQuickLog('protein', 25)}
              disabled={addingProtein}
              className="px-3 py-1.5 bg-[#0A0A0A] hover:bg-white/5 border border-white/10 text-xs font-display font-bold text-white rounded-[4px] transition-all active:scale-95 flex items-center gap-1.5"
            >
              <Apple className="w-3.5 h-3.5 text-[#B7F52A]" /> +25g Protein
            </button>
            <button
              onClick={() => handleQuickLog('calories', 200)}
              disabled={addingCal}
              className="px-3 py-1.5 bg-[#0A0A0A] hover:bg-white/5 border border-white/10 text-xs font-display font-bold text-white rounded-[4px] transition-all active:scale-95 flex items-center gap-1.5"
            >
              <Flame className="w-3.5 h-3.5 text-[#FFB020]" /> +200 kcal
            </button>
          </div>
        </div>

        {/* MAIN SPLIT: WORKOUT PLAN (LEFT) & DIET PLAN (RIGHT) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT 2 COLUMNS: TODAY'S SCHEDULED SESSION */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#101012] border border-white/10 p-6 md:p-8 rounded-[8px] space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/10">
                <div>
                  <span className="text-[10px] font-display font-black text-[#B7F52A] tracking-widest uppercase block mb-1">TODAY'S SCHEDULED SESSION</span>
                  <h2 className="text-2xl font-display font-black text-white uppercase">{today_workout_name || 'Standard Protocol'}</h2>
                </div>
                <button
                  onClick={() => onStartWorkout(today_exercises)}
                  className="px-6 py-3 bg-[#B7F52A] hover:bg-[#c7ff47] text-[#050505] font-display font-black text-xs uppercase tracking-wider rounded-[4px] flex items-center gap-2 active:scale-95 transition-all shadow-[0_0_15px_rgba(183,245,42,0.3)]"
                >
                  {today_exercises.length > 0 ? "START ACTIVE PROTOCOL" : "SELECT CUSTOM PROTOCOL"} <ChevronRight className="w-4 h-4 stroke-[3]" />
                </button>
              </div>

              {/* Safety warning swaps details */}
              {workout_details.injury_swaps && workout_details.injury_swaps.length > 0 && (
                <div className="bg-[#FF4D4F]/10 border border-[#FF4D4F]/30 rounded-[6px] p-4 flex gap-3 text-xs text-[#FF4D4F] font-medium leading-relaxed">
                  <div className="w-5 h-5 flex-shrink-0 bg-[#FF4D4F]/20 rounded-[4px] flex items-center justify-center font-bold">!</div>
                  <div>
                    <span className="font-display font-black uppercase tracking-wider block mb-1">Biomechanical Safety Mode Active</span>
                    {workout_details.injury_swaps.map((swap, idx) => (
                      <p key={idx} className="text-[#F7F7F5]/90 text-[11px]">• {swap}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Exercise Checklist */}
              {today_exercises.length > 0 ? (
                <div className="space-y-3">
                  {today_exercises.map((ex, idx) => (
                    <div key={idx} className="flex items-center gap-4 bg-[#0A0A0A] border border-white/5 rounded-[6px] p-4 hover:border-[#B7F52A]/40 transition-all">
                      <div className="w-8 h-8 bg-[#B7F52A]/10 border border-[#B7F52A]/30 text-[#B7F52A] font-display font-black rounded-[4px] flex items-center justify-center text-xs">
                        {String(idx + 1).padStart(2, '0')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-display font-bold block capitalize text-sm text-white truncate">
                          {ex[0] === 'treadmill' ? 'Treadmill Recovery & Step Session' : (ex[1] || ex[0].replace(/_/g, ' '))}
                        </span>
                        <span className="text-[11px] font-mono text-[#6F7075] block mt-0.5">
                          {ex[0] === 'treadmill' ? ex[1] : `${workout_details.sets} Sets × ${workout_details.reps} Reps | Real-time Landmark Auditing`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-[#0A0A0A] rounded-[6px] border border-white/5">
                  <span className="text-2xl block mb-2">🧘</span>
                  <span className="text-xs font-display font-bold text-[#6F7075] uppercase tracking-wider block">Scheduled Recovery Protocol</span>
                  <span className="text-[11px] text-[#6F7075] block mt-1">Focus on light joint decompression, sleep quality, and tissue hydration.</span>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT 1 COLUMN: NUTRITION STRATEGY */}
          <div className="bg-[#101012] border border-white/10 p-6 rounded-[8px] flex flex-col gap-5">
            <div>
              <span className="text-[10px] font-display font-black text-[#B7F52A] tracking-widest uppercase block mb-1">NUTRITION PROTOCOL</span>
              <h2 className="text-xl font-display font-bold text-white uppercase">MACRONUTRIENT SPLIT</h2>
              <span className="text-[11px] font-mono text-[#6F7075] mt-1 block">Target: {diet_macros_target.carbs}g Carbs | {diet_macros_target.fat}g Fat</span>
            </div>

            {/* Weekly Days Navigation Tabs */}
            <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-none border-b border-white/10">
              {daysOfWeek.map(day => {
                const isSelected = activeDietDay === day;
                return (
                  <button
                    key={day}
                    onClick={() => setActiveDietDay(day)}
                    className={`px-2.5 py-1.5 text-xs font-display font-bold uppercase rounded-[4px] transition-all border whitespace-nowrap ${
                      isSelected 
                        ? 'bg-[#B7F52A] text-[#050505] border-[#B7F52A]' 
                        : 'bg-[#0A0A0A] text-[#6F7075] border-white/5 hover:text-white'
                    }`}
                  >
                    {day.substring(0, 3)}
                  </button>
                );
              })}
            </div>

            <div className="space-y-4 divide-y divide-white/5">
              {activeDietDay === "Sunday" && (
                <div className="bg-[#FFB020]/10 border border-[#FFB020]/30 rounded-[4px] p-3 text-xs text-[#FFB020] font-medium leading-relaxed">
                  <span className="font-display font-black uppercase block mb-0.5">⚠️ Controlled Recovery Fuel</span>
                  Sundays are set up as low-stress recovery days. Enjoy localized favorite meals in portion-controlled macro sizes.
                </div>
              )}
              
              {Object.keys(currentDayMeals).map((mealKey) => (
                <div key={mealKey} className="pt-3 first:pt-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B7F52A]"></span>
                    <h4 className="font-display font-bold text-xs text-white uppercase">{mealKey}</h4>
                  </div>
                  <ul className="space-y-1.5 pl-3.5 text-xs text-[#6F7075]">
                    {currentDayMeals[mealKey].map((food, idx) => (
                      <li key={idx} className="flex items-start gap-2 leading-relaxed">
                        <span className="text-[#B7F52A] font-mono mt-0.5">•</span>
                        <span className="text-[#F7F7F5]">{food}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* --- EXERCISE READINESS MODAL --- */}
      {showReadinessModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#101012] p-6 rounded-[10px] border border-white/15 animate-fade-in-up relative">
            <h3 className="text-xl font-display font-black text-white uppercase mb-1">BIOMETRIC READINESS AUDIT</h3>
            <p className="text-xs text-[#6F7075] mb-5 leading-relaxed">
              Answer these questions to analyze systemic fatigue and determine safe training intensities.
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-display font-bold text-white block mb-1">1. Sleep Duration (Last Night)</label>
                <input 
                  type="number" 
                  step="0.5"
                  value={sleepInput}
                  onChange={(e) => setSleepInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0A0A0A] outline-none rounded-[6px] border border-white/10 focus:border-[#B7F52A] text-white font-mono text-sm transition-all"
                />
              </div>

              <div>
                <div className="flex justify-between items-baseline mb-1">
                  <label className="text-xs font-display font-bold text-white">2. Muscle Soreness Level</label>
                  <span className="text-xs font-mono font-bold text-[#FFB020]">{sorenessInput} / 10</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="10" 
                  value={sorenessInput}
                  onChange={(e) => setSorenessInput(e.target.value)}
                  className="w-full h-1.5 bg-[#0A0A0A] rounded-lg appearance-none cursor-pointer accent-[#B7F52A]"
                />
              </div>

              <div>
                <div className="flex justify-between items-baseline mb-1">
                  <label className="text-xs font-display font-bold text-white">3. Energy / Focus Level</label>
                  <span className="text-xs font-mono font-bold text-[#B7F52A]">{energyInput} / 10</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="10" 
                  value={energyInput}
                  onChange={(e) => setEnergyInput(e.target.value)}
                  className="w-full h-1.5 bg-[#0A0A0A] rounded-lg appearance-none cursor-pointer accent-[#B7F52A]"
                />
              </div>

              {readinessResult && (
                <div className="bg-[#B7F52A]/10 border border-[#B7F52A]/30 p-4 rounded-[6px] space-y-2 mt-4">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs font-display font-black text-[#6F7075] uppercase">Readiness Score</span>
                    <span className="text-xl font-display font-black text-[#B7F52A]">{readinessResult.score}%</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs font-display font-black text-[#6F7075] uppercase">Action</span>
                    <span className="text-xs font-display font-bold text-white uppercase">{readinessResult.action}</span>
                  </div>
                  <p className="text-xs text-[#F7F7F5] mt-1 leading-relaxed">{readinessResult.advice}</p>
                </div>
              )}

              <div className="flex gap-3 pt-3">
                <button 
                  onClick={() => {
                    setShowReadinessModal(false);
                    setReadinessResult(null);
                  }}
                  className="w-1/3 py-2.5 bg-transparent border border-white/15 hover:bg-white/5 font-display font-bold rounded-[6px] text-xs text-white uppercase"
                >
                  Close
                </button>
                <button 
                  onClick={handleReadinessCheck}
                  disabled={calculatingReadiness}
                  className="w-2/3 py-2.5 bg-[#B7F52A] hover:bg-[#c7ff47] text-[#050505] font-display font-black text-xs uppercase tracking-wider rounded-[6px]"
                >
                  {calculatingReadiness ? 'ANALYZING...' : 'COMPUTE BIO-SCORE'}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* --- WORKOUT LOGS MODAL --- */}
      {showWorkoutsModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#101012] p-6 rounded-[10px] border border-white/15 animate-fade-in-up relative">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-display font-black text-white uppercase">Today's Certified Sessions</h3>
                <p className="text-xs text-[#6F7075] mt-0.5">Biometric logs verified by real-time computer vision</p>
              </div>
              <Trophy className="w-5 h-5 text-[#B7F52A]" />
            </div>

            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
              {completed_today.map((w, idx) => (
                <div key={idx} className="flex justify-between items-center bg-[#0A0A0A] p-3 rounded-[6px] border border-white/5">
                  <div>
                    <span className="text-xs font-display font-bold text-white capitalize block">{w.exercise.replace(/_/g, ' ')}</span>
                    <span className="text-[10px] font-mono text-[#6F7075] block mt-0.5">{w.sets} sets × {w.reps} reps • {w.duration ? Number(w.duration).toFixed(1) : '0.0'} min</span>
                  </div>
                  <span className="text-[10px] font-display font-bold text-[#B7F52A] bg-[#B7F52A]/10 px-2 py-0.5 rounded-[4px] border border-[#B7F52A]/20">
                    {Math.round(w.accuracy)}% Form
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-4 flex justify-end">
              <button 
                onClick={() => setShowWorkoutsModal(false)}
                className="w-full py-2.5 bg-transparent border border-white/15 hover:bg-white/5 font-display font-bold rounded-[6px] text-xs text-white uppercase"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

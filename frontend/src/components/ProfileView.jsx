import React, { useState, useEffect } from 'react';
import { User, Activity, Flame, ShieldAlert, Award, Calendar, RotateCcw, Droplet, Dumbbell, ShieldCheck, Camera } from 'lucide-react';

export default function ProfileView({ userId, userName, handleLogout }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(() => localStorage.getItem('gym_user_avatar') || '');

  // Readiness Checklist Modal State
  const [showReadinessModal, setShowReadinessModal] = useState(false);
  const [sleepInput, setSleepInput] = useState(7.5);
  const [sorenessInput, setSorenessInput] = useState(3);
  const [energyInput, setEnergyInput] = useState(8);
  const [readinessResult, setReadinessResult] = useState(null);
  const [calculatingReadiness, setCalculatingReadiness] = useState(false);

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        localStorage.setItem('gym_user_avatar', base64String);
        setAvatarUrl(base64String);
        window.dispatchEvent(new Event('avatarUpdated'));
      };
      reader.readAsDataURL(file);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/profile/${userId}`);
      if (!res.ok) throw new Error('Could not load user profile details');
      const data = await res.json();
      setProfile(data);
    } catch (e) {
      setError(e.message || 'Failed to fetch profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const handleReadinessCheck = async () => {
    setCalculatingReadiness(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/readiness/` + userId, {
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505] text-[#F7F7F5]">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-2 border-[#B7F52A] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-mono tracking-widest text-[#6F7075] uppercase">INITIALIZING ATHLETE RECORD...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505] text-[#F7F7F5] px-4">
        <div className="bg-[#101012] border border-white/10 p-8 rounded-xl text-center max-w-md">
          <ShieldAlert className="w-12 h-12 text-[#FF4D4F] mx-auto mb-4" />
          <h2 className="text-xl font-bold uppercase font-serif mb-2">FAILED TO LOAD PROFILE</h2>
          <p className="text-xs text-[#6F7075] mb-6 leading-relaxed font-sans">{error}</p>
          <button 
            onClick={fetchProfile}
            className="px-6 py-2.5 bg-[#B7F52A] hover:bg-[#a6df24] text-[#050505] font-bold rounded text-xs uppercase tracking-wider"
          >
            Retry Sync
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-[#F7F7F5] pb-16 px-4 md:px-8 relative overflow-hidden select-none font-sans">
      <div className="max-w-5xl mx-auto pt-8 space-y-6 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#B7F52A]"></span>
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#6F7075]">ATHLETE DOSSIER & BIOMETRICS</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold uppercase font-serif tracking-tight">Athlete Profile</h1>
          </div>
          
          <button 
            onClick={() => setShowReadinessModal(true)}
            className="px-4 py-2 bg-[#B7F52A] hover:bg-[#a6df24] text-[#050505] font-bold text-xs uppercase tracking-wider rounded transition-colors flex items-center gap-2"
          >
            <Activity className="w-4 h-4" />
            Check Kinetic Readiness
          </button>
        </div>

        {/* Profile Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Main User Card */}
          <div className="md:col-span-1 bg-[#101012] border border-white/10 rounded-xl p-6 flex flex-col items-center justify-between text-center space-y-6">
            <div className="space-y-4 w-full">
              <div className="relative w-24 h-24 mx-auto group">
                <div className="w-24 h-24 rounded-lg bg-[#0A0A0A] border-2 border-[#B7F52A]/40 p-1 flex items-center justify-center font-bold text-2xl uppercase overflow-hidden relative">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover rounded" />
                  ) : (
                    <div className="w-full h-full bg-[#101012] rounded flex items-center justify-center text-[#B7F52A] font-black">
                      {userName.substring(0, 2)}
                    </div>
                  )}
                </div>
                
                {/* Camera upload overlay badge */}
                <label 
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded bg-[#B7F52A] border border-[#050505] flex items-center justify-center text-[#050505] cursor-pointer shadow hover:scale-105 active:scale-95 transition-all"
                  title="Upload Profile Photo"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleAvatarUpload} 
                    className="hidden" 
                  />
                </label>
              </div>

              <div>
                <h2 className="text-xl font-bold uppercase font-serif text-[#F7F7F5]">{userName}</h2>
                <label className="text-[10px] font-mono uppercase text-[#6F7075] hover:text-[#B7F52A] cursor-pointer block mt-1">
                  [ REPLACE AVATAR ]
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleAvatarUpload} 
                    className="hidden" 
                  />
                </label>
                <span className="text-[10px] font-mono text-[#B7F52A] tracking-wider uppercase bg-[#B7F52A]/10 border border-[#B7F52A]/25 px-2.5 py-1 rounded mt-2.5 inline-block">
                  FOCUS: {profile.goal}
                </span>
              </div>
            </div>

            <div className="w-full border-t border-white/10 pt-5 space-y-3 text-left text-xs">
              <div className="flex justify-between font-mono">
                <span className="text-[#6F7075] uppercase">AGE RECORD:</span>
                <span className="font-bold text-[#F7F7F5]">{profile.age} YRS</span>
              </div>
              <div className="flex justify-between font-mono">
                <span className="text-[#6F7075] uppercase">SEX / GENDER:</span>
                <span className="font-bold text-[#F7F7F5]">{profile.gender}</span>
              </div>
              <div className="flex justify-between font-mono">
                <span className="text-[#6F7075] uppercase">STATURE:</span>
                <span className="font-bold text-[#F7F7F5]">{profile.height} CM</span>
              </div>
              <div className="flex justify-between font-mono">
                <span className="text-[#6F7075] uppercase">BODY MASS:</span>
                <span className="font-bold text-[#F7F7F5]">{profile.weight} KG</span>
              </div>
              <div className="flex justify-between font-mono">
                <span className="text-[#6F7075] uppercase">DIET PROTOCOL:</span>
                <span className="font-bold text-[#B7F52A]">{profile.diet_pref}</span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full py-2.5 bg-[#FF4D4F]/10 hover:bg-[#FF4D4F]/20 border border-[#FF4D4F]/30 transition-all font-bold text-xs text-[#FF4D4F] uppercase tracking-wider rounded flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Athlete Session
            </button>
          </div>

          {/* AI Metrics Outputs */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-[#101012] border border-white/10 rounded-xl p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-sm font-bold uppercase font-serif flex items-center gap-2 text-[#F7F7F5]">
                  <Award className="w-4 h-4 text-[#B7F52A]" />
                  Kinematic & Morphological Diagnostics
                </h3>
                <span className="text-[10px] font-mono text-[#6F7075] uppercase">AI ENGINE VERIFIED</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#0A0A0A] border border-white/10 rounded-lg p-4 flex flex-col justify-center items-center text-center">
                  <span className="text-3xl font-black text-[#B7F52A] font-mono">{profile.bmi}</span>
                  <span className="text-[10px] font-mono text-[#6F7075] mt-1 uppercase tracking-wider">BMI Index</span>
                </div>
                <div className="bg-[#0A0A0A] border border-white/10 rounded-lg p-4 flex flex-col justify-center items-center text-center">
                  <span className="text-3xl font-black text-[#FFB020] font-mono">{profile.body_fat_est}%</span>
                  <span className="text-[10px] font-mono text-[#6F7075] mt-1 uppercase tracking-wider">Est. Body Fat</span>
                </div>
                <div className="bg-[#0A0A0A] border border-white/10 rounded-lg p-4 flex flex-col justify-center items-center text-center">
                  <span className="text-3xl font-black text-[#F7F7F5] font-mono">{profile.sleep_hours}h</span>
                  <span className="text-[10px] font-mono text-[#6F7075] mt-1 uppercase tracking-wider">Target Sleep</span>
                </div>
                <div className="bg-[#0A0A0A] border border-white/10 rounded-lg p-4 flex flex-col justify-center items-center text-center">
                  <span className="text-3xl font-black text-[#B7F52A] font-mono">{profile.target_weight}kg</span>
                  <span className="text-[10px] font-mono text-[#6F7075] mt-1 uppercase tracking-wider">Goal Mass</span>
                </div>
              </div>

              <div className="flex gap-4 items-center bg-[#0A0A0A] border border-white/10 p-4 rounded-lg">
                <Calendar className="w-6 h-6 text-[#B7F52A] flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-xs uppercase font-serif text-[#F7F7F5]">Projected Trajectory</h4>
                  <p className="text-xs text-[#6F7075] mt-1 leading-relaxed font-sans">
                    Based on baseline physiological metrics and goal vector, target of <span className="text-[#B7F52A] font-mono font-bold">{profile.target_weight}kg</span> is estimated in approximately <span className="text-[#B7F52A] font-mono font-bold">{profile.goal_time_weeks} weeks</span>.
                  </p>
                </div>
              </div>
            </div>

            {/* Target Nutrition Limits */}
            <div className="bg-[#101012] border border-white/10 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-sm font-bold uppercase font-serif flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#B7F52A]" />
                  Daily Nutrition Baselines
                </h3>
                <span className="text-[10px] font-mono text-[#6F7075] uppercase">METABOLIC TARGETS</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-4 bg-[#0A0A0A] border border-white/10 rounded-lg p-4">
                  <div className="w-10 h-10 rounded bg-[#B7F52A]/10 border border-[#B7F52A]/20 flex items-center justify-center text-[#B7F52A]">
                    <Droplet className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-[#6F7075] block uppercase tracking-wider">Daily Hydration</span>
                    <span className="text-base font-black font-mono text-[#F7F7F5]">{profile.target_water} Liters</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-[#0A0A0A] border border-white/10 rounded-lg p-4">
                  <div className="w-10 h-10 rounded bg-[#FFB020]/10 border border-[#FFB020]/20 flex items-center justify-center text-[#FFB020]">
                    <Dumbbell className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-[#6F7075] block uppercase tracking-wider">Daily Protein</span>
                    <span className="text-base font-black font-mono text-[#F7F7F5]">{profile.target_protein} Grams</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* --- EXERCISE READINESS MODAL --- */}
      {showReadinessModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#101012] border border-white/15 p-6 rounded-xl relative shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <h3 className="text-base font-bold uppercase font-serif text-[#F7F7F5]">Kinetic Readiness Audit</h3>
              <span className="text-[10px] font-mono text-[#B7F52A] uppercase">NEURAL RECOVERY</span>
            </div>
            <p className="text-xs text-[#6F7075] mb-5 leading-relaxed font-sans">
              Provide current recovery parameters to determine optimal CNS readiness and training intensity ceiling.
            </p>

            <div className="space-y-4">
              {/* Question 1 */}
              <div>
                <label className="text-[11px] font-mono text-[#6F7075] uppercase block mb-1.5">1. Nocturnal Rest (Hours)</label>
                <input 
                  type="number" 
                  step="0.5"
                  value={sleepInput}
                  onChange={(e) => setSleepInput(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0A0A0A] outline-none rounded border border-white/15 focus:border-[#B7F52A] text-[#F7F7F5] text-sm font-mono transition-all"
                />
              </div>

              {/* Question 2 */}
              <div>
                <div className="flex justify-between items-baseline mb-1">
                  <label className="text-[11px] font-mono text-[#6F7075] uppercase">2. Delayed-Onset Muscle Soreness</label>
                  <span className="text-xs font-mono font-bold text-[#FFB020]">{sorenessInput} / 10</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="10" 
                  value={sorenessInput}
                  onChange={(e) => setSorenessInput(e.target.value)}
                  className="w-full h-1.5 bg-[#0A0A0A] rounded appearance-none cursor-pointer accent-[#B7F52A]"
                />
                <div className="flex justify-between text-[9px] font-mono text-[#6F7075] mt-1 uppercase">
                  <span>Zero Soreness</span>
                  <span>Acute Fatigue</span>
                </div>
              </div>

              {/* Question 3 */}
              <div>
                <div className="flex justify-between items-baseline mb-1">
                  <label className="text-[11px] font-mono text-[#6F7075] uppercase">3. Neural Drive & Energy Level</label>
                  <span className="text-xs font-mono font-bold text-[#B7F52A]">{energyInput} / 10</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="10" 
                  value={energyInput}
                  onChange={(e) => setEnergyInput(e.target.value)}
                  className="w-full h-1.5 bg-[#0A0A0A] rounded appearance-none cursor-pointer accent-[#B7F52A]"
                />
                <div className="flex justify-between text-[9px] font-mono text-[#6F7075] mt-1 uppercase">
                  <span>Lethargic</span>
                  <span>High Readiness</span>
                </div>
              </div>

              {/* Readiness Output Summary */}
              {readinessResult && (
                <div className="bg-[#0A0A0A] border border-[#B7F52A]/30 p-4 rounded space-y-2 mt-4 font-mono">
                  <div className="flex justify-between items-baseline">
                    <span className="text-[10px] text-[#6F7075] uppercase">COMPUTED SCORE</span>
                    <span className="text-xl font-black text-[#B7F52A]">{readinessResult.score}%</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-[10px] text-[#6F7075] uppercase">ACTION VECTOR</span>
                    <span className="text-xs font-bold text-[#FFB020]">{readinessResult.action}</span>
                  </div>
                  <p className="text-xs text-[#F7F7F5] mt-2 leading-relaxed font-sans">{readinessResult.advice}</p>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-3 pt-3">
                <button 
                  onClick={() => {
                    setShowReadinessModal(false);
                    setReadinessResult(null);
                  }}
                  className="w-1/3 py-2.5 bg-[#0A0A0A] hover:bg-white/5 border border-white/10 font-bold rounded text-xs uppercase tracking-wider text-[#F7F7F5]"
                >
                  Close
                </button>
                <button 
                  onClick={handleReadinessCheck}
                  disabled={calculatingReadiness}
                  className="w-2/3 py-2.5 bg-[#B7F52A] hover:bg-[#a6df24] text-[#050505] font-bold rounded text-xs uppercase tracking-wider flex items-center justify-center transition-all"
                >
                  {calculatingReadiness ? 'Analyzing...' : 'Calculate Score'}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}

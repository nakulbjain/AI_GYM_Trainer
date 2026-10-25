// frontend/src/components/Onboarding.jsx
import React, { useState } from 'react';
import { ChevronRight, Award, User, Target, Calendar, Heart, Eye, EyeOff, ShieldCheck, Zap } from 'lucide-react';

export default function Onboarding({ onFinish }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [goal, setGoal] = useState('Muscle Gain');
  const experience = 'Intermediate';
  const [workoutDays, setWorkoutDays] = useState(4);
  const selectedEquipment = ['Gym'];
  const [selectedInjuries, setSelectedInjuries] = useState(['None']);
  const [dietPref, setDietPref] = useState('Veg');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const injuryOptions = ['Shoulder', 'Knee', 'Back', 'None'];

  const toggleInjury = (item) => {
    if (item === 'None') {
      setSelectedInjuries(['None']);
      return;
    }
    let updated = [...selectedInjuries].filter(x => x !== 'None');
    if (updated.includes(item)) {
      updated = updated.filter(x => x !== item);
      if (updated.length === 0) updated = ['None'];
    } else {
      updated.push(item);
    }
    setSelectedInjuries(updated);
  };

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!loginUsername.trim()) return setError('Please enter Email or Phone number');
    if (!loginPassword) return setError('Please enter your password');

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: loginUsername.trim(),
          password: loginPassword
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Login failed. Please check credentials.');
      }

      const user = await res.json();
      
      localStorage.setItem('gym_user_id', user.id);
      localStorage.setItem('gym_user_name', user.name);
      localStorage.setItem('gym_user_goal', user.goal || 'Muscle Gain');

      onFinish(user.id, user.name);
    } catch (e) {
      setError(e.message || 'Login connection failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = async () => {
    if (!name.trim()) return setError('Please enter your name');
    if (!email.trim() || !email.includes('@')) return setError('Please enter a valid email');
    if (!phone.trim() || !/^\d{10}$/.test(phone.trim())) return setError('Phone number must be exactly 10 digits');
    if (!password) return setError('Please enter a password');
    if (!age || isNaN(age)) return setError('Please enter a valid age');
    if (!height || isNaN(height)) return setError('Please enter a valid height');
    if (!weight || isNaN(weight)) return setError('Please enter a valid weight');

    setLoading(true);
    setError('');

    try {
      // 1. Register User
      const regRes = await fetch(`${import.meta.env.VITE_API_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          password: password
        })
      });

      if (!regRes.ok) {
        const errData = await regRes.json();
        throw new Error(errData.detail || 'Registration failed');
      }
      const user = await regRes.json();

      // 2. Submit Profile Setup
      const profilePayload = {
        age: parseInt(age),
        gender,
        height: parseFloat(height),
        weight: parseFloat(weight),
        goal,
        experience,
        workout_days: parseInt(workoutDays),
        equipment: selectedEquipment,
        injury: selectedInjuries,
        diet_pref: dietPref
      };

      const profRes = await fetch(`${import.meta.env.VITE_API_URL}/api/profile?user_id=${user.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profilePayload)
      });

      if (!profRes.ok) throw new Error('Profile configuration failed');
      await profRes.json();

      // Save to localStorage
      localStorage.setItem('gym_user_id', user.id);
      localStorage.setItem('gym_user_name', user.name);
      localStorage.setItem('gym_user_goal', goal);

      onFinish(user.id, user.name);
    } catch (e) {
      setError(e.message || 'Server connection failed. Make sure the backend is running!');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 2) {
      if (!name.trim()) return setError('Name is required');
      if (!email.trim() || !email.includes('@')) return setError('Please enter a valid email');
      if (!phone.trim() || !/^\d{10}$/.test(phone.trim())) return setError('Phone number must be exactly 10 digits');
      if (!password || password.length < 4) return setError('Password must be at least 4 characters');
      if (!age || age < 10 || age > 100) return setError('Please enter a valid age (10-100)');
      if (!height || height < 100 || height > 250) return setError('Please enter a valid height (100-250 cm)');
      if (!weight || weight < 30 || weight > 250) return setError('Please enter a valid weight (30-250 kg)');
    }
    setError('');
    setStep(step + 1);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-8 bg-[#050505] text-[#F7F7F5] relative overflow-hidden select-none font-sans">
      {/* Background Subtle Tactical Grid */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03]" 
        style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}
      />
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#B7F52A]/5 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[#B7F52A]/5 blur-[140px] pointer-events-none rounded-full" />

      {/* Main Container Card */}
      <div className="w-full max-w-lg bg-[#101012] border border-white/10 rounded-xl p-8 relative z-10 shadow-2xl">
        
        {/* Progress Header */}
        {step > 1 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono tracking-widest text-[#B7F52A] uppercase">
                PHASE 0{step - 1} / 04
              </span>
              <span className="text-[11px] text-[#6F7075] uppercase font-mono">
                {step === 2 ? 'BIOMETRICS' : step === 3 ? 'TRAINING PROTOCOL' : step === 4 ? 'CADENCE' : 'HEALTH CLEARANCE'}
              </span>
            </div>
            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#B7F52A] transition-all duration-300"
                style={{ width: `${((step - 1) / 4) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* --- SCREEN 1: WELCOME --- */}
        {step === 1 && !isLoggingIn && (
          <div className="text-center flex flex-col items-center py-4">
            <div className="w-16 h-16 bg-[#B7F52A]/10 border border-[#B7F52A]/30 rounded-lg flex items-center justify-center mb-6 text-[#B7F52A]">
              <Zap className="w-8 h-8" />
            </div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-[#6F7075] uppercase tracking-wider mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B7F52A]"></span>
              COMPUTER VISION MOTOR RE-EDUCATION
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-2 uppercase font-serif text-[#F7F7F5]">
              AI GYM TRAINER
            </h1>
            <p className="text-[#6F7075] text-sm tracking-wide max-w-sm mb-8 leading-relaxed">
              Real-time kinematic biomechanical telemetry and computer-vision posture analytics.
            </p>
            {error && (
              <p className="w-full mb-4 text-[#FF4D4F] text-xs font-mono bg-[#FF4D4F]/10 p-3 rounded border border-[#FF4D4F]/25 text-left">
                {error}
              </p>
            )}
            <div className="w-full space-y-3">
              <button
                onClick={() => {
                  setIsLoggingIn(true);
                  setError('');
                }}
                className="w-full py-3.5 bg-[#B7F52A] hover:bg-[#a6df24] text-[#050505] font-bold text-xs uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-2"
              >
                Log In with Credentials
              </button>
              <button
                onClick={() => {
                  setStep(2);
                  setError('');
                }}
                className="w-full py-3.5 bg-[#0A0A0A] hover:bg-white/5 border border-white/15 text-[#F7F7F5] font-bold text-xs uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-2"
              >
                Establish New Athlete Profile
              </button>
            </div>
          </div>
        )}

        {/* --- LOGIN FORM --- */}
        {isLoggingIn && (
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-[#B7F52A]" />
                <h2 className="text-lg font-bold uppercase font-serif">ATHLETE AUTHENTICATION</h2>
              </div>
              <span className="text-[10px] font-mono text-[#6F7075] uppercase">SECURE ACCESS</span>
            </div>
            {error && (
              <p className="text-[#FF4D4F] text-xs font-mono bg-[#FF4D4F]/10 p-3 rounded border border-[#FF4D4F]/25">
                {error}
              </p>
            )}
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-[11px] font-mono text-[#6F7075] uppercase block mb-1.5">Email or Phone Identifier</label>
                <input
                  type="text"
                  placeholder="name@domain.com / +1234567890"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0A0A0A] outline-none rounded border border-white/15 focus:border-[#B7F52A] text-[#F7F7F5] text-sm font-sans transition-all placeholder:text-[#6F7075]/60"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-[#6F7075] uppercase block mb-1.5">Secret Key / Password</label>
                <div className="relative">
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-4 pr-12 py-3 bg-[#0A0A0A] outline-none rounded border border-white/15 focus:border-[#B7F52A] text-[#F7F7F5] text-sm font-sans transition-all placeholder:text-[#6F7075]/60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#6F7075] hover:text-[#F7F7F5] transition-colors"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsLoggingIn(false);
                    setError('');
                  }}
                  className="w-1/3 py-3 bg-[#0A0A0A] hover:bg-white/5 border border-white/10 transition-colors text-[#F7F7F5] font-bold text-xs uppercase tracking-wider rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-2/3 py-3 bg-[#B7F52A] hover:bg-[#a6df24] transition-colors text-[#050505] font-bold text-xs uppercase tracking-wider rounded flex items-center justify-center"
                >
                  {loading ? 'Authenticating...' : 'Sign In'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* --- SCREEN 2: PERSONAL INFO --- */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-[#B7F52A]" />
                <h2 className="text-lg font-bold uppercase font-serif">ATHLETE BIOMETRICS</h2>
              </div>
              <span className="text-[10px] font-mono text-[#6F7075] uppercase">STAGE 01</span>
            </div>
            {error && (
              <p className="text-[#FF4D4F] text-xs font-mono bg-[#FF4D4F]/10 p-3 rounded border border-[#FF4D4F]/25">
                {error}
              </p>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-mono text-[#6F7075] uppercase block mb-1.5">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Alex Sterling"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0A0A0A] outline-none rounded border border-white/15 focus:border-[#B7F52A] text-[#F7F7F5] text-sm font-sans transition-all placeholder:text-[#6F7075]/60"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-mono text-[#6F7075] uppercase block mb-1.5">Email</label>
                  <input
                    type="email"
                    placeholder="name@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-[#0A0A0A] outline-none rounded border border-white/15 focus:border-[#B7F52A] text-[#F7F7F5] text-sm font-sans transition-all placeholder:text-[#6F7075]/60"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-[#6F7075] uppercase block mb-1.5">Phone Number</label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => {
                      const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setPhone(digitsOnly);
                    }}
                    className="w-full px-4 py-3 bg-[#0A0A0A] outline-none rounded border border-white/15 focus:border-[#B7F52A] text-[#F7F7F5] text-sm font-sans transition-all placeholder:text-[#6F7075]/60"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono text-[#6F7075] uppercase block mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min 4 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-4 pr-12 py-3 bg-[#0A0A0A] outline-none rounded border border-white/15 focus:border-[#B7F52A] text-[#F7F7F5] text-sm font-sans transition-all placeholder:text-[#6F7075]/60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#6F7075] hover:text-[#F7F7F5] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-mono text-[#6F7075] uppercase block mb-1.5">Age</label>
                  <input
                    type="number"
                    placeholder="25"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full px-4 py-3 bg-[#0A0A0A] outline-none rounded border border-white/15 focus:border-[#B7F52A] text-[#F7F7F5] text-sm font-sans transition-all placeholder:text-[#6F7075]/60"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-[#6F7075] uppercase block mb-1.5">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-4 py-3 bg-[#0A0A0A] outline-none rounded border border-white/15 focus:border-[#B7F52A] text-[#F7F7F5] text-sm font-sans"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-mono text-[#6F7075] uppercase block mb-1.5">Height (cm)</label>
                  <input
                    type="number"
                    placeholder="180"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="w-full px-4 py-3 bg-[#0A0A0A] outline-none rounded border border-white/15 focus:border-[#B7F52A] text-[#F7F7F5] text-sm font-sans transition-all placeholder:text-[#6F7075]/60"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-[#6F7075] uppercase block mb-1.5">Weight (kg)</label>
                  <input
                    type="number"
                    placeholder="78"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full px-4 py-3 bg-[#0A0A0A] outline-none rounded border border-white/15 focus:border-[#B7F52A] text-[#F7F7F5] text-sm font-sans transition-all placeholder:text-[#6F7075]/60"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setError('');
                }}
                className="w-1/3 py-3 bg-[#0A0A0A] hover:bg-white/5 border border-white/10 transition-colors text-[#F7F7F5] font-bold text-xs uppercase tracking-wider rounded"
              >
                Back
              </button>
              <button
                onClick={nextStep}
                className="w-2/3 py-3 bg-[#B7F52A] hover:bg-[#a6df24] transition-colors text-[#050505] font-bold text-xs uppercase tracking-wider rounded flex items-center justify-center gap-1"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* --- SCREEN 3: GOALS --- */}
        {step === 3 && (
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-[#B7F52A]" />
                <h2 className="text-lg font-bold uppercase font-serif">TRAINING GOAL & NUTRITION</h2>
              </div>
              <span className="text-[10px] font-mono text-[#6F7075] uppercase">STAGE 02</span>
            </div>
            
            <div className="space-y-3">
              {['Weight Loss', 'Muscle Gain', 'Strength'].map((g) => (
                <div
                  key={g}
                  onClick={() => setGoal(g)}
                  className={`px-5 py-3.5 rounded border cursor-pointer transition-all flex items-center justify-between ${
                    goal === g 
                      ? 'border-[#B7F52A] bg-[#B7F52A]/10 text-[#F7F7F5] font-semibold' 
                      : 'border-white/10 bg-[#0A0A0A] text-[#6F7075] hover:border-white/20 hover:text-[#F7F7F5]'
                  }`}
                >
                  <span className="text-sm font-medium">{g}</span>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${goal === g ? 'border-[#B7F52A]' : 'border-white/20'}`}>
                    {goal === g && <div className="w-2 h-2 bg-[#B7F52A] rounded-full"></div>}
                  </div>
                </div>
              ))}
            </div>

            {/* Dietary Preference Section */}
            <div className="mt-6 pt-5 border-t border-white/10 space-y-3">
              <label className="text-[11px] font-mono text-[#6F7075] uppercase block">Dietary Protocol</label>
              <div className="grid grid-cols-2 gap-3">
                {['Veg', 'Non-Veg'].map((pref) => (
                  <button
                    key={pref}
                    onClick={() => setDietPref(pref)}
                    className={`py-3 rounded border text-center font-bold text-xs uppercase tracking-wider transition-all ${
                      dietPref === pref 
                        ? 'bg-[#B7F52A]/10 border-[#B7F52A] text-[#B7F52A]' 
                        : 'bg-[#0A0A0A] border-white/10 text-[#6F7075] hover:border-white/20 hover:text-[#F7F7F5]'
                    }`}
                  >
                    {pref === 'Veg' ? 'Vegetarian (Egg)' : 'Non-Vegetarian'}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-6 flex gap-3">
              <button
                onClick={() => {
                  setError('');
                  setStep(2);
                }}
                className="w-1/3 py-3 bg-[#0A0A0A] hover:bg-white/5 border border-white/10 transition-colors text-[#F7F7F5] font-bold text-xs uppercase tracking-wider rounded"
              >
                Back
              </button>
              <button
                onClick={nextStep}
                className="w-2/3 py-3 bg-[#B7F52A] hover:bg-[#a6df24] transition-colors text-[#050505] font-bold text-xs uppercase tracking-wider rounded flex items-center justify-center gap-1"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* --- SCREEN 4: AVAILABILITY --- */}
        {step === 4 && (
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#B7F52A]" />
                <h2 className="text-lg font-bold uppercase font-serif">WEEKLY CADENCE</h2>
              </div>
              <span className="text-[10px] font-mono text-[#6F7075] uppercase">STAGE 03</span>
            </div>

            {/* Days Selection */}
            <div>
              <label className="text-[11px] font-mono text-[#6F7075] uppercase block mb-3">Planned Training Frequency (Days/Week)</label>
              <div className="grid grid-cols-5 gap-2">
                {[2, 3, 4, 5, 6].map((day) => (
                  <button
                    key={day}
                    onClick={() => setWorkoutDays(day)}
                    className={`py-3.5 rounded border text-center font-bold text-sm transition-all ${
                      workoutDays === day 
                        ? 'bg-[#B7F52A] border-[#B7F52A] text-[#050505]' 
                        : 'bg-[#0A0A0A] border-white/10 text-[#6F7075] hover:border-white/20 hover:text-[#F7F7F5]'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-6 flex gap-3">
              <button
                onClick={() => {
                  setError('');
                  setStep(3);
                }}
                className="w-1/3 py-3 bg-[#0A0A0A] hover:bg-white/5 border border-white/10 transition-colors text-[#F7F7F5] font-bold text-xs uppercase tracking-wider rounded"
              >
                Back
              </button>
              <button
                onClick={nextStep}
                className="w-2/3 py-3 bg-[#B7F52A] hover:bg-[#a6df24] transition-colors text-[#050505] font-bold text-xs uppercase tracking-wider rounded flex items-center justify-center gap-1"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* --- SCREEN 5: INJURIES & FINISH --- */}
        {step === 5 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#B7F52A]" />
                <h2 className="text-lg font-bold uppercase font-serif">JOINT CLEARANCE</h2>
              </div>
              <span className="text-[10px] font-mono text-[#6F7075] uppercase">STAGE 04</span>
            </div>
            {error && (
              <p className="text-[#FF4D4F] text-xs font-mono bg-[#FF4D4F]/10 p-3 rounded border border-[#FF4D4F]/25">
                {error}
              </p>
            )}

            <div>
              <p className="text-xs text-[#6F7075] mb-4 font-sans leading-relaxed">
                Indicate known joint constraints. AI kinematics will exclude contraindicated exercises and adapt range-of-motion tolerances.
              </p>
              
              <div className="space-y-2">
                {injuryOptions.map((injury) => {
                  const active = selectedInjuries.includes(injury);
                  return (
                    <div
                      key={injury}
                      onClick={() => toggleInjury(injury)}
                      className={`px-4 py-3.5 rounded border cursor-pointer transition-all flex items-center justify-between ${
                        active 
                          ? 'border-[#FFB020] bg-[#FFB020]/10 text-[#FFB020] font-semibold' 
                          : 'border-white/10 bg-[#0A0A0A] text-[#6F7075] hover:border-white/20 hover:text-[#F7F7F5]'
                      }`}
                    >
                      <span className="text-sm font-medium">{injury} Injury</span>
                      <div className={`w-4 h-4 rounded border flex items-center justify-center ${active ? 'border-[#FFB020] bg-[#FFB020]/20' : 'border-white/20'}`}>
                        {active && <span className="text-[#FFB020] text-xs">✓</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                onClick={() => setStep(4)}
                className="w-1/3 py-3 bg-[#0A0A0A] hover:bg-white/5 border border-white/10 transition-colors text-[#F7F7F5] font-bold text-xs uppercase tracking-wider rounded"
              >
                Back
              </button>
              <button
                onClick={handleFinish}
                disabled={loading}
                className="w-2/3 py-3 bg-[#B7F52A] hover:bg-[#a6df24] transition-colors text-[#050505] font-bold text-xs uppercase tracking-wider rounded flex items-center justify-center gap-2"
              >
                {loading ? 'Compiling Protocol...' : 'Complete Initialization'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// frontend/src/App.jsx
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import WorkoutArea from './components/WorkoutArea';
import Analytics from './components/Analytics';
import ProgressPhotos from './components/ProgressPhotos';
import WorkoutSelection from './components/WorkoutSelection';
import ProfileView from './components/ProfileView';
import ChatAssistant from './components/ChatAssistant';
import { LayoutDashboard, Dumbbell, History, Image, User, MessageSquare, LogOut, Activity, Trophy, ChevronLeft, Menu } from 'lucide-react';

function LocalWorkoutView({ userId, selectedExercise, navigate }) {
  const [status, setStatus] = useState('launching');
  const [error, setError] = useState('');

  const launchLocal = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/workout/start_local/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exercise: selectedExercise ? selectedExercise.key : 'squat' })
      });
      if (!res.ok) throw new Error('Could not launch the local tracker window');
      setStatus('active');
    } catch (e) {
      setError(e.message || 'API connection failed');
      setStatus('error');
    }
  };

  useEffect(() => {
    launchLocal();
  }, [userId]);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-dark relative overflow-hidden select-none">
      <div className="absolute top-[-10%] left-[-10%] w-[45vw] h-[45vw] rounded-full bg-brand-primary/10 blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-brand-accent/10 blur-[120px]"></div>

      <div className="w-full max-w-md glass p-8 rounded-3xl animate-fade-in-up shadow-2xl relative border border-white/5 z-10 text-center space-y-6">
        <div className="w-14 h-14 bg-brand-primary/10 rounded-2xl flex items-center justify-center border border-brand-primary/20 mb-2 mx-auto animate-pulse">
          <Dumbbell className="w-6 h-6 text-brand-primary" />
        </div>

        {status === 'launching' && (
          <>
            <h2 className="text-xl font-bold">Launching Tracking Window...</h2>
            <p className="text-xs text-dark-muted leading-relaxed">
              FastAPI is spawning the high-performance local OpenCV pose analyzer window. Please allow standard webcam permissions when prompted by Windows.
            </p>
          </>
        )}

        {status === 'active' && (
          <>
            <h2 className="text-xl font-bold text-brand-accent">Local Workout Active</h2>
            <p className="text-sm font-semibold text-white capitalize mt-1">
              Tracking: {selectedExercise ? selectedExercise.name : ''}
            </p>
            <p className="text-xs text-dark-muted leading-relaxed font-semibold mt-3">
              The external posture analysis window is currently running on your desktop. Perform your exercises in front of the camera.
            </p>
            <div className="bg-brand-primary/5 border border-brand-primary/15 rounded-2xl p-4 text-[10px] text-brand-primary text-left leading-relaxed space-y-1">
              <p>💡 <b>Form Feedback:</b> Look at the OpenCV window for real-time rep counts and safety indicators.</p>
              <p>⏱️ <b>How to finish:</b> Press <b>ESC</b> (to close window) or <b>M</b> (to change exercise) in the tracking window. Your sets, reps, and accuracy will sync immediately to this dashboard.</p>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <h2 className="text-xl font-bold text-brand-secondary">Failed to Launch</h2>
            <p className="text-xs text-brand-secondary/95 bg-brand-secondary/5 border border-brand-secondary/20 rounded-xl p-3">
              {error}
            </p>
            <button
              onClick={launchLocal}
              className="w-full py-2.5 bg-brand-primary hover:bg-brand-primary/90 transition-colors font-bold text-xs rounded-xl"
            >
              Retry Connection
            </button>
          </>
        )}

        <div className="pt-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full py-3.5 bg-dark-border/40 hover:bg-dark-border/60 transition-colors text-xs font-semibold rounded-2xl"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [authInitialized, setAuthInitialized] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState('');
  const [userGoal, setUserGoal] = useState('Muscle Gain');
  const [workoutExercises, setWorkoutExercises] = useState(() => {
    try {
      const stored = sessionStorage.getItem('gym_workout_exercises');
      return stored ? JSON.parse(stored) : [];
    } catch (_) {
      return [];
    }
  });
  const [selectedExercise, setSelectedExercise] = useState(() => {
    try {
      const stored = sessionStorage.getItem('gym_selected_exercise');
      return stored ? JSON.parse(stored) : null;
    } catch (_) {
      return null;
    }
  });
  const [dashboardData, setDashboardData] = useState(null);
  const [showWorkoutsModal, setShowWorkoutsModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const updateSelectedExercise = (exercise) => {
    setSelectedExercise(exercise);
    if (exercise) {
      sessionStorage.setItem('gym_selected_exercise', JSON.stringify(exercise));
    } else {
      sessionStorage.removeItem('gym_selected_exercise');
    }
  };

  const updateWorkoutExercises = (exercises) => {
    setWorkoutExercises(exercises || []);
    if (exercises && exercises.length > 0) {
      sessionStorage.setItem('gym_workout_exercises', JSON.stringify(exercises));
    } else {
      sessionStorage.removeItem('gym_workout_exercises');
    }
  };

  // Synchronous route scroll reset
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const fetchDashboardData = async (uid) => {
    const targetUserId = uid || userId;
    if (!targetUserId) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/dashboard/${targetUserId}`);
      if (res.ok) {
        const json = await res.json();
        setDashboardData(json);
      }
    } catch (e) {
      console.error("Sidebar fetch failed", e);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchDashboardData(userId);
    } else {
      setDashboardData(null);
    }
  }, [userId, location.pathname]);

  const [userAvatar, setUserAvatar] = useState(() => localStorage.getItem('gym_user_avatar') || '');

  // Auth initialization
  useEffect(() => {
    const storedId = localStorage.getItem('gym_user_id');
    const storedName = localStorage.getItem('gym_user_name');
    const storedGoal = localStorage.getItem('gym_user_goal');

    if (storedId && storedName) {
      setUserId(parseInt(storedId));
      setUserName(storedName);
      if (storedGoal) setUserGoal(storedGoal);
    } else {
      setUserId(null);
      setUserName('');
    }
    setAuthInitialized(true);

    const handleAvatarChange = () => {
      setUserAvatar(localStorage.getItem('gym_user_avatar') || '');
    };
    window.addEventListener('avatarUpdated', handleAvatarChange);
    return () => window.removeEventListener('avatarUpdated', handleAvatarChange);
  }, []);

  const handleFinishOnboarding = (id, name) => {
    setUserId(id);
    setUserName(name);
    const storedGoal = localStorage.getItem('gym_user_goal') || 'Muscle Gain';
    setUserGoal(storedGoal);
    navigate('/dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('gym_user_id');
    localStorage.removeItem('gym_user_name');
    localStorage.removeItem('gym_user_goal');
    localStorage.removeItem('gym_user_avatar');
    setUserAvatar('');
    setUserId(null);
    setUserName('');
    setUserGoal('Muscle Gain');
    updateSelectedExercise(null);
    updateWorkoutExercises([]);
    navigate('/onboarding', { replace: true });
  };

  // setView adapter for backwards compatibility with child components
  const setViewAdapter = (viewId) => {
    switch (viewId) {
      case 'dashboard':
        navigate('/dashboard');
        break;
      case 'select-workout':
        updateSelectedExercise(null);
        navigate('/workout-selection');
        break;
      case 'workout':
        navigate('/workout');
        break;
      case 'local-workout':
        navigate('/local-workout');
        break;
      case 'analytics':
        navigate('/analytics');
        break;
      case 'photos':
        navigate('/photos');
        break;
      case 'profile':
        navigate('/profile');
        break;
      case 'chat':
        navigate('/chat');
        break;
      case 'onboarding':
        navigate('/onboarding');
        break;
      default:
        navigate('/dashboard');
        break;
    }
  };

  // App routes where sidebar should be visible
  const sidebarPaths = ['/dashboard', '/workout-selection', '/analytics', '/photos', '/profile', '/chat'];
  const showSidebar = !!userId && sidebarPaths.includes(location.pathname);

  const renderSidebar = () => {
    const navItems = [
      { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/workout-selection', label: 'Workout Library', icon: Dumbbell },
      { path: '/analytics', label: 'Performance Analytics', icon: History },
      { path: '/photos', label: 'Progress Log', icon: Image },
      { path: '/chat', label: 'AI Assistant', icon: MessageSquare },
      { path: '/profile', label: 'Athlete Profile', icon: User },
    ];

    const handleNavClick = (path) => {
      navigate(path);
      setIsMobileMenuOpen(false);
    };

    return (
      <>
        {/* Mobile Header Bar */}
        <header className="md:hidden w-full bg-[#0A0A0A] border-b border-white/10 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[6px] bg-[#B7F52A]/10 border border-[#B7F52A]/30 flex items-center justify-center text-[#B7F52A] shadow-[0_0_12px_rgba(183,245,42,0.2)]">
              <Activity className="w-4 h-4 text-[#B7F52A]" />
            </div>
            <div>
              <span className="font-display font-black tracking-tight text-white text-sm block leading-tight">AI GYM TRAINER</span>
              <span className="text-[9px] font-bold text-[#6F7075] tracking-widest uppercase block">PRO ATHLETIC ENGINE</span>
            </div>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="w-11 h-11 rounded-[6px] bg-[#101012] hover:bg-[#151517] border border-white/15 flex items-center justify-center text-white active:scale-95 transition-all"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5 text-white" />
          </button>
        </header>

        {/* Mobile Backdrop */}
        {isMobileMenuOpen && (
          <div
            className="md:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-50 transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Sidebar Drawer (Fixed on mobile when open, sticky on desktop) */}
        <aside
          className={`
            fixed md:sticky top-0 bottom-0 md:bottom-auto left-0 h-screen w-72 md:w-64 bg-[#0A0A0A] border-r border-white/10 flex flex-col flex-shrink-0 select-none z-50 md:z-30 transition-transform duration-300
            ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            ${!isSidebarOpen ? 'md:-translate-x-full md:w-0 md:overflow-hidden md:border-none' : ''}
          `}
        >
          {/* Branding Header */}
          <div className="p-4 md:p-5 border-b border-white/10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-[6px] bg-[#B7F52A]/10 border border-[#B7F52A]/30 flex items-center justify-center text-[#B7F52A] shadow-[0_0_15px_rgba(183,245,42,0.25)]">
                <Activity className="w-5 h-5 text-[#B7F52A]" />
              </div>
              <div>
                <span className="font-display font-black tracking-tight text-white text-base block leading-tight">AI GYM TRAINER</span>
                <span className="text-[10px] font-bold text-[#6F7075] tracking-widest uppercase block">PRO ATHLETIC ENGINE</span>
              </div>
            </div>
            {/* Desktop Collapse button */}
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="hidden md:flex w-8 h-8 rounded-[6px] bg-white/5 hover:bg-white/10 border border-white/5 items-center justify-center text-[#6F7075] hover:text-white transition-colors"
              title="Collapse Sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {/* Mobile Close button (44px target) */}
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden w-11 h-11 rounded-[6px] bg-[#101012] border border-white/10 flex items-center justify-center text-[#6F7075] hover:text-white transition-colors"
              aria-label="Close Navigation Menu"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>

          {/* Athlete Profile Badge */}
          <div
            onClick={() => handleNavClick('/profile')}
            className={`p-3.5 mx-3 my-4 bg-[#101012] border rounded-[8px] flex items-center gap-3 cursor-pointer group transition-all ${
              location.pathname === '/profile' ? 'border-[#B7F52A]/60' : 'border-white/10 hover:border-[#B7F52A]/40'
            }`}
            title="View & Edit Profile"
          >
            <div className="w-9 h-9 rounded-[6px] bg-[#151517] border border-white/10 flex items-center justify-center font-display font-black text-xs text-[#B7F52A] uppercase flex-shrink-0 overflow-hidden">
              {userAvatar ? (
                <img src={userAvatar} alt="Profile" className="w-full h-full object-cover rounded-[6px]" />
              ) : (
                userName ? userName.substring(0, 2).toUpperCase() : 'AI'
              )}
            </div>
            <div className="min-w-0 flex-1">
              <span className="font-display font-bold text-white text-xs block truncate group-hover:text-[#B7F52A] transition-colors">{userName || 'Athlete'}</span>
              <span className="text-[9px] font-black text-[#B7F52A] tracking-wider block uppercase truncate">{userGoal}</span>
            </div>
          </div>

          {/* Navigation List */}
          <div className="flex-1 px-3 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavClick(item.path)}
                  className={`w-full px-3.5 py-3 rounded-[6px] text-left text-xs font-semibold tracking-wide transition-all flex items-center gap-3 ${
                    isActive
                      ? 'bg-[#B7F52A]/10 text-[#B7F52A] border border-[#B7F52A]/40 font-bold shadow-[0_0_15px_rgba(183,245,42,0.15)]'
                      : 'text-[#6F7075] border border-transparent hover:text-white hover:bg-white/5 hover:border-white/10'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#B7F52A]' : 'text-[#6F7075]'}`} />
                  <span className="font-display font-bold">{item.label}</span>
                </button>
              );
            })}

            {/* Daily Protocol Progress Module inside Sidebar */}
            {dashboardData && (
              <div className="mt-5 pt-4 border-t border-white/10 space-y-2 pb-3">
                <span className="text-[10px] font-display font-black text-[#6F7075] tracking-widest uppercase block mb-1">Session Streak</span>

                <div className="bg-[#101012] border border-white/10 rounded-[8px] p-3 flex items-center gap-3 hover:border-[#B7F52A]/30 transition-all">
                  <div className="relative w-10 h-10 flex-shrink-0 flex items-center justify-center">
                    <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                      <circle cx="20" cy="20" r="16" className="stroke-white/5 fill-transparent" strokeWidth="2.5" />
                      <circle
                        cx="20" cy="20" r="16"
                        className="stroke-[#B7F52A] fill-transparent"
                        strokeWidth="2.5"
                        strokeDasharray={2 * Math.PI * 16}
                        strokeDashoffset={2 * Math.PI * 16 - (Math.min(100, dashboardData.workout_completion || 0) / 100) * (2 * Math.PI * 16)}
                        strokeLinecap="round"
                      />
                    </svg>
                    <Trophy className="w-3.5 h-3.5 text-[#B7F52A] relative z-10" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-1">
                      <span className="text-[11px] font-bold text-white">{dashboardData.workout_streak || 0} Days Active</span>
                      {dashboardData.completed_today && dashboardData.completed_today.length > 0 && (
                        <button
                          onClick={() => {
                            setShowWorkoutsModal(true);
                            setIsMobileMenuOpen(false);
                          }}
                          className="px-1.5 py-0.5 bg-[#B7F52A]/10 hover:bg-[#B7F52A]/20 border border-[#B7F52A]/30 text-[#B7F52A] text-[8px] font-display font-black tracking-widest uppercase rounded-[4px]"
                        >
                          LOGS
                        </button>
                      )}
                    </div>
                    <span className="text-[9px] font-mono text-[#6F7075] block mt-0.5">{dashboardData.workout_completion || 0}% Target Met</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Logout at bottom */}
          <div className="p-3 border-t border-white/10">
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                handleLogout();
              }}
              className="w-full px-3.5 py-2.5 rounded-[6px] text-left text-xs font-display font-bold text-[#FF4D4F] hover:bg-[#FF4D4F]/10 transition-all flex items-center gap-2.5 border border-transparent hover:border-[#FF4D4F]/30"
            >
              <LogOut className="w-4 h-4 text-[#FF4D4F]" />
              DISCONNECT SESSION
            </button>
          </div>
        </aside>
      </>
    );
  };

  if (!authInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505] text-[#F7F7F5]">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-2 border-[#B7F52A] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-display font-bold tracking-widest text-[#6F7075] uppercase">INITIALIZING KINEMATIC ENGINE...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-[#F7F7F5] flex flex-col md:flex-row relative overflow-x-hidden selection:bg-[#B7F52A] selection:text-[#050505]">
      {showSidebar && renderSidebar()}

      <div className={`flex-1 min-w-0 relative ${showSidebar && !isSidebarOpen ? 'pl-16 md:pl-20' : ''} transition-all duration-300`}>
        {/* Expand button visible only on desktop when sidebar is hidden */}
        {showSidebar && !isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="hidden md:flex absolute top-6 left-6 z-40 w-9 h-9 rounded-[6px] bg-[#101012] border border-white/15 items-center justify-center text-[#6F7075] hover:text-white hover:border-[#B7F52A]/50 shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
            title="Expand Sidebar"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}

        <Routes>
          {/* Root redirect */}
          <Route
            path="/"
            element={userId ? <Navigate to="/dashboard" replace /> : <Navigate to="/onboarding" replace />}
          />

          {/* Onboarding */}
          <Route
            path="/onboarding"
            element={userId ? <Navigate to="/dashboard" replace /> : <Onboarding onFinish={handleFinishOnboarding} />}
          />

          {/* Dashboard */}
          <Route
            path="/dashboard"
            element={
              !userId ? (
                <Navigate to="/onboarding" replace />
              ) : (
                <Dashboard
                  userId={userId}
                  userName={userName}
                  setView={setViewAdapter}
                  data={dashboardData}
                  setData={setDashboardData}
                  fetchDashboardData={() => fetchDashboardData(userId)}
                  onStartWorkout={(exercises) => {
                    updateWorkoutExercises(exercises);
                    navigate('/workout-selection');
                  }}
                />
              )
            }
          />

          {/* Workout Selection / Library / Muscle Map */}
          <Route
            path="/workout-selection"
            element={
              !userId ? (
                <Navigate to="/onboarding" replace />
              ) : (
                <WorkoutSelection
                  userId={userId}
                  workoutExercises={workoutExercises}
                  setView={setViewAdapter}
                  onSelectExercise={(key, name) => {
                    updateSelectedExercise({ key, name });
                    navigate('/workout');
                  }}
                />
              )
            }
          />

          {/* Workout session: requires active exercise context, otherwise safely redirect to /workout-selection */}
          <Route
            path="/workout"
            element={
              !userId ? (
                <Navigate to="/onboarding" replace />
              ) : !selectedExercise && (!workoutExercises || workoutExercises.length === 0) ? (
                <Navigate to="/workout-selection" replace />
              ) : (
                <WorkoutArea
                  userId={userId}
                  workoutExercises={selectedExercise ? [[selectedExercise.key, selectedExercise.name]] : workoutExercises}
                  setView={setViewAdapter}
                  onWorkoutLogged={() => {
                    updateSelectedExercise(null);
                    navigate('/analytics');
                  }}
                />
              )
            }
          />

          {/* Local OpenCV workout window */}
          <Route
            path="/local-workout"
            element={
              !userId ? (
                <Navigate to="/onboarding" replace />
              ) : (
                <LocalWorkoutView
                  userId={userId}
                  selectedExercise={selectedExercise}
                  navigate={navigate}
                />
              )
            }
          />

          {/* Performance Analytics */}
          <Route
            path="/analytics"
            element={
              !userId ? (
                <Navigate to="/onboarding" replace />
              ) : (
                <Analytics userId={userId} setView={setViewAdapter} />
              )
            }
          />

          {/* Progress Photos Log */}
          <Route
            path="/photos"
            element={
              !userId ? (
                <Navigate to="/onboarding" replace />
              ) : (
                <ProgressPhotos userId={userId} setView={setViewAdapter} />
              )
            }
          />

          {/* Athlete Profile */}
          <Route
            path="/profile"
            element={
              !userId ? (
                <Navigate to="/onboarding" replace />
              ) : (
                <ProfileView userId={userId} userName={userName} handleLogout={handleLogout} />
              )
            }
          />

          {/* AI Kinematic Chat Assistant */}
          <Route
            path="/chat"
            element={
              !userId ? (
                <Navigate to="/onboarding" replace />
              ) : (
                <ChatAssistant setView={setViewAdapter} />
              )
            }
          />

          {/* Fallback for unknown routes */}
          <Route
            path="*"
            element={<Navigate to={userId ? "/dashboard" : "/onboarding"} replace />}
          />
        </Routes>
      </div>

      {/* --- WORKOUT LOGS MODAL --- */}
      {showWorkoutsModal && dashboardData && dashboardData.completed_today && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0b0e14] p-8 rounded-3xl border border-white/10 animate-fade-in-up relative">

            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-extrabold tracking-tight text-white">Today's Completed Workouts</h3>
                <p className="text-xs text-dark-muted mt-1">
                  A track of all posture-analyzed sessions logged today
                </p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-brand-primary" />
              </div>
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {dashboardData.completed_today.map((w, idx) => (
                <div key={idx} className="flex justify-between items-center bg-white/5 px-4 py-3.5 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-200 capitalize">
                      {w.exercise.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs text-dark-muted font-medium mt-1">
                      {w.sets} sets × {w.reps} reps • {w.duration ? Number(w.duration).toFixed(1) : '0.0'} min
                    </span>
                  </div>
                  <span className="text-xs font-bold text-brand-accent bg-brand-accent/10 px-2 py-1 rounded-lg border border-brand-accent/15">
                    {Math.round(w.accuracy)}% Acc
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-6 flex justify-end">
              <button
                onClick={() => setShowWorkoutsModal(false)}
                className="w-full py-3.5 bg-dark-border/40 hover:bg-dark-border/60 transition-colors font-semibold rounded-xl text-xs text-white"
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

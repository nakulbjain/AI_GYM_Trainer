// frontend/src/components/Analytics.jsx
import React, { useEffect, useState } from 'react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { ChevronLeft, FileDown, Calendar, ShieldCheck, Dumbbell, Award, Flame, Activity } from 'lucide-react';

export default function Analytics({ userId, setView }) {
  const [analytics, setAnalytics] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeFilter, setTimeFilter] = useState('8W');

  const fetchData = async () => {
    try {
      const analRes = await fetch(`${import.meta.env.VITE_API_URL}/api/workout/analytics/${userId}`);
      if (!analRes.ok) throw new Error('Analytics loading failed');
      const analData = await analRes.json();
      setAnalytics(analData);

      const histRes = await fetch(`${import.meta.env.VITE_API_URL}/api/workout/history/${userId}`);
      if (!histRes.ok) throw new Error('History loading failed');
      const histData = await histRes.json();
      setHistory(histData);
    } catch (e) {
      setError(e.message || 'API connection failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId]);

  const handleDownloadReport = async (sessionId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/workout/report/${userId}/${sessionId}`);
      if (!response.ok) throw new Error('Report download failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `workout_report_${sessionId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      alert("Error generating PDF: " + e.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505] text-[#F7F7F5]">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-2 border-[#B7F52A] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-display font-bold tracking-widest text-[#6F7075] uppercase">COMPILING PERFORMANCE PROOF...</p>
        </div>
      </div>
    );
  }

  // Map charts data from existing analytics
  const weightChartData = (analytics?.weight_labels || []).map((lbl, idx) => ({
    name: lbl,
    weight: analytics?.weight_data?.[idx] ?? 0
  }));

  const historyChartData = (analytics?.dates || []).map((lbl, idx) => ({
    date: lbl,
    calories: analytics?.calories?.[idx] ?? 0,
    accuracy: analytics?.accuracies?.[idx] ?? 0,
    volume: analytics?.volume?.[idx] ?? 0,
    duration: analytics?.durations?.[idx] ?? 0
  }));

  const totalSessions = history.length;
  const avgFormScore = history.length > 0 ? Math.round(history.reduce((a, b) => a + (b.accuracy || 0), 0) / history.length) : 0;
  const totalCalsBurned = history.reduce((a, b) => a + (b.calories_burned || 0), 0);

  return (
    <div className="min-h-screen bg-[#050505] text-[#F7F7F5] pb-20 px-4 md:px-8 relative select-none">
      <div className="max-w-7xl mx-auto pt-8 space-y-8 relative z-10 animate-fade-in-up">
        
        {/* HEADER BAR */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setView('dashboard')}
              className="w-9 h-9 rounded-[6px] bg-[#101012] hover:bg-[#151517] border border-white/15 flex items-center justify-center text-[#B7F52A] transition-colors"
              title="Return to Dashboard"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-[#B7F52A] shadow-[0_0_8px_rgba(183,245,42,0.8)]"></span>
                <span className="text-[10px] font-display font-black text-[#6F7075] tracking-widest uppercase">
                  BIOMECHANICAL AUDIT SYSTEM
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-display font-black tracking-tight text-white uppercase">
                PERFORMANCE ANALYTICS & PROOF
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {['7D', '8W', 'Season', 'All'].map((tab) => (
              <button
                key={tab}
                onClick={() => setTimeFilter(tab)}
                className={`px-3 py-1.5 rounded-[4px] text-xs font-display font-bold uppercase tracking-wider transition-all border ${
                  timeFilter === tab
                    ? 'bg-[#B7F52A] text-[#050505] border-[#B7F52A]'
                    : 'bg-[#101012] text-[#6F7075] border-white/10 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* TOP SUMMARY STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#101012] border border-white/10 p-5 rounded-[8px]">
            <span className="text-[10px] font-display font-black text-[#6F7075] tracking-widest uppercase block mb-1">Total Verified Sessions</span>
            <span className="text-2xl md:text-3xl font-display font-black text-white">{totalSessions}</span>
            <span className="text-[10px] font-mono text-[#B7F52A] block mt-1">100% Computer Vision Audited</span>
          </div>
          <div className="bg-[#101012] border border-white/10 p-5 rounded-[8px]">
            <span className="text-[10px] font-display font-black text-[#6F7075] tracking-widest uppercase block mb-1">Average Form Accuracy</span>
            <span className="text-2xl md:text-3xl font-display font-black text-[#B7F52A]">{avgFormScore}%</span>
            <span className="text-[10px] font-mono text-[#6F7075] block mt-1">Joint Angle Compliance</span>
          </div>
          <div className="bg-[#101012] border border-white/10 p-5 rounded-[8px]">
            <span className="text-[10px] font-display font-black text-[#6F7075] tracking-widest uppercase block mb-1">Energy Expenditure</span>
            <span className="text-2xl md:text-3xl font-display font-black text-white">{Math.round(totalCalsBurned).toLocaleString()} <span className="text-xs font-display text-[#6F7075]">kcal</span></span>
            <span className="text-[10px] font-mono text-[#FFB020] block mt-1">Kinematic Load Estimate</span>
          </div>
        </div>

        {/* CHARTS CONTAINER */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* CHART 1: Form Accuracy Trend */}
          <div className="bg-[#101012] border border-white/10 p-6 rounded-[8px] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-display font-black text-[#B7F52A] tracking-widest uppercase block">Joint Angle Compliance</span>
                <h3 className="text-base font-display font-bold text-white uppercase mt-0.5">Posture Form Accuracy (%)</h3>
              </div>
              <span className="text-xs font-mono font-bold text-[#B7F52A]">{avgFormScore}% AVG</span>
            </div>
            <div className="h-[250px] w-full text-xs font-mono">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                  <XAxis dataKey="date" stroke="#6F7075" tick={{ fill: '#6F7075', fontSize: 10 }} />
                  <YAxis domain={[50, 100]} stroke="#6F7075" tick={{ fill: '#6F7075', fontSize: 10 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#101012', borderColor: 'rgba(255, 255, 255, 0.15)', borderRadius: '6px', color: '#F7F7F5' }}
                    labelStyle={{ color: '#B7F52A', fontFamily: 'Chivo', fontWeight: 800 }}
                  />
                  <Line type="monotone" dataKey="accuracy" stroke="#B7F52A" strokeWidth={2.5} dot={{ fill: '#B7F52A', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* CHART 2: Energy Expenditure Bar Chart */}
          <div className="bg-[#101012] border border-white/10 p-6 rounded-[8px] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-display font-black text-[#6F7075] tracking-widest uppercase block">Caloric Expenditure</span>
                <h3 className="text-base font-display font-bold text-white uppercase mt-0.5">Energy Burned Per Session (kcal)</h3>
              </div>
              <span className="text-xs font-mono font-bold text-white">{Math.round(totalCalsBurned)} kcal</span>
            </div>
            <div className="h-[250px] w-full text-xs font-mono">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={historyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                  <XAxis dataKey="date" stroke="#6F7075" tick={{ fill: '#6F7075', fontSize: 10 }} />
                  <YAxis stroke="#6F7075" tick={{ fill: '#6F7075', fontSize: 10 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#101012', borderColor: 'rgba(255, 255, 255, 0.15)', borderRadius: '6px', color: '#F7F7F5' }}
                    labelStyle={{ color: '#B7F52A', fontFamily: 'Chivo', fontWeight: 800 }}
                  />
                  <Bar dataKey="calories" fill="#F7F7F5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* CHART 3: Weight Progression */}
          {weightChartData.length > 0 && (
            <div className="bg-[#101012] border border-white/10 p-6 rounded-[8px] space-y-4 lg:col-span-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-display font-black text-[#6F7075] tracking-widest uppercase block">Body Composition</span>
                  <h3 className="text-base font-display font-bold text-white uppercase mt-0.5">Athlete Mass Progression (kg)</h3>
                </div>
              </div>
              <div className="h-[230px] w-full text-xs font-mono">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weightChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                    <XAxis dataKey="name" stroke="#6F7075" tick={{ fill: '#6F7075', fontSize: 10 }} />
                    <YAxis domain={['dataMin - 2', 'dataMax + 2']} stroke="#6F7075" tick={{ fill: '#6F7075', fontSize: 10 }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#101012', borderColor: 'rgba(255, 255, 255, 0.15)', borderRadius: '6px', color: '#F7F7F5' }}
                    />
                    <Line type="monotone" dataKey="weight" stroke="#FFB020" strokeWidth={2.5} dot={{ fill: '#FFB020', r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

        </div>

        {/* WORKOUT SESSION HISTORY TABLE */}
        <div className="bg-[#101012] border border-white/10 p-6 rounded-[8px] space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-display font-black text-[#B7F52A] tracking-widest uppercase block">Historical Telemetry</span>
              <h2 className="text-lg font-display font-bold text-white uppercase mt-0.5">Audited Training Logs</h2>
            </div>
            <span className="text-xs font-mono text-[#6F7075]">{history.length} Certified Entries</span>
          </div>

          {history.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead>
                  <tr className="border-b border-white/10 text-[#6F7075] font-display font-black text-[10px] uppercase tracking-wider">
                    <th className="pb-3.5">Session Date</th>
                    <th className="pb-3.5">Protocol</th>
                    <th className="pb-3.5">Sets × Reps</th>
                    <th className="pb-3.5">Accuracy</th>
                    <th className="pb-3.5 text-center">Calories</th>
                    <th className="pb-3.5 text-right">PDF Proof</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-semibold text-slate-300">
                  {history.map((log) => (
                    <tr key={log.id} className="hover:bg-white/[0.03] transition-colors">
                      <td className="py-3.5 font-mono text-xs text-[#6F7075]">
                        {new Date(log.date).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}
                      </td>
                      <td className="py-3.5 capitalize font-display font-bold text-white">
                        {log.exercise.replace(/_/g, ' ')}
                      </td>
                      <td className="py-3.5 font-mono text-xs text-white">
                        {log.sets} sets × {log.reps} reps
                      </td>
                      <td className="py-3.5">
                        <span className={`px-2 py-0.5 rounded-[3px] text-[10px] font-display font-black tracking-wider uppercase border ${
                          log.accuracy >= 85 
                            ? 'bg-[#B7F52A]/10 text-[#B7F52A] border-[#B7F52A]/30' 
                            : 'bg-[#FF4D4F]/10 text-[#FF4D4F] border-[#FF4D4F]/30'
                        }`}>
                          {log.accuracy}% Compliance
                        </span>
                      </td>
                      <td className="py-3.5 text-center font-mono text-xs text-white">
                        {Math.round(log.calories_burned)} kcal
                      </td>
                      <td className="py-3.5 text-right">
                        <button
                          onClick={() => handleDownloadReport(log.id)}
                          className="px-2.5 py-1.5 bg-transparent hover:bg-white/10 text-white border border-white/15 hover:border-white/30 rounded-[4px] transition-all active:scale-95 inline-flex items-center gap-1.5 text-[11px] font-display font-bold uppercase tracking-wider"
                        >
                          <FileDown className="w-3.5 h-3.5 text-[#B7F52A]" />
                          Export
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 bg-[#0A0A0A] rounded-[6px] border border-white/5">
              <Activity className="w-8 h-8 text-[#6F7075] mx-auto mb-2 opacity-50" />
              <span className="text-xs font-display font-bold text-[#6F7075] uppercase tracking-wider block">No verified workouts recorded</span>
              <span className="text-[11px] text-[#6F7075] block mt-1">Complete your first computer vision session to generate biometric proof logs.</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

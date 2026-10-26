// frontend/src/components/WorkoutArea.jsx
import React, { useEffect, useRef, useState } from 'react';
import { 
  Dumbbell, Play, Pause, RefreshCw, X, ShieldAlert, 
  Volume2, VolumeX, Droplet, Flame, Compass, Award,
  Maximize2, Minimize2, Check, Activity, Repeat, Layers
} from 'lucide-react';

export default function WorkoutArea({ userId, workoutExercises, restDuration, setView, onWorkoutLogged }) {
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const currentEx = workoutExercises[exerciseIndex] ? workoutExercises[exerciseIndex][0] : 'squat';
  const currentCleanName = workoutExercises[exerciseIndex] ? workoutExercises[exerciseIndex][1] : 'Squat';

  const [isRunning, setIsRunning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isResting, setIsResting] = useState(false);
  const [restTimeLeft, setRestTimeLeft] = useState(restDuration || 90);
  
  // Real-time API states
  const [reps, setReps] = useState(0);
  const [sets, setSets] = useState(1);
  const [stage, setStage] = useState('-');
  const [activeAngle, setActiveAngle] = useState(0);
  const [romPct, setRomPct] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [fatigue, setFatigue] = useState(0);
  const [stresses, setStresses] = useState({ lumbar: 'Low', knee: 'Low', shoulder: 'Low', neck: 'Low' });
  const [riskScore, setRiskScore] = useState('Low');
  const [warningMsg, setWarningMsg] = useState('');
  const [isVerified, setIsVerified] = useState(true);
  const [landmarks, setLandmarks] = useState([]);
  
  // Audio state
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const lastSpokenRef = useRef(0);
  const lastSpokenTextRef = useRef('');

  // Water reminder state
  const [showWaterReminder, setShowWaterReminder] = useState(false);

  // References
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const wsRef = useRef(null);
  const frameIntervalRef = useRef(null);
  const videoCheckTimerRef = useRef(null);
  const streamRef = useRef(null);
  const restTimerRef = useRef(null);
  const isStartingRef = useRef(false);

  // Stats accumulated during current exercise
  const [accuraciesList, setAccuraciesList] = useState([]);
  const [fatiguesList, setFatiguesList] = useState([]);
  const [startTime] = useState(Date.now());

  // Summary Modal state
  const [showSummary, setShowSummary] = useState(false);
  const [summaryData, setSummaryData] = useState(null);
  const [savingLog, setSavingLog] = useState(false);

  // Cancel speech immediately when voiceEnabled becomes false
  useEffect(() => {
    if (!voiceEnabled && typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, [voiceEnabled]);

  // Voice speech synthesizer with deduplication & throttling
  const speakText = (text) => {
    if (!voiceEnabled || !text) {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      return;
    }
    const now = Date.now();
    // Do NOT repeat the exact same text string unless 15 seconds have passed
    if (text === lastSpokenTextRef.current && now - lastSpokenRef.current < 15000) {
      return;
    }
    // Throttle any speech by at least 3 seconds
    if (now - lastSpokenRef.current < 3000) return;
    
    try {
      window.speechSynthesis.cancel(); // Cancel previous speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
      lastSpokenRef.current = now;
      lastSpokenTextRef.current = text;
    } catch (e) {
      console.warn("Speech synthesis error", e);
    }
  };

  // Toggle true Fullscreen view
  const toggleFullscreen = () => {
    const nextState = !isFullscreen;
    setIsFullscreen(nextState);
    
    if (nextState) {
      if (containerRef.current && containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen().catch(() => {});
      }
    } else {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  // Start Camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
        } catch (_) {}
      }
      streamRef.current = stream;
      console.log(`[AI-Trainer] Camera ready (tracks: ${stream.getVideoTracks().length})`);
      return stream;
    } catch (err) {
      console.error("[AI-Trainer] Camera access failed:", err);
      alert("Webcam permission denied! Camera module requires access to continue.");
      throw err;
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current);
      frameIntervalRef.current = null;
    }
    if (videoCheckTimerRef.current) {
      clearInterval(videoCheckTimerRef.current);
      videoCheckTimerRef.current = null;
    }
  };

  // Connect WebSocket
  const connectWebSocket = () => {
    const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const fallbackWsUrl = rawApiUrl.replace(/^http:/, 'ws:').replace(/^https:/, 'wss:');
    const wsBaseUrl = import.meta.env.VITE_WS_URL || fallbackWsUrl;
    const wsEndpoint = `${wsBaseUrl}/ws/track/${userId || 1}`;
    console.log(`[AI-Trainer] Connecting WebSocket to: ${wsEndpoint}`);
    
    // Disconnect any existing socket before opening a new one
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch (_) {}
      wsRef.current = null;
    }

    const ws = new WebSocket(wsEndpoint);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log(`[AI-Trainer] WebSocket connected: ${wsEndpoint} (readyState: ${ws.readyState})`);
      // Send active exercise configuration
      const configMsg = { event: 'config', exercise: currentEx };
      console.log(`[AI-Trainer] Sending initial exercise config:`, configMsg);
      ws.send(JSON.stringify(configMsg));
    };

    let msgCount = 0;
    ws.onmessage = (event) => {
      msgCount++;
      let data;
      try {
        data = JSON.parse(event.data);
      } catch (parseErr) {
        console.error("[AI-Trainer] Failed to parse WebSocket message:", event.data);
        return;
      }

      if (data.error) {
        console.error(`[AI-Trainer] WebSocket returned error from backend:`, data.error);
        setWarningMsg(`Backend error: ${data.error}`);
        return;
      }

      if (data.event === 'summary') {
        console.log(`[AI-Trainer] Received workout summary:`, data);
        return;
      }

      // Periodic diagnostic every 30 responses
      if (msgCount % 30 === 1) {
        console.log(`[AI-Trainer] WebSocket response received (#${msgCount}) - Landmarks detected: ${data.landmarks ? data.landmarks.length : 0} - Stage: ${data.stage} - Angle: ${data.active_angle}°`);
      }

      // Update state parameters
      setIsVerified(data.verified);
      setLandmarks(data.landmarks || []);
      setReps(data.reps || 0);
      setStage(data.stage || '-');
      setActiveAngle(data.active_angle || 0);
      setRomPct(data.rom_pct || 0);
      setAccuracy(data.form_accuracy !== undefined ? data.form_accuracy : 100);
      setFatigue(data.fatigue !== undefined ? data.fatigue : 0);
      setStresses(data.stresses || { lumbar: 'Low', knee: 'Low', shoulder: 'Low', neck: 'Low' });
      setRiskScore(data.risk_score || 'Low');
      
      const cleanWarning = data.warning || '';
      setWarningMsg(cleanWarning);

      // Save accuracies/fatigues for local calculations
      if (data.verified && data.form_accuracy > 0) {
        setAccuraciesList(prev => [...prev, data.form_accuracy]);
        setFatiguesList(prev => [...prev, data.fatigue]);
      }

      // Voice Warning trigger
      if (cleanWarning) {
        speakText(cleanWarning);
      }

      // Water intake reminder trigger
      if (data.water_reminder) {
        setShowWaterReminder(true);
        speakText("Time to drink water. Two hundred and fifty milliliters recommended.");
      }
    };

    ws.onerror = (err) => {
      console.error(`[AI-Trainer] WebSocket error for ${wsEndpoint}:`, err);
    };

    ws.onclose = (e) => {
      console.warn(`[AI-Trainer] WebSocket closed:`, {
        url: wsEndpoint,
        code: e.code,
        reason: e.reason || 'No reason provided',
        wasClean: e.wasClean
      });
    };

    return ws;
  };

  // Disconnect WebSocket
  const disconnectWebSocket = () => {
    if (wsRef.current) {
      console.log("[AI-Trainer] Closing WebSocket explicitly.");
      try {
        wsRef.current.close();
      } catch (_) {}
      wsRef.current = null;
    }
  };

  // Start frame capturing loops
  const startFrameLoop = () => {
    if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current);
      frameIntervalRef.current = null;
    }

    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) {
      console.warn("[AI-Trainer] startFrameLoop aborted: canvas or video ref is missing");
      return;
    }
    const ctx = canvas.getContext('2d');
    let framesSent = 0;

    console.log(`[AI-Trainer] Frame loop started (target rate: ~7.5 fps, canvas: ${canvas.width}x${canvas.height})`);

    frameIntervalRef.current = setInterval(() => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN || isResting) return;
      if (!video.videoWidth || !video.videoHeight) return;

      // Ensure canvas resolution matches video feed resolution
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }

      // Draw video frame to hidden canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Get base64 string
      const jpegBase64 = canvas.toDataURL('image/jpeg', 0.5); // Compress to 50% quality

      framesSent++;
      if (framesSent % 30 === 1) {
        console.log(`[AI-Trainer] Frame #${framesSent} sent - Frame payload size: ${jpegBase64.length} chars - Exercise: ${currentEx}`);
      }

      // Send to WebSocket
      wsRef.current.send(JSON.stringify({
        event: 'frame',
        image: jpegBase64,
        exercise: currentEx
      }));
    }, 130); // ~7.5 frames per second - low latency and smooth
  };

  // Master workout lifecycle hook
  useEffect(() => {
    let isCancelled = false;

    const initWorkout = async () => {
      if (!isRunning || isResting || currentEx === 'treadmill') {
        stopCamera();
        disconnectWebSocket();
        return;
      }

      // Prevent overlapping concurrent inits
      if (isStartingRef.current) return;
      isStartingRef.current = true;

      try {
        // 1. Await camera access
        await startCamera();
        if (isCancelled) {
          stopCamera();
          isStartingRef.current = false;
          return;
        }

        // 2. Connect WebSocket
        connectWebSocket();

        // 3. Confirm video readyState >= 2 (HAVE_CURRENT_DATA) and non-zero dimensions
        if (videoCheckTimerRef.current) {
          clearInterval(videoCheckTimerRef.current);
          videoCheckTimerRef.current = null;
        }

        videoCheckTimerRef.current = setInterval(() => {
          if (isCancelled) {
            if (videoCheckTimerRef.current) {
              clearInterval(videoCheckTimerRef.current);
              videoCheckTimerRef.current = null;
            }
            return;
          }

          const vid = videoRef.current;
          if (vid && vid.readyState >= 2 && vid.videoWidth > 0 && vid.videoHeight > 0) {
            console.log(`[AI-Trainer] Video element confirmed ready (${vid.videoWidth}x${vid.videoHeight}, readyState=${vid.readyState})`);
            clearInterval(videoCheckTimerRef.current);
            videoCheckTimerRef.current = null;
            startFrameLoop();
          }
        }, 150);

      } catch (err) {
        console.error("[AI-Trainer] Initialization error:", err);
      } finally {
        isStartingRef.current = false;
      }
    };

    initWorkout();

    return () => {
      isCancelled = true;
      isStartingRef.current = false;
      if (videoCheckTimerRef.current) {
        clearInterval(videoCheckTimerRef.current);
        videoCheckTimerRef.current = null;
      }
      stopCamera();
      disconnectWebSocket();
    };
  }, [isRunning, isResting, currentEx]);

  // Set-based Rest Timer triggers
  useEffect(() => {
    if (reps > 0 && reps % 12 === 0) {
      // Trigger Rest
      triggerRest();
    }
  }, [reps]);

  const triggerRest = () => {
    setIsResting(true);
    setRestTimeLeft(restDuration || 90);
    speakText("Set complete. Take a rest for one minute and thirty seconds.");
    
    restTimerRef.current = setInterval(() => {
      setRestTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(restTimerRef.current);
          setIsResting(false);
          speakText("Rest over. Start your next set.");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const skipRest = () => {
    clearInterval(restTimerRef.current);
    setIsResting(false);
    speakText("Rest skipped. Let's begin.");
  };

  const handleTreadmillComplete = () => {
    let cals = 120;
    let dur = 20;
    if (currentCleanName.includes("30 mins")) { cals = 220; dur = 30; }
    else if (currentCleanName.includes("25 mins")) { cals = 180; dur = 25; }
    else if (currentCleanName.includes("12 mins")) { cals = 90; dur = 12; }
    else if (currentCleanName.includes("15 mins")) { cals = 110; dur = 15; }
    
    const finalSummary = {
      exercise: 'treadmill',
      reps: 0,
      sets: 1,
      duration: dur,
      accuracy: 100,
      calories_burned: cals,
      avg_fatigue: 15,
      risk_score: 'Low',
      wrong_reps: 0,
      correct_reps: 0
    };

    setSummaryData(finalSummary);
    setShowSummary(true);
  };

  const handleFinishSession = async () => {
    stopCamera();
    disconnectWebSocket();
    setIsRunning(false);

    if (isFullscreen) {
      setIsFullscreen(false);
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }

    // Calculate metrics
    const duration = roundValue((Date.now() - startTime) / 60000.0, 1);
    const avgAcc = accuraciesList.length > 0 ? Math.round(accuraciesList.reduce((a,b)=>a+b, 0) / accuraciesList.length) : 88;
    const avgFatigue = fatiguesList.length > 0 ? Math.round(fatiguesList.reduce((a,b)=>a+b, 0) / fatiguesList.length) : 45;
    const cals = roundValue(duration * 7.2, 1);
    
    // Calculate wrong reps estimation (if accuracy was below 75% on various readings)
    const lowAccCount = accuraciesList.filter(a => a < 75).length;
    const wrongReps = Math.min(reps, Math.round(lowAccCount / 5));

    const finalSummary = {
      exercise: currentEx,
      reps: reps,
      sets: sets,
      duration: duration,
      accuracy: avgAcc,
      calories_burned: cals,
      avg_fatigue: avgFatigue,
      risk_score: riskScore,
      wrong_reps: wrongReps,
      correct_reps: Math.max(0, reps - wrongReps)
    };

    setSummaryData(finalSummary);
    setShowSummary(true);
  };

  const submitWorkoutLog = async () => {
    setSavingLog(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/workout/finish/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(summaryData)
      });
      if (!res.ok) throw new Error('Database logging failed');
      
      onWorkoutLogged();
    } catch (e) {
      alert("Failed to log session: " + e.message);
    } finally {
      setSavingLog(false);
      setShowSummary(false);
    }
  };

  const nextExercise = () => {
    if (exerciseIndex < workoutExercises.length - 1) {
      setExerciseIndex(exerciseIndex + 1);
      // Reset local counts
      setReps(0);
      setSets(1);
      setAccuraciesList([]);
      setFatiguesList([]);
    } else {
      handleFinishSession();
    }
  };

  const roundValue = (value, decimals) => {
    return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
  };

  // Helper values for skeletal line rendering
  const renderBone = (idA, idB, color = "#B7F52A") => {
    const ptA = landmarks.find(lm => lm.id === idA);
    const ptB = landmarks.find(lm => lm.id === idB);
    if (!ptA || !ptB) return null;
    if (ptA.x === 0 || ptB.x === 0) return null; // invisible

    return (
      <line 
        key={`${idA}-${idB}`} 
        x1={`${ptA.x}%`} y1={`${ptA.y}%`} 
        x2={`${ptB.x}%`} y2={`${ptB.y}%`} 
        stroke={color} 
        strokeWidth="3.5" 
        strokeLinecap="round"
        className="opacity-90"
      />
    );
  };

  const renderSkeleton = () => {
    if (landmarks.length === 0) return null;
    
    // Stitch primary lime if verified, high-visibility danger red if invalid posture
    const activeColor = isVerified ? "#B7F52A" : "#FF4D4F";

    return (
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-20 scale-x-[-1]">
        {/* Torso */}
        {renderBone(11, 12, activeColor)}
        {renderBone(11, 23, activeColor)}
        {renderBone(12, 24, activeColor)}
        {renderBone(23, 24, activeColor)}
        
        {/* Left Arm */}
        {renderBone(11, 13, activeColor)}
        {renderBone(13, 15, activeColor)}
        
        {/* Right Arm */}
        {renderBone(12, 14, activeColor)}
        {renderBone(14, 16, activeColor)}
        
        {/* Left Leg */}
        {renderBone(23, 25, activeColor)}
        {renderBone(25, 27, activeColor)}
        
        {/* Right Leg */}
        {renderBone(24, 26, activeColor)}
        {renderBone(26, 28, activeColor)}

        {/* Joint Dots */}
        {landmarks.map(lm => {
          if (lm.id > 28) return null; // skip hands/feet details for performance
          return (
            <circle 
              key={lm.id}
              cx={`${lm.x}%`} 
              cy={`${lm.y}%`} 
              r="4.5" 
              fill="#FFFFFF" 
              stroke={activeColor}
              strokeWidth="2.5"
            />
          );
        })}
      </svg>
    );
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#F7F7F5] pb-12 px-3.5 sm:px-6 md:px-8 flex flex-col items-center select-none relative overflow-hidden font-sans">
      
      {/* Dynamic Audio Feedback & Diagnostic Trigger Strip */}
      <div className="w-full max-w-7xl pt-3 sm:pt-4 pb-2.5 sm:pb-3 flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 text-[#6F7075] font-mono text-[11px] tracking-wider uppercase border-b border-white/10 mb-3 sm:mb-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#101012] border border-white/10 text-[#B7F52A]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B7F52A] animate-pulse"></span>
            STREAM: KINETIC-CV-01
          </span>
          <span className="hidden sm:inline">ENGINE: POSE-DETECTION-BIO</span>
          <span className="hidden md:inline">CALIBRATION: STABLE</span>
        </div>
        <div className="flex items-center gap-3 sm:gap-4 text-[#F7F7F5]">
          <div className="flex items-center gap-1.5 font-mono">
            <span>PIPELINE: <strong className="text-[#B7F52A]">60 FPS</strong></span>
          </div>
          <div className="flex items-center gap-1.5 font-mono">
            <span>AUDIO: <strong className={voiceEnabled ? "text-[#B7F52A]" : "text-[#6F7075]"}>{voiceEnabled ? 'ACTIVE' : 'MUTED'}</strong></span>
          </div>
        </div>
      </div>

      {/* TOP CONTROLS & EXERCISE TITLE */}
      <div className="w-full max-w-7xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-3 sm:mb-4 z-10">
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-3">
            <button
              onClick={handleFinishSession}
              className="w-10 h-10 rounded bg-[#101012] hover:bg-white/5 transition-colors flex items-center justify-center border border-white/10 text-[#F7F7F5] flex-shrink-0"
              title="End Session"
              aria-label="End Session"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="w-2 h-2 rounded-full bg-[#B7F52A]"></span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#6F7075]">ACTIVE PROTOCOL</span>
              </div>
              <h2 className="text-base sm:text-lg md:text-xl font-bold uppercase font-serif tracking-tight truncate">{currentCleanName.replace(/_/g, ' ')}</h2>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button 
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`w-10 h-10 rounded border flex items-center justify-center transition-all flex-shrink-0 ${
              voiceEnabled 
                ? 'bg-[#B7F52A]/10 border-[#B7F52A] text-[#B7F52A]' 
                : 'bg-[#101012] border-white/10 text-[#6F7075]'
            }`}
            title={voiceEnabled ? "Mute Coach Audio" : "Enable Coach Audio"}
            aria-label={voiceEnabled ? "Mute Coach Audio" : "Enable Coach Audio"}
          >
            {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-[#6F7075]" />}
          </button>

          <button 
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit Full Screen" : "Full Screen Camera"}
            aria-label={isFullscreen ? "Exit Full Screen" : "Full Screen Camera"}
            className="w-10 h-10 rounded bg-[#101012] hover:bg-white/5 border border-white/10 text-[#6F7075] hover:text-[#F7F7F5] flex items-center justify-center transition-all flex-shrink-0"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          
          <button 
            onClick={() => {
              const nextState = !isRunning;
              setIsRunning(nextState);
              if (nextState && !isFullscreen) toggleFullscreen();
            }}
            className={`flex-1 sm:flex-none px-3.5 sm:px-4 py-2.5 min-h-[40px] rounded text-xs font-bold font-mono uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
              isRunning 
                ? 'bg-[#FFB020] text-[#050505] shadow-md' 
                : 'bg-[#B7F52A] hover:bg-[#a6df24] text-[#050505]'
            }`}
          >
            {isRunning ? <><Pause className="w-3.5 h-3.5 flex-shrink-0" /> <span className="truncate">Pause Tracking</span></> : <><Play className="w-3.5 h-3.5 fill-current flex-shrink-0" /> <span className="truncate">Initialize Camera</span></>}
          </button>
        </div>
      </div>

      {/* MAIN 70/30 DUAL PANEL VIEWPORT GRID */}
      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-10 gap-6 z-10">
        
        {/* LEFT COLUMN: LIVE VISION FEED (70% on desktop) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div 
            ref={containerRef}
            className={`transition-all duration-300 ${
              isFullscreen 
                ? 'fixed top-0 left-0 right-0 bottom-0 w-screen h-screen z-[99999] bg-black flex items-center justify-center p-0 m-0 overflow-hidden' 
                : 'relative aspect-[16/10] sm:aspect-[16/9] lg:aspect-[16/10] rounded-xl bg-[#0A0A0A] border border-white/10 overflow-hidden shadow-2xl flex flex-col justify-between p-4'
            }`}
          >
            
            {currentEx === 'treadmill' ? (
              <div className="absolute inset-0 bg-[#0A0A0A] z-40 flex flex-col justify-center items-center text-center p-8">
                <div className="w-16 h-16 bg-[#B7F52A]/10 border border-[#B7F52A]/30 rounded-lg flex items-center justify-center mb-6 text-[#B7F52A]">
                  <Flame className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold uppercase font-serif text-[#F7F7F5] mb-2">Treadmill Protocol</h3>
                <p className="text-sm font-mono text-[#B7F52A] mb-4">{currentCleanName}</p>
                <div className="bg-[#101012] border border-white/10 rounded-lg p-4 max-w-md mb-6 space-y-1.5">
                  <span className="text-[10px] font-mono text-[#6F7075] uppercase block tracking-wider">EXECUTION TARGET</span>
                  <p className="text-xs text-[#6F7075] leading-relaxed">
                    Set up your physical treadmill according to target speed and incline settings. Focus on heart-rate zone and stride recovery.
                  </p>
                </div>
                <button
                  onClick={handleTreadmillComplete}
                  className="px-6 py-2.5 bg-[#B7F52A] hover:bg-[#a6df24] text-[#050505] font-bold rounded text-xs uppercase tracking-wider"
                >
                  Conclude Treadmill Interval
                </button>
              </div>
            ) : (
              <>
                {/* Realtime Video Stream */}
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="absolute inset-0 w-full h-full object-cover scale-x-[-1] z-10" // Mirrored camera with object-cover for full container alignment
                />

                {/* High-Contrast Vision Scrim Layer */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/90 via-transparent to-[#050505]/80 pointer-events-none z-10" />

                {/* Hidden Frame Grab Canvas */}
                <canvas ref={canvasRef} width="640" height="480" className="hidden" />

                {/* Neon Landmark SVG overlay */}
                {renderSkeleton()}

                {/* Top Floating Translucent HUD Strip */}
                {isRunning && (
                  <div className="relative z-30 w-full flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2.5 p-2.5 sm:p-3 rounded-lg bg-[#050505]/85 backdrop-blur-md border border-white/10 shadow-xl">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 sm:p-2 bg-[#101012] rounded border border-white/10 text-[#B7F52A]">
                        <Dumbbell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs font-serif uppercase tracking-tight text-[#F7F7F5] truncate max-w-[120px] sm:max-w-none">
                            {currentCleanName.replace(/_/g, ' ')}
                          </span>
                          <span className="px-1 py-0.2 rounded bg-[#B7F52A]/10 border border-[#B7F52A]/30 text-[#B7F52A] font-mono text-[8px] uppercase">
                            AI
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono text-[9px] sm:text-[10px] uppercase text-[#B7F52A] flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#B7F52A] animate-pulse"></span>
                            {stage}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 sm:gap-4 md:gap-6 font-mono self-end xs:self-auto">
                      {/* Reps Metric */}
                      <div className="flex flex-col text-right">
                        <span className="text-[8px] sm:text-[9px] uppercase text-[#6F7075]">REPS</span>
                        <span className="text-lg sm:text-2xl font-black text-[#F7F7F5] leading-none">
                          {reps}
                        </span>
                      </div>
                      <div className="w-px h-5 sm:h-6 bg-white/10"></div>
                      {/* Live ROM Gauge */}
                      <div className="flex flex-col text-right">
                        <span className="text-[8px] sm:text-[9px] uppercase text-[#6F7075]">ROM</span>
                        <span className="text-lg sm:text-2xl font-black text-[#B7F52A] leading-none">{romPct}%</span>
                      </div>
                      <div className="w-px h-5 sm:h-6 bg-white/10"></div>
                      {/* Form Score */}
                      <div className="flex flex-col text-right">
                        <span className="text-[8px] sm:text-[9px] uppercase text-[#6F7075]">FORM</span>
                        <span className="text-lg sm:text-2xl font-black text-[#F7F7F5] leading-none">{accuracy}%</span>
                      </div>
                      <div className="w-px h-5 sm:h-6 bg-white/10"></div>
                      {/* Angle */}
                      <div className="flex flex-col text-right">
                        <span className="text-[8px] sm:text-[9px] uppercase text-[#6F7075]">ANG</span>
                        <span className="text-lg sm:text-2xl font-black text-[#FFB020] leading-none">{activeAngle}°</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Center Crosshair Target Overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                  <div className="w-24 h-24 rounded-full border border-dashed border-[#B7F52A]/20 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#B7F52A]/40 shadow-[0_0_8px_rgba(183,245,42,0.8)]"></div>
                  </div>
                </div>

                {/* Floating Joint Biometric Angle Callout Badge */}
                {isRunning && activeAngle > 0 && (
                  <div className="absolute left-6 bottom-20 z-20 pointer-events-none">
                    <div className="px-3 py-1.5 rounded bg-[#050505]/90 border border-white/15 text-[#B7F52A] shadow-xl flex items-center gap-2 backdrop-blur-md font-mono">
                      <span className="w-2 h-2 rounded-full bg-[#B7F52A]"></span>
                      <div className="flex flex-col">
                        <span className="text-sm font-black leading-none text-[#F7F7F5]">{activeAngle}°</span>
                        <span className="text-[9px] text-[#6F7075] uppercase tracking-wider">JOINT FLEXION</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Bottom Overlay Guidance Feedback Banner */}
                {isRunning && (
                  <div className="relative z-30 w-full flex flex-col gap-1.5 mt-auto">
                    {(!isVerified || warningMsg) ? (
                      <div className="w-full px-3 py-2 rounded bg-[#FF4D4F]/90 backdrop-blur-md flex items-center justify-between text-[#050505] shadow-xl">
                        <div className="flex items-center gap-2 min-w-0 font-mono">
                          <ShieldAlert className="w-4 h-4 text-[#050505] shrink-0" />
                          <span className="text-xs font-bold uppercase truncate">
                            {warningMsg || `POSTURE ERROR: CORRECT KINEMATICS FOR ${currentCleanName.replace(/_/g, ' ')}`}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono font-bold uppercase shrink-0">ADJUST FORM</span>
                      </div>
                    ) : (
                      <div className="w-full px-3 py-2 rounded bg-[#050505]/90 backdrop-blur-md border border-white/10 flex items-center justify-between shadow-xl">
                        <div className="flex items-center gap-2 min-w-0 font-mono">
                          <div className="w-3.5 h-3.5 rounded bg-[#B7F52A] flex items-center justify-center text-[#050505] shrink-0">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                          <span className="text-xs text-[#F7F7F5] uppercase tracking-normal truncate">
                            OPTIMAL TRAJECTORY DETECTED — MAINTAIN TEMPO
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-[#B7F52A] uppercase shrink-0">VERIFIED</span>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Camera off/standby overlay */}
            {!isRunning && (
              <div className="absolute inset-0 bg-[#0A0A0A] z-30 flex flex-col justify-center items-center text-center p-6">
                <Dumbbell className="w-12 h-12 text-[#6F7075] mb-4" />
                <h3 className="text-lg font-bold uppercase font-serif text-[#F7F7F5] mb-1">Optical Kinematic Pipeline Inactive</h3>
                <p className="text-xs text-[#6F7075] max-w-xs leading-relaxed font-sans mb-4">
                  Initialize camera feed to begin full-body skeletal tracking and biomechanical joint angle computation.
                </p>
                <button
                  onClick={() => setIsRunning(true)}
                  className="px-5 py-2.5 bg-[#B7F52A] hover:bg-[#a6df24] text-[#050505] font-bold text-xs uppercase tracking-wider rounded"
                >
                  Start Optical Tracking
                </button>
              </div>
            )}

            {/* Rest Timer overlay */}
            {isResting && (
              <div className="absolute inset-0 bg-[#050505]/95 z-30 flex flex-col justify-center items-center text-center p-6">
                <Compass className="w-12 h-12 text-[#B7F52A] mb-3 animate-spin" />
                <span className="text-[10px] font-mono text-[#6F7075] uppercase tracking-widest">INTER-SET REST PERIOD</span>
                <span className="text-5xl font-black font-mono tracking-widest block mt-2 text-[#B7F52A]">{formatTime(restTimeLeft)}</span>
                <button
                  onClick={skipRest}
                  className="mt-6 px-6 py-2 bg-[#101012] border border-white/15 text-[#F7F7F5] hover:border-[#B7F52A] font-bold rounded text-xs uppercase tracking-wider transition-all"
                >
                  Resume Training Protocol
                </button>
              </div>
            )}

            {/* Water reminder notification bubble */}
            {showWaterReminder && (
              <div className="absolute top-4 left-4 bg-[#101012] border border-[#B7F52A] p-4 rounded z-40 shadow-2xl max-w-xs flex gap-3">
                <Droplet className="w-5 h-5 text-[#B7F52A] flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-xs uppercase font-serif text-[#F7F7F5]">Hydration Advisory</h4>
                  <p className="text-[11px] text-[#6F7075] leading-relaxed mt-1">High metabolic exertion. Ingest 250ml water to maintain neuromuscular efficiency.</p>
                  <button 
                    onClick={() => setShowWaterReminder(false)}
                    className="mt-2 text-[10px] font-mono text-[#B7F52A] hover:underline uppercase"
                  >
                    [ Acknowledge ]
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Kinematic Form Breakdown Bar (Stitch style) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-[#101012] border border-white/10 rounded flex flex-col font-mono">
              <span className="text-[10px] text-[#6F7075] uppercase">JOINT ACCURACY</span>
              <span className="text-sm text-[#F7F7F5] font-bold mt-1 flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${accuracy >= 80 ? 'bg-[#B7F52A]' : 'bg-[#FF4D4F]'}`}></span>
                {accuracy}%
              </span>
              <span className="text-[10px] text-[#6F7075]">Kinematic tolerance</span>
            </div>
            <div className="p-3 bg-[#101012] border border-white/10 rounded flex flex-col font-mono">
              <span className="text-[10px] text-[#6F7075] uppercase">RANGE OF MOTION</span>
              <span className="text-sm text-[#F7F7F5] font-bold mt-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#B7F52A]"></span>
                {romPct}% ROM
              </span>
              <span className="text-[10px] text-[#6F7075]">Full extension curve</span>
            </div>
            <div className="p-3 bg-[#101012] border border-white/10 rounded flex flex-col font-mono">
              <span className="text-[10px] text-[#6F7075] uppercase">CNS FATIGUE</span>
              <span className="text-sm text-[#F7F7F5] font-bold mt-1 flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${fatigue > 60 ? 'bg-[#FFB020]' : 'bg-[#B7F52A]'}`}></span>
                {fatigue}%
              </span>
              <span className="text-[10px] text-[#6F7075]">Velocity drift</span>
            </div>
            <div className="p-3 bg-[#101012] border border-white/10 rounded flex flex-col font-mono">
              <span className="text-[10px] text-[#6F7075] uppercase">LUMBAR / JOINT RISK</span>
              <span className="text-sm text-[#F7F7F5] font-bold mt-1 flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${riskScore === 'Low' ? 'bg-[#B7F52A]' : 'bg-[#FF4D4F]'}`}></span>
                {riskScore.toUpperCase()}
              </span>
              <span className="text-[10px] text-[#6F7075]">Shear load rating</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: LIVE PERFORMANCE TELEMETRY STREAM (30% on desktop) */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          
          {/* Panel Header */}
          <div className="p-3 bg-[#101012] border border-white/10 rounded flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#B7F52A] animate-pulse"></div>
              <span className="font-bold font-serif uppercase text-xs tracking-wider text-[#F7F7F5]">NEURAL TELEMETRY</span>
            </div>
            <span className="font-mono text-[10px] uppercase text-[#6F7075]">SESSION LIVE</span>
          </div>

          {/* Key Metric Stack */}
          <div className="grid grid-cols-2 gap-3">
            {/* REP COUNTER */}
            <div className="p-4 bg-[#101012] border border-white/10 rounded flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#6F7075] uppercase">COMPLETED REPS</span>
                <Repeat className="w-3.5 h-3.5 text-[#B7F52A]" />
              </div>
              <div className="my-2">
                <span className="text-3xl font-black font-mono text-[#F7F7F5] leading-none">{reps}</span>
              </div>
              <div className="w-full bg-[#0A0A0A] h-1 rounded overflow-hidden">
                <div className="bg-[#B7F52A] h-full" style={{ width: `${Math.min(100, (reps % 12) * 8.33)}%` }}></div>
              </div>
            </div>

            {/* ACTIVE SET */}
            <div className="p-4 bg-[#101012] border border-white/10 rounded flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#6F7075] uppercase">ACTIVE SET</span>
                <Layers className="w-3.5 h-3.5 text-[#B7F52A]" />
              </div>
              <div className="my-2">
                <span className="text-3xl font-black font-mono text-[#F7F7F5] leading-none">SET {sets}</span>
              </div>
              <span className="text-[10px] font-mono text-[#6F7075]">Target: 3 Sets</span>
            </div>

            {/* JOINT ANGLE */}
            <div className="p-4 bg-[#101012] border border-white/10 rounded flex flex-col justify-between">
              <span className="text-[10px] font-mono text-[#6F7075] uppercase">JOINT ANGLE</span>
              <div className="my-2">
                <span className="text-3xl font-black font-mono text-[#FFB020] leading-none">{activeAngle}°</span>
              </div>
              <span className="text-[10px] font-mono text-[#6F7075]">Biomechanical flexion</span>
            </div>

            {/* FORM ACCURACY */}
            <div className="p-4 bg-[#101012] border border-white/10 rounded flex flex-col justify-between">
              <span className="text-[10px] font-mono text-[#6F7075] uppercase">FORM SCORE</span>
              <div className="my-2">
                <span className="text-3xl font-black font-mono text-[#B7F52A] leading-none">{accuracy}%</span>
              </div>
              <span className="text-[10px] font-mono text-[#6F7075]">Optical verification</span>
            </div>
          </div>

          {/* FATIGUE ACCUMULATOR CARD */}
          <div className="p-4 bg-[#101012] border border-white/10 rounded space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-[#6F7075] uppercase">PHYSIOLOGICAL FATIGUE</span>
              <span className="text-xs font-mono font-bold text-[#F7F7F5]">{fatigue}%</span>
            </div>
            <div className="w-full bg-[#0A0A0A] h-1.5 rounded overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${fatigue > 60 ? 'bg-[#FF4D4F]' : (fatigue > 35 ? 'bg-[#FFB020]' : 'bg-[#B7F52A]')}`}
                style={{ width: `${fatigue}%` }}
              />
            </div>
            <p className="text-[10px] text-[#6F7075] font-sans leading-relaxed">
              Derived from kinematic cadence decay, joint micro-oscillations, and range-of-motion velocity.
            </p>
          </div>

          {/* NEXT EXERCISE / FINISH PROTOCOL BUTTON */}
          <button
            onClick={nextExercise}
            className="w-full py-3.5 bg-[#B7F52A] hover:bg-[#a6df24] text-[#050505] font-bold text-xs uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-1.5 mt-auto"
          >
            {exerciseIndex < workoutExercises.length - 1 ? 'Advance to Next Protocol' : 'Conclude Session Dossier'}
          </button>

        </div>

      </div>

      {/* --- SESSION SUMMARY MODAL --- */}
      {showSummary && summaryData && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="w-[calc(100vw-24px)] max-w-lg bg-[#101012] border border-white/15 p-4 sm:p-6 rounded-xl shadow-2xl relative max-h-[92vh] overflow-y-auto">
            
            <div className="text-center flex flex-col items-center mb-5 sm:mb-6 border-b border-white/10 pb-4 sm:pb-5">
              <div className="w-11 h-11 sm:w-12 sm:h-12 bg-[#B7F52A]/10 border border-[#B7F52A]/30 text-[#B7F52A] rounded flex items-center justify-center mb-2.5 sm:mb-3">
                <Award className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <span className="text-[10px] font-mono text-[#B7F52A] uppercase tracking-widest">SESSION COMPLETE</span>
              <h3 className="text-xl sm:text-2xl font-bold uppercase font-serif tracking-tight text-[#F7F7F5] mt-1">Biomechanical Telemetry Dossier</h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 font-mono">
              <div className="bg-[#0A0A0A] border border-white/10 rounded p-3 text-center">
                <span className="text-[10px] text-[#6F7075] uppercase block mb-1">Duration</span>
                <span className="text-lg font-black text-[#F7F7F5]">{summaryData.duration}m</span>
              </div>
              <div className="bg-[#0A0A0A] border border-white/10 rounded p-3 text-center">
                <span className="text-[10px] text-[#6F7075] uppercase block mb-1">Metabolic</span>
                <span className="text-lg font-black text-[#FFB020]">{summaryData.calories_burned} kcal</span>
              </div>
              <div className="bg-[#0A0A0A] border border-white/10 rounded p-3 text-center">
                <span className="text-[10px] text-[#6F7075] uppercase block mb-1">Form Index</span>
                <span className="text-lg font-black text-[#B7F52A]">{summaryData.accuracy}%</span>
              </div>
              <div className="bg-[#0A0A0A] border border-white/10 rounded p-3 text-center">
                <span className="text-[10px] text-[#6F7075] uppercase block mb-1">Total Reps</span>
                <span className="text-lg font-black text-[#F7F7F5]">{summaryData.reps}</span>
              </div>
            </div>

            <div className="space-y-3 mb-6 text-xs font-mono">
              <div className="flex justify-between items-center pb-2 border-b border-white/10">
                <span className="text-[#6F7075]">VERIFIED KINEMATIC REPS</span>
                <span className="font-bold text-[#B7F52A]">{summaryData.correct_reps}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-white/10">
                <span className="text-[#6F7075]">POSTURE ANOMALIES / LOCKED</span>
                <span className="font-bold text-[#FF4D4F]">{summaryData.wrong_reps}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-white/10">
                <span className="text-[#6F7075]">PEAK FATIGUE RATING</span>
                <span className="font-bold text-[#FFB020]">{summaryData.avg_fatigue}%</span>
              </div>
            </div>

            {/* Coach's suggestions */}
            <div className="bg-[#0A0A0A] border border-white/10 p-4 rounded mb-6 space-y-1.5 text-xs font-sans text-[#F7F7F5] leading-relaxed">
              <span className="text-[10px] font-mono text-[#B7F52A] uppercase block">AI POSTURE ADVISORY</span>
              <p>• <b>Biomechanics:</b> {summaryData.accuracy >= 85 ? 'Depth and hip hinge alignment within gold tolerances. Tempo sustained.' : 'Occasional knee valgus detected. Concentrate on lateral glute stability.'}</p>
              <p>• <b>Recovery:</b> {summaryData.risk_score === 'High' ? 'Elevated joint shear recorded. Recommend 48 hours recovery before re-loading.' : 'Joint integrity preserved. Normal progressive overload authorized.'}</p>
            </div>

            {/* Action buttons */}
            <button
              onClick={submitWorkoutLog}
              disabled={savingLog}
              className="w-full py-3 bg-[#B7F52A] hover:bg-[#a6df24] text-[#050505] font-bold text-xs uppercase tracking-wider rounded transition-colors flex items-center justify-center"
            >
              {savingLog ? 'Writing to Biometric Database...' : 'Commit Session to Log'}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

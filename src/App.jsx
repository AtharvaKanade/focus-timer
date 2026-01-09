import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Coffee, CloudRain, Waves, Volume2, VolumeX, Ghost, Trophy, X, Calendar, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';

const App = () => {
  // --- State ---
  const [mode, setMode] = useState('focus'); 
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [task, setTask] = useState('');
  
  // Analytics State
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('focus-history');
    return saved ? JSON.parse(saved) : [];
  });

  // Zen Mode
  const [zenMode, setZenMode] = useState(false);

  // Audio State
  const [bgSound, setBgSound] = useState(null); 
  const [isMuted, setIsMuted] = useState(false);

  const [savedFocusTime, setSavedFocusTime] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('25');

  // Refs
  const timerRef = useRef(null);
  const audioAlarmRef = useRef(new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg'));
  
  // --- LOCAL AUDIO SOURCES (Requirement: Files must be in /public folder) ---
  const rainRef = useRef(new Audio('/rain.wav')); 
  const wavesRef = useRef(new Audio('/ocean.wav'));

  // --- Helpers ---
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getTodayDate = () => new Date().toISOString().split('T')[0];

  const calculateStats = () => {
    const totalMinutes = history.reduce((acc, curr) => acc + curr.duration, 0);
    const uniqueDates = [...new Set(history.map(s => s.date))].sort().reverse();
    let streak = 0;
    let today = getTodayDate();

    // Basic streak calculation logic
    for (let i = 0; i < uniqueDates.length; i++) {
        const d1 = new Date(uniqueDates[i]);
        const d2 = new Date();
        d2.setDate(d2.getDate() - streak); 
        
        if (d1.toISOString().split('T')[0] === getTodayDate()) {
            streak = 1; 
        } else if (streak > 0) {
             const prevDate = new Date(uniqueDates[i-1]);
             const diffTime = Math.abs(prevDate - d1);
             const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
             if (diffDays === 1) streak++;
             else break;
        } else if (i === 0) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            if (d1.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0]) {
                streak = 1;
            } else break;
        }
    }
    return { totalMinutes, streak, sessions: history.length };
  };

  const stats = calculateStats();

  const triggerCelebration = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#22c55e', '#ffffff', '#e4e4e7']
    });
  };

  // --- Effects ---

  // 1. Persist History
  useEffect(() => {
    localStorage.setItem('focus-history', JSON.stringify(history));
  }, [history]);

  // 2. Manage Background Sounds
  useEffect(() => {
    rainRef.current.loop = true;
    wavesRef.current.loop = true;
    rainRef.current.volume = 0.5; 
    wavesRef.current.volume = 0.8; 

    rainRef.current.pause();
    wavesRef.current.pause();

    if (bgSound && isRunning && !isMuted) {
      const audio = bgSound === 'rain' ? rainRef.current : wavesRef.current;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => console.error("Audio playback failed (Check file paths):", error));
      }
    }
  }, [bgSound, isRunning, isMuted]);

  // 3. Timer Logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      handleTimerComplete();
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning, timeLeft]);

  // 4. Tab Title
  useEffect(() => {
    document.title = `${formatTime(timeLeft)} - ${mode === 'focus' ? 'Focus' : 'Break'}`;
  }, [timeLeft, mode]);

  // 5. Keyboard Shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.code === 'Space' && !isEditing && document.activeElement.tagName !== 'INPUT') {
        e.preventDefault(); 
        setIsRunning(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isEditing]);

  // --- Logic Handlers ---
  const handleTimerComplete = () => {
    audioAlarmRef.current.play();
    
    if (mode === 'break') {
      setMode('focus');
      setTimeLeft(savedFocusTime || 25 * 60); 
      setSavedFocusTime(null);
      setIsRunning(true); 
      setZenMode(false); 
      if (Notification.permission === "granted") new Notification("Break over!", { body: "Time to lock in." });
    } else {
      setIsRunning(false);
      triggerCelebration();
      
      const originalDuration = parseInt(editValue) || 25; 
      const newSession = {
        id: Date.now(),
        date: getTodayDate(),
        duration: originalDuration,
        task: task || "Deep Focus",
      };
      
      setHistory(prev => [newSession, ...prev]);
      if (Notification.permission === "granted") new Notification("Session Complete!", { body: "Great work." });
    }
  };

  const startBreak = () => {
    setIsRunning(false); 
    setSavedFocusTime(timeLeft); 
    setMode('break');
    setZenMode(false);
    setTimeLeft(5 * 60); 
    setIsRunning(true); 
  };

  const handleTimeEdit = () => {
    if (mode === 'focus' && !isRunning) {
      setIsEditing(true);
      setEditValue(Math.floor(timeLeft / 60).toString());
    }
  };

  const saveTimeEdit = () => {
    setIsEditing(false);
    const newMinutes = parseInt(editValue);
    if (!isNaN(newMinutes) && newMinutes > 0) {
      setTimeLeft(newMinutes * 60);
    } else {
      setEditValue(Math.floor(timeLeft / 60).toString());
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') saveTimeEdit();
  };

  const resetTimer = () => {
    setIsRunning(false);
    setMode('focus');
    setSavedFocusTime(null);
    setTimeLeft(25 * 60); 
  };

  // --- Render ---
  return (
    <div className={`min-h-screen bg-zinc-900 text-zinc-100 flex flex-col items-center justify-center transition-colors duration-500 font-sans`}>
      
      {/* Analytics Toggle */}
      <div className={`absolute top-8 left-8 transition-opacity duration-500 ${zenMode && isRunning ? 'opacity-0' : 'opacity-100'}`}>
        <button 
          onClick={() => setShowAnalytics(true)}
          className="p-3 text-zinc-600 hover:text-yellow-500 transition-colors"
          title="View Progress"
        >
          <Trophy size={20} />
        </button>
      </div>

      {/* Zen Mode Toggle */}
      {mode === 'focus' && (
        <div className="absolute top-8 right-8 animate-in fade-in duration-500">
          <button 
            onClick={() => setZenMode(!zenMode)}
            className={`p-3 rounded-full transition-all duration-300 ${zenMode ? 'bg-zinc-100 text-zinc-900 shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'text-zinc-600 hover:text-zinc-300'}`}
            title="Zen Mode"
          >
            <Ghost size={20} />
          </button>
        </div>
      )}

      {/* ANALYTICS MODAL */}
      {showAnalytics && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
            <button 
              onClick={() => setShowAnalytics(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300"
            >
              <X size={20} />
            </button>
            
            <h2 className="text-xl font-bold text-zinc-100 mb-6 flex items-center gap-2">
              <Trophy className="text-yellow-500" size={24} /> 
              Daily Grind
            </h2>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-zinc-800/50 p-4 rounded-xl text-center">
                <div className="text-2xl font-bold text-white mb-1">{stats.totalMinutes}</div>
                <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Focus XP</div>
              </div>
              <div className="bg-zinc-800/50 p-4 rounded-xl text-center">
                <div className="text-2xl font-bold text-green-400 mb-1">{stats.streak}</div>
                <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Day Streak</div>
              </div>
              <div className="bg-zinc-800/50 p-4 rounded-xl text-center">
                <div className="text-2xl font-bold text-blue-400 mb-1">{stats.sessions}</div>
                <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Sessions</div>
              </div>
            </div>

            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Recent History</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {history.length === 0 ? (
                <div className="text-zinc-600 text-center py-8 text-sm">No sessions yet. Time to work!</div>
              ) : (
                history.map((session) => (
                  <div key={session.id} className="flex justify-between items-center bg-zinc-800/30 p-3 rounded-lg border border-zinc-800/50">
                    <div className="flex flex-col">
                      <span className="text-zinc-200 font-medium text-sm">{session.task}</span>
                      <div className="flex items-center gap-2 text-xs text-zinc-500 mt-1">
                        <Calendar size={10} /> {session.date}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-zinc-400 text-sm font-mono">
                      <Clock size={12} /> {session.duration}m
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <div className="w-full max-w-md px-6 flex flex-col items-center space-y-10">
        
        {/* Status Badge */}
        <div className={`transition-opacity duration-500 ${zenMode && isRunning ? 'opacity-0' : 'opacity-100'}`}>
          <div className={`px-4 py-1 rounded-full text-xs font-semibold tracking-widest uppercase ${mode === 'break' ? 'bg-green-900 text-green-200' : 'bg-zinc-800 text-zinc-400'}`}>
            {mode === 'break' ? 'Recharging' : 'Focus Mode'}
          </div>
        </div>

        {/* Timer Display */}
        <div className="text-center relative group">
          {isEditing ? (
            <div className="flex items-center justify-center">
              <input 
                autoFocus
                type="number"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={saveTimeEdit}
                onKeyDown={handleKeyDown}
                className="text-[8rem] leading-none font-light tracking-tight font-mono bg-transparent text-center w-full focus:outline-none border-b-2 border-zinc-700 text-zinc-100"
              />
            </div>
          ) : (
            <div 
              onClick={handleTimeEdit}
              className={`text-[8rem] leading-none font-light tracking-tight font-mono tabular-nums cursor-pointer select-none transition-opacity ${isRunning ? 'opacity-100' : 'opacity-80 hover:opacity-100'}`}
              title={!isRunning ? "Click to edit" : ""}
            >
              {formatTime(timeLeft)}
            </div>
          )}
          
          <div className={`mt-6 h-8 flex justify-center items-center transition-all duration-700 ${zenMode && isRunning ? 'opacity-30 blur-[1px]' : 'opacity-100'}`}>
             {isRunning ? (
               <span className="text-lg tracking-wide text-zinc-400 animate-pulse">{task || "Focusing..."}</span>
             ) : (
               <input 
                 type="text" 
                 placeholder="What is your focus?" 
                 className="bg-transparent text-center border-b border-zinc-800 text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 pb-1 w-64 text-lg transition-all"
                 value={task}
                 onChange={(e) => setTask(e.target.value)}
               />
             )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-6">
          {!isRunning && mode === 'focus' && timeLeft !== 25*60 && !zenMode && (
             <button onClick={resetTimer} className="p-4 text-zinc-500 hover:text-zinc-300 transition-all animate-in fade-in zoom-in">
                <RotateCcw size={24} />
             </button>
          )}

          <button 
            onClick={() => setIsRunning(!isRunning)}
            className={`bg-zinc-200 text-zinc-900 rounded-3xl hover:bg-white hover:scale-105 transition-all shadow-lg active:scale-95 ${zenMode && isRunning ? 'p-8 scale-110' : 'p-6'}`}
          >
            {isRunning ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1"/>}
          </button>
        </div>

        {/* Break Button */}
        <div className={`transition-all duration-500 ${zenMode && isRunning ? 'opacity-0 translate-y-4 pointer-events-none' : 'opacity-100 translate-y-0'}`}>
          {mode === 'focus' && (isRunning || timeLeft < 25*60) && (
            <button 
              onClick={startBreak}
              className="flex items-center space-x-2 text-zinc-500 hover:text-green-400 transition-colors mt-4 py-2 px-4 rounded-full hover:bg-zinc-800/50"
            >
              <Coffee size={18} />
              <span>Take a 5min Break</span>
            </button>
          )}
        </div>

        {/* Skip Break */}
        {mode === 'break' && (
           <button onClick={handleTimerComplete} className="text-zinc-500 hover:text-zinc-300 text-sm mt-4">
             Skip Break & Resume
           </button>
        )}

        {/* Shortcuts Hint */}
        <div className={`absolute bottom-6 text-zinc-700 text-xs transition-opacity ${zenMode ? 'opacity-0' : 'opacity-100'}`}>
          Press <span className="font-mono bg-zinc-800 px-1 rounded">Space</span> to Start/Pause
        </div>

        {/* Sound Controls */}
        <div className={`fixed bottom-8 left-8 flex flex-col space-y-2 transition-opacity duration-500 ${zenMode && isRunning ? 'opacity-0 hover:opacity-100' : 'opacity-100'}`}>
          <button onClick={() => setIsMuted(!isMuted)} className="p-2 text-zinc-600 hover:text-zinc-300">
            {isMuted ? <VolumeX size={20}/> : <Volume2 size={20}/>}
          </button>

          {!isMuted && (
            <div className="flex flex-col space-y-2 animate-in slide-in-from-bottom-2 fade-in">
              <button 
                onClick={() => setBgSound(bgSound === 'rain' ? null : 'rain')}
                className={`p-2 rounded-full transition-all ${bgSound === 'rain' ? 'bg-blue-500/20 text-blue-400' : 'text-zinc-600 hover:text-zinc-400'}`}
                title="Rain Sounds"
              >
                <CloudRain size={20} />
              </button>
              <button 
                onClick={() => setBgSound(bgSound === 'waves' ? null : 'waves')}
                className={`p-2 rounded-full transition-all ${bgSound === 'waves' ? 'bg-cyan-500/20 text-cyan-400' : 'text-zinc-600 hover:text-zinc-400'}`}
                title="Ocean Waves"
              >
                <Waves size={20} />
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default App;
import React, { useEffect } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import useTimerStore from '../../store/useTimerStore';
import Button from './Button';
import Container from './Container';

const UIOverlay = () => {
    const {
        timeLeft,
        isRunning,
        toggleTimer,
        resetTimer,
        tick,
        setDistracted,
        gardenHealth,
        mode,
        setDuration
    } = useTimerStore();

    // Local state for editing
    const [isEditing, setIsEditing] = React.useState(false);
    const [editValue, setEditValue] = React.useState('25');

    // --- Helpers ---
    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleTimeClick = () => {
        if (!isRunning) {
            setIsEditing(true);
            setEditValue(Math.floor(timeLeft / 60).toString());
        }
    };

    const handleTimeSave = () => {
        setIsEditing(false);
        const val = parseInt(editValue);
        if (!isNaN(val) && val > 0) {
            setDuration(val);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleTimeSave();
    };

    // --- Effects ---

    // 1. Timer Loop
    useEffect(() => {
        let interval = null;
        if (isRunning) {
            interval = setInterval(tick, 1000);
        }
        return () => clearInterval(interval);
    }, [isRunning, tick]);

    // 2. Distraction Detection (Window Blur)
    useEffect(() => {
        const handleBlur = () => {
            if (isRunning && mode === 'focus') {
                setDistracted(true);
                console.log("User distracted! Garden withering...");
            }
        };

        const handleFocus = () => {
            setDistracted(false);
            console.log("User returned. Healing...");
        };

        window.addEventListener('blur', handleBlur);
        window.addEventListener('focus', handleFocus);

        return () => {
            window.removeEventListener('blur', handleBlur);
            window.removeEventListener('focus', handleFocus);
        };
    }, [isRunning, mode, setDistracted]);

    return (
        <div className="absolute inset-0 z-10 w-full h-full pointer-events-none flex flex-col justify-between p-8 md:p-12">

            {/* Top Section: Header & Timer */}
            <div className="flex flex-col items-center w-full pointer-events-auto transition-all duration-500 hover:opacity-100">
                {/* Small Header */}
                <div className="text-center mb-8 opacity-60 hover:opacity-100 transition-opacity">
                    <h1 className="text-sm font-light tracking-[0.2em] text-sage-200 uppercase">Deep Work Garden</h1>
                    <div className="mt-1 text-[10px] font-mono text-sage-400">
                        Health: {Math.round(gardenHealth)}%
                        {gardenHealth < 100 && <span className="text-terra-400 ml-2 animate-pulse">Withering...</span>}
                    </div>
                </div>

                {/* Timer (Now at top) */}
                <div className="relative z-20">
                    {isEditing ? (
                        <input
                            autoFocus
                            type="number"
                            min="1"
                            max="180"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={handleTimeSave}
                            onKeyDown={handleKeyDown}
                            className="text-6xl md:text-8xl font-light tracking-tighter text-sage-50 bg-transparent text-center focus:outline-none w-full max-w-lg border-b border-sage-500/30 font-mono"
                        />
                    ) : (
                        <div
                            onClick={handleTimeClick}
                            className={`text-6xl md:text-8xl font-light tracking-tighter text-sage-50 tabular-nums transition-all duration-500 cursor-pointer hover:scale-105 select-none font-mono ${gardenHealth < 50 ? 'opacity-50 blur-[1px]' : ''} ${!isRunning ? 'hover:text-gold-300' : ''}`}
                            title={!isRunning ? "Click to edit duration" : ""}
                        >
                            {formatTime(timeLeft)}
                        </div>
                    )}
                </div>
            </div>

            {/* Middle is now EMPTY for the plant */}

            {/* Bottom Section: Controls & Footer */}
            <div className="flex flex-col items-center pointer-events-auto">
                <div className="flex gap-6 mb-8">
                    <Button onClick={toggleTimer} variant="primary" className="min-w-[160px] h-14 text-lg shadow-lg shadow-moss-900/50">
                        {isRunning ? (
                            <><Pause size={24} className="mr-3" /> Pause</>
                        ) : (
                            <><Play size={24} className="mr-3" /> Focus</>
                        )}
                    </Button>

                    {!isRunning && timeLeft !== 25 * 60 && (
                        <Button onClick={resetTimer} variant="ghost" className="px-6 h-14 hover:bg-white/10">
                            <RotateCcw size={24} />
                        </Button>
                    )}
                </div>

                <div className="text-center text-sage-500 text-xs font-light tracking-wide uppercase opacity-70">
                    {isRunning ? "Grow your mind" : "Tap to Start"}
                </div>
            </div>
        </div>
    );
};

export default UIOverlay;

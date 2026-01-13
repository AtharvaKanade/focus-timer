import React, { useEffect, useRef, useState } from 'react';
import useTimerStore from '../../store/useTimerStore';
import { Volume2, VolumeX } from 'lucide-react';

const AmbientSound = () => {
    const { isRunning, mode } = useTimerStore();
    const [muted, setMuted] = useState(false);
    const audioContextRef = useRef(null);
    const oscRef = useRef(null);
    const rainRef = useRef(new Audio('/rain.wav'));

    useEffect(() => {
        rainRef.current.loop = true;
        rainRef.current.volume = 0.3;
    }, []);

    const startGenerativeDrone = () => {
        if (audioContextRef.current) return;

        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioContext();
        audioContextRef.current = ctx;

        // Create a simple drone (Sine wave + Reverb simulation roughly)
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(110, ctx.currentTime); // A2

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 2); // Fade in

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();

        oscRef.current = { osc, gain };
    };

    const stopGenerativeDrone = () => {
        if (oscRef.current && audioContextRef.current) {
            const { gain, osc } = oscRef.current;
            gain.gain.exponentialRampToValueAtTime(0.001, audioContextRef.current.currentTime + 2);
            osc.stop(audioContextRef.current.currentTime + 2);
            oscRef.current = null;
            audioContextRef.current = null;
        }
    };

    useEffect(() => {
        if (isRunning && !muted) {
            // Play Rain
            rainRef.current.play().catch(e => console.log("Audio play failed:", e));

            // Start Drone
            startGenerativeDrone();

        } else {
            // Pause Rain
            rainRef.current.pause();

            // Stop Drone
            stopGenerativeDrone();
        }

        return () => {
            stopGenerativeDrone();
            rainRef.current.pause();
        };
    }, [isRunning, muted]);

    return (
        <button
            onClick={() => setMuted(!muted)}
            className="fixed bottom-8 left-8 z-50 p-3 rounded-full bg-moss-800/50 hover:bg-moss-700/50 text-sage-300 backdrop-blur-md transition-all"
        >
            {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
    );
};

export default AmbientSound;

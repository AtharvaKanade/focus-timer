import { create } from 'zustand';

const useTimerStore = create((set, get) => ({
    // --- Timer State ---
    timeLeft: 25 * 60,
    initialTime: 25 * 60,
    isRunning: false,
    mode: 'focus', // 'focus' | 'short-break' | 'long-break'

    // --- Garden State ---
    gardenHealth: 100, // 0 to 100. < 100 means withering.
    plantGrowth: 0, // 0 to 100. Progress of the current session.
    isDistracted: false,

    // --- Actions ---
    toggleTimer: () => set((state) => ({ isRunning: !state.isRunning })),

    setMode: (newMode) => {
        let time = 25 * 60;
        if (newMode === 'short-break') time = 5 * 60;
        if (newMode === 'long-break') time = 15 * 60;

        set({
            mode: newMode,
            timeLeft: time,
            initialTime: time,
            isRunning: false,
            plantGrowth: 0 // Reset growth on new session
        });
    },

    resetTimer: () => {
        const { initialTime } = get();
        set({ timeLeft: initialTime, isRunning: false, plantGrowth: 0, gardenHealth: 100 });
    },

    setDuration: (minutes) => {
        const time = minutes * 60;
        set({
            initialTime: time,
            timeLeft: time,
            plantGrowth: 0,
            isRunning: false,
            gardenHealth: 100
        });
    },

    tick: () => {
        const { timeLeft, isRunning, mode, initialTime, gardenHealth, isDistracted } = get();

        if (!isRunning) return;

        if (timeLeft > 0) {
            // Calculate growth progress (inverse of time left)
            // We only grow in focus mode
            let newGrowth = 0;
            if (mode === 'focus') {
                const elapsed = initialTime - (timeLeft - 1);
                newGrowth = (elapsed / initialTime) * 100;
            }

            // Handle Wither logic
            let newHealth = gardenHealth;
            if (isDistracted) {
                newHealth = Math.max(0, gardenHealth - 0.5); // Decay fast if distracted
            } else {
                newHealth = Math.min(100, gardenHealth + 0.2); // Recover slowly if focused
            }

            set({
                timeLeft: timeLeft - 1,
                plantGrowth: newGrowth,
                gardenHealth: newHealth
            });
        } else {
            // Timer finished
            set({ isRunning: false, plantGrowth: 100 });
            // Play sound? (Handled in UI component usually)
        }
    },

    setDistracted: (status) => set({ isDistracted: status }),
}));

export default useTimerStore;

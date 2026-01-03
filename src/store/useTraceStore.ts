import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { isBefore, isAfter, areIntervalsOverlapping, addMinutes } from 'date-fns';

export type TaskStatus = 'active' | 'trace' | 'void';

export type Category = 'Study' | 'Project' | 'Workout' | 'Entertainment' | 'Touch the Grass';

export interface Task {
    id: string;
    name: string;
    category: Category;
    startTime: string; // ISO String
    durationMinutes: number;
    status: TaskStatus;
    photoId?: string; // Key in IndexedDB
}

import { getNow } from '../utils/timeUtils';

export interface TraceStore {
    tasks: Task[];
    stabilityScore: number;
    goals: Record<Category, number>;

    addTask: (name: string, category: Category, startTime: string, durationMinutes: number) => void;
    markAsTrace: (id: string) => void;
    checkDrift: () => void; // Call periodically
    deleteTask: (id: string) => void;
    updateTask: (id: string, name: string, category: Category, startTime: string, durationMinutes: number) => void;
    setGoal: (category: Category, hours: number) => void;
    clearAllTasks: () => void;
}

export const useTraceStore = create<TraceStore>()(
    persist(
        (set, get) => ({
            tasks: [],
            stabilityScore: 100,

            addTask: (name, category, startTime, durationMinutes) => {
                const now = getNow();
                const start = new Date(startTime); // Input is Plain ISO (e.g., T10:00)
                const end = addMinutes(start, durationMinutes);

                // 1. No-Past-Scheduling Rule
                // Allow a small buffer (e.g., 1 min) for UI latency, but generally strict
                if (isBefore(start, addMinutes(now, -1))) {
                    throw new Error("Cannot change the past. Move forward.");
                }

                const currentTasks = get().tasks;

                // 2. No-Overlap Lock Rule
                const hasOverlap = currentTasks.some(t => {
                    if (t.status === 'void') return false;

                    const tStart = new Date(t.startTime);
                    const tEnd = addMinutes(tStart, t.durationMinutes);
                    return areIntervalsOverlapping(
                        { start, end },
                        { start: tStart, end: tEnd }
                    );
                });

                if (hasOverlap) {
                    throw new Error("Matter Occupied. No-Overlap Lock active.");
                }

                const newTask: Task = {
                    id: crypto.randomUUID(),
                    name,
                    category,
                    startTime,
                    durationMinutes,
                    status: 'active'
                };

                set({ tasks: [...currentTasks, newTask].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()) });
            },

            markAsTrace: (id) => {
                set(state => ({
                    tasks: state.tasks.map(t => t.id === id ? { ...t, status: 'trace', photoId: id } : t)
                }));
            },

            checkDrift: () => {
                const now = getNow();
                set(state => {
                    let hasChanges = false;
                    const newTasks = state.tasks.map(t => {
                        if (t.status === 'active') {
                            const end = addMinutes(new Date(t.startTime), t.durationMinutes);
                            // If NOW is after EndTime, and no photo -> VOID
                            if (isAfter(now, end)) {
                                hasChanges = true;
                                return { ...t, status: 'void' as TaskStatus };
                            }
                        }
                        return t;
                    });

                    if (!hasChanges) return state;

                    // Calc Stability Score
                    // Hours Traced vs Hours Voided
                    // Simple formula: (Traced / (Traced + Voided)) * 100
                    const tracedMins = newTasks.filter(t => t.status === 'trace').reduce((acc, t) => acc + t.durationMinutes, 0);
                    const voidedMins = newTasks.filter(t => t.status === 'void').reduce((acc, t) => acc + t.durationMinutes, 0);
                    const total = tracedMins + voidedMins;
                    const score = total === 0 ? 100 : Math.round((tracedMins / total) * 100);

                    return { tasks: newTasks, stabilityScore: score };
                });
            },

            deleteTask: (id) => {
                set(state => ({ tasks: state.tasks.filter(t => t.id !== id) }));
            },

            updateTask: (id, name, category, startTime, durationMinutes) => {
                set(state => {
                    const currentTask = state.tasks.find(t => t.id === id);
                    if (!currentTask) return state;

                    const start = new Date(startTime);
                    // Check Overlaps (excluding self)
                    const otherTasks = state.tasks.filter(t => t.id !== id);

                    const end = addMinutes(start, durationMinutes);
                    const hasOverlap = otherTasks.some(t => {
                        // If checking overlap against void? same rules.
                        const tStart = new Date(t.startTime);
                        const tEnd = addMinutes(tStart, t.durationMinutes);
                        return areIntervalsOverlapping(
                            { start, end },
                            { start: tStart, end: tEnd }
                        );
                    });

                    if (hasOverlap) {
                        throw new Error("Matter Occupied. No-Overlap Lock active.");
                    }

                    // If time changed, and it was 'void', do we reset to 'active'? 
                    // Or if it was 'trace', do we keep it 'trace'?
                    // For now, keep status unless it moves to future? 
                    // Let's just update fields. User can delete and re-add if they want to reset status logic deeply.
                    // But if I move a 'void' task to future, it should probably be 'active' again so I can do it?
                    // Let's simple update properties for now. Status reset logic is complex.
                    // Actually, if I change time, 'No-Past' rule from addTask might apply? 
                    // User asked just to edit.

                    return {
                        tasks: state.tasks.map(t => t.id === id ? { ...t, name, category, startTime, durationMinutes } : t)
                            .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                    };
                });
            },

            goals: {} as Record<Category, number>, // Default empty

            // ... (existing actions)

            setGoal: (category, hours) => {
                set(state => ({
                    goals: { ...state.goals, [category]: hours }
                }));
            },

            clearAllTasks: () => {
                set({ tasks: [], stabilityScore: 100, goals: {} as Record<Category, number> });
            }
        }),
        {
            name: 'trace-storage',
            storage: createJSONStorage(() => localStorage), // Persist tasks to LS
        }
    )
);

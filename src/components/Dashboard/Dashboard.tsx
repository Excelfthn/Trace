import { useMemo, useState } from 'react';
import { useTraceStore, Category } from '../../store/useTraceStore';
import { RadialProgress } from './RadialProgress';
import { startOfMonth, endOfMonth, isWithinInterval, format } from 'date-fns';
import { motion } from 'framer-motion';
import { Settings } from 'lucide-react';

export const Dashboard = () => {
    const goals = useTraceStore(state => state.goals);
    const setGoal = useTraceStore(state => state.setGoal);
    const tasks = useTraceStore(state => state.tasks);
    const [isEditingGoals, setIsEditingGoals] = useState(false);

    // Calculate Monthly Stats
    const stats = useMemo(() => {
        const now = new Date();
        const start = startOfMonth(now);
        const end = endOfMonth(now);

        const monthlyTasks = tasks.filter(t =>
            t.status === 'trace' &&
            isWithinInterval(new Date(t.startTime), { start, end })
        );

        const totalTasks = monthlyTasks.length;
        const totalMinutes = monthlyTasks.reduce((acc, t) => acc + t.durationMinutes, 0);
        const totalHours = Math.floor(totalMinutes / 60);

        // Category Breakdown
        const categories: Category[] = ['Study', 'Project', 'Workout', 'Entertainment', 'Touch the Grass'];
        const categoryStats = categories.map(cat => {
            const catTasks = monthlyTasks.filter(t => t.category === cat);
            const count = catTasks.length;
            const minutes = catTasks.reduce((acc, t) => acc + t.durationMinutes, 0);

            // Goal Logic
            const goalHours = goals[cat] || 0;
            const currentHours = minutes / 60;

            // Percentage: If goal set, % of goal. If no goal, 0 for now (or maybe just show filled for fun? No, 0 is safer).
            // Actually, if no goal, let's just default to 100% full or 0? 
            // User requested "set my time goals". So usually empty if no goal.
            let percentage = 0;
            if (goalHours > 0) {
                percentage = Math.min((currentHours / goalHours) * 100, 100);
            }

            return {
                category: cat,
                count,
                minutes,
                hours: currentHours,
                goalHours,
                percentage
            };
        });

        return {
            totalTasks,
            totalHours,
            totalMinutes,
            categoryStats
        };
    }, [tasks, goals]);

    return (
        <div className="p-6 space-y-10 pb-24 animate-in fade-in duration-500">
            {/* Header Stats */}
            <div className="text-center space-y-2">
                <div className="flex justify-between items-start mb-4">
                    <div className="w-8"></div> {/* Spacer */}
                    <div>
                        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">
                            GRAVITY REPORT
                        </h1>
                        <p className="text-gray-500 font-mono text-sm uppercase tracking-widest">
                            Current Orbit ({format(new Date(), 'MMMM yyyy')})
                        </p>
                    </div>
                    <button
                        onClick={() => setIsEditingGoals(!isEditingGoals)}
                        className={`p-2 rounded-full transition-colors ${isEditingGoals ? 'bg-gap-neon text-black' : 'text-gray-600 hover:text-white'}`}
                    >
                        <Settings size={20} />
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-8">
                    <div className="bg-monster-surface border border-gray-800 p-4 rounded-xl">
                        <div className="text-3xl font-black text-white">{stats.totalTasks}</div>
                        <div className="text-[10px] font-bold text-gray-500 uppercase">Traces Secured</div>
                    </div>
                    <div className="bg-monster-surface border border-gray-800 p-4 rounded-xl">
                        <div className="text-3xl font-black text-gap-neon">{stats.totalHours}<span className="text-sm text-gray-500 ml-1">h</span></div>
                        <div className="text-[10px] font-bold text-gray-500 uppercase">Time Dilation</div>
                    </div>
                </div>
            </div>

            {/* Radial Charts Grid */}
            <div>
                <h2 className="text-sm font-bold text-gray-400 mb-8 uppercase tracking-wider border-b border-gray-800 pb-2 flex justify-between items-center">
                    <span>Spectrum Analysis</span>
                    {isEditingGoals && <span className="text-gap-neon text-xs animate-pulse">SET MONTHLY TARGETS (HOURS)</span>}
                </h2>
                <div className="grid grid-cols-2 gap-y-14 place-items-center mt-6">
                    {stats.categoryStats.map((cat, i) => (
                        <div key={cat.category} className="flex flex-col items-center gap-2">
                            {isEditingGoals ? (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="w-[120px] h-[120px] rounded-full border-2 border-dashed border-gray-700 flex flex-col items-center justify-center bg-black/50"
                                >
                                    <div className="text-[10px] text-gray-500 mb-1 uppercase tracking-widest">{cat.category}</div>
                                    <div className="flex items-baseline gap-1">
                                        <input
                                            type="number"
                                            value={cat.goalHours || ''} // Show empty if 0 for cleaner UX?
                                            onChange={(e) => setGoal(cat.category as Category, Number(e.target.value))}
                                            placeholder="0"
                                            className="w-16 bg-transparent text-center text-3xl font-black text-gap-neon focus:outline-none placeholder-gray-800"
                                        />
                                        <span className="text-xs font-bold text-gray-500">h</span>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.1 }}
                                >
                                    <RadialProgress
                                        percentage={cat.percentage}
                                        label={cat.category}
                                        // Show: "Current / Goal" if goal set, else just "Current"
                                        centerText={cat.goalHours > 0
                                            ? `${cat.hours.toFixed(1)}/${cat.goalHours}h`
                                            : `${cat.hours.toFixed(1)}h`
                                        }
                                        color={
                                            cat.category === 'Study' ? '#00F0FF' :
                                                cat.category === 'Project' ? '#FFDD00' :
                                                    cat.category === 'Workout' ? '#FF0033' :
                                                        cat.category === 'Entertainment' ? '#B026FF' :
                                                            '#00FF99' // Touch the Grass
                                        }
                                    />
                                </motion.div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

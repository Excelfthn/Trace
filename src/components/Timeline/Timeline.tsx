import { useEffect, useState } from 'react';
import { useTraceStore, Task } from '../../store/useTraceStore';
import { TaskItem } from './TaskItem';
import { GapItem } from './GapItem';
import { format, addMinutes, startOfDay, endOfDay } from 'date-fns';
import { ChevronDown } from 'lucide-react';
import clsx from 'clsx';

interface TimelineProps {
    onTaskClick: (task: Task) => void;
    onGapClick: (startTime: Date) => void;
}

export const Timeline = ({ onTaskClick, onGapClick }: TimelineProps) => {
    const { tasks, checkDrift } = useTraceStore();

    useEffect(() => {
        // Check for drift every minute
        const interval = setInterval(checkDrift, 60000);
        checkDrift(); // Check on mount
        return () => clearInterval(interval);
    }, [checkDrift]);

    // Group tasks by date
    // Sort all tasks first
    const sortedTasks = [...tasks].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

    const tasksByDate: { [key: string]: Task[] } = {};
    sortedTasks.forEach(task => {
        const dateKey = format(new Date(task.startTime), 'yyyy-MM-dd');
        if (!tasksByDate[dateKey]) tasksByDate[dateKey] = [];
        tasksByDate[dateKey].push(task);
    });

    const sortedDates = Object.keys(tasksByDate).sort();

    // If no tasks, show empty state or just a gap for today?
    // User wants "separated based on dates". 
    // If empty, let's just show "No Traces yet".

    // We should probably force render "Today" even if empty, so user can add tasks?
    // Current "New Trace" button uses Today as default.
    // Let's just render the groups that exist. If strictly empty, show generic message.

    const [collapsedDates, setCollapsedDates] = useState<Record<string, boolean>>({});

    const toggleDate = (date: string) => {
        setCollapsedDates(prev => ({
            ...prev,
            [date]: !prev[date]
        }));
    };

    return (
        <div className="space-y-8 pb-24">
            {sortedDates.length === 0 ? (
                <div className="text-center text-gray-500 py-10">
                    No Traces yet. Start by adding one below.
                </div>
            ) : (
                sortedDates.map(dateStr => {
                    const dateObj = new Date(dateStr + 'T00:00:00'); // Local time
                    const dayTasks = tasksByDate[dateStr];
                    const isCollapsed = collapsedDates[dateStr];

                    // Render logic for this specific day
                    const dayElements = [];

                    if (!isCollapsed) {
                        let currentTime = startOfDay(dateObj);
                        const dayEnd = endOfDay(dateObj);

                        for (const task of dayTasks) {
                            const taskStart = new Date(task.startTime);
                            const taskEnd = addMinutes(taskStart, task.durationMinutes);

                            if (taskStart > currentTime) {
                                dayElements.push(
                                    <GapItem
                                        key={`gap-${dateStr}-${currentTime.toISOString()}`}
                                        start={currentTime}
                                        end={taskStart}
                                        onClick={() => onGapClick(currentTime)}
                                    />
                                );
                            }

                            dayElements.push(
                                <TaskItem
                                    key={task.id}
                                    task={task}
                                    onInteract={onTaskClick}
                                />
                            );

                            currentTime = taskEnd;
                        }

                        if (currentTime < dayEnd) {
                            dayElements.push(
                                <GapItem
                                    key={`gap-end-${dateStr}`}
                                    start={currentTime}
                                    end={dayEnd}
                                    onClick={() => onGapClick(currentTime)}
                                />
                            );
                        }
                    }

                    return (
                        <div key={dateStr} className="relative">
                            <div
                                onClick={() => toggleDate(dateStr)}
                                className="sticky top-0 z-10 bg-monster-bg/95 backdrop-blur py-3 mb-2 border-b border-gray-800 flex justify-between items-center cursor-pointer hover:bg-white/5 -mx-2 px-2 rounded select-none transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <ChevronDown
                                        size={20}
                                        className={clsx("transition-transform text-white/50", isCollapsed && "-rotate-90")}
                                    />
                                    <h2 className="text-xl font-black text-white uppercase tracking-wider">
                                        {format(dateObj, 'EEEE')}
                                        <span className="text-gray-500 font-mono text-sm ml-2 font-normal">
                                            {format(dateObj, 'MMM do')}
                                        </span>
                                    </h2>
                                </div>

                                {(() => {
                                    const voidTasks = dayTasks.filter(t => t.status === 'void');
                                    const count = voidTasks.length;
                                    if (count === 0) return null;

                                    return (
                                        <span className="text-[10px] text-scar-red font-bold border border-scar-red px-1 rounded bg-scar-dark/50 self-center mr-2">
                                            FAILED: {count}
                                        </span>
                                    );
                                })()}

                                {(() => {
                                    const completedTasks = dayTasks.filter(t => t.status === 'trace');
                                    const count = completedTasks.length;
                                    if (count === 0) return null;

                                    const totalMinutes = completedTasks.reduce((acc, t) => acc + t.durationMinutes, 0);
                                    const hours = Math.floor(totalMinutes / 60);
                                    const mins = totalMinutes % 60;
                                    const timeStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

                                    return (
                                        <div className="text-right">
                                            <div className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Completed</div>
                                            <div className="text-xs font-mono text-green-400">
                                                {count} Tasks • {timeStr}
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                            <div className={clsx("space-y-1 transition-all overflow-hidden", isCollapsed ? "max-h-0 opacity-0" : "opacity-100")}>
                                {dayElements}
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
};

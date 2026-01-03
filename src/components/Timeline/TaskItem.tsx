import { format, addMinutes } from 'date-fns';
import { Task } from '../../store/useTraceStore';
import { Camera } from 'lucide-react';
import { clsx } from 'clsx';

interface TaskItemProps {
    task: Task;
    onInteract: (task: Task) => void;
}

export const TaskItem = ({ task, onInteract }: TaskItemProps) => {
    const isVoid = task.status === 'void';
    const isTrace = task.status === 'trace';
    const isActive = task.status === 'active';

    return (
        <div
            onClick={() => onInteract(task)}
            className={clsx(
                "relative p-4 rounded-lg border-2 mb-2 transition-all duration-300 overflow-hidden group",
                isActive && "border-monster-text bg-monster-surface hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]",
                isTrace && "border-trace-ghost bg-transparent opacity-40 grayscale line-through",
                isVoid && "border-scar-red bg-scar-dark text-scar-red shadow-[0_0_10px_rgba(255,0,51,0.2)] hover:animate-pulse-error",
                "cursor-pointer hover:scale-[1.02]" // Always interactive now
            )}
        >
            {/* VOID STAMP */}
            {isVoid && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20 rotate-12">
                    <span className="text-6xl font-black text-scar-red border-4 border-scar-red p-2 rounded transform">
                        VOID
                    </span>
                </div>
            )}

            <div className="flex justify-between items-start relative z-10">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold border px-1.5 rounded uppercase tracking-wider opacity-70">
                            {task.category || 'N/A'}
                        </span>
                    </div>
                    <h3 className="text-lg font-bold tracking-tight">{task.name}</h3>
                    <p className="text-sm font-mono opacity-80">
                        {format(new Date(task.startTime), 'HH:mm')} - {format(addMinutes(new Date(task.startTime), task.durationMinutes), 'HH:mm')} | {task.durationMinutes}m
                    </p>
                </div>

                {isActive && (
                    <div className="bg-white text-black p-2 rounded-full animate-pulse">
                        <Camera size={20} />
                    </div>
                )}
            </div>

            {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
            )}
        </div>
    );
};

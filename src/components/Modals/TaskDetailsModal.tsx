import { useState } from 'react';
import { useTraceStore, Task, Category } from '../../store/useTraceStore';
import { X, Trash2, Camera, Edit2 } from 'lucide-react';
import { format } from 'date-fns';

const CATEGORIES: Category[] = ['Study', 'Project', 'Workout', 'Entertainment', 'Touch the Grass'];

interface TaskDetailsModalProps {
    task: Task;
    onClose: () => void;
    onOpenCamera: (task: Task) => void;
}

export const TaskDetailsModal = ({ task, onClose, onOpenCamera }: TaskDetailsModalProps) => {
    const { deleteTask, updateTask } = useTraceStore();
    const [isEditing, setIsEditing] = useState(false);

    const [name, setName] = useState(task.name);
    const [category, setCategory] = useState<Category>(task.category || 'Study');
    const [start, setStart] = useState(task.startTime);
    const [duration, setDuration] = useState(task.durationMinutes);
    const [error, setError] = useState<string | null>(null);

    const isVoid = task.status === 'void';
    const isTrace = task.status === 'trace';
    const isActive = task.status === 'active';

    const handleDelete = () => {
        if (confirm("Permanently remove this Trace?")) {
            deleteTask(task.id);
            onClose();
        }
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        try {
            updateTask(task.id, name, category, start, duration);
            setIsEditing(false);
            setError(null);
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setName(task.name);
        setCategory(task.category || 'Study');
        setStart(task.startTime);
        setDuration(task.durationMinutes);
        setError(null);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-sm bg-monster-surface border border-gray-800 p-6 rounded-t-2xl sm:rounded-2xl shadow-2xl relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white">
                    <X />
                </button>

                {/* Header / Title */}
                <div className="mb-6 pr-8">
                    <h2 className="text-xl font-black">{isEditing ? "EDIT TRACE" : task.name}</h2>
                    {!isEditing && (
                        <div className="flex flex-col gap-2 mt-2">
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold border border-gray-700 bg-gray-900 text-gray-300 w-fit">
                                {task.category || 'Uncategorized'}
                            </span>
                            <div className="flex items-center space-x-2 text-xs font-mono">
                                <span className={isVoid ? "text-scar-red" : isTrace ? "text-trace-ghost" : "text-gap-neon"}>
                                    {task.status.toUpperCase()}
                                </span>
                                <span className="text-gray-600">•</span>
                                <span className="text-gray-400">
                                    {format(new Date(task.startTime), 'HH:mm')} ({task.durationMinutes}m)
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {isEditing ? (
                    <form onSubmit={handleSave} className="space-y-4">
                        <div>
                            <label className="block text-xs font-mono text-gray-500 mb-1">TASK NAME</label>
                            <input
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full bg-black border border-gray-700 rounded p-3 text-white focus:border-white outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-mono text-gray-500 mb-1">CATEGORY</label>
                            <div className="flex flex-wrap gap-2">
                                {CATEGORIES.map(cat => (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() => setCategory(cat)}
                                        className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${category === cat
                                                ? 'bg-white text-black border-white'
                                                : 'bg-black text-gray-400 border-gray-800 hover:border-gray-500'
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-mono text-gray-500 mb-1">START</label>
                            <input
                                type="datetime-local"
                                value={format(new Date(start), "yyyy-MM-dd'T'HH:mm")}
                                onChange={e => setStart(new Date(e.target.value).toISOString())}
                                className="w-full bg-black border border-gray-700 rounded p-3 text-white focus:border-white outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-mono text-gray-500 mb-1">MINUTES</label>
                            <input
                                type="number"
                                value={duration}
                                onChange={e => setDuration(Number(e.target.value))}
                                className="w-full bg-black border border-gray-700 rounded p-3 text-white focus:border-white outline-none"
                            />
                        </div>

                        {error && (
                            <div className="bg-scar-dark border border-scar-red text-scar-red p-3 rounded text-sm font-bold flex items-center animate-pulse-error">
                                <span className="mr-2">⚠</span> {error}
                            </div>
                        )}

                        <div className="flex gap-2 pt-2">
                            <button type="button" onClick={handleCancelEdit} className="flex-1 bg-gray-800 py-3 rounded font-bold">Cancel</button>
                            <button type="submit" className="flex-1 bg-white text-black py-3 rounded font-bold">Save</button>
                        </div>
                    </form>
                ) : (
                    <div className="space-y-3">
                        {/* Actions */}
                        {isActive && (
                            <button
                                onClick={() => { onClose(); onOpenCamera(task); }}
                                className="w-full bg-gap-neon text-black font-bold py-4 rounded flex items-center justify-center gap-2 active:scale-95 transition-transform"
                            >
                                <Camera size={20} />
                                CAPTURE EVIDENCE
                            </button>
                        )}

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setIsEditing(true)}
                                className="bg-gray-800 text-white font-bold py-3 rounded flex items-center justify-center gap-2 active:scale-95 transition-transform hover:bg-gray-700"
                            >
                                <Edit2 size={18} />
                                EDIT
                            </button>
                            <button
                                onClick={handleDelete}
                                className="bg-scar-dark text-scar-red border border-scar-red/50 font-bold py-3 rounded flex items-center justify-center gap-2 active:scale-95 transition-transform hover:bg-scar-red hover:text-white"
                            >
                                <Trash2 size={18} />
                                DELETE
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

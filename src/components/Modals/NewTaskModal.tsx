import { useState } from 'react';
import { useTraceStore, Category } from '../../store/useTraceStore';
import { getNow } from '../../utils/timeUtils';
import { X } from 'lucide-react';
import { format } from 'date-fns';

const CATEGORIES: Category[] = ['Study', 'Project', 'Workout', 'Entertainment', 'Touch the Grass'];

interface NewTaskModalProps {
    initialStartTime?: Date;
    onClose: () => void;
}

export const NewTaskModal = ({ initialStartTime, onClose }: NewTaskModalProps) => {
    const addTask = useTraceStore(state => state.addTask);
    const [name, setName] = useState('');
    const [category, setCategory] = useState<Category>('Study');
    // Simplify: Use native datetime-local input
    const defaultStart = initialStartTime ? format(initialStartTime, "yyyy-MM-dd'T'HH:mm") : format(getNow(), "yyyy-MM-dd'T'HH:mm");
    const [start, setStart] = useState(defaultStart);
    const [duration, setDuration] = useState(60);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        try {
            addTask(name, category, new Date(start).toISOString(), Number(duration));
            onClose();
        } catch (err: any) {
            // Shake effect or error message
            setError(err.message);
            // clear error after 3s
            setTimeout(() => setError(null), 3000);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-sm bg-monster-surface border border-gray-800 p-6 rounded-t-2xl sm:rounded-2xl shadow-2xl relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white">
                    <X />
                </button>

                <h2 className="text-xl font-black mb-6">NEW TRACE</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-mono text-gray-500 mb-1">TASK NAME</label>
                        <input
                            autoFocus
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="w-full bg-black border border-gray-700 rounded p-3 text-white focus:border-white outline-none transition-colors"
                            placeholder="Deep Work..."
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-mono text-gray-500 mb-1">START</label>
                        <input
                            type="datetime-local"
                            value={start}
                            onChange={e => setStart(e.target.value)}
                            className="w-full bg-black border border-gray-700 rounded p-3 text-white focus:border-white outline-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-mono text-gray-500 mb-1">MINUTES</label>
                        <input
                            type="number"
                            value={duration}
                            onChange={e => setDuration(Number(e.target.value))}
                            className="w-full bg-black border border-gray-700 rounded p-3 text-white focus:border-white outline-none"
                            min="5"
                            max="300"
                            required
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

                    {error && (
                        <div className="bg-scar-dark border border-scar-red text-scar-red p-3 rounded text-sm font-bold flex items-center animate-pulse-error">
                            <span className="mr-2">⚠</span> {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-white text-black font-bold py-4 rounded hover:bg-gray-200 active:scale-95 transition-all mt-4"
                    >
                        LOCK IT IN
                    </button>
                </form>
            </div>
        </div>
    );
};

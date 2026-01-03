import { useState } from 'react';
import { useTraceStore, Task } from './store/useTraceStore';
import { getNow } from './utils/timeUtils';
import { Timeline } from './components/Timeline/Timeline';
import { Dashboard } from './components/Dashboard/Dashboard';
import { NewTaskModal } from './components/Modals/NewTaskModal';
import { CameraModal } from './components/Modals/CameraModal';
import { TaskDetailsModal } from './components/Modals/TaskDetailsModal';
import { Plus, LayoutTemplate, Activity, FolderPlus, FolderOpen } from 'lucide-react';
import clsx from 'clsx';
import { getDirectoryHandle, promptForDirectory } from './utils/fileSystem';

type ViewInfo = 'timeline' | 'dashboard';

function App() {
    const stabilityScore = useTraceStore(state => state.stabilityScore);

    const [view, setView] = useState<ViewInfo>('timeline');
    const [isConnected, setIsConnected] = useState(false);

    // Check for existing connection on mount
    useState(() => {
        getDirectoryHandle().then(handle => {
            if (handle) setIsConnected(true);
        });
    });

    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [modalInitialTime, setModalInitialTime] = useState<Date | undefined>(undefined);

    const [cameraTask, setCameraTask] = useState<Task | null>(null);

    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    const handleTaskClick = (task: Task) => {
        setSelectedTask(task);
    };

    const handleOpenCamera = (task: Task) => {
        setCameraTask(task);
    };

    const handleGapClick = (startDate: Date) => {
        setModalInitialTime(startDate);
        setIsTaskModalOpen(true);
    };

    const openNewTask = () => {
        setModalInitialTime(getNow());
        setIsTaskModalOpen(true);
    };

    return (
        <div className="min-h-screen bg-monster-bg text-monster-text font-sans flex flex-col">
            {/* STICKY HEADER */}
            <header className="flex justify-between items-center sticky top-0 bg-monster-bg/90 backdrop-blur z-20 px-4 py-4 border-b border-gray-900">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter text-white">
                        TRACE<span className="text-scar-red">.</span>
                    </h1>
                    <p className="text-xs font-mono text-gray-500">ANTI-GRAVITY PROTOCOL</p>
                </div>

                <div className="flex gap-4 items-center">
                    <button
                        onClick={async () => {
                            const handle = await promptForDirectory();
                            if (handle) setIsConnected(true);
                        }}
                        className={clsx(
                            "text-[10px] font-bold border px-2 py-1 rounded transition-colors flex items-center gap-1",
                            isConnected ? "bg-gap-neon/20 text-gap-neon border-gap-neon" : "bg-monster-surface text-gray-400 border-gray-700 hover:border-gray-500"
                        )}
                    >
                        {isConnected ? <FolderOpen size={12} /> : <FolderPlus size={12} />}
                        {isConnected ? "LINKED" : "CONNECT"}
                    </button>

                    <button
                        onClick={() => {
                            if (confirm('NUKE ALL DATA? This cannot be undone.')) {
                                useTraceStore.getState().clearAllTasks();
                            }
                        }}
                        className="text-[10px] font-bold bg-scar-dark text-scar-red border border-scar-red px-2 py-1 rounded hover:bg-scar-red hover:text-white transition-colors"
                    >
                        RESET
                    </button>
                    <div className="text-right">
                        <div className="text-xs font-mono text-gray-500 mb-1">STABILITY</div>
                        <div className={clsx(
                            "text-2xl font-black",
                            stabilityScore > 80 ? "text-gap-neon" : stabilityScore > 50 ? "text-white" : "text-scar-red"
                        )}>
                            {stabilityScore}%
                        </div>
                    </div>
                </div>
            </header>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 max-w-md mx-auto w-full relative pb-32">
                {view === 'timeline' ? (
                    <div className="p-4">
                        <Timeline onTaskClick={handleTaskClick} onGapClick={handleGapClick} />
                    </div>
                ) : (
                    <Dashboard />
                )}
            </main>

            {/* FLOATING ACTION BUTTON (Only in Timeline) */}
            {view === 'timeline' && (
                <div className="fixed bottom-24 right-6 z-30">
                    <button
                        onClick={openNewTask}
                        className="h-16 w-16 bg-white text-black rounded-full shadow-[0_0_20px_rgba(255,255,255,0.3)] flex items-center justify-center active:scale-90 transition-transform hover:bg-gap-neon"
                    >
                        <Plus size={32} strokeWidth={3} />
                    </button>
                </div>
            )}

            {/* BOTTOM NAVIGATION */}
            <nav className="fixed bottom-0 left-0 right-0 bg-monster-surface/95 backdrop-blur border-t border-gray-800 z-40 pb-safe">
                <div className="flex justify-around items-center max-w-md mx-auto">
                    <button
                        onClick={() => setView('timeline')}
                        className={clsx(
                            "flex flex-col items-center justify-center p-4 w-full transition-colors",
                            view === 'timeline' ? "text-white" : "text-gray-600 hover:text-gray-400"
                        )}
                    >
                        <Activity size={24} className={clsx("mb-1", view === 'timeline' && "drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]")} />
                        <span className="text-[10px] font-black tracking-widest">TRACE</span>
                    </button>

                    <button
                        onClick={() => setView('dashboard')}
                        className={clsx(
                            "flex flex-col items-center justify-center p-4 w-full transition-colors",
                            view === 'dashboard' ? "text-gap-neon" : "text-gray-600 hover:text-gray-400"
                        )}
                    >
                        <LayoutTemplate size={24} className={clsx("mb-1", view === 'dashboard' && "drop-shadow-[0_0_8px_rgba(0,240,255,0.5)]")} />
                        <span className="text-[10px] font-black tracking-widest">GRAVITY</span>
                    </button>
                </div>
            </nav>

            {/* MODALS */}
            {isTaskModalOpen && (
                <NewTaskModal
                    initialStartTime={modalInitialTime}
                    onClose={() => {
                        setIsTaskModalOpen(false);
                        setModalInitialTime(undefined);
                    }}
                />
            )}

            {cameraTask && (
                <CameraModal
                    taskId={cameraTask.id}
                    taskName={cameraTask.name}
                    onClose={() => setCameraTask(null)}
                />
            )}

            {selectedTask && (
                <TaskDetailsModal
                    task={selectedTask}
                    onClose={() => setSelectedTask(null)}
                    onOpenCamera={handleOpenCamera}
                />
            )}
        </div>
    );
}

export default App;

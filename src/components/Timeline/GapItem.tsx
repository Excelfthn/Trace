

interface GapItemProps {
    start: Date;
    end: Date;
    onClick: () => void;
}

export const GapItem = ({ start, end, onClick }: GapItemProps) => {
    const duration = (end.getTime() - start.getTime()) / (1000 * 60);

    // Don't show tiny gaps
    if (duration < 5) return null;

    return (
        <div
            onClick={onClick}
            className="group relative p-3 mb-2 rounded border border-dashed border-gray-800 hover:border-gap-neon hover:shadow-[0_0_15px_rgba(0,240,255,0.2)] transition-all cursor-pointer flex flex-col justify-center items-center h-16 opacity-60 hover:opacity-100"
        >
            <div className="text-gap-neon text-xs font-mono tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity">
                Gap Detected • {Math.round(duration)}m
            </div>
            <div className="absolute inset-0 bg-gap-glow opacity-0 group-hover:opacity-100 transition-opacity rounded"></div>
        </div>
    );
};

import { motion } from 'framer-motion';

interface RadialProgressProps {
    percentage: number;
    size?: number;
    strokeWidth?: number;
    color?: string;
    label?: string;
    subLabel?: string;
    centerText?: string;
}

export const RadialProgress = ({
    percentage,
    size = 120,
    strokeWidth = 10,
    color = '#00F0FF',
    label,
    subLabel,
    centerText
}: RadialProgressProps) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="flex flex-col items-center justify-center" style={{ width: size }}>
            <div className="relative" style={{ width: size, height: size }}>
                <svg
                    width={size}
                    height={size}
                    viewBox={`0 0 ${size} ${size}`}
                    className="transform -rotate-90"
                >
                    {/* Background Circle */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="#1a1a1a"
                        strokeWidth={strokeWidth}
                        fill="transparent"
                    />
                    {/* Progress Circle */}
                    <motion.circle
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={color}
                        strokeWidth={strokeWidth}
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeLinecap="round"
                    />
                </svg>

                {/* Center Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-2xl font-black text-white" style={{ textShadow: `0 0 10px ${color}` }}>
                        {centerText || `${Math.round(percentage)}%`}
                    </span>
                </div>
            </div>

            {/* Label below */}
            {(label || subLabel) && (
                <div className="mt-4 text-center w-40">
                    {label && <div className="text-xs font-bold text-gray-300 uppercase tracking-wider">{label}</div>}
                    {subLabel && <div className="text-[10px] font-mono text-gray-500">{subLabel}</div>}
                </div>
            )}
        </div>
    );
};

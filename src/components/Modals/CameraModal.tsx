import { useRef, useEffect, useState } from 'react';
import { RefreshCw, Check } from 'lucide-react';

import { saveImage } from '../../db/imageStorage';
import { useTraceStore } from '../../store/useTraceStore';
import { getDirectoryHandle, saveTracePhoto } from '../../utils/fileSystem';

interface CameraModalProps {
    taskId: string;
    taskName: string;
    onClose: () => void;
}

export const CameraModal = ({ taskId, taskName, onClose }: CameraModalProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [photoBlob, setPhotoBlob] = useState<Blob | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const markAsTrace = useTraceStore(state => state.markAsTrace);

    useEffect(() => {
        let localStream: MediaStream | null = null;
        let isMounted = true;

        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment' }
                });

                // If component unmounted while waiting for camera, stop immediately
                if (!isMounted) {
                    stream.getTracks().forEach(t => t.stop());
                    return;
                }

                localStream = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error("Camera error:", err);
            }
        };

        startCamera();

        return () => {
            isMounted = false;
            // Stop tracks immediately on unmount
            if (localStream) {
                localStream.getTracks().forEach(t => t.stop());
            }
        };
    }, []);

    const capture = () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Draw video
        ctx.drawImage(video, 0, 0);

        // METADATA BURN
        const now = new Date();
        const timeStr = now.toLocaleTimeString();
        const dateStr = now.toLocaleDateString();

        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(20, canvas.height - 100, canvas.width - 40, 80);

        ctx.font = "bold 32px monospace";
        ctx.fillStyle = "#00F0FF"; // Neon
        ctx.fillText(taskName.toUpperCase(), 40, canvas.height - 60);

        ctx.font = "24px monospace";
        ctx.fillStyle = "white";
        ctx.fillText(`${dateStr} ${timeStr} • TRACE VALID`, 40, canvas.height - 30);

        // Convert to blob
        canvas.toBlob((blob) => {
            setPhotoBlob(blob);
        }, 'image/jpeg', 0.8);
    };

    const save = async () => {
        if (photoBlob && !isSaving) {
            setIsSaving(true);
            try {
                // 1. Save to Internal IDB (for app display)
                await saveImage(taskId, photoBlob);

                // 2. Save to File System (if connected)
                const dirHandle = await getDirectoryHandle();
                if (dirHandle) {
                    const task = useTraceStore.getState().tasks.find(t => t.id === taskId);
                    if (task) {
                        await saveTracePhoto(dirHandle, photoBlob, taskName, task.category);
                    }
                }

                markAsTrace(taskId);
                onClose();
            } catch (error) {
                console.error("Save failed:", error);
                setIsSaving(false);
            }
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
            <div className="flex-1 relative overflow-hidden">
                {!photoBlob ? (
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                ) : (
                    <img
                        src={URL.createObjectURL(photoBlob)}
                        className="absolute inset-0 w-full h-full object-cover grayscale opacity-80"
                    />
                )}

                {/* Overlay guides */}
                <div className="absolute inset-0 border-[20px] border-black/50 pointer-events-none"></div>
                <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
                    <div className="w-64 h-64 border-2 border-dashed border-white rounded-full"></div>
                </div>
            </div>

            <div className="h-48 bg-black p-6 flex items-center justify-around">
                {photoBlob ? (
                    <>
                        <button
                            onClick={() => setPhotoBlob(null)}
                            disabled={isSaving}
                            className="p-4 bg-gray-800 rounded-full text-white disabled:opacity-50"
                        >
                            <RefreshCw />
                        </button>
                        <button
                            onClick={save}
                            disabled={isSaving}
                            className="p-6 bg-gap-neon text-black rounded-full font-bold shadow-[0_0_20px_rgba(0,240,255,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSaving ? <div className="animate-spin w-8 h-8 border-4 border-black border-t-transparent rounded-full" /> : <Check size={32} />}
                        </button>
                    </>
                ) : (
                    <>
                        <button onClick={onClose} className="p-4 text-white">Cancel</button>
                        <button onClick={capture} className="w-20 h-20 bg-white rounded-full border-4 border-gray-300 active:scale-90 transition-transform"></button>
                        <div className="w-12"></div> {/* Spacer */}
                    </>
                )}
            </div>

            {/* Hidden canvas for processing */}
            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
};

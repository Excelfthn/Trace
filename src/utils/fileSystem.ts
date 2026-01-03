import { set, get } from 'idb-keyval';
import { Category } from '../store/useTraceStore';

const HANDLE_KEY = 'trace-dir-handle';

// Category Short Codes
const CAT_CODES: Record<Category, string> = {
    'Study': 'STU',
    'Project': 'PRJ',
    'Workout': 'WRK',
    'Entertainment': 'ENT',
    'Touch the Grass': 'TTG'
};

export const getDirectoryHandle = async (): Promise<FileSystemDirectoryHandle | null> => {
    try {
        // Try to get from IDB first
        const handle = await get<FileSystemDirectoryHandle>(HANDLE_KEY);
        if (handle) {
            // Verify permission
            const perm = await verifyPermission(handle, true);
            if (perm) return handle;
        }
    } catch (e) {
        console.warn("Could not retrieve handle from storage", e);
    }
    return null;
};

export const promptForDirectory = async (): Promise<FileSystemDirectoryHandle | null> => {
    try {
        // @ts-ignore - types might be missing for window.showDirectoryPicker
        const handle = await window.showDirectoryPicker();
        if (handle) {
            await set(HANDLE_KEY, handle);
            return handle;
        }
    } catch (e) {
        console.error("User cancelled or error picking directory:", e);
    }
    return null;
};

const verifyPermission = async (handle: FileSystemDirectoryHandle, readWrite: boolean): Promise<boolean> => {
    const options: FileSystemHandlePermissionDescriptor = {
        mode: readWrite ? 'readwrite' : 'read',
    };

    // Check if permission was already granted
    if ((await handle.queryPermission(options)) === 'granted') {
        return true;
    }

    // Request permission
    if ((await handle.requestPermission(options)) === 'granted') {
        return true;
    }

    return false;
};

export const saveTracePhoto = async (
    dirHandle: FileSystemDirectoryHandle,
    blob: Blob,
    taskName: string,
    category: Category
): Promise<boolean> => {
    try {
        const catCode = CAT_CODES[category] || 'GEN';
        // Sanitize Task Name (remove special chars)
        const safeName = taskName.replace(/[^a-z0-9]/gi, '_').substring(0, 30);
        // Format: TRACE-[CAT]-[NAME].png
        // User asked for: TRACE-[CATEGORY SHORT NAME]-[TASKNAME]
        // Adding timestamp collision avoidance might be good, but user requested specific format.
        // Let's add timestamp to ensure uniqueness though, or it overwrites.
        // User said: "TRACE-[CATEGORY SHORT NAME]-[TASKNAME]"
        // If I do multiple "Study" "Math" tasks, they will overwrite.
        // I will stick to their request but maybe append a small hash if file exists? 
        // For now, let's just append simplified date or unique ID if we want strictly their format?
        // "automatically added to the folder with the format TRACE-[CATEGORY SHORT NAME]-[TASKNAME]"
        // A timestamp is safest. "TRACE-STU-Math_Review-17192832.png"

        const timestamp = Date.now().toString().slice(-6);
        const fileName = `TRACE-${catCode}-${safeName}-${timestamp}.png`;

        const fileHandle = await dirHandle.getFileHandle(fileName, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(blob);
        await writable.close();

        return true;
    } catch (e) {
        console.error("Failed to save to local file system:", e);
        return false;
    }
};

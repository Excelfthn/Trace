/// <reference types="vite/client" />

interface Window {
    showDirectoryPicker(): Promise<FileSystemDirectoryHandle>;
}

interface FileSystemHandlePermissionDescriptor {
    mode?: 'read' | 'readwrite';
}

interface FileSystemHandle {
    kind: 'file' | 'directory';
    name: string;
    isSameEntry(other: FileSystemHandle): Promise<boolean>;
    queryPermission(descriptor?: FileSystemHandlePermissionDescriptor): Promise<PermissionState>;
    requestPermission(descriptor?: FileSystemHandlePermissionDescriptor): Promise<PermissionState>;
}

interface FileSystemDirectoryHandle extends FileSystemHandle {
    kind: 'directory';
    getFileHandle(name: string, options?: { create?: boolean }): Promise<FileSystemFileHandle>;
    getDirectoryHandle(name: string, options?: { create?: boolean }): Promise<FileSystemDirectoryHandle>;
    // ... other methods omitted for brevity
}

interface FileSystemFileHandle extends FileSystemHandle {
    kind: 'file';
    getFile(): Promise<File>;
    createWritable(options?: { keepExistingData?: boolean }): Promise<FileSystemWritableFileStream>;
}

interface FileSystemWritableFileStream extends WritableStream {
    write(data: BufferSource | Blob | string): Promise<void>;
    seek(position: number): Promise<void>;
    truncate(size: number): Promise<void>;
}


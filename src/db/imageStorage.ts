import { set, get, del } from 'idb-keyval';

export const saveImage = async (id: string, file: Blob): Promise<void> => {
    await set(`trace-img-${id}`, file);
};

export const getImage = async (id: string): Promise<Blob | undefined> => {
    return await get(`trace-img-${id}`);
};

export const deleteImage = async (id: string): Promise<void> => {
    await del(`trace-img-${id}`);
};

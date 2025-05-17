// const invoke = window.__TAURI__.invoke;

import { convertFileSrc, invoke } from "@tauri-apps/api/core";
import { Mod } from "../interfaces/Mod.interface";

/**
 * Get contents of a directory
 * @param path Path to the directory to scan
 * @returns Promise with array of FolderItem objects
 */
export const getFolderContents = async (path: string): Promise<Mod[]> => {
    try {
        const contents = await invoke<Mod[]>('get_folder_mods', { path });
        const timestamp = Date.now()
        return contents.map((mod) => ({
            ...mod,
            thumbnail: mod.thumbnail != '' ? convertFileSrc(mod.thumbnail) + `?t=${timestamp}` : ''
        }))

    } catch (error) {
        console.error('Error getting folder contents:', error);
        throw error;
    }
};

export const setModInfo = async (mod: Mod) => {
    try {
        const result = await invoke('set_mod_info', { modData: mod });
        return result;
    } catch (error) {
        console.error('Error setting mod details:', error);
        throw error;
    }
}


export const setModThumbnail = async (mod: Mod, thumbnailPath: string) => {
    try {
        const result = await invoke('set_mod_thumbnail', { path: mod.path, thumbnailPath });
        return result;
    } catch (error) {
        console.error('Error setting mod thumbnail:', error);
        throw error;
    }
}
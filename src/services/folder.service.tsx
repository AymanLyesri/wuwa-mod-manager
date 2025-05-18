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


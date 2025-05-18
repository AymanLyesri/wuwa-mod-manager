import { invoke } from "@tauri-apps/api/core";
import { Mod } from "../interfaces/Mod.interface";

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

export const downloadMod = async (url: string, to: string) => {
    try {
        const result = await invoke('download_mod', { url, to });
        return result;
    } catch (error) {
        console.error('Error downloading mod:', error);
        throw error;
    }
}
import { invoke } from "@tauri-apps/api/core";
import { Mod } from "../interfaces/Mod.interface";
import { useAsyncLoadingHook } from "../hooks/loadingHook";

export const setModInfo = async (mod: Mod): Promise<Mod> => {
    try {
        const result: Mod = await invoke('set_mod_info', { modData: mod });
        return result;
    } catch (error) {
        console.error('Error setting mod details:', error);
        throw error;
    }
}

export const setModThumbnail = async ({ mod, thumbnailPath = '', base64 = '' }: { mod: Mod, thumbnailPath?: string, base64?: string }) => {

    try {

        const result = await invoke('set_mod_thumbnail', { path: mod.path, thumbnailPath, base64 });

        return result;
    } catch (error) {
        console.error('Error setting mod thumbnail:', error);

        throw error;
    }

}

export const downloadMod = async (url: string, to: string) => {
    const { loadingHook } = useAsyncLoadingHook();
    await loadingHook(async () => {
        try {
            const result = await invoke('download_mod', { url, to });
            return result;
        } catch (error) {
            console.error('Error downloading mod:', error);
            throw error;
        }
    });
}

export const deleteMod = async (mod: Mod) => {
    try {
        const result = await invoke('delete_mod', { path: mod.path });
        return result;
    } catch (error) {
        console.error('Error deleting mod:', error);
        throw error;
    }
}
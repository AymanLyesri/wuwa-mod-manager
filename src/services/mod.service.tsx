import { invoke } from "@tauri-apps/api/core";
import { Mod } from "../interfaces/Mod.interface";
import { useAsyncLoadingHook } from "../hooks/loadingHook";
import { toast } from "react-toastify";
// import { reloadGame } from "./game.service";

export const setModInfo = async (mod: Mod): Promise<Mod> => {
    try {
        const result: Mod = await invoke('set_mod_info', { modData: mod });
        toast.success('Mod info updated successfully');
        return result;
    } catch (error) {
        console.error('Error setting mod details:', error);
        toast.error('Error setting mod details');
        throw error;
    }
}

export const setModThumbnail = async ({ mod, thumbnailPath = '', base64 = '' }: { mod: Mod, thumbnailPath?: string, base64?: string }) => {
    try {
        const result = await invoke('set_mod_thumbnail', { path: mod.path, thumbnailPath, base64 });
        toast.success('Mod thumbnail updated successfully');
        return result;
    } catch (error) {
        console.error('Error setting mod thumbnail:', error);
        toast.error('Error setting mod thumbnail');
        throw error;
    }
}

export const downloadMod = async (url: string, to: string) => {
    const { loadingHook } = useAsyncLoadingHook();
    await loadingHook(async () => {
        try {
            const result = await invoke('download_mod', { url, to });
            toast.success('Mod downloaded successfully');
            return result;
        } catch (error) {
            console.error('Error downloading mod:', error);
            toast.error('Error downloading mod');
            throw error;
        }
    });
}

export const deleteMod = async (mod: Mod) => {
    try {
        const result = await invoke('delete_mod', { path: mod.path });
        toast.success('Mod deleted successfully');
        return result;
    } catch (error) {
        console.error('Error deleting mod:', error);
        toast.error('Error deleting mod');
        throw error;
    }
}
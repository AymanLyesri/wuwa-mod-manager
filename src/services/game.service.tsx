import { invoke } from "@tauri-apps/api/core";
import { Mod } from "../interfaces/Mod.interface";

export const reloadGame = async () => {
    try {
        await invoke<Mod[]>('send_f10');
        console.log('Game reloaded');
    } catch (error) {
        console.error('Error reloading game:', error);
        throw error;
    }
}
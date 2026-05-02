import { invoke } from "@tauri-apps/api/core";
import { Mod } from "../interfaces/Mod.interface";
import { toast } from "react-toastify";

export const reloadGame = async () => {
    try {
        await invoke<Mod[]>('send_f10');
        console.log('Game reloaded');
        toast.success("Game reloaded successfully");
    } catch (error) {
        console.error('Error reloading game:', error);
        toast.error("Error reloading game");
        throw error;
    }
}
// const invoke = window.__TAURI__.invoke;

import { invoke } from "@tauri-apps/api/core";
import { Mod } from "../interfaces/Mod.interface";
import { toast } from "react-toastify";

/**
 * Get contents of a directory
 * @param path Path to the directory to scan
 * @returns Promise with array of FolderItem objects
 */
export const getFolderContents = async (path: string): Promise<Mod[]> => {
  try {
    const contents = await invoke<Mod[]>("get_folder_mods", { path });
    toast.success("Folder contents retrieved successfully");
    return contents.map((mod) => ({
      ...mod,
    }));
  } catch (error) {
    console.error("Error getting folder contents:", error);
    toast.error("Error getting folder contents");
    throw error;
  }
};

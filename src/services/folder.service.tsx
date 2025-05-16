// const invoke = window.__TAURI__.invoke;

import { invoke } from "@tauri-apps/api/core";
import { Mod } from "../interfaces/Mod.interface";

export interface FolderItem {
    name: string;
    path: string;
    isDirectory: boolean;
}

/**
 * Get contents of a directory
 * @param path Path to the directory to scan
 * @returns Promise with array of FolderItem objects
 */
export const getFolderContents = async (path: string): Promise<Mod[]> => {
    try {
        const contents = await invoke<Mod[]>('get_folder_contents', { path });
        // add ids to contents
        const contentsWithIds = contents.map((mod, index) => ({
            ...mod,
            id: index.toString(),
            enabled: !mod.name.startsWith('disabled'),
        }));
        return contentsWithIds;
    } catch (error) {
        console.error('Error getting folder contents:', error);
        throw error;
    }
};


/**
 * Get the parent directory of a given path
 * @param path Path to get parent of
 * @returns Parent directory path or null if at root
 */
export const getParentDirectory = async (path: string): Promise<string | null> => {
    try {
        const parent = await invoke<string>('get_parent_directory', { path });
        return parent;
    } catch (error) {
        console.error('Error getting parent directory:', error);
        throw error;
    }
};

export const setModState = async (mod: Mod, state: boolean) => {
    try {
        const result = await invoke('set_mod_state', { path: mod.path, enabled: state });
        return result;
    } catch (error) {
        console.error('Error setting mod state:', error);
        throw error;
    }
}

export const testFolderService = async () => {
    try {
        // Test with a known directory (adjust for your system)
        const testPath = '/eternal/Coding/mod_manager/Mods'; // Windows
        // const testPath = '/Users'; // macOS
        // const testPath = '/home'; // Linux

        console.log('--- Testing getFolderContents ---');
        const allContents = await getFolderContents(testPath);
        console.log('All contents:', allContents);

        return allContents;
    } catch (error) {
        console.error('Test failed:', error);
        throw error;
    }
};
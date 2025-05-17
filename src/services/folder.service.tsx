// const invoke = window.__TAURI__.invoke;

import { convertFileSrc, invoke } from "@tauri-apps/api/core";
import { Mod } from "../interfaces/Mod.interface";
import { exists, readFile } from '@tauri-apps/plugin-fs';

/**
 * Get contents of a directory
 * @param path Path to the directory to scan
 * @returns Promise with array of FolderItem objects
 */
export const getFolderContents = async (path: string): Promise<Mod[]> => {
    try {
        const contents = await invoke<Mod[]>('get_folder_contents', { path });

        // add ids to contents
        const contentsWithIds = await Promise.all(contents.map(async (mod, index) => {
            const thumbnailPath = convertFileSrc(mod.path + '\\thumbnail.png') // using \\
            const doesThumbnailExists = await exists(mod.path + '\\thumbnail.png');

            // get mod details from json by reading the file
            const jsonPath = mod.path + '\\mod.json';
            const jsonExists = await exists(jsonPath);
            if (jsonExists) {
                const jsonContent = await readFile(jsonPath);
                const jsonString = new TextDecoder().decode(jsonContent);
                const json = JSON.parse(jsonString);
                mod.name = json.name || mod.name;
                mod.author = json.author || mod.author;
                mod.description = json.description || mod.description;
                mod.version = json.version || mod.version;
            }


            return ({
                ...mod,
                id: index.toString(),
                name: mod.name.replace('disabled', '').trim(),
                version: mod.version || '0.0.0',
                author: mod.author || 'Unknown',
                description: mod.description || 'No description available',
                enabled: !mod.name.startsWith('disabled'),
                thumbnail: doesThumbnailExists ? thumbnailPath : '',
            })
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

export const setModThumbnail = async (mod: Mod, thumbnail: string) => {
    try {
        const result = await invoke('set_mod_thumbnail', { path: mod.path, thumbnail });
        return result;
    } catch (error) {
        console.error('Error setting mod thumbnail:', error);
        throw error;
    }
}

export const setModDetails = async (mod: Mod) => {
    try {
        const result = await invoke('set_mod_details', { name: mod.name, path: mod.path, author: mod.author || '', description: mod.description || '', version: mod.version || '' });
        return result;
    } catch (error) {
        console.error('Error setting mod details:', error);
        throw error;
    }
}
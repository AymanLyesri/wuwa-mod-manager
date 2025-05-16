// // import { invoke } from '@tauri-apps/api/tauri';
// import { appDataDir, join } from '@tauri-apps/api/path';
// import { Mod } from '../interfaces/Mod.interface';

// const { invoke } = window.__TAURI__;

// // Get the list of mods from a directory
// export async function getModsFromDirectory(directoryPath: string): Promise<Mod[]> {
//     try {
//         const mods: Mod[] = await invoke('scan_mods_directory', {
//             path: directoryPath
//         });
//         return mods;
//     } catch (error) {
//         console.error('Error scanning mods directory:', error);
//         return [];
//     }
// }

// // Save the mod directory path to a config file
// export async function saveModDirectoryPath(path: string): Promise<void> {
//     const configPath = await join(await appDataDir(), 'mod_manager_config.json');
//     await invoke('save_config_file', {
//         path: configPath,
//         contents: JSON.stringify({ modDirectory: path })
//     });
// }

// // Load the saved mod directory path
// export async function loadModDirectoryPath(): Promise<string | null> {
//     try {
//         const configPath = await join(await appDataDir(), 'mod_manager_config.json');
//         const config: string = await invoke('load_config_file', { path: configPath });
//         return JSON.parse(config).modDirectory;
//     } catch (error) {
//         return null;
//     }
// }
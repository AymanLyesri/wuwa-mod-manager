import { toast } from "react-toastify";
import { Preset } from "../interfaces/Preset.interface";
import { invoke } from "@tauri-apps/api/core";

interface BackendPreset {
  name: string;
  enabled_mods: string[];
}

export const savePreset = async (modDirPath: string, preset: Preset) => {
  try {
    await invoke("save_preset", {
      path: modDirPath,
      presetName: preset.name,
      enabledMods: preset.modIds,
    });
    toast.success("Preset saved successfully");
  } catch (error) {
    console.error("Error saving preset:", error);
    toast.error("Error saving preset");
    throw error;
  }
};

export const getPresets = async (modDirPath: string): Promise<Preset[]> => {
  try {
    const presets = await invoke<Record<string, BackendPreset>>("get_presets", {
      path: modDirPath,
    });

    // Convert the backend format to our frontend Preset interface
    return Object.entries(presets).map(
      ([id, data]: [string, BackendPreset]) => ({
        id,
        name: data.name,
        modIds: data.enabled_mods,
        createdAt: new Date().toISOString(), // Backend doesn't provide these yet
        updatedAt: new Date().toISOString(),
      })
    );
  } catch (error) {
    console.error("Error getting presets:", error);
    toast.error("Error getting presets");
    throw error;
  }
};

export const deletePreset = async (modDirPath: string, presetId: string) => {
  try {
    await invoke("delete_preset", {
      path: modDirPath,
      presetId,
    });
    toast.success("Preset deleted successfully");
  } catch (error) {
    console.error("Error deleting preset:", error);
    toast.error("Error deleting preset");
    throw error;
  }
};

export const applyPreset = async (modDirPath: string, presetId: string) => {
  try {
    await invoke("apply_preset", {
      path: modDirPath,
      presetId,
    });
    toast.success("Preset applied successfully");
  } catch (error) {
    console.error("Error applying preset:", error);
    toast.error("Error applying preset");
    throw error;
  }
};

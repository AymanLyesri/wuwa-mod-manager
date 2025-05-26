import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { Mod } from "../interfaces/Mod.interface";
import { toast } from "react-toastify";
// import { reloadGame } from "./game.service";

interface DownloadProgress {
  downloaded: number;
  total: number;
}

export const addMod = async (path: string, to: string): Promise<Mod> => {
  // Ensure the path and to is not an empty string
  if (!path || !to) {
    toast.error("Invalid path or destination");
    throw new Error("Invalid path or destination");
  }

  try {
    const result: Mod = await invoke("add_mod", { path, to });
    toast.success("Mod added successfully");
    return result;
  } catch (error) {
    console.error("Error adding mod:", error);
    toast.error("Error adding mod");
    throw error;
  }
};

export const setModInfo = async (mod: Mod): Promise<Mod> => {
  try {
    const result: Mod = await invoke("set_mod_info", { modData: mod });
    toast.success("Mod info updated successfully");
    return result;
  } catch (error) {
    console.error("Error setting mod details:", error);
    toast.error("Error setting mod details");
    throw error;
  }
};

export const setModThumbnail = async ({
  mod,
  thumbnailPath = "",
  base64 = "",
}: {
  mod: Mod;
  thumbnailPath?: string;
  base64?: string;
}) => {
  try {
    const result = await invoke("set_mod_thumbnail", {
      path: mod.path,
      thumbnailPath,
      base64,
    });
    toast.success("Mod thumbnail updated successfully");
    return result;
  } catch (error) {
    console.error("Error setting mod thumbnail:", error);
    toast.error("Error setting mod thumbnail");
    throw error;
  }
};

export const downloadMod = async (url: string, to: string) => {
  const toastId = toast.loading("Preparing download...");

  try {
    // Listen for progress events
    const unlisten = await listen<DownloadProgress>(
      "download-progress",
      (event) => {
        const { downloaded, total } = event.payload;
        const progress = total ? Math.round((downloaded / total) * 100) : 0;
        toast.update(toastId, {
          render: `Downloading mod... ${progress}%`,
        });
      }
    );

    // Start the download
    await invoke("download_mod", { url, to });

    // Cleanup listener
    unlisten();

    // Update toast on success
    toast.update(toastId, {
      render: "Mod downloaded successfully",
      type: "success",
      isLoading: false,
      autoClose: 1000,
    });
  } catch (error) {
    // Cleanup listener if it exists
    try {
      const unlisten = await listen("download-progress", () => {});
      unlisten();
    } catch {}

    // Update toast on error
    toast.update(toastId, {
      render: "Error downloading mod",
      type: "error",
      isLoading: false,
      autoClose: 1000,
    });
    throw error;
  }
};

export const deleteMod = async (mod: Mod) => {
  try {
    const result = await invoke("delete_mod", { path: mod.path });
    toast.success("Mod deleted successfully");
    return result;
  } catch (error) {
    console.error("Error deleting mod:", error);
    toast.error("Error deleting mod");
    throw error;
  }
};

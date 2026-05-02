import { invoke } from "@tauri-apps/api/core";
import { toast } from "react-toastify";

const MIME_TYPES: Record<string, string> = {
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    webp: "image/webp",
    gif: "image/gif",
    bmp: "image/bmp",
    svg: "image/svg+xml",
};

export const getImageSrc = async (path: string): Promise<string> => {
    if (!path) return "";

    if (/^data:image\//i.test(path) || /^https?:\/\//i.test(path)) {
        return path;
    }
    try {
        const base64 = await invoke<string>("read_image_file", { path });
        const extension = path.split(".").pop()?.toLowerCase() || "";
        const mimeType = MIME_TYPES[extension] || "image/png";

        return `data:${mimeType};base64,${base64}`;
    } catch (error) {
        console.error("Error loading image:", error);
        toast.error("Error loading image preview");
        throw error;
    }
};
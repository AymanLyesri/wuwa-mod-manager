import React, { useState, useEffect, useCallback, useRef } from "react";
import { Mod } from "../interfaces/Mod.interface";
import { open } from "@tauri-apps/plugin-dialog";
import { readText } from "@tauri-apps/plugin-clipboard-manager";
import { setModThumbnail } from "../services/mod.service";
import { getCategories } from "../services/category.service";
import { Character } from "../interfaces/Character.interface";
import { COLORS, STYLE } from "../constants/styling.constant";
import StatusButton from "./StatusButton";
import { motion } from "framer-motion";
import { getImageSrc } from "../services/image.service";

interface ModInfoPanelProps {
  mod: Mod;
  characters: Character[];
  isOpen?: boolean;
  onUpdate: (mod: Mod) => void;
  onClose: () => void;
}

const ModInfoPanel: React.FC<ModInfoPanelProps> = ({
  mod,
  characters,
  isOpen = true,
  onUpdate,
  onClose,
}) => {
  const [focusedMod, setFocusedMod] = useState<Mod>(mod);
  const [thumbnailPath, setThumbnailPath] = useState<string>("");
  const [thumbnailBase64, setThumbnailBase64] = useState<string>("");
  const [displayThumbnail, setDisplayThumbnail] = useState<string>("");
  const thumbnailRefZone = useRef<HTMLDivElement>(null);
  const staticCategories = getCategories();
  const panelCharacters =
    characters.length > 0
      ? characters
      : staticCategories.map((c) => ({ name: c.name, thumbnail: c.icon }));

  useEffect(() => {
    setFocusedMod(mod);
    if (mod.thumbnail) {
      getImageSrc(mod.thumbnail)
        .then(setDisplayThumbnail)
        .catch((error) => {
          console.error("Error loading thumbnail preview:", error);
          setDisplayThumbnail("");
        });
    } else {
      setDisplayThumbnail("");
    }
    if (isOpen && thumbnailRefZone.current) {
      thumbnailRefZone.current.focus();
    }
  }, [mod, isOpen]);

  const handleChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      const { name, value } = e.target;
      setFocusedMod((prev) => ({ ...prev, [name]: value }));

      // Immediately update the mod when category changes
      if (name === "category") {
        onUpdate({ ...focusedMod, [name]: value });
      }
    },
    [focusedMod, onUpdate]
  );

  const handleToggle = useCallback(() => {
    onUpdate({ ...focusedMod, enabled: !focusedMod.enabled });
  }, [focusedMod, onUpdate]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (thumbnailPath) setModThumbnail({ mod: focusedMod, thumbnailPath });
      if (thumbnailBase64)
        setModThumbnail({ mod: focusedMod, base64: thumbnailBase64 });
      onUpdate(focusedMod);
      setThumbnailPath("");
      setThumbnailBase64("");
    },
    [focusedMod, onUpdate, thumbnailPath, thumbnailBase64]
  );

  const handleImage = useCallback(async (file: File | string) => {
    try {
      if (typeof file === "string") {
        setThumbnailPath(file);
        setDisplayThumbnail(await getImageSrc(file));
      } else {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          setThumbnailBase64(result.replace(/^data:image\/\w+;base64,/, ""));
          setDisplayThumbnail(result);
        };
        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.error("Error processing image:", error);
    }
  }, []);

  const handleThumbnailChange = useCallback(async () => {
    try {
      const file = await open({
        multiple: false,
        directory: false,
        filters: [
          { name: "Images", extensions: ["png", "jpg", "jpeg", "webp"] },
        ],
      });
      if (file) handleImage(file as string);
    } catch (error) {
      console.error("Error selecting image:", error);
    }
  }, [handleImage]);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      if (file?.type.startsWith("image/")) handleImage(file);
    },
    [handleImage]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const handlePaste = useCallback(
    async (e: React.ClipboardEvent<HTMLDivElement>) => {
      console.log("Paste event detected");
      e.preventDefault();
      e.stopPropagation();

      const items = e.clipboardData?.items;
      console.log("Clipboard items:", items);

      if (!items || items.length === 0) {
        console.log("No items in clipboard");
      }

      for (let i = 0; i < items.length; i++) {
        console.log(`Item ${i}: type=${items[i].type}`);
        if (items[i].type.startsWith("image/")) {
          const file = items[i].getAsFile();
          console.log("Image file found:", file);
          if (file) {
            handleImage(file);
            break;
          }
        }
      }

      const html = e.clipboardData?.getData("text/html") || "";
      console.log("Clipboard HTML:", html);

      if (!html) return;

      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const imageElement = doc.querySelector("img");
      const imageSrc = imageElement?.getAttribute("src") || "";

      console.log("Extracted image src:", imageSrc);

      if (!imageSrc) return;

      if (imageSrc.startsWith("data:image/")) {
        console.log("Using data URL from HTML clipboard");
        handleImage(imageSrc);
        return;
      }

      if (/^https?:\/\//i.test(imageSrc)) {
        console.log("Fetching remote clipboard image:", imageSrc);
        try {
          const response = await fetch(imageSrc);
          console.log("Clipboard image fetch response:", response.status);
          if (!response.ok) return;

          const blob = await response.blob();
          console.log("Fetched clipboard image blob:", blob);
          handleImage(
            new File([blob], "pasted-image.png", {
              type: blob.type || "image/png",
            })
          );
        } catch (error) {
          console.error("Error fetching clipboard image:", error);
        }
      }
    },
    [handleImage]
  );

  const handlePasteButton = useCallback(async () => {
    // First try Tauri clipboard text (works in environments where navigator.clipboard.read is blocked)
    try {
      const text = await readText();
      if (text) {
        if (text.startsWith("data:image/")) {
          handleImage(text);
          return;
        }

        if (text.includes("<img")) {
          const parser = new DOMParser();
          const doc = parser.parseFromString(text, "text/html");
          const imageElement = doc.querySelector("img");
          const imageSrc = imageElement?.getAttribute("src") || "";
          if (imageSrc) {
            if (imageSrc.startsWith("data:image/")) {
              handleImage(imageSrc);
              return;
            }
            if (/^https?:\/\//i.test(imageSrc)) {
              const response = await fetch(imageSrc);
              if (!response.ok) return;
              const blob = await response.blob();
              handleImage(
                new File([blob], "pasted-image.png", { type: blob.type || "image/png" })
              );
              return;
            }
          }
        }

        if (/^https?:\/\//i.test(text)) {
          const response = await fetch(text);
          if (!response.ok) return;
          const blob = await response.blob();
          handleImage(new File([blob], "pasted-image.png", { type: blob.type || "image/png" }));
          return;
        }
      }
    } catch (err) {
      console.debug("readText fallback did not yield image/text or failed:", err);
    }

    // As a fallback, try navigator.clipboard.read() for image items — this can throw NotAllowedError in some contexts
    try {
      const nav: any = navigator;
      if (nav.clipboard && typeof nav.clipboard.read === "function") {
        try {
          const clipboardItems = await nav.clipboard.read();
          for (const item of clipboardItems) {
            for (const type of item.types) {
              if (type.startsWith("image/")) {
                const blob = await item.getType(type);
                handleImage(new File([blob], "pasted-image.png", { type: blob.type || "image/png" }));
                return;
              }
            }
          }
        } catch (innerErr) {
          // Likely NotAllowedError — log and return silently
          console.warn("navigator.clipboard.read() blocked or not allowed:", innerErr);
        }
      }
    } catch (error) {
      console.error("Error pasting image from clipboard:", error);
    }
  }, [handleImage]);

  if (!isOpen) return null;

  return (
    <motion.div
      onClick={(e) => e.stopPropagation()}
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className={`
        fixed inset-y-0 right-0 w-full sm:w-[450px] bg-white dark:bg-neutral-800 shadow-2xl
        flex flex-col z-50 overflow-hidden
        border-l border-neutral-200 dark:border-neutral-700
      `}
    >
      {/* Header */}
      <div
        className={`${STYLE.flex.between} p-3 sm:p-4 border-b ${COLORS.border.panel} shrink-0`}
      >
        <h2 className={STYLE.text.heading + " text-lg sm:text-xl"}>
          Mod Details
        </h2>
        <button
          onClick={onClose}
          className={STYLE.button.icon}
          aria-label="Close panel"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {/* Image Upload Section */}
        <div className="relative group max-w-full">
          <div
            ref={thumbnailRefZone}
            className={`
              ${STYLE.image.container}
              ring-1 ring-white/10 dark:ring-black/10
              before:absolute before:inset-0 before:z-10 before:rounded-2xl before:ring-1 before:ring-inset before:ring-white/10 dark:before:ring-white/5
              after:absolute after:inset-0 after:z-10 after:rounded-2xl after:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]
              group-hover:ring-2 group-hover:ring-indigo-500/20 dark:group-hover:ring-indigo-500/10
              transition-all duration-300 ease-out
              aspect-video sm:aspect-[16/9]
              mx-3 sm:mx-4 mt-3 sm:mt-4
              max-w-[calc(100%-24px)]
              cursor-pointer
            `}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onPaste={handlePaste}
            title="Drag or paste image to change"
            tabIndex={0}
          >
            {/* Category Icon */}
            {focusedMod.category && (
              (() => {
                const match = panelCharacters.find(
                  (c) => c.name === focusedMod.category
                );
                if (match && match.thumbnail) {
                  return (
                    <div className="absolute top-3 left-3 z-20 rounded-xl bg-black/70 shadow-sm ring-1 ring-white/5">
                      <img
                        src={match.thumbnail}
                        alt={focusedMod.category}
                        className="w-10 h-10 object-cover"
                        title={focusedMod.category}
                      />
                    </div>
                  );
                }

                // fallback to static category icon
                const staticMatch = staticCategories.find(
                  (cat) => cat.name === focusedMod.category
                );
                if (staticMatch && staticMatch.icon) {
                  return (
                    <div className="absolute top-3 left-3 z-20 rounded-xl bg-black/70 p-2 sm:p-2.5 shadow-sm ring-1 ring-white/5">
                      <img
                        src={staticMatch.icon}
                        alt={focusedMod.category}
                        className="w-5 h-5 sm:w-6 sm:h-6"
                        title={focusedMod.category}
                      />
                    </div>
                  );
                }

                return null;
              })()
            )}

            {displayThumbnail ? (
              <>
                <img
                  src={displayThumbnail}
                  className={`
                    ${STYLE.image.responsive}
                    object-center group-hover:scale-[1.02] transition-transform duration-500
                  `}
                  alt="Mod thumbnail"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-black/5 to-transparent rounded-2xl" />
              </>
            ) : (
              <div
                className={`
                ${STYLE.image.placeholder}
                bg-neutral-100 dark:bg-neutral-800/50
                rounded-2xl
              `}
              >
                <svg
                  className="w-10 h-10 sm:w-14 sm:h-14 mb-2 sm:mb-3 text-neutral-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            )}

            {/* Hover overlay */}
            <div
              className={`
                absolute inset-0 ${STYLE.flex.center} bg-black/50 rounded-2xl
                opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10
                pointer-events-none
              `}
            >
              <div className={STYLE.flex.center + " flex-col"}>
                <p className="text-white text-sm sm:text-base">
                  Paste or Drag image (click to focus)
                </p>
              </div>
            </div>
          </div>

          <div className="absolute bottom-2 right-4 flex gap-2 items-center z-20">
            <button
              type="button"
              onClick={handlePasteButton}
              className={`
                ${STYLE.button.primary}
                text-sm sm:text-base
                py-1.5 sm:py-2 px-3 sm:px-4
                bg-cyan-600 hover:bg-cyan-700
              `}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4 sm:w-5 sm:h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 2h6a2 2 0 012 2v1H7V4a2 2 0 012-2zM7 8h10v10a2 2 0 01-2 2H9a2 2 0 01-2-2V8z" />
              </svg>
              <span>Paste</span>
            </button>

            <button
              onClick={handleThumbnailChange}
              className={`
                ${STYLE.button.primary}
                text-sm sm:text-base
                py-1.5 sm:py-2 px-3 sm:px-4
                bg-black/50 hover:bg-black/60
              `}
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
              <span>Upload</span>
            </button>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="px-3 sm:px-4 pb-20 space-y-4 sm:space-y-6 max-w-full"
        >
          <div className="space-y-3 sm:space-y-4 w-full mt-4">
            {/* Basic Info Section */}
            <div className="space-y-3 w-full">
              <label className={STYLE.text.label}>Basic Information</label>
              <div className="space-y-2 sm:space-y-3 w-full">
                <input
                  type="text"
                  name="name"
                  value={focusedMod.name}
                  onChange={handleChange}
                  placeholder="Mod name"
                  className={STYLE.input + " w-full"}
                />
                <input
                  type="text"
                  name="author"
                  value={focusedMod.author}
                  onChange={handleChange}
                  placeholder="Author"
                  className={STYLE.input + " w-full"}
                />
                <input
                  type="text"
                  name="version"
                  value={focusedMod.version}
                  onChange={handleChange}
                  placeholder="Version"
                  className={STYLE.input + " w-full"}
                />
              </div>
            </div>

            {/* Category Selection */}
            <div className="space-y-2 w-full">
              <label className={STYLE.text.label}>Category</label>
              <select
                name="category"
                value={focusedMod.category}
                onChange={handleChange}
                className={STYLE.select + " w-full"}
              >
                <option value="">Select a category</option>
                {panelCharacters.map((category) => (
                  <option key={category.name} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div className="space-y-2 w-full">
              <label className={STYLE.text.label}>Description</label>
              <textarea
                name="description"
                value={focusedMod.description}
                onChange={handleChange}
                placeholder="Mod description"
                rows={4}
                className={STYLE.input + " w-full resize-none"}
              />
            </div>
          </div>
        </form>
      </div>

      {/* Action Buttons - Fixed to bottom */}
      <div
        className={`
        ${STYLE.flex.between} p-3 sm:p-4 w-full border-t ${COLORS.border.panel}
        bg-white/95 dark:bg-neutral-800/95
        shrink-0
      `}
      >
        <StatusButton mod={focusedMod} onClick={handleToggle} />
        <button
          type="button"
          onClick={handleSubmit}
          className={STYLE.button.primary}
        >
          Save Changes
        </button>
      </div>
    </motion.div>
  );
};

export default React.memo(ModInfoPanel);

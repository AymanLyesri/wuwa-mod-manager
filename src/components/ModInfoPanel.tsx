import React, { useState, useEffect, useCallback, useRef } from "react";
import { Mod } from "../interfaces/Mod.interface";
import { open } from "@tauri-apps/plugin-dialog";
import { setModThumbnail } from "../services/mod.service";
import { convertFileSrc } from "@tauri-apps/api/core";
import { getCategories } from "../services/category.service";
import { COLORS, STYLE } from "../constants/styling.constant";
import StatusButton from "./StatusButton";
import { motion } from "framer-motion";

interface ModInfoPanelProps {
  mod: Mod;
  isOpen?: boolean;
  onUpdate: (mod: Mod) => void;
  onClose: () => void;
}

const ModInfoPanel: React.FC<ModInfoPanelProps> = ({
  mod,
  isOpen = true,
  onUpdate,
  onClose,
}) => {
  const [focusedMod, setFocusedMod] = useState<Mod>(mod);
  const [thumbnailPath, setThumbnailPath] = useState<string>("");
  const [thumbnailBase64, setThumbnailBase64] = useState<string>("");
  const [displayThumbnail, setDisplayThumbnail] = useState<string>("");
  const thumbnailRefZone = useRef<HTMLDivElement>(null);
  const categories = getCategories();

  useEffect(() => {
    setFocusedMod(mod);
    setDisplayThumbnail(mod.thumbnail ? convertFileSrc(mod.thumbnail) : "");
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
        setDisplayThumbnail(convertFileSrc(file));
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

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLDivElement>) => {
      const file =
        e.clipboardData.files?.[0] ||
        Array.from(e.clipboardData.items)
          .find((item) => item.type.startsWith("image/"))
          ?.getAsFile();
      if (file) handleImage(file);
    },
    [handleImage]
  );

  if (!isOpen) return null;

  return (
    <motion.div
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
            `}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onPaste={handlePaste}
            title="Drag or paste image to change"
            tabIndex={0}
          >
            {/* Category Icon */}
            {focusedMod.category &&
              categories.find((cat) => cat.name === focusedMod.category)
                ?.icon && (
                <div className="absolute top-3 left-3 z-20 rounded-xl bg-black/30 backdrop-blur-sm p-2 sm:p-2.5 shadow-lg ring-1 ring-white/10">
                  <img
                    src={
                      categories.find((cat) => cat.name === focusedMod.category)
                        ?.icon
                    }
                    alt={focusedMod.category}
                    className="w-5 h-5 sm:w-6 sm:h-6"
                    title={focusedMod.category}
                  />
                </div>
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
                rounded-2xl backdrop-blur-sm
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
                <span className={STYLE.text.caption + " text-sm sm:text-base"}>
                  Drop image here or click to browse
                </span>
              </div>
            )}

            {/* Hover overlay */}
            <div
              className={`
                absolute inset-0 ${STYLE.flex.center} bg-black/40 backdrop-blur-[2px] rounded-2xl
                opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10
              `}
            >
              <div className={STYLE.flex.center + " flex-col"}>
                <svg
                  className="w-8 h-8 sm:w-10 sm:h-10 mb-2 sm:mb-3 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-white text-sm sm:text-base">
                  Click to change image
                </p>
              </div>
            </div>
          </div>

          {/* Upload button */}
          <button
            onClick={handleThumbnailChange}
            className={`
              absolute bottom-6 right-6 z-20
              ${STYLE.button.primary}
              text-sm sm:text-base
              py-1.5 sm:py-2 px-3 sm:px-4
              bg-black/50 hover:bg-black/60
              backdrop-blur-sm
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
                {categories.map((category) => (
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
        bg-white dark:bg-neutral-800 backdrop-blur-sm
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

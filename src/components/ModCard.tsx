import React from "react";
import { Mod } from "../interfaces/Mod.interface";
import { convertFileSrc } from "@tauri-apps/api/core";
import StatusButton from "./StatusButton";
import { STYLE } from "../constants/styling.constant";
import { getCategories } from "../services/category.service";
import { openPath } from "@tauri-apps/plugin-opener";

interface ModCardProps {
  mod: Mod;
  onUpdateMod: (mod: Mod) => void;
  onClick: () => void;
}

const ModCard: React.FC<ModCardProps> = ({ mod, onUpdateMod, onClick }) => {
  const categories = getCategories();
  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateMod({ ...mod, enabled: !mod.enabled });
  };

  const handleOpenFiles = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await openPath(mod.path);
    } catch (error) {
      console.error("Failed to open mod directory:", error);
    }
  };

  return (
    <div
      className={`
      ${STYLE.card} 
      group/card
      hover:shadow-2xl hover:shadow-neutral-200/20 dark:hover:shadow-black/40
      hover:-translate-y-1
      transition-all duration-300 ease-out
      h-full flex flex-col
    `}
      onClick={onClick}
    >
      {/* Image container */}
      <div
        className={`
        ${STYLE.image.container}
        ring-1 ring-white/10 dark:ring-black/10
        before:absolute before:inset-0 before:z-10 before:rounded-2xl before:ring-1 before:ring-inset before:ring-white/10 dark:before:ring-white/5
        after:absolute after:inset-0 after:z-10 after:rounded-2xl after:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]
        overflow-hidden
        aspect-[16/9] sm:aspect-[4/3]
      `}
      >
        {/* Category Icon */}
        {mod.category &&
          categories.find((cat) => cat.name === mod.category)?.icon && (
            <div className="absolute top-3 left-3 z-20 rounded-xl bg-black/30 backdrop-blur-sm p-2 sm:p-2.5 shadow-lg ring-1 ring-white/10">
              <img
                src={categories.find((cat) => cat.name === mod.category)?.icon}
                alt={mod.category}
                className="w-5 h-5 sm:w-6 sm:h-6"
                title={mod.category}
              />
            </div>
          )}

        {mod.thumbnail ? (
          <div className="absolute inset-0 overflow-hidden rounded-2xl">
            <img
              src={convertFileSrc(mod.thumbnail) + "?t=" + Date.now()}
              alt={mod.name}
              className={`
                ${STYLE.image.responsive}
                object-center scale-100 group-hover/card:scale-110
                transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]
              `}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/5 to-transparent opacity-70 group-hover/card:opacity-100 transition-opacity duration-300" />
          </div>
        ) : (
          <div
            className={`
            ${STYLE.image.placeholder}
            bg-neutral-100 dark:bg-neutral-800/50
            rounded-2xl backdrop-blur-sm
          `}
          >
            <svg
              className="w-10 h-10 sm:w-14 sm:h-14 mb-2 sm:mb-3 text-neutral-400 dark:text-neutral-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
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
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col space-y-3 ">
        {/* Header with version */}
        <div className={STYLE.flex.between}>
          <h3
            className={
              STYLE.text.heading + " truncate max-w-[80%] text-base sm:text-lg"
            }
          >
            {mod.name}
          </h3>
          {mod.version && (
            <span
              className={`${STYLE.badge.base} ${
                mod.enabled ? STYLE.badge.success : STYLE.badge.disabled
              } text-xs sm:text-sm`}
            >
              v{mod.version}
            </span>
          )}
        </div>

        {/* Author */}
        {mod.author && (
          <p className={STYLE.text.caption + " italic text-xs sm:text-sm"}>
            by {mod.author}
          </p>
        )}

        {/* Description */}
        {mod.description && (
          <p
            className={`${STYLE.text.body} line-clamp-2 text-sm sm:text-base flex-1`}
          >
            {mod.description}
          </p>
        )}

        {/* Buttons */}
        <div className={STYLE.flex.between + " mt-auto pt-2 sm:pt-3"}>
          <div className="flex items-center gap-2">
            <StatusButton mod={mod} onClick={handleToggle} />
            <button
              className={STYLE.button.icon + " p-1.5"}
              onClick={handleOpenFiles}
              title="Open Files"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {mod.enabled && (
        <div className="absolute top-0 right-0 w-full">
          <div className="h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_1px_4px_rgba(16,185,129,0.3)]" />
        </div>
      )}
    </div>
  );
};

export default ModCard;

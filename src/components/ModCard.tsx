import React from "react";
import { invoke } from "@tauri-apps/api/core";
import { Mod } from "../interfaces/Mod.interface";
import StatusButton from "./StatusButton";
import { STYLE } from "../constants/styling.constant";
import { getCategories } from "../services/category.service";
import { getImageSrc } from "../services/image.service";
import { Character } from "../interfaces/Character.interface";

interface ModCardProps {
  mod: Mod;
  characters: Character[];
  onUpdateMod: (mod: Mod) => void;
  onClick: () => void;
}

const ModCard: React.FC<ModCardProps> = ({
  mod,
  characters,
  onUpdateMod,
  onClick,
}) => {
  const categories = getCategories();
  const [thumbnailSrc, setThumbnailSrc] = React.useState("");

  const normalizeForMatch = (value: string) =>
    value
      .replace(/\\/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");

  const categoryMatch = React.useMemo(() => {
    if (!mod.category) return null;

    const normalizedCategory = normalizeForMatch(mod.category);

    const liveCharacterMatch = characters
      .filter((character) => character.name)
      .map((character) => ({
        character,
        normalizedName: normalizeForMatch(character.name),
      }))
      .filter(({ normalizedName }) =>
        normalizedName && normalizedCategory.includes(normalizedName)
      )
      .sort((a, b) => b.normalizedName.length - a.normalizedName.length)[0]
      ?.character;

    if (liveCharacterMatch?.thumbnail) {
      return { icon: liveCharacterMatch.thumbnail };
    }

    return categories
      .filter((category) => category.name !== "*Uncategorized")
      .map((category) => {
        const categoryName = category.name.replace(/\\/g, "");
        return {
          category,
          normalizedName: normalizeForMatch(categoryName),
        };
      })
      .filter(({ normalizedName }) =>
        normalizedName && normalizedCategory.includes(normalizedName)
      )
      .sort((a, b) => b.normalizedName.length - a.normalizedName.length)[0]
      ?.category;
  }, [characters, categories, mod.category]);

  React.useEffect(() => {
    let active = true;

    if (!mod.thumbnail) {
      setThumbnailSrc("");
      return;
    }

    getImageSrc(mod.thumbnail)
      .then((src) => {
        if (active) setThumbnailSrc(src);
      })
      .catch((error) => {
        console.error("Failed to load mod thumbnail:", error);
        if (active) setThumbnailSrc("");
      });

    return () => {
      active = false;
    };
  }, [mod.thumbnail]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateMod({ ...mod, enabled: !mod.enabled });
  };

  const handleOpenFiles = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await invoke("plugin:opener|reveal_item_in_dir", {
        paths: [mod.path],
      });
    } catch (error) {
      console.error("Failed to open mod directory:", error);
    }
  };
  return (
    <div
      className={`${STYLE.cardApple} group/card cursor-pointer w-full`}
      onClick={onClick}
      role="button"
      aria-label={`Open ${mod.name}`}
    >
      {/* Left accent when enabled */}
      {mod.enabled && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-400/80 shadow-[0_6px_16px_rgba(16,185,129,0.12)]" />
      )}

      {/* Image - edge to edge */}
      <div className={`relative ${STYLE.image.container} aspect-[16/10]`}>
        {thumbnailSrc ? (
          <img
            src={thumbnailSrc}
            alt={mod.name}
            className={`${STYLE.image.responsive} object-center group-hover/card:scale-105 transition-transform duration-500`}
          />
        ) : (
          <div className={`${STYLE.image.placeholder} rounded-b-none`}>
            <svg
              className="w-12 h-12 text-neutral-400 dark:text-neutral-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Category icon */}
        {mod.category && categoryMatch?.icon && (
          <div className="absolute top-4 left-4 z-20 rounded-full bg-white/30 dark:bg-black/30 backdrop-blur-md p-1 shadow">
            <img src={categoryMatch.icon} alt={mod.category} className="w-9 h-9 rounded-full object-cover" title={mod.category} />
          </div>
        )}

        {/* subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-lg sm:text-xl font-semibold text-neutral-900 dark:text-white truncate">
              {mod.name}
            </h3>
            {mod.author && (
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 truncate">by {mod.author}</p>
            )}
          </div>

          <div className="flex items-start gap-2">
            {mod.version && (
              <span className={`${STYLE.badge.base} ${mod.enabled ? STYLE.badge.success : STYLE.badge.disabled} text-xs`}>v{mod.version}</span>
            )}
            <div>
              <StatusButton mod={mod} onClick={(e) => { e.stopPropagation(); handleToggle(e as any); }} />
            </div>
          </div>
        </div>

        {mod.description && (
          <p className="text-sm text-neutral-700 dark:text-neutral-300 line-clamp-3">{mod.description}</p>
        )}

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <button
              className={`${STYLE.button.icon} p-2 bg-white/0 dark:bg-transparent rounded-full`}
              onClick={(e) => { e.stopPropagation(); handleOpenFiles(e); }}
              title="Open Files"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-neutral-600 dark:text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </button>
          </div>

          <div className="text-xs text-neutral-400">{mod.category ?? "Uncategorized"}</div>
        </div>
      </div>
    </div>
  );
};

export default ModCard;

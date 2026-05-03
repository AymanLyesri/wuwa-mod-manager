import React, { useState, useEffect, useRef } from "react";
import ModCard from "./ModCard";
import { Mod } from "../interfaces/Mod.interface";
import { TRANSITIONS } from "../constants/styling.constant";
import { motion } from "framer-motion";
import Masonry from "react-masonry-css";
import { Character } from "../interfaces/Character.interface";

interface ModGridProps {
  mods: Mod[];
  characters: Character[];
  onUpdateMod: (mod: Mod) => void;
  onModClick: (mod: Mod) => void;
  selectedMods: Mod[];
  onSelectedModsChange: (mods: Mod[]) => void;
  isSelectMode: boolean;
}

const ModGrid: React.FC<ModGridProps> = ({
  mods,
  characters,
  onUpdateMod,
  onModClick,
  selectedMods,
  onSelectedModsChange,
  isSelectMode,
}) => {
  const [filteredMods, setFilteredMods] = useState<Mod[]>(mods);
  const observerTarget = useRef(null);

  // Apply saved filters when mods change
  useEffect(() => {
    const savedFilters = localStorage.getItem("modFilters");
    const savedSort = localStorage.getItem("modSort");

    if (savedFilters || savedSort) {
      const filters = savedFilters ? JSON.parse(savedFilters) : {};
      const sortMethod = savedSort || "name-asc";

      let filtered = mods.filter((mod) =>
        Object.entries(filters).every(
          ([k, v]) => v === "" || mod[k as keyof Mod]?.toString() === v
        )
      );

      filtered = [...filtered].sort((a, b) => {
        const [sortKey, sortDirection] = sortMethod.split("-");
        if (sortKey === "enabled") {
          return sortDirection === "asc"
            ? Number(a.enabled) - Number(b.enabled)
            : Number(b.enabled) - Number(a.enabled);
        }

        const aValue = a[sortKey as keyof Mod]?.toString().toLowerCase() || "";
        const bValue = b[sortKey as keyof Mod]?.toString().toLowerCase() || "";

        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      });

      setFilteredMods(filtered);
    } else {
      setFilteredMods(mods);
    }
  }, [mods]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Compact mode detection for header styling
        entry.isIntersecting; // Just for future use if needed
      },
      {
        threshold: 0,
        rootMargin: "-65px 0px 0px 0px", // Offset for the navbar and header
      }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, []);

  const toggleModSelection = (mod: Mod) => {
    if (selectedMods.includes(mod)) {
      onSelectedModsChange(selectedMods.filter((m) => m.id !== mod.id));
    } else {
      onSelectedModsChange([...selectedMods, mod]);
    }
  };

  return (
    <div className="w-full mt-42 md:mt-15">
      {/* Observer target */}
      <div ref={observerTarget} className="h-1 w-full absolute top-0" />

      {/* Mods Grid */}
      <div className="max-w-7xl mx-auto px-4 pt-[130px]">
        <Masonry
          breakpointCols={{
            2400: 4,
            1800: 3,
            1200: 2,
            600: 1,
          }}
          className="my-masonry-grid"
          columnClassName="my-masonry-grid_column"
        >
          {filteredMods.map((mod) => (
            <motion.div
              key={mod.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              className={`
                relative ${TRANSITIONS.base}
                mb-6
                ${selectedMods.includes(mod)
                  ? "ring-2 ring-indigo-500 scale-[0.98]"
                  : ""
                }
              `}
              onClick={() => isSelectMode && toggleModSelection(mod)}
            >
              {isSelectMode && (
                <div className="absolute top-3 left-3 z-10">
                  <input
                    type="checkbox"
                    checked={selectedMods.includes(mod)}
                    onChange={() => toggleModSelection(mod)}
                    className="h-5 w-5 rounded-md border-neutral-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              )}
              <ModCard
                mod={mod}
                characters={characters}
                onUpdateMod={onUpdateMod}
                onClick={() => !isSelectMode && onModClick(mod)}
              />
            </motion.div>
          ))}
        </Masonry>
      </div>
    </div>
  );
};

export default ModGrid;

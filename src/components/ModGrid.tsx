import React, { useState, useEffect, useRef } from "react";
import ModCard from "./ModCard";
import { Mod } from "../interfaces/Mod.interface";
import { STYLE, TRANSITIONS } from "../constants/styling.constant";
import { motion } from "framer-motion";
import FilterMods from "./Filter";
import PresetComponent from "./Preset";
import Masonry from "react-masonry-css";

interface ModGridProps {
  mods: Mod[];
  modDirPath?: string;
  onUpdateMod: (mod: Mod) => void;
  onModClick: (mod: Mod) => void;
  onDeleteMods: (mods: Mod[]) => void;
  fetchMods: () => void;
}

const ModGrid: React.FC<ModGridProps> = ({
  mods,
  modDirPath,
  onUpdateMod,
  onModClick,
  onDeleteMods,
  fetchMods,
}) => {
  const [selectedMods, setSelectedMods] = useState<Mod[]>([]);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [filteredMods, setFilteredMods] = useState<Mod[]>(mods);
  const [isCompact, setIsCompact] = useState(false);
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
        setIsCompact(!entry.isIntersecting);
      },
      {
        threshold: 0,
        rootMargin: "-57px 0px 0px 0px", // Offset for the main header
      }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, []);

  const toggleModSelection = (mod: Mod) => {
    if (selectedMods.includes(mod)) {
      setSelectedMods(selectedMods.filter((m) => m.id !== mod.id));
    } else {
      setSelectedMods([...selectedMods, mod]);
    }
  };

  const handleDeleteSelected = () => {
    onDeleteMods(selectedMods);
    setSelectedMods([]);
    setIsSelectMode(false);
  };

  const toggleSelectMode = () => {
    setIsSelectMode(!isSelectMode);
    if (!isSelectMode) {
      setSelectedMods([]);
    }
  };

  const handleApplyPreset = async () => {
    // Update all mods based on the preset
    // for (const mod of mods) {
    //   const shouldBeEnabled = modIds.includes(mod.id);
    //   if (mod.enabled !== shouldBeEnabled) {
    //     try {
    //       await onUpdateMod({ ...mod, enabled: shouldBeEnabled });
    //     } catch (error) {
    //       console.error(`Failed to update mod ${mod.name}:`, error);
    //       // Continue with other mods even if one fails
    //       continue;
    //     }
    //   }
    // }
    // Refresh the mods list to ensure we have the latest state
    await fetchMods();
  };

  return (
    <div className="w-full">
      {/* Observer target */}
      <div ref={observerTarget} className="h-1 w-full absolute top-0" />
      {/* Header Section */}
      <div
        className={`modgrid-header sticky top-[57px] z-40 ${STYLE.panel} ${
          isCompact ? "compact" : ""
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <div
            className={STYLE.flex.between + " flex-col md:flex-row gap-4 px-10"}
          >
            {/* Title and Stats Section */}
            <div className="space-y-2">
              <div className={STYLE.flex.start}>
                <h2 className={STYLE.text.heading}>Installed Mods</h2>
              </div>

              <div className={STYLE.flex.wrap + " gap-2"}>
                {/* Mod Count */}
                <div
                  className={`${STYLE.text.label} ${STYLE.flex.center} gap-1.5`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{mods.length} mods installed</span>
                </div>

                {/* Enabled Count */}
                <div
                  className={`${STYLE.text.label} ${STYLE.flex.center} gap-1.5`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>
                    {mods.filter((mod) => mod.enabled).length} mods enabled
                  </span>
                </div>
              </div>
            </div>

            {/* Actions Section */}
            <div
              className={
                STYLE.flex.center +
                " gap-2 flex-wrap sm:flex-nowrap justify-end"
              }
            >
              {/* Refresh Button */}
              <button
                className={STYLE.button.icon}
                onClick={fetchMods}
                title="Refresh mods"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              <div className="p-0">
                <PresetComponent
                  mods={mods}
                  onApplyPreset={handleApplyPreset}
                  modDirPath={modDirPath}
                />
              </div>

              <div className="p-0">
                <FilterMods mods={mods} onFilter={setFilteredMods} />
              </div>

              {/* Select Mode Toggle */}
              <button
                onClick={toggleSelectMode}
                className={STYLE.button.secondary}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{isSelectMode ? "Cancel" : "Select"}</span>
              </button>

              {/* Delete Selected Button */}
              {isSelectMode && selectedMods.length > 0 && (
                <button
                  onClick={handleDeleteSelected}
                  className={STYLE.button.secondary + " !bg-red-500 text-white"}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Delete {selectedMods.length} Selected</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mods Grid */}
      <div className="max-w-7xl mx-auto px-4">
        <Masonry
          breakpointCols={{
            2000: 4,
            1400: 3,
            800: 2,
            0: 1,
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
                ${
                  selectedMods.includes(mod)
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

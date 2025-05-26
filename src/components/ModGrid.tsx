import React, { useState, useEffect, useRef } from "react";
import ModCard from "./ModCard";
import { Mod } from "../interfaces/Mod.interface";
import { STYLE, TRANSITIONS } from "../constants/styling.constant";
import { motion } from "framer-motion";
import FilterMods from "./Filter";
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
                  <span>{mods.filter((m) => m.enabled).length} enabled</span>
                </div>

                {/* Mod Directory Path */}
                {modDirPath && (
                  <div
                    className={`${STYLE.text.label} ${STYLE.flex.center} gap-1.5 max-w-full`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 flex-shrink-0"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M2 6a2 2 0 012-2h4l2 2h4a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span
                      className="truncate max-w-[120px] xs:max-w-[180px] sm:max-w-xs lg:max-w-md"
                      title={modDirPath}
                    >
                      {modDirPath}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons Section */}
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

              {/* Delete Selected (when in select mode) */}
              {isSelectMode && selectedMods.length > 0 && (
                <button
                  onClick={handleDeleteSelected}
                  className={`${STYLE.button.primary} bg-rose-500 hover:bg-rose-600`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  <span>Delete ({selectedMods.length})</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mod Grid using Masonry */}
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

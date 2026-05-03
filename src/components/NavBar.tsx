import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import React, { useState, useEffect } from "react";
import { COLORS, STYLE, TRANSITIONS } from "../constants/styling.constant";
import { addMod, downloadMod } from "../services/mod.service";
import { open } from "@tauri-apps/plugin-dialog";
import { readText } from "@tauri-apps/plugin-clipboard-manager";
import PresetComponent from "./Preset";
import FilterMods from "./Filter";
import { Mod } from "../interfaces/Mod.interface";

interface HeaderProps {
  refreshMods: () => void;
  setModDirPath: (path: string) => void;
  darkMode: boolean;
  setDarkMode: (darkMode: boolean) => void;
  // ModGrid Header props
  mods?: Mod[];
  isSelectMode?: boolean;
  selectedMods?: Mod[];
  isCompact?: boolean;
  modDirPath?: string;
  onToggleSelectMode?: () => void;
  onDeleteSelected?: () => void;
  onApplyPreset?: () => void;
  onFetchMods?: () => void;
  onFilter?: (filteredMods: Mod[]) => void;
}

const Header: React.FC<HeaderProps> = ({
  refreshMods,
  setModDirPath,
  darkMode,
  setDarkMode,
  mods = [],
  isSelectMode = false,
  selectedMods = [],
  isCompact = false,
  modDirPath,
  onToggleSelectMode,
  onDeleteSelected,
  onApplyPreset,
  onFetchMods,
  onFilter,
}) => {
  const [modUrl, setModUrl] = useState("");

  // Apply dark mode class to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("darkMode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("darkMode", "false");
    }
  }, [darkMode]);

  // Then add this function to your App component
  const handleSelectFolder = async () => {
    try {
      const file = await open({
        multiple: false,
        directory: true,
      });

      if (file) {
        const selectedPath = file as string;
        setModDirPath(selectedPath);
        localStorage.setItem("modDirPath", selectedPath); // Save the path to localStorage
        refreshMods(); // Refresh mods after selecting a new folder
      }
    } catch (error) {
      console.error("Error selecting folder:", error);
    }
  };

  const downloadModFromUrl = async (url: string) => {
    const modDirPath = localStorage.getItem("modDirPath");
    const trimmedUrl = url.trim();

    if (trimmedUrl && modDirPath) {
      try {
        await downloadMod(trimmedUrl, modDirPath);
      } catch (error) {
        console.error("Error downloading mod:", error);
      } finally {
        setModUrl("");
        refreshMods();
      }
    }
  };

  const handleDownloadMod = async () => {
    await downloadModFromUrl(modUrl);
  };

  const handlePasteMod = async () => {
    try {
      const clipboardUrl = await readText();
      await downloadModFromUrl(clipboardUrl);
    } catch (error) {
      console.error("Error reading clipboard or downloading mod:", error);
    }
  };

  const handleAddMod = async () => {
    try {
      const file = await open({
        multiple: false,
        directory: true,
      });

      if (file) {
        const modDirPath = localStorage.getItem("modDirPath") || "";
        const selectedPath = file as string;
        try {
          await addMod(selectedPath, modDirPath);
        } catch (error) {
          console.error("Error adding mod:", error);
        } finally {
          refreshMods(); // Refresh mods after selecting a new folder
        }
      }
    } catch (error) {
      console.error("Error selecting folder:", error);
    }
  };

  const handleAddCompressedMod = async () => {
    try {
      const file = await open({
        multiple: false,
        directory: false,
        filters: [
          {
            name: "Compressed mod",
            extensions: ["zip", "7z", "rar"],
          },
        ],
      });

      if (file) {
        const modDirPath = localStorage.getItem("modDirPath") || "";
        const selectedPath = file as string;
        try {
          await addMod(selectedPath, modDirPath);
        } catch (error) {
          console.error("Error adding compressed mod:", error);
        } finally {
          refreshMods();
        }
      }
    } catch (error) {
      console.error("Error selecting compressed mod:", error);
    }
  };

  return (

    <header
      className={`
       w-full z-50 ${TRANSITIONS.base} will-change-none fixed
    `}
    >
      <div
        className={` ${COLORS.background.card} border-b ${COLORS.border.panel}
      p-2 ${STYLE.container} ${STYLE.flex.between} flex-col md:flex-row gap-4`}
      >
        {/* Logo/Title */}
        <div className={STYLE.flex.center + " group"}>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-500 to-purple-600 dark:from-cyan-400 dark:to-purple-500 bg-clip-text text-transparent">
            WuWa - MoMa
          </h1>
          <span
            className={`
            ml-2 px-2 py-1 text-xs rounded-full
            bg-purple-100 dark:bg-purple-900/30 
            text-purple-700 dark:text-purple-300 
            border border-purple-200 dark:border-purple-800/50 
            group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 
            ${TRANSITIONS.base}
          `}
          >
            Beta
          </span>
        </div>

        <div className={STYLE.flex.center + " gap-4"}>
          {/* Theme Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`
              ${STYLE.button.icon} rounded-full
              bg-neutral-100 dark:bg-neutral-800 
              hover:bg-neutral-200 dark:hover:bg-neutral-700
            `}
            aria-label={`Switch to ${darkMode ? "light" : "dark"} mode`}
          >
            {darkMode ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-yellow-300"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-neutral-700"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>

          {/* Select Folder Button */}
          <button
            onClick={handleSelectFolder}
            className={`
              ${STYLE.button.secondary} gap-2
              hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0
              ${TRANSITIONS.transform}
            `}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-purple-500 dark:text-purple-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M2 6a2 2 0 012-2h4l2 2h4a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
                clipRule="evenodd"
              />
            </svg>
            <span>Select Home Folder</span>
          </button>

          {/* Add Mod Popover */}
          <Popover className="relative">
            {({ close }) => (
              <>
                <PopoverButton
                  className={`
                  ${STYLE.flex.center} gap-2 px-4 py-2 rounded-lg font-medium
                  bg-gradient-to-r from-cyan-500 to-blue-500 
                  dark:from-cyan-600 dark:to-blue-600 
                  hover:from-cyan-400 hover:to-blue-400 
                  dark:hover:from-cyan-500 dark:hover:to-blue-500 
                  text-white
                  hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0
                  ${TRANSITIONS.transform}
                `}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Add Mod</span>
                </PopoverButton>

                <PopoverPanel
                  className={`
                    absolute right-0 mt-2 w-80 z-10 
                    rounded-xl border ${COLORS.border.panel}
                    ${COLORS.background.popover} ${COLORS.shadow.panel}
                    p-4 space-y-4
                  `}
                >
                  <div className="space-y-4">
                    <div>
                      <label className={STYLE.text.label}>Add from URL</label>
                      <div className="flex gap-2 mt-1">
                        <input
                          type="text"
                          value={modUrl}
                          onChange={(e) => setModUrl(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleDownloadMod();
                              close();
                            }
                          }}
                          placeholder="Enter mod URL..."
                          className={STYLE.input}
                        />
                        <button
                          onClick={() => {
                            handleDownloadMod();
                            close();
                          }}
                          className={STYLE.button.primary}
                        >
                          Add
                        </button>
                      </div>
                    </div>

                    <div className="relative">
                      <div
                        className="absolute inset-0 flex items-center"
                        aria-hidden="true"
                      >
                        <div
                          className={`w-full border-t ${COLORS.border.panel}`}
                        />
                      </div>
                      <div className="relative flex justify-center">
                        <span
                          className={`px-2 ${COLORS.background.panel} text-sm ${COLORS.text.secondary}`}
                        >
                          or
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className={STYLE.text.label}>Quick URL Paste</label>
                      <button
                        onClick={() => {
                          void handlePasteMod();
                          close();
                        }}
                        className={`
                          ${STYLE.button.primary} w-full mt-1 gap-2
                          hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0
                          ${TRANSITIONS.transform}
                        `}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-cyan-500 dark:text-cyan-400"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M5 4a2 2 0 012-2h2a2 2 0 012 2h3a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V4zm2-1a1 1 0 00-1 1v1h8V4a1 1 0 00-1-1h-2a1 1 0 01-1-1H8a1 1 0 01-1 1H7z" />
                          <path d="M8 8a1 1 0 000 2h4a1 1 0 100-2H8zm0 3a1 1 0 000 2h4a1 1 0 100-2H8zm0 3a1 1 0 000 2h2a1 1 0 100-2H8z" />
                        </svg>
                        <span>Paste URL from Clipboard</span>
                      </button>
                    </div>

                    <div className="relative">
                      <div
                        className="absolute inset-0 flex items-center"
                        aria-hidden="true"
                      >
                        <div
                          className={`w-full border-t ${COLORS.border.panel}`}
                        />
                      </div>
                      <div className="relative flex justify-center">
                        <span
                          className={`px-2 ${COLORS.background.panel} text-sm ${COLORS.text.secondary}`}
                        >
                          or
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className={STYLE.text.label}>
                        Add from folder
                      </label>
                      <button
                        onClick={() => {
                          handleAddMod();
                          close();
                        }}
                        className={`
                          ${STYLE.button.secondary} w-full mt-1 gap-2
                          hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0
                          ${TRANSITIONS.transform}
                        `}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M2 6a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1H8a3 3 0 00-3 3v1.5a1.5 1.5 0 01-3 0V6z"
                            clipRule="evenodd"
                          />
                          <path d="M6 12a2 2 0 012-2h8a2 2 0 012 2v2a2 2 0 01-2 2H2h2a2 2 0 002-2v-2z" />
                        </svg>
                        <span>Select Folder</span>
                      </button>
                    </div>

                    <div>
                      <label className={STYLE.text.label}>
                        Add compressed archive
                      </label>
                      <button
                        onClick={() => {
                          handleAddCompressedMod();
                          close();
                        }}
                        className={
                          `
                          ${STYLE.button.secondary} w-full mt-1 gap-2
                          hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0
                          ${TRANSITIONS.transform}
                        `
                        }
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M6 2a2 2 0 00-2 2v2a2 2 0 002 2V6h2V4H6V2zm8 0a2 2 0 012 2v2a2 2 0 01-2 2V6h-2V4h2V2zM4 12a2 2 0 012 2v2h2v-2H6v-2H4zm12 0h-2v2h-2v2h2a2 2 0 002-2v-2zM8 6h4v8H8V6zm2 2v4h0V8h0z" />
                        </svg>
                        <span>Select compressed</span>
                      </button>
                    </div>
                  </div>
                </PopoverPanel>
              </>
            )}
          </Popover>
        </div>
      </div>
      {mods && mods.length > 0 && (
        <div
          className={`modgrid-header z-50 ${STYLE.panel} ${isCompact ? "compact" : ""}`}
        >
          <div className="max-w-7xl mx-auto">
            <div className={STYLE.flex.between + " flex-col md:flex-row gap-4 px-10"}>
              {/* Title and Stats Section */}
              <div className={`space-y-2 ${STYLE.flex.wrap} gap-5`}>
                <div className={STYLE.flex.start}>
                  <h2 className={STYLE.text.heading}>Mods</h2>
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
                    <span>{mods.length} installed</span>
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
                      {mods.filter((mod) => mod.enabled).length} enabled
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
                  onClick={onFetchMods}
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
                    onApplyPreset={onApplyPreset || (() => { })}
                    modDirPath={modDirPath}
                  />
                </div>

                <div className="p-0">
                  <FilterMods mods={mods} onFilter={onFilter || (() => { })} />
                </div>

                {/* Select Mode Toggle */}
                <button
                  onClick={onToggleSelectMode}
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
                    onClick={onDeleteSelected}
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
      )}
    </header>






  );
};

export default Header;

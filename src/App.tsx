import React, { useEffect, useState } from "react";
import ModGrid from "./components/ModGrid";
import { Mod } from "./interfaces/Mod.interface";
import { getFolderContents } from "./services/folder.service";
import Header from "./components/NavBar";
import ModInfoPanel from "./components/ModInfoPanel";
import { deleteMod, setModInfo } from "./services/mod.service";
import { AnimatePresence } from "framer-motion";
import { ToastContainer } from "react-toastify";
import { getCharacters } from "./services/character.service";
import { Character } from "./interfaces/Character.interface";

const App: React.FC = () => {
  const [mods, setMods] = useState<Mod[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedMod, setSelectedMod] = useState<Mod | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [modDirPath, setModDirPath] = useState<string>(
    localStorage.getItem("modDirPath") || ""
  );
  const [darkMode, setDarkMode] = useState(() => {
    // Check localStorage for user preference or use system preference
    if (typeof window !== "undefined") {
      const savedPref = localStorage.getItem("darkMode");
      if (savedPref !== null) return savedPref === "true";
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return true;
  });
  const [selectedMods, setSelectedMods] = useState<Mod[]>([]);
  const [isSelectMode, setIsSelectMode] = useState(false);

  useEffect(() => {
    if (modDirPath) {
      fetchMods();
    }
  }, [modDirPath]);

  useEffect(() => {
    const loadCharacters = async () => {
      const characters = await getCharacters();
      console.log("[characters] Loaded characters:", characters);
      setCharacters(characters);
    };

    loadCharacters().catch((error) => {
      console.error("[characters] Unexpected load failure:", error);
    });
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("darkMode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("darkMode", "false");
    }
  }, [darkMode]);

  const fetchMods = async () => {
    try {
      if (modDirPath) {
        const mods = await getFolderContents(modDirPath);
        console.log("Fetched mods:", mods);
        setMods(mods);
      }
    } catch (error) {
      console.error("Error fetching mods:", error);
    }
  };

  const handleModClick = (mod: Mod) => {
    setSelectedMod(mod);
    setIsPanelOpen(true);
  };

  const handleUpdateMod = async (updatedMod: Mod) => {
    updatedMod = await setModInfo(updatedMod);
    setSelectedMod(updatedMod);
    fetchMods();
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
  };

  const handleModsDelete = async (mod: Mod[]) => {
    mod.forEach((mod) => {
      deleteMod(mod).finally(() => {
        fetchMods();
        setIsPanelOpen(false);
        setSelectedMod(null);
      });
    });
  };

  const toggleSelectMode = () => {
    setIsSelectMode(!isSelectMode);
    if (!isSelectMode) {
      setSelectedMods([]);
    }
  };

  const handleDeleteSelected = () => {
    handleModsDelete(selectedMods);
    setSelectedMods([]);
    setIsSelectMode(false);
  };

  const handleApplyPreset = async () => {
    await fetchMods();
  };

  const handleFilterChange = () => {
    // Filter changes are handled within ModGrid
  };

  return (
    <div className="min-h-screen w-full bg-neutral-100 dark:bg-neutral-900 text-black dark:text-white flex flex-col">
      <Header
        refreshMods={fetchMods}
        setModDirPath={setModDirPath}
        setDarkMode={setDarkMode}
        darkMode={darkMode}
        mods={mods}
        isSelectMode={isSelectMode}
        selectedMods={selectedMods}
        isCompact={false}
        modDirPath={modDirPath}
        onToggleSelectMode={toggleSelectMode}
        onDeleteSelected={handleDeleteSelected}
        onApplyPreset={handleApplyPreset}
        onFetchMods={fetchMods}
        onFilter={handleFilterChange}
      />
      <div className="flex-1 relative flex flex-col lg:flex-row">
        <main
          className={`flex-1 ${isPanelOpen ? "lg:pr-[450px]" : ""
            } transition-all duration-300`}
        >
          <AnimatePresence mode="wait">
            {modDirPath ? (
              <ModGrid
                mods={mods}
                characters={characters}
                onUpdateMod={handleUpdateMod}
                onModClick={handleModClick}
                selectedMods={selectedMods}
                onSelectedModsChange={setSelectedMods}
                isSelectMode={isSelectMode}
              />
            ) : (
              <div className="text-center p-8">
                {/* <p className=" mb-4">No mods directory selected</p>
                <button
                  onClick={handleSelectFolder}
                  className="px-4 py-2  rounded"
                >
                  Select Mods Directory
                </button> */}
              </div>
            )}
          </AnimatePresence>
        </main>

        <ToastContainer
          position="bottom-center"
          autoClose={1000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme={darkMode ? "dark" : "light"}
          className="!-mb-4 sm:!-mb-0"
          stacked
        />

        {isPanelOpen && selectedMod && (
          <div
            className="fixed inset-0 z-40"
            onClick={handleClosePanel}
            aria-hidden="true"
          >
            <div className="absolute inset-0 bg-black/20" />
            <ModInfoPanel
              mod={selectedMod}
              characters={characters}
              isOpen={isPanelOpen}
              onUpdate={handleUpdateMod}
              onClose={handleClosePanel}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default App;

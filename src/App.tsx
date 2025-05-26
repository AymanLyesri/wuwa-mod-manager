import React, { useEffect, useState } from "react";
import ModGrid from "./components/ModGrid";
import { Mod } from "./interfaces/Mod.interface";
import { getFolderContents } from "./services/folder.service";
import Header from "./components/Header";
import ModInfoPanel from "./components/ModInfoPanel";
import { deleteMod, setModInfo } from "./services/mod.service";
import { AnimatePresence } from "framer-motion";
import { ToastContainer } from "react-toastify";

const App: React.FC = () => {
  const [mods, setMods] = useState<Mod[]>([]);
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

  useEffect(() => {
    if (modDirPath) {
      fetchMods();
    }
  }, [modDirPath]);

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

  return (
    <div className="min-h-screen w-full bg-neutral-100 dark:bg-neutral-900 text-black dark:text-white flex flex-col">
      <Header
        refreshMods={fetchMods}
        setModDirPath={setModDirPath}
        setDarkMode={setDarkMode}
        darkMode={darkMode}
      />
      <div className="flex-1 relative flex flex-col lg:flex-row">
        <main
          className={`flex-1 ${
            isPanelOpen ? "lg:pr-[450px]" : ""
          } transition-all duration-300`}
        >
          <AnimatePresence mode="wait">
            {modDirPath ? (
              <ModGrid
                mods={mods}
                onUpdateMod={handleUpdateMod}
                onModClick={handleModClick}
                modDirPath={modDirPath}
                onDeleteMods={handleModsDelete}
                fetchMods={fetchMods}
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
          <ModInfoPanel
            mod={selectedMod}
            isOpen={isPanelOpen}
            onUpdate={handleUpdateMod}
            onClose={handleClosePanel}
          />
        )}
      </div>
    </div>
  );
};

export default App;

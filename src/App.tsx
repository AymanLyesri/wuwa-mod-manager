import React, { useEffect, useState } from 'react';
import ModGrid from './components/ModGrid';
import { Mod } from './interfaces/Mod.interface';
import { getFolderContents } from './services/folder.service';
import Header from './components/Header';
import ModInfoPanel from './components/ModInfoPanel';
import { deleteMod, setModInfo } from './services/mod.service';
import { Spinner } from './components/Spinner';
import { AnimatePresence } from 'framer-motion';
import { ToastContainer } from 'react-toastify';

const App: React.FC = () => {
  const [mods, setMods] = useState<Mod[]>([]);
  const [selectedMod, setSelectedMod] = useState<Mod | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [modDirPath, setModDirPath] = useState<string>(localStorage.getItem('modDirPath') || '');

  useEffect(() => {
    if (modDirPath) {
      fetchMods();
    }
  }, [modDirPath]);

  const fetchMods = async () => {
    try {
      if (modDirPath) {
        const mods = await getFolderContents(modDirPath);
        console.log('Fetched mods:', mods);
        setMods(mods);
      }
    } catch (error) {
      console.error('Error fetching mods:', error);
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
    })
  }

  return (
    <div className=" h-screen overflow-hidden bg-neutral-100 dark:bg-neutral-900 text-black dark:text-white flex flex-col">
      <Header
        refreshMods={fetchMods}
        setModDirPath={setModDirPath}
      />
      <Spinner />
      <div className="flex flex-1 overflow-hidden relative">
        <main className={`flex-1 overflow-y-auto`}>
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
          theme="dark"
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
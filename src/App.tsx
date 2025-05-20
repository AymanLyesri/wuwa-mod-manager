import React, { useEffect, useState } from 'react';
import ModGrid from './components/ModGrid';
import { Mod } from './interfaces/Mod.interface';
import { getFolderContents } from './services/folder.service';
import Header from './components/Header';
import ModInfoPanel from './components/ModInfoPanel';
import { open } from '@tauri-apps/plugin-dialog';
import { deleteMod, downloadMod, setModInfo } from './services/mod.service';
import { Spinner } from './components/Spinner';

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

  const handleDownloadMod = (url: string) => {
    downloadMod(url, modDirPath).finally(() => {
      fetchMods();
    });
  }

  const handleModsDelete = async (mod: Mod[]) => {
    mod.forEach((mod) => {
      deleteMod(mod).finally(() => {
        fetchMods();
        setIsPanelOpen(false);
        setSelectedMod(null);
      });
    })
  }

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
        localStorage.setItem('modDirPath', selectedPath); // Save the path to localStorage
        fetchMods(); // Fetch mods after selecting the folder
      }
    } catch (error) {
      console.error('Error selecting folder:', error);
    }
  };

  return (
    <div className=" h-screen overflow-hidden bg-white dark:bg-neutral-950 text-black dark:text-white flex flex-col">
      <Header
        onAddMod={handleDownloadMod}
        onSelectFolder={handleSelectFolder}
      />
      <Spinner />
      <div className="flex flex-1 overflow-hidden relative">
        <main className={`flex-1 overflow-y-auto`}>
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
              <p className=" mb-4">No mods directory selected</p>
              <button
                onClick={handleSelectFolder}
                className="px-4 py-2  rounded"
              >
                Select Mods Directory
              </button>
            </div>
          )}
        </main>

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
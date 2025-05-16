import React, { useEffect, useState } from 'react';
import ModGrid from './components/ModGrid';
import { Mod } from './interfaces/Mod.interface';
import { getFolderContents, setModState } from './services/folder.service';
import Header from './components/Header';
import ModInfoPanel from './components/ModInfoPanel';
import { open } from '@tauri-apps/plugin-dialog';

const App: React.FC = () => {
  const [mods, setMods] = useState<Mod[]>([]);
  const [columns, setColumns] = useState<number>(4);
  const [selectedMod, setSelectedMod] = useState<Mod | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [modPath, setModPath] = useState<string>("");

  const fetchMods = async () => {
    try {
      if (modPath) {
        const mods = await getFolderContents(modPath);
        console.log('Fetched mods:', mods);
        setMods(mods);
      }
    } catch (error) {
      console.error('Error fetching mods:', error);
    }
  };

  useEffect(() => {
    // Load saved path from localStorage if available
    const savedPath = localStorage.getItem('modPath');
    if (savedPath) {
      setModPath(savedPath);
    }
  }, []);

  useEffect(() => {
    fetchMods();
  }, [modPath]);

  const handleToggleMod = (mod: Mod, enabled: boolean) => {
    console.log('Toggling mod:', mod.id, 'to', enabled);

    setMods(mods.map(m =>
      m.id === mod.id ? { ...m, enabled } : m
    ));
    setModState(mod, enabled);
    if (selectedMod?.id === mod.id) {
      setSelectedMod({ ...selectedMod, enabled });
    }
    fetchMods();
  };

  const handleModClick = (mod: Mod) => {
    setSelectedMod(mod);
    setIsPanelOpen(true);
  };

  const handleUpdateMod = (updatedMod: Mod) => {
    setMods(mods.map(mod => mod.id === updatedMod.id ? updatedMod : mod));
    setSelectedMod(updatedMod);
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
  };

  // Then add this function to your App component
  const handleSelectFolder = async () => {

    try {
      const file = await open({
        multiple: false,
        directory: true,
      });

      if (file) {
        const selectedPath = file as string;
        setModPath(selectedPath);
        localStorage.setItem('modPath', selectedPath); // Save the path to localStorage
      }
    } catch (error) {
      console.error('Error selecting folder:', error);
    }
  };



  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <Header
        columns={columns}
        setColumns={setColumns}
        // onAddMod={/* your existing add mod function */}
        onSelectFolder={handleSelectFolder}
      />
      <div className="flex flex-1 overflow-hidden relative">
        <main className={`flex-1 overflow-y-auto`}>
          <div className="mb-6 flex justify-between items-center p-6">
            <div>
              <h2 className="text-xl font-semibold">Installed Mods</h2>
              <p className="text-gray-400">
                {mods.length} mods installed • {mods.filter(m => m.enabled).length} enabled
                {modPath && (
                  <span className="block text-sm mt-1">Path: {modPath}</span>
                )}
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded"
                onClick={fetchMods}
                title="Refresh mods"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
              </button>
              <button className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded">
                Sort by
              </button>
              <button className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded">
                Filter
              </button>
            </div>
          </div>

          {modPath ? (
            <ModGrid
              mods={mods}
              columns={columns}
              onToggleMod={handleToggleMod}
              onModClick={handleModClick}
            />
          ) : (
            <div className="text-center p-8">
              <p className="text-gray-400 mb-4">No mods directory selected</p>
              <button
                onClick={handleSelectFolder}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded"
              >
                Select Mods Directory
              </button>
            </div>
          )}
        </main>

        {isPanelOpen && selectedMod && (
          <ModInfoPanel
            mod={selectedMod}
            onUpdate={handleUpdateMod}
            onClose={handleClosePanel}
            onToggleMod={handleToggleMod}
          />
        )}
      </div>
    </div>
  );
};

export default App;
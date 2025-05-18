import React, { useEffect, useState } from 'react';
import ModGrid from './components/ModGrid';
import { Mod } from './interfaces/Mod.interface';
import { getFolderContents } from './services/folder.service';
import Header from './components/Header';
import ModInfoPanel from './components/ModInfoPanel';
import { open } from '@tauri-apps/plugin-dialog';
import { downloadMod, setModInfo } from './services/mod.service';

const App: React.FC = () => {
  const [mods, setMods] = useState<Mod[]>([]);
  const [selectedMod, setSelectedMod] = useState<Mod | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [modDirPath, setModDirPath] = useState<string>("");
  const [sortMethod, setSortMethod] = useState<string>('name');

  const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'author', label: 'Author' },
    { value: 'version', label: 'Version' },
  ];

  useEffect(() => {
    if (localStorage.getItem('modDirPath')) {
      setModDirPath(localStorage.getItem('modDirPath') as string);
    }
    if (localStorage.getItem('sortMethod')) {
      setSortMethod(localStorage.getItem('sortMethod') as string);
    }
  }, []);

  // sort mods based on the selected method based on mod keys
  useEffect(() => {
    const sortedMods = [...mods].sort((a, b) => {
      if (sortMethod === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortMethod === 'author') {
        return a.author.localeCompare(b.author);
      } else if (sortMethod === 'version') {
        // reverse the order of version comparison
        return b.version.localeCompare(a.version);
      }
      return 0;
    });
    localStorage.setItem('sortMethod', sortMethod);
    setMods(sortedMods);
  }, [sortMethod]);

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

  const handleUpdateMod = (updatedMod: Mod) => {
    setMods(mods.map(mod => mod.id === updatedMod.id ? updatedMod : mod));
    setModInfo(updatedMod);
    setSelectedMod(updatedMod);
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
  };

  const handleDownloadMod = (url: string) => {
    downloadMod(url, modDirPath).finally(() => {
      fetchMods();
    });
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
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <Header
        onAddMod={handleDownloadMod}
        onSelectFolder={handleSelectFolder}
      />
      <div className="flex flex-1 overflow-hidden relative">
        <main className={`flex-1 overflow-y-auto`}>
          <div className="mb-6 flex justify-between items-center p-6">
            <div>
              <h2 className="text-xl font-semibold">Installed Mods</h2>
              <p className="text-gray-400">
                {mods.length} mods installed • {mods.filter(m => m.enabled).length} enabled
                {modDirPath && (
                  <span className="block text-sm mt-1">Path: {modDirPath}</span>
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
              <select
                className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-white"
                value={sortMethod}
                onChange={e => setSortMethod(e.target.value)}
                title="Sort mods"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    Sort by {option.label}
                  </option>
                ))}
              </select>
              <button className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded">
                Filter
              </button>
            </div>
          </div>

          {modDirPath ? (
            <ModGrid
              mods={mods}
              onUpdateMod={handleUpdateMod}
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
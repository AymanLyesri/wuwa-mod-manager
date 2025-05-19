import React, { useEffect, useState } from 'react';
import ModGrid from './components/ModGrid';
import { Mod } from './interfaces/Mod.interface';
import { getFolderContents } from './services/folder.service';
import Header from './components/Header';
import ModInfoPanel from './components/ModInfoPanel';
import { open } from '@tauri-apps/plugin-dialog';
import { downloadMod, setModInfo } from './services/mod.service';
import { Spinner } from './components/Spinner';

const App: React.FC = () => {
  const [mods, setMods] = useState<Mod[]>([]);
  const [selectedMod, setSelectedMod] = useState<Mod | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [modDirPath, setModDirPath] = useState<string>(localStorage.getItem('modDirPath') || '');
  const [sortMethod, setSortMethod] = useState<string>(localStorage.getItem('sortMethod') || 'name');

  const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'author', label: 'Author' },
    { value: 'version', label: 'Version' },
    { value: 'character', label: 'Character' },
  ];

  useEffect(() => {
    if (modDirPath) {
      fetchMods();
    }
  }, [modDirPath]);

  // sort mods based on the selected method based on mod keys
  useEffect(() => {
    const sortedMods = sortMods([...mods], sortMethod);
    localStorage.setItem('sortMethod', sortMethod);
    setMods(sortedMods);
  }, [sortMethod]);

  const sortMods = (mods: Mod[], method: string) => {
    return mods.sort((a, b) => {
      if (method === 'name') {
        return a.name.localeCompare(b.name);
      } else if (method === 'author') {
        return a.author.localeCompare(b.author);
      } else if (method === 'version') {
        // reverse the order of version comparison
        return b.version.localeCompare(a.version);
      }
      return 0;
    });
  };

  const fetchMods = async () => {
    try {
      if (modDirPath) {
        const mods = await getFolderContents(modDirPath);
        const sortedMods = sortMods(mods, sortMethod);
        console.log('Fetched mods:', sortedMods);
        setMods(sortedMods);
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
    setModInfo(updatedMod);
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
    <div className="min-h-screen bg-white dark:bg-gray-900 text-black dark:text-white flex flex-col">
      <Header
        onAddMod={handleDownloadMod}
        onSelectFolder={handleSelectFolder}
      />
      <Spinner />
      <div className="flex flex-1 overflow-hidden relative">
        <main className={`flex-1 overflow-y-auto`}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            {/* Title and Stats Section */}
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">
                Installed Mods
              </h2>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <div className="flex items-center space-x-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 " viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  <span>
                    <span className="font-medium">{mods.length}</span> mods installed
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 " viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>
                    <span className="font-medium">{mods.filter(m => m.enabled).length}</span> enabled
                  </span>
                </div>
                {modDirPath && (
                  <div className="flex items-center space-x-1 text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 " viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4l2 2h4a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                    </svg>
                    <span className="truncate max-w-[180px] sm:max-w-xs" title={modDirPath}>
                      {modDirPath}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons Section */}
            <div className="flex flex-wrap gap-2 justify-end">
              <button
                className="p-2 rounded-lg  transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm group"
                onClick={fetchMods}
                title="Refresh mods"
                aria-label="Refresh mods"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5  " viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
              </button>

              <div className="relative group">
                <select
                  className="appearance-none pl-3 pr-8 py-2 rounded-lg  transition-all duration-200  cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                  value={sortMethod}
                  onChange={e => setSortMethod(e.target.value)}
                  title="Sort mods"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value} className="">
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none  ">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>

              <button
                className="flex items-center space-x-1 px-3 py-2 rounded-lg  transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 " viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                </svg>
                <span className="">Filter</span>
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
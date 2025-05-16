import React, { useEffect, useState } from 'react';
import ModGrid from './components/ModGrid';
import { Mod } from './interfaces/Mod.interface';
import { getFolderContents, setModState } from './services/folder.service';
import Header from './components/Header';
import ModInfoPanel from './components/ModInfoPanel';

const App: React.FC = () => {
  const [mods, setMods] = useState<Mod[]>([]);
  const [columns, setColumns] = useState<number>(4);
  const [selectedMod, setSelectedMod] = useState<Mod | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const fetchMods = async () => {
    try {
      const mods = await getFolderContents("/eternal/Coding/mod_manager/Mods");
      console.log('Fetched mods:', mods);
      setMods(mods);
    } catch (error) {
      console.error('Error fetching mods:', error);
    }
  };

  useEffect(() => {
    fetchMods();
  }, []);

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

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <Header columns={columns} setColumns={setColumns} />

      <div className="flex flex-1 overflow-hidden relative">
        <main className={`flex-1 overflow-y-auto`}>
          <div className="mb-6 flex justify-between items-center p-6">
            <div>
              <h2 className="text-xl font-semibold">Installed Mods</h2>
              <p className="text-gray-400">
                {mods.length} mods installed • {mods.filter(m => m.enabled).length} enabled
              </p>
            </div>
            <div className="flex space-x-2">
              {/* refresh */}
              <button className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded" onClick={fetchMods}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11h-2v2h2v-2zm0-6h-2v4h2V7z" />
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

          <ModGrid
            mods={mods}
            columns={columns}
            onToggleMod={handleToggleMod}
            onModClick={handleModClick}
          />
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
import React, { useEffect, useState } from 'react';
import ModCard from './ModCard';
import { Mod } from '../interfaces/Mod.interface';
import { STYLE, TRANSITIONS } from '../constants/styling.constant';
import { motion } from 'framer-motion';
import FilterMods from './Filter';

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
    fetchMods
}) => {
    const [selectedMods, setSelectedMods] = useState<Mod[]>([]);
    const [isSelectMode, setIsSelectMode] = useState(false);
    const [sortMethod, setSortMethod] = useState<string>(localStorage.getItem('sortMethod') || 'name');
    const [sortedMods, setSortedMods] = useState<Mod[]>([]);
    const [filteredMods, setFilteredMods] = useState(mods); // full mods list


    const sortOptions = [
        { value: 'name', label: 'Name' },
        { value: 'author', label: 'Author' },
        { value: 'version', label: 'Version' },
        { value: 'character', label: 'Character' },
    ];

    useEffect(() => {
        const sortedMods = sortMods([...filteredMods], sortMethod);
        localStorage.setItem('sortMethod', sortMethod);
        setSortedMods(sortedMods);
    }, [sortMethod, mods, filteredMods]);


    const toggleModSelection = (mod: Mod) => {
        if (selectedMods.includes(mod)) {
            setSelectedMods(selectedMods.filter(m => m.id !== mod.id));
        } else {
            setSelectedMods([...selectedMods, mod]);
        }
    };

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
        <div className="space-y-6">
            {/* Header Section */}
            <div className={`${STYLE.panel} sticky top-0 z-10 m-0 lg:m-6 flex flex-col gap-4 lg:flex-row md:items-center md:justify-between`}>
                {/* Title and Stats Section */}
                <div className="space-y-2">
                    <h2 className={`${STYLE.text.heading}`}>
                        Installed Mods
                    </h2>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                        {/* Mod Count */}
                        <div className={`${STYLE.text.label} flex items-center gap-1`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            <span>{mods.length} mods installed</span>
                        </div>

                        {/* Enabled Count */}
                        <div className={`${STYLE.text.label} flex items-center gap-1`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            <span>{mods.filter(m => m.enabled).length} enabled</span>
                        </div>

                        {/* Mod Directory Path */}
                        {modDirPath && (
                            <div className={`${STYLE.text.label} flex items-center gap-1`}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4l2 2h4a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                                </svg>
                                <span className="truncate max-w-[120px] xs:max-w-[180px] sm:max-w-xs" title={modDirPath}>
                                    {modDirPath}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Buttons Section */}
                <div className="flex flex-wrap gap-2 justify-end">
                    {/* Refresh Button */}
                    <button
                        className={`p-2 rounded-lg ${TRANSITIONS.interactive} hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:shadow-md`}
                        onClick={fetchMods}
                        title="Refresh mods"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                        </svg>
                    </button>

                    {/* Sort Dropdown */}
                    <div className="relative">
                        <select
                            className={`${STYLE.select} min-w-[120px]`}
                            value={sortMethod}
                            onChange={e => setSortMethod(e.target.value)}
                        >
                            {sortOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="p-4">
                        <FilterMods mods={mods} onFilter={setFilteredMods} />
                    </div>

                    {/* Select Mode Toggle */}
                    <button
                        onClick={toggleSelectMode}
                        className={`${STYLE.button.secondary} flex items-center gap-1`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>{isSelectMode ? 'Cancel' : 'Select'}</span>
                    </button>

                    {/* Delete Selected (when in select mode) */}
                    {isSelectMode && selectedMods.length > 0 && (
                        <button
                            onClick={handleDeleteSelected}
                            className={`${STYLE.button.primary} bg-rose-500 hover:bg-rose-600 flex items-center gap-1`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <span>Delete ({selectedMods.length})</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Mod Grid */}
            <div className="grid [grid-template-columns:repeat(auto-fit,minmax(300px,1fr))] gap-6 p-6">
                {sortedMods.map((mod) => (

                    <motion.div
                        // key={mod.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className={`relative transition-all duration-200 ${selectedMods.includes(mod) ? 'ring-2 ring-blue-500 scale-[0.98]' : ''}`}
                        onClick={() => isSelectMode && toggleModSelection(mod)}
                    >
                        {isSelectMode && (
                            <div className="absolute top-2 left-2 z-10">
                                <input
                                    type="checkbox"
                                    checked={selectedMods.includes(mod)}
                                    onChange={() => toggleModSelection(mod)}
                                    className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </div>
                        )}
                        <ModCard
                            mod={mod}
                            onUpdateMod={onUpdateMod}
                            onClick={() => !isSelectMode && onModClick(mod)}
                        // className={selectedMods.includes(mod.id) ? 'opacity-90' : ''}
                        />
                    </motion.div>
                ))}
            </div>

        </div>
    );
};

export default ModGrid;
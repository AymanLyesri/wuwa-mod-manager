import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import React, { useState, useEffect } from 'react';
import { STYLE } from '../constants/styling.constant';
import { addMod, downloadMod } from '../services/mod.service';
import { open } from '@tauri-apps/plugin-dialog';

interface HeaderProps {
    refreshMods: () => void;
    setModDirPath: (path: string) => void;
}

const Header: React.FC<HeaderProps> = ({ refreshMods, setModDirPath }) => {
    const [modUrl, setModUrl] = useState('');
    const [darkMode, setDarkMode] = useState(() => {
        // Check localStorage for user preference or use system preference
        if (typeof window !== 'undefined') {
            const savedPref = localStorage.getItem('darkMode');
            if (savedPref !== null) return savedPref === 'true';
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        return true;
    });

    // Apply dark mode class to document
    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('darkMode', 'true');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('darkMode', 'false');
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
                localStorage.setItem('modDirPath', selectedPath); // Save the path to localStorage
                refreshMods(); // Refresh mods after selecting a new folder
            }
        } catch (error) {
            console.error('Error selecting folder:', error);
        }
    };

    const handleDownloadMod = () => {
        const modDirPath = localStorage.getItem('modDirPath');
        if (modUrl.trim() && modDirPath) {
            downloadMod(modUrl, modDirPath).finally(() => {
                setModUrl('');
                refreshMods();
            }
            );
        }


    };

    const handleAddMod = async () => {
        try {
            const file = await open({
                multiple: false,
                directory: true,
            });

            if (file) {
                const modDirPath = localStorage.getItem('modDirPath') || '';
                const selectedPath = file as string;
                addMod(selectedPath, modDirPath).finally(() => {
                    refreshMods(); // Refresh mods after selecting a new folder
                });
            }
        } catch (error) {
            console.error('Error selecting folder:', error);
        }
    };

    return (
        <header className="bg-white dark:bg-neutral-900/80 backdrop-blur-sm border-b border-neutral-200 dark:border-neutral-800 p-4 sticky top-0 z-50 transition-colors duration-200">
            <div className="mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                {/* Logo/Title */}
                <div className="group flex items-center">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-500 to-purple-600 dark:from-cyan-400 dark:to-purple-500 bg-clip-text text-transparent">
                        WuWa - MoMa
                    </h1>
                    <span className="ml-2 px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full border border-purple-200 dark:border-purple-800/50 group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-all">
                        Beta
                    </span>
                </div>

                <div className="flex items-center gap-4">
                    {/* Theme Toggle */}
                    <button
                        onClick={() => setDarkMode(!darkMode)}
                        className="p-2 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                        aria-label={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
                    >
                        {darkMode ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-300" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-neutral-700" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                            </svg>
                        )}
                    </button>

                    <div className="flex flex-col sm:flex-row gap-2">
                        {/* Select Folder Button */}
                        <button
                            onClick={handleSelectFolder}
                            className="flex items-center gap-2 px-4 py-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700/90 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-800 dark:text-neutral-200 hover:text-neutral-900 dark:hover:text-white transition-all hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500 dark:text-purple-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4l2 2h4a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                            </svg>
                            <span>Select Folder</span>
                        </button>

                        {/* Add Mod Popover */}
                        <Popover>

                            <PopoverButton
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 dark:from-cyan-600 dark:to-blue-600 hover:from-cyan-400 hover:to-blue-400 dark:hover:from-cyan-500 dark:hover:to-blue-500 rounded-lg text-white font-medium transition-all hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                </svg>
                                <span>Add Mod</span>
                            </PopoverButton>

                            <PopoverPanel className={STYLE.panel + " absolute z-10 right-0 mt-2 w-96 p-4 flex flex-col gap-5"}>
                                <div className="flex flex-col gap-2">
                                    <input
                                        type="text"
                                        value={modUrl}
                                        onChange={(e) => setModUrl(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleDownloadMod()}
                                        placeholder="Mod URL (download/file)"
                                        className="px-4 py-2 bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                        autoFocus
                                    />

                                    <button
                                        onClick={handleDownloadMod}
                                        className={STYLE.button.primary + " w-full"}
                                    >
                                        Add
                                    </button>

                                    <button
                                        className={STYLE.button.secondary + " w-full"}
                                        onClick={handleAddMod}
                                    >
                                        Choose File
                                    </button>
                                </div>
                            </PopoverPanel>


                        </Popover>
                    </div>
                </div>
            </div>
        </header >
    );
};

export default Header;
import React, { useState } from 'react';

interface HeaderProps {
    onAddMod: (url: string) => void; // Optional prop for add mod functionality
    onSelectFolder: () => void; // New prop for folder selection
}


const Header: React.FC<HeaderProps> = ({ onAddMod, onSelectFolder }) => {
    const [addModExpanded, setAddModExpanded] = useState(false);
    const [modUrl, setModUrl] = useState('');

    const handleAddModClick = () => setAddModExpanded(true);

    const handleAddModConfirm = () => {
        if (modUrl.trim()) {
            onAddMod(modUrl);
            setModUrl('');
            console.log('Mod URL:', modUrl);
            setAddModExpanded(false);
        }
    };

    const handleAddModCancel = () => {
        setAddModExpanded(false);
        setModUrl('');
    };

    return (
        <header className="bg-gray-800 p-4 shadow-md relative z-10">
            <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        Universal Mod Manager
                    </h1>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                        <button
                            onClick={onSelectFolder}
                            className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg w-full sm:w-auto flex items-center justify-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4l2 2h4a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                            </svg>
                            Select Folder
                        </button>

                        {!addModExpanded ? (
                            <button
                                onClick={handleAddModClick}
                                className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg w-full sm:w-auto flex items-center justify-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                </svg>
                                Add Mod
                            </button>
                        ) : (
                            <div className="flex gap-2 w-full sm:w-auto">
                                <input
                                    type="text"
                                    className="px-3 py-2 rounded-lg border border-gray-600 bg-gray-900 text-white flex-1"
                                    placeholder="Paste mod URL..."
                                    value={modUrl}
                                    onChange={e => setModUrl(e.target.value)}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleAddModConfirm();
                                        }
                                    }}
                                    autoFocus
                                />
                                <button
                                    onClick={handleAddModConfirm}
                                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                                    title="Add Mod"
                                >
                                    Add
                                </button>
                                <button
                                    onClick={handleAddModCancel}
                                    className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg font-medium transition-all duration-200"
                                    title="Cancel"
                                >
                                    ✕
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
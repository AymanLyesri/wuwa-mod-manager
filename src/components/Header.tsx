import React from 'react';

interface HeaderProps {
    columns: number;
    setColumns: (columns: number) => void;
    onAddMod?: () => void; // Optional prop for add mod functionality
}

const Header: React.FC<HeaderProps> = ({ columns, setColumns, onAddMod }) => {
    return (
        <header className="bg-gray-800 p-4 shadow-md relative z-10">
            <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        Universal Mod Manager
                    </h1>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                    <div className="flex items-center bg-gray-700 rounded-lg px-3 py-2">
                        <label htmlFor="columns-select" className="mr-2 text-gray-300 text-sm font-medium">
                            Grid Columns:
                        </label>
                        <select
                            id="columns-select"
                            value={columns}
                            onChange={(e) => setColumns(Number(e.target.value))}
                            className="bg-gray-800 text-white rounded px-2 py-1 text-sm border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            {[1, 2, 3, 4, 5].map(num => (
                                <option key={num} value={num}>{num}</option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={onAddMod}
                        className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg w-full sm:w-auto flex items-center justify-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Add Mod
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
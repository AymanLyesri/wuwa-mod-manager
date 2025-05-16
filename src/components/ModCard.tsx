import React from 'react';
import { Mod } from '../interfaces/Mod.interface';


interface ModCardProps {
    mod: Mod;
    onToggle: (mod: Mod, enabled: boolean) => void;
    onClick: () => void;
}

const ModCard: React.FC<ModCardProps> = ({ mod, onToggle, onClick }) => {
    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        onToggle(mod, !mod.enabled);
    };

    return (
        <div
            className="mod-card bg-gray-800 rounded-lg overflow-hidden shadow-lg transition-transform hover:scale-105 cursor-pointer"
            onClick={onClick}
        >
            {mod.imageUrl ? (
                <img src={mod.imageUrl} alt={mod.name} className="w-full h-40 object-cover" />
            ) : (
                <div className="w-full h-40 bg-gray-700 flex items-center justify-center">
                    <span className="text-gray-500">No Image</span>
                </div>
            )}
            <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-white truncate">{mod.name}</h3>
                    <span className="text-sm text-gray-400">{mod.version}</span>
                </div>
                <p className="text-sm text-gray-400 mb-2">by {mod.author}</p>
                <p className="text-sm text-gray-300 line-clamp-2 mb-4">{mod.description}</p>
                <div className="flex justify-between items-center">
                    <button
                        className={`px-3 py-1 rounded text-sm font-medium ${mod.enabled
                            ? 'bg-green-600 hover:bg-green-700'
                            : 'bg-gray-600 hover:bg-gray-700'
                            } text-white`}
                        onClick={handleToggle}
                    >
                        {mod.enabled ? 'Enabled' : 'Disabled'}
                    </button>
                    <button
                        className="text-gray-400 hover:text-white text-sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            onClick();
                        }}
                    >
                        More Info
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModCard;
import React, { useState, useEffect } from 'react';
import { Mod } from '../interfaces/Mod.interface';

interface ModInfoPanelProps {
    mod: Mod;
    onUpdate: (mod: Mod) => void;
    onClose: () => void;
    onToggleMod: (mod: Mod, enabled: boolean) => void;
}

const ModInfoPanel: React.FC<ModInfoPanelProps> = ({ mod, onUpdate, onClose, onToggleMod }) => {
    const [editedMod, setEditedMod] = useState<Mod>({ ...mod });

    // Reset editedMod when the mod prop changes
    useEffect(() => {
        setEditedMod({ ...mod });
    }, [mod]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEditedMod(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleToggle = () => {
        const newEnabledState = !editedMod.enabled;
        onToggleMod(editedMod, newEnabledState);
        setEditedMod(prev => ({ ...prev, enabled: newEnabledState }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onUpdate(editedMod);
    };

    return (
        <div className="w-1/3 m-0 bg-gray-800 p-6 border-gray-700">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Mod Details</h2>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-white text-2xl"
                >
                    &times;
                </button>
            </div>

            <div className="mb-6">
                {mod.imageUrl ? (
                    <img src={mod.imageUrl} alt={mod.name} className="w-full h-48 object-cover rounded-lg mb-4" />
                ) : (
                    <div className="w-full h-48 bg-gray-700 flex items-center justify-center rounded-lg mb-4">
                        <span className="text-gray-500">No Image</span>
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold">{editedMod.name}</h3>
                    <button
                        type="button"
                        className={`px-3 py-1 rounded text-sm font-medium ${editedMod.enabled
                            ? 'bg-green-600 hover:bg-green-700'
                            : 'bg-gray-600 hover:bg-gray-700'
                            } text-white`}
                        onClick={handleToggle}
                    >
                        {editedMod.enabled ? 'Enabled' : 'Disabled'}
                    </button>
                </div>

                <div className="mb-4">
                    <label className="block text-gray-400 mb-2">Name</label>
                    <input
                        type="text"
                        name="name"
                        value={editedMod.name}
                        onChange={handleChange}
                        className="w-full bg-gray-700 rounded px-3 py-2"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-400 mb-2">Version</label>
                    <input
                        type="text"
                        name="version"
                        value={editedMod.version}
                        onChange={handleChange}
                        className="w-full bg-gray-700 rounded px-3 py-2"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-400 mb-2">Author</label>
                    <input
                        type="text"
                        name="author"
                        value={editedMod.author}
                        onChange={handleChange}
                        className="w-full bg-gray-700 rounded px-3 py-2"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-400 mb-2">Description</label>
                    <textarea
                        name="description"
                        value={editedMod.description}
                        onChange={handleChange}
                        className="w-full bg-gray-700 rounded px-3 py-2 h-32"
                    />
                </div>

                <div className="flex space-x-3">
                    <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded"
                    >
                        Save Changes
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded"
                    >
                        Close
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ModInfoPanel;
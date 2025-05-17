import React, { useState, useEffect } from 'react';
import { Mod } from '../interfaces/Mod.interface';
import { open } from '@tauri-apps/plugin-dialog';
import { setModThumbnail } from '../services/folder.service';
import { convertFileSrc } from '@tauri-apps/api/core';

interface ModInfoPanelProps {
    mod: Mod;
    onUpdate: (mod: Mod) => void;
    onClose: () => void;
    onToggleMod: (mod: Mod, enabled: boolean) => void;
}

const ModInfoPanel: React.FC<ModInfoPanelProps> = ({ mod, onUpdate, onClose, onToggleMod }) => {
    const [focusedMod, setFocusedMod] = useState<Mod>(mod);

    // Reset focusedMod when the mod prop changes
    useEffect(() => {
        setFocusedMod(mod);
    }, [mod]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFocusedMod(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleToggle = () => {
        const newEnabledState = !focusedMod.enabled;
        onToggleMod(focusedMod, newEnabledState);
        setFocusedMod(prev => ({ ...prev, enabled: newEnabledState }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onUpdate(focusedMod);
    };
    const handleThumbnailChange = async () => {

        console.log('Image change triggered');
        try {
            const file = await open({
                multiple: false,
                directory: false,
            });

            if (file) {
                const selectedPath = file as string;
                const displayPath = convertFileSrc(selectedPath);
                setModThumbnail(focusedMod, selectedPath)
                    .then(() => {
                        onUpdate({ ...focusedMod, thumbnail: displayPath });
                    })
                    .catch((error) => {
                        console.error('Error setting thumbnail:', error);
                    });
            }
        } catch (error) {
            console.error('Error selecting folder:', error);
        }
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
                {/* <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleThumbnailChange}
                /> */}
                <div
                    className="cursor-pointer group"
                    onClick={handleThumbnailChange}
                    title="Click to change image"
                >
                    {focusedMod.thumbnail ? (
                        <img
                            src={focusedMod.thumbnail}
                            alt={focusedMod.name}
                            className="w-full h-48 object-cover rounded-lg mb-4 group-hover:opacity-80 transition"
                        />
                    ) : (
                        <div className="w-full h-48 bg-gray-700 flex items-center justify-center rounded-lg mb-4 group-hover:bg-gray-600 transition">
                            <span className="text-gray-500">No Image</span>
                        </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition pointer-events-none">
                        <span className="bg-black bg-opacity-50 text-white px-2 py-1 rounded">Change Image</span>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold">{focusedMod.name}</h3>
                    <button
                        type="button"
                        className={`px-3 py-1 rounded text-sm font-medium ${focusedMod.enabled
                            ? 'bg-green-600 hover:bg-green-700'
                            : 'bg-gray-600 hover:bg-gray-700'
                            } text-white`}
                        onClick={handleToggle}
                    >
                        {focusedMod.enabled ? 'Enabled' : 'Disabled'}
                    </button>
                </div>

                <div className="mb-4">
                    <label className="block text-gray-400 mb-2">Name</label>
                    <input
                        type="text"
                        name="name"
                        value={focusedMod.name}
                        onChange={handleChange}
                        className="w-full bg-gray-700 rounded px-3 py-2"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-400 mb-2">Version</label>
                    <input
                        type="text"
                        name="version"
                        value={focusedMod.version}
                        onChange={handleChange}
                        className="w-full bg-gray-700 rounded px-3 py-2"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-400 mb-2">Author</label>
                    <input
                        type="text"
                        name="author"
                        value={focusedMod.author}
                        onChange={handleChange}
                        className="w-full bg-gray-700 rounded px-3 py-2"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-400 mb-2">Description</label>
                    <textarea
                        name="description"
                        value={focusedMod.description}
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
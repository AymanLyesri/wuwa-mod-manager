import React, { useState, useEffect } from 'react';
import { Mod } from '../interfaces/Mod.interface';
import { open } from '@tauri-apps/plugin-dialog';
import { setModThumbnail } from '../services/mod.service';
import { convertFileSrc } from '@tauri-apps/api/core';

// Design tokens
const COLORS = {
    background: {
        panel: 'bg-gradient-to-b from-gray-800 to-gray-900',
        input: 'bg-gray-700 hover:bg-gray-600 focus:bg-gray-600',
        button: {
            primary: 'bg-blue-600 hover:bg-blue-500',
            secondary: 'bg-gray-700 hover:bg-gray-600',
            toggle: {
                enabled: 'bg-green-600 hover:bg-green-500',
                disabled: 'bg-gray-700 hover:bg-gray-600',
            },
        },
    },
    text: {
        primary: 'text-white',
        secondary: 'text-gray-300',
        tertiary: 'text-gray-400',
        label: 'text-gray-400',
    },
    border: {
        panel: 'border-l border-gray-700',
        image: 'border-2 border-gray-700 hover:border-blue-500',
    },
    shadow: {
        panel: 'shadow-xl',
        button: 'hover:shadow-[0_0_10px_-3px_rgba(96,165,250,0.5)]',
        image: 'hover:shadow-[0_0_20px_-5px_rgba(96,165,250,0.3)]',
    },
};

const TRANSITIONS = {
    base: 'transition-all duration-300 ease-out',
    button: 'transition-colors duration-200 ease-in-out',
    image: 'transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]',
};

interface ModInfoPanelProps {
    mod: Mod;
    isOpen?: boolean;
    onUpdate: (mod: Mod) => void;
    onClose: () => void;
}

const ModInfoPanel: React.FC<ModInfoPanelProps> = ({
    mod,
    isOpen = true,
    onUpdate,
    onClose,
}) => {
    const [focusedMod, setFocusedMod] = useState<Mod>(mod);
    const [thumbnailPath, setThumbnailPath] = useState<string>('');

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
        onUpdate({ ...focusedMod, enabled: !focusedMod.enabled });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (thumbnailPath) {
            setModThumbnail(focusedMod, thumbnailPath);
        }
        onUpdate(focusedMod);
    };

    const handleThumbnailChange = async () => {
        try {
            const file = await open({
                multiple: false,
                directory: false,
                filters: [{
                    name: 'Images',
                    extensions: ['png', 'jpg', 'jpeg', 'webp', 'gif']
                }]
            });

            if (file) {
                const selectedPath = file as string;
                const displayPath = convertFileSrc(selectedPath);
                setThumbnailPath(selectedPath);
                setFocusedMod(prev => ({ ...prev, thumbnail: displayPath }));
            }
        } catch (error) {
            console.error('Error selecting image:', error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className={`
      inset-y-0 right-0 w-full md:w-1/2 lg:w-1/3 xl:w-1/4 z-20
      ${COLORS.background.panel} ${COLORS.border.panel} ${COLORS.shadow.panel}
      transform ${isOpen ? 'translate-x-0' : 'translate-x-full'} ${TRANSITIONS.base}
      flex flex-col
    `}>
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-700">
                <h2 className="text-2xl font-bold tracking-tight">Mod Details</h2>
                <button
                    onClick={onClose}
                    className={`p-2 rounded-full ${COLORS.background.button.secondary} ${TRANSITIONS.button}`}
                    aria-label="Close panel"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto p-6">
                {/* Thumbnail */}
                <div className="mb-8 relative group">
                    <div
                        className={`w-full aspect-video rounded-xl overflow-hidden ${COLORS.border.image} ${COLORS.shadow.image} ${TRANSITIONS.image} cursor-pointer`}
                        onClick={handleThumbnailChange}
                        title="Click to change image"
                    >
                        {focusedMod.thumbnail ? (
                            <img
                                src={focusedMod.thumbnail}
                                alt={focusedMod.name}
                                className="w-full h-full object-cover group-hover:scale-105 transform-gpu"
                            />
                        ) : (
                            <div className={`w-full h-full flex flex-col items-center justify-center ${COLORS.background.input}`}>
                                <svg className="w-12 h-12 mb-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span className="text-sm text-gray-400">Click to add thumbnail</span>
                            </div>
                        )}
                    </div>
                    <div className={`absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 ${TRANSITIONS.base} pointer-events-none`}>
                        <span className="bg-black/70 text-white px-3 py-1.5 rounded-full text-sm font-medium">
                            Change Image
                        </span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Toggle and title */}
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold truncate max-w-xs">{focusedMod.name}</h3>
                        <button
                            type="button"
                            onClick={handleToggle}
                            className={`px-4 py-2 rounded-full ${TRANSITIONS.button} ${COLORS.shadow.button}
                ${focusedMod.enabled
                                    ? COLORS.background.button.toggle.enabled
                                    : COLORS.background.button.toggle.disabled
                                } flex items-center gap-2`}
                        >
                            <span className="relative flex h-2 w-2">
                                {focusedMod.enabled && (
                                    <>
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-300 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
                                    </>
                                )}
                            </span>
                            {focusedMod.enabled ? 'Enabled' : 'Disabled'}
                        </button>
                    </div>

                    {/* Form fields */}
                    <div className="space-y-4">
                        <div>
                            <label className={`block ${COLORS.text.label} mb-2 font-medium`}>Name</label>
                            <input
                                type="text"
                                name="name"
                                value={focusedMod.name}
                                onChange={handleChange}
                                className={`w-full rounded-lg px-4 py-3 ${COLORS.background.input} ${TRANSITIONS.base} ${COLORS.text.primary}`}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={`block ${COLORS.text.label} mb-2 font-medium`}>Version</label>
                                <input
                                    type="text"
                                    name="version"
                                    value={focusedMod.version}
                                    onChange={handleChange}
                                    className={`w-full rounded-lg px-4 py-3 ${COLORS.background.input} ${TRANSITIONS.base} ${COLORS.text.primary}`}
                                />
                            </div>
                            <div>
                                <label className={`block ${COLORS.text.label} mb-2 font-medium`}>Author</label>
                                <input
                                    type="text"
                                    name="author"
                                    value={focusedMod.author}
                                    onChange={handleChange}
                                    className={`w-full rounded-lg px-4 py-3 ${COLORS.background.input} ${TRANSITIONS.base} ${COLORS.text.primary}`}
                                />
                            </div>
                        </div>

                        <div>
                            <label className={`block ${COLORS.text.label} mb-2 font-medium`}>Description</label>
                            <textarea
                                name="description"
                                value={focusedMod.description}
                                onChange={handleChange}
                                rows={5}
                                className={`w-full rounded-lg px-4 py-3 ${COLORS.background.input} ${TRANSITIONS.base} ${COLORS.text.primary}`}
                            />
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex space-x-3 pt-4">
                        <button
                            type="submit"
                            className={`flex-1 py-3 rounded-lg ${COLORS.background.button.primary} ${TRANSITIONS.button} ${COLORS.shadow.button} font-medium`}
                        >
                            Save Changes
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className={`flex-1 py-3 rounded-lg ${COLORS.background.button.secondary} ${TRANSITIONS.button} font-medium`}
                        >
                            Close
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ModInfoPanel;
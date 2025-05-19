import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Mod } from '../interfaces/Mod.interface';
import { open } from '@tauri-apps/plugin-dialog';
import { setModThumbnail } from '../services/mod.service';
import { convertFileSrc } from '@tauri-apps/api/core';

// Design tokens - moved to separate constants file would be even better
const COLORS = {
    background: {
        panel: 'bg-gradient-to-b from-gray-300 to-gray-200 dark:bg-gradient-to-b dark:from-gray-800 dark:to-gray-900 bg-gradient-to-b from-gray-100 to-gray-200',
        input: 'bg-gray-400 hover:bg-gray-500 focus:bg-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:bg-gray-600 bg-gray-200 hover:bg-gray-300 focus:bg-gray-300',
        button: {
            primary: 'bg-blue-600 hover:bg-blue-500 dark:bg-blue-600 dark:hover:bg-blue-500 bg-blue-500 hover:bg-blue-400',
            secondary: 'bg-gray-700 hover:bg-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600 bg-gray-300 hover:bg-gray-400',
            toggle: {
                enabled: 'bg-green-500 text-white hover:bg-green-600 dark:text-gray-900 dark:hover:bg-green-500',
                disabled: 'bg-gray-300 text-gray-700 hover:bg-gray-400 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500',
            },
        },
    },
    text: {
        primary: 'text-white dark:text-white text-gray-900',
        secondary: 'text-gray-300 dark:text-gray-300 text-gray-700',
        label: 'text-gray-400 dark:text-gray-400 text-gray-600',
    },
    border: {
        panel: 'border-l border-white dark:border-gray-700 border-gray-300',
        image: 'border-2 border-white hover:border-blue-500 dark:border-gray-700 dark:hover:border-blue-500 border-gray-300 hover:border-blue-400',
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
    const [thumbnailBase64, setThumbnailBase64] = useState<string>('');
    const [displayThumbnail, setDisplayThumbnail] = useState<string>('');
    const thumbnailRefZone = useRef<HTMLDivElement>(null);

    // Sync with parent mod changes
    useEffect(() => {
        setFocusedMod(mod);
        setDisplayThumbnail(mod.thumbnail ? convertFileSrc(mod.thumbnail) : '');
        if (isOpen && thumbnailRefZone.current) {
            thumbnailRefZone.current.focus();
        }
    }, [mod]);

    // Generic input handler for all form fields
    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const { name, value } = e.target;
            setFocusedMod(prev => ({ ...prev, [name]: value }));
        },
        []
    );

    const handleToggle = useCallback(() => {
        onUpdate({ ...focusedMod, enabled: !focusedMod.enabled });
    }, [focusedMod, onUpdate]);

    const handleSubmit = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();
            if (thumbnailPath) setModThumbnail({ mod: focusedMod, thumbnailPath: thumbnailPath });
            if (thumbnailBase64) {
                setModThumbnail({ mod: focusedMod, base64: thumbnailBase64 });
            }
            onUpdate(focusedMod);
            // Reset thumbnailPath and thumbnailBase64 after submit
            setThumbnailPath('');
            setThumbnailBase64('');
        },
        [focusedMod, onUpdate, thumbnailPath, thumbnailBase64]
    );

    const handleImage = useCallback(async (file: File | string) => {
        try {
            if (typeof file === 'string') {
                setThumbnailPath(file);
                setDisplayThumbnail(convertFileSrc(file));
                console.log('File path:', file);

            } else {
                const reader = new FileReader();
                reader.onload = () => {
                    const result = reader.result as string;
                    setThumbnailBase64(result.replace(/^data:image\/\w+;base64,/, '') || '');
                    console.log('Base64:', result);
                    setDisplayThumbnail(result);
                };
                reader.readAsDataURL(file);
            }
        } catch (error) {
            console.error('Error processing image:', error);
        }
    }, []);


    // File selection via dialog
    const handleThumbnailChange = useCallback(async () => {
        try {
            const file = await open({
                multiple: false,
                directory: false,
                filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'webp'] }],
            });
            if (file) handleImage(file as string);
        } catch (error) {
            console.error('Error selecting image:', error);
        }
    }, [handleImage]);

    // Drag and drop handlers
    const handleDrop = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            const file = e.dataTransfer.files?.[0];
            if (file?.type.startsWith('image/')) handleImage(file);
        },
        [handleImage]
    );

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    }, []);

    // Paste handler
    const handlePaste = useCallback(

        (e: React.ClipboardEvent<HTMLDivElement>) => {
            const file = e.clipboardData.files?.[0] ||
                Array.from(e.clipboardData.items)
                    .find(item => item.type.startsWith('image/'))
                    ?.getAsFile();
            if (file) handleImage(file);
        },
        [handleImage]
    );

    if (!isOpen) return null;

    // Panel classes
    const panelClasses = [
        'inset-y-0 right-0 w-full md:w-1/2 lg:w-1/3 xl:w-1/4 z-20',
        COLORS.background.panel,
        COLORS.border.panel,
        COLORS.shadow.panel,
        'transform',
        isOpen ? 'translate-x-0' : 'translate-x-full',
        TRANSITIONS.base,
        'flex flex-col',
    ].join(' ');

    return (
        <div className={panelClasses}>
            {/* Header */}
            < div className="flex justify-between items-center p-6 border-b border-gray-700" >
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
            </div >

            {/* Scrollable content */}
            < div className="flex-1 overflow-y-auto p-6" >
                {/* Thumbnail with multiple input methods */}
                <div className="pb-8 relative group">
                    {/* Thumbnail display area - only shows image and handles drag/paste */}
                    <div
                        ref={thumbnailRefZone}
                        className={`w-full z-10 aspect-video rounded-xl overflow-hidden ${COLORS.border.image} ${COLORS.shadow.image} ${TRANSITIONS.image}`}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onPaste={handlePaste}
                        title="Drag or paste image to change"
                        tabIndex={0}  // Make the div focusable
                        onClick={() => thumbnailRefZone.current?.focus()}  // Focus on click
                    >
                        {displayThumbnail ? (
                            <img
                                src={displayThumbnail}
                                className="w-full h-full object-cover"
                                onDragOver={handleDragOver}  // Propagate drag events to parent
                                onDrop={handleDrop}          // Propagate drop events to parent
                            />
                        ) : (
                            <div className={`w-full h-full flex flex-col items-center justify-center ${COLORS.background.input}`}>
                                <svg className="w-12 h-12 mb-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span className="text-sm text-gray-400">Drag or paste image</span>
                            </div>
                        )}
                    </div>

                    {/* Separate button for file selection */}
                    <div className="mt-4 flex justify-center">
                        <button
                            type="button"
                            onClick={handleThumbnailChange}
                            className={`px-4 py-2 rounded-lg ${COLORS.background.button.primary} ${TRANSITIONS.button} flex items-center gap-2`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Change Thumbnail
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Toggle and title */}
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold truncate max-w-xs">{focusedMod.name}</h3>
                        <button
                            type="button"
                            onClick={handleToggle}
                            className={`px-4 py-2 rounded-full ${TRANSITIONS.button} ${COLORS.shadow.button} ${focusedMod.enabled
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
            </div >
        </div >
    );
};

export default React.memo(ModInfoPanel);
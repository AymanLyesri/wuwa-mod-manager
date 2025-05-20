import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Mod } from '../interfaces/Mod.interface';
import { open } from '@tauri-apps/plugin-dialog';
import { setModThumbnail } from '../services/mod.service';
import { convertFileSrc } from '@tauri-apps/api/core';
import { categories } from '../constants/categories.constant';
import { COLORS, STYLE, TRANSITIONS } from '../constants/styling.constant';
import StatusButton from './StatusButton';

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
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
            const { name, value } = e.target;
            console.log(`Field changed: ${name} = ${value}`);
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



    return (
        <div className={STYLE.panel + 'inset-y-0 right-0 w-full md:w-1/2 lg:w-1/3 xl:w-1/4 h-full flex flex-col rounded-none'}>
            {/* Header with close button */}
            <div className="flex justify-between items-center p-4 mb-4 border-b border-neutral-700">
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
            <div className="flex-1 overflow-y-auto">
                {/* Thumbnail with multiple input methods */}
                <div className="pb-6 relative group">
                    {/* Thumbnail display area - only shows image and handles drag/paste */}
                    <div
                        ref={thumbnailRefZone}
                        className={`w-full z-10 aspect-video rounded-xl ${STYLE.image} group`}
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
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                            />
                        ) : (
                            <div className={`w-full h-full flex flex-col items-center justify-center ${COLORS.background.input}`}>
                                <svg className="w-12 h-12 mb-2 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span className="text-sm text-neutral-400">Drag or paste image</span>
                            </div>
                        )}
                        {/* Open Dialog button, only visible on hover */}
                        <div className="absolute inset-0 flex justify-center items-end pb-4 pointer-events-none group-hover:pointer-events-auto group-hover:opacity-100 opacity-0 transition-opacity duration-200">
                            <button
                                type="button"
                                onClick={handleThumbnailChange}
                                className={`px-4 py-2 rounded-lg ${COLORS.background.button.primary} ${TRANSITIONS.button} flex items-center gap-2 pointer-events-auto`}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Open Dialog
                            </button>
                        </div>
                    </div>
                </div>
                {/* Form for mod details */}
                <form onSubmit={handleSubmit} className="">
                    {/* Toggle and title */}
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold truncate max-w-xs">{focusedMod.name}</h3>
                        <StatusButton
                            mod={focusedMod}
                            onClick={handleToggle} />
                    </div>

                    {focusedMod.category && (
                        <div className="flex items-center mb-2">
                            {categories.find(cat => cat.name === focusedMod.category)?.icon && (
                                <img
                                    src={categories.find(cat => cat.name === focusedMod.category)?.icon}
                                    alt={focusedMod.category}
                                    className="inline w-5 h-5 mr-2 align-middle"
                                />
                            )}
                            <span className="font-medium">{focusedMod.category}</span>
                        </div>
                    )}

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

                        <label className={`block ${COLORS.text.label} mb-2 font-medium`}>Category</label>
                        <select
                            name="category"
                            value={focusedMod.category || ""}
                            onChange={handleChange}
                            className={`w-full rounded-lg px-4 py-3 ${STYLE.select}`}
                        >
                            {categories.map((cat, index) => (
                                <option key={index} value={cat.name}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>

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
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Mod } from '../interfaces/Mod.interface';
import { open } from '@tauri-apps/plugin-dialog';
import { setModThumbnail } from '../services/mod.service';
import { convertFileSrc } from '@tauri-apps/api/core';
import { categories } from '../constants/categories.constant';
import { COLORS, STYLE } from '../constants/styling.constant';
import StatusButton from './StatusButton';
import { motion } from 'framer-motion';

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

    useEffect(() => {
        setFocusedMod(mod);
        setDisplayThumbnail(mod.thumbnail ? convertFileSrc(mod.thumbnail) : '');
        if (isOpen && thumbnailRefZone.current) {
            thumbnailRefZone.current.focus();
        }
    }, [mod, isOpen]);

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
            if (thumbnailPath) setModThumbnail({ mod: focusedMod, thumbnailPath });
            if (thumbnailBase64) setModThumbnail({ mod: focusedMod, base64: thumbnailBase64 });
            onUpdate(focusedMod);
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
            } else {
                const reader = new FileReader();
                reader.onload = () => {
                    const result = reader.result as string;
                    setThumbnailBase64(result.replace(/^data:image\/\w+;base64,/, ''));
                    setDisplayThumbnail(result);
                };
                reader.readAsDataURL(file);
            }
        } catch (error) {
            console.error('Error processing image:', error);
        }
    }, []);

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
        <motion.div
            // key={mod.name}
            initial={{ x: '50%' }}
            animate={{ x: 0 }}
            exit={{ x: '50%' }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className={STYLE.infoPanel}
        >

            {/* Header */}
            <div className={STYLE.panelHeader}>
                <h2 className={`${STYLE.text.heading}`}>Mod Details</h2>
                <button
                    onClick={onClose}
                    className={`p-2 rounded-full ${COLORS.background.button.secondary}`}
                    aria-label="Close panel"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto p-4">
                {/* Thumbnail section */}
                <div className="pb-6 relative group">
                    <div
                        ref={thumbnailRefZone}
                        className={STYLE.thumbnailContainer}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onPaste={handlePaste}
                        title="Drag or paste image to change"
                        tabIndex={0}
                    >
                        {displayThumbnail ? (
                            <img
                                src={displayThumbnail}
                                className="w-full h-full object-cover"
                                alt="Mod thumbnail"
                            />
                        ) : (
                            <div className={STYLE.thumbnailDropzone}>
                                <svg className="w-12 h-12 mb-2 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span className="text-sm text-neutral-400">Drag or paste image</span>
                            </div>
                        )}
                        <div className="absolute inset-0 flex justify-center items-end pb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <button
                                type="button"
                                onClick={handleThumbnailChange}
                                className={`px-4 py-2 rounded-lg ${COLORS.background.button.primary} flex items-center gap-2`}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Change Image
                            </button>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className={`${STYLE.text.heading} truncate max-w-xs`}>{focusedMod.name}</h3>
                        <StatusButton mod={focusedMod} onClick={handleToggle} />
                    </div>

                    {focusedMod.category && (
                        <div className="flex items-center mb-4">
                            {categories.find(cat => cat.name === focusedMod.category)?.icon && (
                                <img
                                    src={categories.find(cat => cat.name === focusedMod.category)?.icon}
                                    alt={focusedMod.category}
                                    className="w-5 h-5 mr-2"
                                />
                            )}
                            <span className={`${STYLE.text.label} font-medium`}>{focusedMod.category}</span>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className={`${STYLE.text.label} mb-2 block`}>Name</label>
                            <input
                                type="text"
                                name="name"
                                value={focusedMod.name}
                                onChange={handleChange}
                                className={STYLE.formInput}
                            />
                        </div>

                        <div>
                            <label className={`${STYLE.text.label} mb-2 block`}>Category</label>
                            <select
                                name="category"
                                value={focusedMod.category || ''}
                                onChange={handleChange}
                                className={STYLE.formInput}
                            >
                                <option value="">Select a category</option>
                                {categories.map((cat) => (
                                    <option key={cat.name} value={cat.name}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={`${STYLE.text.label} mb-2 block`}>Version</label>
                                <input
                                    type="text"
                                    name="version"
                                    value={focusedMod.version}
                                    onChange={handleChange}
                                    className={STYLE.formInput}
                                />
                            </div>
                            <div>
                                <label className={`${STYLE.text.label} mb-2 block`}>Author</label>
                                <input
                                    type="text"
                                    name="author"
                                    value={focusedMod.author}
                                    onChange={handleChange}
                                    className={STYLE.formInput}
                                />
                            </div>
                        </div>

                        <div>
                            <label className={`${STYLE.text.label} mb-2 block`}>Description</label>
                            <textarea
                                name="description"
                                value={focusedMod.description}
                                onChange={handleChange}
                                rows={5}
                                className={STYLE.formInput}
                            />
                        </div>
                    </div>

                    <div className={STYLE.actionButtons}>
                        <button
                            type="submit"
                            className={`flex-1 ${STYLE.button.primary}`}
                        >
                            Save Changes
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className={`flex-1 ${STYLE.button.secondary}`}
                        >
                            Close
                        </button>
                    </div>
                </form>
            </div>

        </motion.div >
    );
};

export default React.memo(ModInfoPanel);
import React from 'react';
import { Mod } from '../interfaces/Mod.interface';
import { convertFileSrc } from '@tauri-apps/api/core';
import StatusButton from './StatusButton';
import { COLORS, STYLE, TRANSITIONS } from '../constants/styling.constant';

interface ModCardProps {
    mod: Mod;
    onUpdateMod: (mod: Mod) => void;
    onClick: () => void;
}

const ModCard: React.FC<ModCardProps> = ({ mod, onUpdateMod, onClick }) => {
    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        onUpdateMod({ ...mod, enabled: !mod.enabled });
    };

    return (
        <div
            className={`relative ${STYLE.card} ${TRANSITIONS.base} 
                hover:scale-[1.02] will-change-transform cursor-pointer
                hover:shadow-lg hover:border-indigo-300/30 dark:hover:border-indigo-500/30`}
            onClick={onClick}
        >
            {/* Image container with shimmer effect */}
            <div className="relative w-full h-48 overflow-hidden rounded-t-xl">
                {mod.thumbnail ? (
                    <>
                        <img
                            src={convertFileSrc(mod.thumbnail) + "?t=" + Date.now()}
                            alt={mod.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {/* Shimmer overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </>
                ) : (
                    <div className={`w-full h-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center`}>
                        <svg
                            className="w-12 h-12 text-neutral-400 dark:text-neutral-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                        </svg>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 min-w-0">
                        <h3 className={`${STYLE.text.heading} truncate`}>
                            {mod.name}
                        </h3>
                        <p className={`${STYLE.text.caption} italic`}>
                            by {mod.author}
                        </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${mod.enabled
                        ? 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400'
                        : 'bg-neutral-200 text-neutral-500 dark:bg-neutral-700 dark:text-neutral-400'
                        }`}>
                        v{mod.version}
                    </span>
                </div>

                <p className={`${STYLE.text.body} line-clamp-2 mb-4 leading-snug`}>
                    {mod.description}
                </p>

                {/* Buttons */}
                <div className="flex justify-between items-center">
                    <StatusButton
                        mod={mod}
                        onClick={handleToggle} />

                    <button
                        className={`text-sm font-medium ${COLORS.accent.primary} ${TRANSITIONS.interactive} 
                            flex items-center gap-1 hover:underline`}
                        onClick={(e) => {
                            e.stopPropagation();
                            onClick();
                        }}
                    >
                        Details
                        <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                            />
                        </svg>
                    </button>
                </div>
            </div>

            {mod.enabled && (
                <div className="absolute top-0 right-0 w-full">
                    <div className="
      h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent
      shadow-[0_1px_4px_rgba(16,185,129,0.3)]
    "/>
                </div>
            )}
        </div>
    );
};

export default ModCard;
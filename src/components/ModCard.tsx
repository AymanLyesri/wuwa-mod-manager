import React from 'react';
import { Mod } from '../interfaces/Mod.interface';

interface ModCardProps {
    mod: Mod;
    onUpdateMod: (mod: Mod) => void;
    onClick: () => void;
}

// Design tokens organized for maintainability
const COLORS = {
    background: {
        base: 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700',
        hover: 'bg-gradient-to-br from-gray-800 via-gray-700 to-gray-600',
        imagePlaceholder: 'bg-gradient-to-br from-gray-700 to-gray-600',
    },
    border: {
        base: 'border border-gray-600/50',
        hover: 'border-gray-500/70',
    },
    text: {
        primary: 'text-white',
        secondary: 'text-gray-300',
        tertiary: 'text-gray-400',
        accent: 'text-green-400',
    },
    button: {
        enabled: 'bg-green-600 hover:bg-green-700 text-white',
        disabled: 'bg-gray-600/70 hover:bg-gray-700 text-white',
        info: 'text-gray-400 hover:text-white',
    },
    effects: {
        glow: 'hover:shadow-[0_0_20px_-5px_rgba(74,222,128,0.6)]',
        overlay: 'bg-gradient-to-t from-black/80 via-black/30 to-transparent',
    },
};

const TRANSITIONS = {
    base: 'transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
    hoverScale: 'hover:scale-[1.02]',
    button: 'transition-colors duration-200 ease-out',
};

const ModCard: React.FC<ModCardProps> = ({ mod, onUpdateMod, onClick }) => {
    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        onUpdateMod({ ...mod, enabled: !mod.enabled });
    };

    return (
        <div
            className={`relative ${COLORS.background.base} ${COLORS.border.base} 
                rounded-xl shadow-lg overflow-hidden ${TRANSITIONS.base} 
                ${TRANSITIONS.hoverScale} ${COLORS.effects.glow} 
                hover:${COLORS.background.hover} hover:${COLORS.border.hover}
                group cursor-pointer will-change-transform`}
            onClick={onClick}
        >
            {/* Image container with shimmer effect */}
            <div className="relative w-full h-48 overflow-hidden">
                {mod.thumbnail ? (
                    <>
                        <img
                            src={mod.thumbnail}
                            alt={mod.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {/* Shimmer overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </>
                ) : (
                    <div className={`w-full h-full ${COLORS.background.imagePlaceholder} flex items-center justify-center`}>
                        <svg
                            className="w-12 h-12 text-gray-500"
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

            {/* Content overlay */}
            <div className={`absolute inset-0 ${COLORS.effects.overlay} opacity-0 group-hover:opacity-100 ${TRANSITIONS.base} pointer-events-none`} />

            {/* Content */}
            <div className="relative p-5 z-10">
                <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0">
                        <h3 className={`text-xl font-bold ${COLORS.text.primary} tracking-tight truncate`}>
                            {mod.name}
                        </h3>
                        <p className={`text-xs ${COLORS.text.tertiary} italic`}>
                            by {mod.author}
                        </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${mod.enabled ? 'bg-green-900/40 text-green-300' : 'bg-gray-700/60 text-gray-400'}`}>
                        v{mod.version}
                    </span>
                </div>

                <p className={`text-sm ${COLORS.text.secondary} line-clamp-2 mb-5 leading-snug`}>
                    {mod.description}
                </p>

                {/* Buttons */}
                <div className="flex justify-between items-center">
                    <button
                        onClick={handleToggle}
                        className={`px-4 py-2 rounded-full text-sm font-semibold ${TRANSITIONS.button} 
                            ${mod.enabled ? COLORS.button.enabled : COLORS.button.disabled}
                            flex items-center gap-2`}
                    >
                        {mod.enabled ? (
                            <>
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-300 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
                                </span>
                                Enabled
                            </>
                        ) : (
                            'Disabled'
                        )}
                    </button>

                    <button
                        className={`text-xs font-medium ${COLORS.button.info} ${TRANSITIONS.button} 
                            underline underline-offset-4 decoration-dotted flex items-center gap-1`}
                        onClick={(e) => {
                            e.stopPropagation();
                            onClick();
                        }}
                    >
                        Details
                        <svg
                            className="w-3 h-3"
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

            {/* Enabled indicator ribbon */}
            {mod.enabled && (
                <div className="absolute top-0 right-0 w-2 h-full bg-green-500/80"></div>
            )}
        </div>
    );
};

export default ModCard;
import React from 'react';
import ModCard from './ModCard';
import { Mod } from '../interfaces/Mod.interface';

interface ModGridProps {
    mods: Mod[];
    onToggleMod: (mod: Mod, enabled: boolean) => void;
    onModClick: (mod: Mod) => void;
}

const ModGrid: React.FC<ModGridProps> = ({ mods, onToggleMod, onModClick }) => {
    return (
        <div className="grid [grid-template-columns:repeat(auto-fit,minmax(300px,1fr))] gap-6 p-6">

            {mods.map((mod) => (
                <ModCard
                    key={mod.id}
                    mod={mod}
                    onToggle={onToggleMod}
                    onClick={() => onModClick(mod)}
                />
            ))}
        </div>
    );
};

export default ModGrid;
import React from 'react';
import ModCard from './ModCard';
import { Mod } from '../interfaces/Mod.interface';

interface ModGridProps {
    mods: Mod[];
    columns: number;
    onToggleMod: (mod: Mod, enabled: boolean) => void;
    onModClick: (mod: Mod) => void;
}

const ModGrid: React.FC<ModGridProps> = ({ mods, columns, onToggleMod, onModClick }) => {
    const gridClasses = {
        1: 'grid-cols-1',
        2: 'grid-cols-2',
        3: 'grid-cols-3',
        4: 'grid-cols-4',
        5: 'grid-cols-5',
    }[columns] || 'grid-cols-4';

    return (
        <div className={`grid ${gridClasses} gap-6 p-6`}>
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
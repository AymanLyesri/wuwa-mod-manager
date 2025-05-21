import React, { useState, useMemo } from "react";

export interface Mod {
    id: string;
    URL: string;
    name: string;
    path: string;
    author: string;
    description: string;
    category: string;
    version: string;
    thumbnail: string;
    enabled: boolean;
}

interface Props {
    mods: Mod[];
    onFilter: (filtered: Mod[]) => void;
}

const FilterMods: React.FC<Props> = ({ mods, onFilter }) => {
    const [filters, setFilters] = useState<Partial<Record<keyof Mod, string>>>({});

    // Extract unique values for each property
    const filterOptions = useMemo(() => {
        const keysToFilter: (keyof Mod)[] = ["author", "category", "version", "enabled"];
        const options: Record<string, Set<string>> = {};

        mods.forEach(mod => {
            keysToFilter.forEach(key => {
                const value = mod[key]?.toString() ?? "";
                if (!options[key]) options[key] = new Set();
                options[key].add(value);
            });
        });

        return options;
    }, [mods]);

    const handleChange = (key: keyof Mod, value: string) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);

        const filtered = mods.filter(mod =>
            Object.entries(newFilters).every(([k, v]) => v === "" || mod[k as keyof Mod]?.toString() === v)
        );

        onFilter(filtered);
    };

    const resetFilters = () => {
        setFilters({});
        onFilter(mods);
    };

    return (
        <div className="flex flex-wrap items-center gap-4">
            {/* Filter Dropdowns */}
            {Object.entries(filterOptions).map(([key, values]) => (
                <select
                    key={key}
                    className="border px-2 py-1 rounded bg-white dark:bg-gray-800"
                    value={filters[key as keyof Mod] ?? ""}
                    onChange={e => handleChange(key as keyof Mod, e.target.value)}
                >
                    <option value="">All {key}</option>
                    {[...values].map(value => (
                        <option key={value} value={value}>
                            {value}
                        </option>
                    ))}
                </select>
            ))}

            {/* Reset Button */}
            <button
                onClick={resetFilters}
                className="text-sm text-blue-500 underline hover:text-blue-700"
            >
                Reset
            </button>
        </div>
    );
};

export default FilterMods;

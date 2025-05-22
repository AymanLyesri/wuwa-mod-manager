import React, { useState, useMemo } from "react";
import { Mod } from "../interfaces/Mod.interface";
import { STYLE } from "../constants/styling.constant";

interface Props {
    mods: Mod[];
    onFilter: (filtered: Mod[]) => void;
}

const sortOptions = [
    { value: "name-asc", label: "Name (A-Z)" },
    { value: "name-desc", label: "Name (Z-A)" },
    { value: "author-asc", label: "Author (A-Z)" },
    { value: "author-desc", label: "Author (Z-A)" },
    { value: "version-asc", label: "Version (Low-High)" },
    { value: "version-desc", label: "Version (High-Low)" },
];

const FilterMods: React.FC<Props> = ({ mods, onFilter }) => {
    const [filters, setFilters] = useState<Partial<Record<keyof Mod, string>>>({});
    const [sortMethod, setSortMethod] = useState<string>("name-asc");

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

    const handleFilterChange = (key: keyof Mod, value: string) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        applyFiltersAndSorting(newFilters, sortMethod);
    };

    const handleSortChange = (method: string) => {
        setSortMethod(method);
        applyFiltersAndSorting(filters, method);
    };

    const applyFiltersAndSorting = (currentFilters: typeof filters, currentSort: string) => {
        // Apply filters
        let filtered = mods.filter(mod =>
            Object.entries(currentFilters).every(([k, v]) => v === "" || mod[k as keyof Mod]?.toString() === v)
        );

        // Apply sorting
        filtered = [...filtered].sort((a, b) => {
            const [sortKey, sortDirection] = currentSort.split("-");

            // Handle enabled separately since it's boolean
            if (sortKey === "enabled") {
                return sortDirection === "asc"
                    ? Number(a.enabled) - Number(b.enabled)
                    : Number(b.enabled) - Number(a.enabled);
            }

            const aValue = a[sortKey as keyof Mod]?.toString().toLowerCase() || "";
            const bValue = b[sortKey as keyof Mod]?.toString().toLowerCase() || "";

            if (sortDirection === "asc") {
                return aValue.localeCompare(bValue);
            } else {
                return bValue.localeCompare(aValue);
            }
        });

        onFilter(filtered);
    };

    const resetFilters = () => {
        setFilters({});
        setSortMethod("name-asc");
        onFilter(mods);
    };

    return (


        <div className="flex flex-wrap items-center gap-3">
            {/* Filter Dropdowns */}
            {Object.entries(filterOptions).map(([key, values]) => (
                <div key={key} className="relative min-w-[150px] flex-1">
                    <select
                        className={STYLE.select}
                        value={filters[key as keyof Mod] ?? ""}
                        onChange={e => handleFilterChange(key as keyof Mod, e.target.value)}
                    >
                        <option value="">All {key}</option>
                        {[...values].map(value => (
                            <option key={value} value={value}>
                                {value}
                            </option>
                        ))}
                    </select>
                </div>
            ))}

            {/* Sort Dropdown */}
            <div className="relative min-w-[180px]">
                <select
                    className={STYLE.select}
                    value={sortMethod}
                    onChange={e => handleSortChange(e.target.value)}
                >
                    {sortOptions.map(option => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Reset Button */}
            <button
                onClick={resetFilters}
                className={STYLE.button.secondary}
            >
                Reset Filters
            </button>
        </div>

    );
};

export default FilterMods;
import React, { useState, useMemo } from "react";
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
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
        let filtered = mods.filter(mod =>
            Object.entries(currentFilters).every(([k, v]) => v === "" || mod[k as keyof Mod]?.toString() === v)
        );

        filtered = [...filtered].sort((a, b) => {
            const [sortKey, sortDirection] = currentSort.split("-");
            if (sortKey === "enabled") {
                return sortDirection === "asc"
                    ? Number(a.enabled) - Number(b.enabled)
                    : Number(b.enabled) - Number(a.enabled);
            }

            const aValue = a[sortKey as keyof Mod]?.toString().toLowerCase() || "";
            const bValue = b[sortKey as keyof Mod]?.toString().toLowerCase() || "";

            return sortDirection === "asc"
                ? aValue.localeCompare(bValue)
                : bValue.localeCompare(aValue);
        });

        onFilter(filtered);
    };

    const resetFilters = () => {
        setFilters({});
        setSortMethod("name-asc");
        onFilter(mods);
    };

    return (
        <div className="flex justify-end gap-3">
            <Popover className="relative">
                <PopoverButton className={STYLE.button.secondary}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 " viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                    </svg>
                    <span>Filter</span>
                </PopoverButton>

                <PopoverPanel className={STYLE.panel + " absolute z-10 right-0 mt-2 w-96 p-4 flex flex-col gap-5"}>
                    {/* Filter Dropdowns */}
                    {Object.entries(filterOptions).map(([key, values]) => (
                        <div key={key}>
                            <label className="block text-sm font-medium mb-1 capitalize">{key}</label>
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
                    <div>
                        <label className="block text-sm font-medium mb-1">Sort By</label>
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
                    <div className="flex justify-end">
                        <button
                            onClick={resetFilters}
                            className={STYLE.button.secondary}
                        >
                            Reset Filters
                        </button>
                    </div>
                </PopoverPanel>
            </Popover>
        </div>
    );
};

export default FilterMods;

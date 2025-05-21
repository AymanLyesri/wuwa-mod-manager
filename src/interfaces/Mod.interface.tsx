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


export function filterModsByProperty<K extends keyof Mod>(
    mods: Mod[],
    property: K,
    value: Mod[K]
): Mod[] {
    return mods.filter(mod => mod[property] === value);
}
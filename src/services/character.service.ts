import { invoke } from "@tauri-apps/api/core";
import categories from "../assets/categories.json";
import { Character } from "../interfaces/Character.interface";

const STATIC_CHARACTERS: Character[] = categories.categories
    .filter((category) => category.name && !category.name.startsWith("\\"))
    .map((category) => ({
        name: category.name,
        thumbnail: category.icon,
    }))
    .filter((character) => character.name !== "*Uncategorized");

export const getCharacters = async (): Promise<Character[]> => {
    console.log("[characters] Requesting scraped character list");

    try {
        const characters = await invoke<Character[]>("scrape_characters");

        console.log(
            `[characters] Scraper returned ${characters.length} characters`
        );

        if (!characters.length) {
            throw new Error("Scraper returned an empty character list");
        }

        return characters;
    } catch (error) {
        console.warn(
            "[characters] Scraper failed, falling back to static characters",
            error
        );
        console.log(
            `[characters] Static fallback contains ${STATIC_CHARACTERS.length} characters`
        );

        return STATIC_CHARACTERS;
    }
};
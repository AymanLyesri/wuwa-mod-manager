import { invoke } from "@tauri-apps/api/core";
import categories from "../assets/categories.json";
import { Character } from "../interfaces/Character.interface";
import { toast } from "react-toastify";

const STATIC_CHARACTERS: Character[] = categories.categories
    .filter((category) => category.name && !category.name.startsWith("\\"))
    .map((category) => ({
        name: category.name,
        thumbnail: category.icon,
    }))
    .filter((character) => character.name !== "*Uncategorized");

let cachedCharacters: Character[] | null = null;
let charactersRequest: Promise<Character[]> | null = null;

export const getCharacters = async (): Promise<Character[]> => {
    if (cachedCharacters) {
        return cachedCharacters;
    }

    if (charactersRequest) {
        return charactersRequest;
    }

    console.log("[characters] Requesting scraped character list");

    charactersRequest = (async () => {
        try {
            const characters = await invoke<Character[]>("scrape_characters");

            console.log(
                `[characters] Scraper returned ${characters.length} characters`
            );

            if (!characters.length) {
                throw new Error("Scraper returned an empty character list");
            }

            toast.success("Character list loaded successfully");
            cachedCharacters = characters;
            return characters;
        } catch (error) {
            console.warn(
                "[characters] Scraper failed, falling back to static characters",
                error
            );
            console.log(
                `[characters] Static fallback contains ${STATIC_CHARACTERS.length} characters`
            );
            toast.error("Error loading characters. Using local fallback list.");

            // Keep the live cache empty so a later call can retry the scraper.
            cachedCharacters = null;
            return STATIC_CHARACTERS;
        } finally {
            charactersRequest = null;
        }
    })();

    return charactersRequest;
};
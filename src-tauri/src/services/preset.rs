use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::path::Path;
use uuid::Uuid;

use crate::services::mod_service::get_folder_mods;

#[derive(Debug, Serialize, Deserialize)]
pub struct ModPreset {
    pub name: String,
    pub enabled_mods: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize, Default)]
pub struct Presets {
    pub presets: HashMap<String, ModPreset>,
}

#[tauri::command]
pub fn save_preset(path: String, preset_name: String, enabled_mods: Vec<String>) -> Result<(), String> {
    let dir = Path::new(&path);
    let presets_path = dir.join("presets.json");

    let mut presets = if presets_path.exists() {
        let content = fs::read_to_string(&presets_path)
            .map_err(|e| format!("Failed to read presets.json: {}", e))?;
        serde_json::from_str::<Presets>(&content)
            .map_err(|e| format!("Failed to parse presets.json: {}", e))?
    } else {
        Presets::default()
    };

    let existing_preset_id = presets
        .presets
        .iter()
        .find(|(_, preset)| preset.name == preset_name)
        .map(|(id, _)| id.clone());

    let preset_id = existing_preset_id.unwrap_or_else(|| Uuid::new_v4().to_string());
    let new_preset = ModPreset {
        name: preset_name,
        enabled_mods,
    };

    presets.presets.insert(preset_id, new_preset);

    let json = serde_json::to_string_pretty(&presets)
        .map_err(|e| format!("Failed to serialize presets: {}", e))?;
    fs::write(&presets_path, json).map_err(|e| format!("Failed to write presets.json: {}", e))?;

    Ok(())
}

#[tauri::command]
pub fn get_presets(path: String) -> Result<HashMap<String, ModPreset>, String> {
    let dir = Path::new(&path);
    let presets_path = dir.join("presets.json");

    if !presets_path.exists() {
        return Ok(HashMap::new());
    }

    let content = fs::read_to_string(&presets_path)
        .map_err(|e| format!("Failed to read presets.json: {}", e))?;
    let presets: Presets = serde_json::from_str(&content)
        .map_err(|e| format!("Failed to parse presets.json: {}", e))?;

    Ok(presets.presets)
}

#[tauri::command]
pub fn delete_preset(path: String, preset_id: String) -> Result<(), String> {
    let dir = Path::new(&path);
    let presets_path = dir.join("presets.json");

    if !presets_path.exists() {
        return Err("Presets file does not exist".to_string());
    }

    let content = fs::read_to_string(&presets_path)
        .map_err(|e| format!("Failed to read presets.json: {}", e))?;
    let mut presets: Presets = serde_json::from_str(&content)
        .map_err(|e| format!("Failed to parse presets.json: {}", e))?;

    if presets.presets.remove(&preset_id).is_none() {
        return Err("Preset not found".to_string());
    }

    let json = serde_json::to_string_pretty(&presets)
        .map_err(|e| format!("Failed to serialize presets: {}", e))?;
    fs::write(&presets_path, json).map_err(|e| format!("Failed to write presets.json: {}", e))?;

    Ok(())
}

#[tauri::command]
pub fn apply_preset(path: String, preset_id: String) -> Result<(), String> {
    println!("Applying preset {} to path {}", preset_id, path);

    let dir = Path::new(&path);
    let presets_path = dir.join("presets.json");

    if !presets_path.exists() {
        return Err(format!("Presets file not found at {:?}", presets_path));
    }

    let content = fs::read_to_string(&presets_path)
        .map_err(|e| format!("Failed to read presets.json: {}", e))?;

    println!("Loaded presets file content");

    let presets: Presets = serde_json::from_str(&content)
        .map_err(|e| format!("Failed to parse presets.json: {}", e))?;

    let preset = presets
        .presets
        .get(&preset_id)
        .ok_or_else(|| format!("Preset {} not found in presets file", preset_id))?;

    println!(
        "Found preset '{}' with {} enabled mods",
        preset.name,
        preset.enabled_mods.len()
    );

    let mods = get_folder_mods(path.clone())?;
    println!("Found {} total mods in directory", mods.len());

    for mod_entry in mods {
        let mod_path = Path::new(&mod_entry.path);
        println!("Processing mod: {} (ID: {})", mod_entry.name, mod_entry.id);

        if !mod_path.exists() || !mod_path.is_dir() {
            println!("Skipping non-existent mod directory: {:?}", mod_path);
            continue;
        }

        let should_be_enabled = preset.enabled_mods.contains(&mod_entry.id);
        println!(
            "Mod {} should be {}",
            mod_entry.id,
            if should_be_enabled {
                "enabled"
            } else {
                "disabled"
            }
        );

        if mod_entry.enabled == should_be_enabled {
            println!("Mod {} is already in correct state", mod_entry.id);
            continue;
        }

        let current_name = match mod_path.file_name().and_then(|n| n.to_str()) {
            Some(name) => name.to_string(),
            None => {
                println!("Failed to get filename for mod at {:?}", mod_path);
                continue;
            }
        };

        let new_name = if should_be_enabled {
            if current_name.starts_with("disabled ") {
                current_name[9..].to_string()
            } else {
                current_name.clone()
            }
        } else {
            if !current_name.starts_with("disabled ") {
                format!("disabled {}", current_name)
            } else {
                current_name.clone()
            }
        };

        if current_name != new_name {
            if let Some(parent) = mod_path.parent() {
                let new_path = parent.join(&new_name);
                println!("Renaming mod from '{}' to '{}'", current_name, new_name);

                if new_path.exists() {
                    println!(
                        "Warning: Target path {:?} already exists, skipping rename",
                        new_path
                    );
                    continue;
                }

                match fs::rename(mod_path, &new_path) {
                    Ok(_) => println!("Successfully renamed mod directory"),
                    Err(e) => {
                        println!(
                            "Failed to rename mod directory from {:?} to {:?}: {}",
                            mod_path, new_path, e
                        );
                        return Err(format!(
                            "Failed to rename mod '{}' while applying preset: {}",
                            current_name, e
                        ));
                    }
                }
            } else {
                println!("Failed to get parent directory for {:?}", mod_path);
            }
        }
    }

    println!("Successfully applied preset {}", preset_id);
    Ok(())
}

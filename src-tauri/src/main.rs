#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]
use serde::{Deserialize, Serialize};
use tauri::{command, Emitter};

use std::collections::HashMap;
use std::fs::{self, File};
use std::io::{self, Cursor, Read};
use std::path::{Path, PathBuf};

use base64::{engine::general_purpose, Engine as _};
use futures_util::StreamExt;
use uuid::Uuid;

use enigo::{
    Direction::{Press, Release},
    Enigo, Key, Keyboard, Settings,
};
use regex::Regex;
use reqwest::{self, Client};
use zip::ZipArchive;

#[derive(Debug, Serialize, Deserialize)]
struct Categories {
    categories: Vec<Category>,
}

#[derive(Debug, Serialize, Deserialize)]
struct Category {
    name: String,
    icon: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Mod {
    pub id: String,

    // stored
    pub author: String,
    pub description: String,
    pub version: String,
    pub category: String,
    pub url: String,

    // not json stored
    pub name: String,
    pub path: String,
    pub thumbnail: String,
    pub enabled: bool,
}

#[derive(Debug, Serialize, Deserialize, Default)]
struct ModJson {
    id: String,
    author: String,
    description: String,
    version: String,
    category: String,
    url: String,
}

#[derive(Debug, Serialize, Clone)]
struct DownloadProgress {
    downloaded: u64,
    total: u64,
}

#[derive(Debug, Serialize, Deserialize)]
struct ModPreset {
    name: String,
    enabled_mods: Vec<String>, // List of mod IDs that are enabled in this preset
}

#[derive(Debug, Serialize, Deserialize, Default)]
struct Presets {
    presets: HashMap<String, ModPreset>, // Map of preset ID to preset
}

fn load_categories() -> Vec<Category> {
    let categories_json = include_str!("../../src/assets/categories.json");
    match serde_json::from_str::<Categories>(categories_json) {
        Ok(categories) => categories.categories,
        Err(e) => {
            eprintln!("Error loading categories: {}", e);
            Vec::new()
        }
    }
}

fn find_matching_category(name: &str, categories: &[Category]) -> Option<String> {
    let name_lower = name.to_lowercase();
    for category in categories {
        let category_name = category.name.replace("\\", "").to_lowercase();
        if name_lower.contains(&category_name) {
            return Some(category.name.clone());
        }
    }
    None
}

#[command]
fn get_folder_mods(path: String) -> Result<Vec<Mod>, String> {
    let dir = Path::new(&path);

    if !dir.exists() || !dir.is_dir() {
        return Err("Invalid directory path".to_string());
    }

    // Load categories
    let categories = load_categories();

    // Regex to extract version from folder name (e.g., "mod_v1.0")
    // This regex captures the version number in the format "vX.X" or ".X.X"
    let version_regex = Regex::new(r"(?i)v?\.?(\d+\.\d+)").unwrap();

    let mut mods = Vec::new();

    for entry in std::fs::read_dir(dir).map_err(|e| e.to_string())? {
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();

        if !path.is_dir() {
            continue;
        }

        let name = path
            .file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("")
            .to_string();

        let (enabled, display_name) = if name.starts_with("disabled ") {
            (false, name["disabled ".len()..].to_string())
        } else {
            (true, name.clone())
        };

        let thumbnail_path = path.join("thumbnail.png");
        let thumbnail = if thumbnail_path.exists() {
            thumbnail_path.to_string_lossy().to_string()
        } else {
            String::new()
        };

        let details_path = path.join("mod.json");
        let mut details = if details_path.exists() {
            match std::fs::read_to_string(&details_path) {
                Ok(contents) => serde_json::from_str::<ModJson>(&contents).unwrap_or_default(),
                Err(_) => ModJson::default(),
            }
        } else {
            ModJson::default()
        };

        // Generate a new ID if one doesn't exist
        if details.id.is_empty() {
            details.id = Uuid::new_v4().to_string();
            // Save the updated mod.json with the new ID
            if let Ok(json) = serde_json::to_string_pretty(&details) {
                if let Err(e) = fs::write(&details_path, json) {
                    eprintln!("Failed to write mod.json: {}", e);
                }
            }
        }

        // Extract version from folder name if not available in mod.json
        let version = if !details.version.is_empty() {
            details.version
        } else {
            version_regex
                .captures(&name)
                .and_then(|cap| cap.get(1))
                .map(|m| m.as_str().to_string())
                .unwrap_or_else(|| "".to_string())
        };

        let name = display_name.clone();

        // If category is not set in mod.json, try to determine it from the mod name
        if details.category.is_empty() {
            if let Some(category) = find_matching_category(&name, &categories) {
                details.category = category;
            }
        }

        // Get category and url from mod.json, fallback to empty string if not present
        let author = details.author;
        let description = details.description;
        let category = details.category;
        let url = details.url;

        mods.push(Mod {
            id: details.id,
            name,
            path: path.to_string_lossy().to_string(),
            author,
            description,
            version,
            category,
            url,
            thumbnail,
            enabled,
        });
    }

    Ok(mods)
}

#[command]
fn set_mod_thumbnail(path: String, thumbnail_path: String, base64: String) -> Result<(), String> {
    let mod_dir = Path::new(&path);
    let src_path = Path::new(&thumbnail_path);

    if !mod_dir.exists() || !mod_dir.is_dir() {
        return Err("Mod directory does not exist".to_string());
    }

    let dest_path = mod_dir.join("thumbnail.png");

    if !base64.is_empty() {
        // The frontend now sends clean base64, no need to trim
        let decoded = general_purpose::STANDARD
            .decode(&base64)
            .map_err(|e| e.to_string())?;
        fs::write(&dest_path, decoded).map_err(|e| e.to_string())?;
    } else if !thumbnail_path.is_empty() {
        if src_path.exists() && src_path.is_file() {
            fs::copy(&src_path, &dest_path).map_err(|e| e.to_string())?;
        } else {
            return Err("Thumbnail path does not exist".to_string() + src_path.to_str().unwrap());
        }
    } else {
        return Err("No thumbnail provided".to_string());
    }

    Ok(())
}
#[command]
fn set_mod_info(mod_data: Mod) -> Result<Mod, String> {
    let mod_dir = Path::new(&mod_data.path);

    if !mod_dir.exists() || !mod_dir.is_dir() {
        return Err("Mod directory does not exist".to_string());
    }

    let details = ModJson {
        id: mod_data.id.clone(),
        author: mod_data.author.clone(),
        version: mod_data.version.clone(),
        description: mod_data.description.clone(),
        category: mod_data.category.clone(),
        url: mod_data.url.clone(),
    };

    let details_path = mod_dir.join("mod.json");
    let json = serde_json::to_string_pretty(&details).map_err(|e| e.to_string())?;
    std::fs::write(details_path, json).map_err(|e| e.to_string())?;

    let current_name = match mod_dir.file_name().and_then(|n| n.to_str()) {
        Some(name) => name,
        None => return Err("Invalid mod directory name".to_string()),
    };

    // Use the new name from mod_data, with "disabled " prefix if needed
    let mut new_name = mod_data.name.clone();
    if !mod_data.enabled {
        if !new_name.starts_with("disabled ") {
            new_name = format!("disabled {}", new_name);
        }
    }

    let mut new_mod_dir = mod_dir.to_path_buf();

    if current_name != new_name {
        if let Some(parent) = mod_dir.parent() {
            let new_path = parent.join(&new_name);
            std::fs::rename(mod_dir, &new_path).map_err(|e| e.to_string())?;
            new_mod_dir = new_path;
        }
    }

    // Rebuild the Mod struct to return the updated info
    let thumbnail_path = new_mod_dir.join("thumbnail.png");
    let thumbnail = if thumbnail_path.exists() {
        thumbnail_path.to_string_lossy().to_string()
    } else {
        String::new()
    };

    let mod_json_path = new_mod_dir.join("mod.json");
    let details = if mod_json_path.exists() {
        match std::fs::read_to_string(&mod_json_path) {
            Ok(contents) => serde_json::from_str::<ModJson>(&contents).unwrap_or_default(),
            Err(_) => ModJson::default(),
        }
    } else {
        ModJson::default()
    };

    let id = new_mod_dir
        .file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("")
        .to_string();

    Ok(Mod {
        id,
        name: mod_data.name,
        path: new_mod_dir.to_string_lossy().to_string(),
        author: details.author,
        description: details.description,
        version: details.version,
        category: details.category,
        url: details.url,
        thumbnail,
        enabled: mod_data.enabled,
    })
}

#[command]
async fn download_mod(url: String, to: String, window: tauri::Window) -> Result<(), String> {
    const TIMEOUT_SECS: u64 = 120; // 2 minutes
    const MAX_SIZE: usize = 100 * 1024 * 1024; // 100 MB

    let client = Client::builder()
        .timeout(std::time::Duration::from_secs(TIMEOUT_SECS))
        .build()
        .map_err(|e| format!("HTTP client error: {e}"))?;

    let response = client
        .get(&url)
        .header("Accept-Encoding", "identity")
        .send()
        .await
        .map_err(|e| format!("Request failed: {e}"))?;

    if !response.status().is_success() {
        let status = response.status();
        let body = response.text().await.unwrap_or_default();
        return Err(format!(
            "HTTP {}: {}\nBody: {}",
            status,
            status.canonical_reason().unwrap_or(""),
            body
        ));
    }

    // Try to get filename from Content-Disposition header
    let filename = response
        .headers()
        .get("content-disposition")
        .and_then(|h| h.to_str().ok())
        .and_then(|content| {
            content
                .split(';')
                .find(|part| part.trim().starts_with("filename="))
                .map(|filename| {
                    filename
                        .trim()
                        .trim_start_matches("filename=")
                        .trim_matches('"')
                        .to_string()
                })
        })
        // If no Content-Disposition, try the final URL (after redirects)
        .unwrap_or_else(|| {
            response
                .url()
                .path_segments()
                .and_then(|segments| segments.last())
                .unwrap_or("")
                .to_string()
        });

    // Get mod name from filename (remove extension)
    let mod_name = if !filename.is_empty() {
        filename.split('.').next().unwrap_or("mod").to_string()
    } else {
        format!("mod_{}", uuid::Uuid::new_v4())
    };

    let total_size = response.content_length().unwrap_or(0);
    if total_size as usize > MAX_SIZE {
        return Err(format!(
            "File too large: {} > {} bytes",
            total_size, MAX_SIZE
        ));
    }

    let mut downloaded: u64 = 0;
    let mut bytes = Vec::new();
    let mut stream = response.bytes_stream();

    while let Some(chunk) = stream.next().await {
        let chunk = chunk.map_err(|e| format!("Error downloading: {e}"))?;
        downloaded += chunk.len() as u64;
        bytes.extend_from_slice(&chunk);

        window
            .emit(
                "download-progress",
                DownloadProgress {
                    downloaded,
                    total: total_size,
                },
            )
            .map_err(|e| format!("Failed to emit progress: {e}"))?;
    }

    // Try to handle as ZIP first
    let mut cursor = Cursor::new(&bytes);
    let mut magic = [0; 4];
    let is_zip = cursor.read_exact(&mut magic).is_ok() && magic == [0x50, 0x4B, 0x03, 0x04];

    if is_zip {
        // Handle ZIP file
        let mut archive =
            ZipArchive::new(Cursor::new(&bytes)).map_err(|e| format!("Failed to open ZIP: {e}"))?;

        let extract_to = PathBuf::from(&to).join(&mod_name);
        fs::create_dir_all(&extract_to).map_err(|e| format!("Failed to create directory: {e}"))?;

        for i in 0..archive.len() {
            let mut file = archive.by_index(i).map_err(|e| e.to_string())?;
            let outpath = extract_to.join(file.name());

            if file.name().ends_with('/') {
                fs::create_dir_all(&outpath).map_err(|e| e.to_string())?;
            } else {
                if let Some(parent) = outpath.parent() {
                    fs::create_dir_all(parent).map_err(|e| e.to_string())?;
                }
                let mut outfile = File::create(&outpath).map_err(|e| e.to_string())?;
                std::io::copy(&mut file, &mut outfile).map_err(|e| e.to_string())?;
            }
        }

        // Write mod.json
        let mod_json_path = extract_to.join("mod.json");
        let mut mod_json: ModJson = if mod_json_path.exists() {
            let content = fs::read_to_string(&mod_json_path).unwrap_or_default();
            serde_json::from_str(&content).unwrap_or_default()
        } else {
            ModJson::default()
        };

        mod_json.url = url.clone();
        if mod_json.id.is_empty() {
            mod_json.id = Uuid::new_v4().to_string();
        }
        let json = serde_json::to_string_pretty(&mod_json).map_err(|e| e.to_string())?;
        fs::write(&mod_json_path, json).map_err(|e| e.to_string())?;
    } else {
        // Handle non-ZIP file
        let mod_dir = PathBuf::from(&to).join(&mod_name);
        fs::create_dir_all(&mod_dir).map_err(|e| format!("Failed to create directory: {e}"))?;

        let file_path = mod_dir.join(&filename);
        fs::write(&file_path, bytes).map_err(|e| format!("Failed to write file: {e}"))?;

        // Create mod.json
        let mod_json = ModJson {
            id: Uuid::new_v4().to_string(),
            url: url.clone(),
            ..Default::default()
        };
        let json = serde_json::to_string_pretty(&mod_json).map_err(|e| e.to_string())?;
        fs::write(mod_dir.join("mod.json"), json).map_err(|e| e.to_string())?;
    }

    Ok(())
}

#[tauri::command]
fn add_mod(path: String, to: String) -> Result<(), String> {
    let mod_dir = Path::new(&path);
    let target_dir = Path::new(&to);

    if !mod_dir.exists() || !mod_dir.is_dir() {
        return Err("Mod directory does not exist".to_string());
    }

    if !target_dir.exists() || !target_dir.is_dir() {
        return Err("Target directory does not exist".to_string());
    }

    let mod_name = mod_dir.file_name().ok_or("Invalid mod directory name")?;
    let new_mod_path = target_dir.join(mod_name);

    if new_mod_path.exists() {
        return Err("Mod already exists in the target directory".to_string());
    }

    // Perform the recursive copy
    copy_dir_recursive(mod_dir, &new_mod_path).map_err(|e| e.to_string())?;

    // Remove the original directory after successful copy
    fs::remove_dir_all(mod_dir).map_err(|e| e.to_string())?;

    Ok(())
}

/// Recursively copies the contents of `src` to `dst`
fn copy_dir_recursive(src: &Path, dst: &Path) -> io::Result<()> {
    if !dst.exists() {
        fs::create_dir_all(dst)?;
    }

    for entry in fs::read_dir(src)? {
        let entry = entry?;
        let src_path = entry.path();
        let dst_path = dst.join(entry.file_name());

        if src_path.is_dir() {
            copy_dir_recursive(&src_path, &dst_path)?;
        } else {
            fs::copy(&src_path, &dst_path)?;
        }
    }

    Ok(())
}

#[command]
fn delete_mod(path: String) -> Result<(), String> {
    let mod_dir = Path::new(&path);

    if !mod_dir.exists() || !mod_dir.is_dir() {
        return Err("Mod directory does not exist".to_string());
    }

    fs::remove_dir_all(mod_dir).map_err(|e| e.to_string())?;

    Ok(())
}

#[command]
fn send_f10() {
    let mut enigo = Enigo::new(&Settings::default()).unwrap();

    enigo.key(Key::F10, Press).unwrap();
    enigo.key(Key::F10, Release).unwrap();
}

#[command]
fn save_preset(path: String, preset_name: String, enabled_mods: Vec<String>) -> Result<(), String> {
    let dir = Path::new(&path);
    let presets_path = dir.join("presets.json");

    // Load existing presets or create new
    let mut presets = if presets_path.exists() {
        let content = fs::read_to_string(&presets_path)
            .map_err(|e| format!("Failed to read presets.json: {}", e))?;
        serde_json::from_str::<Presets>(&content)
            .map_err(|e| format!("Failed to parse presets.json: {}", e))?
    } else {
        Presets::default()
    };

    // Check if a preset with this name already exists
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

    // Add or update the preset
    presets.presets.insert(preset_id, new_preset);

    // Save back to file
    let json = serde_json::to_string_pretty(&presets)
        .map_err(|e| format!("Failed to serialize presets: {}", e))?;
    fs::write(&presets_path, json).map_err(|e| format!("Failed to write presets.json: {}", e))?;

    Ok(())
}

#[command]
fn get_presets(path: String) -> Result<HashMap<String, ModPreset>, String> {
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

#[command]
fn delete_preset(path: String, preset_id: String) -> Result<(), String> {
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

#[command]
fn apply_preset(path: String, preset_id: String) -> Result<(), String> {
    println!("Applying preset {} to path {}", preset_id, path);

    let dir = Path::new(&path);
    let presets_path = dir.join("presets.json");

    // Verify presets file exists
    if !presets_path.exists() {
        return Err(format!("Presets file not found at {:?}", presets_path));
    }

    // Load presets
    let content = fs::read_to_string(&presets_path)
        .map_err(|e| format!("Failed to read presets.json: {}", e))?;

    println!("Loaded presets file content");

    let presets: Presets = serde_json::from_str(&content)
        .map_err(|e| format!("Failed to parse presets.json: {}", e))?;

    // Get the specified preset
    let preset = presets
        .presets
        .get(&preset_id)
        .ok_or_else(|| format!("Preset {} not found in presets file", preset_id))?;

    println!(
        "Found preset '{}' with {} enabled mods",
        preset.name,
        preset.enabled_mods.len()
    );

    // Get all mods in the directory
    let mods = get_folder_mods(path.clone())?;
    println!("Found {} total mods in directory", mods.len());

    // For each mod, enable/disable based on preset
    for mod_entry in mods {
        let mod_path = Path::new(&mod_entry.path);
        println!("Processing mod: {} (ID: {})", mod_entry.name, mod_entry.id);

        // Skip if mod directory doesn't exist
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
                current_name[9..].to_string() // Remove "disabled " prefix
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

                // Check if target path already exists
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

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            get_folder_mods,
            set_mod_thumbnail,
            set_mod_info,
            download_mod,
            delete_mod,
            send_f10,
            add_mod,
            save_preset,
            get_presets,
            delete_preset,
            apply_preset
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

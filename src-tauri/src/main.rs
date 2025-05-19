#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use serde::{Deserialize, Serialize};
use tauri::command;

use std::path::{Path, PathBuf};
use std::fs::{self, File};
use std::io::{Cursor};

use base64::{Engine as _, engine::general_purpose};

use reqwest;
use zip::ZipArchive;

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Mod {
    pub id: String,
    pub name: String,
    pub path: String,
    pub author: String,
    pub description: String,
    pub version: String,
    pub thumbnail: String,
    pub enabled: bool,
}

#[derive(Debug, Serialize, Deserialize, Default)]
struct ModJson {
    name: String,
    author: String,
    version: String,
    description: String,
}
#[command]
fn get_folder_mods(path: String) -> Result<Vec<Mod>, String> {
    let dir = Path::new(&path);

    if !dir.exists() || !dir.is_dir() {
        return Err("Invalid directory path".to_string());
    }

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

        let id = name.clone(); // using folder name as ID

        let thumbnail_path = path.join("thumbnail.png");
        let thumbnail = if thumbnail_path.exists() {
            thumbnail_path.to_string_lossy().to_string()
        } else {
            String::new()
        };

        let details_path = path.join("mod.json");
        let details = if details_path.exists() {
            match std::fs::read_to_string(&details_path) {
                Ok(contents) => serde_json::from_str::<ModJson>(&contents).unwrap_or_default(),
                Err(_) => ModJson::default(),
            }
        } else {
            ModJson::default()
        };

        let name = if !details.name.is_empty() {
            details.name
        } else {
            display_name
        };

        mods.push(Mod {
            id,
            name,
            path: path.to_string_lossy().to_string(),
            author: details.author,
            description: details.description,
            version: details.version,
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
        let decoded = general_purpose::STANDARD.decode(&base64).map_err(|e| e.to_string())?;
        fs::write(&dest_path, decoded).map_err(|e| e.to_string())?;
    } else if !thumbnail_path.is_empty() {
        if src_path.exists() && src_path.is_file() {
            fs::copy(&src_path, &dest_path).map_err(|e| e.to_string())?;
        } else {
            return Err("Thumbnail path does not exist".to_string()+src_path.to_str().unwrap());
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
        name: mod_data.name.clone(),
        author: mod_data.author.clone(),
        version: mod_data.version.clone(),
        description: mod_data.description.clone(),
    };

    let details_path = mod_dir.join("mod.json");
    let json = serde_json::to_string_pretty(&details).map_err(|e| e.to_string())?;
    std::fs::write(details_path, json).map_err(|e| e.to_string())?;

    let current_name = match mod_dir.file_name().and_then(|n| n.to_str()) {
        Some(name) => name,
        None => return Err("Invalid mod directory name".to_string()),
    };

    let desired_name = if mod_data.enabled {
        mod_data.name.clone()
    } else {
        format!("disabled {}", mod_data.name)
    };

    let mut new_mod_dir = mod_dir.to_path_buf();

    if current_name != desired_name {
        if let Some(parent) = mod_dir.parent() {
            let new_path = parent.join(&desired_name);
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

    let name = if !details.name.is_empty() {
        details.name
    } else {
        desired_name
    };

    let id = new_mod_dir
        .file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("")
        .to_string();

    Ok(Mod {
        id,
        name,
        path: new_mod_dir.to_string_lossy().to_string(),
        author: details.author,
        description: details.description,
        version: details.version,
        thumbnail,
        enabled: mod_data.enabled,
    })
}

#[command]
async fn download_mod(url: String, to: String) -> Result<(), String> {
     // 1. Download with timeout and size limits
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(30))
        .build()
        .map_err(|e| format!("Failed to create HTTP client: {}", e))?;

    let response = client
        .get(&url)
        .send()
        .await
        .map_err(|e| format!("Failed to download: {}", e))?;

    // 2. Verify response status
    if !response.status().is_success() {
        return Err(format!("HTTP error: {}", response.status()));
    }

    // 3. Read with size limit (e.g., 100MB)
    const MAX_SIZE: usize = 100 * 1024 * 1024;
    let bytes = response
        .bytes()
        .await
        .map_err(|e| format!("Failed to read response: {}", e))?;

    if bytes.len() > MAX_SIZE {
        return Err(format!("File too large ({} > {} bytes)", bytes.len(), MAX_SIZE));
    }

    // 4. Validate ZIP structure before processing
    let cursor = Cursor::new(bytes);
    let mut archive = match ZipArchive::new(cursor) {
        Ok(archive) => archive,
        Err(e) => {
            return Err(format!(
                "Invalid ZIP archive: {}. Possible causes: \
                1) File is corrupted \
                2) Not a ZIP file \
                3) Download was interrupted",
                e
            ))
        }
    };

    // Check if all entries are inside a single root folder
    let has_single_root_folder = {
        let mut root_dirs = std::collections::HashSet::new();
        for i in 0..archive.len() {
            let file = archive.by_index(i).map_err(|e| e.to_string())?;
            let path = PathBuf::from(file.name());
            if let Some(first_component) = path.components().next() {
                root_dirs.insert(first_component.as_os_str().to_owned());
            }
            if root_dirs.len() > 1 {
                break; // Multiple root folders/files → needs wrapping
            }
        }
        root_dirs.len() == 1
    };

    // Determine extraction directory
    let extraction_dir = if has_single_root_folder {
        PathBuf::from(&to)  // Extract directly into 'to'
    } else {
        // Generate a folder name based on contents (e.g., first few file names)
        let mut name_parts = Vec::new();
        for i in 0..std::cmp::min(archive.len(), 3) { // Check up to 3 files
            let file = archive.by_index(i).map_err(|e| e.to_string())?;
            let file_name = Path::new(file.name())
                .file_name()
                .and_then(|n| n.to_str())
                .unwrap_or("");
            if !file_name.is_empty() {
                name_parts.push(file_name.to_string());
            }
        }
        let wrapper_name = if !name_parts.is_empty() {
            format!("mod_{}", name_parts.join("_"))
        } else {
            "extracted_mod".to_string()
        };
        PathBuf::from(&to).join(wrapper_name)
    };

    // Create the extraction directory if needed
    std::fs::create_dir_all(&extraction_dir).map_err(|e| e.to_string())?;

    // Extract files
    for i in 0..archive.len() {
        let mut file = archive.by_index(i).map_err(|e| e.to_string())?;
        let outpath = extraction_dir.join(file.name());

        if file.name().ends_with('/') {
            std::fs::create_dir_all(&outpath).map_err(|e| e.to_string())?;
        } else {
            if let Some(p) = outpath.parent() {
                std::fs::create_dir_all(p).map_err(|e| e.to_string())?;
            }
            let mut outfile = File::create(&outpath).map_err(|e| e.to_string())?;
            std::io::copy(&mut file, &mut outfile).map_err(|e| e.to_string())?;
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

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            get_folder_mods,
            set_mod_thumbnail,
            set_mod_info,
            download_mod,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

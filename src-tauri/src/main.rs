use serde::{Deserialize, Serialize};
use std::path::Path;
use tauri::command;

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
fn set_mod_thumbnail(path: String, thumbnail_path: String) -> Result<(), String> {
    let mod_dir = Path::new(&path);
    let src_path = Path::new(&thumbnail_path);

    if !mod_dir.exists() || !mod_dir.is_dir() {
        return Err("Mod directory does not exist".to_string());
    }

    if !src_path.exists() {
        return Err("Thumbnail file does not exist".to_string());
    }

    let dest_path = mod_dir.join("thumbnail.png");
    std::fs::copy(src_path, dest_path).map_err(|e| e.to_string())?;

    Ok(())
}

#[command]
fn set_mod_info(mod_data: Mod) -> Result<(), String> {
    let mod_dir = Path::new(&mod_data.path);

    if !mod_dir.exists() || !mod_dir.is_dir() {
        return Err("Mod directory does not exist".to_string());
    }

    let details = ModJson {
        name: mod_data.name.clone(),
        author: mod_data.author,
        version: mod_data.version,
        description: mod_data.description,
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

    if current_name != desired_name {
        if let Some(parent) = mod_dir.parent() {
            let new_path = parent.join(&desired_name);
            std::fs::rename(mod_dir, new_path).map_err(|e| e.to_string())?;
        }
    }

    Ok(())
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            get_folder_mods,
            set_mod_thumbnail,
            set_mod_info
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

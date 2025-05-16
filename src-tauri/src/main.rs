use std::path::Path;
use tauri::command;

#[derive(serde::Serialize)]
struct FolderInfo {
    name: String,
    path: String,
    is_directory: bool,
}

#[command]
fn get_parent_directory(path: String) -> Option<String> {
    let path = Path::new(&path);
    path.parent().map(|p| p.to_string_lossy().to_string())
}

#[command]
fn get_folder_contents(path: String) -> Result<Vec<FolderInfo>, String> {
    let dir = Path::new(&path);

    if !dir.exists() {
        return Err("Directory does not exist".into());
    }

    if !dir.is_dir() {
        return Err("Path is not a directory".into());
    }

    let mut folders = Vec::new();

    match std::fs::read_dir(dir) {
        Ok(entries) => {
            for entry in entries {
                if let Ok(entry) = entry {
                    let path = entry.path();
                    if let Some(name) = path.file_name().and_then(|n| n.to_str()) {
                        folders.push(FolderInfo {
                            name: name.to_string(),
                            path: path.to_string_lossy().to_string(),
                            is_directory: path.is_dir(),
                        });
                    }
                }
            }
            Ok(folders)
        }
        Err(e) => Err(e.to_string()),
    }
}
#[command]
fn set_mod_state(path: String, enabled: bool) -> Result<(), String> {
    let mod_path = Path::new(&path);
    if !mod_path.exists() {
        return Err("Mod path does not exist".into());
    }

    if let Some(file_name) = mod_path.file_name() {
        let file_name_str = file_name.to_string_lossy();

        if enabled {
            if let Some(stripped) = file_name_str.strip_prefix("disabled ") {
                let new_path = mod_path.with_file_name(stripped);
                std::fs::rename(mod_path, new_path).map_err(|e| e.to_string())?;
            }
        } else if !file_name_str.starts_with("disabled ") {
            let new_path = mod_path.with_file_name(format!("disabled {}", file_name_str));
            std::fs::rename(mod_path, new_path).map_err(|e| e.to_string())?;
        }
    }

    Ok(())
}
fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            get_folder_contents,
            get_parent_directory,
            set_mod_state,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

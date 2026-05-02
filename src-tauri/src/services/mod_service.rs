use serde::{Deserialize, Serialize};
use std::fs::{self, File};
use std::io::{self, Read};
use std::process::Command;
use std::path::{Path, PathBuf};

use base64::{engine::general_purpose, Engine as _};
use futures_util::StreamExt;
use tauri::Emitter;
use regex::Regex;
use reqwest::Client;
use uuid::Uuid;
use zip::ZipArchive;
use tokio::fs::File as TokioFile;
use tokio::io::AsyncWriteExt;

use crate::services::category::{find_matching_category, load_character_categories, Category};
use crate::services::character::scrape_characters;

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
pub struct ModJson {
    pub id: String,
    pub author: String,
    pub description: String,
    pub version: String,
    pub category: String,
    pub url: String,
}

#[derive(Debug, Serialize, Clone)]
pub struct DownloadProgress {
    pub downloaded: u64,
    pub total: u64,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum ArchiveFormat {
    Zip,
    SevenZip,
    Rar,
}

fn sanitize_dir_name(name: &str) -> String {
    let cleaned = name
        .trim()
        .chars()
        .map(|ch| match ch {
            '/' | '\\' | '\0' => '_',
            _ => ch,
        })
        .collect::<String>();

    if cleaned.is_empty() {
        format!("mod_{}", Uuid::new_v4())
    } else {
        cleaned
    }
}

fn create_unique_mod_dir(root: &Path, suggested_name: &str) -> Result<PathBuf, String> {
    let base_name = sanitize_dir_name(suggested_name);
    let mut candidate = root.join(&base_name);
    let mut suffix = 1;

    while candidate.exists() {
        candidate = root.join(format!("{}-{}", base_name, suffix));
        suffix += 1;
    }

    fs::create_dir_all(&candidate).map_err(|e| format!("Failed to create mod directory: {e}"))?;
    Ok(candidate)
}

fn detect_archive_format(path: &Path) -> Result<Option<ArchiveFormat>, String> {
    let mut file = File::open(path).map_err(|e| format!("Failed to open file: {e}"))?;
    let mut magic = [0u8; 8];
    let n = file.read(&mut magic).map_err(|e| format!("Failed to inspect file: {e}"))?;

    if n >= 4 && magic[0..4] == [0x50, 0x4B, 0x03, 0x04] {
        Ok(Some(ArchiveFormat::Zip))
    } else if n >= 6 && magic[0..6] == [0x37, 0x7A, 0xBC, 0xAF, 0x27, 0x1C] {
        Ok(Some(ArchiveFormat::SevenZip))
    } else if (n >= 7 && magic[0..7] == [0x52, 0x61, 0x72, 0x21, 0x1A, 0x07, 0x00])
        || (n >= 8 && magic[0..8] == [0x52, 0x61, 0x72, 0x21, 0x1A, 0x07, 0x01, 0x00])
    {
        Ok(Some(ArchiveFormat::Rar))
    } else {
        Ok(None)
    }
}

fn write_mod_metadata(mod_dir: &Path, url: Option<&str>) -> Result<(), String> {
    let mod_json_path = mod_dir.join("mod.json");
    let mut mod_json: ModJson = if mod_json_path.exists() {
        let content = fs::read_to_string(&mod_json_path).unwrap_or_default();
        serde_json::from_str(&content).unwrap_or_default()
    } else {
        ModJson::default()
    };

    if let Some(url) = url {
        mod_json.url = url.to_string();
    }
    if mod_json.id.is_empty() {
        mod_json.id = Uuid::new_v4().to_string();
    }

    let json = serde_json::to_string_pretty(&mod_json).map_err(|e| e.to_string())?;
    fs::write(&mod_json_path, json).map_err(|e| e.to_string())?;

    Ok(())
}

fn extract_zip_archive(archive_path: &Path, mod_dir: &Path) -> Result<(), String> {
    let cursor = File::open(archive_path)
        .map_err(|e| format!("Failed to open archive file: {e}"))?;

    let mut archive = ZipArchive::new(cursor).map_err(|e| format!("Failed to open ZIP: {e}"))?;

    for i in 0..archive.len() {
        let mut file = archive.by_index(i).map_err(|e| e.to_string())?;

        let Some(relative_path) = file.enclosed_name().map(|path| path.to_owned()) else {
            return Err("ZIP archive contains an unsafe path".to_string());
        };

        let outpath = mod_dir.join(relative_path);

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

    Ok(())
}

fn extract_archive_to_dir(
    archive_path: &Path,
    mod_dir: &Path,
    url: Option<&str>,
) -> Result<(), String> {
    match detect_archive_format(archive_path)? {
        Some(ArchiveFormat::Zip) => extract_zip_archive(archive_path, mod_dir)?,
        Some(ArchiveFormat::SevenZip) | Some(ArchiveFormat::Rar) => {
            let output = Command::new("7z")
                .arg("x")
                .arg("-y")
                .arg(format!("-o{}", mod_dir.display()))
                .arg(archive_path.to_string_lossy().to_string())
                .output()
                .map_err(|e| format!("Failed to execute 7z: {e}"))?;

            if !output.status.success() {
                return Err(format!(
                    "7z extraction failed: {}",
                    String::from_utf8_lossy(&output.stderr)
                ));
            }
        }
        None => return Err("Unsupported compressed mod format".to_string()),
    }

    write_mod_metadata(mod_dir, url)?;
    let _ = fs::remove_file(archive_path);

    Ok(())
}

#[tauri::command]
pub async fn get_folder_mods(path: String) -> Result<Vec<Mod>, String> {
    let dir = Path::new(&path);

    if !dir.exists() || !dir.is_dir() {
        return Err("Invalid directory path".to_string());
    }

    // Prefer the live character list; fall back to the bundled list if scraping fails.
    let categories = load_auto_match_categories().await;

    // Regex to extract version from folder name (e.g., "mod_v1.0")
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

#[tauri::command]
pub fn set_mod_thumbnail(path: String, thumbnail_path: String, base64: String) -> Result<(), String> {
    let mod_dir = Path::new(&path);
    let src_path = Path::new(&thumbnail_path);

    if !mod_dir.exists() || !mod_dir.is_dir() {
        return Err("Mod directory does not exist".to_string());
    }

    let dest_path = mod_dir.join("thumbnail.png");

    if !base64.is_empty() {
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

#[tauri::command]
pub fn read_image_file(path: String) -> Result<String, String> {
    let bytes = fs::read(&path).map_err(|e| format!("Failed to read image file: {e}"))?;
    Ok(general_purpose::STANDARD.encode(bytes))
}

#[tauri::command]
pub fn set_mod_info(mod_data: Mod) -> Result<Mod, String> {
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

#[tauri::command]
pub async fn download_mod(url: String, to: String, window: tauri::Window) -> Result<(), String> {
    const TIMEOUT_SECS: u64 = 120;
    const MAX_SIZE: usize = 1024 * 1024 * 1024; // 1 GB

    let client = Client::builder()
        .timeout(std::time::Duration::from_secs(TIMEOUT_SECS))
        .no_gzip()
        .no_brotli()
        .no_deflate()
        .no_zstd()
        .build()
        .map_err(|e| format!("HTTP client error: {e}"))?;

    let response = client
        .get(&url)
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
        .unwrap_or_else(|| {
            response
                .url()
                .path_segments()
                .and_then(|segments| segments.last())
                .unwrap_or("")
                .to_string()
        });

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

    let mod_dir = PathBuf::from(&to).join(&mod_name);
    fs::create_dir_all(&mod_dir).map_err(|e| format!("Failed to create directory: {e}"))?;

    let temp_path = mod_dir.join(format!(".{mod_name}.download"));
    let mut output = TokioFile::create(&temp_path)
        .await
        .map_err(|e| format!("Failed to create download file: {e}"))?;

    let mut downloaded: u64 = 0;
    let mut stream = response.bytes_stream();

    while let Some(chunk) = stream.next().await {
        let chunk = chunk.map_err(|e| format!("Error downloading: {e}"))?;
        downloaded += chunk.len() as u64;
        output
            .write_all(&chunk)
            .await
            .map_err(|e| format!("Failed to write download chunk: {e}"))?;

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

    output
        .flush()
        .await
        .map_err(|e| format!("Failed to finalize download file: {e}"))?;

    match detect_archive_format(&temp_path)? {
        Some(_) => {
            if let Err(error) = extract_archive_to_dir(&temp_path, &mod_dir, Some(&url)) {
                let _ = fs::remove_file(&temp_path);
                return Err(error);
            }
        }
        None => {
            let file_path = mod_dir.join(&filename);
            fs::rename(&temp_path, &file_path)
                .map_err(|e| format!("Failed to move downloaded file into place: {e}"))?;

            let mod_json = ModJson {
                id: Uuid::new_v4().to_string(),
                url: url.clone(),
                ..Default::default()
            };
            let json = serde_json::to_string_pretty(&mod_json).map_err(|e| e.to_string())?;
            fs::write(mod_dir.join("mod.json"), json).map_err(|e| e.to_string())?;
        }
    }

    Ok(())
}

#[tauri::command]
pub fn add_mod(path: String, to: String) -> Result<(), String> {
    let mod_source = Path::new(&path);
    let target_dir = Path::new(&to);

    if !target_dir.exists() || !target_dir.is_dir() {
        return Err("Target directory does not exist".to_string());
    }

    if mod_source.exists() && mod_source.is_dir() {
        let mod_name = mod_source.file_name().ok_or("Invalid mod directory name")?;
        let new_mod_path = target_dir.join(mod_name);

        if new_mod_path.exists() {
            return Err("Mod already exists in the target directory".to_string());
        }

        copy_dir_recursive(mod_source, &new_mod_path).map_err(|e| e.to_string())?;
        fs::remove_dir_all(mod_source).map_err(|e| e.to_string())?;
    } else if mod_source.exists() && mod_source.is_file() {
        let mod_name = mod_source
            .file_stem()
            .and_then(|stem| stem.to_str())
            .unwrap_or("mod");
        let new_mod_path = create_unique_mod_dir(target_dir, mod_name)?;

        extract_archive_to_dir(mod_source, &new_mod_path, None)?;
    } else {
        return Err("Mod source does not exist".to_string());
    }

    Ok(())
}

#[tauri::command]
pub fn delete_mod(path: String) -> Result<(), String> {
    let mod_dir = Path::new(&path);

    if !mod_dir.exists() || !mod_dir.is_dir() {
        return Err("Mod directory does not exist".to_string());
    }

    fs::remove_dir_all(mod_dir).map_err(|e| e.to_string())?;

    Ok(())
}

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

async fn load_auto_match_categories() -> Vec<Category> {
    match scrape_characters().await {
        Ok(characters) if !characters.is_empty() => {
            println!(
                "[mods] Loaded {} scraped characters for auto-category matching",
                characters.len()
            );

            characters
                .into_iter()
                .map(|character| Category {
                    name: character.name,
                    icon: character.thumbnail,
                })
                .collect()
        }
        Ok(_) => {
            eprintln!(
                "[mods] Scraper returned no characters, using local fallback list"
            );
            load_character_categories()
        }
        Err(error) => {
            eprintln!(
                "[mods] Failed to load scraped characters, using local fallback list: {}",
                error
            );
            load_character_categories()
        }
    }
}

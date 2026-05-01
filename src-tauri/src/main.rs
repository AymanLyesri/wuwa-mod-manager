#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod services;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            // Mod commands
            services::mod_service::get_folder_mods,
            services::mod_service::set_mod_thumbnail,
            services::mod_service::set_mod_info,
            services::mod_service::download_mod,
            services::mod_service::delete_mod,
            services::mod_service::add_mod,
            // Character commands
            services::character::scrape_characters,
            // Game commands
            services::game::send_f10,
            // Preset commands
            services::preset::save_preset,
            services::preset::get_presets,
            services::preset::delete_preset,
            services::preset::apply_preset,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

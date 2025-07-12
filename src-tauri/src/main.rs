
// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;
use std::fs;
use std::path::PathBuf;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn get_app_settings(app: tauri::AppHandle) -> Result<serde_json::Value, String> {
    let path_resolver = app.path_resolver();
    let settings_path = path_resolver.app_data_dir().unwrap().join("settings.json");
    if settings_path.exists() {
        let data = fs::read_to_string(settings_path).map_err(|e| e.to_string())?;
        serde_json::from_str(&data).map_err(|e| e.to_string())
    } else {
        Ok(serde_json::Value::Null)
    }
}

#[tauri::command]
fn save_app_settings(app: tauri::AppHandle, settings: serde_json::Value) -> Result<(), String> {
    let path_resolver = app.path_resolver();
    let app_data_dir = path_resolver.app_data_dir().unwrap();
    fs::create_dir_all(&app_data_dir).map_err(|e| e.to_string())?;
    let settings_path = app_data_dir.join("settings.json");
    let data = serde_json::to_string_pretty(&settings).map_err(|e| e.to_string())?;
    fs::write(settings_path, data).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn get_database(app: tauri::AppHandle) -> Result<serde_json::Value, String> {
    let path_resolver = app.path_resolver();
    let db_path = path_resolver.app_data_dir().unwrap().join("database.json");
    if db_path.exists() {
        let data = fs::read_to_string(db_path).map_err(|e| e.to_string())?;
        serde_json::from_str(&data).map_err(|e| e.to_string())
    } else {
        Ok(serde_json::Value::Null)
    }
}

#[tauri::command]
fn save_database(app: tauri::AppHandle, data: serde_json::Value) -> Result<(), String> {
    let path_resolver = app.path_resolver();
    let app_data_dir = path_resolver.app_data_dir().unwrap();
    fs::create_dir_all(&app_data_dir).map_err(|e| e.to_string())?;
    let db_path = app_data_dir.join("database.json");
    let data_str = serde_json::to_string_pretty(&data).map_err(|e| e.to_string())?;
    fs::write(db_path, data_str).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
async fn save_backup(app: tauri::AppHandle, data: String) -> Result<String, String> {
    let dialog = tauri::api::dialog::FileDialogBuilder::new()
        .set_title("Simpan Backup Data")
        .set_file_name(&format!("ziyyanmart_backup_{}.json", chrono::Local::now().format("%Y-%m-%d")));
        
    let file_path: Option<PathBuf> = dialog.save_file().await;

    if let Some(path) = file_path {
        fs::write(&path, data).map_err(|e| e.to_string())?;
        Ok(path.to_string_lossy().to_string())
    } else {
        Err("Proses penyimpanan backup dibatalkan.".into())
    }
}


fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            get_app_settings, 
            save_app_settings,
            get_database,
            save_database,
            save_backup
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

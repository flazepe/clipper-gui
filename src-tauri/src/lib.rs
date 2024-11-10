use clipper::Clipper;
use tauri::{command, generate_context, Builder, Error};

#[command]
fn run_clipper(clipper: Clipper) -> Result<Vec<String>, Error> {
    clipper.try_into_vec().map_err(Error::Anyhow)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    Builder::default()
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![run_clipper])
        .run(generate_context!())
        .expect("error while running tauri application");
}

use clipper::Clipper;
use tauri::{Builder, Error, command, generate_context, generate_handler};

#[command]
fn run_clipper(clipper: Clipper) -> Result<Vec<String>, Error> {
    clipper.try_into_vec().map_err(Error::Anyhow)
}

pub fn run() {
    Builder::default()
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(generate_handler![run_clipper])
        .run(generate_context!())
        .expect("error while running tauri application")
}

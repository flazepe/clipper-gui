use clipper::Clipper;
use tauri::{command, generate_context, Builder};

#[command]
fn run_clipper(clipper: Clipper) -> Vec<String> {
    clipper.into_iter().collect()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![run_clipper])
        .run(generate_context!())
        .expect("error while running tauri application");
}

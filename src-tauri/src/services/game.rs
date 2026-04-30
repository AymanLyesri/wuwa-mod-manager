use enigo::{
    Direction::{Press, Release},
    Enigo, Key, Keyboard, Settings,
};

#[tauri::command]
pub fn send_f10() {
    let mut enigo = Enigo::new(&Settings::default()).unwrap();

    enigo.key(Key::F10, Press).unwrap();
    enigo.key(Key::F10, Release).unwrap();
}

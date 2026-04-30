use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Categories {
    pub categories: Vec<Category>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Category {
    pub name: String,
    pub icon: String,
}

pub fn load_categories() -> Vec<Category> {
    let categories_json = include_str!("../../../src/assets/categories.json");
    match serde_json::from_str::<Categories>(categories_json) {
        Ok(categories) => categories.categories,
        Err(e) => {
            eprintln!("Error loading categories: {}", e);
            Vec::new()
        }
    }
}

pub fn find_matching_category(name: &str, categories: &[Category]) -> Option<String> {
    let name_lower = name.to_lowercase();
    for category in categories {
        let category_name = category.name.replace("\\", "").to_lowercase();
        if name_lower.contains(&category_name) {
            return Some(category.name.clone());
        }
    }
    None
}

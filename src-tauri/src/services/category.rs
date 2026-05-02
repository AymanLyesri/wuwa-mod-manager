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

pub fn load_character_categories() -> Vec<Category> {
    load_categories()
        .into_iter()
        .filter(|category| category.name != "*Uncategorized")
    .filter(|category| !category.name.starts_with('\\'))
        .collect()
}

fn normalize_for_match(value: &str) -> String {
    value
        .chars()
        .filter(|character| character.is_ascii_alphanumeric())
        .flat_map(|character| character.to_lowercase())
        .collect()
}

pub fn find_matching_category(name: &str, categories: &[Category]) -> Option<String> {
    let normalized_name = normalize_for_match(name);

    categories
        .iter()
        .filter_map(|category| {
            let category_name = category.name.trim_start_matches('\\');
            let normalized_category_name = normalize_for_match(category_name);

            if normalized_category_name.is_empty() || normalized_name.contains(&normalized_category_name)
            {
                Some((normalized_category_name.len(), category.name.clone()))
            } else {
                None
            }
        })
        .max_by_key(|(length, _)| *length)
        .map(|(_, category_name)| category_name)
}

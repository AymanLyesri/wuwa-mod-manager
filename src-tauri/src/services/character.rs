use reqwest::{Client, Url};
use scraper::{Html, Selector};
use serde::{Deserialize, Serialize};
use std::collections::HashSet;

const CHARACTERS_URL: &str = "https://wuwa.akademiya.app/en/characters";
const BASE_URL: &str = "https://wuwa.akademiya.app";

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CharacterScrape {
    pub name: String,
    pub thumbnail: String,
}

#[tauri::command]
pub async fn scrape_characters() -> Result<Vec<CharacterScrape>, String> {
    println!("[character-scraper] Fetching characters from {CHARACTERS_URL}");

    let client = Client::builder()
        .timeout(std::time::Duration::from_secs(30))
        .user_agent("wuwa-mod-manager/0.1.0")
        .build()
        .map_err(|e| format!("HTTP client error: {e}"))?;

    let response = client
        .get(CHARACTERS_URL)
        .send()
        .await
        .map_err(|e| format!("Request failed: {e}"))?
        .error_for_status()
        .map_err(|e| format!("Request failed: {e}"))?;

    let html = response
        .text()
        .await
        .map_err(|e| format!("Failed to read response: {e}"))?;

    println!("[character-scraper] HTML downloaded, starting parse");

    let characters = parse_characters(&html)?;

    if characters.is_empty() {
        eprintln!("[character-scraper] Parse finished but no characters were found");
        return Err("No characters found in scraped HTML".to_string());
    }

    println!(
        "[character-scraper] Parsed {} characters successfully",
        characters.len()
    );

    Ok(characters)
}

fn parse_characters(html: &str) -> Result<Vec<CharacterScrape>, String> {
    let document = Html::parse_document(html);

    let card_selector = Selector::parse(r#"main a[href^="/en/characters/"], main div.group, div.group"#)
        .map_err(|e| format!("Selector error: {e}"))?;

    let name_selector = Selector::parse("div.neutral-text")
        .map_err(|e| format!("Selector error: {e}"))?;

    let image_selector = Selector::parse("div.overflow-hidden img, img")
        .map_err(|e| format!("Selector error: {e}"))?;

    let mut characters = Vec::new();
    let mut seen = HashSet::new();

    for card in document.select(&card_selector) {
        let name = card
            .select(&name_selector)
            .next()
            .map(|element| element.text().collect::<String>().trim().to_string())
            .filter(|name| !name.is_empty());

        let thumbnail = extract_thumbnail_from_card(&card, &image_selector);

        if let (Some(name), Some(thumbnail)) = (name, thumbnail) {
            let dedupe_key = format!("{}|{}", name.to_lowercase(), thumbnail);
            if seen.insert(dedupe_key) {
                characters.push(CharacterScrape { name, thumbnail });
            }
        }
    }

    Ok(characters)
}

fn extract_thumbnail_from_card(
    card: &scraper::ElementRef<'_>,
    image_selector: &Selector,
) -> Option<String> {
    let mut fallback: Option<String> = None;

    for image in card.select(image_selector) {
        let class_attr = image.value().attr("class").unwrap_or_default();

        let src = image
            .value()
            .attr("src")
            .or_else(|| {
                image
                    .value()
                    .attr("srcset")
                    .and_then(first_src_from_srcset)
            })
            .and_then(normalize_thumbnail_url);

        if let Some(src) = src {
            if class_attr.contains("object-cover") {
                return Some(src);
            }

            if fallback.is_none() {
                fallback = Some(src);
            }
        }
    }

    fallback
}

fn first_src_from_srcset(srcset: &str) -> Option<&str> {
    srcset
        .split(',')
        .next()
        .and_then(|entry| entry.split_whitespace().next())
}

fn normalize_thumbnail_url(src: &str) -> Option<String> {
    let src = src.trim();

    if src.is_empty() {
        return None;
    }

    let normalized = if src.starts_with("http://") || src.starts_with("https://") {
        src.to_string()
    } else if src.starts_with('/') {
        format!("{BASE_URL}{src}")
    } else {
        format!("{BASE_URL}/{src}")
    };

    if let Ok(url) = Url::parse(&normalized) {
        if url.path().starts_with("/_next/image") {
            if let Some((_, original_url)) = url.query_pairs().find(|(key, _)| key == "url") {
                let decoded = original_url.to_string();
                if decoded != normalized {
                    return normalize_thumbnail_url(&decoded);
                }
            }
        }
    }

    Some(normalized)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_character_name_and_decoded_thumbnail_from_card_html() {
        let html = r#"
        <div class="rounded-md bg-card border hover:scale-105 transition duration-200 w-40 3xl:w-48 hover:ring-3 ring-white/70 group">
          <div class="rounded-t-md relative">
            <div class="overflow-hidden h-52 from-rarity-five-dark/60 bg-gradient-to-t">
              <img
                alt="Zhezhi icon"
                class="object-cover scale-[130%]"
                src="https://wuwa.akademiya.app/_next/image?url=https%3A%2F%2Fstatic.nanoka.cc%2Fassets%2Fww%2FUIResources%2FCommon%2FImage%2FIconRolePile%2FT_IconRole_Pile_zhezhi_UI.webp&w=640&q=75"
              />
            </div>
            <div class="neutral-text h-12 flex items-center justify-center font-bold text-center bg-sidebar-primary-foreground py-1 rounded-b-md">
              Zhezhi
            </div>
          </div>
        </div>
        "#;

        let parsed = parse_characters(html).expect("parse should succeed");

        assert_eq!(parsed.len(), 1);
        assert_eq!(parsed[0].name, "Zhezhi");
        assert_eq!(
            parsed[0].thumbnail,
            "https://static.nanoka.cc/assets/ww/UIResources/Common/Image/IconRolePile/T_IconRole_Pile_zhezhi_UI.webp"
        );
    }

    #[test]
    fn picks_first_src_from_srcset_when_src_is_missing() {
        let srcset = "https://static.nanoka.cc/img-1.webp 1x, https://static.nanoka.cc/img-2.webp 2x";
        assert_eq!(
            first_src_from_srcset(srcset),
            Some("https://static.nanoka.cc/img-1.webp")
        );
    }
}
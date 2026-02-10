import { supabase } from "./supabase";
import { translations } from "../i18n/translations";

/**
 * Fetch bar menu items from Supabase, grouped by category.
 * Falls back to translations.js if Supabase is unavailable.
 *
 * @param {string} lang - "es" or "en"
 * @returns {Promise<{ items: string[], molletesItems: string[] }>}
 */
export async function getBarMenuItems(lang = "es") {
  const fallback = translations[lang] || translations.es;

  try {
    const { data, error } = await supabase
      .from("bar_menu_items")
      .select("name_es, name_en, category, sort_order")
      .eq("active", true)
      .order("sort_order", { ascending: true });

    if (error || !data || data.length === 0) {
      return {
        items: fallback.barMenu.items,
        molletesItems: fallback.barMenu.molletesItems,
      };
    }

    const nameKey = lang === "en" ? "name_en" : "name_es";

    return {
      items: data
        .filter((row) => row.category === "main")
        .map((row) => row[nameKey]),
      molletesItems: data
        .filter((row) => row.category === "molletes")
        .map((row) => row[nameKey]),
    };
  } catch {
    return {
      items: fallback.barMenu.items,
      molletesItems: fallback.barMenu.molletesItems,
    };
  }
}

/**
 * Fetch table menu sections + items from Supabase.
 * Falls back to translations.js if Supabase is unavailable.
 *
 * @param {string} lang - "es" or "en"
 * @returns {Promise<{ title: string, items: string[] }[]>}
 */
export async function getTableMenuSections(lang = "es") {
  const fallback = translations[lang] || translations.es;

  try {
    const { data: sections, error: secError } = await supabase
      .from("table_menu_sections")
      .select("id, title_es, title_en, sort_order")
      .eq("active", true)
      .order("sort_order", { ascending: true });

    if (secError || !sections || sections.length === 0) {
      return fallback.tableMenu.sections;
    }

    const { data: items, error: itemError } = await supabase
      .from("table_menu_items")
      .select("section_id, name_es, name_en, sort_order")
      .eq("active", true)
      .order("sort_order", { ascending: true });

    if (itemError || !items) {
      return fallback.tableMenu.sections;
    }

    const titleKey = lang === "en" ? "title_en" : "title_es";
    const nameKey = lang === "en" ? "name_en" : "name_es";

    return sections.map((section) => ({
      title: section[titleKey],
      items: items
        .filter((item) => item.section_id === section.id)
        .map((item) => item[nameKey]),
    }));
  } catch {
    return fallback.tableMenu.sections;
  }
}

/**
 * Fetch schedule lines from Supabase.
 * Falls back to translations.js if Supabase is unavailable.
 *
 * @param {string} lang - "es" or "en"
 * @returns {Promise<string[]>}
 */
export async function getSchedule(lang = "es") {
  const fallback = translations[lang] || translations.es;

  try {
    const { data, error } = await supabase
      .from("schedule")
      .select("text_es, text_en, sort_order")
      .eq("active", true)
      .order("sort_order", { ascending: true });

    if (error || !data || data.length === 0) {
      return fallback.footer.scheduleItems;
    }

    const textKey = lang === "en" ? "text_en" : "text_es";
    return data.map((row) => row[textKey]);
  } catch {
    return fallback.footer.scheduleItems;
  }
}

// ─── Site Data Types & Defaults ─────────────────────────────────────────────
// This module defines the shape of all editable site content and provides
// localStorage persistence helpers. The default values mirror the original
// hard-coded content so the site works identically out of the box.

import logoAsset from "@/assets/ama-alufa-logo.png";
import heroTable from "@/assets/dish-stuffed.jpg";
import dishStew from "@/assets/dish-stew.jpg";
import dishStuffed from "@/assets/dish-stuffed.jpg";
import dishSoup from "@/assets/dish-soup.jpg";
import dishSides from "@/assets/dish-sides.jpg";
import dishCake from "@/assets/dish-cake.jpg";
import galleryCouscous from "@/assets/gallery-couscous.png";
import gallerySpringRolls from "@/assets/gallery-spring-rolls.png";

/* ─── Types ─── */

export interface Dish {
  id: string;
  name: string;
  note: string;
  /** Built-in asset key OR external URL */
  img: string;
}

export interface OpeningHoursEntry {
  id: string;
  label: string; // e.g. "ראשון–חמישי"
  hours: string; // e.g. "8:30–19:00" or "סגור"
}

export interface GalleryItem {
  id: string;
  /** Built-in asset key OR external URL */
  img: string;
  alt: string;
  caption: string;
}

export interface SiteTexts {
  heroKashrut: string;
  heroTitle: string;
  heroSubtitle: string;
  heroCta1: string;
  heroCta2: string;
  aboutKicker: string;
  aboutTitle: string;
  aboutP1: string;
  aboutP2: string;
  kashrut: string;
  kashrutDetail: string;
  menuKicker: string;
  menuTitle: string;
  menuNote: string;
  menuGalleryLink: string;
  galleryKicker: string;
  galleryTitle: string;
  locationKicker: string;
  locationTitle: string;
  locationAddress: string;
  locationArea: string;
  deliveryNote: string;
  ctaTitle: string;
  ctaSubtitle: string;
  ctaCta1: string;
  ctaCta2: string;
  footerAddress: string;
  footerArea: string;
  footerKashrut: string;
}

export interface SiteSettings {
  woltUrl: string;
  mapQuery: string;
}

export interface SiteData {
  dishes: Dish[];
  openingHours: OpeningHoursEntry[];
  gallery: GalleryItem[];
  texts: SiteTexts;
  settings: SiteSettings;
}

/* ─── Built-in Asset Registry ─── */
// Maps human-readable keys to imported asset URLs so the admin can reference
// them by name without touching the import graph.

export const BUILTIN_ASSETS: Record<string, string> = {
  "logo": logoAsset,
  "hero-table": heroTable,
  "dish-stew": dishStew,
  "dish-stuffed": dishStuffed,
  "dish-soup": dishSoup,
  "dish-sides": dishSides,
  "dish-cake": dishCake,
  "gallery-couscous": galleryCouscous,
  "gallery-spring-rolls": gallerySpringRolls,
};

/** Resolve an image value: if it's a built-in key, return the asset URL; otherwise treat as external URL */
export function resolveImage(img: string): string {
  return BUILTIN_ASSETS[img] ?? img;
}

/* ─── Unique ID helper ─── */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/* ─── Default Data ─── */

export const DEFAULT_DISHES: Dish[] = [
  { id: "d1", img: "dish-stew", name: "קדרת בשר בתנור", note: "עם תפוחי אדמה ורוטב עשיר" },
  { id: "d2", img: "dish-stuffed", name: "ממולאים של אמא", note: "פלפלים וקישואים במלוא הטעם" },
  { id: "d3", img: "dish-soup", name: "מרק עוף ביתי", note: "כמו ביום שישי בבית" },
  { id: "d4", img: "dish-sides", name: "סלטים ותוספות", note: "טריים, נחתכים כל בוקר" },
  { id: "d5", img: "dish-cake", name: "עוגת תפוחים", note: "אפויה אצלנו, עוד חמה" },
  { id: "d6", img: "hero-table", name: "מגש משפחתי", note: "עיקרית, תוספות ולחם טרי" },
];

export const DEFAULT_OPENING_HOURS: OpeningHoursEntry[] = [
  { id: "h1", label: "ראשון–חמישי", hours: "8:30–19:00" },
  { id: "h2", label: "שישי", hours: "8:00–14:00" },
  { id: "h3", label: "שבת", hours: "סגור" },
];

export const DEFAULT_GALLERY: GalleryItem[] = [
  {
    id: "g1",
    img: "gallery-couscous",
    alt: "קוסקוס ותבשילים חמים במגשי הגשה",
    caption: "מגשי הגשה חמים — קוסקוס, כדורי פלאפל ועוד",
  },
  {
    id: "g2",
    img: "gallery-spring-rolls",
    alt: "אגרולים ומאפים במגשי הגשה",
    caption: "אגרולים פריכים ומאפים טריים מהתנור",
  },
];

export const DEFAULT_TEXTS: SiteTexts = {
  heroKashrut: "כשר בהשגחת הרבנות בנימינה–גבעת עדה",
  heroTitle: "אוכל ביתי כשר בבנימינה",
  heroSubtitle: "אוכל ביתי טרי וכשר — לישיבה במקום או לקחת. השריג 2, בנימינה, מתחם קניות הפיל.",
  heroCta1: "הזמינו עכשיו בוולט",
  heroCta2: "לתפריט",
  aboutKicker: "הסיפור שלנו",
  aboutTitle: "כמו שאמא הייתה מכינה",
  aboutP1: "אצלנו כל צלחת יוצאת מהמטבח כמו שאמא הייתה מכינה — עם הרבה אהבה, בלי קיצורי דרך.",
  aboutP2: "מבשלים כאן כל יום מחדש, מחומרים טריים, בסירים גדולים ובלי אבקות. זו לא מסעדה — זה הבית של אמא, ותמיד יש בו מקום בשולחן.",
  kashrut: "כשרות",
  kashrutDetail: "אוכל ביתי כשר בהשגחת הרבנות המקומית בנימינה–גבעת עדה. הכשרות באחריות העסק.",
  menuKicker: "טעימה מהתפריט",
  menuTitle: "המנות שכולם חוזרים אליהן",
  menuNote: "התפריט מתחלף לפי מה שטרי ומה שהתבשל היום — שווה לשאול מה יצא מהתנור.",
  menuGalleryLink: "לתמונות נוספות מהמטבח — לגלריה",
  galleryKicker: "מהמטבח",
  galleryTitle: "רגעים מהשירותים שלנו",
  locationKicker: "איפה אנחנו",
  locationTitle: "באים לבקר?",
  locationAddress: "השריג 2, בנימינה",
  locationArea: "מתחם קניות הפיל",
  deliveryNote: "משלוחים דרך וולט באותן שעות פתיחה.",
  ctaTitle: "בואו לשבת אצלנו, או תנו לוולט להביא לכם הביתה",
  ctaSubtitle: "רוצים לאכול אצלנו? אצלנו תמיד יש מקום בשולחן. וגם אפשר לקחת — אורזים לך חם ומוכן.",
  ctaCta1: "להזמנת משלוח בוולט",
  ctaCta2: "לאיסוף עצמי — איך מגיעים",
  footerAddress: "השריג 2, בנימינה",
  footerArea: "מתחם קניות הפיל",
  footerKashrut: "כשר בהשגחת הרבנות המקומית בנימינה–גבעת עדה · הכשרות באחריות העסק",
};

export const DEFAULT_SETTINGS: SiteSettings = {
  woltUrl: "https://wolt.com/he/isr",
  mapQuery: "%D7%94%D7%A9%D7%A8%D7%99%D7%92%202%20%D7%91%D7%A0%D7%99%D7%9E%D7%99%D7%A0%D7%94",
};

export const DEFAULT_SITE_DATA: SiteData = {
  dishes: DEFAULT_DISHES,
  openingHours: DEFAULT_OPENING_HOURS,
  gallery: DEFAULT_GALLERY,
  texts: DEFAULT_TEXTS,
  settings: DEFAULT_SETTINGS,
};

/* ─── localStorage Persistence ─── */

const STORAGE_KEY = "ama-alufa-site-data";

export function loadSiteData(): SiteData {
  if (typeof window === "undefined") return DEFAULT_SITE_DATA;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SITE_DATA;
    const parsed = JSON.parse(raw) as Partial<SiteData>;
    // Merge with defaults so new fields always have a value
    return {
      dishes: parsed.dishes ?? DEFAULT_SITE_DATA.dishes,
      openingHours: parsed.openingHours ?? DEFAULT_SITE_DATA.openingHours,
      gallery: parsed.gallery ?? DEFAULT_SITE_DATA.gallery,
      texts: { ...DEFAULT_SITE_DATA.texts, ...parsed.texts },
      settings: { ...DEFAULT_SITE_DATA.settings, ...parsed.settings },
    };
  } catch {
    return DEFAULT_SITE_DATA;
  }
}

export function saveSiteData(data: SiteData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function resetSiteData(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

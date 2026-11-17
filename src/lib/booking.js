// CoverManager online booking: URLs, phone and the chosen presentation.
// Production renders only the variants named in BOOKING. The other variants
// are rendered in dev only, for the variant switcher (see VariantSwitcher.astro).

export const BOOKING = {
  // Where the widget lives: "page" | "modal" | "section" | "external"
  reserva: "page",
  // Footer RESERVAS block: "fallback" | "online" | "igual"
  pie: "fallback",
  // Widget presentation: "styled" | "bare"
  estilo: "styled",
};

export const BOOKING_VARIANTS = {
  reserva: ["page", "modal", "section", "external"],
  pie: ["fallback", "online", "igual"],
  estilo: ["styled", "bare"],
};

const COVERMANAGER_BASE =
  "https://www.covermanager.com/reservation/module_restaurant/restaurante-ultramarinos-el-calvo";

export const COVERMANAGER_URLS = {
  es: `${COVERMANAGER_BASE}/spanish`,
  en: `${COVERMANAGER_BASE}/english`,
};

export const COVERMANAGER_RESIZER_SRC =
  "https://www.covermanager.com/js/iframeResizer/iframeResizer.min.js";

export const COVERMANAGER_FRAME_ID = "restaurante-ultramarinos-el-calvo";

export const PHONE = {
  href: "tel:+34956992222",
  label: "+34 956 99 22 22",
};

const BOOKING_PAGES = { es: "/reservar", en: "/en/book" };
export const BOOKING_SECTION_IDS = { es: "reservar", en: "book" };

export function covermanagerUrl(lang = "es") {
  return COVERMANAGER_URLS[lang] || COVERMANAGER_URLS.es;
}

export function bookingHref(lang = "es", reserva = BOOKING.reserva) {
  const l = lang === "en" ? "en" : "es";
  if (reserva === "page") return BOOKING_PAGES[l];
  if (reserva === "section") return `${l === "en" ? "/en/" : "/"}#${BOOKING_SECTION_IDS[l]}`;
  // "external" and "modal" (no-JS fallback) both point at CoverManager
  return covermanagerUrl(l);
}

// Attributes for every "Reservar"/"Book" link. Spread them onto an <a>.
export function bookingLinkAttrs(lang = "es") {
  const attrs = { href: bookingHref(lang), "data-booking-link": "" };
  if (BOOKING.reserva === "external") {
    attrs.target = "_blank";
    attrs.rel = "noopener noreferrer";
  }
  if (import.meta.env.DEV) {
    for (const mode of BOOKING_VARIANTS.reserva) {
      attrs[`data-href-${mode}`] = bookingHref(lang, mode);
    }
  }
  return attrs;
}

// True when a variant's markup must be rendered: always in dev, otherwise
// only for the chosen variant.
export function renderVariant(group, value) {
  return import.meta.env.DEV || BOOKING[group] === value;
}

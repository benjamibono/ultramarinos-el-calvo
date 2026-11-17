// CoverManager online booking: URLs and phone, in one place.

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

export function covermanagerUrl(lang = "es") {
  return COVERMANAGER_URLS[lang] || COVERMANAGER_URLS.es;
}

export function bookingHref(lang = "es") {
  return BOOKING_PAGES[lang === "en" ? "en" : "es"];
}

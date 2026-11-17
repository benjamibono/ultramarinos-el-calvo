// Client-side: load CoverManager's iframeResizer once and attach it to the
// booking iframes that are on screen. Only imported by booking components,
// so the vendor script loads only where the widget is shown.
import { COVERMANAGER_RESIZER_SRC } from "./booking";

let loading;

function loadResizer() {
  if (window.iFrameResize) return Promise.resolve();
  if (!loading) {
    loading = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = COVERMANAGER_RESIZER_SRC;
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => {
        loading = undefined;
        reject(new Error("CoverManager iframeResizer failed to load"));
      };
      document.head.appendChild(s);
    });
  }
  return loading;
}

export function initBookingFrames(root = document) {
  const frames = [...root.querySelectorAll("iframe[data-booking-frame]")].filter(
    (f) => !f.dataset.resized && f.getClientRects().length > 0,
  );
  if (frames.length === 0) return;
  loadResizer()
    .then(() => {
      frames.forEach((f) => {
        if (f.dataset.resized) return;
        f.dataset.resized = "true";
        window.iFrameResize({}, f);
      });
    })
    .catch((err) => console.warn(err.message));
}

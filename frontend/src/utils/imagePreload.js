const preloadedUrls = new Set();

export function preloadImage(url) {
  if (typeof window === "undefined" || !url || preloadedUrls.has(url)) return;

  preloadedUrls.add(url);
  const img = new Image();
  img.decoding = "async";
  img.src = url;
}

export function preloadCardImages(cards) {
  if (!Array.isArray(cards)) return;
  for (const card of cards) {
    if (card?.image_url) {
      preloadImage(card.image_url);
    }
  }
}

export function preloadCardBack() {
  preloadImage("/torooto.svg");
}

// Loads and decodes a picture before it is needed, so when its item comes up the picture is already
// in memory and appears whole instead of after a black gap (a slow TV needs a few hundred
// milliseconds to fetch and decode a JPEG). `loadImage` resolves true when the picture is ready,
// false when it cannot be loaded; asking again for the same address returns the same answer at
// once. The newest few Image objects are kept so the browser does not drop the decoded bitmap.

const KEEP = 12;
const loaded = new Map<string, { img: HTMLImageElement; ready: Promise<boolean> }>();

const shortUrl = (url: string) => (url.length > 70 ? `…${url.slice(-67)}` : url);

export function loadImage(url: string): Promise<boolean> {
  const known = loaded.get(url);
  if (known) return known.ready;

  const img = new Image();
  const began = performance.now();
  const ready = new Promise<boolean>((resolve) => {
    img.onload = () => {
      const done = () => {
        console.log(`[RSS] picture ready in ${Math.round(performance.now() - began)} ms: ${shortUrl(url)}`);
        resolve(true);
      };
      // decode() makes the browser prepare the bitmap now (not on first paint); not every browser has it
      if (typeof img.decode === "function") img.decode().then(done, done);
      else done();
    };
    img.onerror = () => {
      console.log(`[RSS] picture could not be loaded: ${shortUrl(url)}`);
      resolve(false);
    };
  });
  img.src = url;

  loaded.set(url, { img, ready });
  if (loaded.size > KEEP) {
    const oldest = loaded.keys().next().value;
    if (oldest !== undefined) loaded.delete(oldest);
  }
  return ready;
}

export function preloadImages(urls: (string | null | undefined)[]) {
  for (const url of urls) {
    if (url) void loadImage(url);
  }
}

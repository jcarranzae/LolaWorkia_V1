/**
 * Utility to ensure all image URLs (especially from Firebase Storage or external CDNs)
 * are served with explicit Access-Control-Allow-Origin: * headers for Three.js WebGL textures and canvas elements.
 */
export function getProxiedImageUrl(url: string | undefined | null): string {
  if (!url) return '';
  if (url.startsWith('data:') || url.startsWith('blob:')) return url;
  if (url.startsWith('/api/image-proxy')) return url;

  // Firebase Storage or any external image needed in WebGL textures
  if (url.includes('firebasestorage.googleapis.com') || url.startsWith('http://') || url.startsWith('https://')) {
    try {
      const b64 = typeof window !== 'undefined' ? window.btoa(unescape(encodeURIComponent(url))) : Buffer.from(url).toString('base64');
      return `/api/image-proxy?b64=${b64}`;
    } catch (e) {
      return `/api/image-proxy?url=${encodeURIComponent(url)}`;
    }
  }

  return url;
}

/**
 * Checks whether an image URL is a Firebase Storage asset
 */
export function isFirebaseStorageUrl(url: string | undefined | null): boolean {
  if (!url) return false;
  return url.includes('firebasestorage.googleapis.com');
}

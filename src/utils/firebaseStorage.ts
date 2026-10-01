import { useState, useEffect } from 'react';
import { ref, getDownloadURL, listAll } from 'firebase/storage';
import { storage } from '@/lib/firebase';

const cache = new Map<string, string>();

/**
 * Resolves an image URL from Firebase Storage with intelligent path matching
 * and fallbacks for case-insensitivity, extensions, or subfolders.
 */
export async function getStorageImageUrl(
  filenameOrPaths: string | string[],
  fallbackUrl: string = ''
): Promise<string> {
  const paths = Array.isArray(filenameOrPaths) ? filenameOrPaths : [filenameOrPaths];

  for (const path of paths) {
    if (!path) continue;
    
    // Direct URL check
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }

    if (cache.has(path)) {
      return cache.get(path)!;
    }

    try {
      // Clean path
      const cleanPath = path.startsWith('/') ? path.slice(1) : path;
      const fileRef = ref(storage, cleanPath);
      const url = await getDownloadURL(fileRef);
      cache.set(path, url);
      return url;
    } catch (err: any) {
      if (err?.code === 'storage/unauthorized') {
        return fallbackUrl;
      }
      console.warn(`[FirebaseStorage] direct lookup for '${path}' failed:`, err?.code || err?.message);
    }
  }

  // If direct paths didn't match, attempt listAll to find any close match in bucket root
  try {
    const listResult = await listAll(ref(storage, ''));
    console.log('[FirebaseStorage] Files in root bucket:', listResult.items.map(i => i.name));

    for (const item of listResult.items) {
      for (const candidate of paths) {
        const cleanCandidate = (candidate.startsWith('/') ? candidate.slice(1) : candidate).toLowerCase();
        const itemName = item.name.toLowerCase();
        
        // Exact name (ignoring case) or contains name
        if (
          itemName === cleanCandidate ||
          itemName.includes(cleanCandidate.replace(/\.[^/.]+$/, '')) ||
          cleanCandidate.includes(itemName.replace(/\.[^/.]+$/, ''))
        ) {
          const matchedUrl = await getDownloadURL(item);
          console.log(`[FirebaseStorage] Matched '${candidate}' with bucket item '${item.name}'`);
          cache.set(paths[0], matchedUrl);
          return matchedUrl;
        }
      }
    }
  } catch (listErr: any) {
    if (listErr?.code !== 'storage/unauthorized') {
      console.warn('[FirebaseStorage] Error listing storage items:', listErr);
    }
  }

  return fallbackUrl;
}

/**
 * React hook to fetch and cache Firebase Storage image URLs
 */
export function useFirebaseImage(
  filenameOrPaths: string | string[],
  fallbackUrl: string = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80'
) {
  const [imageUrl, setImageUrl] = useState<string>(() => {
    const first = Array.isArray(filenameOrPaths) ? filenameOrPaths[0] : filenameOrPaths;
    return cache.get(first) || fallbackUrl;
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    const paths = Array.isArray(filenameOrPaths) ? filenameOrPaths : [filenameOrPaths];

    getStorageImageUrl(paths, fallbackUrl)
      .then((url) => {
        if (isMounted) {
          setImageUrl(url);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err);
          setImageUrl(fallbackUrl);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [JSON.stringify(filenameOrPaths), fallbackUrl]);

  return { imageUrl, loading, error };
}

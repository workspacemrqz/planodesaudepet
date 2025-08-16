/**
 * Utility function to construct image URLs with proper extensions
 */
export async function getImageUrl(imagePath: string | null | undefined, fallback?: string): Promise<string> {
  if (!imagePath) {
    return fallback || '';
  }

  // If it's already a complete URL (http/https), return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // If it doesn't start with /objects/, return as is (local static files)
  if (!imagePath.startsWith('/objects/')) {
    return imagePath;
  }

  // If the path already has an extension, return the full URL
  if (imagePath.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
    return `http://localhost:3005${imagePath}`;
  }

  // Try to find the correct extension by testing which file exists
  const baseUrl = `http://localhost:3005${imagePath}`;
  const extensions = ['jpg', 'png', 'jpeg', 'gif', 'webp'];
  
  for (const ext of extensions) {
    try {
      const response = await fetch(`${baseUrl}.${ext}`, { method: 'HEAD' });
      if (response.ok) {
        return `${baseUrl}.${ext}`;
      }
    } catch (error) {
      // Continue to next extension
    }
  }
  
  // If no extension works, return with .jpg as fallback
  return `${baseUrl}.jpg`;
}

// Cache for storing resolved image URLs to avoid repeated requests
const imageUrlCache = new Map<string, string>();

/**
 * Synchronous version that uses caching and smart extension detection
 */
export function getImageUrlSync(imagePath: string | null | undefined, fallback?: string): string {
  if (!imagePath) {
    return fallback || '';
  }

  // If it's already a complete URL (http/https), return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // If it doesn't start with /objects/, return as is (local static files)
  if (!imagePath.startsWith('/objects/')) {
    return imagePath;
  }

  // If the path already has an extension, return the full URL
  if (imagePath.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
    return `http://localhost:3005${imagePath}`;
  }

  // Check cache first
  if (imageUrlCache.has(imagePath)) {
    return imageUrlCache.get(imagePath)!;
  }

  // Start async resolution in background to populate cache for future calls
  getImageUrl(imagePath, fallback).then(resolvedUrl => {
    imageUrlCache.set(imagePath, resolvedUrl);
    // Trigger a re-render by dispatching a custom event
    window.dispatchEvent(new CustomEvent('imageUrlResolved', { detail: { imagePath, resolvedUrl } }));
  }).catch(() => {
    // If async resolution fails, cache the fallback
    const fallbackUrl = fallback || `http://localhost:3005${imagePath}.jpg`;
    imageUrlCache.set(imagePath, fallbackUrl);
  });
  
  // For immediate return, use fallback or default to .jpg
  return fallback || `http://localhost:3005${imagePath}.jpg`;
}
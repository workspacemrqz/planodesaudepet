/**
 * Utility function to construct canonical image URLs (production compatible)
 */
export async function getImageUrl(imagePath: string | null | undefined, fallback?: string): Promise<string> {
  if (!imagePath) {
    return fallback || '';
  }

  // If it's already a complete URL (http/https), return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // If it doesn't start with /objects/ and /api/objects/, return as is (local static files)
  if (!imagePath.startsWith('/objects/') && !imagePath.startsWith('/api/objects/')) {
    return imagePath;
  }

  // If it's already a canonical API path, return as relative URL
  if (imagePath.startsWith('/api/objects/') && imagePath.endsWith('/image')) {
    return imagePath;
  }

  // Map legacy/object-style paths to the canonical API image endpoint that
  // resolves the correct file (including extension) from metadata.
  if (imagePath.startsWith('/objects/uploads/')) {
    const objectId = imagePath.replace('/objects/uploads/', '').replace(/\.(jpg|jpeg|png|gif|webp)$/i, '');
    return `/api/objects/${objectId}/image`;
  }

  if (imagePath.startsWith('/objects/')) {
    const objectId = imagePath.replace('/objects/', '').replace(/\.(jpg|jpeg|png|gif|webp)$/i, '');
    return `/api/objects/${objectId}/image`;
  }

  // Fallback to original path as relative
  return imagePath;
}

/**
 * Synchronous version that returns relative URLs for production compatibility
 */
export function getImageUrlSync(imagePath: string | null | undefined, fallback?: string): string {
  if (!imagePath) {
    return fallback || '';
  }

  // If it's already a complete URL (http/https), return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // If it doesn't start with /objects/ and /api/objects/, return as is (local static files)
  if (!imagePath.startsWith('/objects/') && !imagePath.startsWith('/api/objects/')) {
    return imagePath;
  }

  // If it's already a canonical API path, return as relative URL
  if (imagePath.startsWith('/api/objects/') && imagePath.endsWith('/image')) {
    return imagePath;
  }

  // Map legacy/object-style paths to the canonical API image endpoint
  if (imagePath.startsWith('/objects/uploads/')) {
    const objectId = imagePath.replace('/objects/uploads/', '').replace(/\.(jpg|jpeg|png|gif|webp)$/i, '');
    return `/api/objects/${objectId}/image`;
  }

  if (imagePath.startsWith('/objects/')) {
    const objectId = imagePath.replace('/objects/', '').replace(/\.(jpg|jpeg|png|gif|webp)$/i, '');
    return `/api/objects/${objectId}/image`;
  }

  // Fallback to original path as relative
  return imagePath;
}
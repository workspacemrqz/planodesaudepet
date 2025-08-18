/**
 * Utility function to construct canonical image URLs
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

  // If it's already a canonical API path, return the full URL
  if (imagePath.startsWith('/api/objects/') && imagePath.endsWith('/image')) {
    return `http://localhost:3005${imagePath}`;
  }

  // If it's an old-style path with /objects/uploads/, extract objectId and use canonical URL
  if (imagePath.startsWith('/objects/uploads/')) {
    const objectId = imagePath.replace('/objects/uploads/', '').replace(/\.(jpg|jpeg|png|gif|webp)$/i, '');
    return `http://localhost:3005/api/objects/${objectId}/image`;
  }

  // For any other /objects/ path, assume it's an objectId and use canonical URL
  if (imagePath.startsWith('/objects/')) {
    const objectId = imagePath.replace('/objects/', '').replace(/\.(jpg|jpeg|png|gif|webp)$/i, '');
    return `http://localhost:3005/api/objects/${objectId}/image`;
  }

  // Fallback to original path
  return `http://localhost:3005${imagePath}`;
}

/**
 * Synchronous version that uses the same canonical URL logic
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

  // If it's already a canonical API path, return the full URL
  if (imagePath.startsWith('/api/objects/') && imagePath.endsWith('/image')) {
    return `http://localhost:3005${imagePath}`;
  }

  // If it's an old-style path with /objects/uploads/, extract objectId and use canonical URL
  if (imagePath.startsWith('/objects/uploads/')) {
    const objectId = imagePath.replace('/objects/uploads/', '').replace(/\.(jpg|jpeg|png|gif|webp)$/i, '');
    return `http://localhost:3005/api/objects/${objectId}/image`;
  }

  // For any other /objects/ path, assume it's an objectId and use canonical URL
  if (imagePath.startsWith('/objects/')) {
    const objectId = imagePath.replace('/objects/', '').replace(/\.(jpg|jpeg|png|gif|webp)$/i, '');
    return `http://localhost:3005/api/objects/${objectId}/image`;
  }

  // Fallback to original path
  return `http://localhost:3005${imagePath}`;
}
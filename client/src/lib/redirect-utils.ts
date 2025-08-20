/**
 * Utility functions for handling redirects
 */

/**
 * Handles redirection based on URL type
 * @param url - The URL to redirect to
 */
export function handleRedirect(url: string | null | undefined): void {
  if (!url) {
    console.warn('No redirect URL provided');
    return;
  }

  // Se a URL começar com http/https, abrir em nova aba
  if (url.startsWith('http://') || url.startsWith('https://')) {
    window.open(url, '_blank');
  } 
  // Se for uma URL interna, navegar na mesma aba
  else if (url.startsWith('/')) {
    window.location.href = url;
  }
  // Caso contrário, tratar como URL externa
  else {
    window.open(`https://${url}`, '_blank');
  }
}

/**
 * Creates a redirect handler function
 * @param url - The URL to redirect to
 * @returns A function that handles the redirect
 */
export function createRedirectHandler(url: string | null | undefined) {
  return () => handleRedirect(url);
}

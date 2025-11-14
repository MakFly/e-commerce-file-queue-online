/**
 * URL Helpers
 *
 * Fonctions utilitaires pour construire et manipuler les URLs
 */

/**
 * Build URL with query params
 */
export function buildUrl(
  baseUrl: string,
  path: string,
  params?: Record<string, string | number | boolean | undefined | null>
): string {
  let url = `${baseUrl}${path}`;

  if (!params) return url;

  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `${url}?${queryString}` : url;
}

/**
 * Add query params to existing URL
 */
export function addQueryParams(
  url: string,
  params: Record<string, string | number | boolean>
): string {
  const urlObj = new URL(url, 'http://dummy.com'); // Base for relative URLs

  Object.entries(params).forEach(([key, value]) => {
    urlObj.searchParams.set(key, String(value));
  });

  return urlObj.pathname + urlObj.search;
}

/**
 * Parse query params from URL
 */
export function parseQueryParams(url: string): Record<string, string> {
  const urlObj = new URL(url, 'http://dummy.com');
  const params: Record<string, string> = {};

  urlObj.searchParams.forEach((value, key) => {
    params[key] = value;
  });

  return params;
}

/**
 * Remove query param from URL
 */
export function removeQueryParam(url: string, param: string): string {
  const urlObj = new URL(url, 'http://dummy.com');
  urlObj.searchParams.delete(param);
  return urlObj.pathname + urlObj.search;
}

/**
 * Get query param value from URL
 */
export function getQueryParam(url: string, param: string): string | null {
  const urlObj = new URL(url, 'http://dummy.com');
  return urlObj.searchParams.get(param);
}

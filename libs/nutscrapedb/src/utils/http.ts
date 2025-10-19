/**
 * HTTP utility functions for user agent detection and validation
 */

/**
 * Checks if a user agent string belongs to an API client (not a real browser)
 * @param userAgent The user agent string to check
 * @returns true if the user agent is from an API client, false otherwise
 */
export function isApiClientUserAgent(userAgent: string): boolean {
  const apiClientPatterns = [
    'curl/',
    'node-fetch/',
    'python-requests/',
    'Go-http-client/',
    'wget/',
    'libwww-perl/',
    'Java/',
    'okhttp/',
    'axios/',
  ];

  return apiClientPatterns.some((pattern) => userAgent.includes(pattern));
}

/**
 * Checks if a user agent string belongs to a real browser
 * @param userAgent The user agent string to check
 * @returns true if the user agent is from a real browser, false otherwise
 */
export function isBrowserUserAgent(userAgent: string): boolean {
  const browserPatterns = [
    'Mozilla/',
    'Chrome/',
    'Safari/',
    'Firefox/',
    'Edge/',
    'Opera/',
  ];

  return browserPatterns.some((pattern) => userAgent.includes(pattern));
}

/**
 * Gets a default browser user agent for JavaScript execution
 * @returns A Chrome desktop user agent string
 */
export function getDefaultBrowserUserAgent(): string {
  return 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
}

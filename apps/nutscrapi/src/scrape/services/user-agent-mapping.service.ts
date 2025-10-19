import { UserAgentType } from '@app/nutscrapedb';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserAgentMappingService {
  /**
   * Converts an API user agent key to the actual user agent string
   * @param userAgentKey The user agent key from the API (e.g., 'CHROME')
   * @returns The actual user agent string
   */
  getUserAgentString(userAgentKey: string): string {
    const userAgentString =
      UserAgentType[userAgentKey as keyof typeof UserAgentType];

    if (!userAgentString) {
      throw new Error(`Invalid user agent key: ${userAgentKey}`);
    }

    return userAgentString;
  }

  /**
   * Gets all available user agent keys for the API
   * @returns Array of user agent keys
   */
  getAvailableUserAgentKeys(): string[] {
    return Object.keys(UserAgentType);
  }

  /**
   * Gets browser user agent keys (compatible with JavaScript execution)
   * @returns Array of browser user agent keys
   */
  getBrowserUserAgentKeys(): string[] {
    return Object.keys(UserAgentType).filter((key) => {
      const userAgentString = UserAgentType[key as keyof typeof UserAgentType];
      return (
        !userAgentString.includes('curl/') &&
        !userAgentString.includes('node-fetch/') &&
        !userAgentString.includes('python-requests/') &&
        !userAgentString.includes('Go-http-client/')
      );
    });
  }
}

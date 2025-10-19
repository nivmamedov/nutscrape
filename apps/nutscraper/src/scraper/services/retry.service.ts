import { Injectable, Logger } from '@nestjs/common';
import {
  RetryConfig,
  RetryKeyword,
  RetryResult,
} from '../interfaces/retry-config.interface';

@Injectable()
export class RetryService {
  private readonly logger = new Logger(RetryService.name);

  private readonly defaultRetryKeywords: RetryKeyword[] = [
    {
      keyword: 'blocked',
      caseSensitive: false,
      retryDelay: 5000,
      backoffMultiplier: 1.5,
    },
    {
      keyword: 'restricted',
      caseSensitive: false,
      retryDelay: 3000,
      backoffMultiplier: 1.2,
    },
    {
      keyword: 'rate limit',
      caseSensitive: false,
      retryDelay: 10000,
      backoffMultiplier: 2.0,
    },
    {
      keyword: 'ratelimit',
      caseSensitive: false,
      retryDelay: 10000,
      backoffMultiplier: 2.0,
    },
    {
      keyword: 'too many requests',
      caseSensitive: false,
      retryDelay: 15000,
      backoffMultiplier: 2.5,
    },
    {
      keyword: '429',
      caseSensitive: false,
      retryDelay: 15000,
      backoffMultiplier: 2.5,
    },
    {
      keyword: 'cloudflare',
      caseSensitive: false,
      retryDelay: 8000,
      backoffMultiplier: 1.8,
    },
    {
      keyword: 'captcha',
      caseSensitive: false,
      retryDelay: 12000,
      backoffMultiplier: 2.0,
    },
    {
      keyword: 'access denied',
      caseSensitive: false,
      retryDelay: 5000,
      backoffMultiplier: 1.3,
    },
    {
      keyword: 'forbidden',
      caseSensitive: false,
      retryDelay: 5000,
      backoffMultiplier: 1.3,
    },
    {
      keyword: 'temporarily unavailable',
      caseSensitive: false,
      retryDelay: 3000,
      backoffMultiplier: 1.1,
    },
    {
      keyword: 'service unavailable',
      caseSensitive: false,
      retryDelay: 5000,
      backoffMultiplier: 1.5,
    },
    {
      keyword: 'timeout',
      caseSensitive: false,
      retryDelay: 2000,
      backoffMultiplier: 1.2,
    },
    {
      keyword: 'connection refused',
      caseSensitive: false,
      retryDelay: 3000,
      backoffMultiplier: 1.3,
    },
    {
      keyword: 'network error',
      caseSensitive: false,
      retryDelay: 2000,
      backoffMultiplier: 1.2,
    },
  ];

  private readonly defaultRetryConfig: RetryConfig = {
    maxRetries: 5,
    baseDelay: 1000,
    maxDelay: 60000,
    backoffMultiplier: 2,
    jitter: true,
    keywords: this.defaultRetryKeywords,
  };

  /**
   * Analyzes error content and determines if retry should be attempted
   */
  analyzeError(
    error: any,
    attempt: number,
    config: Partial<RetryConfig> = {},
  ): RetryResult {
    const retryConfig = { ...this.defaultRetryConfig, ...config };

    if (attempt >= retryConfig.maxRetries) {
      return {
        shouldRetry: false,
        delay: 0,
        reason: 'Maximum retry attempts reached',
        detectedKeywords: [],
      };
    }

    const errorContent = this.extractErrorContent(error);
    const detectedKeywords = this.detectKeywords(
      errorContent,
      retryConfig.keywords,
    );

    if (detectedKeywords.length === 0) {
      // Check for HTTP status codes that should trigger retry
      const httpStatus = this.extractHttpStatus(error);
      if (this.shouldRetryForHttpStatus(httpStatus)) {
        const delay = this.calculateDelay(attempt, retryConfig, []);
        return {
          shouldRetry: true,
          delay,
          reason: `HTTP ${httpStatus} status code`,
          detectedKeywords: [],
        };
      }

      return {
        shouldRetry: false,
        delay: 0,
        reason: 'No retry keywords detected and no retryable HTTP status',
        detectedKeywords: [],
      };
    }

    const delay = this.calculateDelay(attempt, retryConfig, detectedKeywords);
    const keywordNames = detectedKeywords.map((k) => k.keyword);

    this.logger.warn(
      `Retry triggered for attempt ${attempt + 1}/${retryConfig.maxRetries}. ` +
        `Detected keywords: [${keywordNames.join(', ')}]. Delay: ${delay}ms`,
    );

    return {
      shouldRetry: true,
      delay,
      reason: `Detected keywords: [${keywordNames.join(', ')}]`,
      detectedKeywords: keywordNames,
    };
  }

  /**
   * Extracts error content from various error types
   */
  private extractErrorContent(error: any): string {
    if (!error) return '';

    let content = '';

    // Extract from error message
    if (error.message) {
      content += error.message + ' ';
    }

    // Extract from error response data
    if (error.response?.data) {
      if (typeof error.response.data === 'string') {
        content += error.response.data + ' ';
      } else if (typeof error.response.data === 'object') {
        content += JSON.stringify(error.response.data) + ' ';
      }
    }

    // Extract from error response headers
    if (error.response?.headers) {
      const headers = Object.entries(error.response.headers)
        .map(([key, value]) => `${key}: ${value}`)
        .join(' ');
      content += headers + ' ';
    }

    // Extract from error status text
    if (error.response?.statusText) {
      content += error.response.statusText + ' ';
    }

    return content.toLowerCase();
  }

  /**
   * Extracts HTTP status code from error
   */
  private extractHttpStatus(error: any): number | null {
    if (error.response?.status) {
      return error.response.status;
    }
    if (error.status) {
      return error.status;
    }
    return null;
  }

  /**
   * Checks if HTTP status code should trigger retry
   */
  private shouldRetryForHttpStatus(status: number | null): boolean {
    if (!status) return false;

    // Retry on server errors (5xx) and rate limiting (429)
    return status >= 500 || status === 429;
  }

  /**
   * Detects retry keywords in error content
   */
  private detectKeywords(
    content: string,
    keywords: RetryKeyword[],
  ): RetryKeyword[] {
    const detected: RetryKeyword[] = [];

    for (const keyword of keywords) {
      const searchText = keyword.caseSensitive
        ? content
        : content.toLowerCase();
      const searchKeyword = keyword.caseSensitive
        ? keyword.keyword
        : keyword.keyword.toLowerCase();

      if (searchText.includes(searchKeyword)) {
        detected.push(keyword);
      }
    }

    return detected;
  }

  /**
   * Calculates retry delay based on attempt, config, and detected keywords
   */
  private calculateDelay(
    attempt: number,
    config: RetryConfig,
    detectedKeywords: RetryKeyword[],
  ): number {
    let baseDelay = config.baseDelay;

    // Apply keyword-specific delays and multipliers
    for (const keyword of detectedKeywords) {
      baseDelay += keyword.retryDelay;
      baseDelay *= keyword.backoffMultiplier;
    }

    // Apply exponential backoff
    const exponentialDelay =
      baseDelay * Math.pow(config.backoffMultiplier, attempt);

    // Apply maximum delay limit
    const delay = Math.min(exponentialDelay, config.maxDelay);

    // Add jitter to prevent thundering herd
    if (config.jitter) {
      const jitterAmount = delay * 0.1; // 10% jitter
      const jitter = (Math.random() - 0.5) * 2 * jitterAmount;
      return Math.max(0, delay + jitter);
    }

    return delay;
  }

  /**
   * Creates a custom retry configuration
   */
  createCustomConfig(config: Partial<RetryConfig>): RetryConfig {
    return {
      ...this.defaultRetryConfig,
      ...config,
      keywords: config.keywords || this.defaultRetryKeywords,
    };
  }

  /**
   * Adds custom retry keywords
   */
  addCustomKeywords(keywords: RetryKeyword[]): RetryKeyword[] {
    return [...this.defaultRetryKeywords, ...keywords];
  }

  /**
   * Gets default retry configuration
   */
  getDefaultConfig(): RetryConfig {
    return { ...this.defaultRetryConfig };
  }
}

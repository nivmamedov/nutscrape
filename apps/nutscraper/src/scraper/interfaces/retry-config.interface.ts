export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  jitter: boolean;
  keywords: RetryKeyword[];
}

export interface RetryKeyword {
  keyword: string;
  caseSensitive: boolean;
  retryDelay: number; // Additional delay for this specific keyword
  backoffMultiplier: number; // Multiplier for this specific keyword
}

export interface RetryResult {
  shouldRetry: boolean;
  delay: number;
  reason?: string;
  detectedKeywords: string[];
}

export enum RetryStrategy {
  EXPONENTIAL_BACKOFF = 'exponential_backoff',
  LINEAR_BACKOFF = 'linear_backoff',
  FIXED_DELAY = 'fixed_delay',
  CUSTOM = 'custom',
}

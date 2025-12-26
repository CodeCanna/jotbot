/**
 * Retry utility for operations that might fail intermittently
 */

export interface RetryOptions {
  maxAttempts?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  retryCondition?: (error: unknown) => boolean;
}

export class RetryError extends Error {
  constructor(
    message: string,
    public readonly attempts: number,
    public readonly lastError: any
  ) {
    super(message);
    this.name = 'RetryError';
  }
}

/**
 * Executes a function with automatic retry logic
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    baseDelay = 1000,
    maxDelay = 30000,
    backoffFactor = 2,
    retryCondition = () => true
  } = options;

  let lastError: any;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      // Don't retry if this is the last attempt
      if (attempt === maxAttempts) {
        break;
      }

      // Check if we should retry this error
      if (!retryCondition(error)) {
        throw error;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(baseDelay * Math.pow(backoffFactor, attempt - 1), maxDelay);

      console.log(`Operation failed (attempt ${attempt}/${maxAttempts}), retrying in ${delay}ms:`, (error as any)?.message || error);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw new RetryError(
    `Operation failed after ${maxAttempts} attempts`,
    maxAttempts,
    lastError
  );
}

/**
 * Retry conditions for different types of errors
 */
export const retryConditions = {
  network: (error: unknown) => {
    // Retry on network errors, timeouts, and certain HTTP status codes
    const err = error as any;
    if (err?.name === 'HttpError' || err?.code === 'ETIMEDOUT' || err?.code === 'ENOTFOUND') {
      return true;
    }
    if (err?.message?.includes('Network request') || err?.message?.includes('timeout')) {
      return true;
    }
    return false;
  },

  database: (error: unknown) => {
    // Retry on database connection issues, locks, etc.
    const err = error as any;
    if (err?.code === 'SQLITE_BUSY' || err?.code === 'SQLITE_LOCKED') {
      return true;
    }
    if (err?.message?.includes('database') || err?.message?.includes('SQLITE')) {
      return true;
    }
    return false;
  },

  api: (error: unknown) => {
    // Retry on API rate limits, temporary server errors
    const err = error as any;
    if (err?.error_code === 429) { // Rate limit
      return true;
    }
    if (err?.error_code >= 500 && err?.error_code < 600) { // Server errors
      return true;
    }
    return retryConditions.network(error);
  }
};
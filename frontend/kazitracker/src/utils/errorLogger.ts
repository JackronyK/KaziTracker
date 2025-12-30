/**
 * ============================================================================
 * ERROR LOGGER - utils/errorLogger.ts
 * ============================================================================
 * Centralized error logging service with support for external services (Sentry, etc.)
 */

import { formatDateTime } from './formatters'

interface LogConfig {
  isDev: boolean;
  enableConsole: boolean;
  enableRemote: boolean;
  remoteUrl?: string;
}

class ErrorLogger {
  private config: LogConfig;
  private logs: Array<{level: string; message: string; timestamp: string}> = [];

  constructor(config: Partial<LogConfig> = {}) {
    this.config = {
      isDev: import.meta.env.DEV,
      enableConsole: true,
      enableRemote: true,
      ...config,
    };
  }

  /**
   * Log info message
   */
  info(message: string, context?: Record<string, any>) {
    this.log('info', message, context);
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: Record<string, any>) {
    this.log('warn', message, context);
  }

  /**
   * Log error
   */
  error(message: string, error?: Error | unknown, context?: Record<string, any>) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const stackTrace = error instanceof Error ? error.stack : undefined;
    
    this.log('error', message, {
      ...context,
      errorMessage,
      stackTrace,
    });
  }

  /**
   * Main logging function
   */
  private log(level: 'info' | 'warn' | 'error', message: string, context?: Record<string, any>) {
    const timestamp = formatDateTime(new Date());
    const logEntry = {
      level,
      message,
      timestamp,
      context,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    };

    // Store in memory (last 100 logs)
    this.logs.push({ level, message, timestamp });
    if (this.logs.length > 100) {
      this.logs.shift();
    }

    // Console output in development
    if (this.config.isDev && this.config.enableConsole) {
      const style = {
        info: 'color: #0ea5e9',
        warn: 'color: #f59e0b',
        error: 'color: #ef4444',
      };
      console.log(
        `%c[${level.toUpperCase()}] ${timestamp}: ${message}`,
        style[level]
      );
      if (context) console.log('Context:', context);
    }

    // Send to remote service (production)
    if (!this.config.isDev && this.config.enableRemote && level === 'error') {
      this.sendToRemote(logEntry);
    }
  }

  /**
   * Send error to remote service (Sentry, etc.)
   */
  private sendToRemote(logEntry: any) {
    // Placeholder for Sentry or other service integration
    // Example: Sentry.captureException(logEntry);
    
    // For now, just log to console that it would be sent
    if (this.config.isDev) {
      console.log('Would send to remote:', logEntry);
    }
  }

  /**
   * Get all logs
   */
  getLogs() {
    return [...this.logs];
  }

  /**
   * Clear logs
   */
  clearLogs() {
    this.logs = [];
  }
}

// Create singleton instance
export const errorLogger = new ErrorLogger();

// Export helper functions
export const logError = (message: string, error?: Error | unknown, context?: Record<string, any>) => {
  errorLogger.error(message, error, context);
};

export const logWarn = (message: string, context?: Record<string, any>) => {
  errorLogger.warn(message, context);
};

export const logInfo = (message: string, context?: Record<string, any>) => {
  errorLogger.info(message, context);
};
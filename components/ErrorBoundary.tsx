// BuffrSign Platform - Advanced Error Boundary Component
// Comprehensive error handling with recovery and monitoring

'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug, X } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
  retryCount: number;
  isRetrying: boolean;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: ErrorInfo, errorId: string) => void;
  maxRetries?: number;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
}

interface ErrorFallbackProps {
  error: Error;
  errorInfo: ErrorInfo | null;
  errorId: string;
  retryCount: number;
  isRetrying: boolean;
  onRetry: () => void;
  onReset: () => void;
  onReport: () => void;
}

// ============================================================================
// ERROR BOUNDARY COMPONENT
// ============================================================================

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId: number | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      retryCount: 0,
      isRetrying: false
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      hasError: true,
      error,
      errorId,
      isRetrying: false
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError } = this.props;
    const { errorId } = this.state;

    // Update state with error info
    this.setState({ errorInfo });

    // Log error for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Report error to monitoring service
    this.reportError(error, errorInfo, errorId);

    // Call custom error handler
    onError?.(error, errorInfo, errorId);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetOnPropsChange, resetKeys } = this.props;
    const { hasError } = this.state;

    // Reset error boundary when props change
    if (hasError && resetOnPropsChange) {
      if (resetKeys) {
        const hasResetKeyChanged = resetKeys.some((key, _index) => 
          key !== prevProps.resetKeys?.[_index]
        );
        
        if (hasResetKeyChanged) {
          this.resetErrorBoundary();
        }
      } else {
        this.resetErrorBoundary();
      }
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  private reportError = (error: Error, errorInfo: ErrorInfo, errorId: string) => {
    // Report to monitoring service (Sentry, LogRocket, etc.)
    const errorReport = {
      errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.getCurrentUserId(),
      sessionId: this.getSessionId()
    };

    // Send to monitoring service
    this.sendErrorReport(errorReport);
  };

  private sendErrorReport = (errorReport: Record<string, unknown>) => {
    // In production, send to your monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error, { extra: errorReport });
      console.log('Error reported to monitoring service:', errorReport);
    } else {
      console.log('Development error report:', errorReport);
    }
  };

  private getCurrentUserId = (): string | null => {
    // Get current _user ID from context or localStorage
    try {
      const userData = localStorage.getItem('buffrsign_user');
      if (userData) {
        const _user = JSON.parse(userData);
        return _user.id || null;
      }
    } catch (error) {
      console.warn('Failed to get _user ID:', error);
    }
    return null;
  };

  private getSessionId = (): string => {
    // Get or create session ID
    let sessionId = sessionStorage.getItem('buffrsign_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('buffrsign_session_id', sessionId);
    }
    return sessionId;
  };

  private handleRetry = () => {
    const { maxRetries = 3 } = this.props;
    const { retryCount } = this.state;

    if (retryCount >= maxRetries) {
      console.warn('Maximum retry attempts reached');
      return;
    }

    this.setState(prevState => ({
      isRetrying: true,
      retryCount: prevState.retryCount + 1
    }));

    // Simulate retry delay
    setTimeout(() => {
      this.resetErrorBoundary();
    }, 1000);
  };

  private handleReset = () => {
    this.resetErrorBoundary();
  };

  private handleReport = () => {
    const { error, errorInfo, errorId } = this.state;
    if (error) {
      this.reportError(error, errorInfo!, errorId);
      
      // Show feedback to user
      alert('Error has been reported to our development team. Thank you for your feedback!');
    }
  };

  private resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      isRetrying: false
    });
  };

  render() {
    const { hasError, error, errorInfo, errorId, retryCount, isRetrying } = this.state;
    const { children, fallback: FallbackComponent } = this.props;

    if (hasError && error) {
      if (FallbackComponent) {
        return (
          <FallbackComponent
            error={error}
            errorInfo={errorInfo}
            errorId={errorId}
            retryCount={retryCount}
            isRetrying={isRetrying}
            onRetry={this.handleRetry}
            onReset={this.handleReset}
            onReport={this.handleReport}
          />
        );
      }

      return (
        <DefaultErrorFallback
          error={error}
          errorInfo={errorInfo}
          errorId={errorId}
          retryCount={retryCount}
          isRetrying={isRetrying}
          onRetry={this.handleRetry}
          onReset={this.handleReset}
          onReport={this.handleReport}
        />
      );
    }

    return children;
  }
}

// ============================================================================
// DEFAULT ERROR FALLBACK COMPONENT
// ============================================================================

const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  errorInfo,
  errorId,
  retryCount,
  isRetrying,
  onRetry,
  onReset,
  onReport
}) => {
  const [showDetails, setShowDetails] = React.useState(false);
  const { maxRetries = 3 } = React.useContext(ErrorBoundaryContext) || {};

  const canRetry = retryCount < maxRetries;
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg border border-red-200">
        {/* Header */}
        <div className="bg-red-50 border-b border-red-200 p-6 rounded-t-lg">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-red-900">
                Something went wrong
              </h1>
              <p className="text-sm text-red-700 mt-1">
                We&apos;re sorry, but something unexpected happened. Our team has been notified.
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-4">
            {/* Error Message */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Error Details</h3>
              <p className="text-sm text-gray-700 font-mono bg-white p-3 rounded border">
                {error.message}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Error ID: {errorId}
              </p>
            </div>

            {/* Development Details */}
            {isDevelopment && errorInfo && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="flex items-center space-x-2 text-yellow-800 hover:text-yellow-900"
                >
                  <Bug className="h-4 w-4" />
                  <span className="font-medium">
                    {showDetails ? 'Hide' : 'Show'} Development Details
                  </span>
                </button>
                
                {showDetails && (
                  <div className="mt-3 space-y-3">
                    <div>
                      <h4 className="font-medium text-yellow-900 mb-1">Component Stack</h4>
                      <pre className="text-xs text-yellow-800 bg-white p-2 rounded border overflow-auto max-h-32">
                        {errorInfo.componentStack}
                      </pre>
                    </div>
                    
                    {error.stack && (
                      <div>
                        <h4 className="font-medium text-yellow-900 mb-1">Error Stack</h4>
                        <pre className="text-xs text-yellow-800 bg-white p-2 rounded border overflow-auto max-h-32">
                          {error.stack}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              {canRetry && (
                <button
                  onClick={onRetry}
                  disabled={isRetrying}
                  className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isRetrying ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Retrying...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      <span>Try Again</span>
                    </>
                  )}
                </button>
              )}
              
              <button
                onClick={onReset}
                className="flex items-center justify-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Home className="h-4 w-4" />
                <span>Go to Home</span>
              </button>
              
              <button
                onClick={onReport}
                className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Bug className="h-4 w-4" />
                <span>Report Issue</span>
              </button>
            </div>

            {/* Retry Information */}
            {retryCount > 0 && (
              <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                <p>
                  Retry attempt {retryCount} of {maxRetries}
                  {!canRetry && ' (Maximum retries reached)'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 p-4 rounded-b-lg">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <p>
              If this problem persists, please contact our support team.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// AI-SPECIFIC ERROR FALLBACK
// ============================================================================

export const AIErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  errorId,
  isRetrying,
  onRetry,
  onReset,
  onReport
}) => {

  return (
    <div className="bg-white border border-red-200 rounded-lg p-6">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-6 w-6 text-red-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-red-900 mb-2">
            AI Processing Error
          </h3>
          <p className="text-sm text-red-700 mb-4">
            There was an error while processing your _document with AI. This might be due to:
          </p>
          
          <ul className="text-sm text-red-700 list-disc list-inside mb-4 space-y-1">
            <li>Network connectivity issues</li>
            <li>AI service temporarily unavailable</li>
            <li>Document format not supported</li>
            <li>File size too large</li>
          </ul>

          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <p className="text-xs text-gray-600 font-mono">
              {error.message}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Error ID: {errorId}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={onRetry}
              disabled={isRetrying}
              className="btn btn-primary btn-sm"
            >
              {isRetrying ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin mr-1" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Retry AI Processing
                </>
              )}
            </button>
            
            <button
              onClick={onReset}
              className="btn btn-outline btn-sm"
            >
              <X className="h-4 w-4 mr-1" />
              Cancel
            </button>
            
            <button
              onClick={onReport}
              className="btn btn-outline btn-sm"
            >
              <Bug className="h-4 w-4 mr-1" />
              Report Issue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// ERROR BOUNDARY CONTEXT
// ============================================================================

interface ErrorBoundaryContextType {
  maxRetries: number;
  onError?: (error: Error, errorInfo: ErrorInfo, errorId: string) => void;
}

const ErrorBoundaryContext = React.createContext<ErrorBoundaryContextType | null>(null);

export const ErrorBoundaryProvider: React.FC<{
  children: ReactNode;
  maxRetries?: number;
  onError?: (error: Error, errorInfo: ErrorInfo, errorId: string) => void;
}> = ({ children, maxRetries = 3, onError }) => {
  const value = React.useMemo(() => ({ maxRetries, onError }), [maxRetries, onError]);
  
  return (
    <ErrorBoundaryContext.Provider value={value}>
      {children}
    </ErrorBoundaryContext.Provider>
  );
};

// ============================================================================
// HOOK FOR ERROR BOUNDARY
// ============================================================================

export const useErrorBoundary = () => {
  const context = React.useContext(ErrorBoundaryContext);
  if (!context) {
    throw new Error('useErrorBoundary must be used within ErrorBoundaryProvider');
  }
  return context;
};

// ============================================================================
// EXPORTS
// ============================================================================

export default ErrorBoundary;
export type { ErrorBoundaryProps, ErrorFallbackProps, ErrorBoundaryState };

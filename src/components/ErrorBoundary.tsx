import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends React.Component<{
  children: React.ReactNode;
}, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log error to console in development
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary]', error, info);
    
    // In production, you could add other error logging services here
    // For now, we'll just console.log since Supabase is not configured
    if (process.env.NODE_ENV === 'production') {
      console.error('[ErrorBoundary Production]', error.message, info.componentStack);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-4">
          <h1 className="text-2xl font-bold mb-2">Something went wrong.</h1>
          <p className="mb-4">Please try refreshing the page.</p>
          <button onClick={() => location.reload()} className="px-4 py-2 bg-primary-500 text-white rounded">
            Reload
          </button>
        </div>
      );
    }

    return this.props.children;
  }
} 
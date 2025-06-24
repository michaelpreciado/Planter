import React from 'react';
import { createClient } from '@supabase/supabase-js';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

const supabase = createClient(supabaseUrl, supabaseAnon);

export default class ErrorBoundary extends React.Component<{
  children: React.ReactNode;
}, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  async componentDidCatch(error: Error, info: React.ErrorInfo) {
    if (process.env.NODE_ENV === 'production') {
      // Call edge function to log client error
      await fetch('/api/log_client_error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: error.message, stack: info.componentStack }),
      });
    } else {
      // eslint-disable-next-line no-console
      console.error('[ErrorBoundary]', error, info);
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
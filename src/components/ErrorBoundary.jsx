import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service here if needed
    // We intentionally don't console.error in production to avoid exposing internal paths
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#0E1117] text-white p-4">
          <div className="max-w-md text-center glass-panel p-8 rounded-2xl border border-red-500/30">
            <div className="text-5xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold font-heading text-[#C8A96E] mb-4">Something went wrong</h1>
            <p className="text-slate-400 mb-6 font-body">
              An unexpected error occurred. Don't worry, your data is safe. Please refresh the page to try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-[#C8A96E] hover:bg-[#b0935d] text-[#0E1117] font-bold py-2 px-6 rounded-lg transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#C8A96E] focus-visible:outline-offset-2"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;

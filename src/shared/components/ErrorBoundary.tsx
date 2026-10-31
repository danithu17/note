import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Copy, Check } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  copied: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      copied: false,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      copied: false,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    // Crash reporting telemetry hook (pluggable with Sentry / PostHog)
    if (typeof window !== 'undefined' && (window as any).reportErrorTelemetry) {
      (window as any).reportErrorTelemetry(error, errorInfo);
    } else {
      console.error('Unhandled Application Crash:', error, errorInfo);
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleCopyDiagnostics = () => {
    const diagnostics = {
      message: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    };
    navigator.clipboard.writeText(JSON.stringify(diagnostics, null, 2));
    this.setState({ copied: true });
    setTimeout(() => this.setState({ copied: false }), 2000);
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="w-screen h-screen flex items-center justify-center bg-slate-950 text-slate-100 p-6 select-none">
          <div className="max-w-md w-full bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-2xl flex flex-col gap-4 text-center">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h2 className="text-xl font-bold tracking-tight">Something went wrong</h2>
              <p className="text-xs text-slate-400 mt-1">
                ScribbleNote encountered an unexpected issue. Your local lecture data is safe in
                IndexedDB.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-rose-400 text-left overflow-x-auto max-h-32">
                {this.state.error.message}
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={this.handleReload}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload Workspace</span>
              </button>

              <button
                onClick={this.handleCopyDiagnostics}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
                title="Copy Crash Diagnostics"
              >
                {this.state.copied ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

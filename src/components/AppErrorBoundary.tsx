import { Component } from 'react';
import type { ReactNode } from 'react';

type State = { errored: boolean; error: Error | null };

export class AppErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { errored: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { errored: true, error };
  }

  componentDidCatch(error: Error) {
    console.error('[AppErrorBoundary] Caught uncaught throw:', error);
  }

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.errored) return this.props.children;
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center text-slate-100">
        <p className="text-4xl mb-3" aria-hidden>🩹</p>
        <p className="text-base font-semibold text-slate-200">Something went wrong</p>
        <p className="mt-2 max-w-xs text-xs text-slate-500">
          The app encountered a critical error. Your raffle data is safely saved in local storage.
        </p>
        {this.state.error && (
          <pre className="mt-4 px-3 py-2 bg-[#1e1f2b] border border-[#2a2b38] rounded-xl text-[10px] font-mono text-red-400 overflow-auto max-w-full max-h-32 text-left">
            {this.state.error.message}
          </pre>
        )}
        <button
          type="button"
          onClick={this.handleReload}
          className="mt-6 rounded-2xl bg-purple-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-purple-500 active:scale-95 cursor-pointer"
        >
          Reload App
        </button>
      </div>
    );
  }
}

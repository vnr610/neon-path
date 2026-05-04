/**
 * ErrorBoundary — catches any unhandled React render errors and shows
 * the GlitchSkull error screen instead of a blank page.
 */

import { Component, ReactNode, ErrorInfo } from "react";
import { GlitchSkull } from "@/components/saber/GlitchSkull";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error?.message || "Unknown error" };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return <ErrorScreen message={this.state.message} onRetry={() => this.setState({ hasError: false, message: "" })} />;
  }
}

function ErrorScreen({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 relative overflow-hidden">
      <div className="absolute inset-0 grid-bg pointer-events-none opacity-40" />
      <div className="scan-overlay" />

      <div className="relative z-10 w-full max-w-lg flex flex-col items-center text-center">

        {/* Skull */}
        <GlitchSkull size={180} />

        {/* Status */}
        <p className="mt-8 text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
          realm :: critical fault
        </p>

        {/* Glitching heading */}
        <h1 className="font-display text-5xl sm:text-6xl font-black leading-none saber-text mt-3 select-none">
          ERROR
        </h1>

        {/* Error message */}
        <div className="mt-6 w-full saber-card p-4 font-mono text-[11px] text-left space-y-1">
          <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/60 mb-2">
            // fault trace
          </p>
          <p className="text-destructive/80 break-all">{message}</p>
          <span className="inline-block h-3 w-1.5 bg-foreground/60 animate-pulse mt-1" />
        </div>

        <p className="font-mono text-sm text-muted-foreground mt-6 mb-8 max-w-sm">
          Something broke in the realm. You can try to recover or reload the page.
        </p>

        <div className="flex items-center gap-4">
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md border border-saber-blue/40 text-saber-blue text-xs uppercase tracking-[0.25em] font-mono hover:bg-saber-blue/10 transition-colors"
          >
            ↺ Try to recover
          </button>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md border border-border/60 text-muted-foreground text-xs uppercase tracking-[0.25em] font-mono hover:text-foreground hover:border-foreground/40 transition-colors"
          >
            ⟳ Reload page
          </button>
        </div>

        <a
          href="/"
          className="mt-6 text-xs text-muted-foreground/50 hover:text-muted-foreground font-mono uppercase tracking-[0.2em] transition-colors"
        >
          ← Return to realm
        </a>
      </div>
    </div>
  );
}

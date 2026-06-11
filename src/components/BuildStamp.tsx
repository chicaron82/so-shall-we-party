declare const __BUILD_DATE__: string;
declare const __BUILD_SHA__: string;

/**
 * Subtle always-visible build stamp: build date + short commit SHA, injected at
 * build time via vite `define`. A faint footer (light tone for the dark theme)
 * so you can confirm which deploy is live at a glance.
 */
export function BuildStamp() {
  return (
    <div className="text-center py-4 text-[10px] text-white/30 select-none tracking-[0.2em] font-mono">
      {__BUILD_DATE__} · {__BUILD_SHA__}
    </div>
  );
}

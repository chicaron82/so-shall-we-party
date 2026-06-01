// Thin browser-side-effect helpers so components stay dumb.

/** Trigger a download of `text` as a .json file. */
export function downloadJson(filename: string, text: string): void {
  const blob = new Blob([text], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.json') ? filename : `${filename}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Copy text to the clipboard. Returns false if the API is unavailable or fails. */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/** A filesystem-safe filename for an export, dated. */
export function backupFilename(label = 'all'): string {
  const day = new Date().toISOString().slice(0, 10);
  const safe = label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'event';
  return `sswp-${safe}-${day}.json`;
}

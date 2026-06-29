import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";
import { useState } from "react";

const SVG_GOOGLE = (
  <svg viewBox="0 0 24 24" className="size-4"><path fill="#EA4335" d="M12 11v3.2h5.45c-.23 1.42-1.7 4.18-5.45 4.18-3.28 0-5.96-2.72-5.96-6.08S8.72 6.22 12 6.22c1.87 0 3.12.8 3.84 1.48l2.62-2.54C16.84 3.6 14.64 2.6 12 2.6 6.84 2.6 2.6 6.84 2.6 12S6.84 21.4 12 21.4c6.94 0 9.6-4.88 9.6-9.4 0-.64-.06-1.13-.16-1.6H12z"/></svg>
);
const SVG_APPLE = (
  <svg viewBox="0 0 24 24" className="size-4" fill="currentColor"><path d="M17.564 13.066c-.018-1.84 1.494-2.717 1.56-2.76-.85-1.24-2.17-1.41-2.64-1.43-1.13-.11-2.2.66-2.77.66-.58 0-1.46-.64-2.4-.62-1.23.02-2.37.71-3 1.81-1.27 2.2-.32 5.46.93 7.24.61.88 1.34 1.86 2.3 1.82.92-.04 1.27-.6 2.39-.6 1.11 0 1.43.6 2.41.58 1-.02 1.63-.9 2.24-1.78.7-1.02.99-2.01 1.01-2.06-.02-.01-1.93-.74-1.95-2.94zM15.7 7.04c.5-.62.85-1.46.75-2.32-.73.03-1.62.5-2.14 1.11-.47.55-.88 1.43-.77 2.27.81.06 1.65-.42 2.16-1.06z"/></svg>
);
const SVG_GITHUB = (
  <svg viewBox="0 0 24 24" className="size-4" fill="currentColor"><path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.52-1.34-1.28-1.69-1.28-1.69-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 015.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.69 5.39-5.25 5.68.41.35.78 1.05.78 2.12 0 1.53-.01 2.77-.01 3.15 0 .31.21.68.8.56C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z"/></svg>
);
const SVG_MS = (
  <svg viewBox="0 0 24 24" className="size-4"><path fill="#F25022" d="M2 2h9v9H2z"/><path fill="#7FBA00" d="M13 2h9v9h-9z"/><path fill="#00A4EF" d="M2 13h9v9H2z"/><path fill="#FFB900" d="M13 13h9v9h-9z"/></svg>
);

export function SocialButtons({ onAfterAuth }: { onAfterAuth: () => void }) {
  const [busy, setBusy] = useState<string | null>(null);

  const signInOAuth = async (provider: "google" | "apple") => {
    setBusy(provider);
    try {
      const result = await lovable.auth.signInWithOAuth(provider, { redirect_uri: window.location.origin });
      if (result.error) {
        toast.error(`Sign in failed: ${result.error.message ?? "unknown error"}`);
        return;
      }
      if (result.redirected) return;
      onAfterAuth();
    } finally {
      setBusy(null);
    }
  };

  const unsupported = (name: string) => {
    toast.info(`${name} sign-in isn't available yet — use Google, Apple, or email.`);
  };

  const btn = "flex items-center justify-center gap-2 rounded-xl border border-border bg-glass px-3 py-2.5 text-sm font-medium transition hover:bg-card disabled:opacity-50";

  return (
    <div className="grid grid-cols-2 gap-2">
      <button type="button" disabled={busy !== null} onClick={() => signInOAuth("google")} className={btn}>
        {SVG_GOOGLE} {busy === "google" ? "…" : "Google"}
      </button>
      <button type="button" disabled={busy !== null} onClick={() => signInOAuth("apple")} className={btn}>
        {SVG_APPLE} {busy === "apple" ? "…" : "Apple"}
      </button>
      <button type="button" onClick={() => unsupported("GitHub")} className={btn}>
        {SVG_GITHUB} GitHub
      </button>
      <button type="button" onClick={() => unsupported("Microsoft")} className={btn}>
        {SVG_MS} Microsoft
      </button>
    </div>
  );
}

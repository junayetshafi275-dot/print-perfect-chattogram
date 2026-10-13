import { useState, useEffect } from "react";
import { X, MessageCircle } from "lucide-react";
import { whatsappLink } from "@/lib/business-contact";

export function WhatsAppWidget() {
  const [dismissed, setDismissed] = useState(false);
  const [visible, setVisible] = useState(false);
  const href = whatsappLink("Hi Friends Printers, I'd like a quote.");

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 600);
    return () => clearTimeout(t);
  }, []);

  // No verified WhatsApp number configured yet → show nothing rather than a dead link.
  if (!href || dismissed || !visible) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2">
      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss chat"
        className="grid h-7 w-7 place-items-center rounded-full bg-background border border-border text-ink-soft shadow-soft hover:text-ink transition-colors"
      >
        <X className="h-3.5 w-3.5" />
      </button>
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="group relative inline-flex items-center gap-2 rounded-full bg-[#25D366] pl-3 pr-4 py-3 text-sm font-medium text-white shadow-elegant transition-transform duration-150 ease-out hover:scale-[1.04] active:scale-[0.98] animate-wa-pulse hover:[animation-play-state:paused] motion-reduce:animate-none motion-reduce:hover:scale-100"
      >
        <MessageCircle className="h-5 w-5" />
        <span className="hidden sm:inline">Chat on WhatsApp</span>
      </a>
    </div>
  );
}

import { useState, useEffect } from "react";
import { X, MessageCircle } from "lucide-react";

export function WhatsAppWidget() {
  const [dismissed, setDismissed] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 600);
    return () => clearTimeout(t);
  }, []);

  if (dismissed || !visible) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2">
      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss chat"
        className="grid h-7 w-7 place-items-center rounded-full bg-background border border-border text-ink-soft shadow-soft hover:text-ink"
      >
        <X className="h-3.5 w-3.5" />
      </button>
      <a
        href="https://wa.me/8801000000000?text=Hi%20Friends%20Printers%2C%20I%27d%20like%20a%20quote."
        target="_blank"
        rel="noreferrer"
        className="group inline-flex items-center gap-2 rounded-full bg-[#25D366] pl-3 pr-4 py-3 text-sm font-medium text-white shadow-elegant transition-transform hover:scale-105"
      >
        <MessageCircle className="h-5 w-5" />
        <span className="hidden sm:inline">Chat on WhatsApp</span>
      </a>
    </div>
  );
}

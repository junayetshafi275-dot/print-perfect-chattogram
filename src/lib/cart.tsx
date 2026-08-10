import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type CartLine = {
  slug: string;
  name: string;
  label?: string | null;
  imageKey?: string | null;
  price: number;
  quantity: number;
};

type CartApi = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  add: (line: Omit<CartLine, "quantity">, quantity?: number) => void;
  remove: (slug: string) => void;
  setQuantity: (slug: string, quantity: number) => void;
  clear: () => void;
};

const STORAGE_KEY = "fp-cart-v1";
const CartContext = createContext<CartApi | null>(null);

function readStored(): CartLine[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CartLine[]) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);

  // Hydrate after mount so SSR and first client render match.
  useEffect(() => {
    setLines(readStored());
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* storage unavailable — cart stays in memory */
    }
  }, [lines]);

  const api = useMemo<CartApi>(() => {
    return {
      lines,
      count: lines.reduce((n, l) => n + l.quantity, 0),
      subtotal: lines.reduce((n, l) => n + l.price * l.quantity, 0),
      add: (line, quantity = 1) =>
        setLines((prev) => {
          const existing = prev.find((l) => l.slug === line.slug);
          if (existing) {
            return prev.map((l) =>
              l.slug === line.slug ? { ...l, quantity: Math.min(999, l.quantity + quantity) } : l,
            );
          }
          return [...prev, { ...line, quantity }];
        }),
      remove: (slug) => setLines((prev) => prev.filter((l) => l.slug !== slug)),
      setQuantity: (slug, quantity) =>
        setLines((prev) =>
          quantity < 1
            ? prev.filter((l) => l.slug !== slug)
            : prev.map((l) => (l.slug === slug ? { ...l, quantity: Math.min(999, quantity) } : l)),
        ),
      clear: () => setLines([]),
    };
  }, [lines]);

  return <CartContext.Provider value={api}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}

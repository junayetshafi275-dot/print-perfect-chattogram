import { Outlet, createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { WhatsAppWidget } from "@/components/whatsapp-widget";
import { SmoothScroll } from "@/components/smooth-scroll";
import { CartProvider } from "@/lib/cart";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/_site")({
  component: SiteLayout,
});

function SiteLayout() {
  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <SmoothScroll />
        <SiteHeader />
        <main className="flex-1">
          <Outlet />
        </main>
        <SiteFooter />
        <WhatsAppWidget />
        <Toaster />
      </div>
    </CartProvider>
  );
}


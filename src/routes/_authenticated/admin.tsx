import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { formatBDT } from "@/lib/catalog";
import { ORDER_FLOW, STATUS_LABEL, type OrderStatus } from "@/lib/order-status";
import {
  myAdminRole,
  listAdminOrders,
  updateOrderStatus,
  updatePaymentStatus,
  listAdminProducts,
  saveProduct,
  deleteProduct,
  listSubmissions,
  updateSubmissionStatus,
  listAdminTestimonials,
  saveTestimonial,
  deleteTestimonial,
  type AdminProduct,
  type AdminTestimonial,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminPage,
});

const ALL_STATUSES: OrderStatus[] = [...ORDER_FLOW, "cancelled"];

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
}

function AdminPage() {
  const navigate = useNavigate();
  const role = useServerFn(myAdminRole);
  const { data, isLoading } = useQuery({ queryKey: ["admin-role"], queryFn: () => role({}) });

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  }

  if (isLoading) {
    return <div className="p-10 text-sm text-muted-foreground">Loading the press-room desk…</div>;
  }

  if (!data?.role) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-10 text-center">
        <h1 className="text-2xl font-semibold">No staff access yet</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          You&apos;re signed in as {data?.email ?? "an unknown account"}, but this account hasn&apos;t been
          given staff or admin access. Ask an admin to grant it.
        </p>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link to="/">Back to site</Link>
          </Button>
          <Button onClick={signOut}>Sign out</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Friends Printers — Admin</h1>
            <p className="text-xs text-muted-foreground">
              {data.email} · {data.role}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/">View site</Link>
            </Button>
            <Button size="sm" variant="ghost" onClick={signOut}>
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <Tabs defaultValue="orders">
          <TabsList>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="enquiries">Enquiries</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>
          <TabsContent value="orders" className="mt-6">
            <OrdersTab />
          </TabsContent>
          <TabsContent value="products" className="mt-6">
            <ProductsTab />
          </TabsContent>
          <TabsContent value="enquiries" className="mt-6">
            <EnquiriesTab />
          </TabsContent>
          <TabsContent value="reviews" className="mt-6">
            <ReviewsTab />
          </TabsContent>
        </Tabs>
      </main>
      <Toaster />
    </div>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return <div className="rounded-xl border bg-card p-5 shadow-sm">{children}</div>;
}

function OrdersTab() {
  const qc = useQueryClient();
  const list = useServerFn(listAdminOrders);
  const setStatus = useServerFn(updateOrderStatus);
  const setPayment = useServerFn(updatePaymentStatus);
  const [open, setOpen] = useState<string | null>(null);
  const [note, setNote] = useState("");

  const { data: orders = [], isLoading } = useQuery({ queryKey: ["admin-orders"], queryFn: () => list({}) });

  const statusMutation = useMutation({
    mutationFn: (v: { id: string; status: OrderStatus; note?: string }) => setStatus({ data: v }),
    onSuccess: () => {
      toast.success("Order updated.");
      setNote("");
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const paymentMutation = useMutation({
    mutationFn: (v: { id: string; paymentStatus: "pending" | "paid" | "failed" | "refunded" }) =>
      setPayment({ data: v }),
    onSuccess: () => {
      toast.success("Payment status updated.");
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading orders…</p>;
  if (orders.length === 0) return <Panel>No orders yet.</Panel>;

  return (
    <div className="space-y-4">
      {orders.map((o) => (
        <Panel key={o.id}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{o.orderNumber}</span>
                <Badge variant="secondary">{STATUS_LABEL[o.status]}</Badge>
                <Badge variant={o.paymentStatus === "paid" ? "default" : "outline"}>{o.paymentStatus}</Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {o.customerName} · {o.customerPhone} · {fmtDate(o.createdAt)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">{formatBDT(o.totalAmount)}</span>
              <Button variant="outline" size="sm" onClick={() => setOpen(open === o.id ? null : o.id)}>
                {open === o.id ? "Hide" : "Manage"}
              </Button>
            </div>
          </div>

          {open === o.id && (
            <div className="mt-5 grid gap-6 border-t pt-5 md:grid-cols-2">
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-medium">Delivery</p>
                  <p className="text-muted-foreground">{o.shippingAddress}</p>
                  {o.customerEmail && <p className="text-muted-foreground">{o.customerEmail}</p>}
                  <p className="text-muted-foreground">Payment method: {o.paymentMethod}</p>
                </div>
                <div>
                  <p className="font-medium">Items</p>
                  <ul className="text-muted-foreground">
                    {o.items.map((i, idx) => (
                      <li key={idx}>
                        {i.quantity} × {i.name} — {formatBDT(i.price * i.quantity)}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="font-medium">History</p>
                  <ul className="text-muted-foreground">
                    {o.history.map((h, idx) => (
                      <li key={idx}>
                        {fmtDate(h.createdAt)} — {STATUS_LABEL[h.status]}
                        {h.note ? ` (${h.note})` : ""}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Update status</Label>
                  <Select
                    value={o.status}
                    onValueChange={(v) =>
                      statusMutation.mutate({ id: o.id, status: v as OrderStatus, note: note || undefined })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ALL_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {STATUS_LABEL[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Optional note for the customer timeline"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Payment status</Label>
                  <Select
                    value={o.paymentStatus}
                    onValueChange={(v) =>
                      paymentMutation.mutate({
                        id: o.id,
                        paymentStatus: v as "pending" | "paid" | "failed" | "refunded",
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["pending", "paid", "failed", "refunded"].map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </Panel>
      ))}
    </div>
  );
}

const emptyProduct: AdminProduct = {
  id: "",
  slug: "",
  name: "",
  category: "business-essentials",
  price: 0,
  salePrice: null,
  imageUrl: "commercial",
  description: null,
  isQuoteOnly: false,
};

function ProductsTab() {
  const qc = useQueryClient();
  const list = useServerFn(listAdminProducts);
  const save = useServerFn(saveProduct);
  const remove = useServerFn(deleteProduct);
  const [draft, setDraft] = useState<AdminProduct | null>(null);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: () => list({}),
  });

  const saveMutation = useMutation({
    mutationFn: (p: AdminProduct) =>
      save({
        data: {
          ...(p.id ? { id: p.id } : {}),
          slug: p.slug,
          name: p.name,
          category: p.category,
          price: Number(p.price),
          salePrice: p.salePrice === null || Number.isNaN(p.salePrice) ? null : Number(p.salePrice),
          imageUrl: p.imageUrl,
          description: p.description,
          isQuoteOnly: p.isQuoteOnly,
        },
      }),
    onSuccess: () => {
      toast.success("Product saved.");
      setDraft(null);
      qc.invalidateQueries({ queryKey: ["admin-products"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => {
      toast.success("Product deleted.");
      qc.invalidateQueries({ queryKey: ["admin-products"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setDraft({ ...emptyProduct })}>
          New product
        </Button>
      </div>

      {draft && (
        <Panel>
          <form
            className="grid gap-4 md:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              saveMutation.mutate(draft);
            }}
          >
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input value={draft.slug} onChange={(e) => setDraft({ ...draft, slug: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Input
                value={draft.category}
                onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Image key (commercial, office, marketing, education, event, custom) or HTTPS image URL</Label>
              <Input
                value={draft.imageUrl ?? ""}
                onChange={(e) => setDraft({ ...draft, imageUrl: e.target.value || null })}
              />
            </div>
            <div className="space-y-2">
              <Label>Price (BDT)</Label>
              <Input
                type="number"
                min={0}
                value={draft.price}
                onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>Sale price (optional)</Label>
              <Input
                type="number"
                min={0}
                value={draft.salePrice ?? ""}
                onChange={(e) =>
                  setDraft({ ...draft, salePrice: e.target.value === "" ? null : Number(e.target.value) })
                }
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Short label / description</Label>
              <Textarea
                value={draft.description ?? ""}
                onChange={(e) => setDraft({ ...draft, description: e.target.value || null })}
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={draft.isQuoteOnly}
                onCheckedChange={(v) => setDraft({ ...draft, isQuoteOnly: v })}
                id="quote-only"
              />
              <Label htmlFor="quote-only">Quote only (no direct checkout)</Label>
            </div>
            <div className="flex justify-end gap-2 md:col-span-2">
              <Button type="button" variant="ghost" onClick={() => setDraft(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                Save product
              </Button>
            </div>
          </form>
        </Panel>
      )}

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading products…</p>
      ) : (
        <Panel>
          <div className="divide-y">
            {products.map((p) => (
              <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <p className="font-medium">
                    {p.name} {p.isQuoteOnly && <Badge variant="outline">Quote only</Badge>}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {p.category} · {p.slug} · {p.salePrice ? `${formatBDT(p.salePrice)} (was ${formatBDT(p.price)})` : formatBDT(p.price)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setDraft(p)}>
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      if (confirm(`Delete "${p.name}"?`)) deleteMutation.mutate(p.id);
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}

function EnquiriesTab() {
  const qc = useQueryClient();
  const list = useServerFn(listSubmissions);
  const setStatus = useServerFn(updateSubmissionStatus);
  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["admin-submissions"],
    queryFn: () => list({}),
  });

  const mutation = useMutation({
    mutationFn: (v: { id: string; status: "new" | "read" | "responded" }) => setStatus({ data: v }),
    onSuccess: () => {
      toast.success("Enquiry updated.");
      qc.invalidateQueries({ queryKey: ["admin-submissions"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading enquiries…</p>;
  if (rows.length === 0) return <Panel>No enquiries yet.</Panel>;

  return (
    <div className="space-y-4">
      {rows.map((s) => (
        <Panel key={s.id}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-medium">
                {s.name} <Badge variant={s.status === "new" ? "default" : "outline"}>{s.status}</Badge>
              </p>
              <p className="text-xs text-muted-foreground">
                {s.phone}
                {s.email ? ` · ${s.email}` : ""} · {fmtDate(s.createdAt)}
              </p>
            </div>
            <Select value={s.status} onValueChange={(v) => mutation.mutate({ id: s.id, status: v as "new" | "read" | "responded" })}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="read">Read</SelectItem>
                <SelectItem value="responded">Responded</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="mt-3 whitespace-pre-line text-sm text-muted-foreground">{s.message}</p>
        </Panel>
      ))}
    </div>
  );
}

const emptyTestimonial: AdminTestimonial = {
  id: "",
  customerName: "",
  company: null,
  quote: "",
  rating: 5,
  isPublished: false,
  createdAt: "",
};

function ReviewsTab() {
  const qc = useQueryClient();
  const list = useServerFn(listAdminTestimonials);
  const save = useServerFn(saveTestimonial);
  const remove = useServerFn(deleteTestimonial);
  const [draft, setDraft] = useState<AdminTestimonial | null>(null);

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["admin-testimonials"],
    queryFn: () => list({}),
  });

  const saveMutation = useMutation({
    mutationFn: (t: AdminTestimonial) =>
      save({
        data: {
          ...(t.id ? { id: t.id } : {}),
          customerName: t.customerName,
          company: t.company,
          quote: t.quote,
          rating: Number(t.rating),
          isPublished: t.isPublished,
        },
      }),
    onSuccess: () => {
      toast.success("Review saved.");
      setDraft(null);
      qc.invalidateQueries({ queryKey: ["admin-testimonials"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => {
      toast.success("Review deleted.");
      qc.invalidateQueries({ queryKey: ["admin-testimonials"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setDraft({ ...emptyTestimonial })}>
          New review
        </Button>
      </div>

      {draft && (
        <Panel>
          <form
            className="grid gap-4 md:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              saveMutation.mutate(draft);
            }}
          >
            <div className="space-y-2">
              <Label>Customer name</Label>
              <Input
                value={draft.customerName}
                onChange={(e) => setDraft({ ...draft, customerName: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Company (optional)</Label>
              <Input
                value={draft.company ?? ""}
                onChange={(e) => setDraft({ ...draft, company: e.target.value || null })}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Quote</Label>
              <Textarea value={draft.quote} onChange={(e) => setDraft({ ...draft, quote: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Rating (1–5)</Label>
              <Input
                type="number"
                min={1}
                max={5}
                value={draft.rating}
                onChange={(e) => setDraft({ ...draft, rating: Number(e.target.value) })}
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                id="published"
                checked={draft.isPublished}
                onCheckedChange={(v) => setDraft({ ...draft, isPublished: v })}
              />
              <Label htmlFor="published">Published on the site</Label>
            </div>
            <div className="flex justify-end gap-2 md:col-span-2">
              <Button type="button" variant="ghost" onClick={() => setDraft(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                Save review
              </Button>
            </div>
          </form>
        </Panel>
      )}

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading reviews…</p>
      ) : (
        <Panel>
          <div className="divide-y">
            {rows.map((t) => (
              <div key={t.id} className="flex flex-wrap items-start justify-between gap-3 py-3">
                <div className="max-w-2xl">
                  <p className="font-medium">
                    {t.customerName}
                    {t.company ? ` · ${t.company}` : ""}{" "}
                    <Badge variant={t.isPublished ? "default" : "outline"}>
                      {t.isPublished ? "Published" : "Draft"}
                    </Badge>
                  </p>
                  <p className="text-sm text-muted-foreground">“{t.quote}”</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setDraft(t)}>
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      if (confirm("Delete this review?")) deleteMutation.mutate(t.id);
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}

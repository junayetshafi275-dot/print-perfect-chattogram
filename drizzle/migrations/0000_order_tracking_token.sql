ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tracking_token text NOT NULL DEFAULT replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '');
CREATE UNIQUE INDEX IF NOT EXISTS orders_tracking_token_key ON public.orders (tracking_token);
CREATE INDEX IF NOT EXISTS orders_number_phone_idx ON public.orders (order_number, customer_phone_normalized);
COMMENT ON COLUMN public.orders.tracking_token IS 'Unguessable 256-bit token for public order tracking links; never shown to other customers.';
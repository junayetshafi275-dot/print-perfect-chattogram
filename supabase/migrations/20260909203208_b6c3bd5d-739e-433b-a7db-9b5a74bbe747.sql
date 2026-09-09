ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS customer_phone_normalized text
  GENERATED ALWAYS AS (right(regexp_replace(customer_phone, '[^0-9]', '', 'g'), 11)) STORED;

CREATE INDEX IF NOT EXISTS orders_customer_phone_normalized_idx
  ON public.orders (customer_phone_normalized);

CREATE INDEX IF NOT EXISTS orders_order_number_idx
  ON public.orders (order_number);

CREATE INDEX IF NOT EXISTS rate_limit_events_lookup_idx
  ON public.rate_limit_events (bucket, identifier, created_at DESC);

CREATE OR REPLACE FUNCTION public.consume_rate_limit(
  _bucket text,
  _identifier text,
  _limit integer,
  _window_minutes integer
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _used integer;
  _since timestamptz := now() - make_interval(mins => greatest(_window_minutes, 1));
BEGIN
  IF _bucket IS NULL OR _identifier IS NULL OR _limit IS NULL OR _limit < 1 THEN
    RETURN false;
  END IF;

  -- Serialise concurrent callers for this bucket+identifier so two requests
  -- cannot both read a below-limit count and then both insert.
  PERFORM pg_advisory_xact_lock(hashtextextended(_bucket || ':' || _identifier, 0));

  -- Opportunistic cleanup of expired rows (cheap amortised housekeeping).
  IF random() < 0.02 THEN
    DELETE FROM public.rate_limit_events WHERE created_at < now() - interval '24 hours';
  END IF;

  SELECT count(*) INTO _used
  FROM public.rate_limit_events
  WHERE bucket = _bucket
    AND identifier = _identifier
    AND created_at >= _since;

  IF _used >= _limit THEN
    RETURN false;
  END IF;

  INSERT INTO public.rate_limit_events (bucket, identifier)
  VALUES (_bucket, _identifier);

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.consume_rate_limit(text, text, integer, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.consume_rate_limit(text, text, integer, integer) FROM anon;
REVOKE ALL ON FUNCTION public.consume_rate_limit(text, text, integer, integer) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.consume_rate_limit(text, text, integer, integer) TO service_role;
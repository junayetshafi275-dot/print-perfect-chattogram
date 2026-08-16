REVOKE EXECUTE ON FUNCTION public.log_order_status_change() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM anon, authenticated, public;
GRANT EXECUTE ON FUNCTION public.log_order_status_change() TO service_role;
GRANT EXECUTE ON FUNCTION public.set_updated_at() TO service_role;
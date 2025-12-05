-- Ensure orders table has required auxiliary columns for shipping and cancellation
alter table public.orders
  add column if not exists shipping_status text,
  add column if not exists tracking_code text,
  add column if not exists cancellation_reason text;

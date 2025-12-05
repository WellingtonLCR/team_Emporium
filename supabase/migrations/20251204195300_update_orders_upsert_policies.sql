-- Update orders policies to allow owners (or anonymous orders) to update
alter policy "Users can update their own orders" on public.orders
  using (false);

drop policy if exists "Users can update their own orders" on public.orders;

drop policy if exists "Anyone can update orders" on public.orders;

do $$
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'orders'
      and column_name in ('shipping_status', 'tracking_code', 'cancellation_reason')
  ) then
    alter table public.orders
      add column if not exists shipping_status text,
      add column if not exists tracking_code text,
      add column if not exists cancellation_reason text;
  end if;
end $$;

create policy "Users can update their own orders"
  on public.orders
  for update
  using (
    (user_id is not null and auth.uid() = user_id)
    or (user_id is null and auth.role() = 'anonymous')
    or (auth.role() = 'service_role')
  )
  with check (
    (user_id is not null and auth.uid() = user_id)
    or (user_id is null and auth.role() = 'anonymous')
    or (auth.role() = 'service_role')
  );

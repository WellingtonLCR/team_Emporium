do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'orders' and policyname = 'Admins can view all orders'
  ) then
    create policy "Admins can view all orders"
      on public.orders
      for select
      using (
        exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
        or coalesce(auth.jwt()->>'role', auth.jwt()->>'user_role', auth.jwt()->>'app_role') = 'admin'
        or auth.role() = 'service_role'
      );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'order_items' and policyname = 'Admins can view all order items'
  ) then
    create policy "Admins can view all order items"
      on public.order_items
      for select
      using (
        exists (
          select 1
          from public.orders o
          where o.id = order_items.order_id
            and (
              exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
              or coalesce(auth.jwt()->>'role', auth.jwt()->>'user_role', auth.jwt()->>'app_role') = 'admin'
              or auth.role() = 'service_role'
            )
        )
      );
  end if;
end $$;


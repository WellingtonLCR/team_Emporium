-- Allow admin role to manage orders updates alongside owners
alter policy "Users can update their own orders" on public.orders
  using (
    (user_id is not null and auth.uid() = user_id)
    or (user_id is null and auth.role() = 'anonymous')
    or (auth.role() = 'service_role')
    or coalesce(auth.jwt()->>'role', auth.jwt()->>'user_role', auth.jwt()->>'app_role') = 'admin'
  )
  with check (
    (user_id is not null and auth.uid() = user_id)
    or (user_id is null and auth.role() = 'anonymous')
    or (auth.role() = 'service_role')
    or coalesce(auth.jwt()->>'role', auth.jwt()->>'user_role', auth.jwt()->>'app_role') = 'admin'
  );

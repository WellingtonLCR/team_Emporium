-- Update products policy to read role from user/app metadata
alter policy "Admins can manage products" on public.products using (false);

drop policy if exists "Admins can manage products" on public.products;

create policy "Admins can manage products"
  on public.products
  for all
  using (
    coalesce(
      auth.jwt() -> 'app_metadata' ->> 'role',
      auth.jwt() -> 'user_metadata' ->> 'role'
    ) = 'admin'
  )
  with check (
    coalesce(
      auth.jwt() -> 'app_metadata' ->> 'role',
      auth.jwt() -> 'user_metadata' ->> 'role'
    ) = 'admin'
  );

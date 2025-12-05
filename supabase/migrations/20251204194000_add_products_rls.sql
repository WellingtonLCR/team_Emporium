do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'products'
      and policyname = 'Admins can manage products'
  ) then
    -- Allow admins (role stored in metadata) to manage products
    create policy "Admins can manage products"
      on public.products
      for all
      using (
        coalesce(auth.jwt()->>'role', auth.jwt()->>'user_role', auth.jwt()->>'app_role') = 'admin'
      )
      with check (
        coalesce(auth.jwt()->>'role', auth.jwt()->>'user_role', auth.jwt()->>'app_role') = 'admin'
      );
  end if;
end $$;

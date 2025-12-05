do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'orders'
      and policyname = 'Users can update their own orders'
  ) then
    -- Allow authenticated users to update their own orders and cancel (status to cancelled)
    create policy "Users can update their own orders"
      on public.orders
      for update
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end $$;

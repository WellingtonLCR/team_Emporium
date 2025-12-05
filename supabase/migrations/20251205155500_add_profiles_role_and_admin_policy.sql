-- Add role column to profiles and allow admins to update any order via RLS
alter table public.profiles
  add column if not exists role text not null default 'user';

-- Mark current admin user as admin (adjust if needed)
update public.profiles set role = 'admin'
where id = 'f7f7f01c-b7fc-46ac-90c2-10d59639fd1d';

-- Expand the orders update policy to include admins based on profiles.role
alter policy "Users can update their own orders" on public.orders
  using (
    (user_id is not null and auth.uid() = user_id)
    or (user_id is null and auth.role() = 'anonymous')
    or (auth.role() = 'service_role')
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  )
  with check (
    (user_id is not null and auth.uid() = user_id)
    or (user_id is null and auth.role() = 'anonymous')
    or (auth.role() = 'service_role')
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

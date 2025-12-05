alter table public.profiles
  add column if not exists phone text,
  add column if not exists document text,
  add column if not exists birth_date date;

create unique index if not exists profiles_document_key on public.profiles ((lower(document))) where document is not null;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_birth_date text := coalesce(new.raw_user_meta_data->>'birth_date', new.raw_user_meta_data->>'birthDate');
  v_birth_date_cast date;
begin
  begin
    v_birth_date_cast := nullif(v_birth_date, '')::date;
  exception when others then
    v_birth_date_cast := null;
  end;

  insert into public.profiles (id, full_name, phone, document, birth_date)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'document',
    v_birth_date_cast
  )
  on conflict (id) do update
    set full_name = excluded.full_name,
        phone = excluded.phone,
        document = excluded.document,
        birth_date = excluded.birth_date,
        updated_at = timezone('utc'::text, now());

  return new;
end;
$$;

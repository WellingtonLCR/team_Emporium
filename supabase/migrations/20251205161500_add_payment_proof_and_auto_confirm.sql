-- Add column to store payment proof URL and auto-confirm payment when provided
alter table public.orders
  add column if not exists payment_proof_url text;

create or replace function public.on_orders_payment_proof_set()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if NEW.payment_proof_url is not null and coalesce(OLD.payment_proof_url,'') <> NEW.payment_proof_url then
    perform public.confirm_payment(NEW.id);
  end if;
  return NEW;
end;
$$;

drop trigger if exists trg_orders_payment_proof_paid on public.orders;
create trigger trg_orders_payment_proof_paid
  after update of payment_proof_url on public.orders
  for each row execute function public.on_orders_payment_proof_set();

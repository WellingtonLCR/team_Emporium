-- Function to increment product stock (supports positive and negative deltas)
create or replace function public.increment_product_stock(
  product_id uuid,
  quantity_to_increment integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  updated boolean;
  product_exists boolean;
begin
  update public.products
  set stock = stock + quantity_to_increment
  where id = product_id
    and (
      quantity_to_increment >= 0
      or stock >= abs(quantity_to_increment)
    )
  returning true into updated;

  if updated then
    return;
  end if;

  select exists(select 1 from public.products where id = product_id) into product_exists;

  if not product_exists then
    raise exception 'Product % not found', product_id;
  else
    raise exception 'Insufficient stock for product %', product_id;
  end if;
end;
$$;

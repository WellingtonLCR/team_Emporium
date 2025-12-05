-- Function to confirm payment and mark order as paid
create or replace function public.confirm_payment(
  p_order_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders%rowtype;
begin
  select * into v_order from public.orders where id = p_order_id for update;
  if not found then
    raise exception 'Pedido % não encontrado', p_order_id;
  end if;

  -- No-op if already paid/cancelled/delivered
  if v_order.status in ('paid', 'cancelled', 'delivered') then
    return;
  end if;

  update public.orders
    set status = 'paid',
        shipping_status = coalesce(shipping_status, 'processing')
    where id = p_order_id;
end;
$$;

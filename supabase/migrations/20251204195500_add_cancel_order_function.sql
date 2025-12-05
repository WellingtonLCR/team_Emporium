-- Function to cancel orders ensuring ownership and stock restoration
create or replace function public.cancel_order(
  p_order_id uuid,
  p_reason text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders%rowtype;
  v_current_user uuid := auth.uid();
  v_item record;
begin
  select * into v_order from public.orders where id = p_order_id for update;
  if not found then
    raise exception 'Pedido % não encontrado', p_order_id;
  end if;

  if v_order.status = 'cancelled' then
    raise exception 'Pedido % já está cancelado', p_order_id;
  end if;

  if v_order.user_id is not null then
    if v_current_user is null or v_current_user <> v_order.user_id then
      raise exception 'Sem permissão para cancelar este pedido';
    end if;
  else
    if auth.role() <> 'anonymous' then
      raise exception 'Sem permissão para cancelar pedido anônimo';
    end if;
  end if;

  update public.orders
    set status = 'cancelled',
        cancellation_reason = p_reason
    where id = p_order_id;

  for v_item in
    select product_id, quantity from public.order_items where order_id = p_order_id
  loop
    perform public.increment_product_stock(v_item.product_id, v_item.quantity);
  end loop;
end;
$$;

create or replace function public.create_order_with_items(
  p_user_id uuid,
  p_customer_data jsonb,
  p_payment_method text,
  p_items jsonb,
  p_subtotal numeric,
  p_shipping_cost numeric,
  p_total numeric
)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders;
  v_item jsonb;
  v_product_id uuid;
  v_quantity integer;
  v_product_price numeric;
  v_product_name text;
  v_product public.products%rowtype;
begin
  insert into public.orders (
    user_id,
    customer_name,
    customer_email,
    customer_phone,
    address_street,
    address_number,
    address_complement,
    address_neighborhood,
    address_city,
    address_state,
    address_zip,
    payment_method,
    subtotal,
    shipping_cost,
    total,
    status
  ) values (
    p_user_id,
    (p_customer_data ->> 'name'),
    (p_customer_data ->> 'email'),
    (p_customer_data ->> 'phone'),
    (p_customer_data ->> 'address'),
    (p_customer_data ->> 'number'),
    nullif(p_customer_data ->> 'complement', ''),
    (p_customer_data ->> 'neighborhood'),
    (p_customer_data ->> 'city'),
    (p_customer_data ->> 'state'),
    (p_customer_data ->> 'cep'),
    p_payment_method,
    p_subtotal,
    p_shipping_cost,
    p_total,
    'pending'
  )
  returning * into v_order;

  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'Nenhum item informado para o pedido %', v_order.id;
  end if;

  for v_item in select jsonb_array_elements(p_items)
  loop
    v_product_id := (v_item ->> 'id')::uuid;
    v_quantity := coalesce((v_item ->> 'quantity')::integer, 0);
    v_product_price := coalesce((v_item ->> 'price')::numeric, 0);
    v_product_name := v_item ->> 'name';

    if v_product_id is null then
      raise exception 'Item do pedido sem produto associado';
    end if;
    if v_quantity <= 0 then
      raise exception 'Quantidade inválida para o produto %', v_product_id;
    end if;

    select * into v_product
    from public.products
    where id = v_product_id
    for update;

    if not found then
      raise exception 'Produto % não encontrado', v_product_id;
    end if;

    if v_product.stock < v_quantity then
      raise exception 'Estoque insuficiente para o produto % (disponível: %)', v_product_name, v_product.stock;
    end if;

    update public.products
    set stock = stock - v_quantity
    where id = v_product_id;

    insert into public.order_items (
      order_id,
      product_id,
      product_name,
      product_price,
      quantity,
      subtotal
    ) values (
      v_order.id,
      v_product_id,
      coalesce(v_product_name, v_product.name),
      v_product_price,
      v_quantity,
      v_product_price * v_quantity
    );
  end loop;

  return v_order;
end;
$$;

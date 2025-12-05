-- Create products table
create table public.products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text not null,
  price decimal(10,2) not null,
  image text not null,
  category text not null,
  stock integer not null default 0,
  weight integer not null,
  rating decimal(2,1) not null default 0,
  reviews integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create orders table
create table public.orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  address_street text not null,
  address_number text not null,
  address_complement text,
  address_neighborhood text not null,
  address_city text not null,
  address_state text not null,
  address_zip text not null,
  payment_method text not null,
  subtotal decimal(10,2) not null,
  shipping_cost decimal(10,2) not null,
  total decimal(10,2) not null,
  status text not null default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create order_items table
create table public.order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references public.orders(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete restrict not null,
  product_name text not null,
  product_price decimal(10,2) not null,
  quantity integer not null,
  subtotal decimal(10,2) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Products policies (public read, admin write)
create policy "Anyone can view products"
  on public.products for select
  using (true);

-- Orders policies
create policy "Users can view their own orders"
  on public.orders for select
  using (auth.uid() = user_id or user_id is null);

create policy "Anyone can create orders"
  on public.orders for insert
  with check (true);

-- Order items policies
create policy "Users can view their order items"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
      and (orders.user_id = auth.uid() or orders.user_id is null)
    )
  );

create policy "Anyone can create order items"
  on public.order_items for insert
  with check (true);

-- Add triggers for updated_at
create trigger on_products_updated
  before update on public.products
  for each row execute procedure public.handle_updated_at();

-- Function to decrement product stock
create or replace function public.decrement_product_stock(
  product_id uuid,
  quantity_to_decrement integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.products
  set stock = stock - quantity_to_decrement
  where id = product_id and stock >= quantity_to_decrement;
  
  if not found then
    raise exception 'Insufficient stock for product %', product_id;
  end if;
end;
$$;

-- Insert initial products
insert into public.products (name, description, price, image, category, stock, weight, rating, reviews) values
('Chá Verde Orgânico', 'Chá verde premium cultivado organicamente', 29.90, 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?q=80&w=800', 'Verde', 50, 100, 4.8, 124),
('Chá Preto Earl Grey', 'Blend clássico com bergamota', 24.90, 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=800', 'Preto', 45, 100, 4.6, 98),
('Chá de Camomila', 'Relaxante natural para noites tranquilas', 19.90, 'https://images.unsplash.com/photo-1627398931065-00a9d2c8e94b?q=80&w=800', 'Herbal', 60, 50, 4.9, 156),
('Chá Oolong Premium', 'Semi-fermentado com notas florais', 34.90, 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?q=80&w=800', 'Oolong', 30, 100, 4.7, 87),
('Chá Branco Pai Mu Tan', 'Raro e delicado, rico em antioxidantes', 39.90, 'https://images.unsplash.com/photo-1563822249366-3efbb888eee3?q=80&w=800', 'Branco', 25, 50, 4.9, 145),
('Chá de Hibisco', 'Refrescante e rico em vitamina C', 22.90, 'https://images.unsplash.com/photo-1597318181592-63e32dec2e43?q=80&w=800', 'Herbal', 55, 100, 4.5, 112),
('Chá Verde Matcha', 'Pó de chá verde japonês premium', 49.90, 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?q=80&w=800', 'Verde', 20, 30, 5.0, 203),
('Chá Preto Darjeeling', 'O champanhe dos chás', 32.90, 'https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?q=80&w=800', 'Preto', 35, 100, 4.8, 134)
import React, { useMemo } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Ban, ShoppingBag, TrendingUp } from "lucide-react";

type Product = Tables<"products">;
type Order = Tables<"orders">;
type OrderItem = Tables<"order_items">;

function formatPrice(n: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);
}

const DashboardAdminPage = () => {
  const productsQuery = useQuery({
    queryKey: ["dash-products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*");
      if (error) throw error;
      return data as Product[];
    },
  });

  const ordersQuery = useQuery({
    queryKey: ["dash-orders"],
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("*");
      if (error) throw error;
      return data as Order[];
    },
  });

  const orderItemsQuery = useQuery({
    queryKey: ["dash-order-items"],
    queryFn: async () => {
      const { data, error } = await supabase.from("order_items").select("product_id,product_name,quantity");
      if (error) throw error;
      return data as OrderItem[];
    },
  });

  const totals = useMemo(() => {
    const products = productsQuery.data ?? [];
    const orders = ordersQuery.data ?? [];
    const lowStock = products.filter((p) => (p.stock ?? 0) <= 5).length;
    const revenue = orders
      .filter((o) => ["paid", "shipped", "delivered"].includes(o.status.toLowerCase()))
      .reduce((sum, o) => sum + (o.total ?? 0), 0);
    const pending = orders.filter((o) => o.status === "pending").length;
    const paid = orders.filter((o) => o.status === "paid").length;
    const cancelled = orders.filter((o) => o.status === "cancelled").length;
    const lastOrders = [...orders].sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0,5);
    return {
      products: products.length,
      orders: orders.length,
      lowStock,
      revenue,
      pending,
      paid,
      cancelled,
      lastOrders,
    };
  }, [productsQuery.data, ordersQuery.data]);

  const topProducts = useMemo(() => {
    const items = orderItemsQuery.data ?? [];
    const map = new Map<string, { name: string; qty: number }>();
    for (const it of items) {
      const key = it.product_id;
      const current = map.get(key) ?? { name: it.product_name, qty: 0 };
      current.qty += it.quantity;
      map.set(key, current);
    }
    return Array.from(map.values())
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  }, [orderItemsQuery.data]);

  return (
    <AdminLayout>
      <div className="mx-auto max-w-6xl p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="flex gap-2">
            <Button asChild><Link to="/admin/products">Gerenciar Produtos</Link></Button>
            <Button variant="secondary" asChild><Link to="/admin/orders">Gerenciar Pedidos</Link></Button>
            <Button variant="outline" asChild><Link to="/admin/users">Gerenciar Usuários</Link></Button>
          </div>
        </div>

        {/* KPIs principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pedidos</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ordersQuery.isLoading ? "—" : totals.orders}</div>
              <p className="text-xs text-muted-foreground">Total de pedidos</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Receita</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ordersQuery.isLoading ? "—" : formatPrice(totals.revenue)}</div>
              <p className="text-xs text-muted-foreground">Pago/Enviado/Entregue</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              <Clock className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ordersQuery.isLoading ? "—" : totals.pending}</div>
              <p className="text-xs text-muted-foreground">Aguardando aprovação</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Estoque baixo (≤5)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{productsQuery.isLoading ? "—" : totals.lowStock}</div>
              <p className="text-xs text-muted-foreground">Produtos para repor</p>
            </CardContent>
          </Card>
        </div>

        {/* Status snapshot */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Pagos</CardTitle></CardHeader>
            <CardContent className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-600" /><span className="text-xl font-semibold">{ordersQuery.isLoading ? "—" : totals.paid}</span></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Pendentes</CardTitle></CardHeader>
            <CardContent className="flex items-center gap-2"><Clock className="h-4 w-4 text-amber-600" /><span className="text-xl font-semibold">{ordersQuery.isLoading ? "—" : totals.pending}</span></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Cancelados</CardTitle></CardHeader>
            <CardContent className="flex items-center gap-2"><Ban className="h-4 w-4 text-rose-600" /><span className="text-xl font-semibold">{ordersQuery.isLoading ? "—" : totals.cancelled}</span></CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-semibold mb-3">Últimos pedidos</h2>
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/30">
                <tr>
                  <th className="text-left p-3">ID</th>
                  <th className="text-left p-3">Cliente</th>
                  <th className="text-left p-3">Total</th>
                  <th className="text-left p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {ordersQuery.isLoading ? (
                  <tr><td className="p-3" colSpan={4}>Carregando...</td></tr>
                ) : totals.lastOrders.length === 0 ? (
                  <tr><td className="p-3" colSpan={4}>Sem pedidos</td></tr>
                ) : (
                  totals.lastOrders.map((o) => (
                    <tr key={o.id} className="border-b last:border-0">
                      <td className="p-3 font-mono text-xs">{o.id.slice(0,8).toUpperCase()}</td>
                      <td className="p-3">{o.customer_name}</td>
                      <td className="p-3">{formatPrice(o.total)}</td>
                      <td className="p-3">
                        <Badge variant="outline" className={
                          o.status === 'paid' ? 'bg-green-50 text-green-700 border-green-200' :
                          o.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          o.status === 'cancelled' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-slate-50 text-slate-700 border-slate-200'
                        }>
                          {o.status}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-3">Top Produtos por Vendas</h2>
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/30">
                <tr>
                  <th className="text-left p-3">Produto</th>
                  <th className="text-left p-3">Quantidade</th>
                </tr>
              </thead>
              <tbody>
                {orderItemsQuery.isLoading ? (
                  <tr><td className="p-3" colSpan={2}>Carregando...</td></tr>
                ) : topProducts.length === 0 ? (
                  <tr><td className="p-3" colSpan={2}>Sem vendas</td></tr>
                ) : (
                  topProducts.map((p) => (
                    <tr key={p.name} className="border-b last:border-0">
                      <td className="p-3">{p.name}</td>
                      <td className="p-3">{p.qty}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default DashboardAdminPage;

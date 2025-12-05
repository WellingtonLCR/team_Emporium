import React, { useMemo, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Eye, Trash2, Check, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export type Order = Tables<"orders">;
export type OrderItem = Tables<"order_items">;

const STATUSES = ["pending", "paid", "shipped", "delivered", "cancelled"] as const;

const STATUS_LABELS: Record<Order["status"], string> = {
  pending: "Pendente",
  paid: "Pago",
  shipped: "Enviado",
  delivered: "Entregue",
  cancelled: "Cancelado",
};

const STATUS_STYLES: Record<Order["status"], string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  paid: "bg-green-50 text-green-700 border-green-200",
  shipped: "bg-blue-50 text-blue-700 border-blue-200",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-rose-50 text-rose-700 border-rose-200",
};

function formatPrice(n: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);
}

const OrdersAdminPage = () => {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [viewing, setViewing] = useState<Order | null>(null);
  const [deleting, setDeleting] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | Order["status"]>("all");

  React.useEffect(() => {
    const channel = supabase
      .channel('admin-orders-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => qc.invalidateQueries({ queryKey: ['orders'] }),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);

  const ordersQuery = useQuery({
    queryKey: ["orders"],
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: 5000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Order[];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ order, status }: { order: Order; status: Order["status"] }) => {
      const prevStatus = order.status;

      const { error } = await supabase.from("orders").update({ status }).eq("id", order.id);
      if (error) throw error;

      if (status === "cancelled" && prevStatus !== "cancelled") {
        const { data: items, error: itErr } = await supabase
          .from("order_items")
          .select("product_id, quantity")
          .eq("order_id", order.id);
        if (itErr) throw itErr;
        if (Array.isArray(items)) {
          for (const it of items) {
            try {
              const { error: rpcErr } = await supabase.rpc("increment_product_stock", {
                product_id: it.product_id,
                quantity_to_increment: it.quantity,
              });
              if (rpcErr) throw rpcErr;
            } catch {
              await supabase
                .from("products")
                .update({ stock: (supabase as any).sql`stock + ${it.quantity}` })
                .eq("id", it.product_id);
            }
            try {
              await (supabase as any)
                .from("stock_movements")
                .insert({ product_id: it.product_id, quantity: Math.abs(it.quantity), type: "in", reason: "order_cancelled_admin" });
            } catch {}
          }
        }
      }

      if (prevStatus !== status) {
        try {
          await supabase.functions.invoke("order-status-email", {
            body: {
              email: order.customer_email,
              name: order.customer_name,
              orderId: order.id,
              status,
              total: order.total,
            },
          });
        } catch (emailErr) {
          console.error("Falha ao enviar e-mail de atualização de status", emailErr);
        }
      }

      return { prevStatus, status, order };
    },
    onMutate: async ({ order, status }) => {
      await qc.cancelQueries({ queryKey: ["orders"] });
      const previous = qc.getQueryData<Order[]>(["orders"]);
      if (previous) {
        qc.setQueryData<Order[]>(["orders"], (old) =>
          (old ?? []).map((o) => (o.id === order.id ? { ...o, status } : o))
        );
      }
      return { previous } as { previous?: Order[] };
    },
    onSuccess: (_result, variables) => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      if (variables.order.user_id) {
        qc.invalidateQueries({ queryKey: ["my-orders", variables.order.user_id] });
      } else {
        qc.invalidateQueries({ queryKey: ["my-orders"] });
      }
      const label = STATUS_LABELS[variables.status] ?? variables.status;
      toast.success(`Status atualizado para ${label}`);
    },
    onError: (e: unknown, _vars, context) => {
      if (context && (context as any).previous) {
        qc.setQueryData(["orders"], (context as any).previous);
      }
      toast.error(e instanceof Error ? e.message : "Erro ao atualizar status");
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
    },
  });

  const deleteOrder = useMutation({
    mutationFn: async (id: string) => {
      const { error: errItems } = await supabase.from("order_items").delete().eq("order_id", id);
      if (errItems) throw errItems;
      const { error: errOrder } = await supabase.from("orders").delete().eq("id", id);
      if (errOrder) throw errOrder;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Pedido removido");
      setDeleting(null);
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Erro ao remover pedido"),
  });

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    const orders = ordersQuery.data ?? [];
    const matchText = (o: Order) =>
      !s ||
      o.customer_name.toLowerCase().includes(s) ||
      o.customer_email.toLowerCase().includes(s) ||
      o.id.toLowerCase().includes(s) ||
      o.status.toLowerCase().includes(s);
    return orders.filter(
      (o) => matchText(o) && (statusFilter === "all" || o.status === statusFilter)
    );
  }, [ordersQuery.data, search, statusFilter]);

  return (
    <AdminLayout>
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h1 className="text-2xl font-bold">Pedidos</h1>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Buscar por cliente, e-mail, status ou ID"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64 md:w-80"
          />
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Filtrar status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-44">ID</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead className="w-28">Pagamento</TableHead>
              <TableHead className="w-28">Total</TableHead>
              <TableHead className="w-44">Status</TableHead>
              <TableHead className="w-40">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ordersQuery.isLoading ? (
              <TableRow>
                <TableCell colSpan={7}>Carregando...</TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7}>Nenhum pedido encontrado</TableCell>
              </TableRow>
            ) : (
              filtered.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-mono text-xs">{o.id.slice(0, 8).toUpperCase()}</TableCell>
                  <TableCell>{o.customer_name}</TableCell>
                  <TableCell>{o.customer_email}</TableCell>
                  <TableCell className="uppercase text-xs">{o.payment_method}</TableCell>
                  <TableCell>{formatPrice(o.total)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 min-w-[12rem]">
                      <Badge variant="outline" className={STATUS_STYLES[o.status]}>
                        {STATUS_LABELS[o.status]}
                      </Badge>
                      <Select
                        value={o.status}
                        onValueChange={(v) => updateStatus.mutate({ order: o, status: v as Order["status"] })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um status" />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUSES.map((s) => (
                            <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {o.status !== "paid" && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => updateStatus.mutate({ order: o, status: "paid" })}>
                              <Check className="mr-1 h-4 w-4" /> Aprovar
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Marcar como pago</TooltipContent>
                        </Tooltip>
                      )}
                      {Boolean((o as any).payment_proof_url) && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <a
                              href={(o as any).payment_proof_url as string}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-sm"
                            >
                              <LinkIcon className="h-4 w-4" /> Comprovante
                            </a>
                          </TooltipTrigger>
                          <TooltipContent>Ver comprovante enviado</TooltipContent>
                        </Tooltip>
                      )}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setViewing(o)}>
                            <Eye className="mr-1 h-4 w-4" /> Ver
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Detalhes do pedido</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="destructive" size="sm" onClick={() => setDeleting(o)}>
                            <Trash2 className="mr-1 h-4 w-4" /> Remover
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Remover pedido</TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ViewOrderDialog order={viewing} onOpenChange={(open) => !open && setViewing(null)} />

      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover pedido</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Tem certeza que deseja remover o pedido {deleting?.id}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleting && deleteOrder.mutate(deleting.id)}>
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
    </AdminLayout>
  );
};

function ViewOrderDialog({ order, onOpenChange }: { order: Order | null; onOpenChange: (open: boolean) => void }) {
  const itemsQuery = useQuery({
    queryKey: ["order-items", order?.id],
    queryFn: async () => {
      if (!order) return [] as OrderItem[];
      const { data, error } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", order.id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as OrderItem[];
    },
    enabled: !!order,
  });

  return (
    <Dialog open={!!order} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Pedido {order?.id.slice(0, 8).toUpperCase()}</DialogTitle>
        </DialogHeader>
        {order ? (
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div><span className="text-muted-foreground">Cliente:</span> {order.customer_name}</div>
                <div><span className="text-muted-foreground">E-mail:</span> {order.customer_email}</div>
                <div><span className="text-muted-foreground">Telefone:</span> {order.customer_phone}</div>
              </div>
              <div>
                <div><span className="text-muted-foreground">Pagamento:</span> {order.payment_method.toUpperCase()}</div>
                <div><span className="text-muted-foreground">Status:</span> {order.status}</div>
                <div><span className="text-muted-foreground">Criado em:</span> {new Date(order.created_at).toLocaleString("pt-BR")}</div>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead className="w-24">Qtd</TableHead>
                    <TableHead className="w-28">Preço</TableHead>
                    <TableHead className="w-28">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {itemsQuery.isLoading ? (
                    <TableRow><TableCell colSpan={4}>Carregando itens...</TableCell></TableRow>
                  ) : itemsQuery.data && itemsQuery.data.length > 0 ? (
                    itemsQuery.data.map((it) => (
                      <TableRow key={it.id}>
                        <TableCell>{it.product_name}</TableCell>
                        <TableCell>{it.quantity}</TableCell>
                        <TableCell>{formatPrice(it.product_price)}</TableCell>
                        <TableCell>{formatPrice(it.subtotal)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow><TableCell colSpan={4}>Sem itens</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium">Endereço</div>
                <div>{order.address_street}, {order.address_number}</div>
                {order.address_complement ? <div>{order.address_complement}</div> : null}
                <div>{order.address_neighborhood} - {order.address_city}/{order.address_state} - CEP {order.address_zip}</div>
              </div>
              <div className="text-right">
                <div><span className="text-muted-foreground">Subtotal:</span> {formatPrice(order.subtotal)}</div>
                <div><span className="text-muted-foreground">Frete:</span> {formatPrice(order.shipping_cost)}</div>
                <div className="font-semibold">Total: {formatPrice(order.total)}</div>
              </div>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

export default OrdersAdminPage;

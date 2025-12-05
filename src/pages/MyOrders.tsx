import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Tables } from "@/integrations/supabase/types";
import {
  Loader2,
  Package,
  CreditCard,
  CalendarClock,
  ShoppingBasket,
  ChevronDown,
  ChevronUp,
  Truck,
  ClipboardCopy,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartProvider } from "@/contexts/CartContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const statusLabels: Record<string, string> = {
  pending: "Pendente",
  paid: "Pago",
  shipped: "Enviado",
  delivered: "Entregue",
  cancelled: "Cancelado",
};

const statusStyles: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-blue-100 text-blue-800",
  shipped: "bg-sky-100 text-sky-800",
  delivered: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-800",
};

const formatPrice = (price: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(price);

const formatDate = (date: string) =>
  new Date(date).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const paymentMethodLabels: Record<string, string> = {
  credit_card: "Cartão de crédito",
  pix: "Pix",
  boleto: "Boleto",
  cash: "Dinheiro",
};

const shippingStatusLabels: Record<string, string> = {
  processing: "Em preparação",
  shipped: "Enviado",
  out_for_delivery: "Saiu para entrega",
  delivered: "Entregue",
  pending: "Preparando envio",
};

const shippingStatusStyles: Record<string, string> = {
  processing: "bg-amber-100 text-amber-800",
  shipped: "bg-blue-100 text-blue-800",
  out_for_delivery: "bg-indigo-100 text-indigo-800",
  delivered: "bg-emerald-100 text-emerald-800",
  pending: "bg-amber-100 text-amber-800",
};

const cancellationReasons = [
  { value: "change_of_mind", label: "Mudei de ideia" },
  { value: "found_better_price", label: "Encontrei um preço melhor" },
  { value: "delivery_time", label: "Prazo de entrega muito longo" },
  { value: "ordered_wrong_item", label: "Pedi o item errado" },
  { value: "other", label: "Outro motivo" },
];

type OrderWithItems = Tables<"orders"> & {
  shipping_status: string | null;
  tracking_code: string | null;
  cancellation_reason: string | null;
  order_items: {
    id: string;
    product_name: string;
    quantity: number;
  }[];
};

type SupabaseOrderRow = Omit<OrderWithItems, "order_items"> & {
  order_items: OrderWithItems["order_items"] | null;
};

const MyOrders = () => {
  const { user } = useAuth();
  const [expandedOrders, setExpandedOrders] = React.useState<Record<string, boolean>>({});
  const [cancelDialogOrder, setCancelDialogOrder] = React.useState<OrderWithItems | null>(null);
  const [selectedReason, setSelectedReason] = React.useState<string>(cancellationReasons[0]?.value ?? "");
  const [customReason, setCustomReason] = React.useState("");

  const queryClient = useQueryClient();
  const location = useLocation();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel(`orders-realtime-${user.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: `user_id=eq.${user.id}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ['my-orders', user.id] });
        },
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders', filter: `user_id=eq.${user.id}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ['my-orders', user.id] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

  React.useEffect(() => {
    if (location.hash === '#products') {
      navigate('/#products', { replace: true });
    }
  }, [location, navigate]);

  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  const cancelOrderMutation = useMutation({
    mutationFn: async (payload: { orderId: string; reason: string }) => {
      const { error } = await supabase.rpc("cancel_order", {
        p_order_id: payload.orderId,
        p_reason: payload.reason,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Pedido cancelado com sucesso.");
      queryClient.invalidateQueries({ queryKey: ["my-orders", user?.id] });
      setCancelDialogOrder(null);
      setSelectedReason(cancellationReasons[0]?.value ?? "");
      setCustomReason("");
    },
    onError: () => {
      toast.error("Não foi possível cancelar o pedido. Tente novamente.");
    },
  });

  const handleCopyTracking = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success("Código de rastreio copiado.");
    } catch (error) {
      toast.error("Não foi possível copiar o código agora.");
      console.error(error);
    }
  };

  const handleConfirmCancellation = () => {
    if (!cancelDialogOrder) return;

    const reasonLabel =
      selectedReason === "other"
        ? customReason.trim()
        : cancellationReasons.find((option) => option.value === selectedReason)?.label ?? "";

    if (!reasonLabel) {
      toast.error("Escolha ou preencha um motivo para cancelar.");
      return;
    }

    cancelOrderMutation.mutate({ orderId: cancelDialogOrder.id, reason: reasonLabel });
  };

  const isOtherReason = selectedReason === "other";

  const { data, isLoading, isError } = useQuery({
    queryKey: ["my-orders", user?.id],
    enabled: !!user?.id,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: 5000,
    queryFn: async () => {
      const advancedSelect = `
        id,
        created_at,
        status,
        total,
        payment_method,
        shipping_status,
        tracking_code,
        cancellation_reason,
        order_items (
          id,
          product_name,
          quantity
        )
      `;

      const baseResponse = await supabase
        .from("orders")
        .select(advancedSelect)
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });

      const normalize = (orders: SupabaseOrderRow[]): OrderWithItems[] =>
        orders.map((order) => ({
          ...order,
          shipping_status: order.shipping_status ?? null,
          tracking_code: order.tracking_code ?? null,
          cancellation_reason: order.cancellation_reason ?? null,
          order_items: order.order_items ?? [],
        }));

      if (!baseResponse.error) {
        const rawOrders = (baseResponse.data ?? []) as SupabaseOrderRow[];
        return normalize(rawOrders);
      }

      console.warn("Falling back to legacy orders query", baseResponse.error);

      const fallbackResponse = await supabase
        .from("orders")
        .select(
          `
            id,
            created_at,
            status,
            total,
            payment_method,
            order_items (
              id,
              product_name,
              quantity
            )
          `
        )
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });

      if (fallbackResponse.error) {
        throw fallbackResponse.error;
      }

      const fallbackOrders = (fallbackResponse.data ?? []).map((order) => ({
        ...(order as SupabaseOrderRow),
        shipping_status: null,
        tracking_code: null,
        cancellation_reason: null,
      }));

      return normalize(fallbackOrders as SupabaseOrderRow[]);
    },
  });

  if (!user) {
    return null;
  }

  return (
    <CartProvider>
      <div className="min-h-screen bg-white">
        <Header onSearch={() => {}} />
        <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-green-900 sm:text-3xl">Meus pedidos</h1>
              <p className="text-sm text-green-700/80 sm:text-base">
                Acompanhe o andamento das suas compras e confira os detalhes de cada pedido.
              </p>
            </div>
            <Button asChild variant="outline" className="border-green-200 text-green-800 hover:text-green-900">
              <Link to="/#products">Continuar comprando</Link>
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center gap-3 rounded-xl border border-green-100 bg-white p-6 text-green-700">
              <Loader2 className="h-5 w-5 animate-spin" />
              Carregando seus pedidos...
            </div>
          ) : isError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
              Não foi possível carregar os pedidos. Tente novamente em instantes.
            </div>
          ) : data && data.length > 0 ? (
            <div className="space-y-5">
              {data.map((order) => {
                const status = order.status.toLowerCase();
                const label = statusLabels[status] ?? order.status;
                const badgeClass = statusStyles[status] ?? "bg-gray-100 text-gray-700";
                const isExpanded = !!expandedOrders[order.id];
                const paymentLabel = paymentMethodLabels[order.payment_method ?? ""] ?? "Não informado";
                const totalItems = order.order_items.reduce((sum, item) => sum + item.quantity, 0);

                return (
                  <div
                    key={order.id}
                    className="rounded-2xl border border-green-100 bg-white/90 p-5 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex flex-wrap items-center gap-2 text-sm text-green-800">
                        <Badge variant="secondary" className={`text-xs ${badgeClass}`}>
                          {label}
                        </Badge>
                        <span className="flex items-center gap-2">
                          <CalendarClock className="h-4 w-4 text-green-500" />
                          {formatDate(order.created_at)}
                        </span>
                        <span className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-green-500" />
                          ID {order.id.slice(0, 8).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex flex-col items-start gap-3 sm:items-end">
                        <div className="flex items-center gap-2 text-lg font-semibold text-green-900">
                          <CreditCard className="h-5 w-5" />
                          {formatPrice(order.total ?? 0)}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-green-200 text-green-800 hover:text-green-900"
                            onClick={() => toggleOrderDetails(order.id)}
                            aria-expanded={isExpanded}
                          >
                            {isExpanded ? (
                              <>
                                Ocultar detalhes
                                <ChevronUp className="ml-2 h-4 w-4" />
                              </>
                            ) : (
                              <>
                                Ver detalhes
                                <ChevronDown className="ml-2 h-4 w-4" />
                              </>
                            )}
                          </Button>
                          {status !== "cancelled" && status !== "delivered" && status !== "shipped" ? (
                            <Button
                              variant="destructive"
                              size="sm"
                              className="bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800"
                              onClick={() => {
                                setCancelDialogOrder(order);
                                setSelectedReason(cancellationReasons[0]?.value ?? "");
                                setCustomReason("");
                              }}
                              disabled={cancelOrderMutation.isPending}
                            >
                              Cancelar pedido
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    {isExpanded ? (
                      <div className="mt-5 space-y-4 rounded-xl border border-green-100 bg-green-50/60 p-4">
                        {status === "cancelled" && order.cancellation_reason ? (
                          <div className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
                            <span className="font-medium">Motivo do cancelamento:</span> {order.cancellation_reason}
                          </div>
                        ) : null}

                        <div className="flex flex-col gap-2 text-sm text-green-800 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-green-500" />
                            <span className="font-medium">Forma de pagamento:</span>
                            <span>{paymentLabel}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <ShoppingBasket className="h-4 w-4 text-green-500" />
                            <span className="font-medium">Total de itens:</span>
                            <span>{totalItems}</span>
                          </div>
                        </div>

                        <div className="rounded-lg border border-green-100 bg-white/70 px-4 py-3">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-2 text-sm font-medium text-green-900">
                              <Truck className="h-4 w-4 text-green-500" />
                              Status de envio
                            </div>
                            {(() => {
                              const key = (order.shipping_status ?? "processing").toLowerCase();
                              const badgeStyle = shippingStatusStyles[key] ?? "bg-gray-100 text-gray-700";
                              const badgeLabel = shippingStatusLabels[key] ?? "Em preparação";
                              return (
                                <Badge variant="secondary" className={`text-xs ${badgeStyle}`}>
                                  {badgeLabel}
                                </Badge>
                              );
                            })()}
                          </div>
                          {order.tracking_code ? (
                            <div className="mt-3 flex flex-col gap-2 text-sm text-green-800 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <span className="font-medium">Código de rastreio:</span> {order.tracking_code}
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="flex items-center gap-2 text-green-700 hover:text-green-900"
                                onClick={() => handleCopyTracking(order.tracking_code ?? "")}
                              >
                                Copiar
                                <ClipboardCopy className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <p className="mt-3 text-sm text-green-700">
                              O código de rastreio será exibido aqui assim que o pedido for despachado.
                            </p>
                          )}
                        </div>

                        {order.order_items.length > 0 ? (
                          <div>
                            <h3 className="text-sm font-medium text-green-900 flex items-center gap-2">
                              <ShoppingBasket className="h-4 w-4" /> Itens do pedido
                            </h3>
                            <ul className="mt-3 space-y-2 text-sm text-green-800">
                              {order.order_items.map((item) => (
                                <li key={item.id} className="flex flex-col gap-1 rounded-lg bg-white/80 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
                                  <span className="font-medium text-green-900">{item.product_name}</span>
                                  <span className="text-green-600">Quantidade: {item.quantity}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : (
                          <p className="text-sm text-green-700">Nenhum item encontrado para este pedido.</p>
                        )}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-green-100 bg-white p-8 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <Package className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="text-lg font-semibold text-green-900">Você ainda não tem pedidos</h2>
              <p className="mt-2 text-sm text-green-700/80">
                Explore nossos chás especiais e finalize uma compra para acompanhar seus pedidos aqui.
              </p>
              <Button asChild className="mt-4 bg-green-600 hover:bg-green-700">
                <Link to="/#products">Ver produtos</Link>
              </Button>
            </div>
          )}
        </main>
        <Footer />
      </div>
      <CancelDialog
        open={!!cancelDialogOrder}
        onOpenChange={(open) => {
          if (!open) {
            setCancelDialogOrder(null);
            setSelectedReason(cancellationReasons[0]?.value ?? "");
            setCustomReason("");
          }
        }}
        onConfirm={handleConfirmCancellation}
        isLoading={cancelOrderMutation.isPending}
        selectedReason={selectedReason}
        onReasonChange={(value) => setSelectedReason(value)}
        isOtherReason={isOtherReason}
        customReason={customReason}
        onCustomReasonChange={(value) => setCustomReason(value)}
      />
    </CartProvider>
  );
};

export default MyOrders;

const CancelDialog = ({
  open,
  onOpenChange,
  onConfirm,
  isLoading,
  selectedReason,
  onReasonChange,
  isOtherReason,
  customReason,
  onCustomReasonChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading: boolean;
  selectedReason: string;
  onReasonChange: (value: string) => void;
  isOtherReason: boolean;
  customReason: string;
  onCustomReasonChange: (value: string) => void;
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle>Cancelar pedido</DialogTitle>
        <DialogDescription>
          Escolha o motivo do cancelamento para que possamos melhorar sua experiência nas próximas compras.
        </DialogDescription>
      </DialogHeader>

      <RadioGroup value={selectedReason} onValueChange={onReasonChange} className="space-y-3">
        {cancellationReasons.map((reason) => (
          <div key={reason.value} className="flex items-start gap-3 rounded-lg border border-green-100 bg-green-50/70 p-3">
            <RadioGroupItem value={reason.value} id={`reason-${reason.value}`} className="mt-1" />
            <Label htmlFor={`reason-${reason.value}`} className="text-sm text-green-900">
              {reason.label}
            </Label>
          </div>
        ))}
      </RadioGroup>

      {isOtherReason ? (
        <div className="grid gap-2">
          <Label htmlFor="custom-reason" className="text-sm font-medium text-green-900">
            Conte-nos o motivo
          </Label>
          <Textarea
            id="custom-reason"
            placeholder="Descreva o motivo do cancelamento"
            value={customReason}
            onChange={(event) => onCustomReasonChange(event.target.value)}
            className="border-green-200 focus:border-green-400 focus:ring-green-200"
            rows={3}
          />
        </div>
      ) : null}

      <DialogFooter className="mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange(false)}
          disabled={isLoading}
        >
          Voltar
        </Button>
        <Button type="button" onClick={onConfirm} disabled={isLoading} className="bg-red-600 hover:bg-red-700">
          {isLoading ? "Cancelando..." : "Confirmar cancelamento"}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

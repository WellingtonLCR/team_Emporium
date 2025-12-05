import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CartItem } from '@/types/product';
import { toast } from 'sonner';

interface CheckoutData {
  customerData: {
    name: string;
    email: string;
    phone: string;
    address: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    cep: string;
  };
  paymentMethod: string;
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
}

export const useCheckout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CheckoutData) => {
      const { data: authResult } = await supabase.auth.getUser();

      const { data: order, error } = await supabase.rpc('create_order_with_items', {
        p_user_id: authResult.user?.id ?? null,
        p_customer_data: data.customerData,
        p_payment_method: data.paymentMethod,
        p_items: data.items.map(item => ({
          id: item.id,
          quantity: item.quantity,
          price: item.price,
          name: item.name,
        })),
        p_subtotal: data.subtotal,
        p_shipping_cost: data.shippingCost,
        p_total: data.total,
      });

      if (error) {
        console.error('Erro ao criar pedido transacional:', error);
        throw error;
      }

      if (!order) {
        throw new Error('Nenhuma informação retornada do pedido.');
      }

      return order;
    },
    onSuccess: async (order, variables) => {
      try {
        // Métodos imediatos: marcar como pago logo após criar pedido
        if (['credit', 'pix'].includes(variables.paymentMethod)) {
          const { error: payErr } = await supabase.rpc('confirm_payment', { p_order_id: order.id });
          if (payErr) console.error('Falha ao confirmar pagamento automaticamente:', payErr);
        }
      } finally {
        // Atualizar estoques e pedidos do usuário
        queryClient.invalidateQueries({ queryKey: ['products'] });
        const { data: authInfo } = await supabase.auth.getUser();
        if (authInfo.user?.id) {
          queryClient.invalidateQueries({ queryKey: ['my-orders', authInfo.user.id] });
        }
        toast.success('Pedido realizado com sucesso!');
      }
    },
    onError: (error: Error) => {
      console.error('Erro no checkout:', error);
      toast.error(error.message || 'Erro ao processar pedido');
    }
  });
};

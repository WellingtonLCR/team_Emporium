import React, { useState, useEffect, useRef } from 'react';
import { CreditCard, MapPin, User, Phone, Mail, CheckCircle, Copy, QrCode, FileText, Landmark } from 'lucide-react';
import QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CartItem } from '@/types/product';
import { useCart } from '@/contexts/CartContext';
import { useCheckout } from '@/hooks/useCheckout';
import { toast } from 'sonner';

interface CheckoutModalProps {
  open: boolean;
  onClose: () => void;
  total: number;
  items: CartItem[];
  shippingCost: number;
}

export const CheckoutModal = ({ open, onClose, total, items, shippingCost }: CheckoutModalProps) => {
  const { clearCart } = useCart();
  const checkout = useCheckout();
  const [currentStep, setCurrentStep] = useState(1);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState('');

  const [customerData, setCustomerData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    cep: ''
  });

  const [paymentData, setPaymentData] = useState({
    method: '',
    cardNumber: '',
    cardName: '',
    cardExpiry: '',
    cardCvc: '',
    installments: '1'
  });

  const [pixCode, setPixCode] = useState('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [boletoLine, setBoletoLine] = useState('34191.79001 01043.510047 91020.150008 1 88650000012345');
  const [transferText] = useState('Banco do Brasil 001 | Ag 1234-5 | Cc 67890-1 | Fav: CHÁ PREMIUM STORE | CNPJ: 12.345.678/0001-99');
  const [proofUploading, setProofUploading] = useState(false);
  const [proofUrl, setProofUrl] = useState('');
  const boletoSvgRef = useRef<SVGSVGElement | null>(null);
  const transferInputRef = useRef<HTMLInputElement | null>(null);
  const transferCompleteInputRef = useRef<HTMLInputElement | null>(null);

  const getBoletoBarcodeDataUrl = (digits: string) => {
    try {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      JsBarcode(svg, digits, {
        format: 'CODE128',
        lineColor: '#111',
        width: 2,
        height: 60,
        displayValue: false,
        margin: 0,
      });
      const xml = new XMLSerializer().serializeToString(svg);
      const base64 = btoa(unescape(encodeURIComponent(xml)));
      return `data:image/svg+xml;base64,${base64}`;
    } catch {
      return '';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const openBoletoPdf = () => {
    const due = new Date();
    due.setDate(due.getDate() + 2);
    const dueStr = due.toLocaleDateString('pt-BR');
    const digits = (boletoLine || '').replace(/\D/g, '');
    const barcodeUrl = digits ? getBoletoBarcodeDataUrl(digits) : '';
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<!doctype html><html><head><meta charset="utf-8" /><title>Boleto - TeaShop</title>
      <style>body{font-family:Arial,Helvetica,sans-serif;color:#111;margin:24px} .box{border:1px solid #ccc;border-radius:8px;padding:16px} .row{display:flex;justify-content:space-between;margin-bottom:8px} .mono{font-family:monospace} .muted{color:#666;font-size:12px} .center{display:flex;justify-content:center;}</style>
      </head><body>
      <h2>TeaShop · Boleto Bancário</h2>
      <div class="box">
        <div class="row"><strong>Valor:</strong> <span>${formatPrice(total)}</span></div>
        <div class="row"><strong>Vencimento:</strong> <span>${dueStr}</span></div>
        <div class="row"><strong>Beneficiário:</strong> <span>CHÁ PREMIUM STORE · CNPJ 12.345.678/0001-99</span></div>
        <div class="row"><strong>Pagador:</strong> <span>${customerData.name || 'Cliente'}</span></div>
        <div class="row"><strong>Linha Digitável:</strong></div>
        <div class="mono" style="word-break:break-all">${boletoLine}</div>
        ${barcodeUrl ? `<div class="center" style="margin-top:12px"><img src="${barcodeUrl}" alt="Código de barras" /></div>` : ''}
      </div>
      <p class="muted">Este é um boleto demonstrativo para testes. Em produção, gere o PDF via seu provedor de pagamentos.</p>
      <script>window.onload = () => { setTimeout(() => window.print(), 300); };</script>
      </body></html>`);
    win.document.close();
  };

  const uploadTransferProof = async (file: File) => {
    setProofUploading(true);
    try {
      const ext = file.name.split('.').pop() || 'bin';
      const safeOrder = (orderId || 'sem-id').replace(/[^a-zA-Z0-9-_]/g, '');
      const path = `payment-proofs/order-${safeOrder}-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('payments').upload(path, file, { upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from('payments').getPublicUrl(path);
      setProofUrl(data.publicUrl);
      toast.success('Comprovante enviado com sucesso!');

      // Tenta persistir a URL no pedido (se a coluna existir no schema)
      try {
        const { error: updErr } = await supabase
          .from('orders')
          .update({ payment_proof_url: data.publicUrl } as any)
          .eq('id', orderId);
        if (updErr) throw updErr;
      } catch (persistErr) {
        console.info('Não foi possível salvar a URL do comprovante no pedido (coluna ausente?):', persistErr);
        toast.message('Comprovante salvo no Storage. Podemos criar o campo payment_proof_url para persistir no pedido.');
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao enviar comprovante');
    } finally {
      setProofUploading(false);
    }
  };

  const generatePixCode = React.useCallback(() => {
    // Gera um código PIX simulado (em produção, isso viria do seu provedor de pagamento)
    const pixKey = '12345678901'; // CPF/CNPJ da loja
    const merchantName = 'CHÁ PREMIUM STORE';
    const merchantCity = 'SAO PAULO';
    const amount = total.toFixed(2);
    
    // Código PIX simulado no formato Pix Copia e Cola
    const pixCode = `00020126360014BR.GOV.BCB.PIX0114${pixKey}5204000053039865406${amount}5802BR5913${merchantName}6009${merchantCity}62070503***6304`;
    
    return pixCode;
  }, [total]);

  useEffect(() => {
    if (paymentData.method === 'pix') {
      const code = generatePixCode();
      setPixCode(code);
      
      // Gera o QR Code usando a biblioteca moderna
      QRCode.toDataURL(code, {
        width: 200,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      }).then((dataUrl) => {
        setQrCodeDataUrl(dataUrl);
      }).catch((err) => {
        console.error('Erro ao gerar QR Code:', err);
      });
    }
  }, [paymentData.method, generatePixCode]);

  useEffect(() => {
    if (paymentData.method === 'boleto' && boletoSvgRef.current) {
      try {
        const digits = (boletoLine || '').replace(/\D/g, '');
        if (digits.length > 0) {
          JsBarcode(boletoSvgRef.current, digits, {
            format: 'CODE128',
            lineColor: '#064e3b',
            width: 2,
            height: 60,
            displayValue: true,
            fontSize: 12,
            margin: 0,
          });
        }
      } catch (e) {
        console.error('Erro ao gerar código de barras do boleto:', e);
      }
    }
  }, [paymentData.method, boletoLine]);

  const copyPixCode = async () => {
    try {
      await navigator.clipboard.writeText(pixCode);
      toast.success('Código PIX copiado!');
    } catch (err) {
      toast.error('Erro ao copiar código');
    }
  };

  const copyBoleto = async () => {
    try {
      await navigator.clipboard.writeText(boletoLine);
      toast.success('Linha digitável copiada!');
    } catch (err) {
      toast.error('Erro ao copiar linha digitável');
    }
  };

  const copyTransfer = async () => {
    try {
      await navigator.clipboard.writeText(transferText);
      toast.success('Dados bancários copiados!');
    } catch (err) {
      toast.error('Erro ao copiar dados');
    }
  };

  const handleCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerData.name || !customerData.email || !customerData.phone || !customerData.address) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    setCurrentStep(2);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentData.method) {
      toast.error('Selecione uma forma de pagamento');
      return;
    }

    if (paymentData.method === 'credit' && (!paymentData.cardNumber || !paymentData.cardName || !paymentData.cardExpiry || !paymentData.cardCvc)) {
      toast.error('Preencha todos os dados do cartão');
      return;
    }

    try {
      const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      const order = await checkout.mutateAsync({
        customerData,
        paymentMethod: paymentData.method,
        items,
        subtotal,
        shippingCost,
        total
      });

      setOrderId(order.id);
      setOrderComplete(true);
      clearCart();
    } catch (error) {
      console.error('Erro ao finalizar pedido:', error);
    }
  };

  const handleClose = () => {
    setCurrentStep(1);
    setOrderComplete(false);
    setCustomerData({
      name: '', email: '', phone: '', address: '', number: '', complement: '',
      neighborhood: '', city: '', state: '', cep: ''
    });
    setPaymentData({
      method: '', cardNumber: '', cardName: '', cardExpiry: '', cardCvc: '', installments: '1'
    });
    onClose();
  };

  if (orderComplete) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-900 mb-2">
              Pedido Confirmado!
            </h2>
            <p className="text-gray-600 mb-4">
              Seu pedido foi processado com sucesso. Você receberá um e-mail com os detalhes em breve.
            </p>
            <div className="bg-green-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-green-700">
                <strong>Número do Pedido:</strong> #{orderId.substring(0, 8).toUpperCase()}
              </p>
              <p className="text-sm text-green-700">
                <strong>Total:</strong> {formatPrice(total)}
              </p>
            </div>
            {paymentData.method === 'transfer' && (
              <div className="text-left bg-white border border-green-200 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-green-900 mb-2 flex items-center gap-2"><Landmark className="h-4 w-4"/> Enviar comprovante</h3>
                <p className="text-sm text-gray-700 mb-3">Anexe o comprovante da transferência para agilizar a confirmação do pagamento.</p>
                <input
                  id="transfer-proof-complete"
                  aria-label="Enviar comprovante de transferência (finalização)"
                  title="Enviar comprovante de transferência"
                  ref={transferCompleteInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={(e) => e.currentTarget.files?.[0] && uploadTransferProof(e.currentTarget.files[0])}
                  disabled={proofUploading}
                />
                <Button
                  type="button"
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                  disabled={proofUploading}
                  onClick={() => transferCompleteInputRef.current?.click()}
                >
                  {proofUploading ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
                      Enviando comprovante...
                    </span>
                  ) : (
                    <span>Enviar comprovante</span>
                  )}
                </Button>
                {proofUrl && (
                  <p className="text-xs text-green-700 mt-2 break-all">Comprovante enviado: <a className="underline" href={proofUrl} target="_blank" rel="noreferrer">abrir</a></p>
                )}
              </div>
            )}

            {paymentData.method === 'boleto' && (
              <div className="text-left bg-white border border-green-200 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-green-900 mb-2 flex items-center gap-2"><FileText className="h-4 w-4"/> Boleto bancário</h3>
                <p className="text-sm text-gray-700 mb-3">Use a linha digitável ou escaneie o código de barras abaixo.</p>
                <div className="grid gap-3">
                  <div className="bg-gray-50 p-2 rounded border text-xs font-mono break-all">{boletoLine}</div>
                  <div className="flex justify-center">
                    {(() => {
                      const digits = (boletoLine || '').replace(/\D/g, '');
                      const url = digits ? getBoletoBarcodeDataUrl(digits) : '';
                      return url ? <img src={url} alt="Código de barras do boleto" /> : null;
                    })()}
                  </div>
                  <div>
                    <Button type="button" size="sm" className="bg-green-600 hover:bg-green-700" onClick={openBoletoPdf}>
                      <FileText className="h-3 w-3 mr-2" /> Baixar boleto (PDF)
                    </Button>
                  </div>
                </div>
              </div>
            )}
            <Button onClick={handleClose} className="bg-green-600 hover:bg-green-700">
              Continuar Comprando
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-green-900">
            Finalizar Compra - Etapa {currentStep} de 2
          </DialogTitle>
        </DialogHeader>

        {/* Resumo do Pedido */}
        <div className="bg-green-50 p-4 rounded-lg mb-6">
          <h3 className="font-semibold text-green-900 mb-2">Resumo do Pedido</h3>
          <div className="space-y-1 text-sm">
            {items.map(item => (
              <div key={item.id} className="flex justify-between">
                <span>{item.name} (x{item.quantity})</span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
            <div className="flex justify-between border-t pt-1 mt-2">
              <span>Frete:</span>
              <span>{shippingCost === 0 ? 'GRÁTIS' : formatPrice(shippingCost)}</span>
            </div>
            <div className="flex justify-between font-bold text-green-900">
              <span>Total:</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
        </div>

        {currentStep === 1 && (
          <form onSubmit={handleCustomerSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nome Completo *</Label>
                <Input
                  id="name"
                  value={customerData.name}
                  onChange={(e) => setCustomerData({...customerData, name: e.target.value})}
                  className="border-green-200"
                />
              </div>
              <div>
                <Label htmlFor="email">E-mail *</Label>
                <Input
                  id="email"
                  type="email"
                  value={customerData.email}
                  onChange={(e) => setCustomerData({...customerData, email: e.target.value})}
                  className="border-green-200"
                />
              </div>
              <div>
                <Label htmlFor="phone">Telefone *</Label>
                <Input
                  id="phone"
                  value={customerData.phone}
                  onChange={(e) => setCustomerData({...customerData, phone: e.target.value})}
                  className="border-green-200"
                />
              </div>
              <div>
                <Label htmlFor="cep">CEP</Label>
                <Input
                  id="cep"
                  value={customerData.cep}
                  onChange={(e) => setCustomerData({...customerData, cep: e.target.value})}
                  className="border-green-200"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="address">Endereço *</Label>
                <Input
                  id="address"
                  value={customerData.address}
                  onChange={(e) => setCustomerData({...customerData, address: e.target.value})}
                  className="border-green-200"
                />
              </div>
              <div>
                <Label htmlFor="number">Número</Label>
                <Input
                  id="number"
                  value={customerData.number}
                  onChange={(e) => setCustomerData({...customerData, number: e.target.value})}
                  className="border-green-200"
                />
              </div>
              <div>
                <Label htmlFor="complement">Complemento</Label>
                <Input
                  id="complement"
                  value={customerData.complement}
                  onChange={(e) => setCustomerData({...customerData, complement: e.target.value})}
                  className="border-green-200"
                />
              </div>
              <div>
                <Label htmlFor="neighborhood">Bairro</Label>
                <Input
                  id="neighborhood"
                  value={customerData.neighborhood}
                  onChange={(e) => setCustomerData({...customerData, neighborhood: e.target.value})}
                  className="border-green-200"
                />
              </div>
              <div>
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  value={customerData.city}
                  onChange={(e) => setCustomerData({...customerData, city: e.target.value})}
                  className="border-green-200"
                />
              </div>
            </div>

            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
              <MapPin className="h-4 w-4 mr-2" />
              Continuar para Pagamento
            </Button>
          </form>
        )}

        {currentStep === 2 && (
          <form onSubmit={handlePaymentSubmit} className="space-y-4">
            <Tabs value={paymentData.method} onValueChange={(value) => setPaymentData({...paymentData, method: value})}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="credit">Crédito</TabsTrigger>
                <TabsTrigger value="debit">Débito</TabsTrigger>
                <TabsTrigger value="pix">PIX</TabsTrigger>
                <TabsTrigger value="boleto">Boleto</TabsTrigger>
                <TabsTrigger value="transfer">Transferência</TabsTrigger>
              </TabsList>

              <TabsContent value="credit" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="cardNumber">Número do Cartão</Label>
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={paymentData.cardNumber}
                      onChange={(e) => setPaymentData({...paymentData, cardNumber: e.target.value})}
                      className="border-green-200"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="cardName">Nome no Cartão</Label>
                    <Input
                      id="cardName"
                      value={paymentData.cardName}
                      onChange={(e) => setPaymentData({...paymentData, cardName: e.target.value})}
                      className="border-green-200"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cardExpiry">Validade</Label>
                    <Input
                      id="cardExpiry"
                      placeholder="MM/AA"
                      value={paymentData.cardExpiry}
                      onChange={(e) => setPaymentData({...paymentData, cardExpiry: e.target.value})}
                      className="border-green-200"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cardCvc">CVC</Label>
                    <Input
                      id="cardCvc"
                      placeholder="123"
                      value={paymentData.cardCvc}
                      onChange={(e) => setPaymentData({...paymentData, cardCvc: e.target.value})}
                      className="border-green-200"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="installments">Parcelas</Label>
                    <Select value={paymentData.installments} onValueChange={(value) => setPaymentData({...paymentData, installments: value})}>
                      <SelectTrigger className="border-green-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1x de {formatPrice(total)} sem juros</SelectItem>
                        <SelectItem value="2">2x de {formatPrice(total/2)} sem juros</SelectItem>
                        <SelectItem value="3">3x de {formatPrice(total/3)} sem juros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="debit" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="debitNumber">Número do Cartão</Label>
                    <Input
                      id="debitNumber"
                      placeholder="1234 5678 9012 3456"
                      className="border-green-200"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="debitName">Nome no Cartão</Label>
                    <Input
                      id="debitName"
                      className="border-green-200"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="pix" className="space-y-4">
                <div className="text-center p-6 bg-green-50 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-2">Pagamento via PIX</h3>
                  <p className="text-sm text-green-700 mb-4">
                    Escaneie o QR Code ou copie o código PIX abaixo
                  </p>
                  
                  <div className="bg-white p-4 rounded border border-green-200 mb-4">
                    <p className="text-lg font-bold text-green-900 mb-2">{formatPrice(total)}</p>
                    <p className="text-sm text-gray-600">Pagamento à vista</p>
                  </div>

                  {qrCodeDataUrl && (
                    <div className="mb-4">
                      <img 
                        src={qrCodeDataUrl} 
                        alt="QR Code PIX" 
                        className="mx-auto mb-2 border border-gray-200 rounded"
                      />
                      <p className="text-xs text-gray-500">
                        Escaneie este QR Code com seu app do banco
                      </p>
                    </div>
                  )}

                  {pixCode && (
                    <div className="bg-gray-50 p-3 rounded border">
                      <p className="text-xs text-gray-600 mb-2">Código PIX Copia e Cola:</p>
                      <div className="bg-white p-2 rounded border text-xs font-mono break-all mb-2">
                        {pixCode}
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={copyPixCode}
                        className="w-full"
                      >
                        <Copy className="h-3 w-3 mr-2" />
                        Copiar Código PIX
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="boleto" className="space-y-4">
                <div className="p-6 bg-green-50 rounded-lg">
                  <h3 className="flex items-center gap-2 font-semibold text-green-900 mb-2"><FileText className="h-4 w-4"/> Boleto bancário</h3>
                  <p className="text-sm text-green-700 mb-3">Gere o boleto e pague no banco, lotérica ou pelo app do seu banco. Compensação em até 2 dias úteis.</p>
                  <div className="bg-white p-3 rounded border">
                    <p className="text-xs text-gray-600 mb-2">Linha digitável:</p>
                    <div className="bg-gray-50 p-2 rounded border text-xs font-mono break-all mb-2">{boletoLine}</div>
                    <div className="mb-3 flex justify-center">
                      <svg ref={boletoSvgRef} className="max-w-full" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <Button type="button" size="sm" variant="outline" onClick={copyBoleto}>
                        <Copy className="h-3 w-3 mr-2"/>
                        Copiar linha digitável
                      </Button>
                      <Button type="button" size="sm" className="bg-green-600 hover:bg-green-700" onClick={openBoletoPdf}>
                        <FileText className="h-3 w-3 mr-2"/>
                        Baixar boleto (PDF)
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="transfer" className="space-y-4">
                <div className="p-6 bg-green-50 rounded-lg">
                  <h3 className="flex items-center gap-2 font-semibold text-green-900 mb-2"><Landmark className="h-4 w-4"/> Transferência bancária</h3>
                  <p className="text-sm text-green-700 mb-3">Faça a transferência/TED para a conta abaixo e envie o comprovante pelo e-mail cadastrado.</p>
                  <div className="bg-white p-3 rounded border">
                    <p className="text-xs text-gray-600 mb-2">Dados bancários:</p>
                    <div className="bg-gray-50 p-2 rounded border text-xs font-mono break-all mb-2">{transferText}</div>
                    <Button type="button" size="sm" variant="outline" onClick={copyTransfer} className="w-full">
                      <Copy className="h-3 w-3 mr-2"/>
                      Copiar dados bancários
                    </Button>
                    <div className="mt-4 grid gap-2">
                      <input
                        id="transfer-proof"
                        aria-label="Enviar comprovante de transferência"
                        title="Enviar comprovante de transferência"
                        ref={transferInputRef}
                        type="file"
                        accept="image/*,application/pdf"
                        className="hidden"
                        onChange={(e) => e.currentTarget.files?.[0] && uploadTransferProof(e.currentTarget.files[0])}
                        disabled={proofUploading}
                      />
                      <Button
                        type="button"
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        disabled={proofUploading}
                        onClick={() => transferInputRef.current?.click()}
                      >
                        {proofUploading ? (
                          <span className="inline-flex items-center gap-2">
                            <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
                            Enviando comprovante...
                          </span>
                        ) : (
                          <span>Enviar comprovante</span>
                        )}
                      </Button>
                      {proofUrl && (
                        <p className="text-xs text-green-700 break-all">Comprovante enviado: <a className="underline" href={proofUrl} target="_blank" rel="noreferrer">abrir</a></p>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(1)}
                className="flex-1"
              >
                Voltar
              </Button>
              <Button
                type="submit"
                disabled={checkout.isPending}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {checkout.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Processando...
                  </div>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Finalizar Pedido
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

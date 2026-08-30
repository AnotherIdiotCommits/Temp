const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import ScrollReveal from '../components/ui/ScrollReveal';
import GlowButton from '../components/ui/GlowButton';
import { Trash2, ShoppingBag, CreditCard, Wallet } from 'lucide-react';
import { toast } from 'sonner';

export default function Cart() {
  const queryClient = useQueryClient();

  const { data: items, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: () => db.entities.CartItem.list('-created_date'),
    initialData: [],
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => db.entities.CartItem.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });

  const total = items.reduce((sum, item) => sum + (item.total_price || 0), 0);

  const paymentMethods = [
    { name: 'Zelle', highlight: true, desc: 'Lowest fees — preferred' },
    { name: 'Credit / Debit Card', highlight: false },
    { name: 'PayPal', highlight: false },
    { name: 'Shop Pay', highlight: false },
    { name: 'Google Pay', highlight: false },
    { name: 'Apple Pay', highlight: false },
  ];

  return (
    <div className="w-full max-w-[120rem] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
      <ScrollReveal>
        <h1 className="text-3xl sm:text-4xl font-heading font-bold mb-8">Your Cart</h1>
      </ScrollReveal>

      {items.length === 0 ? (
        <ScrollReveal>
          <div className="text-center py-20">
            <ShoppingBag className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
            <p className="text-muted-foreground text-lg mb-6">Your cart is empty</p>
            <GlowButton to="/shop" variant="primary" size="lg">Browse PCs</GlowButton>
          </div>
        </ScrollReveal>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <ScrollReveal key={item.id}>
                <div className="flex items-center gap-4 p-5 rounded-2xl bg-card/40 border border-border/20">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading font-semibold">{item.pc_name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">Custom configuration</p>
                  </div>
                  <p className="text-lg font-heading font-bold">
                    ${item.total_price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <button
                    onClick={() => deleteMutation.mutate(item.id)}
                    className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal delay={0.1}>
            <div className="sticky top-24 space-y-6">
              <div className="rounded-2xl bg-card/40 border border-border/20 p-6">
                <h3 className="font-heading font-semibold mb-4">Order Summary</h3>
                <div className="flex justify-between text-sm text-muted-foreground mb-2">
                  <span>Subtotal</span>
                  <span>${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground mb-4">
                  <span>Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
                <div className="border-t border-border/20 pt-4 flex justify-between">
                  <span className="font-heading font-semibold">Total</span>
                  <span className="text-xl font-heading font-bold">${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Payment methods */}
              <div className="rounded-2xl bg-card/40 border border-border/20 p-6">
                <h3 className="font-heading font-semibold mb-2 flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-primary" /> Payment Methods
                </h3>
                <p className="text-xs text-muted-foreground mb-4">
                  We accept all major payment methods. Using <span className="text-primary font-semibold">Zelle</span> means more of your money goes toward your build — no processing fees!
                </p>
                <div className="space-y-2">
                  {paymentMethods.map(pm => (
                    <div key={pm.name} className={`flex items-center justify-between px-3 py-2 rounded-lg ${
                      pm.highlight ? 'bg-primary/8 border border-primary/20' : ''
                    }`}>
                      <span className={`text-sm ${pm.highlight ? 'font-semibold text-primary' : 'text-muted-foreground'}`}>{pm.name}</span>
                      {pm.highlight && <span className="text-xs text-primary font-medium">⭐ Preferred</span>}
                    </div>
                  ))}
                </div>
              </div>

              <GlowButton onClick={() => toast.info('Checkout integration coming soon!')} variant="primary" size="lg" className="w-full">
                <CreditCard className="w-5 h-5 mr-2" /> Proceed to Checkout
              </GlowButton>
              <p className="text-xs text-muted-foreground text-center">Secure checkout • Ships 5-10 business days</p>
            </div>
          </ScrollReveal>
        </div>
      )}
    </div>
  );
}
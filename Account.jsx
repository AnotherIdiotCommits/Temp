const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect } from 'react';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ScrollReveal from '../components/ui/ScrollReveal';
import { User, ShoppingCart, BookmarkCheck, Package, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

export default function Account() {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    db.auth.me().then(setUser).catch(() => {
      db.auth.redirectToLogin(window.location.pathname);
    });
  }, []);

  const { data: orders = [] } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => db.entities.Order.filter({ customer_email: user?.email }),
    enabled: !!user,
  });

  const { data: savedBuilds = [] } = useQuery({
    queryKey: ['saved-builds'],
    queryFn: () => db.entities.SavedBuild.list('-created_date'),
    enabled: !!user,
  });

  const { data: cartItems = [] } = useQuery({
    queryKey: ['cart-items'],
    queryFn: () => db.entities.CartItem.list('-created_date'),
    enabled: !!user,
  });

  const deleteCartItem = useMutation({
    mutationFn: (id) => db.entities.CartItem.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart-items'] });
      toast.success('Removed from cart');
    },
  });

  const deleteSavedBuild = useMutation({
    mutationFn: (id) => db.entities.SavedBuild.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-builds'] });
      toast.success('Build removed');
    },
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const statusColors = {
    payment_received: 'bg-yellow-500/10 text-yellow-400',
    parts_ordered: 'bg-blue-500/10 text-blue-400',
    building: 'bg-purple-500/10 text-purple-400',
    testing: 'bg-cyan-500/10 text-cyan-400',
    ready_to_ship: 'bg-green-500/10 text-green-400',
    shipped: 'bg-primary/10 text-primary',
    delivered: 'bg-green-600/10 text-green-500',
  };

  return (
    <div className="min-h-screen">
      <section className="relative min-h-[30vh] flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-accent/5 to-primary/5" />
        <div className="relative w-full max-w-[120rem] mx-auto px-4 sm:px-6 lg:px-8 pb-12 pt-28">
          <ScrollReveal>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <User className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-heading font-bold">{user.full_name || 'My Account'}</h1>
                <p className="text-muted-foreground">{user.email}</p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">

        {/* Orders */}
        <ScrollReveal>
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Package className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-heading font-bold">My Orders</h2>
            </div>
            {orders.length === 0 ? (
              <div className="rounded-2xl border border-border/20 bg-card/30 p-8 text-center text-muted-foreground">
                No orders yet. <Link to="/shop" className="text-primary hover:underline">Browse PCs</Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map(order => (
                  <div key={order.id} className="rounded-2xl border border-border/20 bg-card/30 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{order.pc_name || 'Custom Build'}</p>
                      <p className="text-xs text-muted-foreground">Order #{order.order_number || order.id?.slice(0,8)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[order.status] || 'bg-muted text-muted-foreground'}`}>
                        {order.status?.replace(/_/g, ' ')}
                      </span>
                      <span className="font-bold text-primary">${order.total_price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollReveal>

        {/* Cart */}
        <ScrollReveal>
          <div>
            <div className="flex items-center gap-3 mb-6">
              <ShoppingCart className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-heading font-bold">My Cart</h2>
            </div>
            {cartItems.length === 0 ? (
              <div className="rounded-2xl border border-border/20 bg-card/30 p-8 text-center text-muted-foreground">
                Your cart is empty. <Link to="/shop" className="text-primary hover:underline">Shop now</Link>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map(item => (
                  <div key={item.id} className="rounded-2xl border border-border/20 bg-card/30 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{item.pc_name}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity || 1}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-primary">${item.total_price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      <button onClick={() => deleteCartItem.mutate(item.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollReveal>

        {/* Saved Builds */}
        <ScrollReveal>
          <div>
            <div className="flex items-center gap-3 mb-6">
              <BookmarkCheck className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-heading font-bold">Saved Builds</h2>
            </div>
            {savedBuilds.length === 0 ? (
              <div className="rounded-2xl border border-border/20 bg-card/30 p-8 text-center text-muted-foreground">
                No saved builds yet. <Link to="/custom-build" className="text-primary hover:underline">Create a build</Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedBuilds.map(build => (
                  <div key={build.id} className="rounded-2xl border border-border/20 bg-card/30 p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold">{build.name || build.base_pc}</p>
                        <p className="text-xs text-muted-foreground">{build.base_pc} — {build.color_theme}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-primary text-sm">${build.total_price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        <button onClick={() => deleteSavedBuild.mutate(build.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {build.configuration && (
                      <div className="space-y-1">
                        {['cpu','gpu','ram','storage'].map(k => build.configuration[k] && (
                          <p key={k} className="text-xs text-muted-foreground">
                            <span className="uppercase text-muted-foreground/60 mr-1">{k}:</span>{build.configuration[k]}
                          </p>
                        ))}
                      </div>
                    )}
                    <Link
                      to={`/shop/${build.base_pc}`}
                      className="mt-3 inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                    >
                      Configure & Buy →
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollReveal>

      </section>
    </div>
  );
}
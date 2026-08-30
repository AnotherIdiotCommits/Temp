const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import ScrollReveal from '../../components/ui/ScrollReveal';
import AdminGuard from '../../components/AdminGuard';
import { Package, MessageCircle, Settings, Sliders, TrendingUp, ShoppingCart, DollarSign, Users, X, Clock, BarChart2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

function StatsModal({ orders, tickets, onClose }) {
  const [days, setDays] = useState(30);
  const [customDays, setCustomDays] = useState('30');

  const now = new Date();

  // Generate day-by-day data
  const data = Array.from({ length: days }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (days - 1 - i));
    const dateStr = d.toISOString().split('T')[0];
    const label = days === 1
      ? `${d.getHours()}:00`
      : `${d.getMonth() + 1}/${d.getDate()}`;

    const dayOrders = orders.filter(o => {
      const od = new Date(o.created_date);
      return od.toISOString().split('T')[0] === dateStr;
    });
    const dayTickets = tickets.filter(t => {
      const td = new Date(t.created_date);
      return td.toISOString().split('T')[0] === dateStr;
    });

    return {
      label,
      orders: dayOrders.length,
      support: dayTickets.length,
      revenue: dayOrders.reduce((s, o) => s + (o.total_price || 0), 0),
    };
  });

  const totalRevenue = orders.reduce((s, o) => s + (o.total_price || 0), 0);
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const pendingOrders = orders.filter(o => o.status === 'payment_received' || o.status === 'parts_ordered').length;
  const openTickets = tickets.filter(t => t.status !== 'closed').length;
  const unreadTickets = tickets.filter(t => !t.is_read && t.status !== 'closed').length;

  const statusGroups = ['payment_received', 'parts_ordered', 'building', 'testing', 'ready_to_ship', 'shipped', 'delivered'].map(s => ({
    status: s.replace(/_/g, ' '),
    count: orders.filter(o => o.status === s).length,
  }));

  const presets = [1, 7, 14, 30, 90, 365];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-card border border-border/30 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border/20 sticky top-0 bg-card z-10">
          <h2 className="text-xl font-heading font-bold flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-primary" /> Site Analytics
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-secondary/50 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: DollarSign, color: 'text-green-400' },
              { label: 'Total Orders', value: totalOrders, icon: Package, color: 'text-blue-400' },
              { label: 'Avg Order Value', value: `$${avgOrderValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: TrendingUp, color: 'text-purple-400' },
              { label: 'Open Tickets', value: openTickets, icon: MessageCircle, color: 'text-yellow-400' },
            ].map(c => (
              <div key={c.label} className="p-4 rounded-xl bg-card/60 border border-border/20">
                <c.icon className={`w-5 h-5 ${c.color} mb-2`} />
                <p className="text-xl font-heading font-bold">{c.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{c.label}</p>
              </div>
            ))}
          </div>

          {/* Day range picker */}
          <div className="flex items-center gap-2 flex-wrap">
            {presets.map(d => (
              <button key={d} onClick={() => { setDays(d); setCustomDays(String(d)); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${days === d ? 'border-primary/50 bg-primary/10 text-primary' : 'border-border/20 text-muted-foreground hover:border-primary/20'}`}>
                {d === 1 ? '24h' : `${d}d`}
              </button>
            ))}
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={customDays}
                onChange={e => setCustomDays(e.target.value)}
                onBlur={() => { const v = parseInt(customDays); if (v > 0) setDays(v); }}
                className="w-16 bg-background/50 border border-input rounded-md px-2 py-1 text-xs text-center focus:outline-none focus:ring-1 focus:ring-ring"
                placeholder="days"
              />
              <span className="text-xs text-muted-foreground">days</span>
            </div>
          </div>

          {/* Orders chart */}
          <div>
            <p className="text-sm font-semibold mb-3">Orders per {days === 1 ? 'hour' : 'day'}</p>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.3} />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} name="Orders" />
                  <Bar dataKey="support" fill="hsl(var(--accent))" radius={[3, 3, 0, 0]} name="Support" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Revenue chart */}
          <div>
            <p className="text-sm font-semibold mb-3">Revenue per {days === 1 ? 'hour' : 'day'} ($)</p>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.3} />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} />
                  <Tooltip formatter={(v) => `$${v.toLocaleString()}`} contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="revenue" fill="hsl(var(--chart-3))" radius={[3, 3, 0, 0]} name="Revenue" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Order status breakdown */}
          <div>
            <p className="text-sm font-semibold mb-3">Order Pipeline</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {statusGroups.filter(s => s.count > 0 || ['payment received', 'building', 'shipped', 'delivered'].includes(s.status)).map(s => (
                <div key={s.status} className="p-3 rounded-xl bg-background/40 border border-border/20 text-center">
                  <p className="text-2xl font-bold font-heading">{s.count}</p>
                  <p className="text-xs text-muted-foreground capitalize mt-1">{s.status}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent orders */}
          <div>
            <p className="text-sm font-semibold mb-3">Recent Orders</p>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {orders.slice(0, 10).map(o => (
                <div key={o.id} className="flex items-center justify-between p-3 rounded-xl bg-background/40 border border-border/10">
                  <div>
                    <p className="text-sm font-medium">{o.customer_name || o.customer_email}</p>
                    <p className="text-xs text-muted-foreground capitalize">{o.status?.replace(/_/g, ' ')}</p>
                  </div>
                  <p className="text-sm font-semibold text-primary">${o.total_price?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
              ))}
              {orders.length === 0 && <p className="text-center text-sm text-muted-foreground py-4">No orders yet</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [showAnalytics, setShowAnalytics] = useState(false);
  const { data: orders = [] } = useQuery({ queryKey: ['admin-orders'], queryFn: () => db.entities.Order.list('-created_date'), initialData: [] });
  const { data: tickets = [] } = useQuery({ queryKey: ['admin-tickets'], queryFn: () => db.entities.SupportTicket.list('-created_date'), initialData: [] });
  const { data: pcs = [] } = useQuery({ queryKey: ['admin-pcs'], queryFn: () => db.entities.PC.list(), initialData: [] });

  const totalRevenue = orders.reduce((s, o) => s + (o.total_price || 0), 0);
  const openTickets = tickets.filter(t => t.status !== 'closed').length;
  const unreadTickets = tickets.filter(t => !t.is_read).length;
  const pendingOrders = orders.filter(o => ['payment_received', 'parts_ordered', 'building'].includes(o.status)).length;

  const cards = [
    { label: 'Orders', value: orders.length, sub: `${pendingOrders} pending`, icon: Package, href: '/admin/orders', color: 'text-blue-400' },
    { label: 'Support Tickets', value: openTickets, sub: unreadTickets > 0 ? `${unreadTickets} unread` : 'all read', icon: MessageCircle, href: '/admin/support', color: 'text-purple-400' },
    { label: 'PC Settings', value: `${pcs.length} PCs`, sub: 'Manage builds', icon: Sliders, href: '/admin/pc-settings', color: 'text-cyan-400' },
    { label: 'Site Settings', value: '→', sub: 'Configure', icon: Settings, href: '/admin/settings', color: 'text-green-400' },
  ];

  return (
    <AdminGuard>
      {showAnalytics && <StatsModal orders={orders} tickets={tickets} onClose={() => setShowAnalytics(false)} />}
      <div className="w-full max-w-[120rem] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ScrollReveal>
          <h1 className="text-3xl font-heading font-bold mb-8">Admin Dashboard</h1>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {cards.map((c, i) => (
            <ScrollReveal key={c.label} delay={i * 0.08}>
              <Link to={c.href} className="group block p-6 rounded-2xl bg-card/40 border border-border/20 hover:border-primary/30 hover:shadow-[0_0_20px_rgba(59,130,246,0.08)] transition-all duration-300 hover:-translate-y-0.5">
                <c.icon className={`w-8 h-8 ${c.color} mb-4`} />
                <p className="text-3xl font-heading font-bold">{c.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{c.label}</p>
                {c.sub && <p className="text-xs text-muted-foreground/60 mt-0.5">{c.sub}</p>}
              </Link>
            </ScrollReveal>
          ))}

          {/* Analytics card */}
          <ScrollReveal delay={0.32}>
            <button
              onClick={() => setShowAnalytics(true)}
              className="group w-full text-left p-6 rounded-2xl bg-card/40 border border-border/20 hover:border-primary/30 hover:shadow-[0_0_20px_rgba(59,130,246,0.08)] transition-all duration-300 hover:-translate-y-0.5"
            >
              <TrendingUp className="w-8 h-8 text-orange-400 mb-4" />
              <p className="text-3xl font-heading font-bold">${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
              <p className="text-sm text-muted-foreground mt-1">Analytics & Revenue</p>
              <p className="text-xs text-muted-foreground/60 mt-0.5">Click to view full dashboard</p>
            </button>
          </ScrollReveal>
        </div>

        {/* Quick stats row */}
        <ScrollReveal delay={0.4}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Avg Order Value', value: orders.length > 0 ? `$${(totalRevenue / orders.length).toLocaleString(undefined, { minimumFractionDigits: 0 })}` : '$0', icon: DollarSign, color: 'text-green-400' },
              { label: 'Shipped Orders', value: orders.filter(o => o.status === 'shipped' || o.status === 'delivered').length, icon: Package, color: 'text-blue-400' },
              { label: 'Daily PCs Listed', value: pcs.filter(p => !p.is_weekly).length, icon: Sliders, color: 'text-cyan-400' },
              { label: 'Weekly PCs', value: pcs.filter(p => p.is_weekly).length, icon: TrendingUp, color: 'text-purple-400' },
            ].map(s => (
              <div key={s.label} className="p-4 rounded-2xl bg-card/30 border border-border/20">
                <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
                <p className="text-xl font-heading font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </AdminGuard>
  );
}
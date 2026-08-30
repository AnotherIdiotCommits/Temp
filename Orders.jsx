const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect, useRef } from 'react';
import AdminGuard from '../../components/AdminGuard';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import ScrollReveal from '../../components/ui/ScrollReveal';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Package, Search, ChevronDown, Send } from 'lucide-react';
import GlowButton from '../../components/ui/GlowButton';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const statuses = ['payment_received', 'parts_ordered', 'building', 'testing', 'ready_to_ship', 'shipped', 'delivered'];
const statusColors = {
  payment_received: 'bg-yellow-500/20 text-yellow-400',
  parts_ordered: 'bg-orange-500/20 text-orange-400',
  building: 'bg-blue-500/20 text-blue-400',
  testing: 'bg-purple-500/20 text-purple-400',
  ready_to_ship: 'bg-cyan-500/20 text-cyan-400',
  shipped: 'bg-green-500/20 text-green-400',
  delivered: 'bg-green-600/20 text-green-500',
};

export default function AdminOrders() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [updateMessage, setUpdateMessage] = useState('');
  const queryClient = useQueryClient();
  const prevOrderIdsRef = useRef(null);

  const { data: siteSettingsList = [] } = useQuery({
    queryKey: ['site-settings'],
    queryFn: () => db.entities.SiteSettings.filter({ key: 'global' }),
    initialData: [],
  });
  const siteSettings = siteSettingsList[0] || {};

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => db.entities.Order.list('-created_date'),
    initialData: [],
    refetchInterval: 30000, // poll every 30s
  });

  // Detect new orders and send SMS
  useEffect(() => {
    if (!orders.length) return;
    const currentIds = new Set(orders.map(o => o.id));
    if (prevOrderIdsRef.current === null) {
      prevOrderIdsRef.current = currentIds;
      return;
    }
    const newOrders = orders.filter(o => !prevOrderIdsRef.current.has(o.id));
    prevOrderIdsRef.current = currentIds;

    if (newOrders.length > 0 && siteSettings.sms_notifications_enabled && siteSettings.admin_phone_email) {
      newOrders.forEach(async (o) => {
        await db.integrations.Core.SendEmail({
          to: siteSettings.admin_phone_email,
          subject: `New ZYTK Order!`,
          body: `New order from ${o.customer_name || o.customer_email} — ${o.pc_name || 'Custom Build'} — $${o.total_price?.toFixed(2)}`,
        });
      });
    }
  }, [orders]);

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => db.entities.Order.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast.success('Order updated');
    },
  });

  const filtered = orders.filter(o => {
    const matchesSearch = !search || o.customer_name?.toLowerCase().includes(search.toLowerCase()) || o.order_number?.includes(search) || o.customer_email?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (orderId, newStatus) => {
    updateMutation.mutate({ id: orderId, data: { status: newStatus } });
  };

  const handleSendUpdate = async (order) => {
    if (!updateMessage.trim()) return;
    const notes = (order.notes || '') + `\n[${new Date().toLocaleString()}] ${updateMessage}`;
    updateMutation.mutate({ id: order.id, data: { notes } });
    if (order.customer_email) {
      await db.integrations.Core.SendEmail({
        to: order.customer_email,
        subject: `ZYTK Order Update - ${order.order_number || order.id?.slice(-8)}`,
        body: updateMessage,
      });
    }
    setUpdateMessage('');
    toast.success('Update sent to customer');
  };

  return (
    <AdminGuard>
    <div className="w-full max-w-[120rem] mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <ScrollReveal>
        <div className="flex items-center gap-4 mb-8">
          <a href="/admin" className="text-sm text-muted-foreground hover:text-foreground transition-colors">← Dashboard</a>
          <h1 className="text-3xl font-heading font-bold">Order Management</h1>
        </div>
      </ScrollReveal>

      <div className="flex flex-wrap gap-4 mb-8">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search orders..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 bg-card/30" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48 bg-card/30">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {statuses.map(s => <SelectItem key={s} value={s}>{s.replace(/_/g, ' ')}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {filtered.map(order => (
          <div key={order.id} className="rounded-2xl bg-card/30 border border-border/20 overflow-hidden">
            <button
              onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
              className="w-full flex items-center justify-between p-5 text-left hover:bg-primary/5 transition-colors"
            >
              <div className="flex items-center gap-4">
                <Package className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-heading font-semibold">{order.pc_name || 'Custom Build'}</p>
                  <p className="text-sm text-muted-foreground">{order.customer_name} • {order.customer_email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge className={statusColors[order.status] || 'bg-muted text-muted-foreground'}>
                  {(order.status || 'pending').replace(/_/g, ' ')}
                </Badge>
                <p className="font-heading font-bold">${order.total_price?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expandedOrder === order.id ? 'rotate-180' : ''}`} />
              </div>
            </button>

            <AnimatePresence>
              {expandedOrder === order.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-t border-border/20"
                >
                  <div className="p-5 space-y-4">
                    <div className="flex flex-wrap gap-4">
                      <Select value={order.status} onValueChange={v => handleStatusChange(order.id, v)}>
                        <SelectTrigger className="w-48 bg-background/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {statuses.map(s => <SelectItem key={s} value={s}>{s.replace(/_/g, ' ')}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>

                    {order.notes && (
                      <div className="p-3 rounded-xl bg-background/30 text-sm text-muted-foreground whitespace-pre-line">
                        {order.notes}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Textarea
                        placeholder="Send update to customer..."
                        value={updateMessage}
                        onChange={e => setUpdateMessage(e.target.value)}
                        className="bg-background/50 min-h-[60px]"
                      />
                      <GlowButton onClick={() => handleSendUpdate(order)} variant="primary" size="sm">
                        <Send className="w-4 h-4" />
                      </GlowButton>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">No orders found</div>
        )}
      </div>
    </div>
    </AdminGuard>
  );
}
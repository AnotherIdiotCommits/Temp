const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect } from 'react';
import AdminGuard from '../../components/AdminGuard';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import ScrollReveal from '../../components/ui/ScrollReveal';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Settings as SettingsIcon, Palmtree, Calendar, Globe, UserCheck, Plus, Trash2 } from 'lucide-react';
import GlowButton from '../../components/ui/GlowButton';
import { toast } from 'sonner';

export default function AdminSettings() {
  const queryClient = useQueryClient();

  const { data: settingsList } = useQuery({
    queryKey: ['site-settings'],
    queryFn: () => db.entities.SiteSettings.filter({ key: 'global' }),
    initialData: [],
  });

  const settings = settingsList?.[0] || {};
  const [form, setForm] = useState({});
  const [adminEmails, setAdminEmails] = useState(['danekisawesome@gmail.com']);
  const [newEmail, setNewEmail] = useState('');

  useEffect(() => {
    if (settings.id) {
      setForm({ ...settings });
      if (settings.admin_emails) {
        try { setAdminEmails(JSON.parse(settings.admin_emails)); } catch {}
      }
    }
  }, [settings.id]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (settings.id) {
        return db.entities.SiteSettings.update(settings.id, data);
      } else {
        return db.entities.SiteSettings.create({ key: 'global', ...data });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
      toast.success('Settings saved');
    },
  });

  const handleSave = () => {
    const { id, created_date, updated_date, created_by, ...data } = form;
    saveMutation.mutate({ ...data, admin_emails: JSON.stringify(adminEmails) });
  };

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  return (
    <AdminGuard>
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <ScrollReveal>
        <div className="flex items-center gap-4 mb-8">
          <a href="/admin" className="text-sm text-muted-foreground hover:text-foreground transition-colors">← Dashboard</a>
          <h1 className="text-3xl font-heading font-bold flex items-center gap-3">
            <SettingsIcon className="w-7 h-7 text-primary" /> Site Settings
          </h1>
        </div>
      </ScrollReveal>

      <div className="space-y-8">
        {/* Vacation Mode */}
        <ScrollReveal delay={0.05}>
          <div className="rounded-2xl bg-card/40 border border-border/20 p-6 sm:p-8 space-y-4">
            <h2 className="text-lg font-heading font-semibold flex items-center gap-2">
              <Palmtree className="w-5 h-5 text-accent" /> Vacation Mode
            </h2>
            <div className="flex items-center gap-3">
              <Switch checked={form.vacation_mode || false} onCheckedChange={v => update('vacation_mode', v)} />
              <Label>Enable Vacation Mode (all PCs become sold out)</Label>
            </div>
            <Textarea
              placeholder="Vacation message shown to visitors..."
              value={form.vacation_message || ''}
              onChange={e => update('vacation_message', e.target.value)}
              className="bg-background/50"
            />
            <Input
              type="date"
              placeholder="Estimated return date"
              value={form.vacation_return_date || ''}
              onChange={e => update('vacation_return_date', e.target.value)}
              className="bg-background/50 w-auto"
            />
          </div>
        </ScrollReveal>

        {/* Weekly Drop */}
        <ScrollReveal delay={0.1}>
          <div className="rounded-2xl bg-card/40 border border-border/20 p-6 sm:p-8 space-y-4">
            <h2 className="text-lg font-heading font-semibold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" /> Weekly Drop
            </h2>
            <div className="flex items-center gap-3">
              <Switch checked={form.weekly_drop_enabled ?? true} onCheckedChange={v => update('weekly_drop_enabled', v)} />
              <Label>Enable Weekly Drop countdown</Label>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.weekly_drop_sold_out || false} onCheckedChange={v => update('weekly_drop_sold_out', v)} />
              <Label>Mark Weekly Drop as Sold Out</Label>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.weekly_drop_on_sale || false} onCheckedChange={v => update('weekly_drop_on_sale', v)} />
              <Label>Weekly Drop On Sale</Label>
            </div>
          </div>
        </ScrollReveal>

        {/* Social Links */}
        <ScrollReveal delay={0.15}>
          <div className="rounded-2xl bg-card/40 border border-border/20 p-6 sm:p-8 space-y-4">
            <h2 className="text-lg font-heading font-semibold flex items-center gap-2">
              <Globe className="w-5 h-5 text-cyan-400" /> Social Links
            </h2>
            {['youtube', 'tiktok', 'instagram', 'x'].map(platform => (
              <div key={platform}>
                <Label className="capitalize mb-1 block text-sm">{platform}</Label>
                <Input
                  placeholder={`https://${platform}.com/...`}
                  value={form[`social_${platform}`] || ''}
                  onChange={e => update(`social_${platform}`, e.target.value)}
                  className="bg-background/50"
                />
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Shop Banner */}
        <ScrollReveal delay={0.2}>
          <div className="rounded-2xl bg-card/40 border border-border/20 p-6 sm:p-8 space-y-4">
            <h2 className="text-lg font-heading font-semibold">Shop Page Banner</h2>
            <div>
              <Label className="mb-1 block text-sm">Banner Image URL</Label>
              <Input value={form.shop_banner_url || ''} onChange={e => update('shop_banner_url', e.target.value)} className="bg-background/50" placeholder="https://..." />
            </div>
            <div>
              <Label className="mb-1 block text-sm">Banner Text</Label>
              <Input value={form.shop_banner_text || ''} onChange={e => update('shop_banner_text', e.target.value)} className="bg-background/50" />
            </div>
            <div>
              <Label className="mb-1 block text-sm">Banner Subtext</Label>
              <Input value={form.shop_banner_subtext || ''} onChange={e => update('shop_banner_subtext', e.target.value)} className="bg-background/50" />
            </div>
          </div>
        </ScrollReveal>

        {/* SMS Notifications */}
        <ScrollReveal delay={0.22}>
          <div className="rounded-2xl bg-card/40 border border-border/20 p-6 sm:p-8 space-y-4">
            <h2 className="text-lg font-heading font-semibold flex items-center gap-2">
              📱 Order SMS Notifications
            </h2>
            <p className="text-sm text-muted-foreground">
              Get notified by text when a new order is placed. Enter your carrier's email-to-SMS gateway address.
              Examples: <span className="text-foreground font-mono text-xs">1234567890@vtext.com</span> (Verizon),
              <span className="text-foreground font-mono text-xs"> 1234567890@txt.att.net</span> (AT&T),
              <span className="text-foreground font-mono text-xs"> 1234567890@tmomail.net</span> (T-Mobile)
            </p>
            <div className="flex items-center gap-3">
              <Switch checked={form.sms_notifications_enabled || false} onCheckedChange={v => update('sms_notifications_enabled', v)} />
              <Label>Enable SMS notifications for new orders</Label>
            </div>
            <div>
              <Label className="mb-1 block text-sm">Phone Email Gateway</Label>
              <Input
                placeholder="1234567890@vtext.com"
                value={form.admin_phone_email || ''}
                onChange={e => update('admin_phone_email', e.target.value)}
                className="bg-background/50"
              />
            </div>
          </div>
        </ScrollReveal>

        {/* Admin Access */}
        <ScrollReveal delay={0.25}>
          <div className="rounded-2xl bg-card/40 border border-border/20 p-6 sm:p-8 space-y-4">
            <h2 className="text-lg font-heading font-semibold flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-primary" /> Admin Access
            </h2>
            <p className="text-sm text-muted-foreground">Emails listed here will have admin access to the dashboard.</p>
            <div className="space-y-2">
              {adminEmails.map((email, i) => (
                <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg border border-border/20 bg-background/30">
                  <span className="flex-1 text-sm">{email}</span>
                  <button
                    onClick={() => setAdminEmails(prev => prev.filter((_, idx) => idx !== i))}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="new@email.com"
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && newEmail.trim()) {
                    setAdminEmails(prev => [...prev, newEmail.trim()]);
                    setNewEmail('');
                  }
                }}
                className="bg-background/50 flex-1"
              />
              <button
                onClick={() => {
                  if (newEmail.trim()) {
                    setAdminEmails(prev => [...prev, newEmail.trim()]);
                    setNewEmail('');
                  }
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary/10 text-primary border border-primary/20 text-sm hover:bg-primary/20 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
          </div>
        </ScrollReveal>

        <GlowButton onClick={handleSave} variant="primary" size="lg" className="w-full" disabled={saveMutation.isPending}>
          Save Settings
        </GlowButton>
      </div>
    </div>
    </AdminGuard>
  );
}
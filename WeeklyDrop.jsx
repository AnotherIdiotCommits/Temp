const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

import { Link } from 'react-router-dom';
import ScrollReveal from '../components/ui/ScrollReveal';
import GlowButton from '../components/ui/GlowButton';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Zap, Bell, Monitor, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

function useCountdown() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    function getNext() {
      const now = new Date();
      const est = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
      const day = est.getDay();
      let d = (5 - day + 7) % 7;
      if (d === 0 && est.getHours() >= 19) d = 7;
      const next = new Date(est);
      next.setDate(next.getDate() + d);
      next.setHours(19, 0, 0, 0);
      return next;
    }
    const target = getNext();
    const tick = () => {
      const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }));
      const diff = Math.max(0, target.getTime() - now.getTime());
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return timeLeft;
}

export default function WeeklyDrop() {
  const countdown = useCountdown();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const { data: weeklyPcs = [] } = useQuery({
    queryKey: ['weekly-pcs'],
    queryFn: () => db.entities.PC.filter({ is_weekly: true, visible: true }),
    initialData: [],
  });

  const currentPc = weeklyPcs.find(p => p.weekly_status === 'current');
  const nextPc = weeklyPcs.find(p => p.weekly_status === 'next_week');

  const handleReminder = async () => {
    if (!email && !phone) return toast.error('Please enter at least an email or phone number');
    await db.entities.WeeklyReminder.create({ email: email || undefined, phone: phone || undefined });
    toast.success("You'll be notified before the next drop!");
    setEmail('');
    setPhone('');
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[50vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-accent/5 to-primary/5" />
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-accent/10 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-primary/10 rounded-full blur-[100px] animate-pulse-glow" style={{ animationDelay: '1.5s' }} />

        <div className="relative w-full max-w-[120rem] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <ScrollReveal>
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 mb-6">
                <Zap className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium text-accent">Weekly Drop</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-heading font-bold mb-4">
                Every Friday at{' '}
                <span className="text-primary glow-text-blue">7 PM EST</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
                One exclusive build. First come, first served. Don't miss it.
              </p>

              {/* Countdown */}
              <div className="flex justify-center gap-3 sm:gap-6 mb-0">
                {[
                  { value: countdown.days, label: 'Days' },
                  { value: countdown.hours, label: 'Hours' },
                  { value: countdown.minutes, label: 'Min' },
                  { value: countdown.seconds, label: 'Sec' },
                ].map(({ value, label }) => (
                  <div key={label} className="flex flex-col items-center">
                    <div className="w-16 sm:w-24 h-16 sm:h-24 rounded-2xl bg-card/50 border border-border/30 backdrop-blur-sm flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.08)]">
                      <span className="text-2xl sm:text-4xl font-heading font-bold">{String(value).padStart(2, '0')}</span>
                    </div>
                    <span className="text-xs text-muted-foreground mt-2 uppercase tracking-wider">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Current Weekly PC */}
      <section className="w-full max-w-[120rem] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {currentPc ? (
          <ScrollReveal>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold mb-8 text-center">
              This Week's <span className="text-primary glow-text-blue">Drop</span>
            </h2>
            <div className="max-w-2xl mx-auto rounded-2xl bg-card/40 border border-border/20 overflow-hidden">
              {currentPc.image_url && (
                <div className="aspect-[16/9] overflow-hidden">
                  <img src={currentPc.image_url} alt={currentPc.display_name || currentPc.name} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-6">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <h3 className="text-xl font-heading font-bold">{currentPc.display_name || currentPc.name}</h3>
                    {currentPc.description && <p className="text-muted-foreground text-sm mt-1">{currentPc.description}</p>}
                  </div>
                  <div className="text-right flex-shrink-0">
                    {currentPc.on_sale && currentPc.sale_price ? (
                      <>
                        <p className="text-sm text-muted-foreground line-through">${currentPc.base_price?.toLocaleString()}</p>
                        <p className="text-2xl font-bold text-primary">${currentPc.sale_price?.toLocaleString()}</p>
                      </>
                    ) : (
                      <p className="text-2xl font-bold text-primary">${currentPc.base_price?.toLocaleString()}</p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {currentPc.sold_out && <Badge className="bg-destructive/90 text-destructive-foreground">Sold Out</Badge>}
                  {currentPc.on_sale && currentPc.sale_price && !currentPc.sold_out && <Badge className="bg-green-500/90 text-white">On Sale</Badge>}
                  {currentPc.platform && <Badge variant="outline" className="text-xs">{currentPc.platform}</Badge>}
                  {currentPc.ram_type && <Badge variant="outline" className="text-xs">{currentPc.ram_type}</Badge>}
                </div>

                {/* Specs */}
                {(currentPc.base_cpu || currentPc.base_gpu || currentPc.base_ram || currentPc.base_storage) && (
                  <div className="grid grid-cols-2 gap-2 mb-6 text-sm">
                    {currentPc.base_cpu && <div><span className="text-muted-foreground">CPU: </span>{currentPc.base_cpu}</div>}
                    {currentPc.base_gpu && <div><span className="text-muted-foreground">GPU: </span>{currentPc.base_gpu}</div>}
                    {currentPc.base_ram && <div><span className="text-muted-foreground">RAM: </span>{currentPc.base_ram}</div>}
                    {currentPc.base_storage && <div><span className="text-muted-foreground">Storage: </span>{currentPc.base_storage}</div>}
                  </div>
                )}

                <GlowButton
                  to={currentPc.sold_out ? undefined : `/shop/${currentPc.slug || currentPc.name}`}
                  variant={currentPc.sold_out ? 'secondary' : 'primary'}
                  size="lg"
                  className="w-full"
                  disabled={currentPc.sold_out}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {currentPc.sold_out ? 'Sold Out' : 'Configure & Buy'}
                </GlowButton>
              </div>
            </div>
          </ScrollReveal>
        ) : (
          <ScrollReveal>
            <div className="text-center py-12">
              <Monitor className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">No active weekly drop right now.</p>
              <p className="text-muted-foreground/60 text-sm mt-1">Check back Friday at 7 PM EST!</p>
            </div>
          </ScrollReveal>
        )}
      </section>

      {/* Reminder Signup */}
      <section className="w-full max-w-[120rem] mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <ScrollReveal>
          <div className="max-w-md mx-auto rounded-2xl bg-card/40 border border-border/20 p-6">
            <h3 className="text-sm font-heading font-semibold mb-4 flex items-center justify-center gap-2">
              <Bell className="w-4 h-4 text-accent" /> Get Notified Before the Next Drop
            </h3>
            <div className="space-y-3">
              <Input
                placeholder="Email address (optional)"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background/50"
              />
              <Input
                placeholder="Phone number (optional)"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="bg-background/50"
              />
              <p className="text-xs text-muted-foreground text-center">Enter email, phone, or both — at least one required.</p>
              <GlowButton onClick={handleReminder} variant="accent" size="md" className="w-full">
                Set Reminder
              </GlowButton>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
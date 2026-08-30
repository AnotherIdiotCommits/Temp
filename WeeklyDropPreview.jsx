import React, { useState, useEffect } from 'react';
import ScrollReveal from '../ui/ScrollReveal';
import GlowButton from '../ui/GlowButton';
import { Clock, Zap } from 'lucide-react';

function getNextFriday7PM() {
  const now = new Date();
  const est = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  const day = est.getDay();
  let daysUntilFriday = (5 - day + 7) % 7;
  if (daysUntilFriday === 0 && est.getHours() >= 19) daysUntilFriday = 7;
  const next = new Date(est);
  next.setDate(next.getDate() + daysUntilFriday);
  next.setHours(19, 0, 0, 0);
  return next;
}

function useCountdown() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const target = getNextFriday7PM();
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

function CountdownUnit({ value, label }) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-xl bg-card/60 border border-border/30 flex items-center justify-center backdrop-blur-sm">
        <span className="text-2xl sm:text-3xl font-heading font-bold text-foreground">{String(value).padStart(2, '0')}</span>
      </div>
      <span className="text-xs text-muted-foreground mt-2 uppercase tracking-wider">{label}</span>
    </div>
  );
}

export default function WeeklyDropPreview() {
  const countdown = useCountdown();

  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/3 to-transparent pointer-events-none" />
      <div className="relative w-full max-w-[120rem] mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 mb-6">
              <Zap className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">Weekly Drop</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold mb-4">
              Next Drop <span className="text-primary glow-text-blue">In</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto">
              Every Friday at 7 PM EST. One exclusive build. First come, first served.
            </p>

            <div className="flex justify-center gap-3 sm:gap-4 mb-10">
              <CountdownUnit value={countdown.days} label="Days" />
              <CountdownUnit value={countdown.hours} label="Hours" />
              <CountdownUnit value={countdown.minutes} label="Min" />
              <CountdownUnit value={countdown.seconds} label="Sec" />
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              <GlowButton to="/weekly-drop" variant="accent" size="lg">
                View Weekly Drop
              </GlowButton>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
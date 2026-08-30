const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React from 'react';
import { useQuery } from '@tanstack/react-query';

import PCCard from '../components/shop/PCCard';
import ScrollReveal from '../components/ui/ScrollReveal';
import GlowButton from '../components/ui/GlowButton';
import { Monitor } from 'lucide-react';

export default function Shop() {
  const { data: pcs, isLoading } = useQuery({
    queryKey: ['pcs-daily'],
    queryFn: () => db.entities.PC.filter({ is_weekly: false, visible: true }, 'sort_order'),
    initialData: [],
  });

  return (
    <div>
      {/* Banner */}
      <section className="relative min-h-[50vh] flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-accent/5" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-primary/8 rounded-full blur-[120px]" />
        <div className="relative w-full max-w-[120rem] mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-32">
          <ScrollReveal>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold mb-4">
              Daily <span className="text-primary glow-text-blue">PCs</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mb-4">
              Find the build that fits your setup.
            </p>
            <p className="text-sm text-muted-foreground/70 max-w-2xl mb-8">
              Note: GPU model, RAM model, and aesthetics may vary slightly due to stock availability. Core specs and performance remain the same.
            </p>
            <GlowButton to="/custom-build" variant="secondary" size="md">
              Can't decide? Build custom
            </GlowButton>
          </ScrollReveal>
        </div>
      </section>

      {/* PC Grid */}
      <section className="w-full max-w-[120rem] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-2xl bg-card/30 border border-border/20 animate-pulse" />
            ))}
          </div>
        ) : pcs.length === 0 ? (
          <div className="text-center py-20">
            <Monitor className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">No PCs available right now. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {pcs.map((pc, i) => (
              <ScrollReveal key={pc.id} delay={i * 0.08}>
                <PCCard pc={pc} />
              </ScrollReveal>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
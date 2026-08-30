import React from 'react';
import ScrollReveal from '../ui/ScrollReveal';
import GlowButton from '../ui/GlowButton';

export default function CTASection() {
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 animated-gradient" />
        <div className="absolute top-0 left-1/3 w-64 h-64 bg-primary/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/3 w-64 h-64 bg-accent/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative w-full max-w-[120rem] mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="group max-w-5xl mx-auto rounded-3xl bg-card/40 backdrop-blur-xl border border-border/30 p-8 sm:p-12 lg:p-16 text-center hover:border-primary/30 hover:shadow-[0_0_40px_rgba(59,130,246,0.12)] transition-all duration-500 relative overflow-hidden">
            <span className="absolute left-0 top-0 h-full w-0 bg-primary/3 group-hover:w-full transition-all duration-500 ease-out rounded-3xl" />
            <div className="relative">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold mb-4">
              Need Something{' '}
              <span className="text-primary glow-text-blue">Custom</span>?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
              Can't find exactly what you're looking for? Use our automated build configurator to get instant
              PC recommendations based on your budget and preferences. Every PC is built one at a time.
            </p>
            <GlowButton to="/custom-build" variant="accent" size="lg">
              Request Custom Build
            </GlowButton>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
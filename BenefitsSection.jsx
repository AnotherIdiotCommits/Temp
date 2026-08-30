import React from 'react';
import { Shield, Cpu, Palette, DollarSign } from 'lucide-react';
import ScrollReveal from '../ui/ScrollReveal';

const benefits = [
  {
    icon: Shield,
    title: 'Quality First',
    desc: 'Every component is brand new and sourced from trusted manufacturers. No off-brand shortcuts.',
  },
  {
    icon: Palette,
    title: 'Clean Aesthetics',
    desc: 'Cable management, coordinated color themes, and builds that look as good as they perform.',
  },
  {
    icon: DollarSign,
    title: 'Fair Pricing',
    desc: 'No corporate markup. You pay for quality parts and craftsmanship — nothing more.',
  },
  {
    icon: Cpu,
    title: 'Full Customization',
    desc: 'Choose your CPU, GPU, RAM, storage, and more. Every build is tailored to your needs.',
  },
];

export default function BenefitsSection() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/3 to-transparent pointer-events-none" />
      <div className="relative w-full max-w-[120rem] mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold">
            Why{' '}
            <span className="text-primary glow-text-blue">ZYTK</span>?
          </h2>
          <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
            Built with passion, not quotas. Here's what makes us different.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((b, i) => (
            <ScrollReveal key={b.title} delay={i * 0.1}>
              <div className="group relative h-full p-6 sm:p-8 rounded-2xl bg-card/50 border border-border/30 backdrop-blur-sm hover:border-primary/30 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)] transition-all duration-500 hover:-translate-y-1">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] transition-all duration-500">
                    <b.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-heading font-semibold mb-2">{b.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
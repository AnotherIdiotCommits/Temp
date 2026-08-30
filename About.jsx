import React from 'react';
import ScrollReveal from '../components/ui/ScrollReveal';
import { Heart, Gamepad2, Award, DollarSign } from 'lucide-react';

const cards = [
  { icon: Heart, title: 'Our Story', desc: 'Started as a passion for building PCs that gamers actually deserve. One builder, limitless dedication.' },
  { icon: Gamepad2, title: 'Built for Gamers', desc: 'Every decision — from part selection to cable management — is made with gamers in mind.' },
  { icon: Award, title: 'Quality Parts', desc: 'Only trusted name-brand parts, no off-brand parts. Every part is brand new with full manufacturer warranty.' },
  { icon: DollarSign, title: 'Fair Pricing', desc: "No corporate markup, no investor overhead. You're paying for quality parts and craftsmanship." },
];

export default function About() {
  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[50vh] flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-accent/5" />
        <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-accent/8 rounded-full blur-[120px]" />
        <div className="relative w-full max-w-[120rem] mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-32">
          <ScrollReveal>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold mb-4">
              Built <span className="text-primary glow-text-blue">Different</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl">
              ZYTK PCs was founded on a simple principle: gamers deserve better.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Cards */}
      <section className="w-full max-w-[120rem] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((c, i) => (
            <ScrollReveal key={c.title} delay={i * 0.1}>
              <div className="group relative h-full p-6 sm:p-8 rounded-2xl bg-card/40 border border-border/20 backdrop-blur-sm hover:border-primary/30 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)] transition-all duration-500 hover:-translate-y-1">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-all duration-500">
                    <c.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-heading font-semibold mb-2">{c.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{c.desc}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Promise */}
      <section id="promise" className="relative py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/3 to-primary/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px] animate-pulse-glow" />
        <div className="relative w-full max-w-[120rem] mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="group max-w-4xl mx-auto text-center rounded-3xl bg-card/30 backdrop-blur-xl border border-border/20 p-10 sm:p-16 hover:border-primary/30 hover:shadow-[0_0_40px_rgba(59,130,246,0.12)] transition-all duration-500 relative overflow-hidden">
              <span className="absolute left-0 top-0 h-full w-0 bg-primary/3 group-hover:w-full transition-all duration-500 ease-out rounded-3xl" />
              <div className="relative">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold mb-6">
                  The ZYTK <span className="text-primary glow-text-blue">Promise</span>
                </h2>
                <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
                  Every build is crafted from start to finish by one person who cares about your gaming experience.
                  No rushed jobs. Just quality, passion, and attention to detail.
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
import React from 'react';
import ScrollReveal from '../ui/ScrollReveal';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Alex R.',
    text: 'Incredible build quality. The cable management alone was worth it — looks like a showroom PC.',
    rating: 5,
  },
  {
    name: 'Jordan M.',
    text: "Best price-to-performance I've found anywhere. Way better than the big box prebuilts.",
    rating: 5,
  },
  {
    name: 'Casey L.',
    text: 'Communication was amazing. Got updates every step of the way. You can tell this is a passion project.',
    rating: 5,
  },
];

export default function SocialProofSection() {
  return (
    <section className="relative py-24 sm:py-32 hidden">
      <div className="w-full max-w-[120rem] mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold">
            What Gamers Are Saying
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Real builds. Real gamers. Real satisfaction.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <ScrollReveal key={t.name} delay={i * 0.15}>
              <div className="group relative p-6 sm:p-8 rounded-2xl bg-card/30 border border-border/20 backdrop-blur-sm hover:border-primary/20 hover:shadow-[0_0_30px_rgba(59,130,246,0.08)] transition-all duration-500 hover:-translate-y-1">
                <Quote className="w-8 h-8 text-primary/20 mb-4" />
                <p className="text-foreground/80 leading-relaxed mb-6">{t.text}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">{t.name}</span>
                  <div className="flex gap-0.5">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
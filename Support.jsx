import React, { useState } from 'react';
import ScrollReveal from '../components/ui/ScrollReveal';
import GlowButton from '../components/ui/GlowButton';
import { ChevronDown, MessageCircle, Truck, Shield, Wrench } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const faqItems = [
  {
    q: 'How long does it take to build and ship my PC?',
    a: 'Standard estimated shipping time is 5–10 business days. Since every PC is built to order by one person from start to finish, build times are longer than major corporations. You\'ll receive an update when your PC is ready to ship, and another when it ships — complete with a UPS tracking number.'
  },
  {
    q: 'Can I customize any build?',
    a: 'Yes! Every Daily PC supports full customization. You can upgrade the CPU, GPU, RAM, storage, PSU, motherboard, CPU cooler, and cable extensions — and even choose the color of your parts. All upgrades dynamically update the pricing. You can also request a fully custom build through our configurator, which is better priced than other fully custom builds on bigger name companies since we build to order.'
  },
  {
    q: 'What are Daily PCs vs Weekly Drops?',
    a: 'Daily PCs are our standard builds available anytime — they come in different tiers and are fully customizable. Weekly Drops are special one-off builds that release every Friday at 7 PM EST. They\'re first-come-first-served and are normally priced lower than comparable Daily PCs.'
  },
  {
    q: 'What brands do you use?',
    a: 'We use only trusted, name-brand components from manufacturers like AMD, NVIDIA, ~~Intel~~ (soon), ASUS, MSI, Gigabyte, ASRock, and more. No off-brand or refurbished parts — ever.'
  },
  {
    q: 'Do you offer warranty?',
    a: 'All parts are brand new and covered under their respective manufacturer warranties. Your PC is also fully tested before shipping to ensure everything works perfectly out of the box.'
  },
  {
    q: 'Where do you ship?',
    a: 'We currently ship to the Contiguous United States only via UPS. Customers pay shipping costs. Full tracking is provided once your PC ships.'
  },
  {
    q: 'Can I request specific parts?',
    a: 'Absolutely. Use our Custom Build Request tool to specify your preferences, or reach out via live chat. We\'ll do our best to accommodate special part requests within compatibility constraints.'
  },
  {
    q: 'Is Windows installed?',
    a: 'Yes! Every ZYTK PC comes with Windows 11 Pro pre-installed, fully activated, and ready to go out of the box.'
  },
  {
    q: 'Can I upgrade my PC later?',
    a: 'Yes. Since we use standard, name-brand components and proper cable management, your PC is easy to upgrade down the road. All builds use standard form factors.'
  },
  {
    q: 'Do you test PCs before shipping?',
    a: 'Every single build goes through comprehensive testing before shipping — including stress tests, benchmarks, and thermal checks. We make sure everything runs perfectly before it leaves our hands.'
  },
  {
    q: 'Can I reserve a Weekly Drop build?',
    a: 'Weekly Drop builds are strictly first-come-first-served when they release every Friday at 7 PM EST. You can sign up for email or SMS reminders so you never miss a drop.'
  },
];

function FAQItem({ item, isOpen, onToggle }) {
  return (
    <div className="border border-border/20 rounded-xl overflow-hidden hover:border-primary/20 transition-colors duration-300">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 sm:p-6 text-left hover:bg-primary/5 transition-colors duration-200"
      >
        <span className="text-sm sm:text-base font-medium pr-4">{item.q}</span>
        <ChevronDown className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p className="px-5 sm:px-6 pb-5 sm:pb-6 text-sm text-muted-foreground leading-relaxed">
              {item.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function scrollToMiddle(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - window.innerHeight / 2 + el.offsetHeight / 2;
  window.scrollTo({ top, behavior: 'smooth' });
}

export default function Support() {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[40vh] flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-accent/5" />
        <div className="relative w-full max-w-[120rem] mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-32">
          <ScrollReveal>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold mb-4">Support</h1>
            <p className="text-xl text-muted-foreground max-w-2xl">
              We're here to help. Find answers or reach out directly.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Quick links */}
      <section className="w-full max-w-[120rem] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: MessageCircle, label: 'Live Chat', href: '/support/chat', desc: 'Talk to us directly', isLink: true },
            { icon: Truck, label: 'Shipping Info', id: 'shipping', desc: '5–10 business days' },
            { icon: Shield, label: 'Warranty', id: 'warranty', desc: 'Manufacturer covered' },
            { icon: Wrench, label: 'Custom Build', href: '/custom-build', desc: 'Get recommendations', isLink: true },
          ].map((item, i) => (
            <ScrollReveal key={item.label} delay={i * 0.08}>
              {item.isLink ? (
                <a href={item.href} className="group block p-5 rounded-xl bg-card/40 border border-border/20 hover:border-primary/30 hover:shadow-[0_0_20px_rgba(59,130,246,0.08)] transition-all duration-300 hover:-translate-y-0.5">
                  <item.icon className="w-6 h-6 text-primary mb-3" />
                  <h3 className="font-heading font-semibold text-sm group-hover:text-primary transition-colors">
                    {item.label === 'Custom Build' ? <>Need Something <span className="text-primary">Custom</span>?</> : item.label}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                </a>
              ) : (
                <button onClick={() => scrollToMiddle(item.id)} className="group w-full text-left block p-5 rounded-xl bg-card/40 border border-border/20 hover:border-primary/30 hover:shadow-[0_0_20px_rgba(59,130,246,0.08)] transition-all duration-300 hover:-translate-y-0.5">
                  <item.icon className="w-6 h-6 text-primary mb-3" />
                  <h3 className="font-heading font-semibold text-sm group-hover:text-primary transition-colors">{item.label}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                </button>
              )}
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="w-full max-w-[120rem] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <ScrollReveal>
          <h2 className="text-2xl sm:text-3xl font-heading font-bold mb-8">Frequently Asked Questions</h2>
        </ScrollReveal>
        <div className="max-w-3xl space-y-3">
          {faqItems.map((item, i) => (
            <ScrollReveal key={i} delay={i * 0.04}>
              <FAQItem item={item} isOpen={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} />
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Shipping info */}
      <section id="shipping" className="w-full max-w-[120rem] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <ScrollReveal>
          <div className="max-w-3xl rounded-2xl bg-card/30 border border-border/20 p-8 sm:p-10">
            <h2 className="text-2xl font-heading font-bold mb-4">Shipping Information</h2>
            <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
              <p>• Estimated build + shipping time: <strong className="text-foreground">5–10 business days</strong></p>
              <p>• Ships via <strong className="text-foreground">UPS</strong> with full tracking</p>
              <p>• <strong className="text-foreground">Contiguous US only</strong> (48 states)</p>
              <p>• Shipping costs paid by customer</p>
              <p>• You'll receive an update when your PC is ready to ship and when it ships</p>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Warranty */}
      <section id="warranty" className="w-full max-w-[120rem] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <ScrollReveal>
          <div className="max-w-3xl rounded-2xl bg-card/30 border border-border/20 p-8 sm:p-10">
            <h2 className="text-2xl font-heading font-bold mb-4">Warranty & Quality</h2>
            <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
              <p>• All components are <strong className="text-foreground">brand new</strong></p>
              <p>• Every part is covered under <strong className="text-foreground">manufacturer warranty</strong></p>
              <p>• Each PC is <strong className="text-foreground">fully tested</strong> before shipping</p>
              <p>• Stress tests, benchmarks, and thermal checks included</p>
              <p>• <strong className="text-foreground">Windows 11 Pro</strong> pre-installed on every build</p>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Contact Email */}
      <section className="w-full max-w-[120rem] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <ScrollReveal>
          <div className="max-w-3xl rounded-2xl bg-card/30 border border-border/20 p-8 sm:p-10">
            <h2 className="text-2xl font-heading font-bold mb-3">Contact Us Directly</h2>
            <p className="text-muted-foreground text-sm mb-4">
              Prefer email? Reach us directly and we'll get back to you as soon as possible.
            </p>
            <a
              href="mailto:support@zytkpcs.com"
              className="inline-flex items-center gap-2 text-primary hover:underline font-semibold text-lg"
            >
              support@zytkpcs.com
            </a>
          </div>
        </ScrollReveal>
      </section>

      {/* CTA */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/3 to-primary/5" />
        <div className="relative w-full max-w-[120rem] mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="group max-w-5xl mx-auto text-center rounded-3xl bg-card/30 backdrop-blur-xl border border-border/20 p-8 sm:p-12 lg:p-16 hover:border-primary/30 hover:shadow-[0_0_40px_rgba(59,130,246,0.12)] transition-all duration-500 relative overflow-hidden">
              <span className="absolute left-0 top-0 h-full w-0 bg-primary/3 group-hover:w-full transition-all duration-500 ease-out rounded-3xl" />
              <div className="relative">
                <h2 className="text-3xl sm:text-4xl font-heading font-bold mb-4">
                  Need Something <span className="text-primary glow-text-blue">Custom</span>?
                </h2>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
                  Can't find exactly what you're looking for? Use our automated build configurator to get instant
                  PC recommendations based on your budget and preferences. Every PC is built one at a time, so I can accommodate special requests.
                </p>
                <GlowButton to="/custom-build" variant="accent" size="lg">
                  Request Custom Build
                </GlowButton>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
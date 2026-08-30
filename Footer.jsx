import React from 'react';
import { Link } from 'react-router-dom';
import SocialIcons from './SocialIcons';

const footerNav = [
  { label: 'About', href: '/about' },
  { label: 'Shop PCs', href: '/shop' },
  { label: 'Support', href: '/support' },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-border/30 mt-auto">
      <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />
      <div className="relative w-full max-w-[120rem] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <p className="text-lg sm:text-xl font-heading font-medium text-muted-foreground italic">
            Built by one person, from start to finish, every time.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 max-w-3xl mx-auto">
          <div>
            <Link to="/" className="text-2xl font-heading font-bold text-foreground hover:text-primary transition-colors duration-300">
              ZYTK
            </Link>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              Built by one person, from start to finish, every time.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">Navigation</h4>
            <div className="flex flex-col gap-2.5">
              {footerNav.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">Social</h4>
            <SocialIcons size="md" />
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border/30 text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} ZYTK. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
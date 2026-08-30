import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, ChevronDown, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SocialIcons from './SocialIcons';
import { useAuth } from '@/lib/AuthContext';

const navItems = [
  {
    label: 'About',
    href: '/about',
    children: [
      { label: 'Our Story', href: '/about' },
      { label: 'The ZYTK Promise', href: '/about#promise' },
    ]
  },
  {
    label: 'Shop PCs',
    href: '/shop',
    children: [
      { label: 'Daily PCs', href: '/shop' },
      { label: 'Weekly Drop', href: '/weekly-drop' },
      { label: 'Request Custom Build', href: '/custom-build' },
    ]
  },
  {
    label: 'Support',
    href: '/support',
    children: [
      { label: 'FAQ & Help', href: '/support' },
      { label: 'Live Chat', href: '/support/chat' },
      { label: 'Shipping Info', href: '/support#shipping' },
      { label: 'Warranty', href: '/support#warranty' },
    ]
  },
];

function smoothScrollToHash(hash) {
  if (!hash) return;
  const id = hash.replace('#', '');
  setTimeout(() => {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - window.innerHeight / 2 + el.offsetHeight / 2;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }, 100);
}

export default function Header({ vacationMode, vacationMessage }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.email === 'danekisawesome@gmail.com';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setActiveDropdown(null);
  }, [location]);

  const handleNavClick = (item) => {
    if (item.href) {
      const [path, hash] = item.href.split('#');
      if (hash && location.pathname === path) {
        smoothScrollToHash('#' + hash);
      } else if (hash) {
        navigate(path);
        smoothScrollToHash('#' + hash);
      } else {
        navigate(path);
      }
    }
  };

  return (
    <>
      {vacationMode && vacationMessage && (
        <div className="bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 text-center py-2 px-4 text-sm text-foreground/80 border-b border-border/50">
          {vacationMessage}
        </div>
      )}
      <header className={`sticky top-0 z-50 transition-all duration-500 ${scrolled ? 'bg-background/90 backdrop-blur-xl border-b border-border/50 shadow-lg shadow-primary/5' : 'bg-transparent'}`}>
        <div className="w-full max-w-[120rem] mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
              <span className="text-2xl lg:text-3xl font-heading font-bold tracking-tight text-foreground group-hover:text-primary transition-colors duration-300">
                ZYTK
              </span>
            </Link>

            {/* Desktop Nav — absolutely centered */}
            <nav className="hidden lg:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
              {navItems.map((item) => (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => setActiveDropdown(item.label)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button
                    onClick={() => handleNavClick(item)}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 rounded-lg hover:bg-secondary/50"
                  >
                    {item.label}
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === item.label ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {activeDropdown === item.label && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 mt-1 w-56 bg-card/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-2xl shadow-primary/10 overflow-hidden"
                      >
                        {item.children.map((child) => (
                          <button
                            key={child.label}
                            onClick={() => handleNavClick(child)}
                            className="group/item w-full flex items-center px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-all duration-150 overflow-hidden relative"
                          >
                            <span className="absolute left-0 top-0 h-full w-0 bg-primary/5 group-hover/item:w-full transition-all duration-300 ease-out" />
                            <span className="relative">{child.label}</span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </nav>

            {/* Right side */}
            <div className="hidden lg:flex items-center gap-3">
              <SocialIcons size="sm" />
              <div className="w-px h-6 bg-border/50 mx-1" />
              <Link to="/account" className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all duration-200">
                <User className="w-5 h-5" />
              </Link>
              <Link to="/cart" className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all duration-200 relative">
                <ShoppingCart className="w-5 h-5" />
              </Link>
              {isAdmin && (
                <Link to="/admin" className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-200" title="Admin Panel">
                  <Shield className="w-5 h-5" />
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex lg:hidden items-center gap-2">
              <Link to="/cart" className="p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors">
                <ShoppingCart className="w-5 h-5" />
              </Link>
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
              >
                {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden bg-card/95 backdrop-blur-xl border-t border-border/50 overflow-hidden"
            >
              <div className="px-4 py-4 space-y-1">
                {navItems.map((item) => (
                  <div key={item.label}>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 pt-3 pb-1">{item.label}</p>
                    {item.children.map((child) => (
                      <button
                        key={child.label}
                        onClick={() => handleNavClick(child)}
                        className="w-full text-left block px-3 py-2.5 text-sm text-foreground/80 hover:text-foreground hover:bg-primary/10 rounded-lg transition-colors"
                      >
                        {child.label}
                      </button>
                    ))}
                  </div>
                ))}
                <div className="pt-3 border-t border-border/50">
                  <div className="flex items-center justify-between px-3">
                    <SocialIcons size="sm" />
                    <Link to="/account" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                      <User className="w-4 h-4" /> Account
                    </Link>
                  </div>
                  {isAdmin && (
                    <Link to="/admin" className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 px-3 py-2 mt-1">
                      <Shield className="w-4 h-4" /> Admin Panel
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
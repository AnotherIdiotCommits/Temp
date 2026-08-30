import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function GlowButton({
  children,
  to,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
}) {
  const baseClasses = 'relative inline-flex items-center justify-center font-heading font-semibold rounded-xl transition-all duration-300 overflow-hidden group';

  const variants = {
    primary: 'bg-primary text-primary-foreground hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] hover:scale-[1.02] active:scale-[0.98]',
    secondary: 'bg-secondary text-secondary-foreground border border-border/50 hover:border-primary/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] hover:scale-[1.02] active:scale-[0.98]',
    accent: 'bg-gradient-to-r from-primary to-accent text-white hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] hover:scale-[1.02] active:scale-[0.98]',
    ghost: 'text-muted-foreground hover:text-foreground hover:bg-secondary/50',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
  };

  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-50 pointer-events-none' : ''} ${className}`;

  const inner = (
    <>
      <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
      <span className="relative z-10">{children}</span>
    </>
  );

  if (to) {
    return <Link to={to} className={classes}>{inner}</Link>;
  }

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      disabled={disabled}
      className={classes}
    >
      {inner}
    </motion.button>
  );
}
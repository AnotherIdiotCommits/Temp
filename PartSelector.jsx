import React from 'react';
import { motion } from 'framer-motion';
import { Check, Lock } from 'lucide-react';
import { calculateUpgradePrice } from '../../lib/pcData';

export default function PartSelector({ category, parts, basePart, selectedPart, onSelect, label }) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-heading font-semibold text-foreground uppercase tracking-wider">{label}</h3>
      <div className="space-y-2">
        {parts.map((part) => {
          const isSelected = part.name === selectedPart;
          const isBase = part.name === basePart;
          const diff = calculateUpgradePrice(category, basePart, part.name);
          const isDisabled = part.disabled;

          return (
            <motion.button
              key={part.name}
              whileHover={!isDisabled ? { scale: 1.01 } : {}}
              whileTap={!isDisabled ? { scale: 0.99 } : {}}
              onClick={() => !isDisabled && onSelect(part.name)}
              disabled={isDisabled}
              className={`w-full flex items-center justify-between p-3 sm:p-4 rounded-xl border transition-all duration-300 text-left ${
                isDisabled
                  ? 'opacity-40 cursor-not-allowed border-border/10 bg-card/20'
                  : isSelected
                  ? 'border-primary/50 bg-primary/10 shadow-[0_0_20px_rgba(59,130,246,0.1)]'
                  : 'border-border/20 bg-card/30 hover:border-primary/20 hover:bg-card/50'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                  isSelected ? 'border-primary bg-primary' : 'border-border/40'
                }`}>
                  {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                  {isDisabled && <Lock className="w-3 h-3 text-muted-foreground" />}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{part.name}</p>
                  {isBase && <span className="text-xs text-muted-foreground">Included</span>}
                </div>
              </div>
              <div className="text-right flex-shrink-0 ml-3">
                {isBase ? (
                  <span className="text-xs text-muted-foreground">Base</span>
                ) : diff === 0 ? (
                  <span className="text-xs text-muted-foreground">+$0</span>
                ) : diff > 0 ? (
                  <span className="text-sm font-semibold text-primary">+${diff.toFixed(2)}</span>
                ) : (
                  <span className="text-sm font-semibold text-green-400">-${Math.abs(diff).toFixed(2)}</span>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Cpu, Monitor, MemoryStick, HardDrive } from 'lucide-react';

export default function PCCard({ pc }) {
  const isSoldOut = pc.sold_out;
  const isOnSale = pc.on_sale && pc.sale_price;

  return (
    <Link to={`/shop/${pc.slug || pc.name}`}>
      <motion.div
        whileHover={{ y: -6 }}
        transition={{ duration: 0.3 }}
        className="group relative h-full rounded-2xl bg-card/50 border border-border/30 backdrop-blur-sm overflow-hidden hover:border-primary/40 hover:shadow-[0_0_40px_rgba(59,130,246,0.12)] transition-all duration-500"
      >
        {/* Image area */}
        <div className="relative aspect-[4/3] bg-gradient-to-br from-secondary/50 to-muted/30 overflow-hidden">
          {pc.image_url ? (
            <img src={pc.image_url} alt={pc.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Monitor className="w-16 h-16 text-muted-foreground/20" />
            </div>
          )}
          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            {isSoldOut && (
              <Badge className="bg-destructive/90 text-destructive-foreground text-xs">Sold Out</Badge>
            )}
            {isOnSale && !isSoldOut && (
              <Badge className="bg-green-500/90 text-white text-xs">Sale</Badge>
            )}
          </div>
          {/* color badge removed */}
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-heading font-bold group-hover:text-primary transition-colors duration-300">{pc.display_name || pc.name}</h3>
            <div className="text-right">
              {isOnSale ? (
                <div>
                  <span className="text-sm text-muted-foreground line-through">${pc.base_price?.toLocaleString()}</span>
                  <p className="text-xl font-heading font-bold text-green-400">${pc.sale_price?.toLocaleString()}</p>
                </div>
              ) : (
                <p className="text-xl font-heading font-bold text-foreground">${pc.base_price?.toLocaleString()}</p>
              )}
            </div>
          </div>

          {/* Specs */}
          <div className="grid grid-cols-2 gap-2.5">
            {pc.base_cpu && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Cpu className="w-3.5 h-3.5 text-primary/60 flex-shrink-0" />
                <span className="truncate">{pc.base_cpu}</span>
              </div>
            )}
            {pc.base_gpu && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Monitor className="w-3.5 h-3.5 text-primary/60 flex-shrink-0" />
                <span className="truncate">{pc.base_gpu}</span>
              </div>
            )}
            {pc.base_ram && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MemoryStick className="w-3.5 h-3.5 text-primary/60 flex-shrink-0" />
                <span className="truncate">{pc.base_ram}</span>
              </div>
            )}
            {pc.base_storage && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <HardDrive className="w-3.5 h-3.5 text-primary/60 flex-shrink-0" />
                <span className="truncate">{pc.base_storage}</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
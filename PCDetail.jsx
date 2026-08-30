const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Cpu, Monitor, MemoryStick, HardDrive, Fan, Zap, CircuitBoard, Cable, ArrowLeft, ShoppingCart, ChevronDown, Bookmark } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import ScrollReveal from '../components/ui/ScrollReveal';
import GlowButton from '../components/ui/GlowButton';
import {
  BASE_BUILDS,
  PARTS_DB,
  DAILY_PC_PRICES,
  CASES,
  getCompatibleParts,
  calculateUpgradePrice,
  calculateTotalPrice,
} from '../lib/pcData';
import { useAuth } from '@/lib/AuthContext';

const categoryIcons = {
  cpu: Cpu,
  gpu: Monitor,
  ram: MemoryStick,
  storage: HardDrive,
  cooler: Fan,
  psu: Zap,
  motherboard: CircuitBoard,
  cables: Cable,
};

const categoryLabels = {
  cpu: 'CPU',
  gpu: 'GPU',
  ram: 'RAM',
  storage: 'Storage',
  cooler: 'Cooler',
  psu: 'Power Supply',
  motherboard: 'Motherboard',
  cables: 'Cable Sleeves',
};

function PartRow({ category, parts, selected, basePart, onChange, disabled }) {
  const [open, setOpen] = useState(false);
  const Icon = categoryIcons[category] || Cpu;
  const selectedPart = parts.find(p => p.name === selected);
  const basePricePart = parts.find(p => p.name === basePart);

  return (
    <div className="rounded-xl border border-border/20 bg-card/20 overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        disabled={disabled}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-primary/5 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <Icon className="w-4 h-4 text-primary/70 flex-shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">{categoryLabels[category]}</p>
            <p className="text-sm font-medium">{selected || '—'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {selected && selected !== basePart && (
            <span className="text-xs text-primary font-medium">
              {calculateUpgradePrice(category, basePart, selected) > 0
                ? `+$${calculateUpgradePrice(category, basePart, selected).toFixed(2)}`
                : `-$${Math.abs(calculateUpgradePrice(category, basePart, selected)).toFixed(2)}`}
            </span>
          )}
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {open && (
        <div className="border-t border-border/20 divide-y divide-border/10">
          {parts.map(part => {
            const diff = calculateUpgradePrice(category, basePart, part.name);
            const isSelected = selected === part.name;
            return (
              <button
                key={part.name}
                onClick={() => { onChange(part.name); setOpen(false); }}
                className={`w-full flex items-center justify-between px-4 py-3 text-sm text-left transition-colors ${
                  isSelected ? 'bg-primary/10 text-foreground' : 'hover:bg-secondary/30 text-muted-foreground hover:text-foreground'
                } ${part.disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                disabled={part.disabled}
              >
                <span>{part.name}</span>
                <span className={`text-xs font-medium ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}>
                  {diff === 0 ? 'Included' : diff > 0 ? `+$${diff.toFixed(2)}` : `-$${Math.abs(diff).toFixed(2)}`}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function PCDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, navigateToLogin } = useAuth();
  const [saveSuccess, setSaveSuccess] = useState(false);

  const { data: pcs = [], isLoading } = useQuery({
    queryKey: ['pcs'],
    queryFn: () => db.entities.PC.list('sort_order'),
  });

  const pc = pcs.find(p => (p.slug || p.name) === slug);

  // Determine base build from pcData or fall back to DB values
  const baseBuildKey = pc?.name;
  const staticBase = BASE_BUILDS[baseBuildKey];
  const basePrice = pc?.on_sale && pc?.sale_price ? pc.sale_price : (pc?.base_price || DAILY_PC_PRICES[baseBuildKey] || 999.99);

  // Build the baseBuild from DB record (prefer base_* fields from DB, fall back to static)
  const baseBuild = staticBase ? {
    ...staticBase,
    cpu: pc?.base_cpu || staticBase.cpu,
    gpu: pc?.base_gpu || staticBase.gpu,
    ram: pc?.base_ram || staticBase.ram,
    storage: pc?.base_storage || staticBase.storage,
    cooler: pc?.base_cooler || staticBase.cooler,
    psu: pc?.base_psu || staticBase.psu,
    motherboard: pc?.base_motherboard || staticBase.motherboard,
    cables: pc?.base_cables || staticBase.cables,
  } : null;

  const [config, setConfig] = useState(null);

  useEffect(() => {
    if (!baseBuild || config) return;
    // Check for custom config from CustomBuild page
    const customKey = `custom_config_${baseBuildKey}`;
    const stored = sessionStorage.getItem(customKey);
    if (stored) {
      try {
        setConfig(JSON.parse(stored));
        sessionStorage.removeItem(customKey);
        return;
      } catch {}
    }
    setConfig({ ...baseBuild });
  }, [baseBuild, baseBuildKey]);

  const addToCartMutation = useMutation({
    mutationFn: (item) => db.entities.CartItem.create(item),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Added to cart!');
      navigate('/cart');
    },
  });

  const saveBuildMutation = useMutation({
    mutationFn: (item) => db.entities.SavedBuild.create(item),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-builds'] });
      setSaveSuccess(true);
      toast.success('Build saved!');
      setTimeout(() => setSaveSuccess(false), 3000);
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!pc || !baseBuild) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-muted-foreground">PC not found.</p>
        <GlowButton to="/shop" variant="secondary">Back to Shop</GlowButton>
      </div>
    );
  }

  // Derive active platform/ramType from the currently selected CPU (allows platform switching)
  const activeCpuData = config ? PARTS_DB.cpu.find(c => c.name === config.cpu) : null;
  const platform = activeCpuData?.platform || baseBuild.platform;
  const ramType = activeCpuData?.ram_type || baseBuild.ramType;

  // Derive active case size from selected case
  const activeCaseData = PARTS_DB.cases?.find(c => c.name === (config?.caseName || baseBuild.caseName));
  const activeCaseFormFactor = activeCaseData?.form_factor || (baseBuild.caseSize === 'mATX_Case' ? 'mATX' : 'ATX');
  const caseSize = activeCaseFormFactor === 'mATX' ? 'mATX_Case' : 'ATX_Case';
  const isMATX = caseSize === 'mATX_Case';

  // Get compatible parts for each category (using active platform/ram/case)
  const cpuParts = PARTS_DB.cpu; // allow all CPUs for platform switching
  const ramParts = getCompatibleParts('ram', platform, ramType, caseSize);
  const storageParts = PARTS_DB.storage;
  const coolerParts = getCompatibleParts('cooler', platform, ramType, caseSize);
  const psuParts = PARTS_DB.psu;
  const motherboardParts = getCompatibleParts('motherboard', platform, ramType, caseSize);
  const cablesParts = PARTS_DB.cables;

  // GPU: filter by case using GPU length vs case supported length (if available), otherwise allow all
  const selectedCase = activeCaseData;
  const caseMaxGpuLength = selectedCase?.gpu_length_supported || null;
  const gpuParts = PARTS_DB.gpu.map(g => ({
    ...g,
    disabled: caseMaxGpuLength && g.length_mm ? g.length_mm > caseMaxGpuLength : false,
  }));

  const totalPrice = config ? calculateTotalPrice(basePrice, baseBuild, config) : basePrice;

  const handleAddToCart = () => {
    if (!config) return;
    if (!isAuthenticated) { navigateToLogin(); return; }
    addToCartMutation.mutate({
      pc_name: pc.display_name || pc.name,
      configuration: config,
      total_price: totalPrice,
      quantity: 1,
    });
  };

  const handleSaveBuild = () => {
    if (!config) return;
    if (!isAuthenticated) { navigateToLogin(); return; }
    saveBuildMutation.mutate({
      base_pc: pc.name,
      name: `${pc.display_name || pc.name} — Custom`,
      configuration: config,
      total_price: totalPrice,
      color_theme: baseBuild.color || 'black',
    });
  };

  const updateConfig = (cat) => (val) => {
    setConfig(prev => {
      const next = { ...prev, [cat]: val };

      // When CPU changes, auto-update platform-dependent parts (mobo + RAM)
      if (cat === 'cpu') {
        const newCpuData = PARTS_DB.cpu.find(c => c.name === val);
        if (newCpuData) {
          const newPlatform = newCpuData.platform;
          const newRamType = newCpuData.ram_type;
          const currentCase = PARTS_DB.cases?.find(c => c.name === (prev.caseName || baseBuild.caseName));
          const currentCaseFF = currentCase?.form_factor || (baseBuild.caseSize === 'mATX_Case' ? 'mATX' : 'ATX');
          const newCaseSize = currentCaseFF === 'mATX' ? 'mATX_Case' : 'ATX_Case';

          // Pick compatible mobo
          const compatMobos = getCompatibleParts('motherboard', newPlatform, newRamType, newCaseSize);
          if (compatMobos.length > 0 && !compatMobos.find(m => m.name === prev.motherboard)) {
            next.motherboard = compatMobos[0].name;
          }
          // Pick compatible RAM
          const compatRam = getCompatibleParts('ram', newPlatform, newRamType, newCaseSize);
          if (compatRam.length > 0 && !compatRam.find(r => r.name === prev.ram)) {
            next.ram = compatRam[0].name;
          }
        }
      }

      // When case changes, auto-update motherboard if incompatible
      if (cat === 'caseName') {
        const newCaseData = PARTS_DB.cases?.find(c => c.name === val);
        const newFF = newCaseData?.form_factor || 'ATX';
        const newCS = newFF === 'mATX' ? 'mATX_Case' : 'ATX_Case';
        const currentCpuData = PARTS_DB.cpu.find(c => c.name === prev.cpu);
        const activePlatform = currentCpuData?.platform || baseBuild.platform;
        const activeRamType = currentCpuData?.ram_type || baseBuild.ramType;
        const compatMobos = getCompatibleParts('motherboard', activePlatform, activeRamType, newCS);
        if (compatMobos.length > 0 && !compatMobos.find(m => m.name === prev.motherboard)) {
          next.motherboard = compatMobos[0].name;
        }
        // Also filter out incompatible 360mm AIO coolers from mATX
        if (newFF === 'mATX') {
          const compatCoolers = getCompatibleParts('cooler', activePlatform, activeRamType, newCS);
          if (!compatCoolers.find(c => c.name === prev.cooler)) {
            next.cooler = compatCoolers[0]?.name || prev.cooler;
          }
        }
      }

      return next;
    });
  };

  return (
    <div className="w-full max-w-[120rem] mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back */}
      <button onClick={() => navigate('/shop')} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Shop
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        {/* Left — Image + overview */}
        <ScrollReveal>
          <div className="sticky top-24">
            <div className="rounded-2xl bg-card/40 border border-border/20 overflow-hidden aspect-[4/3] mb-6">
              {pc.image_url ? (
                <img src={pc.image_url} alt={pc.display_name || pc.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Monitor className="w-24 h-24 text-muted-foreground/20" />
                </div>
              )}
            </div>

            {/* Price + badges */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-heading font-bold">{pc.display_name || pc.name}</h1>
                <p className="text-sm text-muted-foreground mt-1">{pc.description || `Custom configurable build`}</p>
              </div>
              <div className="text-right">
                {pc.on_sale && pc.sale_price && (
                  <p className="text-sm text-muted-foreground line-through">${pc.base_price?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                )}
                <p className="text-2xl font-heading font-bold text-primary">
                  ${totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            <div className="flex gap-2 mb-6 flex-wrap">
              {pc.sold_out && <Badge className="bg-destructive/90 text-destructive-foreground">Sold Out</Badge>}
              {pc.on_sale && pc.sale_price && !pc.sold_out && <Badge className="bg-green-500/90 text-white">On Sale</Badge>}
              <Badge variant="outline" className="text-xs">{platform}</Badge>
              <Badge variant="outline" className="text-xs">{ramType}</Badge>
              <Badge variant="outline" className="text-xs">{activeCaseFormFactor}</Badge>
            </div>

            <p className="text-xs text-muted-foreground mb-4">✅ Windows 11 Pro Included · Built & tested</p>

            <GlowButton
              onClick={handleAddToCart}
              variant="primary"
              size="lg"
              className="w-full"
              disabled={pc.sold_out || addToCartMutation.isPending}
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              {pc.sold_out ? 'Sold Out' : addToCartMutation.isPending ? 'Adding...' : 'Add to Cart'}
            </GlowButton>
            <button
              onClick={handleSaveBuild}
              disabled={saveBuildMutation.isPending || saveSuccess}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border/30 bg-card/30 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all duration-200 disabled:opacity-50"
            >
              <Bookmark className={`w-4 h-4 ${saveSuccess ? 'text-primary fill-primary' : ''}`} />
              {saveSuccess ? 'Saved!' : saveBuildMutation.isPending ? 'Saving...' : 'Save Build'}
            </button>
          </div>
        </ScrollReveal>

        {/* Right — Configurator */}
        <ScrollReveal delay={0.1}>
          <div>
            <h2 className="text-xl font-heading font-semibold mb-6">Configure Your Build</h2>

            {config && (
              <div className="space-y-3">
                <PartRow category="cpu" parts={cpuParts} selected={config.cpu} basePart={baseBuild.cpu} onChange={updateConfig('cpu')} />
                <PartRow category="gpu" parts={gpuParts} selected={config.gpu} basePart={baseBuild.gpu} onChange={updateConfig('gpu')} />
                <PartRow category="ram" parts={ramParts} selected={config.ram} basePart={baseBuild.ram} onChange={updateConfig('ram')} />
                <PartRow category="storage" parts={storageParts} selected={config.storage} basePart={baseBuild.storage} onChange={updateConfig('storage')} />
                <PartRow category="cooler" parts={coolerParts} selected={config.cooler} basePart={baseBuild.cooler} onChange={updateConfig('cooler')} />
                <PartRow category="psu" parts={psuParts} selected={config.psu} basePart={baseBuild.psu} onChange={updateConfig('psu')} />
                <PartRow category="motherboard" parts={motherboardParts} selected={config.motherboard} basePart={baseBuild.motherboard} onChange={updateConfig('motherboard')} />
                <PartRow category="cables" parts={cablesParts} selected={config.cables} basePart={baseBuild.cables} onChange={updateConfig('cables')} />
              </div>
            )}

            {/* Case selector */}
            <div className="mt-6 rounded-xl border border-border/20 bg-card/20 overflow-hidden">
              <button
                onClick={() => document.getElementById('case-dropdown')?.classList.toggle('hidden')}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-primary/5 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 text-primary/70 flex-shrink-0 text-xs font-bold">📦</div>
                  <div>
                    <p className="text-xs text-muted-foreground">Case</p>
                    <p className="text-sm font-medium">{config?.caseName || baseBuild.caseName || (isMATX ? 'mATX Case' : 'ATX Case')}</p>
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </button>
              <div id="case-dropdown" className="hidden border-t border-border/20 divide-y divide-border/10">
                {[...CASES.mATX, ...CASES.ATX].map(c => (
                  <button
                    key={c.name}
                    onClick={() => {
                      updateConfig('caseName')(c.name);
                      document.getElementById('case-dropdown')?.classList.add('hidden');
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 text-sm text-left transition-colors ${
                      (config?.caseName || baseBuild.caseName) === c.name ? 'bg-primary/10 text-foreground' : 'hover:bg-secondary/30 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <span>{c.displayName}</span>
                    <span className="text-xs text-muted-foreground">{c.name.includes('mATX') ? 'mATX' : 'ATX'}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Reset */}
            {config && JSON.stringify(config) !== JSON.stringify(baseBuild) && (
              <button
                onClick={() => setConfig({ ...baseBuild })}
                className="mt-4 text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
              >
                Reset to base configuration
              </button>
            )}
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import ScrollReveal from '../components/ui/ScrollReveal';
import GlowButton from '../components/ui/GlowButton';
import { Slider } from '@/components/ui/slider';
import { motion } from 'framer-motion';
import { Cpu, Monitor, Zap, Gamepad2, Film, Palette, ArrowRight, ArrowLeft, MemoryStick, HardDrive, Fan, CircuitBoard, Cable } from 'lucide-react';
import { BASE_BUILDS, PARTS_DB, DAILY_PC_PRICES, WINDOWS_KEY_FEE, calculateTotalPrice, getCompatibleParts } from '../lib/pcData';
import { toast } from 'sonner';

const gameTypes = [
  { value: 'minecraft', label: 'Minecraft' },
  { value: 'esports', label: 'Esports' },
  { value: 'aaa', label: 'AAA Games' },
  { value: 'all', label: 'All Games' },
];

const useCases = [
  { value: 'gaming', label: 'Gaming', icon: Gamepad2 },
  { value: 'content_creation', label: 'Content Creation', icon: Film },
  { value: 'video_editing', label: 'Video Editing', icon: Palette },
];

const ramOptions = ['16GB', '32GB', '64GB'];
const storageOptions = ['1TB', '2TB', '4TB'];
const coolingOptions = [
  { value: 'air', label: 'Air Cooler' },
  { value: 'aio', label: 'AIO' },
  { value: 'aio_lcd', label: 'AIO Screen' },
];
const gpuBrands = [
  { value: 'nvidia', label: '🟢 NVIDIA' },
  { value: 'amd_gpu', label: '🔴 AMD' },
  { value: 'intel_gpu', label: '🔵 Intel' },
];

function Chip({ selected, onClick, children, className = '', disabled = false }) {
  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.03 }}
      whileTap={disabled ? {} : { scale: 0.97 }}
      onClick={disabled ? undefined : onClick}
      className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 border ${
        selected
          ? 'border-primary/50 bg-primary/15 text-foreground shadow-[0_0_15px_rgba(59,130,246,0.15)]'
          : 'border-border/30 bg-card/30 text-muted-foreground hover:border-primary/20 hover:bg-card/50'
      } ${disabled ? 'opacity-40 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </motion.button>
  );
}

function pickCpuForPlatform(platform, cpuBudget, hasContent, hasEditing, selectedGames) {
  const wantsMinecraft = selectedGames.includes('minecraft');
  const wantsEsports = selectedGames.includes('esports');
  const wantsAAA = selectedGames.includes('aaa') || selectedGames.includes('all');
  const isWorkflow = hasContent || hasEditing;
  const isEditingOnly = hasEditing && !hasContent && selectedGames.length === 0;
  const wantsSingleCore = (wantsMinecraft || wantsEsports) && !wantsAAA && !isWorkflow;

  if (platform === 'AM4') {
    if (cpuBudget >= 249) return 'AMD Ryzen 7 5800X';
    if (cpuBudget >= 210) return 'AMD Ryzen 5 5600X';
    if (cpuBudget >= 170) return 'AMD Ryzen 5 5600';
    if (cpuBudget >= 100) return 'AMD Ryzen 5 5500';
    return 'AMD Ryzen 5 5500';
  } else {
    // AM5 — budget-gated CPU selection
    if (cpuBudget >= 739) {
      return isEditingOnly ? 'AMD Ryzen 9 9950X' : 'AMD Ryzen 9 9950X3D';
    }
    if (cpuBudget >= 489) return wantsSingleCore ? 'AMD Ryzen 7 9800X3D' : (isEditingOnly ? 'AMD Ryzen 9 9900X' : 'AMD Ryzen 7 9800X3D');
    if (cpuBudget >= 439) return wantsSingleCore ? 'AMD Ryzen 7 7800X3D' : 'AMD Ryzen 7 7800X3D';
    if (cpuBudget >= 399) return isWorkflow ? 'AMD Ryzen 9 9900X' : 'AMD Ryzen 9 9900X';
    if (cpuBudget >= 349) return 'AMD Ryzen 7 9700X';
    if (cpuBudget >= 289) return 'AMD Ryzen 7 7700X';
    if (cpuBudget >= 209) return 'AMD Ryzen 5 9600X';
    if (cpuBudget >= 190) return 'AMD Ryzen 5 7600X';
    if (cpuBudget >= 180) return 'AMD Ryzen 5 7500F';
    return 'AMD Ryzen 5 7500F';
  }
}

// Legacy wrapper used by generateBuildForBudget
function pickCpu(platform, targetBudget, hasContent, hasEditing, selectedGames) {
  // CPU budget = roughly 15% of total for AM4, 20% for AM5
  const cpuBudget = platform === 'AM4' ? targetBudget * 0.15 : targetBudget * 0.18;
  return pickCpuForPlatform(platform, cpuBudget, hasContent, hasEditing, selectedGames);
}

function getPartPrice(category, partName) {
  const list = PARTS_DB[category] || [];
  const found = list.find(p => p.name === partName);
  return found ? found.price : 0;
}

function getBasePriceForBuild(name) {
  return DAILY_PC_PRICES[name] || 999.99;
}

function generateBuildForBudget(targetBudget, form, seed = 0) {
  const { colorPref, selectedGames, selectedUses, ramPrefs, storagePrefs, coolingPrefs, gpuBrandPrefs, platformPref } = form;
  const hasContent = selectedUses.includes('content_creation');
  const hasEditing = selectedUses.includes('video_editing');
  const isEditingOnly = hasEditing && !hasContent && selectedGames.length === 0;

  // "no_preference" → treat as black (cheaper)
  const effectiveColor = colorPref === 'no_preference' ? 'black' : colorPref;
  const isWhite = effectiveColor === 'white';

  // ── Platform / RAM type ───────────────────────────────────────────────────
  let platform, ramType;
  if (platformPref === 'ddr4') { platform = 'AM4'; ramType = 'DDR4'; }
  else if (platformPref === 'ddr5') { platform = 'AM5'; ramType = 'DDR5'; }
  else {
    platform = targetBudget < 1300 ? 'AM4' : 'AM5';
    ramType = platform === 'AM4' ? 'DDR4' : 'DDR5';
  }
  // DDR5 builds get a minimum 650W PSU later
  const isDDR5 = ramType === 'DDR5';
  const caseSize = platform === 'AM5' ? 'ATX_Case' : 'mATX_Case';
  const isMATX = caseSize === 'mATX_Case';

  let baseName;
  if (platform === 'AM4') baseName = isWhite ? 'ZTW-2' : 'ZTB-1';
  else if (targetBudget >= 2000) baseName = isWhite ? 'ZTW-5' : 'ZTB-4';
  else baseName = 'ZTB-3';

  const baseBuild = BASE_BUILDS[baseName];
  const basePrice = getBasePriceForBuild(baseName);
  const config = { ...baseBuild };

  // ── Step 1: GPU-first selection ───────────────────────────────────────────
  let gpus = PARTS_DB.gpu.slice();

  if (gpuBrandPrefs.length > 0) {
    const brandMap = { nvidia: 'NVIDIA', amd_gpu: 'AMD', intel_gpu: 'Intel' };
    const wantedBrands = gpuBrandPrefs.map(b => brandMap[b]).filter(Boolean);
    const filtered = gpus.filter(g => wantedBrands.includes(g.brand));
    if (filtered.length > 0) gpus = filtered;
  } else {
    if (targetBudget >= 1400) gpus = gpus.filter(g => g.brand !== 'Intel');
    if ((hasContent || hasEditing)) {
      const nv = gpus.filter(g => g.brand === 'NVIDIA');
      if (nv.length > 0) gpus = nv;
    }
  }

  if (isWhite) {
    const white = gpus.filter(g => g.color === 'white');
    if (white.length > 0) gpus = white;
  } else {
    const nonWhite = gpus.filter(g => g.color !== 'white');
    if (nonWhite.length > 0) gpus = nonWhite;
  }

  gpus = gpus.sort((a, b) => a.price - b.price);

  // GPU budget: ~50% of total budget, but leave room for everything else (~$500 floor for other parts)
  const minOtherCosts = isDDR5 ? 620 : 500;
  const gpuMaxBudget = targetBudget - minOtherCosts;
  let affordableGpus = gpus.filter(g => g.price <= gpuMaxBudget);
  if (affordableGpus.length === 0) affordableGpus = [gpus[0]].filter(Boolean);

  // seed shifts GPU tier (0 = best affordable, 1 = one below, etc.)
  const gpuIdx = Math.max(0, affordableGpus.length - 1 - seed);
  const bestGpu = affordableGpus[gpuIdx] || gpus[0];
  if (bestGpu) config.gpu = bestGpu.name;

  // ── Step 2: CPU to match GPU ──────────────────────────────────────────────
  // CPU budget is roughly remaining budget after GPU, spending ~20% of total on CPU
  const cpuBudgetTarget = targetBudget * (platform === 'AM4' ? 0.15 : 0.20);
  config.cpu = pickCpuForPlatform(platform, cpuBudgetTarget, hasContent, hasEditing, selectedGames);

  // ── Step 3: RAM ───────────────────────────────────────────────────────────
  let ramTarget;
  if (ramPrefs.includes('64GB')) ramTarget = '64GB';
  else if (ramPrefs.includes('32GB')) ramTarget = '32GB';
  else if (ramPrefs.includes('16GB')) ramTarget = '16GB';
  else {
    // DDR5 builds: use 16GB for $1350-$1600, else 32GB; upgrade to 64GB only if maxed CPU
    if (isDDR5) {
      if (targetBudget <= 1600) ramTarget = '16GB';
      else if (targetBudget <= 2500) ramTarget = '32GB';
      else {
        // Check if CPU is already maxed out
        const cpuMaxed = config.cpu === 'AMD Ryzen 9 9950X3D' || config.cpu === 'AMD Ryzen 9 9950X';
        ramTarget = cpuMaxed ? '64GB' : '32GB';
      }
    } else {
      if (targetBudget >= 3500) ramTarget = '64GB';
      else if (targetBudget >= 1700) ramTarget = '32GB';
      else ramTarget = '16GB';
    }
  }

  if (seed >= 2 && ramTarget === '16GB' && targetBudget >= 1300) ramTarget = '32GB';
  if (seed >= 3 && ramTarget === '32GB' && targetBudget >= 2500 && !isDDR5) ramTarget = '64GB';
  if ((hasEditing || hasContent) && ramTarget === '16GB') ramTarget = '32GB';

  config.ram = `${ramTarget} ${ramType === 'DDR4' ? 'DDR4' : 'DDR5'}`;

  // ── Step 4: Storage — based on GPU+CPU+RAM combined cost ─────────────────
  const gpuPrice = bestGpu ? bestGpu.price : 0;
  const cpuData = PARTS_DB.cpu.find(c => c.name === config.cpu);
  const cpuPrice = cpuData ? cpuData.price : 0;
  const ramData = PARTS_DB.ram.find(r => r.name === config.ram);
  const ramPrice = ramData ? ramData.price : 0;
  const coreCost = gpuPrice + cpuPrice + ramPrice;

  let storageTarget;
  if (storagePrefs.includes('4TB')) storageTarget = '4TB';
  else if (storagePrefs.includes('2TB')) storageTarget = '2TB';
  else if (storagePrefs.includes('1TB')) storageTarget = '1TB';
  else {
    if (coreCost >= 2500) storageTarget = seed % 2 === 0 ? '2TB' : '4TB';
    else if (coreCost >= 1300) storageTarget = '2TB';
    else if (coreCost >= 1000) storageTarget = seed % 2 === 0 ? '1TB' : '2TB';
    else storageTarget = '1TB';
  }
  if (hasContent && storageTarget === '1TB') storageTarget = '2TB';
  if (seed >= 1 && storageTarget === '1TB' && targetBudget >= 1700) storageTarget = '2TB';
  config.storage = `${storageTarget} M.2 SSD`;

  // ── Step 5: PSU — from GPU min_psu or GPU+CPU TDP + 200W ─────────────────
  const gpuInfo = PARTS_DB.gpu.find(g => g.name === config.gpu) || bestGpu;
  const cpuInfo = PARTS_DB.cpu.find(c => c.name === config.cpu);
  const gpuTdp = gpuInfo?.tdp || 0;
  const cpuTdp = cpuInfo?.tdp || 65;

  let requiredWatts;
  if (gpuInfo?.min_psu) {
    requiredWatts = gpuInfo.min_psu;
  } else {
    const rawNeeded = gpuTdp + cpuTdp + 200;
    // Round up to nearest PSU tier
    if (rawNeeded <= 550) requiredWatts = 550;
    else if (rawNeeded <= 650) requiredWatts = 650;
    else if (rawNeeded <= 750) requiredWatts = 750;
    else requiredWatts = 850;
  }
  // DDR5 minimum 650W
  if (isDDR5 && requiredWatts < 650) requiredWatts = 650;
  // DDR4 / non-DDR5 builds can use 550W
  // DDR5 builds should NOT get 550W PSU

  const psusSorted = PARTS_DB.psu.slice().sort((a, b) => (a.wattage || 0) - (b.wattage || 0));
  let psuPick;
  if (isWhite) {
    psuPick = psusSorted.find(p => (p.wattage || 0) >= requiredWatts && p.color === 'white')
           || psusSorted.find(p => (p.wattage || 0) >= requiredWatts);
  } else {
    psuPick = psusSorted.find(p => (p.wattage || 0) >= requiredWatts && p.color !== 'white')
           || psusSorted.find(p => (p.wattage || 0) >= requiredWatts);
  }
  if (psuPick) config.psu = psuPick.name;

  // ── Step 6: CPU Cooler — TDP-based with AIO size preference ──────────────
  const cpuTdpForCooler = cpuInfo?.tdp || 65;
  const wantsLCD = coolingPrefs.includes('aio_lcd') && !isMATX;
  const wantsAio = coolingPrefs.includes('aio') || (coolingPrefs.length === 0 && platform === 'AM5');
  const wantsAir = coolingPrefs.includes('air') && !coolingPrefs.includes('aio') && !wantsLCD;

  let coolerCandidates = PARTS_DB.cooler.slice();
  if (isWhite) {
    const wc = coolerCandidates.filter(c => c.color === 'white');
    if (wc.length > 0) coolerCandidates = wc;
  } else {
    const nc = coolerCandidates.filter(c => c.color !== 'white');
    if (nc.length > 0) coolerCandidates = nc;
  }

  // Filter by case support
  if (isMATX) coolerCandidates = coolerCandidates.filter(c => c.tags?.includes('mATX'));

  // Filter by preferred type
  let typedCoolers = coolerCandidates;
  if (wantsLCD) typedCoolers = coolerCandidates.filter(c => c.type === 'aio_lcd');
  else if (wantsAir) typedCoolers = coolerCandidates.filter(c => c.type === 'air');
  else if (wantsAio) typedCoolers = coolerCandidates.filter(c => c.type === 'aio');
  if (typedCoolers.length === 0) typedCoolers = coolerCandidates;

  // Find cooler that can handle this CPU's TDP — pick minimum sufficient
  const suffCoolers = typedCoolers.filter(c => !c.max_tdp || c.max_tdp >= cpuTdpForCooler).sort((a, b) => (a.max_tdp || 999) - (b.max_tdp || 999));
  const coolerPick = suffCoolers[0] || typedCoolers.sort((a, b) => (b.max_tdp || 0) - (a.max_tdp || 0))[0];
  if (coolerPick) config.cooler = coolerPick.name;

  // ── Step 7: Motherboard ───────────────────────────────────────────────────
  const mobos = getCompatibleParts('motherboard', platform, ramType, caseSize).sort((a, b) => a.price - b.price);
  let moboOptions = mobos;
  if (isWhite) {
    const white = mobos.filter(m => m.color === 'white');
    if (white.length > 0) moboOptions = white;
  }
  const baseMotherboardCost = getPartPrice('motherboard', baseBuild.motherboard);
  const remaining = targetBudget - basePrice - WINDOWS_KEY_FEE;
  const mobosBudget = remaining * 0.12;
  const affordableMobos = moboOptions.filter(m => m.price - baseMotherboardCost <= mobosBudget);
  const bestMobo = affordableMobos.pop() || moboOptions[0];
  if (bestMobo) config.motherboard = bestMobo.name;

  // ── Step 8: Cables ────────────────────────────────────────────────────────
  if (targetBudget >= 1299.99) {
    config.cables = isWhite ? 'White Cable Sleeves' : 'Black Cable Sleeves';
  } else {
    config.cables = 'No Cable Sleeves';
  }

  const totalPrice = calculateTotalPrice(basePrice, baseBuild, config);
  return { baseName, basePrice, config, totalPrice, platform, ramType, isPrebuilt: false };
}

// Check if a generated config matches a prebuilt closely enough to use it directly
function findMatchingPrebuilt(pcs, platform, isWhite, totalBudget) {
  const dailyPcs = pcs.filter(p => !p.is_weekly && p.visible !== false);
  for (const pc of dailyPcs) {
    const price = pc.on_sale && pc.sale_price ? pc.sale_price : pc.base_price;
    if (!price) continue;
    // Color match
    const pcIsWhite = (pc.color_theme === 'white') || (pc.name || '').includes('W');
    if (isWhite && !pcIsWhite) continue;
    if (!isWhite && pcIsWhite) continue;
    // Platform match
    const pcPlatform = pc.platform || (BASE_BUILDS[pc.name]?.platform);
    if (pcPlatform && pcPlatform !== platform) continue;
    // Budget match: price must be within range
    if (price <= totalBudget + 100) {
      return { pc, price };
    }
  }
  return null;
}

export default function CustomBuild() {
  const navigate = useNavigate();
  const { data: pcs = [] } = useQuery({
    queryKey: ['pcs'],
    queryFn: () => db.entities.PC.list('sort_order'),
    initialData: [],
  });
  const [step, setStep] = useState(0);
  const [budgetRange, setBudgetRange] = useState([600, 2000]);
  const [colorPref, setColorPref] = useState('no_preference');
  const [selectedGames, setSelectedGames] = useState([]);
  const [selectedUses, setSelectedUses] = useState([]);
  const [ramPrefs, setRamPrefs] = useState([]);
  const [storagePrefs, setStoragePrefs] = useState([]);
  const [coolingPrefs, setCoolingPrefs] = useState([]);
  const [cpuBrandPref, setCpuBrandPref] = useState(null);
  const [gpuBrandPrefs, setGpuBrandPrefs] = useState([]);
  const [platformPref, setPlatformPref] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showMoreSeed, setShowMoreSeed] = useState(1);
  const [form, setForm] = useState(null);
  const [selectedBuild, setSelectedBuild] = useState(null);

  const toggleGame = (val) => setSelectedGames(prev => prev.includes(val) ? prev.filter(g => g !== val) : [...prev, val]);
  const toggleUse = (val) => setSelectedUses(prev => prev.includes(val) ? prev.filter(u => u !== val) : [...prev, val]);
  const toggleMulti = (setter) => (val) => setter(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]);

  const generateRecommendations = (currentForm, seed = 0, budMin, budMax) => {
    const games = currentForm.selectedGames.length === 0 ? ['all'] : currentForm.selectedGames;
    const formWithGames = { ...currentForm, selectedGames: games };

    const range = budMax - budMin;
    const midpoints = range < 200
      ? [Math.max(budMin, budMin + range * 0.25), budMin + range * 0.5, budMin + range * 0.75, budMax]
      : [budMin + range * 0.1, budMin + range * 0.35, budMin + range * 0.65, budMin + range * 0.9];

    const labels = range < 200
      ? ['Option A', 'Option B', 'Option C', 'Option D']
      : ['Budget', 'Mid', 'High-Mid', 'Premium'];

    const results = midpoints.map((midpoint, i) => {
      const build = generateBuildForBudget(Math.max(midpoint, 500), formWithGames, seed + i);
      const outOfRange = build.totalPrice < budMin - 50 || build.totalPrice > budMax + 200;
      return { ...build, tierLabel: labels[i], outOfRange };
    }).filter(Boolean);

    // Deduplicate by GPU+CPU key before returning
    const seen = new Set();
    const deduped = results.filter(r => {
      const key = `${r.config.gpu}|${r.config.cpu}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Replace generated builds with actual prebuilt PCs when they fit the budget + filters
    const isWhite = currentForm.colorPref === 'white';
    const finalResults = deduped.map(r => {
      if (r.outOfRange) return r;
      // Try to find a matching prebuilt in the DB
      const matchPlatform = r.platform;
      const match = findMatchingPrebuilt(pcs, matchPlatform, isWhite, r.totalPrice + 150);
      if (match && match.price >= budMin - 50 && match.price <= budMax + 200) {
        const staticBase = BASE_BUILDS[match.pc.name];
        if (staticBase) {
          const prebuiltConfig = {
            ...staticBase,
            cpu: match.pc.base_cpu || staticBase.cpu,
            gpu: match.pc.base_gpu || staticBase.gpu,
            ram: match.pc.base_ram || staticBase.ram,
            storage: match.pc.base_storage || staticBase.storage,
            cooler: match.pc.base_cooler || staticBase.cooler,
            psu: match.pc.base_psu || staticBase.psu,
            motherboard: match.pc.base_motherboard || staticBase.motherboard,
            cables: match.pc.base_cables || staticBase.cables,
          };
          return {
            ...r,
            baseName: match.pc.name,
            basePrice: match.price,
            config: prebuiltConfig,
            totalPrice: match.price,
            isPrebuilt: true,
          };
        }
      }
      return r;
    });

    const inRange = finalResults.filter(r => !r.outOfRange);
    return inRange.length > 0 ? finalResults : null;
  };

  const handleGenerate = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 500));

    const currentForm = {
      colorPref, selectedGames, selectedUses, ramPrefs, storagePrefs,
      coolingPrefs, cpuBrandPref, gpuBrandPrefs, platformPref,
    };

    const results = generateRecommendations(currentForm, 0, budgetRange[0], budgetRange[1]);

    if (!results) {
      toast.error("Sorry! There aren't any configurations with that price.");
      setLoading(false);
      return;
    }

    setForm({ ...currentForm, budMin: budgetRange[0], budMax: budgetRange[1] });
    setRecommendations(results);
    setShowMoreSeed(1);
    setLoading(false);
    setStep(1);
  };

  const handleShowMore = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    const more = generateRecommendations(form, showMoreSeed, form.budMin, form.budMax);
    if (!more) {
      toast.info("No more different builds available for this configuration.");
      setLoading(false);
      return;
    }
    // Deduplicate by GPU+CPU+RAM+Storage combo
    const existingKeys = new Set(recommendations.map(r => `${r.config.gpu}|${r.config.cpu}|${r.config.ram}|${r.config.storage}`));
    const newBuilds = more.filter(r => !existingKeys.has(`${r.config.gpu}|${r.config.cpu}|${r.config.ram}|${r.config.storage}`));
    if (newBuilds.length === 0) {
      toast.info("No more different builds available for this configuration.");
      setLoading(false);
      return;
    }
    setRecommendations(prev => [...prev, ...newBuilds]);
    setShowMoreSeed(prev => prev + 1);
    setLoading(false);
  };

  // Step 2: viewing a specific build detail
  if (step === 2 && selectedBuild) {
    return (
      <div>
        <section className="relative min-h-[40vh] flex items-end overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-background via-accent/5 to-primary/5" />
          <div className="relative w-full max-w-[120rem] mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-32">
            <ScrollReveal>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold mb-4">
                Your <span className="text-primary glow-text-blue">Build</span>
              </h1>
            </ScrollReveal>
          </div>
        </section>
        <section className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <ScrollReveal>
            <div className="rounded-2xl border border-primary/20 bg-card/40 p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">{selectedBuild.tierLabel}</span>
                  <h3 className="text-xl font-heading font-bold">{selectedBuild.baseName}{selectedBuild.isPrebuilt ? '' : ' — Custom'}</h3>
                {selectedBuild.isPrebuilt && <span className="text-xs text-green-400 font-medium">⭐ Ready-Made Build</span>}
                </div>
                <p className="text-2xl font-heading font-bold text-primary">
                  ${selectedBuild.totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                {Object.entries(selectedBuild.config).filter(([k]) => ['cpu','gpu','ram','storage','cooler','psu','motherboard','cables'].includes(k)).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2 p-2.5 rounded-lg bg-background/50 border border-border/20">
                    <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                      {React.createElement(categoryIcons[key] || Cpu, { className: 'w-3 h-3 text-primary' })}
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs text-muted-foreground uppercase mr-1">{key}:</span>
                      <span className="text-xs font-medium">{value}</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mb-4">Windows 11 Pro Included</p>
              <button
                onClick={() => {
                  sessionStorage.setItem(`custom_config_${selectedBuild.baseName}`, JSON.stringify(selectedBuild.config));
                  navigate(`/shop/${selectedBuild.baseName}`);
                }}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all duration-200"
              >
                Configure & Buy <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={() => { setStep(1); setSelectedBuild(null); }}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" /> Back to builds
            </button>
          </ScrollReveal>
        </section>
      </div>
    );
  }

  return (
    <div>
      <section className="relative min-h-[40vh] flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-accent/5 to-primary/5" />
        <div className="absolute top-1/3 right-1/3 w-80 h-80 bg-accent/8 rounded-full blur-[120px]" />
        <div className="relative w-full max-w-[120rem] mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-32">
          <ScrollReveal>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold mb-4">
              Request Custom <span className="text-primary glow-text-blue">Build</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl">
              Tell us what you need and we'll recommend the perfect build for you.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <section className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {step === 0 && (
          <ScrollReveal>
            <div className="space-y-10">

              {/* Budget */}
              <div className="rounded-2xl bg-card/30 border border-border/20 p-6 sm:p-8">
                <h3 className="text-lg font-heading font-semibold mb-2">💰 Budget Range</h3>
                <p className="text-xs text-muted-foreground/70 mb-6">Set your min and max budget. We'll find the best builds within range.</p>
                <Slider value={budgetRange} onValueChange={setBudgetRange} min={0} max={5000} step={50} className="mb-4" />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>${budgetRange[0].toLocaleString()}</span>
                  <span>${budgetRange[1].toLocaleString()}</span>
                </div>
              </div>

              {/* Use cases */}
              <div className="rounded-2xl bg-card/30 border border-border/20 p-6 sm:p-8">
                <h3 className="text-lg font-heading font-semibold mb-2">🖥️ What will you use this PC for?</h3>
                <p className="text-sm text-muted-foreground mb-4">Select all that apply</p>
                <div className="flex flex-wrap gap-3">
                  {useCases.map(u => (
                    <Chip key={u.value} selected={selectedUses.includes(u.value)} onClick={() => toggleUse(u.value)}>
                      <u.icon className="w-4 h-4 inline mr-1.5" />{u.label}
                    </Chip>
                  ))}
                </div>
              </div>

              {/* Games */}
              <div className="rounded-2xl bg-card/30 border border-border/20 p-6 sm:p-8">
                <h3 className="text-lg font-heading font-semibold mb-2">🎮 What types of games do you mostly play?</h3>
                <p className="text-sm text-muted-foreground mb-4">Optional — defaults to "All Games"</p>
                <div className="flex flex-wrap gap-3">
                  {gameTypes.map(g => (
                    <Chip key={g.value} selected={selectedGames.includes(g.value)} onClick={() => toggleGame(g.value)}>
                      {g.label}
                    </Chip>
                  ))}
                </div>
              </div>

              {/* GPU Brand */}
              <div className="rounded-2xl bg-card/30 border border-border/20 p-6 sm:p-8">
                <h3 className="text-lg font-heading font-semibold mb-1">🎮 GPU Brand</h3>
                <p className="text-xs text-muted-foreground/70 mb-4">Note: Intel GPUs are only recommended for budget AM4 builds</p>
                <div className="flex flex-wrap gap-3">
                  {gpuBrands.map(opt => (
                    <Chip key={opt.value} selected={gpuBrandPrefs.includes(opt.value)} onClick={() => toggleMulti(setGpuBrandPrefs)(opt.value)}>
                      {opt.label}
                    </Chip>
                  ))}
                </div>
              </div>

              {/* CPU Brand */}
              <div className="rounded-2xl bg-card/30 border border-border/20 p-6 sm:p-8">
                <h3 className="text-lg font-heading font-semibold mb-2">🔧 CPU Brand</h3>
                <p className="text-sm text-muted-foreground mb-4">Intel support coming soon</p>
                <div className="flex flex-wrap gap-3">
                  <Chip selected={cpuBrandPref === 'amd'} onClick={() => setCpuBrandPref(prev => prev === 'amd' ? null : 'amd')}>🔴 AMD</Chip>
                  <div className="relative">
                    <Chip disabled>🔵 Intel</Chip>
                    <span className="absolute -top-2 -right-2 text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">Soon</span>
                  </div>
                </div>
              </div>

              {/* Platform */}
              <div className="rounded-2xl bg-card/30 border border-border/20 p-6 sm:p-8">
                <h3 className="text-lg font-heading font-semibold mb-2">⚡ Platform</h3>
                <p className="text-sm text-muted-foreground mb-4">DDR5 is the newer platform with faster memory. DDR4 offers great value.</p>
                <div className="flex flex-wrap gap-3">
                  {[{ value: 'ddr4', label: '🔷 DDR4' }, { value: 'ddr5', label: '🔶 DDR5' }].map(opt => (
                    <Chip key={opt.value} selected={platformPref === opt.value} onClick={() => setPlatformPref(prev => prev === opt.value ? null : opt.value)}>
                      {opt.label}
                    </Chip>
                  ))}
                </div>
              </div>

              {/* RAM */}
              <div className="rounded-2xl bg-card/30 border border-border/20 p-6 sm:p-8">
                <h3 className="text-lg font-heading font-semibold mb-4">🧠 RAM Amount</h3>
                <div className="flex flex-wrap gap-3">
                  {ramOptions.map(r => (
                    <Chip key={r} selected={ramPrefs.includes(r)} onClick={() => toggleMulti(setRamPrefs)(r)}>{r}</Chip>
                  ))}
                </div>
              </div>

              {/* Storage */}
              <div className="rounded-2xl bg-card/30 border border-border/20 p-6 sm:p-8">
                <h3 className="text-lg font-heading font-semibold mb-4">💾 Storage Amount</h3>
                <div className="flex flex-wrap gap-3">
                  {storageOptions.map(s => (
                    <Chip key={s} selected={storagePrefs.includes(s)} onClick={() => toggleMulti(setStoragePrefs)(s)}>{s}</Chip>
                  ))}
                </div>
              </div>

              {/* CPU Cooling */}
              <div className="rounded-2xl bg-card/30 border border-border/20 p-6 sm:p-8">
                <h3 className="text-lg font-heading font-semibold mb-2">❄️ CPU Cooling</h3>
                <p className="text-sm text-muted-foreground mb-4">AIO Screen has a built-in display. Note: 360mm AIO / AIO Screen only fits ATX cases.</p>
                <div className="flex flex-wrap gap-3">
                  {coolingOptions.map(opt => (
                    <Chip key={opt.value} selected={coolingPrefs.includes(opt.value)} onClick={() => toggleMulti(setCoolingPrefs)(opt.value)}>
                      {opt.label}
                    </Chip>
                  ))}
                </div>
              </div>

              {/* Color */}
              <div className="rounded-2xl bg-card/30 border border-border/20 p-6 sm:p-8">
                <h3 className="text-lg font-heading font-semibold mb-2">🎨 Color</h3>
                <p className="text-xs text-muted-foreground/70 mb-4">Note: White PC builds may be priced slightly higher due to white component availability.</p>
                <div className="flex flex-wrap gap-3">
                  {[{ value: 'black', label: '🖤 Black' }, { value: 'white', label: '🤍 White' }, { value: 'no_preference', label: '🌗 No Preference' }].map(opt => (
                    <Chip key={opt.value} selected={colorPref === opt.value} onClick={() => setColorPref(opt.value)}>
                      {opt.label}
                    </Chip>
                  ))}
                </div>
              </div>

              <GlowButton onClick={handleGenerate} variant="accent" size="lg" className="w-full" disabled={loading}>
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                ) : (
                  <Zap className="w-5 h-5 mr-2" />
                )}
                Generate Recommendations
              </GlowButton>
            </div>
          </ScrollReveal>
        )}

        {step === 1 && recommendations.length > 0 && (
          <ScrollReveal>
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl sm:text-3xl font-heading font-bold mb-2">Your Recommended Builds</h2>
                <p className="text-muted-foreground">All builds are within your ${form?.budMin?.toLocaleString()} – ${form?.budMax?.toLocaleString()} budget</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className={`rounded-2xl border p-6 cursor-pointer transition-all duration-200 hover:border-primary/40 hover:shadow-[0_0_30px_rgba(59,130,246,0.12)] ${
                      rec.outOfRange
                        ? 'border-destructive/30 bg-destructive/5 opacity-60'
                        : 'border-primary/20 bg-card/40 shadow-[0_0_30px_rgba(59,130,246,0.08)]'
                    }`}
                    onClick={() => { if (!rec.outOfRange) { setSelectedBuild(rec); setStep(2); } }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="text-xs text-muted-foreground uppercase tracking-wider">{rec.tierLabel}</span>
                        <h3 className="text-lg font-heading font-bold">{rec.baseName}{rec.isPrebuilt ? '' : ' — Custom'}</h3>
                        {rec.isPrebuilt && <span className="text-xs text-green-400 font-medium">⭐ Ready-Made Build</span>}
                      </div>
                      <p className={`text-xl font-heading font-bold ${rec.outOfRange ? 'text-destructive' : 'text-primary'}`}>
                        ${rec.totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>

                    {rec.outOfRange && (
                      <p className="text-xs text-destructive mb-3">⚠️ Outside your selected budget range.</p>
                    )}

                    <div className="grid grid-cols-1 gap-2 mb-4">
                      {Object.entries(rec.config).filter(([k]) => ['cpu','gpu','ram','storage','cooler'].includes(k)).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-2 p-2 rounded-lg bg-background/50 border border-border/20">
                          <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                            {React.createElement(categoryIcons[key] || Cpu, { className: 'w-3 h-3 text-primary' })}
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs text-muted-foreground uppercase mr-1">{key}:</span>
                            <span className="text-xs font-medium">{value}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <p className="text-xs text-muted-foreground mb-3">Windows 11 Pro Included</p>

                    {!rec.outOfRange && (
                      <div className="flex items-center gap-1 text-xs text-primary font-medium">
                        Click to view & configure <ArrowRight className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Show More */}
              <button
                onClick={handleShowMore}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-border/30 bg-card/20 text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all duration-200 disabled:opacity-50"
              >
                {loading ? <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /> : '+ Show More Builds'}
              </button>

              <GlowButton onClick={() => { setStep(0); setRecommendations([]); setSelectedBuild(null); }} variant="secondary" size="lg" className="w-full">
                Edit Configuration
              </GlowButton>
            </div>
          </ScrollReveal>
        )}
      </section>
    </div>
  );
}

const categoryIcons = { cpu: Cpu, gpu: Monitor, ram: MemoryStick, storage: HardDrive, cooler: Fan, psu: Zap, motherboard: CircuitBoard, cables: Cable };
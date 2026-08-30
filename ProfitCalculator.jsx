const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { PARTS_DB, BASE_BUILDS, DAILY_PC_PRICES, WINDOWS_KEY_FEE } from '../../lib/pcData';
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';

function getPartCost(category, partName) {
  // Check DB parts first (have my_cost), fall back to static
  return null; // filled by lookup below
}

export default function ProfitCalculator({ dbPartsByCategory }) {
  const [selectedPc, setSelectedPc] = useState('');
  const [config, setConfig] = useState({});

  const { data: pcs = [] } = useQuery({
    queryKey: ['admin-pcs'],
    queryFn: () => db.entities.PC.list('sort_order'),
    initialData: [],
  });

  const allPcs = pcs.filter(p => !p.is_weekly);

  const getPartMyCost = (category, partName) => {
    // Look in dbPartsByCategory first (DB has my_cost)
    const dbList = dbPartsByCategory?.[category] || [];
    const dbPart = dbList.find(p => p.name === partName);
    if (dbPart?.my_cost) return parseFloat(dbPart.my_cost);
    return null; // unknown
  };

  const handlePcSelect = (pcName) => {
    setSelectedPc(pcName);
    const pc = allPcs.find(p => p.name === pcName);
    if (pc) {
      setConfig({
        cpu: pc.base_cpu,
        gpu: pc.base_gpu,
        ram: pc.base_ram,
        storage: pc.base_storage,
        cooler: pc.base_cooler,
        psu: pc.base_psu,
        motherboard: pc.base_motherboard,
        cables: pc.base_cables,
      });
    }
  };

  const pc = allPcs.find(p => p.name === selectedPc);
  const salePrice = pc ? (pc.on_sale && pc.sale_price ? pc.sale_price : pc.base_price) : 0;

  const categories = ['cpu', 'gpu', 'ram', 'storage', 'cooler', 'psu', 'motherboard', 'cables'];

  let totalCost = 0;
  let missingCost = false;

  const rows = categories.map(cat => {
    const partName = config[cat];
    const myCost = partName ? getPartMyCost(cat, partName) : null;
    const customerPrice = partName ? (PARTS_DB[cat]?.find(p => p.name === partName)?.price ?? 0) : 0;
    if (myCost !== null) totalCost += myCost;
    else if (partName) missingCost = true;
    return { cat, partName, myCost, customerPrice };
  });

  // Add Windows key if it's a config (not base price includes it)
  const profit = salePrice > 0 ? salePrice - totalCost : null;

  return (
    <div className="rounded-2xl bg-card/40 border border-border/20 p-6">
      <h3 className="text-base font-heading font-semibold mb-4 flex items-center gap-2">
        <DollarSign className="w-4 h-4 text-green-400" /> Profit Calculator
      </h3>
      <p className="text-xs text-muted-foreground mb-4">Select a PC and make sure you've entered "My Cost" for all parts in PC Parts section.</p>

      <div className="mb-4">
        <label className="text-xs text-muted-foreground mb-1 block">Select PC</label>
        <select
          value={selectedPc}
          onChange={e => handlePcSelect(e.target.value)}
          className="w-full bg-background/50 border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="">— Choose a PC —</option>
          {allPcs.map(p => (
            <option key={p.id} value={p.name}>{p.display_name || p.name} — ${p.base_price?.toLocaleString()}</option>
          ))}
        </select>
      </div>

      {selectedPc && pc && (
        <div className="space-y-3">
          <div className="divide-y divide-border/10 rounded-xl border border-border/20 overflow-hidden">
            {rows.map(({ cat, partName, myCost, customerPrice }) => (
              <div key={cat} className="flex items-center justify-between px-4 py-2.5 text-xs bg-background/30">
                <div className="flex-1">
                  <span className="text-muted-foreground uppercase tracking-wider mr-2">{cat}</span>
                  <span className="font-medium">{partName || '—'}</span>
                </div>
                <div className="text-right">
                  {myCost !== null ? (
                    <span className="text-muted-foreground">${myCost.toFixed(2)}</span>
                  ) : partName ? (
                    <span className="text-yellow-400 italic">cost unknown</span>
                  ) : null}
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl bg-background/40 border border-border/20 p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Sale Price</span>
              <span className="font-semibold">${salePrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Parts Cost</span>
              <span className="font-semibold">${totalCost.toFixed(2)}</span>
            </div>
            {missingCost && (
              <p className="text-xs text-yellow-400">⚠️ Some parts are missing cost data — profit may be inaccurate.</p>
            )}
            <div className="border-t border-border/20 pt-2 flex justify-between">
              <span className="font-semibold">Estimated Profit</span>
              {profit !== null ? (
                <span className={`text-lg font-heading font-bold flex items-center gap-1 ${profit >= 0 ? 'text-green-400' : 'text-destructive'}`}>
                  {profit >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  ${profit.toFixed(2)}
                </span>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
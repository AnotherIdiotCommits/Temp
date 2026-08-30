const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import AdminGuard from '../../components/AdminGuard';
import ScrollReveal from '../../components/ui/ScrollReveal';
import { Input } from '@/components/ui/input';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
  ArrowLeft, ChevronDown, ChevronRight, Save, Upload, Plus, Trash2,
  CheckCircle, XCircle, Tag, ToggleLeft, ToggleRight, DollarSign,
  Cpu, Monitor, HardDrive, MemoryStick, Zap, CircuitBoard, Fan, Cable, Box, GripVertical
} from 'lucide-react';
import { toast } from 'sonner';
import { PARTS_DB } from '../../lib/pcData';
import ProfitCalculator from '../../components/admin/ProfitCalculator';

// ─── Collapsible Section ───────────────────────────────────────────────────
function Section({ title, children, defaultOpen = false, indent = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`rounded-2xl bg-card/40 border border-border/20 overflow-hidden mb-3 ${indent ? 'ml-4 border-primary/10' : ''}`}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-4 hover:bg-primary/5 transition-colors text-left"
      >
        <span className="font-heading font-semibold text-sm">{title}</span>
        {open ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
      </button>
      {open && <div className="border-t border-border/20 p-4">{children}</div>}
    </div>
  );
}

// ─── Daily PC Row ────────────────────────────────────────────────────────────
function DailyPCRow({ pc }) {
  const queryClient = useQueryClient();
  const [localPc, setLocalPc] = useState({ ...pc });
  const [uploading, setUploading] = useState(false);

  const cpuOptions = PARTS_DB.cpu.map(p => p.name);
  const gpuOptions = PARTS_DB.gpu.map(p => p.name);
  const ramOptions = PARTS_DB.ram.map(p => p.name);
  const storageOptions = PARTS_DB.storage.map(p => p.name);
  const coolerOptions = PARTS_DB.cooler.map(p => p.name);
  const psuOptions = PARTS_DB.psu.map(p => p.name);
  const motherboardOptions = PARTS_DB.motherboard.map(p => p.name);
  const cablesOptions = PARTS_DB.cables.map(p => p.name);

  const updateMutation = useMutation({
    mutationFn: (data) => db.entities.PC.update(pc.id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-pcs'] }); toast.success('Saved!'); },
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await db.integrations.Core.UploadFile({ file });
    setLocalPc(prev => ({ ...prev, image_url: file_url }));
    setUploading(false);
    toast.success('Image uploaded — hit Save to apply.');
  };

  const partField = (label, key, options) => (
    <div key={key}>
      <label className="text-xs text-muted-foreground mb-1 block">{label}</label>
      <select
        value={localPc[key] || ''}
        onChange={e => setLocalPc(p => ({ ...p, [key]: e.target.value }))}
        className="w-full bg-background/50 border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
      >
        <option value="">— Select —</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  return (
    <Section title={`${localPc.display_name || localPc.name} — $${localPc.base_price?.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}>
      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Display Name</label>
            <Input value={localPc.display_name || ''} onChange={e => setLocalPc(p => ({ ...p, display_name: e.target.value }))} className="bg-background/50" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Base Price ($)</label>
            <Input type="number" value={localPc.base_price || ''} onChange={e => setLocalPc(p => ({ ...p, base_price: parseFloat(e.target.value) }))} className="bg-background/50" />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs text-muted-foreground mb-1 block">Description</label>
            <Input value={localPc.description || ''} onChange={e => setLocalPc(p => ({ ...p, description: e.target.value }))} className="bg-background/50" />
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Base Specs</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {partField('CPU', 'base_cpu', cpuOptions)}
            {partField('GPU', 'base_gpu', gpuOptions)}
            {partField('RAM', 'base_ram', ramOptions)}
            {partField('Storage', 'base_storage', storageOptions)}
            {partField('Cooler', 'base_cooler', coolerOptions)}
            {partField('PSU', 'base_psu', psuOptions)}
            {partField('Motherboard', 'base_motherboard', motherboardOptions)}
            {partField('Cable Sleeves', 'base_cables', cablesOptions)}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Image</p>
          <div className="flex items-center gap-3 flex-wrap">
            {localPc.image_url && (
              <img src={localPc.image_url} alt="PC" className="w-20 h-20 rounded-xl object-cover border border-border/20" />
            )}
            <label className="cursor-pointer flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border/20 bg-card/30 hover:border-primary/30 text-sm transition-colors">
              <Upload className="w-4 h-4" />
              {uploading ? 'Uploading...' : 'Upload Image'}
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
            {localPc.image_url && (
              <button
                onClick={() => setLocalPc(prev => ({ ...prev, image_url: '' }))}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-destructive/30 text-destructive text-xs hover:bg-destructive/10 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Remove Image
              </button>
            )}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Status</p>
          <div className="flex flex-wrap gap-3">
            <div className="flex gap-2">
              <button onClick={() => setLocalPc(p => ({ ...p, sold_out: true }))} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-all ${localPc.sold_out ? 'border-destructive/50 bg-destructive/10 text-destructive' : 'border-border/20 bg-card/20 text-muted-foreground'}`}>
                <XCircle className="w-3.5 h-3.5" /> Sold Out
              </button>
              <button onClick={() => setLocalPc(p => ({ ...p, sold_out: false }))} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-all ${!localPc.sold_out ? 'border-green-500/50 bg-green-500/10 text-green-400' : 'border-border/20 bg-card/20 text-muted-foreground'}`}>
                <CheckCircle className="w-3.5 h-3.5" /> In Stock
              </button>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setLocalPc(p => ({ ...p, visible: true }))} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-all ${localPc.visible !== false ? 'border-primary/50 bg-primary/10 text-primary' : 'border-border/20 bg-card/20 text-muted-foreground'}`}>
                <ToggleRight className="w-3.5 h-3.5" /> Visible
              </button>
              <button onClick={() => setLocalPc(p => ({ ...p, visible: false }))} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-all ${localPc.visible === false ? 'border-border/50 bg-card/30 text-foreground' : 'border-border/20 bg-card/20 text-muted-foreground'}`}>
                <ToggleLeft className="w-3.5 h-3.5" /> Hidden
              </button>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setLocalPc(p => ({ ...p, on_sale: true }))} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-all ${localPc.on_sale ? 'border-green-500/50 bg-green-500/10 text-green-400' : 'border-border/20 bg-card/20 text-muted-foreground'}`}>
                <Tag className="w-3.5 h-3.5" /> On Sale
              </button>
              <button onClick={() => setLocalPc(p => ({ ...p, on_sale: false }))} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-all ${!localPc.on_sale ? 'border-border/50 bg-card/30 text-foreground' : 'border-border/20 bg-card/20 text-muted-foreground'}`}>
                Not On Sale
              </button>
            </div>
            {localPc.on_sale && (
              <div className="flex items-center gap-2 w-full">
                <label className="text-xs text-muted-foreground whitespace-nowrap">Sale Price ($):</label>
                <Input type="number" value={localPc.sale_price || ''} onChange={e => setLocalPc(p => ({ ...p, sale_price: parseFloat(e.target.value) }))} className="bg-background/50 w-32 text-sm" />
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => updateMutation.mutate(localPc)}
          disabled={updateMutation.isPending}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </Section>
  );
}

// ─── Part Row (with edit + cost/profit) ─────────────────────────────────────
function PartRow({ part, category, onUpdate, onDelete, isStatic = false }) {
  const [expanded, setExpanded] = useState(false);
  const [local, setLocal] = useState({ ...part });

  const profit = local.my_cost ? (local.price - parseFloat(local.my_cost)) : null;

  const extraFields = {
    gpu:         ['tdp', 'length_mm', 'min_psu', 'brand', 'color', 'recommended_cpus', 'excluded_cpus', 'min_ram', 'max_ram'],
    cpu:         ['tdp', 'platform', 'brand', 'ram_type'],
    ram:         ['ram_type'],
    storage:     [],
    cooler:      ['max_tdp', 'type', 'color', 'aio_size'],
    psu:         ['wattage', 'color'],
    motherboard: ['brand', 'form_factor', 'platform', 'ram_type', 'color'],
    cables:      ['color'],
    cases:       ['form_factor', 'gpu_length_supported', 'color', 'max_aio_size'],
  };

  const fieldLabels = {
    tdp: 'TDP (Watts)', length_mm: 'Length (mm)', min_psu: 'Min PSU (W)',
    recommended_cpus: 'Supported CPUs (comma separated — if set, ONLY these are compatible)',
    excluded_cpus: 'Excluded CPUs (comma separated)',
    min_ram: 'Min RAM (16GB/32GB/64GB)', max_ram: 'Max RAM (16GB/32GB/64GB)',
    max_tdp: 'Max TDP Supported (W)', wattage: 'Wattage (W)',
    gpu_length_supported: 'Max GPU Length (mm)',
    aio_size: 'AIO Radiator Size',
    max_aio_size: 'Max AIO Radiator Supported',
  };

  const dropdownOptions = {
    brand: { gpu: ['NVIDIA', 'AMD', 'Intel'], cpu: ['AMD', 'Intel'], motherboard: ['Asus', 'MSI', 'Gigabyte', 'ASRock', 'EVGA'] },
    color: ['neutral', 'white', 'black'],
    type: ['air', 'aio', 'aio_lcd'],
    form_factor: ['mATX', 'ATX'],
    platform: ['AM4', 'AM5', 'Intel', 'both'],
    ram_type: ['DDR4', 'DDR5', 'both'],
    aio_size: ['0', '240mm', '280mm', '360mm', '420mm'],
    max_aio_size: ['0', '240mm', '280mm', '360mm', '420mm'],
  };

  const renderField = (field) => {
    const opts = field === 'brand' ? dropdownOptions.brand[category] : dropdownOptions[field];
    if (opts) {
      return (
        <div key={field}>
          <label className="text-xs text-muted-foreground mb-1 block">{fieldLabels[field] || field}</label>
          <select
            value={local[field] || ''}
            onChange={e => setLocal(p => ({ ...p, [field]: e.target.value }))}
            className="w-full bg-background/50 border border-input rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring h-8"
          >
            <option value="">— None —</option>
            {opts.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      );
    }
    return (
      <div key={field}>
        <label className="text-xs text-muted-foreground mb-1 block">{fieldLabels[field] || field}</label>
        <Input
          type={['tdp','max_tdp','min_psu','length_mm','gpu_length_supported','wattage'].includes(field) ? 'number' : 'text'}
          value={local[field] || ''}
          onChange={e => setLocal(p => ({ ...p, [field]: e.target.value }))}
          className="bg-background/50 text-sm h-8"
        />
      </div>
    );
  };

  return (
    <div className="rounded-lg border border-border/20 bg-background/30 overflow-hidden mb-2">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between p-3 hover:bg-primary/5 transition-colors text-left"
      >
        <div>
          <p className="text-sm font-medium">{local.name}</p>
          <p className="text-xs text-muted-foreground">
            Customer: ${local.price?.toFixed(2)}
            {local.my_cost ? ` | My Cost: $${parseFloat(local.my_cost).toFixed(2)}` : ''}
            {profit !== null ? ` | Profit: ` : ''}
            {profit !== null && <span className={profit >= 0 ? 'text-green-400' : 'text-destructive'}>${profit.toFixed(2)}</span>}
            {isStatic && <span className="ml-2 text-primary/70 italic">— click to edit & save to DB</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!isStatic && (
            <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="text-muted-foreground hover:text-destructive transition-colors p-1">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          {expanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
        </div>
      </button>
      {expanded && (
        <div className="border-t border-border/20 p-3 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Name</label>
              <Input value={local.name || ''} onChange={e => setLocal(p => ({ ...p, name: e.target.value }))} className="bg-background/50 text-sm h-8" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Customer Price ($)</label>
              <Input type="number" value={local.price || ''} onChange={e => setLocal(p => ({ ...p, price: parseFloat(e.target.value) }))} className="bg-background/50 text-sm h-8" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">My Cost ($)</label>
              <Input type="number" value={local.my_cost || ''} onChange={e => setLocal(p => ({ ...p, my_cost: parseFloat(e.target.value) }))} className="bg-background/50 text-sm h-8" placeholder="0.00" />
            </div>
            {profit !== null && (
              <div className="flex items-end gap-2 pb-1">
                <DollarSign className="w-4 h-4 text-muted-foreground mb-1" />
                <div>
                  <p className="text-xs text-muted-foreground">Profit</p>
                  <p className={`text-sm font-bold ${profit >= 0 ? 'text-green-400' : 'text-destructive'}`}>${profit.toFixed(2)}</p>
                </div>
              </div>
            )}
            {(extraFields[category] || []).map(field => renderField(field))}
          </div>
          <button
            onClick={() => onUpdate(local)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all"
          >
            <Save className="w-3.5 h-3.5" /> {isStatic ? 'Save to DB' : 'Save Part'}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Part Category Editor ────────────────────────────────────────────────────
function PartCategoryEditor({ category, label, IconComp }) {
  const queryClient = useQueryClient();
  const [adding, setAdding] = useState(false);
  const [newPart, setNewPart] = useState({ name: '', price: '', category });

  const { data: dbParts = [] } = useQuery({
    queryKey: ['admin-parts', category],
    queryFn: () => db.entities.Part.filter({ category }),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => db.entities.Part.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-parts', category] });
      setAdding(false);
      setNewPart({ name: '', price: '', category });
      toast.success(`${label} added!`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => db.entities.Part.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-parts', category] }); toast.success('Part updated!'); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => db.entities.Part.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-parts', category] }); toast.success('Part removed.'); },
  });

  // Merge DB parts with static catalog; DB parts override static ones by name
  const dbPartNames = new Set(dbParts.map(p => p.name));
  const staticParts = (PARTS_DB[category] || []).map((p, i) => ({ ...p, id: `static_${category}_${i}`, _static: true }));

  // Sort display parts: for CPU, show AM4 (DDR4) first then AM5 (DDR5); otherwise by price
  const sortParts = (parts) => {
    if (category === 'cpu') {
      const am4 = parts.filter(p => (p.tags || []).includes('DDR4') || (p.platform || '').includes('AM4')).sort((a, b) => (a.price || 0) - (b.price || 0));
      const am5 = parts.filter(p => (p.tags || []).includes('DDR5') || (p.platform || '').includes('AM5')).sort((a, b) => (a.price || 0) - (b.price || 0));
      const rest = parts.filter(p => !am4.includes(p) && !am5.includes(p));
      return [...am4, ...am5, ...rest];
    }
    return [...parts].sort((a, b) => (a.sort_order ?? a.price ?? 0) - (b.sort_order ?? b.price ?? 0));
  };

  const displayParts = sortParts([...dbParts, ...staticParts.filter(p => !dbPartNames.has(p.name))]);

  const newPartFields = {
    gpu: [['Brand (NVIDIA/AMD/Intel)', 'brand', 'text'], ['TDP (W)', 'tdp', 'number'], ['Length (mm)', 'length_mm', 'number'], ['Color (neutral/white/black)', 'color', 'text']],
    cpu: [['Brand (AMD/Intel)', 'brand', 'text'], ['TDP (W)', 'tdp', 'number'], ['Platform (AM4/AM5)', 'platform', 'text']],
    motherboard: [['Platform (AM4/AM5/Intel)', 'platform', 'text'], ['RAM Type (DDR4/DDR5)', 'ram_type', 'text'], ['Form Factor (mATX/ATX)', 'form_factor', 'text'], ['Color (neutral/white)', 'color', 'text']],
    cooler: [['Type (air/aio/aio_lcd)', 'type', 'text'], ['Max TDP (W)', 'max_tdp', 'number'], ['Color (neutral/white)', 'color', 'text']],
    psu: [['Wattage (W)', 'wattage', 'number'], ['Color (neutral/white)', 'color', 'text']],
    cables: [['Color (neutral/white/black)', 'color', 'text']],
    ram: [],
    storage: [],
    cases: [['Form Factor (mATX/ATX)', 'form_factor', 'text'], ['Max GPU Length (mm)', 'gpu_length_supported', 'number'], ['Color (neutral/white/black)', 'color', 'text']],
  };

  return (
    <Section title={
      <span className="flex items-center gap-2">
        {IconComp && <IconComp className="w-4 h-4 text-primary" />}
        {label}
      </span>
    } indent>
      <DragDropContext onDragEnd={(result) => {
        if (!result.destination) return;
        const dbOnly = displayParts.filter(p => !p._static);
        const srcIdx = result.source.index;
        const dstIdx = result.destination.index;
        if (srcIdx === dstIdx) return;
        const reordered = [...displayParts];
        const [moved] = reordered.splice(srcIdx, 1);
        reordered.splice(dstIdx, 0, moved);
        // Update sort_order for DB parts only
        reordered.forEach((p, i) => {
          if (!p._static) {
            updateMutation.mutate({ id: p.id, data: { sort_order: i } });
          }
        });
      }}>
        <Droppable droppableId={`parts-${category}`}>
          {(provided) => (
            <div className="space-y-1 mb-3" ref={provided.innerRef} {...provided.droppableProps}>
              {displayParts.map((part, idx) => (
                <Draggable key={part.id} draggableId={String(part.id)} index={idx} isDragDisabled={!!part._static}>
                  {(drag, snap) => (
                    <div ref={drag.innerRef} {...drag.draggableProps} className={snap.isDragging ? 'opacity-70' : ''}>
                      <div className="flex items-stretch gap-1">
                        {!part._static && (
                          <div {...drag.dragHandleProps} className="flex items-center px-1 text-muted-foreground/40 hover:text-muted-foreground cursor-grab">
                            <GripVertical className="w-3.5 h-3.5" />
                          </div>
                        )}
                        <div className="flex-1">
                          <PartRow
                            part={part}
                            category={category}
                            onUpdate={(data) => {
                              const { id, created_date, updated_date, created_by, _static, ...rest } = data;
                              if (part._static) {
                                createMutation.mutate({ ...rest, category });
                              } else {
                                updateMutation.mutate({ id: part.id, data: rest });
                              }
                            }}
                            onDelete={() => part._static ? null : deleteMutation.mutate(part.id)}
                            isStatic={part._static}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {adding ? (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
          <p className="text-sm font-medium">Add New {label}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Name</label>
              <Input value={newPart.name} onChange={e => setNewPart(p => ({ ...p, name: e.target.value }))} className="bg-background/50 text-sm" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Customer Price ($)</label>
              <Input type="number" value={newPart.price} onChange={e => setNewPart(p => ({ ...p, price: e.target.value }))} className="bg-background/50 text-sm" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">My Cost ($) — optional</label>
              <Input type="number" value={newPart.my_cost || ''} onChange={e => setNewPart(p => ({ ...p, my_cost: e.target.value }))} className="bg-background/50 text-sm" placeholder="0.00" />
            </div>
            {(newPartFields[category] || []).map(([lbl, key, type]) => (
              <div key={key}>
                <label className="text-xs text-muted-foreground mb-1 block">{lbl}</label>
                <Input type={type} value={newPart[key] || ''} onChange={e => setNewPart(p => ({ ...p, [key]: e.target.value }))} className="bg-background/50 text-sm" />
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (!newPart.name || !newPart.price) return toast.error('Name and price required');
                const data = { ...newPart, price: parseFloat(newPart.price) || 0, category };
                if (newPart.my_cost) data.my_cost = parseFloat(newPart.my_cost);
                if (newPart.tdp) data.tdp = parseFloat(newPart.tdp);
                if (newPart.max_tdp) data.max_tdp = parseFloat(newPart.max_tdp);
                if (newPart.wattage) data.wattage = parseFloat(newPart.wattage);
                if (newPart.length_mm) data.length_mm = parseFloat(newPart.length_mm);
                if (newPart.min_psu) data.min_psu = parseFloat(newPart.min_psu);
                if (newPart.gpu_length_supported) data.gpu_length_supported = parseFloat(newPart.gpu_length_supported);
                createMutation.mutate(data);
              }}
              disabled={createMutation.isPending}
              className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold disabled:opacity-50"
            >
              {createMutation.isPending ? 'Adding...' : 'Add'}
            </button>
            <button onClick={() => { setAdding(false); setNewPart({ name: '', price: '', category }); }} className="px-4 py-2 rounded-xl border border-border/30 text-xs text-muted-foreground">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-border/30 text-xs text-muted-foreground hover:border-primary/30 hover:text-foreground transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Add New {label}
        </button>
      )}
    </Section>
  );
}

// ─── Weekly PC Row ───────────────────────────────────────────────────────────
function WeeklyPCRow({ pc, onUpdate }) {
  const [local, setLocal] = useState({ ...pc });

  const cpuOptions = PARTS_DB.cpu.map(p => p.name);
  const gpuOptions = PARTS_DB.gpu.map(p => p.name);
  const ramOptions = PARTS_DB.ram.map(p => p.name);
  const storageOptions = PARTS_DB.storage.map(p => p.name);
  const coolerOptions = PARTS_DB.cooler.map(p => p.name);
  const psuOptions = PARTS_DB.psu.map(p => p.name);
  const motherboardOptions = PARTS_DB.motherboard.map(p => p.name);
  const cablesOptions = PARTS_DB.cables.map(p => p.name);

  const partField = (label, key, options) => (
    <div key={key}>
      <label className="text-xs text-muted-foreground mb-1 block">{label}</label>
      <select
        value={local[key] || ''}
        onChange={e => setLocal(p => ({ ...p, [key]: e.target.value }))}
        className="w-full bg-background/50 border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
      >
        <option value="">— Select —</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  return (
    <Section title={`${local.display_name || local.name} — ${local.weekly_status ? local.weekly_status.replace('_', ' ') : 'unset'}`} indent>
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Display Name</label>
            <Input value={local.display_name || ''} onChange={e => setLocal(p => ({ ...p, display_name: e.target.value }))} className="bg-background/50 text-sm" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Price ($)</label>
            <Input type="number" value={local.base_price || ''} onChange={e => setLocal(p => ({ ...p, base_price: parseFloat(e.target.value) }))} className="bg-background/50 text-sm" />
          </div>
          {partField('CPU', 'base_cpu', cpuOptions)}
          {partField('GPU', 'base_gpu', gpuOptions)}
          {partField('RAM', 'base_ram', ramOptions)}
          {partField('Storage', 'base_storage', storageOptions)}
          {partField('Cooler', 'base_cooler', coolerOptions)}
          {partField('PSU', 'base_psu', psuOptions)}
          {partField('Motherboard', 'base_motherboard', motherboardOptions)}
          {partField('Cable Sleeves', 'base_cables', cablesOptions)}
          <div className="sm:col-span-2">
            <label className="text-xs text-muted-foreground mb-1 block">Description</label>
            <Input value={local.description || ''} onChange={e => setLocal(p => ({ ...p, description: e.target.value }))} className="bg-background/50 text-sm" />
          </div>
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-2 block font-medium">Rotation Status</label>
          <div className="flex gap-2 flex-wrap">
            {['next_week', 'current', 'previous'].map(s => (
              <button key={s} onClick={() => setLocal(p => ({ ...p, weekly_status: s }))}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all capitalize ${local.weekly_status === s ? 'border-primary/50 bg-primary/10 text-primary' : 'border-border/20 bg-card/20 text-muted-foreground'}`}>
                {s.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button onClick={() => setLocal(p => ({ ...p, sold_out: true }))} className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${local.sold_out ? 'border-destructive/50 bg-destructive/10 text-destructive' : 'border-border/20 text-muted-foreground'}`}>
            <XCircle className="w-3 h-3" /> Sold Out
          </button>
          <button onClick={() => setLocal(p => ({ ...p, sold_out: false }))} className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${!local.sold_out ? 'border-green-500/50 bg-green-500/10 text-green-400' : 'border-border/20 text-muted-foreground'}`}>
            <CheckCircle className="w-3 h-3" /> In Stock
          </button>
          <button onClick={() => setLocal(p => ({ ...p, visible: true }))} className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${local.visible !== false ? 'border-primary/50 bg-primary/10 text-primary' : 'border-border/20 text-muted-foreground'}`}>
            <ToggleRight className="w-3 h-3" /> Visible
          </button>
          <button onClick={() => setLocal(p => ({ ...p, visible: false }))} className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${local.visible === false ? 'border-border/50 text-foreground' : 'border-border/20 text-muted-foreground'}`}>
            <ToggleLeft className="w-3 h-3" /> Hidden
          </button>
          <button onClick={() => setLocal(p => ({ ...p, on_sale: !p.on_sale }))} className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${local.on_sale ? 'border-green-500/50 bg-green-500/10 text-green-400' : 'border-border/20 text-muted-foreground'}`}>
            <Tag className="w-3 h-3" /> {local.on_sale ? 'On Sale ✓' : 'Set On Sale'}
          </button>
        </div>

        {local.on_sale && (
          <div className="flex items-center gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Original Price ($)</label>
              <Input type="number" value={local.base_price || ''} onChange={e => setLocal(p => ({ ...p, base_price: parseFloat(e.target.value) }))} className="bg-background/50 text-sm w-32" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Sale Price ($)</label>
              <Input type="number" value={local.sale_price || ''} onChange={e => setLocal(p => ({ ...p, sale_price: parseFloat(e.target.value) }))} className="bg-background/50 text-sm w-32" />
            </div>
          </div>
        )}

        <button onClick={() => onUpdate(local)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all">
          <Save className="w-3.5 h-3.5" /> Save
        </button>
      </div>
    </Section>
  );
}

// ─── Weekly PC Manager ───────────────────────────────────────────────────────
function WeeklyPCManager({ pcs, isLoading }) {
  const queryClient = useQueryClient();
  const weeklyPCs = pcs.filter(p => p.is_weekly);
  const [addingNew, setAddingNew] = useState(false);
  const [newWeekly, setNewWeekly] = useState({
    name: '', display_name: '', base_price: '', sale_price: '', on_sale: false,
    base_cpu: '', base_gpu: '', base_ram: '', base_storage: '',
    base_cooler: '', base_psu: '', base_motherboard: '', base_cables: '',
    description: '', is_weekly: true, visible: true, weekly_status: 'next_week',
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => db.entities.PC.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-pcs'] }); toast.success('Saved!'); },
  });

  const createMutation = useMutation({
    mutationFn: (data) => db.entities.PC.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pcs'] });
      toast.success('Weekly PC created!');
      setAddingNew(false);
    },
  });

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground mb-4">
        Manage weekly drop PCs. Set each as "Next Week", "Current", or "Previous". The weekly drop page shows the current active one.
        PCs marked as "Previous" but hidden won't show on the weekly drop page.
      </p>

      {isLoading ? (
        <div className="flex justify-center py-4"><div className="w-5 h-5 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>
      ) : weeklyPCs.length === 0 ? (
        <p className="text-muted-foreground text-sm">No weekly PCs yet. Add one below.</p>
      ) : (
        weeklyPCs.map(pc => (
          <WeeklyPCRow key={pc.id} pc={pc} onUpdate={(data) => {
            const { id, created_date, updated_date, created_by, ...rest } = data;
            updateMutation.mutate({ id: pc.id, data: rest });
          }} />
        ))
      )}

      {addingNew ? (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
          <p className="text-sm font-semibold">Add New Weekly PC</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[['Model Name (e.g. ZTW-6)', 'name'], ['Display Name', 'display_name']].map(([lbl, key]) => (
              <div key={key}>
                <label className="text-xs text-muted-foreground mb-1 block">{lbl}</label>
                <Input value={newWeekly[key] || ''} onChange={e => setNewWeekly(p => ({ ...p, [key]: e.target.value }))} className="bg-background/50 text-sm" />
              </div>
            ))}
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Price ($)</label>
              <Input type="number" value={newWeekly.base_price || ''} onChange={e => setNewWeekly(p => ({ ...p, base_price: e.target.value }))} className="bg-background/50 text-sm" />
            </div>
            {[
              ['CPU', 'base_cpu', PARTS_DB.cpu.map(p => p.name)],
              ['GPU', 'base_gpu', PARTS_DB.gpu.map(p => p.name)],
              ['RAM', 'base_ram', PARTS_DB.ram.map(p => p.name)],
              ['Storage', 'base_storage', PARTS_DB.storage.map(p => p.name)],
              ['Cooler', 'base_cooler', PARTS_DB.cooler.map(p => p.name)],
              ['PSU', 'base_psu', PARTS_DB.psu.map(p => p.name)],
              ['Motherboard', 'base_motherboard', PARTS_DB.motherboard.map(p => p.name)],
              ['Cable Sleeves', 'base_cables', PARTS_DB.cables.map(p => p.name)],
            ].map(([lbl, key, opts]) => (
              <div key={key}>
                <label className="text-xs text-muted-foreground mb-1 block">{lbl}</label>
                <select
                  value={newWeekly[key] || ''}
                  onChange={e => setNewWeekly(p => ({ ...p, [key]: e.target.value }))}
                  className="w-full bg-background/50 border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="">— Select —</option>
                  {opts.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            ))}
            <div className="sm:col-span-2">
              <label className="text-xs text-muted-foreground mb-1 block">Description</label>
              <Input value={newWeekly.description || ''} onChange={e => setNewWeekly(p => ({ ...p, description: e.target.value }))} className="bg-background/50 text-sm" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Initial Status</label>
              <select
                value={newWeekly.weekly_status}
                onChange={e => setNewWeekly(p => ({ ...p, weekly_status: e.target.value }))}
                className="w-full bg-background/50 border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="next_week">Next Week</option>
                <option value="current">Current</option>
                <option value="previous">Previous</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (!newWeekly.name || !newWeekly.base_price) return toast.error('Name and price required');
                createMutation.mutate({ ...newWeekly, base_price: parseFloat(newWeekly.base_price) });
              }}
              disabled={createMutation.isPending}
              className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold disabled:opacity-50"
            >
              {createMutation.isPending ? 'Adding...' : 'Add Weekly PC'}
            </button>
            <button onClick={() => setAddingNew(false)} className="px-4 py-2 rounded-xl border border-border/30 text-xs text-muted-foreground">Cancel</button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAddingNew(true)}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-border/30 text-xs text-muted-foreground hover:border-primary/30 hover:text-foreground transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Add New Weekly PC
        </button>
      )}
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────
export default function PCSettings() {
  const { data: pcs = [], isLoading } = useQuery({
    queryKey: ['admin-pcs'],
    queryFn: () => db.entities.PC.list('sort_order'),
    initialData: [],
  });

  const dailyPCs = pcs.filter(p => !p.is_weekly);

  const partCategories = [
    { category: 'gpu',         label: 'GPUs',          IconComp: Monitor },
    { category: 'cpu',         label: 'CPUs',          IconComp: Cpu },
    { category: 'ram',         label: 'RAM',           IconComp: MemoryStick },
    { category: 'storage',     label: 'SSDs',          IconComp: HardDrive },
    { category: 'psu',         label: 'PSUs',          IconComp: Zap },
    { category: 'motherboard', label: 'Motherboards',  IconComp: CircuitBoard },
    { category: 'cooler',      label: 'CPU Coolers',   IconComp: Fan },
    { category: 'cables',      label: 'Cable Sleeves', IconComp: Cable },
    { category: 'cases',       label: 'Cases',         IconComp: Box },
  ];

  return (
    <AdminGuard>
      <div className="w-full max-w-[120rem] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ScrollReveal>
          <div className="flex items-center gap-4 mb-8">
            <Link to="/admin" className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-3xl font-heading font-bold">PC Settings</h1>
          </div>
        </ScrollReveal>

        {/* Daily PCs */}
        <Section title="🖥️ Daily PCs" defaultOpen>
          {isLoading ? (
            <div className="flex justify-center py-8"><div className="w-6 h-6 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>
          ) : dailyPCs.length === 0 ? (
            <p className="text-muted-foreground text-sm">No daily PCs found.</p>
          ) : (
            <div>{dailyPCs.map(pc => <DailyPCRow key={pc.id} pc={pc} />)}</div>
          )}
        </Section>

        {/* Weekly PCs */}
        <Section title="⚡ Weekly PCs" defaultOpen>
          <WeeklyPCManager pcs={pcs} isLoading={isLoading} />
        </Section>

        {/* Profit Calculator */}
        <Section title="💰 Profit Calculator" defaultOpen>
          <ProfitCalculator />
        </Section>

        {/* PC Parts */}
        <Section title="🔧 PC Parts">
          <p className="text-xs text-muted-foreground mb-4">
            Click any part to expand and edit it. Static parts (from catalog) show "click to edit & save to DB" — saving them adds them to the database with your changes. Saved parts track cost/profit.
          </p>
          <div className="space-y-2">
            {partCategories.map(({ category, label, IconComp }) => (
              <PartCategoryEditor key={category} category={category} label={label} IconComp={IconComp} />
            ))}
          </div>
        </Section>

      </div>
    </AdminGuard>
  );
}
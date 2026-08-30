const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import AdminGuard from '../../components/AdminGuard';
import ScrollReveal from '../../components/ui/ScrollReveal';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Save, Upload, CheckCircle, XCircle, Tag, ToggleLeft, ToggleRight } from 'lucide-react';
import { toast } from 'sonner';

function PCRow({ pc }) {
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState(false);
  const [localPc, setLocalPc] = useState({ ...pc });
  const [uploading, setUploading] = useState(false);

  const updateMutation = useMutation({
    mutationFn: (data) => db.entities.PC.update(pc.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pcs'] });
      toast.success('Saved!');
    },
  });

  const handleSave = () => updateMutation.mutate(localPc);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await db.integrations.Core.UploadFile({ file });
    setLocalPc(prev => ({ ...prev, image_url: file_url }));
    setUploading(false);
    toast.success('Image uploaded — hit Save to apply.');
  };

  return (
    <div className="rounded-2xl bg-card/40 border border-border/20 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-5 hover:bg-primary/5 transition-colors text-left"
      >
        <div className="flex items-center gap-4">
          {pc.image_url && (
            <img src={pc.image_url} alt={pc.name} className="w-12 h-12 rounded-lg object-cover border border-border/20" />
          )}
          <div>
            <p className="font-heading font-bold">{pc.display_name || pc.name}</p>
            <p className="text-sm text-muted-foreground">${pc.base_price?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm">
          {pc.sold_out && <span className="text-destructive text-xs font-medium">Sold Out</span>}
          {pc.on_sale && <span className="text-green-400 text-xs font-medium">On Sale</span>}
          {!pc.visible && <span className="text-muted-foreground text-xs font-medium">Hidden</span>}
          <span className="text-muted-foreground">{expanded ? '▲' : '▼'}</span>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-border/20 p-5 sm:p-6 space-y-5">
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

          {/* Base Specs */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Base Specs</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {['base_cpu', 'base_gpu', 'base_ram', 'base_storage', 'base_cooler', 'base_psu', 'base_motherboard', 'base_cables'].map(key => (
                <div key={key}>
                  <label className="text-xs text-muted-foreground mb-1 block">{key.replace('base_', '').toUpperCase()}</label>
                  <Input value={localPc[key] || ''} onChange={e => setLocalPc(p => ({ ...p, [key]: e.target.value }))} className="bg-background/50 text-xs" />
                </div>
              ))}
            </div>
          </div>

          {/* Image */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Image</p>
            <div className="flex items-center gap-4">
              {localPc.image_url && (
                <img src={localPc.image_url} alt="PC" className="w-20 h-20 rounded-xl object-cover border border-border/20" />
              )}
              <label className="cursor-pointer flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border/20 bg-card/30 hover:border-primary/30 text-sm transition-colors">
                <Upload className="w-4 h-4" />
                {uploading ? 'Uploading...' : 'Upload Image'}
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            </div>
          </div>

          {/* Status toggles */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Status</p>
            <div className="flex flex-wrap gap-3">
              {/* Sold Out */}
              <div className="flex gap-2">
                <button
                  onClick={() => setLocalPc(p => ({ ...p, sold_out: true }))}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-all ${localPc.sold_out ? 'border-destructive/50 bg-destructive/10 text-destructive' : 'border-border/20 bg-card/20 text-muted-foreground hover:border-destructive/30'}`}
                >
                  <XCircle className="w-3.5 h-3.5" /> Sold Out
                </button>
                <button
                  onClick={() => setLocalPc(p => ({ ...p, sold_out: false }))}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-all ${!localPc.sold_out ? 'border-green-500/50 bg-green-500/10 text-green-400' : 'border-border/20 bg-card/20 text-muted-foreground hover:border-green-500/30'}`}
                >
                  <CheckCircle className="w-3.5 h-3.5" /> In Stock
                </button>
              </div>

              {/* Visible */}
              <div className="flex gap-2">
                <button
                  onClick={() => setLocalPc(p => ({ ...p, visible: true }))}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-all ${localPc.visible !== false ? 'border-primary/50 bg-primary/10 text-primary' : 'border-border/20 bg-card/20 text-muted-foreground hover:border-primary/30'}`}
                >
                  <ToggleRight className="w-3.5 h-3.5" /> Visible
                </button>
                <button
                  onClick={() => setLocalPc(p => ({ ...p, visible: false }))}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-all ${localPc.visible === false ? 'border-border/50 bg-card/30 text-foreground' : 'border-border/20 bg-card/20 text-muted-foreground hover:border-border/40'}`}
                >
                  <ToggleLeft className="w-3.5 h-3.5" /> Hidden
                </button>
              </div>
            </div>

            {/* On Sale toggle + price */}
            <div className="flex flex-wrap items-center gap-3 mt-3">
              <div className="flex gap-2">
                <button
                  onClick={() => setLocalPc(p => ({ ...p, on_sale: true }))}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-all ${localPc.on_sale ? 'border-green-500/50 bg-green-500/10 text-green-400' : 'border-border/20 bg-card/20 text-muted-foreground hover:border-green-500/30'}`}
                >
                  <Tag className="w-3.5 h-3.5" /> On Sale
                </button>
                <button
                  onClick={() => setLocalPc(p => ({ ...p, on_sale: false }))}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-all ${!localPc.on_sale ? 'border-border/50 bg-card/30 text-foreground' : 'border-border/20 bg-card/20 text-muted-foreground hover:border-border/40'}`}
                >
                  Not On Sale
                </button>
              </div>
              {localPc.on_sale && (
                <div className="flex items-center gap-2">
                  <label className="text-xs text-muted-foreground whitespace-nowrap">Sale Price ($):</label>
                  <Input
                    type="number"
                    value={localPc.sale_price || ''}
                    onChange={e => setLocalPc(p => ({ ...p, sale_price: parseFloat(e.target.value) }))}
                    className="bg-background/50 w-32 text-sm"
                  />
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}
    </div>
  );
}

export default function PCsManagement() {
  const { data: pcs, isLoading } = useQuery({
    queryKey: ['admin-pcs'],
    queryFn: () => db.entities.PC.list('sort_order'),
    initialData: [],
  });

  return (
    <AdminGuard>
      <div className="w-full max-w-[120rem] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ScrollReveal>
          <div className="flex items-center gap-4 mb-8">
            <Link to="/admin" className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-3xl font-heading font-bold">PCs Listed</h1>
          </div>
        </ScrollReveal>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {pcs.map((pc) => (
              <ScrollReveal key={pc.id}>
                <PCRow pc={pc} />
              </ScrollReveal>
            ))}
          </div>
        )}
      </div>
    </AdminGuard>
  );
}
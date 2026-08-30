const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useRef, useEffect } from 'react';
import AdminGuard from '../../components/AdminGuard';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import ScrollReveal from '../../components/ui/ScrollReveal';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle, Search, Send, Circle, Trash2, VolumeX, ChevronLeft } from 'lucide-react';
import GlowButton from '../../components/ui/GlowButton';
import { toast } from 'sonner';

const statusOpts = ['open', 'waiting', 'responded', 'closed'];
const statusColors = {
  open: 'bg-blue-500/20 text-blue-400',
  waiting: 'bg-yellow-500/20 text-yellow-400',
  responded: 'bg-green-500/20 text-green-400',
  closed: 'bg-muted text-muted-foreground',
};

const MUTED_EMAILS_KEY = 'zytk_muted_emails';

function getMutedEmails() {
  try { return JSON.parse(localStorage.getItem(MUTED_EMAILS_KEY) || '{}'); } catch { return {}; }
}
function setMutedEmails(obj) {
  localStorage.setItem(MUTED_EMAILS_KEY, JSON.stringify(obj));
}

export default function AdminSupport() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [reply, setReply] = useState('');
  const [muteDuration, setMuteDuration] = useState('');
  const [showMuteModal, setShowMuteModal] = useState(false);
  const [mutedEmails, setMutedEmailsState] = useState(getMutedEmails);
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: tickets = [] } = useQuery({
    queryKey: ['admin-tickets'],
    queryFn: () => db.entities.SupportTicket.list('-created_date'),
    initialData: [],
    refetchInterval: 8000,
  });

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [selectedTicket, tickets]);

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => db.entities.SupportTicket.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-tickets'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => db.entities.SupportTicket.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tickets'] });
      setSelectedTicket(null);
      setMobileShowChat(false);
      toast.success('Ticket deleted');
    },
  });

  const filtered = tickets.filter(t => {
    const matchSearch = !search || t.customer_name?.toLowerCase().includes(search.toLowerCase()) || t.customer_email?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const current = tickets.find(t => t.id === selectedTicket);

  const handleReply = async () => {
    if (!reply.trim() || !current) return;
    const email = current.customer_email;
    // Check if muted
    const muted = getMutedEmails();
    if (muted[email] && new Date(muted[email]) > new Date()) {
      toast.error(`${email} is muted until ${new Date(muted[email]).toLocaleString()}`);
      return;
    }
    const newMsg = { sender: 'admin', content: reply, timestamp: new Date().toISOString() };
    const msgs = [...(current.messages || []), newMsg];
    updateMutation.mutate({ id: current.id, data: { messages: msgs, status: 'responded', is_read: true } });
    setReply('');
    toast.success('Reply sent');
  };

  const handleMute = () => {
    if (!current || !muteDuration) return;
    const hours = parseFloat(muteDuration);
    if (!hours || hours <= 0) return toast.error('Enter valid hours');
    const until = new Date(Date.now() + hours * 3600000).toISOString();
    const muted = getMutedEmails();
    muted[current.customer_email] = until;
    setMutedEmails(muted);
    setMutedEmailsState({ ...muted });
    setShowMuteModal(false);
    toast.success(`${current.customer_email} muted for ${hours}h`);
  };

  const handleDeleteAllFromEmail = async () => {
    if (!current) return;
    const emailTickets = tickets.filter(t => t.customer_email === current.customer_email);
    for (const t of emailTickets) {
      await db.entities.SupportTicket.delete(t.id);
    }
    queryClient.invalidateQueries({ queryKey: ['admin-tickets'] });
    setSelectedTicket(null);
    setMobileShowChat(false);
    toast.success(`Deleted all chats from ${current.customer_email}`);
  };

  const handleUnmute = (email) => {
    const muted = getMutedEmails();
    delete muted[email];
    setMutedEmails(muted);
    setMutedEmailsState({ ...muted });
    toast.success(`${email} unmuted`);
  };

  const isMuted = (email) => {
    const muted = getMutedEmails();
    return muted[email] && new Date(muted[email]) > new Date();
  };

  const selectTicket = (id) => {
    setSelectedTicket(id);
    setMobileShowChat(true);
    // Mark as read
    const t = tickets.find(x => x.id === id);
    if (t && !t.is_read) {
      updateMutation.mutate({ id, data: { is_read: true } });
    }
  };

  return (
    <AdminGuard>
      {showMuteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border/30 rounded-2xl p-6 w-full max-w-sm space-y-4">
            <h3 className="font-heading font-semibold">Mute {current?.customer_email}</h3>
            <Input placeholder="Duration in hours (e.g. 24)" type="number" value={muteDuration} onChange={e => setMuteDuration(e.target.value)} className="bg-background/50" />
            <div className="flex gap-2">
              <button onClick={handleMute} className="flex-1 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold">Mute</button>
              <button onClick={() => setShowMuteModal(false)} className="flex-1 px-4 py-2 rounded-xl border border-border/30 text-sm text-muted-foreground">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-[120rem] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ScrollReveal>
          <div className="flex items-center gap-4 mb-8">
            <a href="/admin" className="text-sm text-muted-foreground hover:text-foreground transition-colors">← Dashboard</a>
            <h1 className="text-3xl font-heading font-bold">Support Dashboard</h1>
          </div>
        </ScrollReveal>

        {/* Muted users list */}
        {Object.keys(mutedEmails).filter(e => new Date(mutedEmails[e]) > new Date()).length > 0 && (
          <div className="mb-4 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
            <p className="text-xs font-semibold text-yellow-400 mb-2">Currently Muted</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(mutedEmails).filter(([, until]) => new Date(until) > new Date()).map(([email, until]) => (
                <div key={email} className="flex items-center gap-2 bg-yellow-500/10 rounded-lg px-3 py-1 text-xs">
                  <span className="text-yellow-300">{email}</span>
                  <span className="text-yellow-500/70">until {new Date(until).toLocaleTimeString()}</span>
                  <button onClick={() => handleUnmute(email)} className="text-yellow-400 hover:text-yellow-200">✕</button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ height: 'calc(100vh - 280px)', minHeight: '500px' }}>
          {/* Ticket list — hidden on mobile when chat is open */}
          <div className={`lg:col-span-1 space-y-4 flex flex-col ${mobileShowChat ? 'hidden lg:flex' : 'flex'}`}>
            <div className="flex gap-2 flex-shrink-0">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 bg-card/30" />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32 bg-card/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {statusOpts.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 overflow-y-auto flex-1">
              {filtered.map(t => (
                <button
                  key={t.id}
                  onClick={() => selectTicket(t.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                    selectedTicket === t.id ? 'border-primary/40 bg-primary/10' : 'border-border/20 bg-card/30 hover:border-primary/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm truncate">
                      {t.customer_name || t.customer_email}
                      {isMuted(t.customer_email) && <span className="ml-1 text-yellow-400 text-xs">🔇</span>}
                    </span>
                    {!t.is_read && <Circle className="w-2.5 h-2.5 fill-primary text-primary flex-shrink-0" />}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground truncate">{t.customer_email}</span>
                    <Badge className={`text-xs ${statusColors[t.status] || ''}`}>{t.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    {new Date(t.created_date).toLocaleDateString()}
                  </p>
                </button>
              ))}
              {filtered.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">No tickets found</p>}
            </div>
          </div>

          {/* Chat view */}
          <div className={`lg:col-span-2 rounded-2xl bg-card/30 border border-border/20 flex flex-col overflow-hidden ${mobileShowChat ? 'flex' : 'hidden lg:flex'}`}>
            {current ? (
              <>
                <div className="p-4 border-b border-border/20 flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setMobileShowChat(false)} className="lg:hidden p-1 rounded-lg hover:bg-secondary/50 mr-1">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <div>
                      <p className="font-heading font-semibold">{current.customer_name}</p>
                      <p className="text-sm text-muted-foreground">{current.customer_email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={current.status} onValueChange={v => updateMutation.mutate({ id: current.id, data: { status: v } })}>
                      <SelectTrigger className="w-28 bg-background/50 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOpts.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <button onClick={() => setShowMuteModal(true)} title="Mute this email"
                      className="p-2 rounded-lg text-muted-foreground hover:text-yellow-400 hover:bg-yellow-400/10 transition-colors">
                      <VolumeX className="w-4 h-4" />
                    </button>
                    <button onClick={() => { if (confirm(`Delete ALL chats from ${current.customer_email}?`)) handleDeleteAllFromEmail(); }}
                      title="Delete all chats from this email"
                      className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {(current.messages || []).map((msg, i) => (
                    <div key={i} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm break-words ${
                        msg.sender === 'admin'
                          ? 'bg-primary text-primary-foreground rounded-br-md'
                          : 'bg-secondary text-secondary-foreground rounded-bl-md'
                      }`} style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                        {msg.content}
                        {msg.attachments?.map((att, j) => (
                          <div key={j} className="mt-2">
                            {att.type?.startsWith('image/') ? (
                              <img src={att.url} alt={att.name} className="max-w-full rounded-lg max-h-48 object-contain" />
                            ) : (
                              <a href={att.url} target="_blank" rel="noopener noreferrer" className="underline text-xs opacity-80">{att.name}</a>
                            )}
                          </div>
                        ))}
                        <p className="text-xs opacity-60 mt-1">{new Date(msg.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                <div className="border-t border-border/20 p-4 flex gap-2 flex-shrink-0">
                  <Textarea
                    placeholder="Type reply..."
                    value={reply}
                    onChange={e => setReply(e.target.value)}
                    className="bg-background/50 min-h-[50px] max-h-[120px] resize-none"
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleReply(); } }}
                  />
                  <GlowButton onClick={handleReply} variant="primary" size="sm">
                    <Send className="w-4 h-4" />
                  </GlowButton>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <MessageCircle className="w-8 h-8 mr-3 opacity-30" />
                Select a conversation
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
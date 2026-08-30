const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';

import ScrollReveal from '../components/ui/ScrollReveal';
import GlowButton from '../components/ui/GlowButton';
import { Input } from '@/components/ui/input';
import { MessageCircle, Send, Clock, AlertCircle, Paperclip, X, ChevronLeft, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';

const GUEST_EMAIL_KEY = 'zytk_guest_email';
const GUEST_NAME_KEY = 'zytk_guest_name';

export default function LiveChat() {
  const { user, isAuthenticated } = useAuth();
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState(() => localStorage.getItem(GUEST_EMAIL_KEY) || '');
  const [name, setName] = useState(() => localStorage.getItem(GUEST_NAME_KEY) || '');
  const [ticketId, setTicketId] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [view, setView] = useState('list'); // 'list' | 'chat' | 'new'
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState('');
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();

  const resolvedEmail = isAuthenticated ? user?.email : email;

  // Load previous ticket ID from local storage on mount
  useEffect(() => {
    const stored = localStorage.getItem('zytk_ticket_id');
    if (stored) {
      setTicketId(stored);
      setView('chat');
    }
  }, []);

  const { data: myTickets = [] } = useQuery({
    queryKey: ['my-tickets', resolvedEmail],
    queryFn: async () => {
      if (!resolvedEmail) return [];
      const all = await db.entities.SupportTicket.filter({ customer_email: resolvedEmail });
      return all.filter(t => t.status !== 'closed').sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    },
    enabled: !!resolvedEmail,
    refetchInterval: 8000,
  });

  const { data: currentTicketData = [] } = useQuery({
    queryKey: ['ticket', ticketId],
    queryFn: () => ticketId ? db.entities.SupportTicket.filter({ id: ticketId }) : Promise.resolve([]),
    enabled: !!ticketId,
    refetchInterval: 4000,
  });

  const currentTicket = currentTicketData?.[0];

  useEffect(() => {
    if (view === 'chat') {
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  }, [currentTicket?.messages, view]);

  const startChat = async () => {
    const resolvedName = isAuthenticated ? (user?.full_name || user?.email) : (name || 'Guest');
    if (!resolvedEmail) return toast.error('Please enter your email to start a chat');
    if (!isAuthenticated) {
      localStorage.setItem(GUEST_EMAIL_KEY, resolvedEmail);
      localStorage.setItem(GUEST_NAME_KEY, resolvedName);
    }
    const t = await db.entities.SupportTicket.create({
      customer_email: resolvedEmail,
      customer_name: resolvedName,
      status: 'open',
      messages: [],
    });
    localStorage.setItem('zytk_ticket_id', t.id);
    setTicketId(t.id);
    queryClient.invalidateQueries({ queryKey: ['my-tickets', resolvedEmail] });
    setView('chat');
  };

  const openTicket = (id) => {
    localStorage.setItem('zytk_ticket_id', id);
    setTicketId(id);
    setView('chat');
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    const uploaded = [];
    for (const file of files) {
      const { file_url } = await db.integrations.Core.UploadFile({ file });
      uploaded.push({ name: file.name, url: file_url, type: file.type });
    }
    setAttachments(prev => [...prev, ...uploaded]);
    setUploading(false);
  };

  const sendMessage = async () => {
    if ((!message.trim() && attachments.length === 0) || !currentTicket) return;
    const newMsg = {
      sender: 'customer',
      content: message,
      timestamp: new Date().toISOString(),
      attachments: attachments,
    };
    const msgs = [...(currentTicket.messages || []), newMsg];
    await db.entities.SupportTicket.update(currentTicket.id, { messages: msgs, status: 'open' });
    setMessage('');
    setAttachments([]);
    queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
    queryClient.invalidateQueries({ queryKey: ['my-tickets', resolvedEmail] });
  };

  const saveNameChange = async () => {
    if (!tempName.trim()) return;
    setName(tempName);
    localStorage.setItem(GUEST_NAME_KEY, tempName);
    if (currentTicket) {
      await db.entities.SupportTicket.update(currentTicket.id, { customer_name: tempName });
      queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
    }
    setEditingName(false);
    toast.success('Name updated!');
  };

  // ── Header ────────────────────────────────────────────────────────────────
  const PageHeader = () => (
    <section className="relative min-h-[30vh] flex items-end overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-accent/5" />
      <div className="relative w-full max-w-[120rem] mx-auto px-4 sm:px-6 lg:px-8 pb-12 pt-28">
        <ScrollReveal>
          <h1 className="text-4xl sm:text-5xl font-heading font-bold mb-3">Live Chat</h1>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <p className="text-sm">Responses may take a few hours. Support is handled personally.</p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );

  // ── If no email set (unauthenticated, no stored email), show input ─────────
  if (!resolvedEmail && view !== 'new') {
    return (
      <div>
        <PageHeader />
        <section className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <ScrollReveal>
            <div className="rounded-2xl bg-card/40 border border-border/20 p-8 space-y-4">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-accent/5 border border-accent/10">
                <AlertCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Enter your email to access chat. You don't need to sign in.</p>
                  <p>Looking for instant results? Try the <a href="/custom-build" className="text-primary hover:underline">Custom Build Tool</a>.</p>
                </div>
              </div>
              <Input placeholder="Your name (optional)" value={name} onChange={e => setName(e.target.value)} className="bg-background/50" />
              <Input placeholder="Your email *" type="email" value={email} onChange={e => setEmail(e.target.value)} className="bg-background/50"
                onKeyDown={e => e.key === 'Enter' && email && setView('list')} />
              <GlowButton onClick={() => { if (!email) return toast.error('Email required'); localStorage.setItem(GUEST_EMAIL_KEY, email); localStorage.setItem(GUEST_NAME_KEY, name); setView('list'); }} variant="primary" size="lg" className="w-full">
                <MessageCircle className="w-5 h-5 mr-2" /> Continue
              </GlowButton>
            </div>
          </ScrollReveal>
        </section>
      </div>
    );
  }

  // ── Chat view ─────────────────────────────────────────────────────────────
  if (view === 'chat' && ticketId) {
    return (
      <div>
        <PageHeader />
        <section className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setView('list')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ChevronLeft className="w-4 h-4" /> All chats
            </button>
            <div className="flex items-center gap-2">
              {editingName ? (
                <div className="flex items-center gap-2">
                  <Input value={tempName} onChange={e => setTempName(e.target.value)} className="h-7 text-xs bg-background/50 w-40" placeholder="Your name" />
                  <button onClick={saveNameChange} className="text-xs text-primary hover:underline">Save</button>
                  <button onClick={() => setEditingName(false)} className="text-xs text-muted-foreground hover:underline">Cancel</button>
                </div>
              ) : (
                <button onClick={() => { setTempName(currentTicket?.customer_name || name || ''); setEditingName(true); }} className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2">
                  Change name
                </button>
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-card/40 border border-border/20 overflow-hidden flex flex-col" style={{ height: '62vh' }}>
            <div className="p-3 border-b border-border/20 bg-card/60">
              <p className="text-xs text-muted-foreground">Chat with ZYTK Support</p>
              <p className="text-sm font-medium">{currentTicket?.customer_name || name || resolvedEmail}</p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              <div className="text-center text-xs text-muted-foreground py-2">
                Chat started. We'll respond as soon as possible!
              </div>
              {(currentTicket?.messages || []).map((msg, i) => (
                <div key={i} className={`flex ${msg.sender === 'customer' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm break-words ${
                    msg.sender === 'customer'
                      ? 'bg-primary text-primary-foreground rounded-br-md'
                      : 'bg-secondary text-secondary-foreground rounded-bl-md'
                  }`} style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                    {msg.content && <p>{msg.content}</p>}
                    {msg.attachments?.map((att, j) => (
                      <div key={j} className="mt-2">
                        {att.type?.startsWith('image/') ? (
                          <img src={att.url} alt={att.name} className="max-w-full rounded-lg max-h-48 object-contain" />
                        ) : att.type?.startsWith('video/') ? (
                          <video src={att.url} controls className="max-w-full rounded-lg max-h-48" />
                        ) : (
                          <a href={att.url} target="_blank" rel="noopener noreferrer" className="underline text-xs opacity-80">{att.name}</a>
                        )}
                      </div>
                    ))}
                    <p className="text-xs opacity-60 mt-1">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {attachments.length > 0 && (
              <div className="border-t border-border/20 px-4 py-2 flex gap-2 flex-wrap">
                {attachments.map((att, i) => (
                  <div key={i} className="flex items-center gap-1 bg-secondary/50 rounded-lg px-2 py-1 text-xs">
                    <span className="max-w-[100px] truncate">{att.name}</span>
                    <button onClick={() => setAttachments(prev => prev.filter((_, j) => j !== i))}><X className="w-3 h-3" /></button>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t border-border/20 p-4 flex gap-2 items-center">
              <input ref={fileInputRef} type="file" multiple accept="image/*,video/*" onChange={handleFileSelect} className="hidden" />
              <button onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors flex-shrink-0">
                {uploading ? <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /> : <Paperclip className="w-4 h-4" />}
              </button>
              <Input placeholder="Type your message..." value={message} onChange={e => setMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()} className="bg-background/50" />
              <GlowButton onClick={sendMessage} variant="primary" size="sm"><Send className="w-4 h-4" /></GlowButton>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // ── Chat list view ────────────────────────────────────────────────────────
  return (
    <div>
      <PageHeader />
      <section className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <ScrollReveal>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-heading font-semibold">Your Conversations</h2>
              <p className="text-sm text-muted-foreground">{resolvedEmail}</p>
            </div>
            <button onClick={startChat}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all">
              <Plus className="w-4 h-4" /> New Chat
            </button>
          </div>

          {myTickets.length === 0 ? (
            <div className="rounded-2xl bg-card/30 border border-border/20 p-10 text-center">
              <MessageCircle className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">No active chats. Start a conversation below.</p>
              <GlowButton onClick={startChat} variant="primary" size="md">
                <MessageCircle className="w-4 h-4 mr-2" /> Start Chat
              </GlowButton>
            </div>
          ) : (
            <div className="space-y-3">
              {myTickets.map(t => {
                const lastMsg = t.messages?.[t.messages.length - 1];
                const hasUnread = t.is_read === false && lastMsg?.sender === 'admin';
                return (
                  <button key={t.id} onClick={() => openTicket(t.id)}
                    className="w-full text-left p-4 rounded-xl border border-border/20 bg-card/30 hover:border-primary/30 hover:bg-primary/5 transition-all duration-200">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">Support Chat</span>
                      <div className="flex items-center gap-2">
                        {hasUnread && <span className="w-2 h-2 rounded-full bg-primary" />}
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          t.status === 'open' ? 'bg-blue-500/20 text-blue-400' :
                          t.status === 'responded' ? 'bg-green-500/20 text-green-400' :
                          'bg-muted text-muted-foreground'
                        }`}>{t.status}</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {lastMsg ? `${lastMsg.sender === 'admin' ? 'Support' : 'You'}: ${lastMsg.content || '[attachment]'}` : 'No messages yet'}
                    </p>
                    <p className="text-xs text-muted-foreground/60 mt-1">
                      {new Date(t.created_date).toLocaleDateString()}
                    </p>
                  </button>
                );
              })}
            </div>
          )}

          {!isAuthenticated && (
            <p className="text-xs text-muted-foreground text-center mt-6">
              Not you?{' '}
              <button onClick={() => { localStorage.removeItem(GUEST_EMAIL_KEY); localStorage.removeItem(GUEST_NAME_KEY); localStorage.removeItem('zytk_ticket_id'); setEmail(''); setTicketId(null); setView('list'); }}
                className="text-primary hover:underline">Switch email</button>
            </p>
          )}
        </ScrollReveal>
      </section>
    </div>
  );
}
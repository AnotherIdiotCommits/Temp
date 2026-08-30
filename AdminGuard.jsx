const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useQuery } from '@tanstack/react-query';

import GlowButton from './ui/GlowButton';

const HARDCODED_ADMIN = 'danekisawesome@gmail.com';

export default function AdminGuard({ children }) {
  const { user, isAuthenticated, isLoadingAuth, navigateToLogin } = useAuth();

  const { data: settingsList } = useQuery({
    queryKey: ['site-settings'],
    queryFn: () => db.entities.SiteSettings.filter({ key: 'global' }),
    initialData: [],
    staleTime: 60000,
  });

  const settings = settingsList?.[0] || {};
  let allowedEmails = [HARDCODED_ADMIN];
  if (settings.admin_emails) {
    try {
      const parsed = JSON.parse(settings.admin_emails);
      if (Array.isArray(parsed)) allowedEmails = [...new Set([...allowedEmails, ...parsed])];
    } catch {}
  }

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-muted-foreground text-lg">Admin access requires login.</p>
        <GlowButton onClick={navigateToLogin} variant="primary">Log In</GlowButton>
      </div>
    );
  }

  const isAllowed = user?.email && (
    user.role === 'admin' || allowedEmails.includes(user.email)
  );

  if (!isAllowed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-muted-foreground text-lg">You don't have permission to access this page.</p>
        <GlowButton to="/" variant="secondary">Go Home</GlowButton>
      </div>
    );
  }

  return children;
}
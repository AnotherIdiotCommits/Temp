const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { useQuery } from '@tanstack/react-query';

export default function AppLayout() {
  const { data: settings } = useQuery({
    queryKey: ['site-settings'],
    queryFn: () => db.entities.SiteSettings.filter({ key: 'global' }),
    initialData: [],
  });

  const s = settings?.[0] || {};

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header vacationMode={s.vacation_mode} vacationMessage={s.vacation_message} />
      <main className="flex-1">
        <Outlet context={{ settings: s }} />
      </main>
      <Footer />
    </div>
  );
}
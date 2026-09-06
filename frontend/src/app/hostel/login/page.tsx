'use client';

import React, { Suspense } from 'react';
import ModuleLoginCard from '@/components/ModuleLoginCard';

export default function HostelLoginPage() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center relative py-6">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />

      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
        </div>
      }>
        <ModuleLoginCard
          moduleId="hostel"
          title="Hostel & Logistics Gateway"
          subtitle="Dormitory Bed Allocation, Live Bus Tracking & Gate Passes"
          defaultRedirect="/hostel"
          themeColor="emerald"
        />
      </Suspense>
    </div>
  );
}

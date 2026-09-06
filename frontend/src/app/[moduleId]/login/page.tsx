'use client';

import React, { Suspense } from 'react';
import { useParams } from 'next/navigation';
import ModuleLoginCard from '@/components/ModuleLoginCard';

function DynamicLoginComponent() {
  const params = useParams();
  const rawId = Array.isArray(params?.moduleId) ? params.moduleId[0] : (params?.moduleId as string || 'module');
  const modId = rawId.toLowerCase();

  return (
    <ModuleLoginCard
      moduleId={modId}
      title={`${modId.toUpperCase()} Module Gateway`}
      subtitle={`Scoped Module Login & Authentication System for ${modId.toUpperCase()}`}
      defaultRedirect={`/${modId}`}
      themeColor="purple"
    />
  );
}

export default function DynamicLoginPage() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center relative py-6">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
        </div>
      }>
        <DynamicLoginComponent />
      </Suspense>
    </div>
  );
}

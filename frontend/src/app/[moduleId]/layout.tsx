'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function DynamicModuleLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(true);

  useEffect(() => {
    if (pathname.endsWith('/login')) {
      setIsAuthenticated(true);
      setIsChecking(false);
      return;
    }

    const token = localStorage.getItem('multiutility_token');
    const user = localStorage.getItem('multiutility_user');
    const masterAdmin = localStorage.getItem('master_admin_session');

    if ((token && user) || masterAdmin) {
      setIsAuthenticated(true);
      setIsChecking(false);
      return;
    }

    // Purge any residual tokens & redirect unauthenticated users directly to login route
    localStorage.removeItem('multiutility_token');
    localStorage.removeItem('multiutility_user');
    localStorage.removeItem('master_admin_session');
    localStorage.removeItem('master_admin_token');
    setIsAuthenticated(false);
    setIsChecking(false);
    
    const parts = pathname.split('/').filter(Boolean);
    const modId = parts[0] || 'sms';
    router.replace(`/${modId}/login`);
  }, [router, pathname]);

  if (pathname.endsWith('/login') || (!isChecking && isAuthenticated)) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
      <p className="text-xs text-purple-300 font-bold uppercase tracking-wider animate-pulse">
        Verifying Module Access Authorization...
      </p>
    </div>
  );
}

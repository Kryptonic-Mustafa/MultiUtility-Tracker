'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HostelLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(true);

  useEffect(() => {
    const token = localStorage.getItem('multiutility_token');
    const user = localStorage.getItem('multiutility_user');
    const masterAdmin = localStorage.getItem('master_admin_session');

    if ((token && user) || masterAdmin) {
      setIsAuthenticated(true);
      setIsChecking(false);
      return;
    }

    // Purge any residual tokens & redirect unauthenticated users directly to login
    localStorage.removeItem('multiutility_token');
    localStorage.removeItem('multiutility_user');
    localStorage.removeItem('master_admin_session');
    localStorage.removeItem('master_admin_token');
    setIsAuthenticated(false);
    setIsChecking(false);
    router.replace('/sms/login?redirect=/hostel');
  }, [router]);

  if (isChecking || !isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
        <p className="text-xs text-emerald-300 font-bold uppercase tracking-wider animate-pulse">
          Verifying Hostel & Fleet Access Authorization...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}

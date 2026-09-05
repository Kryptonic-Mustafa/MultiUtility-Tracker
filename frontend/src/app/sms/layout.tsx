'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ShieldAlert, Loader2 } from 'lucide-react';

export default function SmsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(true);

  useEffect(() => {
    // Exclude login page from auth check
    if (pathname === '/sms/login') {
      setIsAuthenticated(true);
      setIsChecking(false);
      return;
    }

    const token = localStorage.getItem('multiutility_token');
    const user = localStorage.getItem('multiutility_user');

    if (token && user) {
      setIsAuthenticated(true);
      setIsChecking(false);
    } else {
      setIsAuthenticated(false);
      setIsChecking(false);
      router.replace('/sms/login');
    }
  }, [pathname, router]);

  if (isChecking) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3 text-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="text-xs font-semibold text-gray-400">Verifying Module Entitlement & Session...</p>
      </div>
    );
  }

  if (pathname !== '/sms/login' && !isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4 text-center">
        <div className="p-4 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <h3 className="text-xl font-bold text-white">Authentication Required</h3>
        <p className="text-xs text-gray-400 max-w-sm">
          Please log into your SMS module account to access the Biometric Attendance Kiosk and module resources.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}

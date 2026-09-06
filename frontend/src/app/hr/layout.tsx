'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function HrLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(true);

  useEffect(() => {
    if (pathname === '/hr/login') {
      setIsAuthenticated(true);
      setIsChecking(false);
      return;
    }

    const token = localStorage.getItem('multiutility_token');
    const user = localStorage.getItem('multiutility_user');
    const masterAdmin = localStorage.getItem('master_admin_session');

    if ((token && user) || masterAdmin) {
      try {
        const rawUser = user || masterAdmin;
        const parsedUser = JSON.parse(rawUser!);
        if (!parsedUser || (!parsedUser.user_id && !parsedUser.admin_id)) {
          throw new Error("Invalid session data");
        }
        const isSuperOrDeptAdmin = parsedUser.role === 'ADMIN' || parsedUser.role === 'SUPER_ADMIN' || parsedUser.is_admin;
        const isHrAuthorized = isSuperOrDeptAdmin || 
                               parsedUser.active_module === 'hr' || 
                               parsedUser.role === 'HR_MANAGER' ||
                               (parsedUser.user_id && parsedUser.user_id.startsWith('EMP-'));

        if (isHrAuthorized) {
          setIsAuthenticated(true);
          setIsChecking(false);
          return;
        }
      } catch (e) {}
    }

    // Purge any residual tokens & redirect unauthorized users directly to /hr/login
    localStorage.removeItem('multiutility_token');
    localStorage.removeItem('multiutility_user');
    localStorage.removeItem('master_admin_session');
    localStorage.removeItem('master_admin_token');
    setIsAuthenticated(false);
    setIsChecking(false);
    router.replace('/hr/login');
  }, [pathname, router]);

  if (pathname !== '/hr/login' && (isChecking || !isAuthenticated)) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
        <p className="text-xs text-purple-300 font-bold uppercase tracking-wider animate-pulse">
          Verifying HR & Payroll Access Authorization...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}

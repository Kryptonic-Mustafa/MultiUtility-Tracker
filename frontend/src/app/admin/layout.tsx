'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(true);

  useEffect(() => {
    // Exclude login page from auth check
    if (pathname === '/admin/login') {
      setIsAuthenticated(true);
      setIsChecking(false);
      return;
    }

    const adminSession = localStorage.getItem('master_admin_session');

    if (adminSession) {
      try {
        const parsed = JSON.parse(adminSession);
        const isAdmin = parsed && parsed.user_id && (parsed.is_admin || parsed.role === 'SUPER_ADMIN' || parsed.role === 'ADMIN');
        if (isAdmin) {
          setIsAuthenticated(true);
          setIsChecking(false);
          return;
        }
      } catch (e) {}
    }

    // Not authenticated as Master Admin -> Purge bad data & throw directly to /admin/login
    localStorage.removeItem('master_admin_session');
    localStorage.removeItem('master_admin_token');
    setIsAuthenticated(false);
    setIsChecking(false);
    router.replace('/admin/login');
  }, [pathname, router]);

  // Block rendering until auth check passes for non-login pages
  if (pathname !== '/admin/login' && (!isAuthenticated || isChecking)) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500" />
        <p className="text-xs text-purple-300 font-bold uppercase tracking-wider animate-pulse">
          Verifying Master Admin Authorization...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}

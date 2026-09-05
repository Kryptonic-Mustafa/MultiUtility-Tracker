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
      try {
        const parsedUser = JSON.parse(user);
        const isSuperOrDeptAdmin = parsedUser.role === 'ADMIN' || parsedUser.is_admin;
        if (!isSuperOrDeptAdmin) {
          if (pathname === '/sms/departments') {
            router.replace('/sms');
            return;
          }
          if (pathname === '/sms/logs') {
            router.replace('/sms/report');
            return;
          }
        }
      } catch (e) {}

      setIsAuthenticated(true);
      setIsChecking(false);
    } else {
      setIsAuthenticated(false);
      setIsChecking(false);
      router.replace('/sms/login');
    }
  }, [pathname, router]);

  if (pathname !== '/sms/login' && !isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

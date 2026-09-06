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
    const masterAdmin = localStorage.getItem('master_admin_session');

    if ((token && user) || masterAdmin) {
      try {
        const rawUser = user || masterAdmin;
        const parsedUser = JSON.parse(rawUser!);
        if (!parsedUser || (!parsedUser.user_id && !parsedUser.admin_id)) {
          throw new Error("Invalid session data");
        }
        const isSuperOrDeptAdmin = parsedUser.role === 'ADMIN' || parsedUser.role === 'SUPER_ADMIN' || parsedUser.is_admin;
        
        const isSmsAuthorized = isSuperOrDeptAdmin || 
                                parsedUser.active_module === 'sms' ||
                                ['STUDENT', 'TEACHER', 'HOD', 'SUB_TEACHER', 'STAFF'].includes(parsedUser.role) ||
                                (parsedUser.user_id && (
                                  parsedUser.user_id.startsWith('STU-') ||
                                  parsedUser.user_id.startsWith('TCH-') ||
                                  parsedUser.user_id.startsWith('HOD-') ||
                                  parsedUser.user_id.startsWith('SUB-') ||
                                  parsedUser.user_id.startsWith('STAFF-') ||
                                  parsedUser.user_id.startsWith('CSE-') ||
                                  parsedUser.user_id.startsWith('ECE-') ||
                                  parsedUser.user_id.startsWith('MECH-') ||
                                  parsedUser.user_id.startsWith('CIVIL-') ||
                                  parsedUser.user_id.startsWith('IT-')
                                ));

        if (!isSmsAuthorized) {
          throw new Error("Unauthorized access: User is not authorized for SMS module.");
        }

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
        setIsAuthenticated(true);
        setIsChecking(false);
        return;
      } catch (e) {}
    }

    // Purge ALL bad or missing session data and redirect
    localStorage.removeItem('multiutility_token');
    localStorage.removeItem('multiutility_user');
    localStorage.removeItem('master_admin_session');
    localStorage.removeItem('master_admin_token');
    setIsAuthenticated(false);
    setIsChecking(false);
    router.replace('/sms/login');
  }, [pathname, router]);

  if (pathname !== '/sms/login' && !isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

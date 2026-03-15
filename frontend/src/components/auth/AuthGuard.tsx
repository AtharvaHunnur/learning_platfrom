"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export default function AuthGuard({ 
  children, 
  allowedRoles 
}: { 
  children: React.ReactNode, 
  allowedRoles?: string[] 
}) {
  const { user, token } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // If we're on server side or just hydrating, wait
    if (typeof window === 'undefined') return;

    if (!token || !user) {
      router.push('/login');
    } else if (allowedRoles && !allowedRoles.includes(user.role)) {
      // Not allowed to access this route
      router.push(user.role === 'admin' ? '/admin' : '/dashboard');
    } else {
      setIsAuthorized(true);
    }
  }, [user, token, router, pathname, allowedRoles]);

  // Prevent flash of content
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-background flex justify-center items-center">
        <div className="w-8 h-8 rounded-full border-t-2 border-r-2 border-primary animate-spin"></div>
      </div>
    );
  }

  return <>{children}</>;
}

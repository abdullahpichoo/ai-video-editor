"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

interface AuthBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export function AuthBoundary({
  children,
  fallback,
  redirectTo = "/auth/signin",
}: AuthBoundaryProps) {
  const { isAuthenticated, isInitialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      const currentPath = window.location.pathname;
      const signInUrl = `${redirectTo}?callbackUrl=${encodeURIComponent(
        currentPath
      )}`;
      router.push(signInUrl);
    }
  }, [isAuthenticated, isInitialized, router, redirectTo]);

  // Don't redirect while still initializing
  if (!isInitialized || !isAuthenticated) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">
              {!isInitialized ? "Loading..." : "Redirecting to sign in..."}
            </p>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
}

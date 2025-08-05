"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { validateSession } from "@/services/auth.service";

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { isInitialized, setUser, logout, setInitialized } = useAuthStore();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const response = await validateSession();
        setUser(response.data!.user);
      } catch {
        logout();
      } finally {
        setInitialized();
      }
    };

    if (!isInitialized) {
      initializeAuth();
    }
  }, [isInitialized, setUser, logout, setInitialized]);

  // Show loading state while initializing
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

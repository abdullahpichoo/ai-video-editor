import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import * as auth from "@/services/auth.service";

export function useAuth() {
  const router = useRouter();
  const { user, isAuthenticated, isInitialized, setUser, logout: clearAuth } = useAuthStore();

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const response = await auth.login({ email, password });
        const { user } = response.data;

        setUser(user);
        router.push("/dashboard");

        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Login failed",
        };
      }
    },
    [setUser, router]
  );

  const signup = useCallback(
    async (name: string, email: string, password: string) => {
      try {
        const response = await auth.signup({ name, email, password });
        const { user } = response.data;

        setUser(user);
        router.push("/dashboard");

        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Signup failed",
        };
      }
    },
    [setUser, router]
  );

  const logout = useCallback(async () => {
    try {
      await auth.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      clearAuth();
      router.push("/");
    }
  }, [clearAuth, router]);

  return {
    user,
    isAuthenticated,
    isInitialized,
    login,
    signup,
    logout,
  };
}

"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Video, User, LogOut, FolderOpen } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <nav className="border-b bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Video className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">
                AI Video Editor
              </span>
            </Link>
          </div>

          {/* Navigation items */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Projects link */}
                <Link href="/projects">
                  <Button variant="ghost" className="flex items-center gap-2">
                    <FolderOpen className="w-4 h-4" />
                    Projects
                  </Button>
                </Link>

                {/* Dashboard link */}
                <Link href="/dashboard">
                  <Button variant="ghost">Dashboard</Button>
                </Link>

                {/* User menu */}
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">
                      {user?.name || user?.email}
                    </span>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={logout}
                    className="flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link href="/auth/signin">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link href="/auth/signup">
                  <Button>Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

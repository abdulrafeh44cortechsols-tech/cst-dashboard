"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getAuthUser, clearAuthUser, type AuthUser } from '@/lib/auth';
import { authService } from '@/services/auth';
import { Skeleton } from '@/components/ui/skeleton';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  logout: () => void;
  login: (user: AuthUser) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

// Loading screen component
const LoadingScreen = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 p-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
          <h2 className="text-2xl font-semibold tracking-tight mb-2">Loading Dashboard</h2>
          <p className="text-muted-foreground mb-8">Verifying your authentication...</p>
          
          {/* Skeleton loading elements */}
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4 mx-auto" />
            <Skeleton className="h-4 w-1/2 mx-auto" />
          </div>
        </div>
      </div>
    </div>
  );
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true); // Enable loading for production
  const router = useRouter();
  const pathname = usePathname();

  // Public routes that don't require authentication
  const publicRoutes = ['/login'];
  const isPublicRoute = publicRoutes.includes(pathname);

  const validateToken = async (token: string): Promise<boolean> => {
    try {
      return await authService.validateToken();
    } catch (error) {
      console.error('Token validation failed:', error);
      return false;
    }
  };

  const logout = () => {
    clearAuthUser();
    setUser(null);
    router.push('/login');
  };

  const login = (authUser: AuthUser) => {
    setUser(authUser);
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // If on public route, skip auth check
        if (isPublicRoute) {
          setLoading(false);
          return;
        }

        const storedUser = getAuthUser();
        
        if (!storedUser) {
          // No stored auth, redirect to login
          router.replace('/login');
          setLoading(false);
          return;
        }

        // Validate the stored token using a protected endpoint
        const isValidToken = await validateToken(storedUser.token);
        
        if (isValidToken) {
          setUser(storedUser);
        } else {
          // Token is invalid, clear auth and redirect
          clearAuthUser();
          router.replace('/login');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        clearAuthUser();
        router.replace('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [pathname, router, isPublicRoute]);

  // Show loading screen while checking authentication (except on public routes)
  if (loading && !isPublicRoute) {
    return <LoadingScreen />;
  }

  const contextValue: AuthContextType = {
    user,
    loading,
    logout,
    login,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}; 
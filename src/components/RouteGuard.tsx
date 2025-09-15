"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

interface RouteGuardProps {
  children: React.ReactNode;
  allowedRoles: ('admin' | 'editor')[];
  redirectTo?: string;
  showMessage?: boolean;
}

export function RouteGuard({ 
  children, 
  allowedRoles, 
  redirectTo = "/dashboard", 
  showMessage = true 
}: RouteGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // Wait for auth to load

    if (!user) {
      // User not authenticated, redirect to login
      if (showMessage) {
        toast.error("Please log in to access this page");
      }
      router.replace("/login");
      return;
    }

    if (!allowedRoles.includes(user.userType)) {
      // User doesn't have required role
      if (showMessage) {
        toast.error(`Access denied. This page is restricted to ${allowedRoles.join(' and ')} only.`);
      }
      router.replace(redirectTo);
      return;
    }
  }, [user, loading, allowedRoles, redirectTo, showMessage, router]);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Don't render if user is not authenticated or doesn't have access
  if (!user || !allowedRoles.includes(user.userType)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Helper components for common use cases
export function AdminOnlyRoute({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard allowedRoles={['admin']}>
      {children}
    </RouteGuard>
  );
}

export function EditorOnlyRoute({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard allowedRoles={['editor']}>
      {children}
    </RouteGuard>
  );
}

export function AuthenticatedRoute({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard allowedRoles={['admin', 'editor']}>
      {children}
    </RouteGuard>
  );
}

// Higher-order component for page-level protection
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  allowedRoles: ('admin' | 'editor')[] = ['admin', 'editor']
) {
  return function AuthenticatedComponent(props: P) {
    return (
      <RouteGuard allowedRoles={allowedRoles}>
        <Component {...props} />
      </RouteGuard>
    );
  };
}

// Hook for conditional rendering based on user role
export function useRoleBasedAccess() {
  const { user, loading } = useAuth();
  
  return {
    isAdmin: user?.userType === 'admin',
    isEditor: user?.userType === 'editor',
    isAuthenticated: !!user,
    loading,
    hasRole: (roles: ('admin' | 'editor')[]) => {
      return user ? roles.includes(user.userType) : false;
    }
  };
} 
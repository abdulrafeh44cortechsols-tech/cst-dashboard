import { useState, useEffect } from 'react';
import { 
  getAuthUser, 
  setAuthUser, 
  clearAuthUser, 
  isAuthenticated, 
  isAdmin, 
  isEditor,
  type AuthUser 
} from '@/lib/auth';
import { useRouter } from 'next/navigation';

export const useAuth = () => {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  

  useEffect(() => {
    // Check for existing auth on mount
    const existingUser = getAuthUser();
    setUser(existingUser);
    setLoading(false);
  }, []);

  const login = (authUser: AuthUser) => {
    setAuthUser(authUser);
    setUser(authUser);
  };

  const logout = () => {
    clearAuthUser();
    setUser(null);
    router.push("/login");
  };

  const checkAuth = () => {
    const authUser = getAuthUser();
    setUser(authUser);
    return authUser;
  };

  return {
    user,
    loading,
    isAuthenticated: isAuthenticated(),
    isAdmin: isAdmin(),
    isEditor: isEditor(),
    login,
    logout,
    checkAuth,
  };
}; 
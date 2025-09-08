// Auth utility functions for managing authentication state

export interface AuthUser {
    token: string;
    userType: 'admin' | 'editor';
    email?: string;
  }
  
  export const getAuthUser = (): AuthUser | null => {
    if (typeof window === 'undefined') return null;
    
    const token = localStorage.getItem('accessToken');
    const userType = localStorage.getItem('userType') as 'admin' | 'editor';
    
    if (!token || !userType) return null;
    
    return {
      token,
      userType,
    };
  };
  
  export const setAuthUser = (user: AuthUser): void => {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem('accessToken', user.token);
    localStorage.setItem('userType', user.userType);
    if (user.email) {
      localStorage.setItem('userEmail', user.email);
    }
  };
  
  export const clearAuthUser = (): void => {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userType');
    localStorage.removeItem('userEmail');
  };
  
  export const isAuthenticated = (): boolean => {
    return getAuthUser() !== null;
  };
  
  export const isAdmin = (): boolean => {
    const user = getAuthUser();
    return user?.userType === 'admin';
  };
  
  export const isEditor = (): boolean => {
    const user = getAuthUser();
    return user?.userType === 'editor';
  };
  
  export const getAuthToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken');
  };
  
  export const getUserType = (): 'admin' | 'editor' | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('userType') as 'admin' | 'editor';
  }; 
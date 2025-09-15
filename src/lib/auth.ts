// Auth utility functions for managing authentication state

export interface AuthUser {
  token: string;
  userType: 'admin' | 'editor';
  email?: string;
  userId?: number;
  username?: string;
  isAdmin?: boolean;
}

export const getAuthUser = (): AuthUser | null => {
  if (typeof window === 'undefined') return null;
  
  const token = localStorage.getItem('accessToken');
  const userType = localStorage.getItem('userType') as 'admin' | 'editor';
  const email = localStorage.getItem('userEmail');
  const userId = localStorage.getItem('userId');
  const username = localStorage.getItem('username');
  const isAdmin = localStorage.getItem('isAdmin');
  
  if (!token || !userType) return null;
  
  return {
    token,
    userType,
    email: email || undefined,
    userId: userId ? parseInt(userId) : undefined,
    username: username || undefined,
    isAdmin: isAdmin === 'true',
  };
};

export const setAuthUser = (user: AuthUser): void => {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('accessToken', user.token);
  localStorage.setItem('userType', user.userType);
  if (user.email) {
    localStorage.setItem('userEmail', user.email);
  }
  if (user.userId) {
    localStorage.setItem('userId', user.userId.toString());
  }
  if (user.username) {
    localStorage.setItem('username', user.username);
  }
  if (user.isAdmin !== undefined) {
    localStorage.setItem('isAdmin', user.isAdmin.toString());
  }
};

export const clearAuthUser = (): void => {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('accessToken');
  localStorage.removeItem('userType');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userId');
  localStorage.removeItem('username');
  localStorage.removeItem('isAdmin');
};

export const isAuthenticated = (): boolean => {
  return getAuthUser() !== null;
};

export const isAdmin = (): boolean => {
  const user = getAuthUser();
  return user?.userType === 'admin' || user?.isAdmin === true;
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

export const getUserInfo = (): {
  email?: string;
  userId?: number;
  username?: string;
  isAdmin?: boolean;
} | null => {
  if (typeof window === 'undefined') return null;
  
  const user = getAuthUser();
  if (!user) return null;
  
  return {
    email: user.email,
    userId: user.userId,
    username: user.username,
    isAdmin: user.isAdmin,
  };
}; 
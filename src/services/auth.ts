import api from '@/lib/api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  locked?: boolean;
  lockout_duration?: number;
  remaining_attempts?: number;
  email?: string;
  expires_in_minutes?: number;
}

export interface OTPVerifyRequest {
  email: string;
  otp: string;
}

export interface OTPVerifyResponse {
  success: boolean;
  message: string;
  token?: string;
  expires_in?: number;
  user?: {
    id: number;
    email: string;
    username?: string;
    is_admin: boolean;
  };
}

export const authService = {
  // Admin login - sends OTP on successful credentials
  adminLogin: async (credentials: LoginRequest): Promise<LoginResponse> => {
    try {
      const response = await api.post<LoginResponse>('/api/v1/auth/login/', credentials);
      return response.data;
    } catch (error: any) {
      // Throw the error response data so the UI can handle it properly
      throw error.response?.data || error;
    }
  },

  // Editor login - now also sends OTP on successful credentials
  editorLogin: async (credentials: LoginRequest): Promise<LoginResponse> => {
    try {
      const response = await api.post<LoginResponse>('/api/v1/editors/login/', credentials);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // Verify OTP for admin login
  verifyOTP: async (otpData: OTPVerifyRequest): Promise<OTPVerifyResponse> => {
    try {
      const response = await api.post<OTPVerifyResponse>('/api/v1/auth/verify-otp/', otpData);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // Verify OTP for editor login
  verifyEditorOTP: async (otpData: OTPVerifyRequest): Promise<OTPVerifyResponse> => {
    try {
      const response = await api.post<OTPVerifyResponse>('/api/v1/editors/verify-otp/', otpData);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // Check if token is valid
  validateToken: async (): Promise<boolean> => {
    try {
      const response = await api.get('/api/v1/sols-blogs/');
      return response.status === 200;
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        return false;
      }
      // For other errors (network, etc.), assume token is still valid
      return true;
    }
  },
}; 
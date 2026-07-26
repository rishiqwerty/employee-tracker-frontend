import { api } from './api';

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface UserMe {
  id: string;
  email: string;
  role: string;
  company_id: string | null;
  is_active: boolean;
}

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const response = await api.post<LoginResponse>('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },

  getCurrentUser: async (): Promise<UserMe> => {
    const response = await api.get<UserMe>('/users/me');
    return response.data;
  },
};

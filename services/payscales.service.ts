import { api } from './api';

export interface Payscale {
  id: string;
  site_id: string;
  role: string;
  daily_wage: number;
  overtime_rate: number;
  effective_from: string; // YYYY-MM-DD
  effective_to: string | null;
  created_at: string;
  updated_at: string;
}

export interface PayscaleCreate {
  site_id: string;
  role: string;
  daily_wage: number;
  overtime_rate: number;
  effective_from: string;
}

export type PayscaleUpdate = Partial<Omit<PayscaleCreate, 'site_id'>>;

export const payscalesService = {
  getActivePayscales: async (siteId: string, role?: string): Promise<Payscale[]> => {
    const response = await api.get<Payscale[]>(`/payscales/${siteId}/active`, {
      params: role ? { role } : undefined,
    });
    return response.data;
  },

  createPayscale: async (data: PayscaleCreate): Promise<Payscale> => {
    const response = await api.post<Payscale>(`/payscales/`, data);
    return response.data;
  },

  updatePayscale: async (payscaleId: string, data: PayscaleUpdate): Promise<Payscale> => {
    const response = await api.patch<Payscale>(`/payscales/${payscaleId}`, data);
    return response.data;
  },
};
